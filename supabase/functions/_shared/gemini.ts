// Aanroep van Google Gemini via het OpenAI-compatibele adres, met instelbaar model en een reservemodel.
import { getSetting } from "./db.ts";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

export type GeminiPurpose = "analyze" | "text" | "category";

export type GeminiResult =
  | { ok: true; data: any; model: string }
  | { ok: false; status: number; code: "NO_API_KEY" | "AI_RATE_LIMIT" | "AI_NO_CREDITS" | "AI_ERROR" | "SERVICE_UNAVAILABLE"; detail: string };

/** Kiest het model uit app_settings: ai_model_analyze / ai_model_text, met ai_model_fallback als reserve. */
const MODEL_SETTING: Record<GeminiPurpose, string> = {
  analyze: "ai_model_analyze",
  text: "ai_model_text",
  category: "ai_model_category",
};

async function modelsFor(purpose: GeminiPurpose): Promise<string[]> {
  const primary = await getSetting<string>(MODEL_SETTING[purpose], "gemini-3.5-flash-lite");
  const fallback = await getSetting<string>("ai_model_fallback", "gemini-3.1-flash-lite");
  return [...new Set([primary, fallback].filter((m) => typeof m === "string" && m.length > 0))];
}

/**
 * Doet één logische AI-aanroep. Bestaat het model niet (meer), dan wordt het reservemodel gebruikt.
 * Wordt de denkinstelling niet ondersteund, dan wordt het zonder geprobeerd.
 */
export async function callGemini(
  purpose: GeminiPurpose,
  payload: Record<string, unknown>,
  opts: { deadline?: number; models?: string[]; effort?: string | null } = {},
): Promise<GeminiResult> {
  const deadline = opts.deadline ?? Date.now() + 40_000;
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return { ok: false, status: 500, code: "NO_API_KEY", detail: "GEMINI_API_KEY not configured" };

  // Denkstand per doel: foto-analyse "medium", categorie en beschrijving "low" (eenvoudig, sneller en goedkoper)
  const EFFORT_SETTING: Record<GeminiPurpose, [string, string]> = {
    analyze: ["ai_reasoning_effort", "medium"],
    category: ["ai_reasoning_effort_category", "low"],
    text: ["ai_reasoning_effort_text", "low"],
  };
  const effort = opts.effort !== undefined
    ? opts.effort
    : await getSetting<string | null>(EFFORT_SETTING[purpose][0], EFFORT_SETTING[purpose][1]);
  let lastError: GeminiResult = { ok: false, status: 500, code: "AI_ERROR", detail: "no model tried" };
  let sawRateLimit = false;

  const models = opts.models && opts.models.length > 0 ? opts.models : await modelsFor(purpose);
  for (const [index, model] of models.entries()) {
    const hasReserve = index < models.length - 1;
    let withEffort = typeof effort === "string" && effort.length > 0;
    for (let attempt = 0; attempt < 2; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < 3_000) {
        return { ok: false, status: 504, code: "AI_ERROR", detail: "time budget used up" };
      }
      const body: Record<string, unknown> = { ...payload, model };
      if (withEffort) body.reasoning_effort = effort;

      const started = Date.now();
      let res: Response;
      try {
        res = await fetch(GEMINI_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
          // Met een reservemodel achter de hand: niet langer dan 22 s wachten en 12 s overlaten voor de reserve
          signal: AbortSignal.timeout(
            Math.min(remaining - 500, hasReserve ? Math.max(8_000, Math.min(22_000, remaining - 12_000)) : 35_000),
          ),
        });
      } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        console.error(`Gemini ${model} geen antwoord na ${Date.now() - started} ms: ${detail.slice(0, 120)}`);
        lastError = { ok: false, status: 504, code: "AI_ERROR", detail };
        break; // probeer het reservemodel
      }

      if (res.ok) {
        const data = await res.json();
        // Tokengebruik per aanroep (voor de kosten per scan); geen inhoud
        const u = data?.usage ?? {};
        const reasoning = u?.completion_tokens_details?.reasoning_tokens ?? null;
        console.log(`Gemini ${model} ok in ${Date.now() - started} ms | ${purpose} | in ${u.prompt_tokens ?? "?"} uit ${u.completion_tokens ?? "?"} denk ${reasoning ?? "?"} totaal ${u.total_tokens ?? "?"}`);
        return { ok: true, data, model };
      }

      const text = (await res.text()).slice(0, 500);
      if (res.status === 429) {
        // Limiet van dit model bereikt (bijv. de gratis versie): het reservemodel heeft een eigen limiet
        console.warn(`Gemini ${model} limiet bereikt (429), probeer het reservemodel`);
        lastError = { ok: false, status: 429, code: "AI_RATE_LIMIT", detail: text };
        sawRateLimit = true;
        break;
      }
      if (res.status === 402) {
        console.error(`Gemini ${model} gaf 402 (tegoed of betaling): ${text.slice(0, 300)}`);
        return { ok: false, status: 402, code: "AI_NO_CREDITS", detail: text };
      }
      if (res.status === 401 || res.status === 403) {
        // Sleutel of facturering geblokkeerd (bijv. kaart geweigerd): geldt voor alle modellen met deze sleutel
        console.error(`Gemini GEBLOKKEERD ${res.status} (sleutel of facturering): ${text.slice(0, 160)}`);
        return { ok: false, status: 503, code: "SERVICE_UNAVAILABLE", detail: text };
      }
      if (res.status === 400 && withEffort && /reasoning|thinking/i.test(text)) {
        withEffort = false; // dit model kent de denkinstelling niet: opnieuw zonder
        continue;
      }
      console.error(`Gemini ${model} gaf ${res.status}: ${text.slice(0, 200)}`);
      lastError = { ok: false, status: 500, code: "AI_ERROR", detail: `${model}: ${res.status}` };
      break; // model bestaat niet, is uitgefaseerd of gaf een serverfout: probeer het reservemodel
    }
  }
  // Gaf een model een limiet (429) en faalde de reserve ook: meld de limiet, dan probeert de aanroeper niet de hele keten opnieuw
  if (sawRateLimit && lastError.ok === false && lastError.code === "AI_ERROR") {
    return { ok: false, status: 429, code: "AI_RATE_LIMIT", detail: lastError.detail };
  }
  return lastError;
}
