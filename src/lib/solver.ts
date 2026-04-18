import { resolveSeismicTargetIndex } from "@/src/lib/aleas";
import { getDeckScoreMultiplier } from "@/src/lib/difficulty";
import { buildGridFromObstacles, getPlacementLengthFromObstacles } from "@/src/lib/grid-terrain";
import { clearBuildingAt } from "@/src/lib/level-run-engine";
import { generatePlacementSequence } from "@/src/lib/rng";
import { calculateGridScore } from "@/src/lib/scoring";
import type { BuildingType, Cell, DeckChallengeLevel, ObstacleSpec } from "@/src/types/game";

const scoreCache = new Map<string, number>();

export type SeismicRiftSolverSpec = {
  triggerAtTurn: number;
  targetCellIndex?: number;
};

export type SolverLevelContext = {
  obstacles?: readonly ObstacleSpec[];
  /** Nombre de placements ; défaut = cases jouables dérivées des obstacles. */
  placementCount?: number;
  seismicRift?: SeismicRiftSolverSpec;
  /** Requis si faille sismique. */
  cargoSeed?: string;
};

function cacheKey(cargoSeed: string, deckChallengeLevel: DeckChallengeLevel, ctx: SolverLevelContext): string {
  return `${cargoSeed}\0${deckChallengeLevel}\0${JSON.stringify(ctx)}`;
}

function cloneGrid(grid: Cell[]): Cell[] {
  return grid.map((c) => ({ ...c }));
}

function totalRoiScore(grid: Cell[], mult: number): number {
  return Math.round(calculateGridScore(grid) * mult);
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

  for (let turn = 0; turn < placementCount; turn++) {
    const building = sequence[turn]!;
    const candidates: number[] = [];
    for (let i = 0; i < 16; i++) {
      if (grid[i]?.isPlayable && grid[i]!.building === null) candidates.push(i);
    }
    if (!candidates.length) break;

    let bestIdx = candidates[0]!;
    let best = Number.NEGATIVE_INFINITY;
    for (const idx of candidates) {
      const trial = cloneGrid(grid);
      trial[idx] = { ...trial[idx]!, building };
      const s = totalRoiScore(trial, mult) + tieNoise(idx) * 0.001;
      if (s > best) {
        best = s;
        bestIdx = idx;
      }
    }
    grid[bestIdx] = { ...grid[bestIdx]!, building };

    if (seismic && cargoSeed && turn + 1 === seismic.triggerAtTurn) {
      const t = resolveSeismicTargetIndex(grid, cargoSeed, seismic.targetCellIndex);
      if (t != null) {
        const cleared = clearBuildingAt(grid, t);
        for (let i = 0; i < 16; i++) grid[i] = cleared[i]!;
      }
    }
  }
  return totalRoiScore(grid, mult);
}

/**
 * Estime un score maximal plausible (glouton × 100 essais, cache par seed + deck + terrain).
 */
export function estimateMaxScore(
  cargoSeed: string,
  deckChallengeLevel: DeckChallengeLevel,
  ctx: SolverLevelContext = {},
): number {
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
