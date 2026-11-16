-- Grenzen per abonnement in app_settings (omzetdag = één update), en herhaalde scans met dezelfde foto's.

-- Huidige grenzen (gelden tot 1.2.0 live staat; dan: free 5, starter 200, pro 1000 / teksten 25, 1000, 5000)
insert into public.app_settings (key, value)
values ('tier_limits', '{"analysis": {"free": 3, "starter": 50, "pro": -1}, "generation": {"free": 15, "starter": 250, "pro": -1}}'::jsonb)
on conflict (key) do nothing;

-- Opnieuw analyseren met precies dezelfde foto's binnen 10 minuten telt niet mee (maximaal 3 keer per set foto's)
create table if not exists public.analysis_repeats (
  license_id uuid not null references public.licenses(id) on delete cascade,
  photos_hash text not null,
  created_at timestamptz not null default now(),
  repeats integer not null default 0,
  primary key (license_id, photos_hash)
);
create index if not exists analysis_repeats_created_idx on public.analysis_repeats (created_at);
alter table public.analysis_repeats enable row level security;
revoke all on public.analysis_repeats from public, anon, authenticated;
