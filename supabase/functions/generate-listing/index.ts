import { json, preflight, readJson } from "../_shared/http.ts";
import { callGemini } from "../_shared/gemini.ts";
import {
  currentMonth,
  enforcedLimit,
  licenseErrorStatus,
  releaseUsage,
  reserveUsage,
  resolveLicense,
} from "../_shared/license.ts";

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


function buildPrompts(action: string, listing: unknown, platform: string | undefined, validatedLanguage: string): { systemPrompt: string; userPrompt: string } {
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
  return { systemPrompt, userPrompt };
}

const VALID_ACTIONS = ["generate_description", "format_for_platform", "optimize_title"];
const VALID_PLATFORMS = ["vinted", "marktplaats", "facebook", "etsy", "ebay"];
const VALID_LANGUAGES = ["nl", "en"];
const FIELD_LIMITS: Record<string, number> = {
  title: 200, price: 20, category: 200, condition: 50,
  tags: 500, template: 2000, additionalInfo: 5000, platform: 20,
};

function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/[—–]/g, "-") // em/en dash -> streepje
    .replace(/[“”]/g, '"') // gekrulde dubbele aanhalingstekens
    .replace(/[‘’]/g, "'") // gekrulde enkele aanhalingstekens
    .trim();
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  let reserved: { licenseId: string; month: string } | null = null;

  try {
    const parsed = await readJson(req, 1024 * 1024);
    if (!parsed.ok) return parsed.response;
    const { action, listing, platform, language } = parsed.body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return json({ error: "Invalid action", error_code: "INVALID_ACTION" }, 400);
    }
    if (action === "format_for_platform" && (!platform || !VALID_PLATFORMS.includes(platform))) {
      return json({ error: "Invalid platform", error_code: "INVALID_PLATFORM" }, 400);
    }
    const validatedLanguage = VALID_LANGUAGES.includes(language) ? language : "nl";
    const isEnglish = validatedLanguage === "en";

    if (!listing || typeof listing !== "object") {
      return json({ error: "Listing data required", error_code: "MISSING_LISTING" }, 400);
    }
    for (const [field, maxLen] of Object.entries(FIELD_LIMITS)) {
      const value = (listing as Record<string, unknown>)[field];
      if (value === undefined || value === null) continue;
      if (typeof value !== "string" && typeof value !== "number") {
        return json({ error: `${field} must be text`, error_code: "INVALID_FIELD" }, 400);
      }
      if (String(value).length > maxLen) {
        return json({ error: `${field} too long (max ${maxLen} chars)`, error_code: "FIELD_TOO_LONG" }, 400);
      }
    }
    const quantity = (listing as Record<string, unknown>).quantity;
    if (quantity !== undefined && quantity !== null && (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 0 || quantity > 999)) {
      return json({ error: "quantity must be a number", error_code: "INVALID_FIELD" }, 400);
    }

    // Licentie
    const result = await resolveLicense(req.headers.get("x-license-key"));
    if (!result.ok) {
      return json({ error: result.message, error_code: result.code }, licenseErrorStatus(result.code));
    }
    const { license } = result;

    // Eén tekstgeneratie reserveren
    const month = currentMonth();
    const reservation = await reserveUsage(license.id, month, "generation", enforcedLimit("generation", license.tier));
    if (!reservation) return json({ error: "Server error", error_code: "SERVER_ERROR" }, 500);
    if (!reservation.success) {
      return json({
        error: isEnglish
          ? "You have used all AI texts for this month."
          : "Je hebt alle AI-teksten van deze maand gebruikt.",
        error_code: "GENERATION_LIMIT",
      }, 429);
    }
    reserved = { licenseId: license.id, month };

    const { systemPrompt, userPrompt } = buildPrompts(action, listing, platform, validatedLanguage);
    const ai = await callGemini("text", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
    }, { deadline: Date.now() + 25_000 });

    const generated = ai.ok ? cleanText(String(ai.data?.choices?.[0]?.message?.content ?? "")) : "";
    if (!ai.ok || !generated) {
      await releaseUsage(reserved.licenseId, reserved.month, "generation");
      reserved = null;
      if (ai.ok === false && ai.code === "AI_RATE_LIMIT") {
        return json({
          error: isEnglish ? "Too many requests. Please try again later." : "Te veel verzoeken. Probeer het later opnieuw.",
          error_code: "AI_RATE_LIMIT",
        }, 429);
      }
      return json({
        error: isEnglish ? "Could not generate text, please try again." : "Tekst maken mislukt, probeer het opnieuw.",
        error_code: "AI_ERROR",
      }, 500);
    }

    return json({ success: true, description: generated, platform: platform || "general" });
  } catch (error) {
    console.error("generate-listing fout:", error instanceof Error ? error.message : error);
    if (reserved) await releaseUsage(reserved.licenseId, reserved.month, "generation");
    return json({ error: "Something went wrong", error_code: "UNKNOWN_ERROR" }, 500);
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
