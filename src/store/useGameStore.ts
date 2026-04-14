"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  coerceDeckChallengeLevel,
  getDeckScoreMultiplier,
} from "@/src/lib/difficulty";
import { generateDailyBuildingSequence, getDailyStats, getLocalDateSeed } from "@/src/lib/rng";
import { calculateGridScore } from "@/src/lib/scoring";
import { recordGameCompletion } from "@/src/lib/stats";
import type {
  BuildingType,
  Cell,
  DailyInventory,
  DeckChallengeLevel,
  GameState,
  GameStatus,
} from "@/src/types/game";

const PLACED_BUILDING_TYPES = new Set<string>([
  "habitacle",
  "eau",
  "serre",
  "mine",
]);

/** Progrès réel (tour ou bâtiment valide) — évite les faux positifs (ex. `building: 0` en JSON). */
function hasMeaningfulGridProgress(grid: Cell[], turn: number): boolean {
  if (typeof turn === "number" && turn > 0 && Number.isFinite(turn)) return true;
  return grid.some(
    (c) => typeof c.building === "string" && PLACED_BUILDING_TYPES.has(c.building),
  );
}

function createEmptyGrid(): Cell[] {
  return Array.from({ length: 16 }, (_, index) => ({
    index,
    building: null,
  }));
}

function toGameState(snapshot: {
  seed: string;
  dailySequence: BuildingType[];
  dailyInventory: DailyInventory;
  deckChallengeLevel: DeckChallengeLevel;
  deckChallengeLockedSeed: string | null;
  grid: Cell[];
  turn: number;
  score: number;
  status: GameStatus;
}): GameState {
  return {
    seed: snapshot.seed,
    dailySequence: [...snapshot.dailySequence],
    dailyInventory: { ...snapshot.dailyInventory },
    deckChallengeLevel: snapshot.deckChallengeLevel,
    deckChallengeLockedSeed: snapshot.deckChallengeLockedSeed,
    grid: snapshot.grid.map((c) => ({ ...c, building: c.building })),
    turn: snapshot.turn,
    score: snapshot.score,
    status: snapshot.status,
  };
}

export type GameStore = {
  seed: string;
  dailySequence: BuildingType[];
  dailyInventory: DailyInventory;
  deckChallengeLevel: DeckChallengeLevel;
  /** `null` tant que la difficulté n’est pas figée pour `seed` (écran de choix obligatoire). */
  deckChallengeLockedSeed: string | null;
  grid: Cell[];
  turn: number;
  score: number;
  status: GameStatus;
  /** Initialise ou recharge le puzzle pour une date donnée (grille vide, tour 0). */
  loadDay: (dateSeed: string) => void;
  /** Charge le puzzle du jour (date locale du navigateur). */
  loadToday: () => void;
  /** Après rehydratation : aligne la session sur la date du jour sans effacer une partie en cours. */
  syncTodaySession: () => void;
  /** Passe de `ready` à `playing`. */
  beginPlacement: () => void;
  /** Figée la difficulté pour la date courante, puis démarre la partie si besoin. */
  confirmDeckDifficulty: (level: DeckChallengeLevel) => void;
  /** Place le bâtiment courant (`dailySequence[turn]`) sur une case vide. */
  placeBuilding: (cellIndex: number) => void;
  /** Remet la grille à zéro pour la seed courante (même séquence). */
  resetBoard: () => void;
  /** Grille vide + même tirage du jour, puis passage direct en `playing` (tests / nouvelle tentative). */
  restartTodayPuzzle: () => void;
  /** Extrait un snapshot typé (tests, debug). */
  getSnapshot: () => GameState;
};

type PersistedSlice = Pick<
  GameStore,
  | "seed"
  | "dailySequence"
  | "dailyInventory"
  | "deckChallengeLevel"
  | "deckChallengeLockedSeed"
  | "grid"
  | "turn"
  | "score"
  | "status"
>;

/** Verrou **explicitement** persisté pour ce `seed` (pas d’inférence vague ici). */
function explicitDeckLockForSeed(p: Partial<PersistedSlice>, seed: string): string | null {
  if (typeof p.deckChallengeLockedSeed === "string" && p.deckChallengeLockedSeed === seed) {
    return seed;
  }
  return null;
}

function isGameStatus(value: unknown): value is GameStatus {
  return value === "ready" || value === "playing" || value === "finished";
}

function mergePersistedState(
  persisted: unknown,
  current: GameStore,
): GameStore {
  if (!persisted || typeof persisted !== "object") return current;
  const p = persisted as Partial<PersistedSlice>;

  const dailySequence =
    Array.isArray(p.dailySequence) && p.dailySequence.length === 16
      ? (p.dailySequence as BuildingType[])
      : current.dailySequence;

  const grid =
    Array.isArray(p.grid) && p.grid.length === 16
      ? (p.grid as Cell[]).map((c, i) => ({
          index: typeof c?.index === "number" ? c.index : i,
          building: c?.building ?? null,
        }))
      : current.grid;

  const seed = typeof p.seed === "string" ? p.seed : current.seed;
  let status: GameStatus = isGameStatus(p.status) ? p.status : current.status;
  const turn = typeof p.turn === "number" ? p.turn : current.turn;

  const dailyInventory = getDailyStats(dailySequence);
  const deckChallengeLevel = coerceDeckChallengeLevel(p.deckChallengeLevel);
  const progressed = hasMeaningfulGridProgress(grid, turn);

  let deckChallengeLockedSeed = explicitDeckLockForSeed(p, seed);
  if (deckChallengeLockedSeed !== seed && progressed) {
    deckChallengeLockedSeed = seed;
  }
  if (
    deckChallengeLockedSeed === seed &&
    !progressed &&
    (status === "ready" || status === "playing")
  ) {
    deckChallengeLockedSeed = null;
    status = "ready";
  }

  const baseScore = calculateGridScore(grid);
  const score = Math.round(
    baseScore * getDeckScoreMultiplier(deckChallengeLevel),
  );

  return {
    ...current,
    seed,
    dailySequence,
    dailyInventory,
    deckChallengeLevel,
    deckChallengeLockedSeed,
    grid,
    turn,
    score,
    status,
  };
}

const initialSeed = getLocalDateSeed();
const initialSequence = generateDailyBuildingSequence(initialSeed);
const initialInventory = getDailyStats(initialSequence);

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      seed: initialSeed,
      dailySequence: initialSequence,
      dailyInventory: initialInventory,
      deckChallengeLevel: 0,
      deckChallengeLockedSeed: null,
      grid: createEmptyGrid(),
      turn: 0,
      score: 0,
      status: "ready",

      loadDay: (dateSeed) => {
        const dailySequence = generateDailyBuildingSequence(dateSeed);
        const dailyInventory = getDailyStats(dailySequence);
        set({
          seed: dateSeed,
          dailySequence,
          dailyInventory,
          deckChallengeLevel: 0,
          deckChallengeLockedSeed: null,
          grid: createEmptyGrid(),
          turn: 0,
          score: 0,
          status: "ready",
        });
      },

      loadToday: () => {
        get().loadDay(getLocalDateSeed());
      },

      syncTodaySession: () => {
        const today = getLocalDateSeed();
        const { seed } = get();
        if (seed !== today) {
          get().loadDay(today);
        }
        const s = get();
        if (
          s.status === "ready" &&
          s.deckChallengeLockedSeed === s.seed
        ) {
          get().beginPlacement();
        }
      },

      beginPlacement: () => {
        const { status } = get();
        if (status !== "ready") return;
        set({ status: "playing" });
      },

      confirmDeckDifficulty: (level) => {
        const s = get();
        if (s.deckChallengeLockedSeed === s.seed) return;
        const base = calculateGridScore(s.grid);
        set({
          deckChallengeLevel: level,
          deckChallengeLockedSeed: s.seed,
          score: Math.round(base * getDeckScoreMultiplier(level)),
        });
        if (get().status === "ready") {
          get().beginPlacement();
        }
      },

      placeBuilding: (cellIndex) => {
        const state = get();
        if (state.status !== "playing") return;
        if (state.turn >= 16) return;
        if (cellIndex < 0 || cellIndex > 15) return;
        if (state.grid[cellIndex]?.building !== null) return;

        const building = state.dailySequence[state.turn];
        const nextGrid = state.grid.map((cell, i) =>
          i === cellIndex ? { ...cell, building } : cell,
        );
        const nextTurn = state.turn + 1;
        const finished = nextTurn >= 16;
        const base = calculateGridScore(nextGrid);
        const mult = getDeckScoreMultiplier(state.deckChallengeLevel);
        const nextScore = Math.round(base * mult);

        set({
          grid: nextGrid,
          turn: nextTurn,
          score: nextScore,
          status: finished ? "finished" : "playing",
        });

        if (finished) {
          recordGameCompletion({
            score: nextScore,
            deckChallengeLevel: state.deckChallengeLevel,
            puzzleDate: state.seed,
          });
        }
      },

      resetBoard: () => {
        const { seed } = get();
        const dailySequence = generateDailyBuildingSequence(seed);
        const dailyInventory = getDailyStats(dailySequence);
        set({
          dailySequence,
          dailyInventory,
          grid: createEmptyGrid(),
          turn: 0,
          score: 0,
          status: "ready",
        });
      },

      restartTodayPuzzle: () => {
        get().resetBoard();
        get().beginPlacement();
      },

      getSnapshot: () => {
        const s = get();
        return toGameState(s);
      },
    }),
    {
      name: "planet-ponzi-game",
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedSlice => ({
        seed: state.seed,
        dailySequence: state.dailySequence,
        dailyInventory: state.dailyInventory,
        deckChallengeLevel: state.deckChallengeLevel,
        deckChallengeLockedSeed: state.deckChallengeLockedSeed,
        grid: state.grid,
        turn: state.turn,
        score: state.score,
        status: state.status,
      }),
      merge: (persisted, current) =>
        mergePersistedState(persisted, current as GameStore),
      version: 1,
    },
  ),
);
