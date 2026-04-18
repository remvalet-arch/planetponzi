"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  coerceDeckChallengeLevel,
  getDeckScoreMultiplier,
} from "@/src/lib/difficulty";
import { vibratePlaceBuilding } from "@/src/lib/haptics";
import { playPlacementPop } from "@/src/lib/game-sounds";
import { calculateStars, getLevelById } from "@/src/lib/levels";
import {
  applyBuildingToGrid,
  clearBuildingAt,
  evaluateTriggers,
  scoreGridForDeck,
  validatePlacement,
  type GridTemporaryEffect,
} from "@/src/lib/level-run-engine";
import { generatePlacementSequence, getDailyStats } from "@/src/lib/rng";
import { persistLocalStorage } from "@/src/lib/zustand-persist-storage";
import { applyPrestigeToRawScore } from "@/src/lib/prestige";
import { recordGameCompletion } from "@/src/lib/stats";
import { calculateSessionGridScore } from "@/src/lib/session-scoring";
import type {
  ActiveBooster,
  BuildingType,
  Cell,
  DailyInventory,
  DeckChallengeLevel,
  GameState,
  GameStatus,
} from "@/src/types/game";
import { BLACK_MARKET_TILE_COST } from "@/src/lib/black-market";
import {
  buildGridFromObstacles,
  getPlacementLengthFromObstacles,
  mergeGridTerrainWithBuildings,
  normalizePersistedCell,
} from "@/src/lib/grid-terrain";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useProgressStore } from "@/src/store/useProgressStore";

const PLACED_BUILDING_TYPES = new Set<string>([
  "habitacle",
  "eau",
  "serre",
  "mine",
]);

const ALL_BUILDINGS: BuildingType[] = ["habitacle", "eau", "serre", "mine"];

function scoreWithPrestige(raw: number): number {
  return applyPrestigeToRawScore(raw, useProgressStore.getState().prestigeLevel);
}

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

function createDefaultPlayableGrid(): Cell[] {
  return buildGridFromObstacles(undefined);
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
  frozenCellIndices: number[];
}): GameState {
  return {
    levelId: snapshot.levelId,
    seed: snapshot.seed,
    placementSequence: [...snapshot.placementSequence],
    dailyInventory: { ...snapshot.dailyInventory },
    deckChallengeLevel: snapshot.deckChallengeLevel,
    deckChallengeLockedSeed: snapshot.deckChallengeLockedSeed,
    grid: snapshot.grid.map((c) => ({ ...c })),
    turn: snapshot.turn,
    score: snapshot.score,
    status: snapshot.status,
    activeBooster: snapshot.activeBooster,
    frozenCellIndices: [...snapshot.frozenCellIndices],
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
  /** Cases dont la contribution au score est forcée à 0 (boss Contrôle fiscal). */
  frozenCellIndices: number[];
  /** Journal runtime des effets de grille (gel, fusion méga) — non persisté au-delà du merge. */
  gridTemporaryEffects: GridTemporaryEffect[];
  /** Incrémenté à chaque fusion méga pour animer un tremblement de grille. */
  gridShakeNonce: number;
  enterLevel: (levelId: number) => void;
  /** Verrouille le mandat du jour et passe en jeu (deck imposé par la définition Saga). */
  beginPlacement: () => void;
  placeBuilding: (cellIndex: number) => void;
  /** Marché noir : −200 💰 et remplace la prochaine tuile (`placementSequence[turn]`). Retourne `false` si refusé. */
  purchaseBlackMarketTile: (building: BuildingType) => boolean;
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
  | "frozenCellIndices"
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

  const def = getLevelById(typeof p.levelId === "number" ? p.levelId : current.levelId);
  const expectedLen = def ? getPlacementLengthFromObstacles(def.obstacles) : 16;

  const placementSequenceRaw = p.placementSequence ?? p.dailySequence;
  let placementSequence =
    Array.isArray(placementSequenceRaw) && placementSequenceRaw.length === expectedLen
      ? (placementSequenceRaw as BuildingType[])
      : current.placementSequence;

  const seed = typeof p.seed === "string" ? p.seed : current.seed;
  const levelId = typeof p.levelId === "number" && Number.isFinite(p.levelId) ? p.levelId : current.levelId;

  if (def && placementSequence.length !== expectedLen) {
    placementSequence = generatePlacementSequence(seed, expectedLen);
  }

  let grid: Cell[];
  if (def) {
    const template = buildGridFromObstacles(def.obstacles);
    grid = mergeGridTerrainWithBuildings(
      template,
      Array.isArray(p.grid) && p.grid.length === 16 ? (p.grid as Cell[]) : undefined,
    );
  } else if (Array.isArray(p.grid) && p.grid.length === 16) {
    grid = (p.grid as Cell[]).map((c, i) => normalizePersistedCell(c, i));
  } else {
    grid = current.grid;
  }

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

  const frozenCellIndices = Array.isArray(p.frozenCellIndices)
    ? (p.frozenCellIndices as unknown[]).filter(
        (i): i is number => typeof i === "number" && Number.isInteger(i) && i >= 0 && i <= 15,
      )
    : [];

  const baseScore = calculateSessionGridScore(grid, frozenCellIndices);
  const rawScore = Math.round(baseScore * getDeckScoreMultiplier(deckChallengeLevel));
  const score = scoreWithPrestige(rawScore);

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
    frozenCellIndices,
    activeBooster: null,
    demolishFlash: null,
    demolishNonce: current.demolishNonce,
    spyPreviewTurnsRemaining: 0,
    gridTemporaryEffects: [],
    gridShakeNonce: 0,
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
  | "frozenCellIndices"
  | "gridTemporaryEffects"
  | "gridShakeNonce"
> = {
  levelId: 0,
  seed: "",
  placementSequence: [],
  dailyInventory: { habitacle: 0, eau: 0, serre: 0, mine: 0 },
  deckChallengeLevel: 0,
  deckChallengeLockedSeed: null,
  grid: createDefaultPlayableGrid(),
  turn: 0,
  score: 0,
  status: "ready",
  activeBooster: null,
  demolishFlash: null,
  demolishNonce: 0,
  spyPreviewTurnsRemaining: 0,
  frozenCellIndices: [],
  gridTemporaryEffects: [],
  gridShakeNonce: 0,
};

export const useLevelRunStore = create<LevelRunStore>()(
  persist(
    (set, get) => ({
      ...emptyRun,

      enterLevel: (levelId) => {
        const def = getLevelById(levelId);
        if (!def) return;

        const placementLen = getPlacementLengthFromObstacles(def.obstacles);
        const placementSequence = generatePlacementSequence(def.seed, placementLen);
        const dailyInventory = getDailyStats(placementSequence);
        const deckChallengeLevel = def.deckChallengeLevel ?? 0;

        set({
          levelId,
          seed: def.seed,
          placementSequence,
          dailyInventory,
          deckChallengeLevel,
          deckChallengeLockedSeed: null,
          grid: buildGridFromObstacles(def.obstacles),
          turn: 0,
          score: 0,
          status: "ready",
          activeBooster: null,
          demolishFlash: null,
          demolishNonce: 0,
          spyPreviewTurnsRemaining: 0,
          frozenCellIndices: [],
          gridTemporaryEffects: [],
          gridShakeNonce: 0,
        });
      },

      beginPlacement: () => {
        const s = get();
        if (s.status !== "ready") return;
        if (s.deckChallengeLockedSeed === s.seed) return;
        const base = calculateSessionGridScore(s.grid, s.frozenCellIndices);
        const raw = Math.round(base * getDeckScoreMultiplier(s.deckChallengeLevel));
        set({
          deckChallengeLockedSeed: s.seed,
          status: "playing",
          score: scoreWithPrestige(raw),
        });
      },

      toggleBooster: (type) => {
        if (type !== "demolition") return;
        const s = get();
        if (s.status !== "playing") return;
        if (s.turn >= s.placementSequence.length) return;
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
        if (s.turn >= s.placementSequence.length) return;
        const stock = useProgressStore.getState().boosters.spy;
        if (stock <= 0) return;
        useProgressStore.getState().consumeBooster("spy");
        set({ spyPreviewTurnsRemaining: 3 });
      },

      activateLobbyingBooster: () => {
        const s = get();
        if (s.status !== "playing") return;
        if (s.turn >= s.placementSequence.length) return;
        if (s.placementSequence.length < 1) return;
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
        const placementSlice = {
          status: state.status,
          turn: state.turn,
          grid: state.grid,
          placementSequence: state.placementSequence,
          activeBooster: state.activeBooster,
        };
        const verdict = validatePlacement(placementSlice, cellIndex);
        if (!verdict.ok) return;

        if (verdict.mode === "demolition") {
          const stock = useProgressStore.getState().boosters.demolition;
          if (stock <= 0) {
            set({ activeBooster: null });
            return;
          }

          useProgressStore.getState().consumeBooster("demolition");

          const nextGrid = clearBuildingAt(state.grid, verdict.cellIndex);
          const mult = getDeckScoreMultiplier(state.deckChallengeLevel);
          const rawScore = scoreGridForDeck(nextGrid, state.frozenCellIndices, mult);
          const nextScore = scoreWithPrestige(rawScore);
          const nonce = state.demolishNonce + 1;

          vibratePlaceBuilding();
          playPlacementPop();

          set({
            grid: nextGrid,
            score: nextScore,
            activeBooster: null,
            demolishFlash: { index: verdict.cellIndex, nonce },
            demolishNonce: nonce,
          });

          window.setTimeout(() => {
            useLevelRunStore.setState((inner) =>
              inner.demolishFlash?.index === verdict.cellIndex && inner.demolishFlash?.nonce === nonce
                ? { demolishFlash: null }
                : {},
            );
          }, 480);
          return;
        }

        const gridBeforePlacement = state.grid;
        const nextGrid = applyBuildingToGrid(gridBeforePlacement, verdict.cellIndex, verdict.building);
        const nextTurn = state.turn + 1;
        const maxTurn = state.placementSequence.length;
        const finished = nextTurn >= maxTurn;

        const levelDef = getLevelById(state.levelId);
        const triggerOut = evaluateTriggers({
          levelId: state.levelId,
          gridBeforePlacement,
          gridAfterPlacement: nextGrid,
          newTurn: nextTurn,
          frozenCellIndices: state.frozenCellIndices,
          maxTurn,
          cargoSeed: state.seed,
          seismicRift: levelDef?.seismicRift,
        });

        const mult = getDeckScoreMultiplier(state.deckChallengeLevel);
        const finalGrid = triggerOut.postAleasGrid;
        const rawScore = scoreGridForDeck(finalGrid, triggerOut.nextFrozenCellIndices, mult);
        const nextScore = scoreWithPrestige(rawScore);
        const spyRem =
          state.spyPreviewTurnsRemaining > 0 ? state.spyPreviewTurnsRemaining - 1 : 0;

        const mergedEffects = [...state.gridTemporaryEffects, ...triggerOut.newTemporaryEffects].slice(
          -64,
        );
        const nextShake = triggerOut.gridShake ? state.gridShakeNonce + 1 : state.gridShakeNonce;

        vibratePlaceBuilding();
        playPlacementPop();

        set({
          grid: finalGrid,
          turn: nextTurn,
          score: nextScore,
          status: finished ? "finished" : "playing",
          activeBooster: null,
          spyPreviewTurnsRemaining: spyRem,
          frozenCellIndices: triggerOut.nextFrozenCellIndices,
          gridTemporaryEffects: mergedEffects,
          gridShakeNonce: nextShake,
        });

        if (finished && state.levelId > 0) {
          const stars = calculateStars(nextScore, state.levelId, finalGrid);
          useProgressStore.getState().commitLevelResult(state.levelId, stars, nextScore);
          if (stars > 1) {
            useEconomyStore.getState().addCoins(stars * 10);
          } else {
            useEconomyStore.getState().consumeLife();
          }
          recordGameCompletion({
            score: nextScore,
            deckChallengeLevel: state.deckChallengeLevel,
            levelId: state.levelId,
            grid: finalGrid,
            placementSequence: state.placementSequence,
            seed: state.seed,
          });
        }
      },

      purchaseBlackMarketTile: (building) => {
        const s = get();
        if (s.status !== "playing") return false;
        if (s.turn >= s.placementSequence.length) return false;
        if (s.placementSequence.length < 1) return false;
        if (!useEconomyStore.getState().spendCoins(BLACK_MARKET_TILE_COST)) return false;
        const seq = [...s.placementSequence];
        seq[s.turn] = building;
        const dailyInventory = getDailyStats(seq);
        set({ placementSequence: seq, dailyInventory });
        return true;
      },

      resetBoard: () => {
        const { seed, levelId } = get();
        const def = getLevelById(levelId);
        const cargoSeed = def?.seed ?? seed;
        if (!cargoSeed) return;
        const placementLen = def ? getPlacementLengthFromObstacles(def.obstacles) : 16;
        const placementSequence = generatePlacementSequence(cargoSeed, placementLen);
        const dailyInventory = getDailyStats(placementSequence);
        const deckChallengeLevel = def?.deckChallengeLevel ?? get().deckChallengeLevel;
        set({
          placementSequence,
          dailyInventory,
          deckChallengeLevel,
          grid: def ? buildGridFromObstacles(def.obstacles) : createDefaultPlayableGrid(),
          turn: 0,
          score: 0,
          status: "ready",
          deckChallengeLockedSeed: null,
          activeBooster: null,
          demolishFlash: null,
          demolishNonce: 0,
          spyPreviewTurnsRemaining: 0,
          frozenCellIndices: [],
          gridTemporaryEffects: [],
          gridShakeNonce: 0,
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
          frozenCellIndices: s.frozenCellIndices,
        });
      },
    }),
    {
      name: "planet-ponzi-level-run",
      storage: persistLocalStorage,
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
        frozenCellIndices: state.frozenCellIndices,
      }),
      merge: (persisted, current) => mergePersistedState(persisted, current as LevelRunStore),
      version: 1,
    },
  ),
);
