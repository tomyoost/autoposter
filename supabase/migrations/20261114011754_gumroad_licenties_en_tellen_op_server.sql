-- Autoposter 1.1.0 (CTO, 2026-11-14)
-- Licenties via Gumroad's eigen sleutels, tellen op de server, instellingen voor het AI-model,
-- functies afgeschermd en automatisch opruimen van oude gegevens.

-- 1. Licenties: bron en Gumroad-gegevens (geen e-mailadres meer opslaan)
alter table public.licenses
  add column if not exists source text not null default 'manual',
  add column if not exists gumroad_product_id text,
  add column if not exists gumroad_sale_id text,
  add column if not exists verified_at timestamptz,
  add column if not exists status_reason text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'licenses_source_check') then
    alter table public.licenses add constraint licenses_source_check check (source in ('manual', 'gumroad'));
  end if;
end $$;

-- 2. Welke Gumroad-producten welke tier geven
create table if not exists public.gumroad_products (
  product_id text primary key,
  name text not null,
  default_tier public.license_tier not null,
  -- lijst van {"match": "<woord in de tiernaam>", "tier": "<tier>"}, eerste treffer wint
  variant_tiers jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.gumroad_products enable row level security;
drop policy if exists "Service role only" on public.gumroad_products;
create policy "Service role only" on public.gumroad_products for all to service_role using (true) with check (true);

insert into public.gumroad_products (product_id, name, default_tier, variant_tiers) values
  ('ARpdWGZ75brzLa5oW5AGYQ==', 'Autoposter for Vinted (abonnement Starter/Pro)', 'starter',
   '[{"match": "pro", "tier": "pro"}, {"match": "starter", "tier": "starter"}]'::jsonb)
on conflict (product_id) do nothing;

-- 3. Instellingen die zonder nieuwe versie te wijzigen zijn
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
drop policy if exists "Service role only" on public.app_settings;
create policy "Service role only" on public.app_settings for all to service_role using (true) with check (true);

insert into public.app_settings (key, value) values
  ('ai_model_analyze', '"gemini-3.5-flash-lite"'::jsonb),
  ('ai_model_text', '"gemini-3.5-flash-lite"'::jsonb),
  ('ai_model_fallback', '"gemini-3.1-flash-lite"'::jsonb),
  ('ai_reasoning_effort', '"medium"'::jsonb)
on conflict (key) do nothing;

-- 4. Tekstgeneraties apart tellen
alter table public.license_usage
  add column if not exists generations_count integer not null default 0;

-- 5. Atomisch reserveren en teruggeven van gebruik
create or replace function public.reserve_usage(
  p_license_id uuid,
  p_month_year text,
  p_kind text,
  p_limit integer
) returns table (success boolean, new_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_kind not in ('analysis', 'generation') then
    raise exception 'unknown usage kind: %', p_kind;
  end if;

  insert into public.license_usage (license_id, month_year)
  values (p_license_id, p_month_year)
  on conflict (license_id, month_year) do nothing;

  if p_kind = 'analysis' then
    update public.license_usage
       set listings_count = listings_count + 1, last_used_at = now()
     where license_id = p_license_id and month_year = p_month_year
       and (p_limit = -1 or listings_count < p_limit)
    returning listings_count into v_count;
    if not found then
      select listings_count into v_count from public.license_usage
       where license_id = p_license_id and month_year = p_month_year;
      return query select false, v_count;
      return;
    end if;
  else
    update public.license_usage
       set generations_count = generations_count + 1, last_used_at = now()
     where license_id = p_license_id and month_year = p_month_year
       and (p_limit = -1 or generations_count < p_limit)
    returning generations_count into v_count;
    if not found then
      select generations_count into v_count from public.license_usage
       where license_id = p_license_id and month_year = p_month_year;
      return query select false, v_count;
      return;
    end if;
  end if;

  return query select true, v_count;
end;
$$;

create or replace function public.release_usage(
  p_license_id uuid,
  p_month_year text,
  p_kind text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind = 'analysis' then
    update public.license_usage set listings_count = greatest(listings_count - 1, 0)
     where license_id = p_license_id and month_year = p_month_year;
  elsif p_kind = 'generation' then
    update public.license_usage set generations_count = greatest(generations_count - 1, 0)
     where license_id = p_license_id and month_year = p_month_year;
  else
    raise exception 'unknown usage kind: %', p_kind;
  end if;
end;
$$;

-- 6. Alleen de server mag deze functies aanroepen (Supabase-advies 0028/0029)
revoke all on function public.reserve_usage(uuid, text, text, integer) from public, anon, authenticated;
revoke all on function public.release_usage(uuid, text, text) from public, anon, authenticated;
revoke all on function public.increment_license_usage(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.reserve_usage(uuid, text, text, integer) to service_role;
grant execute on function public.release_usage(uuid, text, text) to service_role;
grant execute on function public.increment_license_usage(uuid, text, integer) to service_role;

do $$
begin
  revoke all on function public.rls_auto_enable() from public, anon, authenticated;
exception when others then
  raise notice 'rls_auto_enable niet aangepast: %', sqlerrm;
end $$;

-- 7. Dubbele indexen weg (de unieke sleutels hebben al een index)
drop index if exists public.idx_license_usage_license_month;
drop index if exists public.idx_licenses_license_key;

-- 8. Openbare testsleutels uit de eerste migratie nooit meer geldig
update public.licenses
   set is_active = false,
       status_reason = 'openbare testsleutel, uitgezet 2026-11-14'
 where license_key in ('FREE-DEMO-001', 'STARTER-TEST-001', 'PRO-TEST-001');

-- 9. Bewaartermijnen uit de privacyverklaring: gebruiksgebeurtenissen 12 maanden, tellers 24 maanden
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('autoposter-opruimen');
exception when others then null;
end $$;

select cron.schedule(
  'autoposter-opruimen',
  '17 3 * * *',
  $job$
    delete from public.analytics_events where created_at < now() - interval '12 months';
    delete from public.license_usage where month_year < to_char(now() - interval '24 months', 'YYYY-MM');
  $job$
);
