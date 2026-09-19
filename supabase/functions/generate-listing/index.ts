import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-license-key',
};

interface ListingData {
  title: string;
  price: string;
  category: string;
  condition: string;
  tags: string;
  template: string;
  additionalInfo: string;
  platform?: string;
  quantity?: number;
}

// OPTIMIZED Dutch platform prompts - SHORT & CLEAN
const platformPromptsNL: Record<string, string> = {
  vinted: `Je bent een marketplace copywriter. Genereer KORTE Vinted beschrijvingen.

STRUCTUUR:
1. Eén zin over het product (max 8 woorden)
2. Specs (2-3 bullets met -)
3. CTA: "Interesse? Stuur een berichtje!"
4. Hashtags (4-5 stuks)

ABSOLUTE REGELS:
- MAX 100 tekens (exclusief hashtags)
- GEEN markdown (**, __, *)
- GEEN em dash
- GEEN fancy woorden zoals: Ontgrendel, Ervaar, Uniek, Ultimate, Perfect, Geweldig, Ongelooflijk
- Schrijf NORMAAL, niet als een marketing robot
- VERZIN GEEN INFO
- **QUANTITY**: Als quantity > 1, gebruik MEERVOUD. Voorbeeld: 1 box = "box", 3 boxen = "boxen", 2 controllers = "controllers"

VOORBEELD:
Last of Us editie PS5 controller, geseald.

- Nieuw
- Sony origineel

Interesse? Stuur een berichtje!

#ps5 #controller #lastofus`,

  marktplaats: `Je bent een marketplace copywriter. Genereer KORTE Marktplaats beschrijvingen.

STRUCTUUR:
1. Hook (max 8 woorden)
2. Beschrijving (2 zinnen max)
3. Specs (2-4 regels)
4. CTA

STRIKTE REGELS:
- MAX 200 tekens
- GEEN emojis
- GEEN markdown
- GEEN em dash - gewoon streepje
- GEEN prijs
- VERZIN GEEN INFO

VOORBEELD:
Vintage Levi's 501 in top staat

Originele denim, geen scheuren of vlekken. Perfect voor vintage liefhebbers.

Merk: Levi's 501
Maat: W32 L34
Staat: Zeer goed

Interesse? Stuur een bericht!`,

  facebook: `Je bent een marketplace copywriter. Genereer KORTE Facebook beschrijvingen.

STRUCTUUR:
1. Hook (max 8 woorden)
2. Beschrijving (1-2 zinnen)
3. CTA

STRIKTE REGELS:
- MAX 120 tekens
- Max 1 emoji aan begin
- GEEN hashtags
- GEEN prijs
- VERZIN GEEN INFO

VOORBEELD:
Vintage Levi's 501 - top staat!

Originele denim, geen beschadigingen. W32 L34.

DM voor info!`,

  etsy: `You are a marketplace copywriter. Generate SHORT Etsy listings in ENGLISH.

STRUCTURE:
1. Hook (max 10 words)
2. Description (2 sentences)
3. Specs (3-4 bullets with -)
4. CTA

STRICT RULES:
- MAX 300 characters
- ENGLISH ONLY
- NO markdown (no **, no __, no *)
- NO em dash - use regular hyphen
- NO price
- DO NOT INVENT INFO

EXAMPLE:
Rare Vintage Levi's 501 - Collector's Dream!

Authentic American denim, no damage. Perfect for vintage collectors.

- Brand: Levi's 501
- Size: W32 L34
- Condition: Very Good

Questions? Message me!`,

  ebay: `You are a marketplace copywriter. Generate SHORT eBay listings in ENGLISH.

STRUCTURE:
1. Hook (max 10 words)
2. Description (2 sentences)
3. Specs (3-4 bullets with -)
4. Shipping note

STRICT RULES:
- MAX 300 characters
- ENGLISH ONLY
- NO emojis
- NO markdown
- NO em dash - use regular hyphen
- NO price
- DO NOT INVENT INFO

EXAMPLE:
Vintage Levi's 501 Jeans - Excellent Condition

Authentic vintage denim, classic fit. No holes or stains.

- Brand: Levi's 501
- Size: W32 L34
- Condition: Very Good

Fast shipping 1-2 days.`
};

// OPTIMIZED English platform prompts - SHORT & CLEAN
const platformPromptsEN: Record<string, string> = {
  vinted: `You are a marketplace copywriter. Generate SHORT Vinted listings.

STRUCTURE:
1. One sentence about the product (max 8 words)
2. Specs (2-3 bullets with -)
3. CTA: "Interested? Message me!"
4. Hashtags (4-5)

ABSOLUTE RULES:
- MAX 100 characters (excluding hashtags)
- NO markdown (**, __, *)
- NO em dash
- NO fancy words like: Unleash, Experience, Immersive, Ultimate, Amazing, Incredible, Perfect
- Write like a normal person, not a marketing robot
- DO NOT INVENT INFO
- **QUANTITY**: If quantity > 1, use PLURAL. Example: 1 box = "box", 3 boxes = "boxes", 2 controllers = "controllers"

EXAMPLE:
Last of Us edition PS5 controller, sealed.

- New
- Sony official

Interested? Message me!

#ps5 #controller #lastofus`,

  marktplaats: `Je bent een marketplace copywriter. Genereer KORTE Marktplaats beschrijvingen.

STRUCTUUR:
1. Hook (max 8 woorden)
2. Beschrijving (2 zinnen max)
3. Specs (2-4 regels)
4. CTA

STRIKTE REGELS:
- MAX 200 tekens
- GEEN emojis
- GEEN markdown
- GEEN em dash - gewoon streepje
- GEEN prijs
- VERZIN GEEN INFO

VOORBEELD:
Vintage Levi's 501 in top staat

Originele denim, geen scheuren. Perfect voor vintage liefhebbers.

Merk: Levi's 501
Maat: W32 L34
Staat: Zeer goed

Interesse? Stuur een bericht!`,

  facebook: `You are a marketplace copywriter. Generate SHORT Facebook listings.

STRUCTURE:
1. Hook (max 8 words)
2. Description (1-2 sentences)
3. CTA

STRICT RULES:
- MAX 120 characters
- Max 1 emoji at start
- NO hashtags
- NO price
- DO NOT INVENT INFO

EXAMPLE:
Vintage Levi's 501 - great condition!

Original denim, no damage. W32 L34.

DM for info!`,

  etsy: `You are a marketplace copywriter. Generate SHORT Etsy listings.

STRUCTURE:
1. Hook (max 10 words)
2. Description (2 sentences)
3. Specs (3-4 bullets with -)
4. CTA

STRICT RULES:
- MAX 300 characters
- ENGLISH ONLY
- NO markdown
- NO em dash - use regular hyphen
- NO price
- DO NOT INVENT INFO

EXAMPLE:
Rare Vintage Levi's 501 - Collector's Dream!

Authentic denim, no damage. Perfect for collectors.

- Brand: Levi's 501
- Size: W32 L34
- Condition: Very Good

Questions? Message me!`,

  ebay: `You are a marketplace copywriter. Generate SHORT eBay listings.

STRUCTURE:
1. Hook (max 10 words)
2. Description (2 sentences)
3. Specs (3-4 bullets with -)
4. Shipping note

STRICT RULES:
- MAX 300 characters
- ENGLISH ONLY
- NO emojis
- NO markdown
- NO em dash - use regular hyphen
- NO price
- DO NOT INVENT INFO

EXAMPLE:
Vintage Levi's 501 - Excellent Condition

Authentic vintage denim, classic fit. No damage.

- Brand: Levi's 501
- Size: W32 L34
- Condition: Very Good

Fast shipping 1-2 days.`
};

// General description prompts - SHORT
const highConvertingDescriptionNL = `Je bent een marketplace copywriter. Genereer KORTE productbeschrijvingen.

STRUCTUUR:
1. Hook (max 10 woorden)
2. Beschrijving (2-3 zinnen)
3. Specs (2-4 bullets met -)
4. CTA: "Interesse? Stuur een berichtje!"

STRIKTE REGELS:
- MAX 150 tekens
- GEEN markdown (geen **, geen __)
- GEEN em dash - gebruik gewoon streepje (-)
- GEEN prijs
- VERZIN GEEN INFO - alleen wat gegeven is`;

const highConvertingDescriptionEN = `You are a marketplace copywriter. Generate SHORT product descriptions.

STRUCTURE:
1. Hook (max 10 words)
2. Description (2-3 sentences)
3. Specs (2-4 bullets with -)
4. CTA: "Interested? Message me!"

STRICT RULES:
- MAX 150 characters
- NO markdown (no **, no __)
- NO em dash - use regular hyphen (-)
- NO price
- DO NOT INVENT INFO - only use what's provided`;

// Title optimization prompt - STRICT
const titlePromptNL = `Genereer een KORTE titel.

STRIKTE REGELS:
- MAX 40 tekens
- VERBODEN WOORDEN: DualSense, Wireless, for, the, a, an, New, Used, de, het, een, Limited Edition
- NOOIT conditie woorden in titel (nieuw, gebruikt, etc)
- Format: [Merk] [Product] [Editie/Kleur]

VOORBEELD:
Input: Sony PlayStation DualSense Wireless Controller The Last of Us Limited Edition PS5 - Nieuw
Output: PS5 Controller Last of Us

ALLEEN de titel, niks anders.`;

const titlePromptEN = `Generate a SHORT title.

STRICT RULES:
- MAX 40 characters
- FORBIDDEN WORDS: DualSense, Wireless, for, the, a, an, New, Used, Limited Edition
- NEVER include condition words (new, used, etc)
- Format: [Brand] [Product] [Edition/Color]

EXAMPLE:
Input: Sony PlayStation DualSense Wireless Controller The Last of Us Limited Edition PS5 - New
Output: PS5 Controller Last of Us

ONLY the title, nothing else.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === REQUEST SIZE CHECK ===
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Request too large', error_code: 'PAYLOAD_TOO_LARGE' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, listing, platform, language = 'nl' } = await req.json();

    // === INPUT VALIDATION ===
    const VALID_ACTIONS = ['generate_description', 'format_for_platform', 'optimize_title'];
    if (!action || !VALID_ACTIONS.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action', error_code: 'INVALID_ACTION' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const VALID_PLATFORMS = ['vinted', 'marktplaats', 'facebook', 'etsy', 'ebay'];
    if (action === 'format_for_platform' && (!platform || !VALID_PLATFORMS.includes(platform))) {
      return new Response(
        JSON.stringify({ error: 'Invalid platform', error_code: 'INVALID_PLATFORM' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const VALID_LANGUAGES = ['nl', 'en'];
    const validatedLanguage = VALID_LANGUAGES.includes(language) ? language : 'nl';

    // Validate listing field sizes
    if (!listing || typeof listing !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Listing data required', error_code: 'MISSING_LISTING' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIELD_LIMITS: Record<string, number> = {
      title: 200, price: 20, category: 200, condition: 50,
      tags: 500, template: 2000, additionalInfo: 5000, platform: 20
    };

    for (const [field, maxLen] of Object.entries(FIELD_LIMITS)) {
      if (listing[field] && typeof listing[field] === 'string' && listing[field].length > maxLen) {
        return new Response(
          JSON.stringify({ error: `${field} too long (max ${maxLen} chars)`, error_code: 'FIELD_TOO_LONG' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    // === END INPUT VALIDATION ===

    // === LICENSE KEY AUTHENTICATION ===
    const licenseKey = req.headers.get('x-license-key');
    if (!licenseKey) {
      return new Response(
        JSON.stringify({ error: 'License key required', error_code: 'NO_LICENSE' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: license } = await supabase
      .from('licenses')
      .select('id, tier, is_active')
      .eq('license_key', licenseKey.trim().toUpperCase())
      .single();

    if (!license || !license.is_active) {
      return new Response(
        JSON.stringify({ error: 'Invalid license', error_code: 'INVALID_LICENSE' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // === END LICENSE KEY AUTHENTICATION ===

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    const listingData = listing as ListingData;
    const isEnglish = validatedLanguage === 'en';
    
    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'generate_description') {
      systemPrompt = isEnglish ? highConvertingDescriptionEN : highConvertingDescriptionNL;

      const conditionText = isEnglish ? getConditionEN(listingData.condition) : listingData.condition;
      
      // Build a cleaner prompt with only available data
      const dataPoints: string[] = [];
      if (listingData.title) dataPoints.push(`Product: ${listingData.title}`);
      if (listingData.category) dataPoints.push(`Categorie: ${listingData.category}`);
      if (conditionText) dataPoints.push(`Conditie: ${conditionText}`);
      if (listingData.quantity && listingData.quantity > 1) dataPoints.push(`Quantity: ${listingData.quantity} (use PLURAL forms!)`);
      if (listingData.tags) dataPoints.push(`Tags: ${listingData.tags}`);
      if (listingData.additionalInfo) dataPoints.push(`Extra info: ${listingData.additionalInfo}`);
      if (listingData.template) dataPoints.push(`Notities: ${listingData.template}`);
      
      userPrompt = isEnglish
        ? `Generate SHORT description (max 150 chars, NO markdown, NO em dash):

${dataPoints.join('\n')}

OUTPUT ONLY THE DESCRIPTION:`
        : `Genereer KORTE beschrijving (max 150 tekens, GEEN markdown, GEEN em dash):

${dataPoints.join('\n')}

OUTPUT ALLEEN DE BESCHRIJVING:`;

    } else if (action === 'format_for_platform' && platform) {
      const prompts = isEnglish ? platformPromptsEN : platformPromptsNL;
      systemPrompt = prompts[platform] || prompts.vinted;

      const conditionText = (platform === 'etsy' || platform === 'ebay' || isEnglish) 
        ? getConditionEN(listingData.condition) 
        : listingData.condition;

      // Build clean data points
      const dataPoints: string[] = [];
      if (listingData.title) dataPoints.push(`Product: ${listingData.title}`);
      if (listingData.category) dataPoints.push(`Category: ${listingData.category}`);
      if (conditionText) dataPoints.push(`Condition: ${conditionText}`);
      if (listingData.quantity && listingData.quantity > 1) dataPoints.push(`Quantity: ${listingData.quantity} (use PLURAL forms! e.g. "boxes" not "box", "controllers" not "controller")`);
      if (listingData.tags) dataPoints.push(`Tags: ${listingData.tags}`);
      if (listingData.additionalInfo) dataPoints.push(`Extra info: ${listingData.additionalInfo}`);
      if (listingData.template) dataPoints.push(`Description notes: ${listingData.template}`);

      userPrompt = isEnglish
        ? `Generate SHORT ${platform.toUpperCase()} listing (NO markdown, NO em dash, use simple punctuation):

${dataPoints.join('\n')}

OUTPUT ONLY THE FORMATTED LISTING:`
        : `Genereer KORTE ${platform.toUpperCase()} listing (GEEN markdown, GEEN em dash, gebruik simpele leestekens):

${dataPoints.join('\n')}

OUTPUT ALLEEN DE GEFORMATTEERDE LISTING:`;
    } else if (action === 'optimize_title') {
      systemPrompt = isEnglish ? titlePromptEN : titlePromptNL;
      
      userPrompt = isEnglish
        ? `Optimize this title (MAX 50 chars, only essential words):
Original: ${listingData.title}
Category: ${listingData.category || 'unknown'}

OUTPUT ONLY THE OPTIMIZED TITLE:`
        : `Optimaliseer deze titel (MAX 50 tekens, alleen essentiële woorden):
Origineel: ${listingData.title}
Categorie: ${listingData.category || 'onbekend'}

OUTPUT ALLEEN DE GEOPTIMALISEERDE TITEL:`;
    } else {
      throw new Error("Invalid action or missing platform");
    }

    console.log(`Processing ${action} request${platform ? ` for ${platform}` : ''} in ${language}`);

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        const errorMsg = isEnglish ? "Too many requests. Please try again later." : "Te veel verzoeken. Probeer het later opnieuw.";
        return new Response(JSON.stringify({ error: errorMsg }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        const errorMsg = isEnglish ? "AI credits depleted. Contact support." : "AI credits op. Neem contact op met support.";
        return new Response(JSON.stringify({ error: errorMsg }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI request failed");
    }

    const data = await response.json();
    let generatedText = data.choices?.[0]?.message?.content || '';
    
    // Post-process to clean up any remaining markdown or em dashes
    generatedText = generatedText
      .replace(/\*\*/g, '')  // Remove **
      .replace(/__/g, '')    // Remove __
      .replace(/—/g, '-')    // Replace em dash with hyphen
      .replace(/–/g, '-')    // Replace en dash with hyphen
      .replace(/"/g, '"')    // Replace fancy quotes
      .replace(/"/g, '"')
      .replace(/'/g, "'")
      .replace(/'/g, "'")
      .trim();

    console.log(`Successfully generated text (${generatedText.length} chars)`);

    return new Response(JSON.stringify({ 
      success: true,
      description: generatedText,
      platform: platform || 'general'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-listing function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Something went wrong" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper to translate Dutch condition to English
function getConditionEN(condition: string): string {
  const map: Record<string, string> = {
    'nieuw': 'New with tags',
    'nieuw_zonder': 'New without tags',
    'zeer_goed': 'Very good',
    'goed': 'Good',
    'redelijk': 'Fair'
  };
  return map[condition] || condition;
}
