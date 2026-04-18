import type { Cell } from "@/src/types/game";

import { detectIndustrialMega2x2, INDUSTRIAL_MEGA_TOTAL_SCORE } from "@/src/lib/megas";
import { getCellScores } from "@/src/lib/scoring";

const CELL_COUNT = 16;

/**
 * Score de session : méga 2×2 mines → total fixe ; sinon somme des cases avec gels fiscaux à 0.
 */
export function calculateSessionGridScore(
  grid: Cell[],
  frozenCellIndices: readonly number[] = [],
): number {
  if (grid.length !== CELL_COUNT) return 0;
  if (detectIndustrialMega2x2(grid)) return INDUSTRIAL_MEGA_TOTAL_SCORE;

  const frozen = new Set(frozenCellIndices);
  const raw = getCellScores(grid);
  let sum = 0;
  for (let i = 0; i < CELL_COUNT; i++) {
    if (!frozen.has(i)) sum += raw[i] ?? 0;
  }
  return sum;
}

/** Contributions par case (heatmap / debug) — cohérent avec `calculateSessionGridScore`. */
export function getSessionCellScores(
  grid: Cell[],
  frozenCellIndices: readonly number[] = [],
): number[] {
  if (grid.length !== CELL_COUNT) {
    throw new Error(`getSessionCellScores: expected ${CELL_COUNT} cells, got ${grid.length}.`);
  }
  const mega = detectIndustrialMega2x2(grid);
  if (mega) {
    const megaSet = new Set<number>(mega.indices);
    return Array.from({ length: CELL_COUNT }, (_, i) => (megaSet.has(i) ? 10 : 0));
  }
  const frozen = new Set(frozenCellIndices);
  const raw = getCellScores(grid);
  return raw.map((v, i) => (frozen.has(i) ? 0 : v));
}
