import type { BuildingType, GameStatus } from "@/src/types/game";

/** Niveaux avec deck scripté + coach Board (pas de perte de vie si 0★). */
export const TUTORIAL_COACH_MAX_LEVEL = 3 as const;

export type TutorialCoachStep = {
  levelId: number;
  /** Tour courant (0 = avant le 1er placement une fois en `playing`). */
  turn: number;
  /** Case imposée ; `null` = libre (toutes cases vides jouables). */
  allowedCellIndex: number | null;
  /** Clé dans `strings.*.tutorialCoach`. */
  messageKey: string;
  /** Masque + pastille sur la case cible. */
  highlight: boolean;
};

/** Carré 2×2 central (indices) — rails identiques sur les 3 premiers niveaux pour la phase guidée. */
export const TUTORIAL_RAILS_CELLS: readonly [number, number, number, number] = [5, 6, 9, 10];

const L1: BuildingType[] = [
  "habitacle",
  "eau",
  "habitacle",
  "eau",
  "eau",
  "habitacle",
  "eau",
  "habitacle",
  "habitacle",
  "eau",
  "habitacle",
  "eau",
  "eau",
  "habitacle",
  "eau",
  "habitacle",
];

const L2: BuildingType[] = [
  "habitacle",
  "eau",
  "habitacle",
  "mine",
  "eau",
  "habitacle",
  "mine",
  "eau",
  "serre",
  "habitacle",
  "eau",
  "mine",
  "habitacle",
  "eau",
  "serre",
  "mine",
];

/** 15 placements (une case obstacle sur le niveau 3). */
const L3: BuildingType[] = [
  "habitacle",
  "eau",
  "habitacle",
  "eau",
  "mine",
  "habitacle",
  "eau",
  "serre",
  "habitacle",
  "mine",
  "eau",
  "habitacle",
  "serre",
  "eau",
  "mine",
];

export const TUTORIAL_COACH_STEPS: readonly TutorialCoachStep[] = [
  {
    levelId: 1,
    turn: 0,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[0],
    messageKey: "l1_t0",
    highlight: true,
  },
  {
    levelId: 1,
    turn: 1,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[1],
    messageKey: "l1_t1",
    highlight: true,
  },
  {
    levelId: 1,
    turn: 2,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[2],
    messageKey: "l1_t2",
    highlight: true,
  },
  {
    levelId: 1,
    turn: 3,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[3],
    messageKey: "l1_t3",
    highlight: true,
  },
  {
    levelId: 1,
    turn: 4,
    allowedCellIndex: null,
    messageKey: "l1_free",
    highlight: false,
  },
  {
    levelId: 2,
    turn: 0,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[0],
    messageKey: "l2_t0",
    highlight: true,
  },
  {
    levelId: 2,
    turn: 1,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[1],
    messageKey: "l2_t1",
    highlight: true,
  },
  {
    levelId: 2,
    turn: 2,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[2],
    messageKey: "l2_t2",
    highlight: true,
  },
  {
    levelId: 2,
    turn: 3,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[3],
    messageKey: "l2_t3",
    highlight: true,
  },
  {
    levelId: 2,
    turn: 4,
    allowedCellIndex: null,
    messageKey: "l2_free",
    highlight: false,
  },
  {
    levelId: 3,
    turn: 0,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[0],
    messageKey: "l3_t0",
    highlight: true,
  },
  {
    levelId: 3,
    turn: 1,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[1],
    messageKey: "l3_t1",
    highlight: true,
  },
  {
    levelId: 3,
    turn: 2,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[2],
    messageKey: "l3_t2",
    highlight: true,
  },
  {
    levelId: 3,
    turn: 3,
    allowedCellIndex: TUTORIAL_RAILS_CELLS[3],
    messageKey: "l3_t3",
    highlight: true,
  },
  {
    levelId: 3,
    turn: 4,
    allowedCellIndex: null,
    messageKey: "l3_free",
    highlight: false,
  },
];

export function isTutorialCoachLevel(levelId: number): boolean {
  return levelId >= 1 && levelId <= TUTORIAL_COACH_MAX_LEVEL;
}

export function getTutorialCoachStep(levelId: number, turn: number): TutorialCoachStep | undefined {
  return TUTORIAL_COACH_STEPS.find((s) => s.levelId === levelId && s.turn === turn);
}

/**
 * Rails actifs : niveau coach, partie en cours, étape avec case imposée.
 */
export function isTutorialRailsActive(levelId: number, status: GameStatus, turn: number): boolean {
  if (!isTutorialCoachLevel(levelId) || status !== "playing") return false;
  const step = getTutorialCoachStep(levelId, turn);
  return Boolean(step?.highlight && step.allowedCellIndex !== null);
}

export function getScriptedTutorialSequence(
  levelId: number,
  expectedLength: number,
): BuildingType[] | null {
  if (!isTutorialCoachLevel(levelId)) return null;
  if (levelId === 1 && expectedLength === L1.length) return [...L1];
  if (levelId === 2 && expectedLength === L2.length) return [...L2];
  if (levelId === 3 && expectedLength === L3.length) return [...L3];
  return null;
}
