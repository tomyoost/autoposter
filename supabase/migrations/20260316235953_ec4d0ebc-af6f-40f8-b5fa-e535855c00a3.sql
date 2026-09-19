
-- Fix RLS: restrict licenses table to service_role only
DROP POLICY IF EXISTS "Service role can manage licenses" ON public.licenses;
CREATE POLICY "Service role can manage licenses"
ON public.licenses FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix RLS: restrict license_usage table to service_role only
DROP POLICY IF EXISTS "Service role can manage usage" ON public.license_usage;
CREATE POLICY "Service role can manage usage"
ON public.license_usage FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
