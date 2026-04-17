import { getDeckChallengeTitle } from "@/src/lib/difficulty";
import { getLocalDateSeed } from "@/src/lib/rng";
import type { DeckChallengeLevel } from "@/src/types/game";
import { DECK_CHALLENGE_LEVELS } from "@/src/types/game";

/** Ancien compteur global (avant stats par difficulté). */
const GAMES_COMPLETED_KEY = "planet-ponzi-games-completed";
const STATS_V2_KEY = "planet-ponzi-stats-v2";

export type LevelStats = {
  playCount: number;
  sumScore: number;
  bestScore: number;
};

export type PlayerStatsV2 = {
  version: 1;
  /** Dernier jour local (YYYY-MM-DD) où au moins une partie a été terminée — pour la série. */
  lastCompletionDate: string | null;
  currentStreak: number;
  maxStreak: number;
  /** Clés "0" | "2" | "3" | "4" */
  byLevel: Partial<Record<string, LevelStats>>;
  /** Migré depuis l’ancien compteur unique (affichage seulement). */
  legacyCompletions?: number;
};

function emptyStats(): PlayerStatsV2 {
  return {
    version: 1,
    lastCompletionDate: null,
    currentStreak: 0,
    maxStreak: 0,
    byLevel: {},
  };
}

function isValidDateSeed(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function dayDiff(a: string, b: string): number {
  const ta = new Date(`${a}T12:00:00`).getTime();
  const tb = new Date(`${b}T12:00:00`).getTime();
  return Math.round((tb - ta) / 86_400_000);
}

function migrateLegacyIfNeeded(parsed: PlayerStatsV2): PlayerStatsV2 {
  if (typeof window === "undefined") return parsed;
  const legacyRaw = window.localStorage.getItem(GAMES_COMPLETED_KEY);
  const legacy = legacyRaw ? Number.parseInt(legacyRaw, 10) : 0;
  if (!Number.isFinite(legacy) || legacy <= 0) return parsed;

  let totalInV2 = 0;
  for (const lvl of DECK_CHALLENGE_LEVELS) {
    totalInV2 += parsed.byLevel[String(lvl)]?.playCount ?? 0;
  }

  if (totalInV2 > 0 || parsed.legacyCompletions != null) return parsed;

  return { ...parsed, legacyCompletions: legacy };
}

function readStats(): PlayerStatsV2 {
  if (typeof window === "undefined") return emptyStats();
  const raw = window.localStorage.getItem(STATS_V2_KEY);
  if (!raw) {
    const base = emptyStats();
    return migrateLegacyIfNeeded(base);
  }
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return migrateLegacyIfNeeded(emptyStats());
    const o = data as Record<string, unknown>;
    const byLevel: PlayerStatsV2["byLevel"] = {};
    const rawBy = o.byLevel;
    if (rawBy && typeof rawBy === "object") {
      for (const k of Object.keys(rawBy as object)) {
        const row = (rawBy as Record<string, unknown>)[k];
        if (!row || typeof row !== "object") continue;
        const r = row as Record<string, unknown>;
        const playCount = typeof r.playCount === "number" ? r.playCount : 0;
        const sumScore = typeof r.sumScore === "number" ? r.sumScore : 0;
        const bestScore = typeof r.bestScore === "number" ? r.bestScore : 0;
        byLevel[k] = {
          playCount: Math.max(0, playCount),
          sumScore: Math.max(0, sumScore),
          bestScore: Math.max(0, bestScore),
        };
      }
    }
    const parsed: PlayerStatsV2 = {
      version: 1,
      lastCompletionDate:
        typeof o.lastCompletionDate === "string" && isValidDateSeed(o.lastCompletionDate)
          ? o.lastCompletionDate
          : null,
      currentStreak: typeof o.currentStreak === "number" ? Math.max(0, o.currentStreak) : 0,
      maxStreak: typeof o.maxStreak === "number" ? Math.max(0, o.maxStreak) : 0,
      byLevel,
      legacyCompletions:
        typeof o.legacyCompletions === "number" ? Math.max(0, o.legacyCompletions) : undefined,
    };
    return migrateLegacyIfNeeded(parsed);
  } catch {
    return migrateLegacyIfNeeded(emptyStats());
  }
}

function writeStats(s: PlayerStatsV2): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATS_V2_KEY, JSON.stringify(s));
}

function updateStreak(state: PlayerStatsV2, completionDate: string): void {
  const last = state.lastCompletionDate;
  if (!last) {
    state.currentStreak = 1;
    state.maxStreak = Math.max(state.maxStreak, 1);
    state.lastCompletionDate = completionDate;
    return;
  }
  if (last === completionDate) {
    return;
  }
  const diff = dayDiff(last, completionDate);
  if (diff === 1) {
    state.currentStreak += 1;
    state.maxStreak = Math.max(state.maxStreak, state.currentStreak);
  } else {
    state.currentStreak = 1;
    state.maxStreak = Math.max(state.maxStreak, 1);
  }
  state.lastCompletionDate = completionDate;
}

/**
 * Enregistre une partie terminée (score final + difficulté + niveau Saga).
 * Met à jour séries type Wordle sur la date locale du jour (activité quotidienne).
 */
export function recordGameCompletion(input: {
  score: number;
  deckChallengeLevel: DeckChallengeLevel;
  levelId: number;
}): void {
  if (typeof window === "undefined") return;
  const { score, deckChallengeLevel, levelId } = input;
  if (!Number.isFinite(levelId) || levelId < 1) return;

  const stats = readStats();
  const key = String(deckChallengeLevel);
  const prev = stats.byLevel[key] ?? { playCount: 0, sumScore: 0, bestScore: 0 };
  stats.byLevel[key] = {
    playCount: prev.playCount + 1,
    sumScore: prev.sumScore + score,
    bestScore: Math.max(prev.bestScore, score),
  };

  updateStreak(stats, getLocalDateSeed());
  writeStats(stats);

  const legacy = getLegacyCounterRaw();
  if (legacy > 0) {
    window.localStorage.removeItem(GAMES_COMPLETED_KEY);
  }
}

function getLegacyCounterRaw(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(GAMES_COMPLETED_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Stats complètes pour l’onglet Statistiques (local uniquement). */
export function getPlayerStats(): PlayerStatsV2 {
  return readStats();
}

/** Total de parties terminées (toutes difficultés + legacy migré). */
export function getTotalGamesCompleted(): number {
  const s = readStats();
  let sum: number = s.legacyCompletions ?? 0;
  for (const lvl of DECK_CHALLENGE_LEVELS) {
    sum += s.byLevel[String(lvl)]?.playCount ?? 0;
  }
  return sum;
}

export function getLevelLabel(level: DeckChallengeLevel): string {
  return getDeckChallengeTitle(level);
}

export function formatAvgScore(sum: number, count: number): string {
  if (count <= 0) return "—";
  return (sum / count).toFixed(1);
}
