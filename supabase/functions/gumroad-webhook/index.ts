// Uitgeschakeld sinds 2026-11-14.
//
// Licentiesleutels komen nu van Gumroad zelf (licentiesleutels aan op het product) en worden gecontroleerd
// in verify-license. Deze functie maakte vroeger sleutels aan op basis van een niet-geheime verkoper-ID,
// waardoor iedereen gratis Pro-sleutels kon maken. Ze doet nu bewust niets en slaat niets op.
// Stel in Gumroad geen ping-URL meer in naar deze functie.
import { json } from "../_shared/http.ts";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  return json({ ok: true, ignored: true, reason: "license keys are issued by Gumroad; this endpoint is disabled" });
});
