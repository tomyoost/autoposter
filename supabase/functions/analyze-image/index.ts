import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-license-key',
};

interface AnalysisResult {
  category: string;
  subcategory: string;
  brand: string;
  size: string;
  color: string;
  material: string;
  condition: string;
  quantity: number;
  suggestedTitle: string;
  suggestedTags: string[];
  suggestedPrice?: number;
}

// Tool schema for structured output
const analysisToolSchema = {
  type: "function",
  function: {
    name: "analyze_product",
    description: "Analyze product image and return structured data based on visible text and labels",
    parameters: {
      type: "object",
      properties: {
        category: { 
          type: "string", 
          description: "Main category: Women, Men, Kids, Electronics, Hobbies & Collectables, Home, Entertainment, Sports" 
        },
        subcategory: { 
          type: "string", 
          description: "Full subcategory path using ' > ' separator. MUST include 'Clothing' for clothing or 'Shoes' for footwear. Example: 'Clothing > Dresses > Long dresses'" 
        },
        brand: { 
          type: "string", 
          description: "Brand name read from packaging, label, or hang tag. The largest text on packaging is usually the brand." 
        },
        size: { 
          type: "string", 
          description: "Size read from labels. Include ALL visible formats: AU6/US2/EU36, S/M/L/XL, etc." 
        },
        color: { type: "string", description: "Main colors visible" },
        material: { type: "string", description: "Material if visible on labels" },
        condition: { 
          type: "string", 
          enum: ["new", "very_good", "good", "fair"],
          description: "new = plastic packaging OR hang tags attached. very_good = no tags but looks unused. good = minor wear. fair = visible damage." 
        },
        suggestedTitle: { 
          type: "string", 
          description: "Title max 40 chars. Format: [Brand] [Exact Product Name from label] [Size]. NEVER invent names - read literal text from stickers/labels." 
        },
        suggestedTags: { 
          type: "array", 
          items: { type: "string" },
          description: "5-8 relevant search tags" 
        },
        suggestedPrice: { 
          type: "number", 
          description: "Realistic resale price in EUR" 
        },
        quantity: {
          type: "number",
          description: "Number of identical items visible in the photo. Count visible boxes, packages, or items. Default is 1 if only one item is shown."
        },
        photoOrder: {
          type: "array",
          items: {
            type: "object",
            properties: {
              imageIndex: { type: "number", description: "0-based index of the image in the input array" },
              type: { type: "string", enum: ["hero", "label", "detail", "packaging"], description: "hero = full product visible (best listing photo), label = tag/sticker/size label visible, detail = close-up of texture/pattern/damage, packaging = box/bag/wrapping" },
              score: { type: "number", description: "Quality score 1-10. Hero shots with good lighting/angle score highest. Label shots score 7-8. Detail shots 5-6." }
            },
            required: ["imageIndex", "type", "score"]
          },
          description: "Score and classify each input photo. Order by score descending (best photo first)."
        }
      },
      required: ["category", "subcategory", "condition", "suggestedTitle", "suggestedTags", "quantity", "photoOrder"]
    }
  }
};

// Fallback: Try to extract JSON from text response
function extractJsonFromText(text: string): AnalysisResult | null {
  if (!text) return null;
  
  try {
    // Remove markdown code blocks
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    
    // Try to find JSON object in text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(jsonStr.trim());
  } catch {
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[${requestId}] Analyze-image request started`);

  try {
    // === REQUEST SIZE CHECK ===
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 15 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Request too large', error_code: 'PAYLOAD_TOO_LARGE' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { image, images, language = 'en' } = await req.json();

    // === INPUT VALIDATION ===
    const VALID_LANGUAGES = ['nl', 'en'];
    const validatedLanguage = VALID_LANGUAGES.includes(language) ? language : 'en';

    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image
    const imageRegex = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i;

    // === LICENSE KEY AUTHENTICATION ===
    const licenseKey = req.headers.get('x-license-key');
    if (!licenseKey) {
      console.log(`[${requestId}] No license key provided`);
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
      .select('id, tier, is_active, expires_at')
      .eq('license_key', licenseKey.trim().toUpperCase())
      .single();

    if (!license || !license.is_active) {
      console.log(`[${requestId}] Invalid or inactive license: ${licenseKey.slice(0, 8)}...`);
      return new Response(
        JSON.stringify({ error: 'Invalid license', error_code: 'INVALID_LICENSE' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'License expired', error_code: 'LICENSE_EXPIRED' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check usage limits
    const TIER_LIMITS: Record<string, number> = { free: 3, starter: 50, pro: -1 };
    const tierLimit = TIER_LIMITS[license.tier] ?? 3;
    
    if (tierLimit !== -1) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: usageCheck } = await supabase
        .from('license_usage')
        .select('listings_count')
        .eq('license_id', license.id)
        .eq('month_year', currentMonth)
        .single();
      
      if (usageCheck && usageCheck.listings_count >= tierLimit) {
        return new Response(
          JSON.stringify({ error: validatedLanguage === 'en' ? 'Usage limit reached' : 'Gebruikslimiet bereikt', error_code: 'QUOTA_EXCEEDED' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    // === END LICENSE KEY AUTHENTICATION ===

    // Support single image or multiple images
    const imageList: string[] = images || (image ? [image] : []);
    
    if (imageList.length === 0) {
      console.log(`[${requestId}] No images in request`);
      return new Response(
        JSON.stringify({ error: validatedLanguage === 'en' ? 'No image received' : 'Geen afbeelding ontvangen', error_code: 'NO_IMAGE' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each image: size + format
    for (let i = 0; i < imageList.length; i++) {
      const img = imageList[i];
      if (typeof img !== 'string') {
        return new Response(
          JSON.stringify({ error: `Invalid image at index ${i}`, error_code: 'INVALID_IMAGE' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (img.length > MAX_IMAGE_SIZE) {
        console.log(`[${requestId}] Image ${i} too large: ${(img.length / 1024 / 1024).toFixed(1)}MB`);
        return new Response(
          JSON.stringify({ error: `Image ${i + 1} too large (max 10MB)`, error_code: 'IMAGE_TOO_LARGE' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!imageRegex.test(img)) {
        return new Response(
          JSON.stringify({ error: `Invalid image format at index ${i + 1} (must be jpeg/png/webp/gif)`, error_code: 'INVALID_FORMAT' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Cap at 10 images max
    if (imageList.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Too many images (max 10)', error_code: 'TOO_MANY_IMAGES' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error(`[${requestId}] GEMINI_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: language === 'en' ? 'AI service not configured' : 'AI service niet geconfigureerd', error_code: 'NO_API_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Analyzing ${imageList.length} image(s), language: ${language}`);

    // Language-specific instructions for title generation
    const titleLanguageInstruction = language === 'nl' 
      ? 'Generate ALL text output in DUTCH only. Use Dutch product terminology.'
      : 'Generate ALL text output in ENGLISH only. Translate Dutch terms: "bakfiets" → "cargo bike", "fiets" → "bicycle", "jurk" → "dress", "broek" → "trousers", "schoenen" → "shoes", etc.';

    // CRITICAL: Strict prompt that prioritizes reading literal text
    const systemPrompt = `You are a product listing analyst for Vinted (EU marketplace). Your PRIMARY job is to READ TEXT from product photos.

=== LANGUAGE RULE (CRITICAL) ===
${titleLanguageInstruction}
The user has selected ${language === 'nl' ? 'Dutch' : 'English'} as their language. ALL output fields (suggestedTitle, suggestedTags, category names) MUST be in this language.

=== CRITICAL READING RULES ===
1. **PRODUCT NAME**: The hang tag or barcode sticker has the EXACT product name printed on it - read it CHARACTER BY CHARACTER.
   - Do NOT guess or approximate - zoom into sticker text mentally and read each letter
   - The barcode sticker is the MOST RELIABLE source for the exact product name and size
   - Example: If sticker reads "Henrietta Midi Dress" → use EXACTLY that, not "Aullie" or any other name
   - NEVER invent descriptive names like "Blue Textured Ruffled Dress"
   - Only describe visually if NO text/labels are visible anywhere

2. **BRAND DETECTION**: 
   - The LARGEST text on packaging/labels is usually the brand
   - Check: hang tags, printed packaging, sewn-in labels
   - Common fashion brands: Peppermayo, Zara, H&M, ASOS, Shein, Nike, Adidas, etc.

3. **SIZE READING** - READ THE PHYSICAL LABEL CHARACTER BY CHARACTER:
   - CRITICAL: The barcode sticker or size label shows the EXACT size - read every character!
   - Do NOT guess size from item appearance - ONLY report what is READABLE on labels
   - If sticker shows "AU6" → that means AU6, NOT AU8 or AU10
   - If sticker shows "US2" → that means US2, NOT US4
   - Look for ALL size formats on the label: AU, US, UK, EU numbers
   - Common label formats: "Size AU6", "AU 6", "S", "M", "36", "UK8", "US4"
    - PRIORITY ORDER for suggestedTitle: EU > UK > US > AU (for Vinted European marketplace)
    - In suggestedTitle: ONLY use EU size (e.g., "EU34", "EU36", "EU38")
    - If no EU size visible, CONVERT using this EXACT table (DO NOT deviate):
      AU4=EU32, AU6=EU34, AU8=EU36, AU10=EU38, AU12=EU40, AU14=EU42, AU16=EU44
      US0=EU32, US2=EU34, US4=EU36, US6=EU38, US8=EU40, US10=EU42
      UK4=EU32, UK6=EU34, UK8=EU36, UK10=EU38, UK12=EU40, UK14=EU42
    - CRITICAL: AU8 = EU36 (NOT EU38!). AU10 = EU38. Double-check your conversion!
    - In size field: Include ALL visible sizes separated by " / " (e.g., "EU36 / US4 / AU8")

4. **CONDITION DETECTION** (be accurate!):
   - "new" = Item still in plastic packaging OR hang tags with string attached OR price sticker visible
   - "very_good" = No tags, but looks completely unused/pristine
   - "good" = Minor wear visible, light use
   - "fair" = Visible damage, stains, or significant wear

5. **CATEGORY PATHS** - ALWAYS include "Clothing" or "Shoes" level. ONLY use exact subtypes listed below:

    **JEANS** (Women/Men > Clothing > Jeans > ...):
    Valid: Boyfriend jeans, Cropped jeans, Flared jeans, High waisted jeans, Ripped jeans, Skinny jeans, Straight jeans, Other
    FORBIDDEN: "Low-rise jeans", "Mom jeans", "Wide leg jeans", "Bootcut jeans"
    MAPPING: Low-rise → Straight jeans, Mom jeans → High waisted jeans, Wide leg → Flared jeans, Bootcut → Flared jeans

    **DRESSES** (Women > Clothing > Dresses > ...):
    Valid: Long dresses (maxi/ankle), Midi dresses (knee-calf), Mini dresses (above knee), Other
    FORBIDDEN: "Maxi dresses", "Wrap dresses", "Shift dresses", "A-line dresses"
    MAPPING: Maxi → Long dresses, any other style → closest length match

    **TOPS & T-SHIRTS** (Women > Clothing > Tops & t-shirts > ...):
    Valid: Blouses, Crop tops, Long sleeve tops, Short sleeve tops, Sleeveless tops, Tank tops, Tunics, Other
    FORBIDDEN: "Camisoles", "Bodysuits", "Peplum tops"

    **JUMPERS & SWEATSHIRTS** (Women > Clothing > Jumpers & sweatshirts > ...):
    Valid: Cardigans, Crew neck jumpers, Hoodies, Roll neck jumpers, V-neck jumpers, Other

    **SKIRTS** (Women > Clothing > Skirts > ...):
    Valid: Long skirts, Midi skirts, Mini skirts, Other

    **TROUSERS & LEGGINGS** (Women > Clothing > Trousers & leggings > ...):
    Valid: Chinos, Joggers, Leggings, Straight leg trousers, Wide leg trousers, Other

    **COATS & JACKETS** (Women > Clothing > Coats & jackets > ...):
    Valid: Blazers, Bomber jackets, Denim jackets, Down jackets, Duffle coats, Leather jackets, Parkas, Trench coats, Other

    **SHOES** (Women/Men > Shoes > ...):
    Valid: Ankle boots, Ballet flats, Boots, Espadrilles, Heels, Loafers, Mules & clogs, Platforms, Sandals, Slippers, Sneakers, Other
    FORBIDDEN: "Trainers" (use Sneakers), "Pumps" (use Heels or Ballet flats)

    **MEN T-SHIRTS** (Men > Clothing > T-shirts > ...):
    Valid: Long sleeve t-shirts, Polo shirts, Print t-shirts, Short sleeve t-shirts, Sleeveless t-shirts, Other

    **ELECTRONICS**: Electronics > Video games & consoles > Games

    GENERAL RULE: If the exact subtype is NOT in the valid list above, choose the CLOSEST match based on fit/style for maximum search visibility. NEVER use "Other" if a reasonable match exists — "Other" gets less search traffic.

 6. **DRESS TYPES**:
    - "Maxi" = Long dresses (ankle length)
    - "Midi" = Midi dresses (knee to calf)
    - "Mini" = Mini dresses (above knee)

7. **ACCESSORY DETECTION** (IMPORTANT):
   - If photo shows an item ATTACHED TO a larger product (bike, car, stroller):
   - Focus on the ACCESSORY being sold, NOT the main product it's attached to
   - Examples:
     * Rain canopy on cargo bike → title about the CANOPY, category = cycling accessories
     * Child seat on bike → title about the SEAT, category = Kids' bike seats
     * Phone holder on bike → title about the HOLDER, category = cycling accessories
     * Bike bag/basket → title about the BAG/BASKET, category = cycling accessories
   - Look for: covers, canopies, seats, bags, racks, baskets, trailers, holders, lights
   - If the accessory has its own brand/label visible, use THAT brand, not the bike brand

8. **BIKE CATEGORY PATHS** - Always include specific bike type:
    - Sports > Cycling > Bikes > Cargo bikes (for bakfietsen, longtails)
    - Sports > Cycling > Bikes > City bikes (for stadsfietsen, omafietsen)
    - Sports > Cycling > Bikes > Mountain bikes (for MTB, ATB)
    - Sports > Cycling > Bikes > Road bikes (for racefietsen)
    - Sports > Cycling > Bikes > Folding bikes (for vouwfietsen)
    - Sports > Cycling > Bikes > Other bikes (if type unclear)
    - Sports > Cycling > Electric bikes (for e-bikes - SEPARATE category, not under Bikes!)
    - Sports > Cycling > Kids' bike seats (for kinderzitjes)
    - Sports > Cycling > Cycling accessories & tools > [specific sub-type] (ALWAYS pick a sub-type!):
      Valid: Bike baskets, Bike bells & horns, Bike fenders & mudguards, Bike lights, Bike locks, Bike water bottles, Bottle cages, Bike pumps, Kickstands, Panniers & bike bags, Bike tools, Bike stands & wall-mounts, Bike pannier racks, Car bike racks, Bike boxes & travel bags, Other bike accessories
      Examples: rain cover/canopy → Panniers & bike bags, light → Bike lights, lock → Bike locks, pump → Bike pumps, generic → Other bike accessories

9. **QUANTITY DETECTION** (CRITICAL for listings):
    - Count the number of IDENTICAL items visible in the photo
    - If you see 3 Pokémon ETBs stacked → quantity = 3
    - If you see 1 dress → quantity = 1
    - If you see 5 identical booster packs → quantity = 5
    - Only count IDENTICAL items, not different products
    - Default to 1 if unclear

10. **PHOTO SCORING** (CRITICAL - score EVERY input image):
    - For EACH image provided, return a photoOrder entry with imageIndex, type, and score
    - Types: "hero" (full product, best for listing thumbnail), "label" (tag/sticker/barcode), "detail" (close-up texture/pattern), "packaging" (box/bag)
    - Score 1-10: hero shots with good lighting = 9-10, label/tag photos = 7-8, detail shots = 5-6, blurry/dark = 1-3
    - The BEST hero shot should be the first photo in a listing (customers see it first)
    - Sort photoOrder by score descending

=== TITLE FORMAT (max 40 chars) ===
[Brand] [Exact Product Name] [EU Size]
Example: "Peppermayo Aullie Maxi Dress EU36"

FORBIDDEN in titles:
- Made-up descriptive names
- Marketing words (Beautiful, Stunning, Amazing)
- Redundant words (Dress Dress, New New)
- AU sizes (always convert to EU for title)`;

    // Build multi-image content array
    const userContent: Array<{type: string; text?: string; image_url?: {url: string}}> = [
      { 
        type: 'text', 
        text: imageList.length > 1 
          ? 'Analyze these product photos. READ ALL VISIBLE TEXT on labels, tags, and packaging. Combine info from all photos.'
          : 'Analyze this product photo. READ ALL VISIBLE TEXT on labels, tags, and packaging carefully.'
      }
    ];
    
    // Add images (max 3 for performance)
    const imagesToProcess = imageList.slice(0, 3);
    for (const img of imagesToProcess) {
      userContent.push({
        type: 'image_url',
        image_url: { url: img }
      });
    }

    // AI call with internal retry on transient errors (finish_reason: error)
    const MAX_AI_RETRIES = 3;
    let analysisResult: AnalysisResult | null = null;

    for (let attempt = 0; attempt < MAX_AI_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(`[${requestId}] Retrying AI call (attempt ${attempt + 1}/${MAX_AI_RETRIES})...`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ],
          tools: [analysisToolSchema],
          tool_choice: { type: "function", function: { name: "analyze_product" } },
          max_tokens: 1500,
        }),
      });

      console.log(`[${requestId}] AI response status: ${response.status} (attempt ${attempt + 1})`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${requestId}] AI Gateway error:`, response.status, errorText.slice(0, 200));
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: language === 'en' ? 'Too many requests, please try again later' : 'Te veel verzoeken, probeer het later opnieuw', error_code: 'AI_RATE_LIMIT' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: language === 'en' ? 'AI credits depleted, contact support' : 'AI credits op, neem contact op met support', error_code: 'AI_NO_CREDITS' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Retry on server errors
        if (attempt < MAX_AI_RETRIES - 1) continue;
        
        return new Response(
          JSON.stringify({ error: language === 'en' ? 'AI analysis failed' : 'AI analyse mislukt', error_code: 'AI_ERROR' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const aiResponse = await response.json();
      const finishReason = aiResponse.choices?.[0]?.finish_reason;
      console.log(`[${requestId}] AI finish_reason: ${finishReason} (attempt ${attempt + 1})`);

      // If finish_reason is error, retry
      if (finishReason === 'error') {
        console.warn(`[${requestId}] AI returned finish_reason: error, will retry`);
        if (attempt < MAX_AI_RETRIES - 1) continue;
      }

      // Try to get tool call result first
      const toolCalls = aiResponse.choices?.[0]?.message?.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        try {
          const args = toolCalls[0].function?.arguments;
          if (args) {
            analysisResult = JSON.parse(args);
            console.log(`[${requestId}] Tool calling succeeded`);
          }
        } catch (e) {
          console.warn(`[${requestId}] Tool call parse failed:`, e);
        }
      }

      // Fallback: try text content
      if (!analysisResult) {
        const content = aiResponse.choices?.[0]?.message?.content;
        if (content) {
          console.log(`[${requestId}] Trying fallback JSON extraction, content length: ${content.length}`);
          analysisResult = extractJsonFromText(content);
          if (analysisResult) {
            console.log(`[${requestId}] Fallback JSON extraction succeeded`);
          } else {
            console.warn(`[${requestId}] Fallback failed, content preview: ${content.slice(0, 300)}`);
          }
        } else {
          console.warn(`[${requestId}] No content in response`);
        }
      }

      // If we got a result, break out of retry loop
      if (analysisResult) break;

      // No result - retry if possible
      if (attempt < MAX_AI_RETRIES - 1) {
        console.log(`[${requestId}] No result, retrying...`);
        continue;
      }
    }

    // No result after all retries
    if (!analysisResult) {
      console.error(`[${requestId}] Could not extract analysis result after ${MAX_AI_RETRIES} attempts`);
      return new Response(
        JSON.stringify({ error: language === 'en' ? 'No analysis result received' : 'Geen analyse resultaat ontvangen', error_code: 'AI_NO_CONTENT' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map English condition values to internal format
    const conditionMap: Record<string, string> = {
      'new': 'nieuw',
      'very_good': 'zeer_goed',
      'good': 'goed',
      'fair': 'redelijk'
    };
    if (analysisResult.condition && conditionMap[analysisResult.condition]) {
      analysisResult.condition = conditionMap[analysisResult.condition];
    }

    // Validate and repair category path
    analysisResult = repairCategoryPath(analysisResult);

    console.log(`[${requestId}] Analysis complete:`, {
      category: analysisResult.category,
      subcategory: analysisResult.subcategory,
      title: analysisResult.suggestedTitle,
      brand: analysisResult.brand,
      size: analysisResult.size,
      condition: analysisResult.condition
    });

    return new Response(
      JSON.stringify({ analysis: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Error in analyze-image:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', error_code: 'UNKNOWN_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Repair common category path issues
function repairCategoryPath(result: AnalysisResult): AnalysisResult {
  if (!result.category || !result.subcategory) return result;
  
  const category = result.category;
  let subcategory = result.subcategory;
  
  // Fashion categories that need "Clothing" level
  const fashionCategories = ['Women', 'Men', 'Kids', 'Dames', 'Heren', 'Kinderen'];
  const clothingTypes = [
    'Dresses', 'Jurken', 'Tops', 'T-shirts', 'Jeans', 'Trousers', 'Broeken',
    'Skirts', 'Rokken', 'Shorts', 'Jumpers', 'Sweaters', 'Jackets', 'Jassen',
    'Coats', 'Outerwear', 'Suits', 'Blazers', 'Jumpsuits', 'Activewear',
    'Swimwear', 'Lingerie', 'Nightwear', 'Blouses', 'Shirts', 'Hoodies',
    'Mini dresses', 'Midi dresses', 'Long dresses', 'Maxi'
  ];
  
  const shoeTypes = [
    'Sneakers', 'Trainers', 'Boots', 'Heels', 'Flats', 'Sandals', 'Slippers',
    'Sports shoes', 'Formal shoes', 'Loafers', 'Pumps'
  ];
  
  if (fashionCategories.some(c => category.toLowerCase().includes(c.toLowerCase()))) {
    const subcatParts = subcategory.split(' > ').map(s => s.trim());
    const firstPart = subcatParts[0].toLowerCase();
    
    // Already has correct level
    if (firstPart === 'clothing' || firstPart === 'kleding' || firstPart === 'shoes' || firstPart === 'schoenen') {
      // Good - already has the level
    }
    // Check if first part is a clothing type (missing "Clothing" level)
    else if (clothingTypes.some(t => firstPart.includes(t.toLowerCase()))) {
      subcategory = 'Clothing > ' + subcategory;
      console.log(`Repaired path: added Clothing level -> ${subcategory}`);
    }
    // Check if first part is a shoe type (missing "Shoes" level)
    else if (shoeTypes.some(t => firstPart.includes(t.toLowerCase()))) {
      subcategory = 'Shoes > ' + subcategory;
      console.log(`Repaired path: added Shoes level -> ${subcategory}`);
    }
  }
  
  return { ...result, subcategory };
}
