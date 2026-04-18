import type { SupabaseClient } from "@supabase/supabase-js";

import type { EconomyStore } from "@/src/store/useEconomyStore";
import type { BoostersState, ProgressStore, StarsCount } from "@/src/store/useProgressStore";

/** Ligne `player_saves` (snake_case DB). */
export type PlayerSaveRow = {
  user_id: string;
  unlocked_levels: number[];
  stars_by_level: Record<string, number>;
  best_score_by_level: Record<string, number>;
  boosters: BoostersState;
  prestige_level: number;
  coins: number;
  lives: number;
  last_life_recharge_time: number | null;
  last_bonus_date: string | null;
  has_seen_fiscal_freeze_tutorial: boolean;
  updated_at?: string;
};

export type ProgressPersistSlice = Pick<
  ProgressStore,
  | "unlockedLevels"
  | "starsByLevel"
  | "bestScoreByLevel"
  | "boosters"
  | "prestigeLevel"
  | "hasSeenFiscalFreezeTutorial"
>;

export type EconomyPersistSlice = Pick<
  EconomyStore,
  "coins" | "lives" | "lastLifeRechargeTime" | "lastBonusDate"
>;

function maxUnlockedLevel(levels: readonly number[]): number {
  if (!levels.length) return 0;
  return Math.max(...levels);
}

function normalizeStarsRecord(raw: unknown): Record<string, StarsCount> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, StarsCount> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof v === "number" ? Math.min(3, Math.max(0, Math.floor(v))) : 0;
    out[k] = n as StarsCount;
  }
  return out;
}

function normalizeBestScores(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

function normalizeBoosters(raw: unknown): BoostersState {
  const b: BoostersState = { demolition: 0, spy: 0, lobbying: 0 };
  if (!raw || typeof raw !== "object") return b;
  const o = raw as Record<string, unknown>;
  for (const k of ["demolition", "spy", "lobbying"] as const) {
    const n = o[k];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) b[k] = Math.floor(n);
  }
  return b;
}

/** Lit la sauvegarde cloud ; `null` si aucune ligne. */
export async function fetchCloudPlayerSave(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlayerSaveRow | null> {
  const { data, error } = await supabase
    .from("player_saves")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[cloud-save] fetch player_saves:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as Record<string, unknown>;
  const ul = row.unlocked_levels;
  const unlocked_levels = Array.isArray(ul)
    ? (ul as unknown[]).filter((n): n is number => typeof n === "number" && Number.isFinite(n))
    : [1];

  return {
    user_id: String(row.user_id),
    unlocked_levels: unlocked_levels.length ? unlocked_levels : [1],
    stars_by_level: normalizeStarsRecord(row.stars_by_level),
    best_score_by_level: normalizeBestScores(row.best_score_by_level),
    boosters: normalizeBoosters(row.boosters),
    prestige_level:
      typeof row.prestige_level === "number" && Number.isFinite(row.prestige_level)
        ? Math.min(999, Math.max(0, Math.floor(row.prestige_level)))
        : 0,
    coins: typeof row.coins === "number" && Number.isFinite(row.coins) ? Math.max(0, Math.floor(row.coins)) : 0,
    lives: typeof row.lives === "number" && Number.isFinite(row.lives) ? Math.max(0, Math.floor(row.lives)) : 0,
    last_life_recharge_time:
      typeof row.last_life_recharge_time === "number" && Number.isFinite(row.last_life_recharge_time)
        ? row.last_life_recharge_time
        : null,
    last_bonus_date:
      typeof row.last_bonus_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.last_bonus_date)
        ? row.last_bonus_date
        : null,
    has_seen_fiscal_freeze_tutorial: Boolean(row.has_seen_fiscal_freeze_tutorial),
  };
}

/**
 * UPSERT `player_saves` pour l’utilisateur courant.
 * `userId` doit correspondre à `auth.uid()` (RLS).
 */
export async function syncSaveToCloud(
  supabase: SupabaseClient,
  userId: string,
  progress: ProgressPersistSlice,
  economy: EconomyPersistSlice,
): Promise<{ ok: boolean; error?: string }> {
  const payload = {
    user_id: userId,
    unlocked_levels: [...progress.unlockedLevels],
    stars_by_level: progress.starsByLevel,
    best_score_by_level: progress.bestScoreByLevel,
    boosters: progress.boosters,
    prestige_level: progress.prestigeLevel,
    coins: economy.coins,
    lives: economy.lives,
    last_life_recharge_time: economy.lastLifeRechargeTime,
    last_bonus_date: economy.lastBonusDate,
    has_seen_fiscal_freeze_tutorial: progress.hasSeenFiscalFreezeTutorial,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("player_saves").upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.warn("[cloud-save] upsert player_saves:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export type CloudMergeResult = {
  progressPatch: Partial<ProgressPersistSlice> | null;
  economyPatch: Partial<EconomyPersistSlice> | null;
};

/**
 * Compare cloud vs local : si le max niveau débloqué cloud est strictement supérieur,
 * on applique tout le slice cloud ; sinon on fusionne étoiles / bests au maximum par clé.
 */
export function computeCloudMerge(
  localProgress: ProgressPersistSlice,
  localEconomy: EconomyPersistSlice,
  cloud: PlayerSaveRow,
): CloudMergeResult {
  const cloudMax = maxUnlockedLevel(cloud.unlocked_levels);
  const localMax = maxUnlockedLevel(localProgress.unlockedLevels);

  if (cloudMax > localMax) {
    return {
      progressPatch: {
        unlockedLevels: [...cloud.unlocked_levels],
        starsByLevel: normalizeStarsRecord(cloud.stars_by_level),
        bestScoreByLevel: normalizeBestScores(cloud.best_score_by_level),
        boosters: normalizeBoosters(cloud.boosters),
        prestigeLevel: cloud.prestige_level,
        hasSeenFiscalFreezeTutorial: cloud.has_seen_fiscal_freeze_tutorial,
      },
      economyPatch: {
        coins: cloud.coins,
        lives: cloud.lives,
        lastLifeRechargeTime: cloud.last_life_recharge_time,
        lastBonusDate: cloud.last_bonus_date,
      },
    };
  }

  const mergedStars: Record<string, StarsCount> = { ...localProgress.starsByLevel };
  for (const [k, v] of Object.entries(cloud.stars_by_level)) {
    const prev = mergedStars[k] ?? 0;
    const next = Math.max(prev, v) as StarsCount;
    mergedStars[k] = next;
  }

  const mergedBest: Record<string, number> = { ...localProgress.bestScoreByLevel };
  for (const [k, v] of Object.entries(cloud.best_score_by_level)) {
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    const prev = mergedBest[k] ?? Number.NEGATIVE_INFINITY;
    mergedBest[k] = Math.max(prev, v);
  }

  const mergedBoosters: BoostersState = { ...localProgress.boosters };
  for (const key of ["demolition", "spy", "lobbying"] as const) {
    mergedBoosters[key] = Math.max(mergedBoosters[key], cloud.boosters[key] ?? 0);
  }

  return {
    progressPatch: {
      starsByLevel: mergedStars,
      bestScoreByLevel: mergedBest,
      boosters: mergedBoosters,
      prestigeLevel: Math.max(localProgress.prestigeLevel, cloud.prestige_level),
      hasSeenFiscalFreezeTutorial:
        localProgress.hasSeenFiscalFreezeTutorial || cloud.has_seen_fiscal_freeze_tutorial,
    },
    economyPatch: null,
  };
}
