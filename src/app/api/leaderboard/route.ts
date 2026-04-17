import { NextResponse } from "next/server";

import { getSupabaseServiceRole } from "@/src/lib/supabase-server";
import type { LeaderboardRow } from "@/src/types/leaderboard";

type RpcRow = {
  rank: number | string;
  player_key: string;
  pseudo: string;
  total_stars: number | string;
};

export async function GET() {
  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, entries: [] as LeaderboardRow[], reason: "Supabase non configuré côté serveur" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.rpc("pp_leaderboard_top50");

  if (error) {
    console.warn("[planet-ponzi] leaderboard RPC:", error.message);
    return NextResponse.json(
      { ok: false, entries: [] as LeaderboardRow[], error: error.message },
      { status: 500 },
    );
  }

  const raw = (data ?? []) as RpcRow[];
  const entries: LeaderboardRow[] = raw.map((r) => ({
    rank: Number(r.rank),
    player_key: r.player_key,
    pseudo: r.pseudo,
    total_stars: Number(r.total_stars),
  }));

  return NextResponse.json({ ok: true, entries });
}
