"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  coerceDeckChallengeLevel,
  getDeckScoreMultiplier,
} from "@/src/lib/difficulty";
import { vibratePlaceBuilding } from "@/src/lib/haptics";
import { getLevelById } from "@/src/lib/levels";
import { generatePlacementSequence, getDailyStats } from "@/src/lib/rng";
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
  levelId: number;
  seed: string;
  placementSequence: BuildingType[];
  dailyInventory: DailyInventory;
  deckChallengeLevel: DeckChallengeLevel;
  deckChallengeLockedSeed: string | null;
  grid: Cell[];
  turn: number;
  score: number;
  status: GameStatus;
}): GameState {
  return {
    levelId: snapshot.levelId,
    seed: snapshot.seed,
    placementSequence: [...snapshot.placementSequence],
    dailyInventory: { ...snapshot.dailyInventory },
    deckChallengeLevel: snapshot.deckChallengeLevel,
    deckChallengeLockedSeed: snapshot.deckChallengeLockedSeed,
    grid: snapshot.grid.map((c) => ({ ...c, building: c.building })),
    turn: snapshot.turn,
    score: snapshot.score,
    status: snapshot.status,
  };
}

export type LevelRunStore = {
  levelId: number;
  seed: string;
  placementSequence: BuildingType[];
  dailyInventory: DailyInventory;
  deckChallengeLevel: DeckChallengeLevel;
  deckChallengeLockedSeed: string | null;
  grid: Cell[];
  turn: number;
  score: number;
  status: GameStatus;
  enterLevel: (levelId: number) => void;
  beginPlacement: () => void;
  confirmDeckDifficulty: (level: DeckChallengeLevel) => void;
  placeBuilding: (cellIndex: number) => void;
  resetBoard: () => void;
  restartCurrentLevel: () => void;
  getSnapshot: () => GameState;
};

type PersistedSlice = Pick<
  LevelRunStore,
  | "levelId"
  | "seed"
  | "placementSequence"
  | "dailyInventory"
  | "deckChallengeLevel"
  | "deckChallengeLockedSeed"
  | "grid"
  | "turn"
  | "score"
  | "status"
>;

function explicitDeckLockForSeed(p: Partial<PersistedSlice>, seed: string): string | null {
  if (typeof p.deckChallengeLockedSeed === "string" && p.deckChallengeLockedSeed === seed) {
    return seed;
  }
  return null;
}

function isGameStatus(value: unknown): value is GameStatus {
  return value === "ready" || value === "playing" || value === "finished";
}

function mergePersistedState(persisted: unknown, current: LevelRunStore): LevelRunStore {
  if (!persisted || typeof persisted !== "object") return current;
  const p = persisted as Partial<PersistedSlice> & { dailySequence?: BuildingType[] };

  const placementSequenceRaw = p.placementSequence ?? p.dailySequence;
  const placementSequence =
    Array.isArray(placementSequenceRaw) && placementSequenceRaw.length === 16
      ? (placementSequenceRaw as BuildingType[])
      : current.placementSequence;

  const grid =
    Array.isArray(p.grid) && p.grid.length === 16
      ? (p.grid as Cell[]).map((c, i) => ({
          index: typeof c?.index === "number" ? c.index : i,
          building: c?.building ?? null,
        }))
      : current.grid;

  const seed = typeof p.seed === "string" ? p.seed : current.seed;
  const levelId = typeof p.levelId === "number" && Number.isFinite(p.levelId) ? p.levelId : current.levelId;

  let status: GameStatus = isGameStatus(p.status) ? p.status : current.status;
  const turn = typeof p.turn === "number" ? p.turn : current.turn;

  const dailyInventory = getDailyStats(placementSequence);
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
  const score = Math.round(baseScore * getDeckScoreMultiplier(deckChallengeLevel));

  return {
    ...current,
    levelId,
    seed,
    placementSequence,
    dailyInventory,
    deckChallengeLevel,
    deckChallengeLockedSeed,
    grid,
    turn,
    score,
    status,
  };
}

const emptyRun: Pick<
  LevelRunStore,
  | "levelId"
  | "seed"
  | "placementSequence"
  | "dailyInventory"
  | "deckChallengeLevel"
  | "deckChallengeLockedSeed"
  | "grid"
  | "turn"
  | "score"
  | "status"
> = {
  levelId: 0,
  seed: "",
  placementSequence: [],
  dailyInventory: { habitacle: 0, eau: 0, serre: 0, mine: 0 },
  deckChallengeLevel: 0,
  deckChallengeLockedSeed: null,
  grid: createEmptyGrid(),
  turn: 0,
  score: 0,
  status: "ready",
};

export const useLevelRunStore = create<LevelRunStore>()(
  persist(
    (set, get) => ({
      ...emptyRun,

      enterLevel: (levelId) => {
        const def = getLevelById(levelId);
        if (!def) return;

        const placementSequence = generatePlacementSequence(def.seed);
        const dailyInventory = getDailyStats(placementSequence);
        const deckChallengeLevel = def.deckChallengeLevel ?? 0;
        const autoStart = deckChallengeLevel === 0;

        set({
          levelId,
          seed: def.seed,
          placementSequence,
          dailyInventory,
          deckChallengeLevel,
          deckChallengeLockedSeed: autoStart ? def.seed : null,
          grid: createEmptyGrid(),
          turn: 0,
          score: 0,
          status: autoStart ? "playing" : "ready",
        });

        if (autoStart) {
          const base = calculateGridScore(get().grid);
          set({
            score: Math.round(base * getDeckScoreMultiplier(deckChallengeLevel)),
          });
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
        if (state.placementSequence.length !== 16) return;

        const building = state.placementSequence[state.turn];
        const nextGrid = state.grid.map((cell, i) =>
          i === cellIndex ? { ...cell, building } : cell,
        );
        const nextTurn = state.turn + 1;
        const finished = nextTurn >= 16;
        const base = calculateGridScore(nextGrid);
        const mult = getDeckScoreMultiplier(state.deckChallengeLevel);
        const nextScore = Math.round(base * mult);

        vibratePlaceBuilding();

        set({
          grid: nextGrid,
          turn: nextTurn,
          score: nextScore,
          status: finished ? "finished" : "playing",
        });

        if (finished && state.levelId > 0) {
          recordGameCompletion({
            score: nextScore,
            deckChallengeLevel: state.deckChallengeLevel,
            levelId: state.levelId,
          });
        }
      },

      resetBoard: () => {
        const { seed, levelId } = get();
        const def = getLevelById(levelId);
        const cargoSeed = def?.seed ?? seed;
        if (!cargoSeed) return;
        const placementSequence = generatePlacementSequence(cargoSeed);
        const dailyInventory = getDailyStats(placementSequence);
        set({
          placementSequence,
          dailyInventory,
          grid: createEmptyGrid(),
          turn: 0,
          score: 0,
          status: "ready",
          deckChallengeLockedSeed: null,
        });
      },

      restartCurrentLevel: () => {
        get().resetBoard();
        const s = get();
        const autoStart = s.deckChallengeLevel === 0;
        if (autoStart) {
          set({
            deckChallengeLockedSeed: s.seed,
            status: "playing",
            score: Math.round(calculateGridScore(s.grid) * getDeckScoreMultiplier(s.deckChallengeLevel)),
          });
        } else {
          set({ deckChallengeLockedSeed: null, status: "ready", score: 0 });
        }
      },

      getSnapshot: () => {
        const s = get();
        return toGameState(s);
      },
    }),
    {
      name: "planet-ponzi-level-run",
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedSlice => ({
        levelId: state.levelId,
        seed: state.seed,
        placementSequence: state.placementSequence,
        dailyInventory: state.dailyInventory,
        deckChallengeLevel: state.deckChallengeLevel,
        deckChallengeLockedSeed: state.deckChallengeLockedSeed,
        grid: state.grid,
        turn: state.turn,
        score: state.score,
        status: state.status,
      }),
      merge: (persisted, current) => mergePersistedState(persisted, current as LevelRunStore),
      version: 1,
    },
  ),
);
