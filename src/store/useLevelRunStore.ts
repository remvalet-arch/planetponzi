"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  coerceDeckChallengeLevel,
  getDeckScoreMultiplier,
} from "@/src/lib/difficulty";
import { vibratePlaceBuilding } from "@/src/lib/haptics";
import { calculateStars, getLevelById } from "@/src/lib/levels";
import { generatePlacementSequence, getDailyStats } from "@/src/lib/rng";
import { calculateGridScore } from "@/src/lib/scoring";
import { recordGameCompletion } from "@/src/lib/stats";
import type {
  ActiveBooster,
  BuildingType,
  Cell,
  DailyInventory,
  DeckChallengeLevel,
  GameState,
  GameStatus,
} from "@/src/types/game";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useProgressStore } from "@/src/store/useProgressStore";

const PLACED_BUILDING_TYPES = new Set<string>([
  "habitacle",
  "eau",
  "serre",
  "mine",
]);

const ALL_BUILDINGS: BuildingType[] = ["habitacle", "eau", "serre", "mine"];

function randomBuildingDifferentFrom(exclude: BuildingType): BuildingType {
  const pool = ALL_BUILDINGS.filter((t) => t !== exclude);
  const pick = pool.length ? pool : ALL_BUILDINGS;
  return pick[Math.floor(Math.random() * pick.length)]!;
}

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
  activeBooster: ActiveBooster | null;
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
    activeBooster: snapshot.activeBooster,
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
  activeBooster: ActiveBooster | null;
  /** Feedback court après démolition (case vide qui clignote). */
  demolishFlash: { index: number; nonce: number } | null;
  /** Compteur monotone pour animer chaque démolition distinctement. */
  demolishNonce: number;
  /** Tours restants avec aperçu 4 pièces (espion). */
  spyPreviewTurnsRemaining: number;
  enterLevel: (levelId: number) => void;
  /** Verrouille le mandat du jour et passe en jeu (deck imposé par la définition Saga). */
  beginPlacement: () => void;
  placeBuilding: (cellIndex: number) => void;
  toggleBooster: (type: ActiveBooster) => void;
  activateSpyBooster: () => void;
  activateLobbyingBooster: () => void;
  resetBoard: () => void;
  restartCurrentLevel: () => void;
  /** Abandon en cours de partie : −1 vie, reset mandat. Retourne `true` si une partie était en cours. */
  quitGame: () => boolean;
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
    activeBooster: null,
    demolishFlash: null,
    demolishNonce: current.demolishNonce,
    spyPreviewTurnsRemaining: 0,
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
  | "activeBooster"
  | "demolishFlash"
  | "demolishNonce"
  | "spyPreviewTurnsRemaining"
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
  activeBooster: null,
  demolishFlash: null,
  demolishNonce: 0,
  spyPreviewTurnsRemaining: 0,
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

        set({
          levelId,
          seed: def.seed,
          placementSequence,
          dailyInventory,
          deckChallengeLevel,
          deckChallengeLockedSeed: null,
          grid: createEmptyGrid(),
          turn: 0,
          score: 0,
          status: "ready",
          activeBooster: null,
          demolishFlash: null,
          demolishNonce: 0,
          spyPreviewTurnsRemaining: 0,
        });
      },

      beginPlacement: () => {
        const s = get();
        if (s.status !== "ready") return;
        if (s.deckChallengeLockedSeed === s.seed) return;
        const base = calculateGridScore(s.grid);
        set({
          deckChallengeLockedSeed: s.seed,
          status: "playing",
          score: Math.round(base * getDeckScoreMultiplier(s.deckChallengeLevel)),
        });
      },

      toggleBooster: (type) => {
        if (type !== "demolition") return;
        const s = get();
        if (s.status !== "playing") return;
        if (s.turn >= 16) return;
        if (s.activeBooster === "demolition") {
          set({ activeBooster: null });
          return;
        }
        const n = useProgressStore.getState().boosters.demolition;
        if (n <= 0) return;
        set({ activeBooster: "demolition" });
      },

      activateSpyBooster: () => {
        const s = get();
        if (s.status !== "playing") return;
        if (s.turn >= 16) return;
        const stock = useProgressStore.getState().boosters.spy;
        if (stock <= 0) return;
        useProgressStore.getState().consumeBooster("spy");
        set({ spyPreviewTurnsRemaining: 3 });
      },

      activateLobbyingBooster: () => {
        const s = get();
        if (s.status !== "playing") return;
        if (s.turn >= 16) return;
        if (s.placementSequence.length !== 16) return;
        const stock = useProgressStore.getState().boosters.lobbying;
        if (stock <= 0) return;
        const cur = s.placementSequence[s.turn];
        const nextType = randomBuildingDifferentFrom(cur);
        const seq = [...s.placementSequence];
        seq[s.turn] = nextType;
        const dailyInventory = getDailyStats(seq);
        useProgressStore.getState().consumeBooster("lobbying");
        set({ placementSequence: seq, dailyInventory });
      },

      placeBuilding: (cellIndex) => {
        const state = get();
        if (state.status !== "playing") return;
        if (cellIndex < 0 || cellIndex > 15) return;

        if (state.activeBooster === "demolition") {
          if (state.turn >= 16) return;
          const cell = state.grid[cellIndex];
          if (!cell || cell.building === null) return;

          const stock = useProgressStore.getState().boosters.demolition;
          if (stock <= 0) {
            set({ activeBooster: null });
            return;
          }

          useProgressStore.getState().consumeBooster("demolition");

          const nextGrid = state.grid.map((c, i) =>
            i === cellIndex ? { ...c, building: null } : c,
          );
          const base = calculateGridScore(nextGrid);
          const mult = getDeckScoreMultiplier(state.deckChallengeLevel);
          const nextScore = Math.round(base * mult);
          const nonce = state.demolishNonce + 1;

          vibratePlaceBuilding();

          set({
            grid: nextGrid,
            score: nextScore,
            activeBooster: null,
            demolishFlash: { index: cellIndex, nonce },
            demolishNonce: nonce,
          });

          window.setTimeout(() => {
            useLevelRunStore.setState((inner) =>
              inner.demolishFlash?.index === cellIndex && inner.demolishFlash?.nonce === nonce
                ? { demolishFlash: null }
                : {},
            );
          }, 480);
          return;
        }

        if (state.turn >= 16) return;
        if (state.grid[cellIndex]?.building !== null) return;
        if (state.placementSequence.length !== 16) return;

        const building = state.placementSequence[state.turn];
        const nextGrid = state.grid.map((c, i) =>
          i === cellIndex ? { ...c, building } : c,
        );
        const nextTurn = state.turn + 1;
        const finished = nextTurn >= 16;
        const base = calculateGridScore(nextGrid);
        const mult = getDeckScoreMultiplier(state.deckChallengeLevel);
        const nextScore = Math.round(base * mult);
        const spyRem =
          state.spyPreviewTurnsRemaining > 0 ? state.spyPreviewTurnsRemaining - 1 : 0;

        vibratePlaceBuilding();

        set({
          grid: nextGrid,
          turn: nextTurn,
          score: nextScore,
          status: finished ? "finished" : "playing",
          activeBooster: null,
          spyPreviewTurnsRemaining: spyRem,
        });

        if (finished && state.levelId > 0) {
          const stars = calculateStars(nextScore, state.levelId);
          useProgressStore.getState().commitLevelResult(state.levelId, stars, nextScore);
          if (stars > 0) {
            useEconomyStore.getState().addCoins(stars * 10);
          } else {
            useEconomyStore.getState().consumeLife();
          }
          recordGameCompletion({
            score: nextScore,
            deckChallengeLevel: state.deckChallengeLevel,
            levelId: state.levelId,
            grid: nextGrid,
            placementSequence: state.placementSequence,
            seed: state.seed,
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
        const deckChallengeLevel = def?.deckChallengeLevel ?? get().deckChallengeLevel;
        set({
          placementSequence,
          dailyInventory,
          deckChallengeLevel,
          grid: createEmptyGrid(),
          turn: 0,
          score: 0,
          status: "ready",
          deckChallengeLockedSeed: null,
          activeBooster: null,
          demolishFlash: null,
          demolishNonce: 0,
          spyPreviewTurnsRemaining: 0,
        });
      },

      restartCurrentLevel: () => {
        get().resetBoard();
      },

      quitGame: () => {
        const s = get();
        if (s.status !== "playing") return false;
        useEconomyStore.getState().consumeLife();
        get().resetBoard();
        return true;
      },

      getSnapshot: () => {
        const s = get();
        return toGameState({
          levelId: s.levelId,
          seed: s.seed,
          placementSequence: s.placementSequence,
          dailyInventory: s.dailyInventory,
          deckChallengeLevel: s.deckChallengeLevel,
          deckChallengeLockedSeed: s.deckChallengeLockedSeed,
          grid: s.grid,
          turn: s.turn,
          score: s.score,
          status: s.status,
          activeBooster: s.activeBooster,
        });
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
