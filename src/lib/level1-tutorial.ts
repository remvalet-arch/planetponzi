import type { BuildingType, GameStatus } from "@/src/types/game";

/** Indices des quatre cases formant le carré 2×2 (haut-gauche = 5) pour l’onboarding Niveau 1. */
export const LEVEL1_TUTORIAL_CELL_BY_TURN: readonly [number, number, number, number] = [
  5, 6, 9, 10,
];

export function isLevel1TutorialRailsActive(
  levelId: number,
  status: GameStatus,
  turn: number,
): boolean {
  return levelId === 1 && status === "playing" && turn >= 0 && turn < 4;
}

/**
 * Remplace les 4 premières cartes par des usines pour le script tutoriel (fusion industrielle).
 * Ne modifie pas `rng.ts` : composition appliquée à l’entrée / reset du niveau uniquement.
 */
export function applyLevel1TutorialOpeningMines(sequence: readonly BuildingType[]): BuildingType[] {
  const next = [...sequence];
  for (let i = 0; i < 4 && i < next.length; i++) {
    next[i] = "mine";
  }
  return next;
}
