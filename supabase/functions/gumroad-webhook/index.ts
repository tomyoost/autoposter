import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gumroad Seller ID for verification
const GUMROAD_SELLER_ID = 'lHJf_Hc8xFTcI4mIstQ_dQ==';

// Product name to tier mapping (case-insensitive)
const PRODUCT_TIER_MAP: Record<string, 'starter' | 'pro'> = {
  'starter': 'starter',
  'autoposter starter': 'starter',
  'pro': 'pro',
  'autoposter pro': 'pro',
};

// Generate a unique license key in format: {TIER_PREFIX}-{RANDOM8}-{CHECKSUM2}
function generateLicenseKey(tier: 'starter' | 'pro'): string {
  const prefix = tier === 'starter' ? 'STR' : 'PRO';
  
  // Generate 8 random alphanumeric characters
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1
  let random = '';
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Generate 2-char checksum based on prefix + random
  const combined = prefix + random;
  let sum = 0;
  for (let i = 0; i < combined.length; i++) {
    sum += combined.charCodeAt(i) * (i + 1);
  }
  const checksum = (sum % 100).toString().padStart(2, '0');
  
  return `${prefix}-${random}-${checksum}`;
}

// Determine tier from product name
function getTierFromProduct(productName: string): 'starter' | 'pro' | null {
  const normalized = productName.toLowerCase().trim();
  
  for (const [key, tier] of Object.entries(PRODUCT_TIER_MAP)) {
    if (normalized.includes(key)) {
      return tier;
    }
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Gumroad sends data as form-urlencoded
    const formData = await req.formData();
    
    // Extract Gumroad ping data
    const sellerId = formData.get('seller_id')?.toString();
    const productName = formData.get('product_name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const saleId = formData.get('sale_id')?.toString() || '';
    const purchaseEmail = formData.get('purchaser_id')?.toString() || email;
    
    console.log('Gumroad webhook received:', { sellerId, productName, email: purchaseEmail, saleId });

    // Verify seller ID
    if (sellerId !== GUMROAD_SELLER_ID) {
      console.error('Invalid seller ID:', sellerId);
      return new Response(
        JSON.stringify({ error: 'Invalid seller' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine tier from product name
    const tier = getTierFromProduct(productName);
    if (!tier) {
      console.error('Unknown product:', productName);
      return new Response(
        JSON.stringify({ error: 'Unknown product' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique license key
    const licenseKey = generateLicenseKey(tier);
    console.log('Generated license key:', licenseKey, 'for tier:', tier);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store license in database
    const { data: license, error: insertError } = await supabase
      .from('licenses')
      .insert({
        license_key: licenseKey,
        tier: tier,
        email: purchaseEmail,
        is_active: true,
        metadata: {
          source: 'gumroad',
          sale_id: saleId,
          product_name: productName,
          created_via: 'webhook'
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting license:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create license' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('License created successfully:', license.id);

    // Return license key for Gumroad to include in receipt
    // Gumroad expects the response body to contain the license key
    return new Response(
      JSON.stringify({ 
        success: true,
        license_key: licenseKey
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
