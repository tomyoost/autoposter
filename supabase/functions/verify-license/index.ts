import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tier limits - 3 tiers: Free (3), Starter (50), Pro (unlimited)
const TIER_LIMITS = {
  free: 3,
  starter: 50,
  pro: -1 // unlimited
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { licenseKey, action } = await req.json();
    
    if (!licenseKey) {
      return new Response(
        JSON.stringify({ valid: false, error: 'License key required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize key
    const normalizedKey = licenseKey.trim().toUpperCase();

    // Look up license
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', normalizedKey)
      .single();

    if (licenseError || !license) {
      console.log('License not found:', normalizedKey);
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid license key' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if license is active
    if (!license.is_active) {
      return new Response(
        JSON.stringify({ valid: false, error: 'License is deactivated' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: 'License has expired' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7); // '2026-01'
    
    let { data: usage, error: usageError } = await supabase
      .from('license_usage')
      .select('*')
      .eq('license_id', license.id)
      .eq('month_year', currentMonth)
      .single();

    // Create usage record if doesn't exist
    if (!usage) {
      const { data: newUsage, error: createError } = await supabase
        .from('license_usage')
        .insert({
          license_id: license.id,
          month_year: currentMonth,
          listings_count: 0
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating usage record:', createError);
      }
      usage = newUsage || { listings_count: 0 };
    }

    const tierLimit = TIER_LIMITS[license.tier as keyof typeof TIER_LIMITS];
    const usageCount = usage?.listings_count || 0;
    const usageLeft = tierLimit === -1 ? -1 : Math.max(0, tierLimit - usageCount);
    const canUseAI = tierLimit === -1 || usageCount < tierLimit;

    // If action is 'increment', use atomic function to prevent race conditions
    if (action === 'increment' && canUseAI) {
      const { data: result, error: rpcError } = await supabase
        .rpc('increment_license_usage', {
          p_license_id: license.id,
          p_month_year: currentMonth,
          p_tier_limit: tierLimit
        })
        .single();

      if (rpcError) {
        console.error('Error in atomic increment:', rpcError);
        return new Response(
          JSON.stringify({ valid: false, error: 'Failed to update usage' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!result.success) {
        return new Response(
          JSON.stringify({
            valid: true,
            tier: license.tier,
            usageCount: result.new_count,
            usageLimit: tierLimit,
            usageLeft: 0,
            canUseAI: false,
            expiresAt: license.expires_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          tier: license.tier,
          usageCount: result.new_count,
          usageLimit: tierLimit,
          usageLeft: result.usage_left,
          canUseAI: result.can_continue,
          expiresAt: license.expires_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return license info
    return new Response(
      JSON.stringify({
        valid: true,
        tier: license.tier,
        usageCount,
        usageLimit: tierLimit,
        usageLeft,
        canUseAI,
        expiresAt: license.expires_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-license:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
