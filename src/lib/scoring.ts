import { isAusterityHydricSector } from "@/src/lib/sector-rules";
import type { BuildingType, Cell } from "@/src/types/game";

const COLS = 4;
const ROWS = 4;
const CELL_COUNT = ROWS * COLS;

/** Options de score (ex. bonus passif Tour Ponzi sur les mines). */
export type CellScoringOptions = {
  mineScoreBonusPerMine?: number;
  /** Secteur / chaos (austérité : eau ×4, mines −2 de base). */
  levelId?: number;
};

/**
 * Voisinage **orthogonal** sur une grille 4×4 indexée en 1D (ligne par ligne).
 * Les bords de ligne/colonne sont respectés : ex. l’index 3 n’est pas voisin de 4.
 */
function orthogonalNeighborIndices(index: number): number[] {
  const row = Math.floor(index / COLS);
  const col = index % COLS;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push(index - COLS);
  if (row < ROWS - 1) neighbors.push(index + COLS);
  if (col > 0) neighbors.push(index - 1);
  if (col < COLS - 1) neighbors.push(index + 1);

  return neighbors;
}

function scoreForCell(
  building: BuildingType,
  index: number,
  grid: Cell[],
  mineScoreBonusPerMine: number,
  levelId: number | undefined,
): number {
  const self = grid[index];
  if (!self || self.isPlayable === false) return 0;

  const neighbors = orthogonalNeighborIndices(index);

  switch (building) {
    case "mine": {
      let v = 3 + mineScoreBonusPerMine;
      if (levelId != null && isAusterityHydricSector(levelId)) {
        v = Math.max(0, v - 2);
      }
      return v;
    }

    case "serre": {
      let adjacentSerres = 0;
      for (const n of neighbors) {
        if (grid[n]?.building === "serre") adjacentSerres++;
      }
      return 1 + adjacentSerres;
    }

    case "habitacle": {
      for (const n of neighbors) {
        if (grid[n]?.building === "mine") return 0;
      }
      return 2;
    }

    case "eau": {
      let bonus = 0;
      for (const n of neighbors) {
        const b = grid[n]?.building;
        if (b === "habitacle" || b === "serre") bonus += 2;
      }
      if (levelId != null && isAusterityHydricSector(levelId)) {
        return bonus * 4;
      }
      return bonus;
    }

    default: {
      const _exhaustive: never = building;
      return _exhaustive;
    }
  }
}

/**
 * Score attribué à chaque case (0 si vide). Même règles que le total : bonus/malus
 * orthogonaux pris en compte **pour cette case uniquement**.
 */
export function getCellScores(grid: Cell[], options?: CellScoringOptions): number[] {
  if (grid.length !== CELL_COUNT) {
    throw new Error(
      `getCellScores: expected ${CELL_COUNT} cells, got ${grid.length}.`,
    );
  }

  const mineScoreBonusPerMine = options?.mineScoreBonusPerMine ?? 0;
  const scores = new Array<number>(CELL_COUNT);
  for (let i = 0; i < CELL_COUNT; i++) {
    const building = grid[i]?.building ?? null;
    if (grid[i]?.isPlayable === false) {
      scores[i] = 0;
      continue;
    }
    scores[i] =
      building === null
        ? 0
        : scoreForCell(building, i, grid, mineScoreBonusPerMine, options?.levelId);
  }
  return scores;
}

/**
 * Score total : somme des contributions de chaque case **non vide**.
 * La position sur le plateau est l’**indice du tableau** `0..15` (cohérent avec la grille 4×4).
 */
export function calculateGridScore(grid: Cell[], options?: CellScoringOptions): number {
  return getCellScores(grid, options).reduce((sum, v) => sum + v, 0);
}
