// Gedeelde HTTP-hulpjes voor alle Autoposter-functies.

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-license-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function preflight(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed", error_code: "METHOD_NOT_ALLOWED" }, 405);
  return null;
}

/** Leest de body als JSON, met een harde maximale grootte (ook zonder Content-Length). */
export async function readJson(req: Request, maxBytes: number): Promise<{ ok: true; body: any } | { ok: false; response: Response }> {
  const tooLarge = () => ({ ok: false as const, response: json({ error: "Request too large", error_code: "PAYLOAD_TOO_LARGE" }, 413) });
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > maxBytes) return tooLarge();

  const chunks: Uint8Array[] = [];
  let total = 0;
  if (req.body) {
    const reader = req.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return tooLarge();
      }
      chunks.push(value);
    }
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  try {
    const text = new TextDecoder().decode(bytes);
    const body = text ? JSON.parse(text) : {};
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
    return { ok: true, body };
  } catch {
    return { ok: false, response: json({ error: "Invalid JSON body", error_code: "BAD_REQUEST" }, 400) };
  }
}
