import {
  DECK_CHALLENGE_LEVELS,
  type DeckChallengeLevel,
} from "@/src/types/game";

const ALLOWED_LEVELS = new Set<number>(DECK_CHALLENGE_LEVELS);

/** Multiplicateur de score (ROI affiché = arrondi du score de grille × ce facteur). */
export function getDeckScoreMultiplier(level: DeckChallengeLevel): number {
  switch (level) {
    case 0:
      return 1;
    case 2:
      return 1.25;
    case 3:
      return 1.45;
    case 4:
      return 1.7;
    default:
      return 1;
  }
}

export function formatMultiplierFr(level: DeckChallengeLevel): string {
  const m = getDeckScoreMultiplier(level);
  return `×${m.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function getDeckChallengeTitle(level: DeckChallengeLevel): string {
  switch (level) {
    case 0:
      return "Transparent";
    case 2:
      return "2 inconnues";
    case 3:
      return "3 inconnues";
    case 4:
      return "Blind intégral";
    default:
      return "Transparent";
  }
}

export function coerceDeckChallengeLevel(value: unknown): DeckChallengeLevel {
  const n = typeof value === "number" ? value : Number(value);
  if (ALLOWED_LEVELS.has(n)) return n as DeckChallengeLevel;
  if (n === 1) return 2;
  return 0;
}
