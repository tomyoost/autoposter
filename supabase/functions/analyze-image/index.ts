import { json, preflight, readJson } from "../_shared/http.ts";
import { callGemini } from "../_shared/gemini.ts";
import {
  currentMonth,
  enforcedLimit,
  licenseErrorStatus,
  releaseUsage,
  reserveUsage,
  resolveLicense,
  usageView,
} from "../_shared/license.ts";

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
          enum: ["Women", "Men", "Kids", "Home", "Electronics", "Entertainment", "Hobbies & Collectables", "Sports"],
          description: "Main Vinted category (top level only). For clothing and shoes choose Women, Men or Kids based on cut, size and style."
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

function buildSystemPrompt(language: string): string {
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
  return systemPrompt;
}

const VALID_LANGUAGES = ["nl", "en"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB per foto (base64)
const IMAGE_RE = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i;
const MAX_IMAGES = 10;
const MAX_IMAGES_FOR_AI = 3;
const MAX_AI_ATTEMPTS = 2;

const CONDITION_MAP: Record<string, string> = {
  new: "nieuw",
  very_good: "zeer_goed",
  good: "goed",
  fair: "redelijk",
};

function aiError(language: string, code: string, status: number): Response {
  const en = language === "en";
  const messages: Record<string, [string, string]> = {
    AI_RATE_LIMIT: ["Te veel verzoeken, probeer het zo opnieuw", "Too many requests, please try again shortly"],
    AI_NO_CREDITS: ["AI-tegoed op, neem contact op", "AI credits depleted, please contact us"],
    NO_API_KEY: ["AI-dienst niet ingesteld", "AI service not configured"],
    AI_NO_CONTENT: ["Geen analyseresultaat ontvangen", "No analysis result received"],
    AI_ERROR: ["AI-analyse mislukt", "AI analysis failed"],
  };
  const [nl, english] = messages[code] ?? messages.AI_ERROR;
  return json({ error: en ? english : nl, error_code: code === "NO_API_KEY" ? "AI_ERROR" : code }, status);
}

/** Haalt het analyseresultaat uit het AI-antwoord (eerst de tool-aanroep, anders tekst met JSON). */
function extractAnalysis(aiResponse: any): AnalysisResult | null {
  const message = aiResponse?.choices?.[0]?.message;
  const args = message?.tool_calls?.[0]?.function?.arguments;
  if (args) {
    try {
      return typeof args === "string" ? JSON.parse(args) : args;
    } catch {
      // val terug op de tekst
    }
  }
  return typeof message?.content === "string" ? extractJsonFromText(message.content) : null;
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const requestId = crypto.randomUUID().slice(0, 8);
  let reserved: { licenseId: string; month: string } | null = null;

  try {
    const parsed = await readJson(req, 15 * 1024 * 1024);
    if (!parsed.ok) return parsed.response;
    const { image, images, language: rawLanguage } = parsed.body;
    const language = VALID_LANGUAGES.includes(rawLanguage) ? rawLanguage : "en";
    const en = language === "en";

    // Foto's controleren
    const imageList: unknown[] = Array.isArray(images) ? images : image ? [image] : [];
    if (imageList.length === 0) {
      return json({ error: en ? "No image received" : "Geen afbeelding ontvangen", error_code: "NO_IMAGE" }, 400);
    }
    if (imageList.length > MAX_IMAGES) {
      return json({ error: en ? "Too many images (max 10)" : "Te veel foto's (max 10)", error_code: "TOO_MANY_IMAGES" }, 400);
    }
    for (let i = 0; i < imageList.length; i++) {
      const img = imageList[i];
      if (typeof img !== "string") {
        return json({ error: `Invalid image at index ${i + 1}`, error_code: "INVALID_IMAGE" }, 400);
      }
      if (img.length > MAX_IMAGE_SIZE) {
        return json({ error: `Image ${i + 1} too large (max 10MB)`, error_code: "IMAGE_TOO_LARGE" }, 400);
      }
      if (!IMAGE_RE.test(img)) {
        return json({ error: `Invalid image format at index ${i + 1} (must be jpeg/png/webp/gif)`, error_code: "INVALID_FORMAT" }, 400);
      }
    }

    // Licentie
    const result = await resolveLicense(req.headers.get("x-license-key"));
    if (!result.ok) {
      return json({ error: result.message, error_code: result.code }, licenseErrorStatus(result.code));
    }
    const { license } = result;

    // Eén analyse reserveren (atomisch, op de server)
    const month = currentMonth();
    const reservation = await reserveUsage(license.id, month, "analysis", enforcedLimit("analysis", license.tier));
    if (!reservation) return json({ error: "Server error", error_code: "SERVER_ERROR" }, 500);
    if (!reservation.success) {
      return json(
        {
          error: en ? "Usage limit reached" : "Gebruikslimiet bereikt",
          error_code: "QUOTA_EXCEEDED",
          usage: usageView(license.tier, reservation.count),
        },
        429,
      );
    }
    reserved = { licenseId: license.id, month };

    // AI-aanroep
    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: "text",
        text: imageList.length > 1
          ? "Analyze these product photos. READ ALL VISIBLE TEXT on labels, tags, and packaging. Combine info from all photos."
          : "Analyze this product photo. READ ALL VISIBLE TEXT on labels, tags, and packaging carefully.",
      },
      ...(imageList.slice(0, MAX_IMAGES_FOR_AI) as string[]).map((url) => ({ type: "image_url", image_url: { url } })),
    ];

    let analysis: AnalysisResult | null = null;
    let lastCode = "AI_NO_CONTENT";
    let lastStatus = 500;
    // Hooguit 40 seconden AI in totaal, zodat de extensie (60 s) altijd een antwoord krijgt.
    const deadline = Date.now() + 40_000;
    for (let attempt = 0; attempt < MAX_AI_ATTEMPTS && !analysis; attempt++) {
      if (attempt > 0 && deadline - Date.now() < 12_000) break;
      if (attempt > 0) await new Promise((r) => setTimeout(r, 800));
      const ai = await callGemini("analyze", {
        messages: [
          { role: "system", content: buildSystemPrompt(language) },
          { role: "user", content: userContent },
        ],
        tools: [analysisToolSchema],
        tool_choice: { type: "function", function: { name: "analyze_product" } },
        max_tokens: 4096,
      }, { deadline });
      if (!ai.ok) {
        lastCode = ai.code;
        lastStatus = ai.status === 429 || ai.status === 402 ? ai.status : 500;
        if (ai.code !== "AI_ERROR") break; // geen zin om opnieuw te proberen
        continue;
      }
      analysis = extractAnalysis(ai.data);
      if (!analysis) {
        lastCode = "AI_NO_CONTENT";
        console.warn(`[${requestId}] geen bruikbaar resultaat van ${ai.model} (poging ${attempt + 1})`);
      } else {
        console.log(`[${requestId}] analyse gelukt met ${ai.model}`);
      }
    }

    if (!analysis) {
      await releaseUsage(reserved.licenseId, reserved.month, "analysis");
      reserved = null;
      return aiError(language, lastCode, lastStatus);
    }

    // Is de gebruiker intussen weg (popup gesloten), dan telt deze analyse niet.
    if (req.signal.aborted) {
      await releaseUsage(reserved.licenseId, reserved.month, "analysis");
      reserved = null;
      return json({ error: "Client went away", error_code: "CLIENT_GONE" }, 499);
    }

    if (analysis.condition && CONDITION_MAP[analysis.condition]) {
      analysis.condition = CONDITION_MAP[analysis.condition];
    }
    analysis = repairCategoryPath(analysis);

    return json({ analysis, usage: usageView(license.tier, reservation.count) });
  } catch (error) {
    console.error(`[${requestId}] analyze-image fout:`, error instanceof Error ? error.message : error);
    if (reserved) await releaseUsage(reserved.licenseId, reserved.month, "analysis");
    return json({ error: "Unknown error", error_code: "UNKNOWN_ERROR" }, 500);
  }
});


// Repair common category path issues
const MAIN_CATEGORIES = ["Women", "Men", "Kids", "Home", "Electronics", "Entertainment", "Hobbies & Collectables", "Sports"];

/** Hoofdcategorie altijd uit de vaste lijst, en nooit dubbel in het subpad. */
function normalizeMainCategory(result: AnalysisResult): AnalysisResult {
  if (!result.subcategory) return result;
  const parts = result.subcategory.split(">").map((s) => s.trim()).filter(Boolean);
  const isMain = (s: string) => MAIN_CATEGORIES.some((m) => m.toLowerCase() === s.toLowerCase());
  let category = (result.category || "").trim();
  // Subpad begint met een hoofdcategorie: die is leidend en gaat uit het subpad
  if (parts.length > 1 && isMain(parts[0])) {
    category = MAIN_CATEGORIES.find((m) => m.toLowerCase() === parts[0].toLowerCase())!;
    parts.shift();
  }
  return { ...result, category, subcategory: parts.join(" > ") };
}

function repairCategoryPath(input: AnalysisResult): AnalysisResult {
  const result = normalizeMainCategory(input);
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
