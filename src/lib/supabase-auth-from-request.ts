import { getSupabaseAnonServer } from "@/src/lib/supabase-server";

/** Valide le JWT `Authorization: Bearer …` et retourne l’`auth.users.id`, ou `null`. */
export async function getBearerAuthUserId(req: Request): Promise<string | null> {
  const raw = req.headers.get("authorization");
  if (!raw?.toLowerCase().startsWith("bearer ")) return null;
  const jwt = raw.slice(7).trim();
  if (!jwt) return null;
  const anon = getSupabaseAnonServer();
  if (!anon) return null;
  const {
    data: { user },
    error,
  } = await anon.auth.getUser(jwt);
  if (error || !user?.id) return null;
  return user.id;
}
