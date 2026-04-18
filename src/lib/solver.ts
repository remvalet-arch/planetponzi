import { resolveSeismicTargetIndex } from "@/src/lib/aleas";
import { getDeckScoreMultiplier } from "@/src/lib/difficulty";
import {
  isIsolatedForBuilding,
  maxAlignedRunLength,
  placementTouchesSameBuilding,
} from "@/src/lib/grid-topology";
import { buildGridFromObstacles, getPlacementLengthFromObstacles } from "@/src/lib/grid-terrain";
import {
  clearBuildingAt,
  isFiscalBossLevel,
  pickFiscalFreezeTarget,
} from "@/src/lib/level-run-engine";
import { generatePlacementSequence } from "@/src/lib/rng";
import { calculateSessionGridScore } from "@/src/lib/session-scoring";
import type {
  BuildingType,
  Cell,
  DeckChallengeLevel,
  ObstacleSpec,
  WinCondition,
} from "@/src/types/game";

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
  /** Mandat grille (isolation / alignement) — pris en compte par le glouton et les seuils. */
  winCondition?: WinCondition;
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

function hasIsolatedRuleFor(wc: WinCondition | undefined, building: BuildingType): boolean {
  return (wc?.spatialRules ?? []).some((r) => r.kind === "isolated" && r.building === building);
}

function filterCandidatesIsolated(
  candidates: number[],
  grid: Cell[],
  building: BuildingType,
  wc: WinCondition | undefined,
): number[] {
  if (!hasIsolatedRuleFor(wc, building)) return candidates;
  const filtered = candidates.filter((idx) => !placementTouchesSameBuilding(grid, idx, building));
  return filtered.length ? filtered : candidates;
}

/** Heuristique : favoriser les coups qui allongent l’alignement du type concerné. */
function alignedPlacementHeuristic(
  trial: Cell[],
  placedBuilding: BuildingType,
  wc: WinCondition | undefined,
): number {
  let bonus = 0;
  for (const r of wc?.spatialRules ?? []) {
    if (r.kind !== "aligned" || r.building !== placedBuilding) continue;
    const len = maxAlignedRunLength(trial, placedBuilding);
    if (len >= r.minCount) bonus += 9_000;
    else bonus += len * 160;
  }
  return bonus;
}

function alignedSpatialSatisfied(grid: Cell[], wc: WinCondition | undefined): boolean {
  for (const r of wc?.spatialRules ?? []) {
    if (r.kind === "aligned" && maxAlignedRunLength(grid, r.building) < r.minCount) return false;
  }
  return true;
}

function isolatedSpatialSatisfied(grid: Cell[], wc: WinCondition | undefined): boolean {
  for (const r of wc?.spatialRules ?? []) {
    if (r.kind === "isolated" && !isIsolatedForBuilding(grid, r.building)) return false;
  }
  return true;
}

function greedyPlaythrough(
  sequence: BuildingType[],
  mult: number,
  tieNoise: (i: number) => number,
  initialGrid: Cell[],
  ctx: SolverLevelContext,
): { score: number; grid: Cell[] } {
  const grid = cloneGrid(initialGrid);
  const placementCount = sequence.length;
  const cargoSeed = ctx.cargoSeed ?? "";
  const seismic = ctx.seismicRift;
  const mineBonus = ctx.mineScoreBonusPerMine ?? 0;
  const levelId = ctx.levelId ?? 0;
  const frozen = new Set<number>();
  const wc = ctx.winCondition;

  for (let turn = 0; turn < placementCount; turn++) {
    const building = sequence[turn]!;
    const candidates: number[] = [];
    for (let i = 0; i < 16; i++) {
      if (grid[i]?.isPlayable && grid[i]!.building === null) candidates.push(i);
    }
    if (!candidates.length) break;

    const frozenArr = (): number[] => Array.from(frozen);
    const playCandidates = filterCandidatesIsolated(candidates, grid, building, wc);

    let bestIdx = playCandidates[0]!;
    let best = Number.NEGATIVE_INFINITY;
    for (const idx of playCandidates) {
      const trial = cloneGrid(grid);
      trial[idx] = { ...trial[idx]!, building };
      const base = sessionRoiScore(trial, mult, frozenArr(), mineBonus);
      const h = alignedPlacementHeuristic(trial, building, wc);
      const s = base + h + tieNoise(idx) * 0.001;
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

  let score = sessionRoiScore(grid, mult, Array.from(frozen), mineBonus);
  if (!alignedSpatialSatisfied(grid, wc)) {
    score = Math.floor(score * 0.8);
  }
  if (!isolatedSpatialSatisfied(grid, wc)) {
    score = Math.floor(score * 0.82);
  }
  return { score, grid };
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
  const sequence = generatePlacementSequence(cargoSeed, placementCount, ctx.winCondition);
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
    const { score } = greedyPlaythrough(sequence, mult, noise, initialGrid, solverCtx);
    if (score > best) best = score;
  }

  scoreCache.set(key, best);
  return best;
}
