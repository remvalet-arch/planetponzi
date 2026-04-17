import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client service role — **uniquement** dans Route Handlers / Server Actions.
 * Ne jamais importer ce module depuis un composant client.
 */
export function getSupabaseServiceRole(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
