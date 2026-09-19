-- License tier enum
CREATE TYPE public.license_tier AS ENUM ('free', 'starter', 'pro');

-- Licenses table
CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT UNIQUE NOT NULL,
  tier license_tier NOT NULL DEFAULT 'free',
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Usage tracking table (per license, per month)
CREATE TABLE public.license_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE NOT NULL,
  month_year TEXT NOT NULL, -- Format: '2026-01'
  listings_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(license_id, month_year)
);

-- Index for faster lookups
CREATE INDEX idx_licenses_license_key ON public.licenses(license_key);
CREATE INDEX idx_license_usage_license_month ON public.license_usage(license_id, month_year);

-- RLS policies (public access for verification via edge function)
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_usage ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role)
CREATE POLICY "Service role can manage licenses"
ON public.licenses FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage usage"
ON public.license_usage FOR ALL
USING (true)
WITH CHECK (true);

-- Insert some initial test licenses
INSERT INTO public.licenses (license_key, tier, email, is_active) VALUES
('FREE-DEMO-001', 'free', 'demo@example.com', true),
('STARTER-TEST-001', 'starter', 'starter@example.com', true),
('PRO-TEST-001', 'pro', 'pro@example.com', true);