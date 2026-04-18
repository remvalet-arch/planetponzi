import { NextResponse } from "next/server";

import { getBearerAuthUserId } from "@/src/lib/supabase-auth-from-request";
import { getSupabaseServiceRole } from "@/src/lib/supabase-server";
import type { BuildingType } from "@/src/types/game";

type Body = {
  levelId?: number;
  stars?: number;
  score?: number;
  deckChallengeLevel?: number;
  puzzleDate?: string;
  deviceId?: string;
  playerId?: string | null;
  pseudo?: string | null;
  prestigeLevel?: number;
  seed?: string;
  grid?: Array<{ index: number; building: string | null }>;
  placementSequence?: string[];
};

function isValidDate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

export async function POST(req: Request) {
  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, skipped: true, reason: "Supabase non configuré côté serveur" },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 });
  }

  const {
    levelId,
    stars,
    score,
    deckChallengeLevel,
    puzzleDate,
    deviceId,
    playerId,
    pseudo,
    prestigeLevel: prestigeRaw,
    seed,
    grid,
    placementSequence,
  } = body;

  const prestigeLevel =
    typeof prestigeRaw === "number" && Number.isFinite(prestigeRaw)
      ? Math.min(999, Math.max(0, Math.floor(prestigeRaw)))
      : 0;

  const pseudoStr =
    typeof pseudo === "string" ? pseudo.trim().slice(0, 15) : pseudo === null ? "" : "";
  const pseudoOk = pseudo === null || pseudo === undefined || typeof pseudo === "string";
  const playerIdStr = playerId === null || playerId === undefined ? null : playerId;
  const playerIdOk =
    playerIdStr === null ||
    (typeof playerIdStr === "string" && isUuid(playerIdStr));

  const authUserId = await getBearerAuthUserId(req);

  if (
    typeof levelId !== "number" ||
    !Number.isFinite(levelId) ||
    levelId < 1 ||
    typeof score !== "number" ||
    !Number.isFinite(score) ||
    typeof stars !== "number" ||
    stars < 0 ||
    stars > 3 ||
    typeof deckChallengeLevel !== "number" ||
    ![0, 1, 2, 3, 4].includes(deckChallengeLevel) ||
    typeof puzzleDate !== "string" ||
    !isValidDate(puzzleDate) ||
    typeof deviceId !== "string" ||
    !isUuid(deviceId) ||
    !playerIdOk ||
    !pseudoOk ||
    !Array.isArray(grid) ||
    grid.length !== 16 ||
    !Array.isArray(placementSequence) ||
    placementSequence.length < 1 ||
    placementSequence.length > 16
  ) {
    return NextResponse.json({ ok: false, error: "Payload invalide" }, { status: 400 });
  }

  const { error } = await supabase.from("game_completions").insert({
    user_id: authUserId,
    device_id: deviceId,
    player_id: playerIdStr,
    pseudo: pseudoStr.length ? pseudoStr : null,
    puzzle_date: puzzleDate,
    deck_challenge_level: deckChallengeLevel,
    final_score: Math.round(score),
    turns_completed: placementSequence.length,
    grid,
    daily_building_sequence: placementSequence as BuildingType[],
    meta: {
      stars,
      sagaLevelId: levelId,
      seed: typeof seed === "string" ? seed : "",
      source: "saga",
      prestigeLevel,
    },
  });

  if (error) {
    console.warn("[planet-ponzi] Supabase insert game_completions:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
