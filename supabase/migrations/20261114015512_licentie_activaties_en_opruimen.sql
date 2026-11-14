-- Autoposter 1.1.0, aanvulling na review (CTO, 2026-11-14)

-- Aantal activaties volgens Gumroad (verhoogd bij elke activering in de extensie), om gedeelde sleutels te zien.
alter table public.licenses add column if not exists gumroad_uses integer;

-- Opruimen: Gumroad-licenties die 24 maanden niet meer zijn gecontroleerd (gebruikstellers gaan mee via ON DELETE CASCADE).
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
    delete from public.licenses where source = 'gumroad' and coalesce(verified_at, created_at) < now() - interval '24 months';
  $job$
);
