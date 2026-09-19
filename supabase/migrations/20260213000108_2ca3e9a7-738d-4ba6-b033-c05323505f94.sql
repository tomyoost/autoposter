-- Create atomic check-and-increment function with row-level locking
-- This prevents race conditions where concurrent requests bypass tier limits
CREATE OR REPLACE FUNCTION public.increment_license_usage(
  p_license_id UUID,
  p_month_year TEXT,
  p_tier_limit INTEGER
) RETURNS TABLE(
  success BOOLEAN,
  new_count INTEGER,
  usage_left INTEGER,
  can_continue BOOLEAN
) AS $$
DECLARE
  v_current_count INTEGER;
  v_new_count INTEGER;
BEGIN
  -- Lock the row for update (prevents concurrent modifications)
  SELECT listings_count INTO v_current_count
  FROM public.license_usage
  WHERE license_id = p_license_id AND month_year = p_month_year
  FOR UPDATE;
  
  -- If no usage record exists, create it
  IF NOT FOUND THEN
    INSERT INTO public.license_usage (license_id, month_year, listings_count)
    VALUES (p_license_id, p_month_year, 0)
    ON CONFLICT (license_id, month_year) DO NOTHING;
    v_current_count := 0;
    
    -- Re-lock the new row
    SELECT listings_count INTO v_current_count
    FROM public.license_usage
    WHERE license_id = p_license_id AND month_year = p_month_year
    FOR UPDATE;
  END IF;
  
  -- Check if under limit (-1 means unlimited)
  IF p_tier_limit <> -1 AND v_current_count >= p_tier_limit THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      v_current_count::INTEGER,
      0::INTEGER,
      false::BOOLEAN;
    RETURN;
  END IF;
  
  -- Increment atomically
  UPDATE public.license_usage
  SET 
    listings_count = listings_count + 1,
    last_used_at = now()
  WHERE license_id = p_license_id AND month_year = p_month_year
  RETURNING listings_count INTO v_new_count;
  
  -- Return result
  RETURN QUERY SELECT 
    true::BOOLEAN,
    v_new_count::INTEGER,
    CASE 
      WHEN p_tier_limit = -1 THEN -1
      ELSE GREATEST(0, p_tier_limit - v_new_count)
    END::INTEGER,
    (p_tier_limit = -1 OR v_new_count < p_tier_limit)::BOOLEAN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute to service role only
GRANT EXECUTE ON FUNCTION public.increment_license_usage TO service_role;

-- Add unique constraint on license_usage for ON CONFLICT to work
-- (only if it doesn't exist already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'license_usage_license_id_month_year_key'
  ) THEN
    ALTER TABLE public.license_usage ADD CONSTRAINT license_usage_license_id_month_year_key UNIQUE (license_id, month_year);
  END IF;
END $$;