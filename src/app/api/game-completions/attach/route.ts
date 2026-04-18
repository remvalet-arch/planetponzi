import { NextResponse } from "next/server";

import { getBearerAuthUserId } from "@/src/lib/supabase-auth-from-request";
import { getSupabaseServiceRole } from "@/src/lib/supabase-server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Body = { deviceId?: string };

/**
 * Rattache les `game_completions` encore anonymes (`user_id` NULL) du device au compte JWT.
 */
export async function POST(req: Request) {
  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: "Supabase non configuré" }, { status: 503 });
  }

  const userId = await getBearerAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 });
  }

  const deviceId = body.deviceId;
  if (typeof deviceId !== "string" || !UUID_RE.test(deviceId)) {
    return NextResponse.json({ ok: false, error: "deviceId invalide" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("attach_game_completions_to_user", {
    p_device_id: deviceId,
    p_target_user_id: userId,
  });

  if (error) {
    console.warn("[planet-ponzi] attach_game_completions_to_user:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const updated = typeof data === "number" ? data : Number(data);
  return NextResponse.json({ ok: true, updated: Number.isFinite(updated) ? updated : 0 });
}
