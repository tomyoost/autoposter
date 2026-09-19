import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_EVENTS = [
  'extension_installed',
  'extension_opened',
  'photos_uploaded',
  'ai_analysis_started',
  'ai_analysis_completed',
  'ai_analysis_failed',
  'listing_generated',
  'listing_copied',
  'platform_selected',
  'template_used',
  'upgrade_clicked',
  'upgrade_completed',
  'limit_reached',
  'settings_opened',
  'feedback_clicked',
  'onboarding_completed',
  'onboarding_skipped',
  'error_occurred',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024) {
      return new Response(JSON.stringify({ error: 'Too large' }), {
        status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { event, license_key, tier, platform, metadata } = await req.json();

    if (!event || !VALID_EVENTS.includes(event)) {
      return new Response(JSON.stringify({ error: 'Invalid event' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Hash license key for privacy (we don't store raw keys)
    let keyHash: string | null = null;
    if (license_key) {
      const encoder = new TextEncoder();
      const data = encoder.encode(license_key);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase.from('analytics_events').insert({
      event_name: event,
      license_key_hash: keyHash,
      tier: tier || null,
      platform: platform || null,
      metadata: metadata || {},
    });

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Track event error:', err);
    return new Response(JSON.stringify({ error: 'Failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
