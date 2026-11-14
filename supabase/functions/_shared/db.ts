// Supabase-client met de service-rol (alleen op de server) en instellingen uit app_settings.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!client) {
    client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

const settingsCache = new Map<string, { value: unknown; at: number }>();
const SETTINGS_TTL_MS = 60_000;

/** Leest een instelling uit public.app_settings (1 minuut in het geheugen). */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const cached = settingsCache.get(key);
  if (cached && Date.now() - cached.at < SETTINGS_TTL_MS) return cached.value as T;
  try {
    const { data, error } = await db().from("app_settings").select("value").eq("key", key).maybeSingle();
    if (error) throw error;
    const value = (data?.value ?? fallback) as T;
    settingsCache.set(key, { value, at: Date.now() });
    return value;
  } catch (e) {
    console.error(`setting ${key} niet te lezen, standaard gebruikt:`, e instanceof Error ? e.message : e);
    return fallback;
  }
}
