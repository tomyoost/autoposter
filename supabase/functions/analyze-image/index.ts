import { json, preflight, readJson } from "../_shared/http.ts";
import { callGemini } from "../_shared/gemini.ts";
import {
  currentMonth,
  enforcedLimit,
  isFreeRepeat,
  licenseErrorStatus,
  photosHash,
  readAnalysesUsed,
  rememberScan,
  releaseUsage,
  reserveUsage,
  resolveLicense,
  usageView,
} from "../_shared/license.ts";
import {
  type CatalogTree,
  clientCatalog,
  COLOR_NAMES,
  COLORS,
  type ConditionKey,
  CONDITIONS,
  isLeaf,
  leafLines,
  lexicalBestLeaf,
  MATERIALS,
  pathOf,
  snapshotCatalog,
  topLevelOverview,
} from "../_shared/vinted.ts";

// ---------------------------------------------------------------------------------------------
// Stap 1: foto's bekijken (beeldmodel). Stap 2: exacte Vinted-categorie kiezen uit de echte lijst (tekstmodel).
// ---------------------------------------------------------------------------------------------

interface Stage1 {
  itemType?: string;
  targetGroup?: string;
  topLevelIds?: Array<string | number>;
  categoryGuess?: string;
  brand?: string;
  brandEvidence?: string;
  sizeLabel?: string;
  sizeCandidates?: string[];
  colorCodes?: string[];
  materials?: string[];
  condition?: string;
  conditionReason?: string;
  suggestedTitle?: string;
  suggestedTags?: string[];
  suggestedPrice?: number;
  quantity?: number;
  photoOrder?: Array<{ imageIndex: number; type: string; score: number }>;
}

const TARGET_GROUPS = ["women", "men", "unisex_adult", "girls", "boys", "baby", "kids_unisex", "not_fashion"];
const CONDITION_KEYS = Object.keys(CONDITIONS) as ConditionKey[];
const COLOR_CODES = Object.keys(COLORS);
const MATERIAL_NAMES = Object.keys(MATERIALS);

const stage1Tool = {
  type: "function",
  function: {
    name: "fill_vinted_listing",
    description: "Fill in the Vinted listing form for the item in the photos",
    parameters: {
      type: "object",
      properties: {
        itemType: { type: "string", description: "Precise English noun phrase for the item for sale, e.g. \"men's straight-leg jeans\", \"waxed cotton field jacket\", \"rain cover for a cargo bike box\"" },
        targetGroup: { type: "string", enum: TARGET_GROUPS, description: "Who the item is for. not_fashion for non-clothing items." },
        topLevelIds: { type: "array", items: { type: "string" }, description: "1 or 2 top-level category ids from the list in the instructions, most likely first" },
        categoryGuess: { type: "string", description: "Best guess of the full Vinted category path in English, e.g. \"Men > Clothing > Jeans > Straight fit jeans\"" },
        brand: { type: "string", description: "Brand you can actually see (logo, label, patch, embroidered mark). Empty string if not visible." },
        brandEvidence: { type: "string", description: "Where exactly you saw the brand. Empty string if no brand." },
        sizeLabel: { type: "string", description: "Size exactly as printed on a label or tag. Empty string if no size is readable." },
        sizeCandidates: { type: "array", items: { type: "string" }, description: "How a Vinted size picker shows this size, best first, e.g. [\"W32\",\"M\"] or [\"38\",\"M\"] or [\"42\"]. Empty if unknown." },
        colorCodes: { type: "array", items: { type: "string", enum: COLOR_CODES }, description: "1 or 2 main colours, main colour first" },
        materials: { type: "array", items: { type: "string", enum: MATERIAL_NAMES }, description: "0-3 materials read on a label or unmistakable" },
        condition: { type: "string", enum: CONDITION_KEYS, description: "Vinted condition" },
        conditionReason: { type: "string", description: "One short sentence: the visible flaw, or 'no visible flaws'" },
        suggestedTitle: { type: "string", description: "Listing title, max 60 characters, in the requested language" },
        suggestedTags: { type: "array", items: { type: "string" }, description: "5-8 search words in the requested language" },
        suggestedPrice: { type: "number", description: "Realistic second-hand price on Vinted in EUR" },
        quantity: { type: "number", description: "Number of identical items shown. 1 if one item." },
        photoOrder: {
          type: "array",
          items: {
            type: "object",
            properties: {
              imageIndex: { type: "number", description: "0-based index of the image" },
              type: { type: "string", enum: ["hero", "label", "detail", "packaging"] },
              score: { type: "number", description: "1-10, best listing cover photo highest" },
            },
            required: ["imageIndex", "type", "score"],
          },
          description: "Every input photo classified and scored, best first",
        },
      },
      required: [
        "itemType", "targetGroup", "topLevelIds", "categoryGuess", "brand", "brandEvidence", "sizeLabel",
        "sizeCandidates", "colorCodes", "condition", "conditionReason", "suggestedTitle", "suggestedTags",
        "quantity", "photoOrder",
      ],
    },
  },
};

function stage1Prompt(language: string, tree: CatalogTree): string {
  const lang = language === "nl" ? "Dutch" : "English";
  return `You are an experienced second-hand reseller who lists items on Vinted every day: vintage clothing, shoes, bags, home goods, bikes and more. From the seller's photos you fill in the Vinted listing form exactly as a careful, experienced seller would.

Work in this order:
1. Look at ALL photos together. Find the single item that is for sale. If it is attached to or shown on something bigger (a bike, a person, a mannequin, a hanger), the item for sale is the garment or accessory, not the bigger thing.
2. Read every piece of visible text: logos, woven or printed labels, leather patches, tabs, size tags, care labels, hang tags, packaging.
3. Fill in the fields.

BRAND
- Only give a brand you can actually SEE on the item: a logo, label, patch, tab, embroidered text, or an unmistakable logo mark (for example the Lacoste crocodile, the Polo Ralph Lauren polo player, the Tommy Hilfiger flag, the Levi's red tab or two-horse patch, the Carhartt square C label, the Nike swoosh, the Adidas trefoil or three-bar logo).
- An accessory made for a specific product (a rain cover, seat or bag for a bike, pram or car) usually carries that maker's logo or initials: use that brand, and confirm it with the brand name visible on the product if shown.
- Never guess a brand from style, shape or colour. If you cannot see it, brand = "".
- brandEvidence: exactly where you saw it, e.g. "red tab on back pocket reads LEVI'S" or "UA logo on the front of the cover, URBAN ARROW printed on the bike".

SIZE
- Read the size label character by character. sizeLabel = exactly what it says ("W32 L34", "M", "EU 38 / UK 10", "104 cm"). If no size is readable, sizeLabel = "" and sizeCandidates = []. Never guess a size from how the item looks.
- sizeCandidates: how a Vinted size picker shows it, best first. Jeans: waist as "W32" (plus a letter size only if printed). Letter sizes: "XS", "S", "M", "L", "XL", "XXL". Numeric women's sizes: the EU number ("38"). Shoes: EU size ("42"). Kids: height in cm ("104"). One-size items: "One size".

COLOURS
- colorCodes: 1 or 2 Vinted colours, main colour first. MULTI for prints or 3+ strong colours. Transparent plastic is CLEAR. Blue denim is BLUE (very dark indigo can be NAVY).

MATERIALS
- Only what a label says, or what is unmistakable (denim for jeans, leather for leather boots, wool for a wool knit, fleece). Up to 3. Leave empty when unsure.

CONDITION (Vinted's own definitions)
- new_with_tags: unused, with the original tags attached or in the original packaging.
- new_without_tags: unused, without tags or packaging.
- very_good: lightly used, may have slight imperfections, but still looks great. This is the normal condition of a clean second-hand item.
- good: used, with clearly visible imperfections or signs of wear (pilling, fading, small stains, scuffs, worn edges).
- satisfactory: frequently used, with clear damage such as holes, tears, heavy stains, heavy fading or broken parts.
Rules: judge only flaws you can actually see on the item itself. Rain or water drops, dust, dirt that wipes off, creases, background clutter and lighting are NOT wear. Normal vintage character (faded denim, soft patina) alone is very_good. When in doubt between two conditions, choose the better one. conditionReason names the visible flaw, or "no visible flaws".

CATEGORY
- topLevelIds: the 1 or 2 most likely top-level ids from the list below, most likely first.
- itemType, targetGroup and categoryGuess as precise as you can.

TITLE (write it in ${lang}, max 60 characters)
- Like experienced Vinted sellers: [Brand] [model or item type] [key detail such as colour, fit or print] [size].
- Use a model name only if you can read it. No marketing words, no emojis, no repeated words. Brand names stay as they are.
- Start with "Vintage" only when the item is clearly vintage (dated labels, made-in tags typical of the 70s to 90s, clear 80s or 90s design, age patina).

TAGS: 5 to 8 search words in ${lang} that buyers would type.
PRICE: a realistic second-hand price on Vinted in EUR for this brand, item and condition.
QUANTITY: number of identical items for sale (1 if one item).
PHOTO ORDER: classify and score every photo; the best cover photo (whole item, sharp, well lit) first.

Top-level categories (id: name (main subcategories)):
${topLevelOverview(tree)}`;
}

const stage2Tool = {
  type: "function",
  function: {
    name: "choose_category",
    description: "Choose the exact Vinted category",
    parameters: {
      type: "object",
      properties: { catalogId: { type: "string", description: "One id from the list" } },
      required: ["catalogId"],
    },
  },
};

const STAGE2_PROMPT = `You choose the exact Vinted category for an item that a seller is listing. Pick the single best category id from the list.
Rules:
- Pick the most specific category that an experienced Vinted seller would choose, so buyers find the item.
- Respect the target group for clothing and shoes (women, men, kids). For unisex adult clothing decide by cut and size; if still unclear, choose men for workwear, outdoor jackets and hoodies, women for clearly feminine cuts.
- Avoid "Other" categories when a specific one fits.
- Seller convention: rain covers, canopies and weather covers for cargo bikes or bike boxes go in the category for panniers and bike bags.
- Answer only with an id that is in the list.`;

// ---------------------------------------------------------------------------------------------

const VALID_LANGUAGES = ["nl", "en"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB per foto (base64)
const IMAGE_RE = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i;
const MAX_IMAGES = 10;
const MAX_IMAGES_FOR_AI = 6;
const MAX_AI_ATTEMPTS = 2;

function aiError(language: string, code: string, status: number): Response {
  const en = language === "en";
  const messages: Record<string, [string, string]> = {
    AI_RATE_LIMIT: ["Te veel verzoeken, probeer het zo opnieuw", "Too many requests, please try again shortly"],
    AI_NO_CREDITS: ["AI-tegoed op, neem contact op", "AI credits depleted, please contact us"],
    NO_API_KEY: ["AI-dienst niet ingesteld", "AI service not configured"],
    AI_NO_CONTENT: ["Geen analyseresultaat ontvangen", "No analysis result received"],
    AI_ERROR: ["AI-analyse mislukt", "AI analysis failed"],
    SERVICE_UNAVAILABLE: ["De AI-dienst is even niet bereikbaar. Probeer het later opnieuw.", "The AI service is temporarily unavailable. Please try again later."],
  };
  const [nl, english] = messages[code] ?? messages.AI_ERROR;
  return json({ error: en ? english : nl, error_code: code === "NO_API_KEY" ? "AI_ERROR" : code }, status);
}

/** Haalt de argumenten van de tool-aanroep uit het antwoord (of JSON uit de tekst). */
function toolArgs(aiResponse: any): any | null {
  const message = aiResponse?.choices?.[0]?.message;
  const args = message?.tool_calls?.[0]?.function?.arguments;
  if (args) {
    try {
      return typeof args === "string" ? JSON.parse(args) : args;
    } catch {
      // val terug op de tekst
    }
  }
  const text = typeof message?.content === "string" ? message.content : "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const strList = (v: unknown, maxItems: number, maxLen = 60) =>
  Array.isArray(v) ? v.map((x) => str(x, maxLen)).filter(Boolean).slice(0, maxItems) : [];

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const requestId = crypto.randomUUID().slice(0, 8);
  let reserved: { licenseId: string; month: string } | null = null;

  try {
    const parsed = await readJson(req, 16 * 1024 * 1024);
    if (!parsed.ok) return parsed.response;
    const { image, images, language: rawLanguage, catalog: rawCatalog } = parsed.body;
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

    // Dezelfde foto's binnen 10 minuten opnieuw: telt niet mee
    const month = currentMonth();
    const hash = await photosHash((imageList as string[]).slice(0, MAX_IMAGES_FOR_AI));
    const freeRepeat = await isFreeRepeat(license.id, hash).catch(() => false);

    // Eén analyse reserveren (atomisch, op de server)
    const reservation = freeRepeat
      ? { success: true, count: await readAnalysesUsed(license.id, month) }
      : await reserveUsage(license.id, month, "analysis", enforcedLimit("analysis", license.tier));
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
    if (!freeRepeat) reserved = { licenseId: license.id, month };

    const tree = clientCatalog(rawCatalog) ?? snapshotCatalog();
    const started = Date.now();
    // Hooguit 45 seconden AI in totaal, zodat de extensie (60 s) altijd een antwoord krijgt.
    const deadline = started + 45_000;

    // ---------- Stap 1: de foto's ----------
    const photos = (imageList.slice(0, MAX_IMAGES_FOR_AI) as string[]).map((url) => ({ type: "image_url", image_url: { url } }));
    const userContent = [
      {
        type: "text",
        text: photos.length > 1
          ? `These ${photos.length} photos all show the same item for sale. Read all visible text on labels, tags and logos, then fill in the listing.`
          : "This photo shows an item for sale. Read all visible text on labels, tags and logos, then fill in the listing.",
      },
      ...photos,
    ];

    let s1: Stage1 | null = null;
    let s1Model = "";
    let lastCode = "AI_NO_CONTENT";
    let lastStatus = 500;
    for (let attempt = 0; attempt < MAX_AI_ATTEMPTS && !s1; attempt++) {
      if (attempt > 0 && deadline - Date.now() < 15_000) break;
      if (attempt > 0) await new Promise((r) => setTimeout(r, 800));
      const ai = await callGemini("analyze", {
        messages: [
          { role: "system", content: stage1Prompt(language, tree) },
          { role: "user", content: userContent },
        ],
        tools: [stage1Tool],
        tool_choice: { type: "function", function: { name: "fill_vinted_listing" } },
        max_tokens: 4096,
      }, { deadline: deadline - 6_000 });
      if (!ai.ok) {
        lastCode = ai.code;
        lastStatus = ai.status === 429 || ai.status === 402 || ai.status === 503 ? ai.status : 500;
        if (ai.code !== "AI_ERROR") break; // geen zin om opnieuw te proberen
        continue;
      }
      s1 = toolArgs(ai.data);
      s1Model = ai.model;
      if (!s1) console.warn(`[${requestId}] stap 1: geen bruikbaar resultaat van ${ai.model} (poging ${attempt + 1})`);
    }

    if (!s1) {
      if (reserved) await releaseUsage(reserved.licenseId, reserved.month, "analysis");
      reserved = null;
      return aiError(language, lastCode, lastStatus);
    }
    const s1Ms = Date.now() - started;

    // ---------- Stap 2: de exacte categorie uit de echte Vinted-lijst ----------
    // Hoofdcategorieën uit stap 1: id's, of (soms) namen
    const rootByName = new Map(tree.roots.map((id) => [tree.byId.get(id)!.title.toLowerCase(), id]));
    const rootIds = [...new Set(strList(s1.topLevelIds, 2, 40)
      .map((x) => /^\d+$/.test(x) ? parseInt(x, 10) : rootByName.get(x.toLowerCase()) ?? NaN)
      .filter((id) => tree.roots.includes(id)))];
    // Onbekend: geen AI over de hele boom (te groot en traag), maar de noodkeuze over alle eindcategorieën
    const skipAiChoice = rootIds.length === 0;
    const { lines, ids: candidateIds } = leafLines(tree, skipAiChoice ? tree.roots : rootIds);
    const guess = [str(s1.categoryGuess), str(s1.itemType)].filter(Boolean).join(" | ");

    let catalogId: number | null = null;
    let s2Model = "";
    if (!skipAiChoice && candidateIds.size > 0 && deadline - Date.now() > 4_000) {
      const item = {
        itemType: str(s1.itemType),
        targetGroup: str(s1.targetGroup),
        categoryGuess: str(s1.categoryGuess),
        title: str(s1.suggestedTitle),
        brand: str(s1.brand),
        materials: strList(s1.materials, 3),
        tags: strList(s1.suggestedTags, 8),
      };
      const ai = await callGemini("category", {
        messages: [
          { role: "system", content: STAGE2_PROMPT },
          { role: "user", content: `Item:\n${JSON.stringify(item)}\n\nCategories (id: path):\n${lines}` },
        ],
        tools: [stage2Tool],
        tool_choice: { type: "function", function: { name: "choose_category" } },
        max_tokens: 1024,
      }, { deadline });
      if (ai.ok) {
        s2Model = ai.model;
        const picked = parseInt(String(toolArgs(ai.data)?.catalogId ?? ""), 10);
        if (candidateIds.has(picked)) catalogId = picked;
        else console.warn(`[${requestId}] stap 2: id ${picked} staat niet in de lijst`);
      } else {
        console.warn(`[${requestId}] stap 2 mislukt: ${ai.code}`);
      }
    }
    if (catalogId === null) catalogId = lexicalBestLeaf(tree, candidateIds, guess);
    const s2Ms = Date.now() - started - s1Ms;

    // Is de gebruiker intussen weg (popup gesloten), dan telt deze analyse niet.
    if (req.signal.aborted) {
      if (reserved) await releaseUsage(reserved.licenseId, reserved.month, "analysis");
      reserved = null;
      return json({ error: "Client went away", error_code: "CLIENT_GONE" }, 499);
    }

    // ---------- Antwoord opbouwen ----------
    const conditionKey: ConditionKey = CONDITION_KEYS.includes(s1.condition as ConditionKey)
      ? (s1.condition as ConditionKey)
      : "very_good";
    const colorIds = strList(s1.colorCodes, 2, 20).map((c) => COLORS[c]).filter((n): n is number => !!n);
    const materialIds = strList(s1.materials, 3, 30).map((m) => MATERIALS[m]).filter((n): n is number => !!n);
    const brand = str(s1.brand, 60);
    const sizeLabel = str(s1.sizeLabel, 60);
    const catalogPath = catalogId !== null && isLeaf(tree, catalogId) ? pathOf(tree, catalogId) : [];

    // Velden voor oudere versies van de extensie (1.1.0): hoofdcategorie in het Engels en de staat als code.
    const snap = snapshotCatalog();
    let rootId: number | undefined = catalogId ?? undefined;
    for (let i = 0; rootId !== undefined && i < 12; i++) {
      const parent = tree.byId.get(rootId)?.parent;
      if (!parent) break;
      rootId = parent;
    }
    if (!catalogPath.length) rootId = undefined;
    const legacyMain = rootId && snap.byId.get(rootId) ? snap.byId.get(rootId)!.title : catalogPath[0] ?? "";
    const legacySub = catalogPath.slice(1).join(" > ");

    const analysis = {
      // Oude velden (blijven werken voor 1.1.0)
      category: legacyMain,
      subcategory: legacySub,
      brand,
      size: sizeLabel,
      color: strList(s1.colorCodes, 2, 20).filter((c) => COLOR_NAMES[c]).map((c) => COLOR_NAMES[c][en ? 1 : 0]).join(" / "),
      material: strList(s1.materials, 3, 30).join(", "),
      condition: CONDITIONS[conditionKey].legacy,
      quantity: Number.isFinite(s1.quantity) && (s1.quantity as number) >= 1 ? Math.min(99, Math.round(s1.quantity as number)) : 1,
      suggestedTitle: str(s1.suggestedTitle, 80),
      suggestedTags: strList(s1.suggestedTags, 8, 40),
      suggestedPrice: Number.isFinite(s1.suggestedPrice) ? Math.max(1, Math.round((s1.suggestedPrice as number) * 100) / 100) : undefined,
      photoOrder: Array.isArray(s1.photoOrder) ? s1.photoOrder : [],
      // Nieuw: alles wat de extensie op Vinted zelf invult
      vinted: {
        catalogId,
        catalogPath,
        catalogSource: tree.source,
        statusId: CONDITIONS[conditionKey].id,
        condition: conditionKey,
        conditionReason: str(s1.conditionReason, 160),
        colorIds,
        materialIds,
        brand,
        brandEvidence: str(s1.brandEvidence, 160),
        sizeLabel,
        sizeCandidates: strList(s1.sizeCandidates, 4, 20),
        itemType: str(s1.itemType, 80),
        targetGroup: str(s1.targetGroup, 20),
      },
    };

    console.log(`[${requestId}] analyse klaar: stap 1 ${s1Model} ${s1Ms} ms, stap 2 ${s2Model || "lexicaal"} ${s2Ms} ms, boom ${tree.source}`);
    await rememberScan(license.id, hash, freeRepeat).catch((e) => console.warn(`[${requestId}] herhaling niet bewaard: ${e}`));
    if (freeRepeat) console.log(`[${requestId}] herhaalde scan, niet meegeteld`);
    return json({ analysis, usage: usageView(license.tier, reservation.count), repeat: freeRepeat || undefined });
  } catch (error) {
    console.error(`[${requestId}] analyze-image fout:`, error instanceof Error ? error.message : error);
    if (reserved) await releaseUsage(reserved.licenseId, reserved.month, "analysis");
    return json({ error: "Unknown error", error_code: "UNKNOWN_ERROR" }, 500);
  }
});
