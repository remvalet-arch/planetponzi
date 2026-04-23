import type { BuildingType, Cell } from "@/src/types/game";

import { getMineScoreBonusPerMine } from "@/src/lib/empire-tower";
import { detectIndustrialMega2x2 } from "@/src/lib/megas";
import {
  industrialMegaTotalForLevel,
  isFluxTendusSector,
} from "@/src/lib/sector-rules";
import { getCellScores } from "@/src/lib/scoring";

const CELL_COUNT = 16;
const COLS = 4;
const FLUX_LINE_BONUS = 28;

function resolveMineBonus(mineScoreBonusPerMine?: number): number {
  return mineScoreBonusPerMine !== undefined ? mineScoreBonusPerMine : getMineScoreBonusPerMine();
}

/** Bonus session si une ligne ou colonne contient ≥3 bâtiments identiques consécutifs. */
function fluxTripleAlignmentBonus(grid: Cell[]): number {
  let bonus = 0;
  const scoreLine = (indices: readonly number[]) => {
    let run = 0;
    let last: BuildingType | null = null;
    let hit = false;
    for (const idx of indices) {
      const cell = grid[idx];
      const t = cell?.isPlayable === false ? null : cell?.building ?? null;
      if (t == null) {
        run = 0;
        last = null;
        continue;
      }
      if (t === last) run++;
      else {
        run = 1;
        last = t;
      }
      if (run >= 3) hit = true;
    }
    if (hit) bonus += FLUX_LINE_BONUS;
  };
  for (let r = 0; r < COLS; r++) {
    scoreLine([r * COLS, r * COLS + 1, r * COLS + 2, r * COLS + 3]);
  }
  for (let c = 0; c < COLS; c++) {
    scoreLine([c, c + COLS, c + COLS * 2, c + COLS * 3]);
  }
  return bonus;
}

/**
 * Score de session : méga 2×2 **mines uniquement** (`detectIndustrialMega2x2`) → total secteur ;
 * sinon somme des cases avec gels fiscaux à 0.
 * @param mineScoreBonusPerMine — bonus Tour par mine ; si omis, lecture Empire (client).
 */
export function calculateSessionGridScore(
  grid: Cell[],
  frozenCellIndices: readonly number[] = [],
  mineScoreBonusPerMine?: number,
  levelId = 0,
): number {
  if (grid.length !== CELL_COUNT) return 0;
  if (detectIndustrialMega2x2(grid)) return industrialMegaTotalForLevel(levelId);

  const mine = resolveMineBonus(mineScoreBonusPerMine);
  const frozen = new Set(frozenCellIndices);
  const raw = getCellScores(grid, { mineScoreBonusPerMine: mine, levelId: levelId || undefined });
  let sum = 0;
  for (let i = 0; i < CELL_COUNT; i++) {
    if (!frozen.has(i)) sum += raw[i] ?? 0;
  }
  if (levelId >= 1 && isFluxTendusSector(levelId)) {
    sum += fluxTripleAlignmentBonus(grid);
  }
  return sum;
}

/** Contributions par case (heatmap / debug) — cohérent avec `calculateSessionGridScore` (hors bonus flux global). */
export function getSessionCellScores(
  grid: Cell[],
  frozenCellIndices: readonly number[] = [],
  mineScoreBonusPerMine?: number,
  levelId = 0,
): number[] {
  if (grid.length !== CELL_COUNT) {
    throw new Error(`getSessionCellScores: expected ${CELL_COUNT} cells, got ${grid.length}.`);
  }
  const mega = detectIndustrialMega2x2(grid);
  if (mega) {
    const megaSet = new Set<number>(mega.indices);
    const total = industrialMegaTotalForLevel(levelId);
    const per = total / 4;
    return Array.from({ length: CELL_COUNT }, (_, i) => (megaSet.has(i) ? per : 0));
  }
  const mine = resolveMineBonus(mineScoreBonusPerMine);
  const frozen = new Set(frozenCellIndices);
  const raw = getCellScores(grid, { mineScoreBonusPerMine: mine, levelId: levelId || undefined });
  return raw.map((v, i) => (frozen.has(i) ? 0 : v));
}
