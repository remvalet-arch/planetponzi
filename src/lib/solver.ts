import { resolveSeismicTargetIndex } from "@/src/lib/aleas";
import { getDeckScoreMultiplier } from "@/src/lib/difficulty";
import { buildGridFromObstacles, getPlacementLengthFromObstacles } from "@/src/lib/grid-terrain";
import {
  clearBuildingAt,
  isFiscalBossLevel,
  pickFiscalFreezeTarget,
} from "@/src/lib/level-run-engine";
import { generatePlacementSequence } from "@/src/lib/rng";
import { calculateSessionGridScore } from "@/src/lib/session-scoring";
import type { BuildingType, Cell, DeckChallengeLevel, ObstacleSpec } from "@/src/types/game";

const scoreCache = new Map<string, number>();

export type SeismicRiftSolverSpec = {
  triggerAtTurn: number;
  targetCellIndex?: number;
};

export type SolverLevelContext = {
  /** Niveau courant (mandats boss ×10 → simulation gel fiscal). */
  levelId: number;
  obstacles?: readonly ObstacleSpec[];
  /** Nombre de placements ; défaut = cases jouables dérivées des obstacles. */
  placementCount?: number;
  seismicRift?: SeismicRiftSolverSpec;
  /** Requis si faille sismique. */
  cargoSeed?: string;
  /** Bonus Tour Ponzi : +N par mine (hors méga 2×2 — aligné sur `session-scoring`). */
  mineScoreBonusPerMine?: number;
};

function cacheKey(cargoSeed: string, deckChallengeLevel: DeckChallengeLevel, ctx: SolverLevelContext): string {
  const lid = ctx.levelId ?? 0;
  return `${cargoSeed}\0${deckChallengeLevel}\0${lid}\0${JSON.stringify(ctx)}`;
}

function cloneGrid(grid: Cell[]): Cell[] {
  return grid.map((c) => ({ ...c }));
}

function sessionRoiScore(
  grid: Cell[],
  mult: number,
  frozenCellIndices: readonly number[],
  mineScoreBonusPerMine: number,
): number {
  return Math.round(calculateSessionGridScore(grid, frozenCellIndices, mineScoreBonusPerMine) * mult);
}

function greedyPlaythrough(
  sequence: BuildingType[],
  mult: number,
  tieNoise: (i: number) => number,
  initialGrid: Cell[],
  ctx: SolverLevelContext,
): number {
  const grid = cloneGrid(initialGrid);
  const placementCount = sequence.length;
  const cargoSeed = ctx.cargoSeed ?? "";
  const seismic = ctx.seismicRift;
  const mineBonus = ctx.mineScoreBonusPerMine ?? 0;
  const levelId = ctx.levelId ?? 0;
  const frozen = new Set<number>();

  for (let turn = 0; turn < placementCount; turn++) {
    const building = sequence[turn]!;
    const candidates: number[] = [];
    for (let i = 0; i < 16; i++) {
      if (grid[i]?.isPlayable && grid[i]!.building === null) candidates.push(i);
    }
    if (!candidates.length) break;

    const frozenArr = (): number[] => Array.from(frozen);

    let bestIdx = candidates[0]!;
    let best = Number.NEGATIVE_INFINITY;
    for (const idx of candidates) {
      const trial = cloneGrid(grid);
      trial[idx] = { ...trial[idx]!, building };
      const s = sessionRoiScore(trial, mult, frozenArr(), mineBonus) + tieNoise(idx) * 0.001;
      if (s > best) {
        best = s;
        bestIdx = idx;
      }
    }
    grid[bestIdx] = { ...grid[bestIdx]!, building };

    const newTurn = turn + 1;
    if (
      isFiscalBossLevel(levelId) &&
      newTurn > 0 &&
      newTurn <= placementCount &&
      newTurn % 4 === 0
    ) {
      const pick = pickFiscalFreezeTarget(grid, frozenArr(), mineBonus);
      if (pick != null && !frozen.has(pick)) {
        frozen.add(pick);
      }
    }

    if (seismic && cargoSeed && newTurn === seismic.triggerAtTurn) {
      const t = resolveSeismicTargetIndex(grid, cargoSeed, seismic.targetCellIndex);
      if (t != null) {
        const cleared = clearBuildingAt(grid, t);
        for (let i = 0; i < 16; i++) grid[i] = cleared[i]!;
      }
    }
  }
  return sessionRoiScore(grid, mult, Array.from(frozen), mineBonus);
}

/**
 * Estime un score maximal plausible (glouton × 100 essais, cache par seed + deck + terrain).
 */
export function estimateMaxScore(
  cargoSeed: string,
  deckChallengeLevel: DeckChallengeLevel,
  rawCtx: Partial<SolverLevelContext> = {},
): number {
  const ctx: SolverLevelContext = {
    ...rawCtx,
    levelId: rawCtx.levelId ?? 0,
  };
  const key = cacheKey(cargoSeed, deckChallengeLevel, ctx);
  const hit = scoreCache.get(key);
  if (hit !== undefined) return hit;

  const placementCount = ctx.placementCount ?? getPlacementLengthFromObstacles(ctx.obstacles);
  const sequence = generatePlacementSequence(cargoSeed, placementCount);
  const initialGrid = buildGridFromObstacles(ctx.obstacles);

  const mult = getDeckScoreMultiplier(deckChallengeLevel);
  let best = 0;

  const solverCtx: SolverLevelContext = {
    ...ctx,
    placementCount,
    cargoSeed: ctx.cargoSeed ?? cargoSeed,
  };

  for (let iter = 0; iter < 100; iter++) {
    const noise = (idx: number) => ((iter * 31 + idx * 17) % 997) / 997;
    const score = greedyPlaythrough(sequence, mult, noise, initialGrid, solverCtx);
    if (score > best) best = score;
  }

  scoreCache.set(key, best);
  return best;
}
