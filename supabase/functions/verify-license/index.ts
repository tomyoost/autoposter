// Controleert een licentiesleutel en geeft het gebruik van deze maand terug.
// Telt zelf niets: analyses worden geteld in analyze-image.
import { json, preflight, readJson } from "../_shared/http.ts";
import { currentMonth, readAnalysesUsed, resolveLicense, usageView } from "../_shared/license.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  try {
    const parsed = await readJson(req, 4 * 1024);
    if (!parsed.ok) return parsed.response;
    const { licenseKey, refresh } = parsed.body;

    const result = await resolveLicense(licenseKey, { refresh: refresh === true });
    if (!result.ok) {
      if (result.code === "NO_LICENSE") return json({ valid: false, error: result.message, error_code: result.code }, 400);
      if (result.code === "VERIFY_UNAVAILABLE") return json({ valid: false, error: result.message, error_code: result.code }, 503);
      return json({ valid: false, error: result.message, error_code: result.code });
    }

    const { license } = result;
    const used = await readAnalysesUsed(license.id, currentMonth());
    return json({ valid: true, ...usageView(license.tier, used), expiresAt: license.expiresAt });
  } catch (error) {
    console.error("verify-license fout:", error instanceof Error ? error.message : error);
    return json({ valid: false, error: "Server error", error_code: "SERVER_ERROR" }, 500);
  }
});
