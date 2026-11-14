// Licentiecontrole en gebruikstellers.
//
// Sleutels komen van Gumroad zelf (licentiesleutels aan op het product). De server controleert ze bij
// Gumroad en onthoudt de uitkomst in public.licenses. Handmatige sleutels (source = 'manual') blijven werken.
import { db } from "./db.ts";

export type Tier = "free" | "starter" | "pro";

/** AI-analyses per maand zoals de klant ze ziet (-1 = onbeperkt). */
export const ANALYSIS_LIMITS: Record<Tier, number> = { free: 3, starter: 50, pro: -1 };
/** Tekstgeneraties (beschrijving/titel) per maand zoals de klant ze ziet (-1 = onbeperkt). */
export const GENERATION_LIMITS: Record<Tier, number> = { free: 15, starter: 250, pro: -1 };
/** Grens voor redelijk gebruik bij "onbeperkt" (Pro): beschermt tegen gedeelde of gelekte sleutels. */
const FAIR_USE_ANALYSES = 2000;
const FAIR_USE_GENERATIONS = 6000;

/** De grens die de server echt toepast. */
export function enforcedLimit(kind: "analysis" | "generation", tier: Tier): number {
  const shown = kind === "analysis" ? ANALYSIS_LIMITS[tier] : GENERATION_LIMITS[tier];
  if (shown !== -1) return shown;
  return kind === "analysis" ? FAIR_USE_ANALYSES : FAIR_USE_GENERATIONS;
}

const GUMROAD_KEY_RE = /^[0-9A-F]{8}-[0-9A-F]{8}-[0-9A-F]{8}-[0-9A-F]{8}$/;
const ANY_KEY_RE = /^[A-Z0-9][A-Z0-9-]{4,62}[A-Z0-9]$/;
const GUMROAD_VERIFY_URL = "https://api.gumroad.com/v2/licenses/verify";

const CACHE_MS = 6 * 60 * 60 * 1000; // zo lang vertrouwen we een eerdere Gumroad-controle
const NOT_FOUND_CACHE_MS = 5 * 60 * 1000; // onbekende sleutels niet steeds opnieuw bij Gumroad navragen
const notFoundCache = new Map<string, number>();
const GRACE_MS = 72 * 60 * 60 * 1000; // zo lang mag het als Gumroad onbereikbaar is
const REFRESH_MIN_MS = 60 * 1000; // vaker dan dit dwingt "refresh" geen nieuwe controle af

export type LicenseErrorCode =
  | "NO_LICENSE"
  | "BAD_FORMAT"
  | "INVALID_LICENSE"
  | "LICENSE_INACTIVE"
  | "LICENSE_EXPIRED"
  | "VERIFY_UNAVAILABLE";

export interface ResolvedLicense {
  id: string;
  tier: Tier;
  expiresAt: string | null;
}

export type ResolveResult =
  | { ok: true; license: ResolvedLicense }
  | { ok: false; code: LicenseErrorCode; message: string };

interface LicenseRow {
  id: string;
  tier: Tier;
  is_active: boolean;
  expires_at: string | null;
  source: "manual" | "gumroad";
  gumroad_product_id: string | null;
  verified_at: string | null;
  status_reason: string | null;
}

interface ProductRow {
  product_id: string;
  default_tier: Tier;
  variant_tiers: Array<{ match: string; tier: Tier }> | null;
}

type GumroadOutcome =
  | {
    kind: "found";
    active: boolean;
    reason: string | null;
    tier: Tier;
    productId: string;
    saleId: string | null;
    accessUntil: string | null;
    uses: number | null;
  }
  | { kind: "not_found" }
  | { kind: "unavailable" };

const MESSAGES: Record<LicenseErrorCode, string> = {
  NO_LICENSE: "License key required",
  BAD_FORMAT: "Invalid license key",
  INVALID_LICENSE: "Invalid license key",
  LICENSE_INACTIVE: "License is no longer active",
  LICENSE_EXPIRED: "License has expired",
  VERIFY_UNAVAILABLE: "License check temporarily unavailable, please try again",
};

function fail(code: LicenseErrorCode, message?: string): ResolveResult {
  return { ok: false, code, message: message || MESSAGES[code] };
}

export function normalizeKey(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toUpperCase();
  return key.length > 0 ? key : null;
}

/** HTTP-status voor een licentiefout in analyze-image en generate-listing. */
export function licenseErrorStatus(code: LicenseErrorCode): number {
  if (code === "NO_LICENSE") return 401;
  if (code === "VERIFY_UNAVAILABLE") return 503;
  return 403;
}

function fromRow(row: LicenseRow): ResolveResult {
  if (!row.is_active) return fail("LICENSE_INACTIVE");
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return fail("LICENSE_EXPIRED");
  return { ok: true, license: { id: row.id, tier: row.tier, expiresAt: row.expires_at } };
}

function tierForPurchase(product: ProductRow, variants: unknown): Tier {
  const text = (typeof variants === "string" ? variants : JSON.stringify(variants ?? "")).toLowerCase();
  for (const rule of product.variant_tiers ?? []) {
    const word = rule.match.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${word}\\b`).test(text)) return rule.tier;
  }
  return product.default_tier;
}

/**
 * Gumroad zet bij opzeggen de einddatum van de betaalde periode in subscription_cancelled_at,
 * bij een definitief mislukte betaling subscription_failed_at, en bij beëindigen subscription_ended_at.
 * Toegang loopt tot de vroegste van die datums; ligt die in het verleden, dan is de licentie niet meer geldig.
 */
function membershipEnd(p: Record<string, unknown>): Date | null {
  const dates = [p.subscription_ended_at, p.subscription_cancelled_at, p.subscription_failed_at]
    .filter((v) => typeof v === "string" && v.length > 0)
    .map((v) => new Date(v as string))
    .filter((d) => !Number.isNaN(d.getTime()));
  if (dates.length === 0) return null;
  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

function inactiveReason(p: Record<string, unknown>): string | null {
  if (p.refunded === true) return "refunded";
  if (p.chargebacked === true) return "chargeback";
  if (p.disputed === true && p.dispute_won !== true) return "disputed";
  const end = membershipEnd(p);
  if (end && end.getTime() <= Date.now()) {
    if (p.subscription_failed_at) return "payment failed";
    if (p.subscription_cancelled_at) return "subscription cancelled";
    return "subscription ended";
  }
  return null;
}

async function verifyWithGumroad(key: string, preferredProductId: string | null, countUse: boolean): Promise<GumroadOutcome> {
  const { data, error } = await db()
    .from("gumroad_products")
    .select("product_id, default_tier, variant_tiers")
    .eq("is_active", true);
  const products = (data ?? []) as ProductRow[];
  if (error || products.length === 0) {
    console.error("gumroad_products niet te lezen of leeg:", error?.message ?? "geen producten");
    return { kind: "unavailable" };
  }
  products.sort((a, b) => (a.product_id === preferredProductId ? -1 : b.product_id === preferredProductId ? 1 : 0));

  let unavailable = false;
  for (const product of products) {
    let res: Response;
    try {
      res = await fetch(GUMROAD_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams({
          product_id: product.product_id,
          license_key: key,
          increment_uses_count: countUse ? "true" : "false",
        }),
        signal: AbortSignal.timeout(8000),
      });
    } catch (e) {
      console.error("Gumroad onbereikbaar:", e instanceof Error ? e.message : e);
      unavailable = true;
      continue;
    }

    const body = await res.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message : "";

    if (body && body.success === false) {
      // Sleutel hoort bij dit product maar is uitgezet of de toegang is ingetrokken.
      if (/disabled|access to the purchase .* has expired/i.test(message)) {
        return {
          kind: "found", active: false, reason: message, tier: product.default_tier,
          productId: product.product_id, saleId: null, accessUntil: null, uses: null,
        };
      }
      if (/does not exist/i.test(message)) continue; // niet van dit product: probeer het volgende
    }

    if (!res.ok || !body?.success || typeof body.purchase !== "object" || body.purchase === null) {
      console.error("Onverwacht antwoord van Gumroad, status", res.status, message.slice(0, 120));
      unavailable = true;
      continue;
    }

    const purchase = body.purchase as Record<string, unknown>;
    const reason = inactiveReason(purchase);
    const end = membershipEnd(purchase);
    return {
      kind: "found",
      active: reason === null,
      reason,
      tier: tierForPurchase(product, purchase.variants),
      productId: product.product_id,
      saleId: (purchase.sale_id as string) || (purchase.id as string) || null,
      accessUntil: end && end.getTime() > Date.now() ? end.toISOString() : null,
      uses: typeof body.uses === "number" ? body.uses : null,
    };
  }
  return unavailable ? { kind: "unavailable" } : { kind: "not_found" };
}

/**
 * Zoekt en controleert een licentiesleutel.
 * refresh = true: controleer opnieuw bij Gumroad als de vorige controle ouder is dan een minuut
 * (gebruikt bij activeren en na upgraden).
 */
export async function resolveLicense(rawKey: unknown, opts: { refresh?: boolean } = {}): Promise<ResolveResult> {
  const key = normalizeKey(rawKey);
  if (!key) return fail("NO_LICENSE");
  if (!ANY_KEY_RE.test(key)) return fail("BAD_FORMAT");

  const { data: found, error } = await db()
    .from("licenses")
    .select("id, tier, is_active, expires_at, source, gumroad_product_id, verified_at, status_reason")
    .eq("license_key", key)
    .maybeSingle();
  if (error) {
    console.error("licenses niet te lezen:", error.message);
    return fail("VERIFY_UNAVAILABLE");
  }
  const row = found as LicenseRow | null;

  if (row && row.source !== "gumroad") return fromRow(row);
  if (!row && !GUMROAD_KEY_RE.test(key)) return fail("INVALID_LICENSE");

  const age = row?.verified_at ? Date.now() - new Date(row.verified_at).getTime() : Number.POSITIVE_INFINITY;
  const accessEnded = !!row?.expires_at && new Date(row.expires_at).getTime() <= Date.now();
  const needsCheck = !row || age > CACHE_MS || accessEnded || (opts.refresh === true && age > REFRESH_MIN_MS);
  if (row && !needsCheck) return fromRow(row);

  const cachedMiss = notFoundCache.get(key);
  if (!row && cachedMiss && Date.now() - cachedMiss < NOT_FOUND_CACHE_MS) return fail("INVALID_LICENSE");

  // Bij activeren telt Gumroad het aantal activaties mee (zo zien we gedeelde sleutels).
  const outcome = await verifyWithGumroad(key, row?.gumroad_product_id ?? null, opts.refresh === true);
  const now = new Date().toISOString();

  if (outcome.kind === "unavailable") {
    if (row && age < GRACE_MS) return fromRow(row);
    return fail("VERIFY_UNAVAILABLE");
  }

  if (outcome.kind === "not_found") {
    if (row) {
      await db().from("licenses").update({ is_active: false, verified_at: now, status_reason: "not found at Gumroad" }).eq("id", row.id);
      return fail("LICENSE_INACTIVE");
    }
    notFoundCache.set(key, Date.now());
    if (notFoundCache.size > 5000) notFoundCache.clear();
    return fail("INVALID_LICENSE");
  }

  const { data: saved, error: saveError } = await db()
    .from("licenses")
    .upsert(
      {
        license_key: key,
        tier: outcome.tier,
        is_active: outcome.active,
        source: "gumroad",
        gumroad_product_id: outcome.productId,
        gumroad_sale_id: outcome.saleId,
        verified_at: now,
        status_reason: outcome.reason,
        expires_at: outcome.accessUntil,
        ...(outcome.uses !== null ? { gumroad_uses: outcome.uses } : {}),
      },
      { onConflict: "license_key" },
    )
    .select("id, tier, is_active, expires_at, source, gumroad_product_id, verified_at, status_reason")
    .single();
  if (saveError || !saved) {
    console.error("licentie niet op te slaan:", saveError?.message);
    return fail("VERIFY_UNAVAILABLE");
  }
  return fromRow(saved as LicenseRow);
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export interface UsageView {
  tier: Tier;
  usageCount: number;
  usageLimit: number;
  usageLeft: number;
  canUseAI: boolean;
}

export function usageView(tier: Tier, analysesUsed: number): UsageView {
  const limit = ANALYSIS_LIMITS[tier];
  return {
    tier,
    usageCount: analysesUsed,
    usageLimit: limit,
    usageLeft: limit === -1 ? -1 : Math.max(0, limit - analysesUsed),
    canUseAI: limit === -1 || analysesUsed < limit,
  };
}

export async function readAnalysesUsed(licenseId: string, month: string): Promise<number> {
  const { data } = await db()
    .from("license_usage")
    .select("listings_count")
    .eq("license_id", licenseId)
    .eq("month_year", month)
    .maybeSingle();
  return data?.listings_count ?? 0;
}

export type UsageKind = "analysis" | "generation";

/** Reserveert atomisch 1 gebruik. success = false als de limiet al bereikt is. */
export async function reserveUsage(
  licenseId: string,
  month: string,
  kind: UsageKind,
  limit: number,
): Promise<{ success: boolean; count: number } | null> {
  const { data, error } = await db()
    .rpc("reserve_usage", { p_license_id: licenseId, p_month_year: month, p_kind: kind, p_limit: limit })
    .single();
  if (error || !data) {
    console.error("reserve_usage mislukt:", error?.message);
    return null;
  }
  const row = data as { success: boolean; new_count: number | null };
  return { success: row.success, count: row.new_count ?? 0 };
}

/** Geeft een gereserveerd gebruik terug (bij een mislukte AI-aanroep). */
export async function releaseUsage(licenseId: string, month: string, kind: UsageKind): Promise<void> {
  const { error } = await db().rpc("release_usage", { p_license_id: licenseId, p_month_year: month, p_kind: kind });
  if (error) console.error("release_usage mislukt:", error.message);
}
