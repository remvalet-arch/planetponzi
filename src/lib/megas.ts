import type { BuildingType, Cell } from "@/src/types/game";

/** Base M$ du méga 2×2 mines — le total réel ajoute `4 ×` bonus Tour (`sector-rules`). */
export const INDUSTRIAL_MEGA_TOTAL_SCORE = 30;

const COLS = 4;

/** Positions haut-gauche valides d’un carré 2×2 sur une grille 4×4. */
const MEGA_TOP_LEFTS = [0, 1, 2, 4, 5, 6, 8, 9, 10] as const;

export type IndustrialMega2x2 = {
  topLeft: number;
  /** Quatre indices (ligne par ligne) formant le carré. */
  indices: readonly [number, number, number, number];
  buildingType: BuildingType;
};

function indicesForTopLeft(tl: number): [number, number, number, number] {
  return [tl, tl + 1, tl + COLS, tl + COLS + 1];
}

/**
 * Détecte un carré 2×2 de **mines** (usines) uniquement — seul pattern méga actif en scoring / SFX.
 * Premier match (scan haut-gauche, ordre lecture).
 */
export function detectIndustrialMega2x2(grid: Cell[]): IndustrialMega2x2 | null {
  if (grid.length !== 16) return null;
  for (const tl of MEGA_TOP_LEFTS) {
    const idx = indicesForTopLeft(tl);
    if (!idx.every((i) => grid[i]?.isPlayable !== false)) continue;
    const types = idx.map((i) => grid[i]?.building ?? null);
    if (types.every((t) => t === "mine")) {
      return { topLeft: tl, indices: idx, buildingType: "mine" };
    }
  }
  return null;
}

export function megaJustFormed(prevGrid: Cell[], nextGrid: Cell[]): boolean {
  return detectIndustrialMega2x2(prevGrid) === null && detectIndustrialMega2x2(nextGrid) !== null;
}

/**
 * Couronne autour du bloc 2×2 : cases dans le rectangle [minRow−1,maxRow+1]×[minCol−1,maxCol+1]
 * (borné à la grille 4×4), **hors** les quatre cases du méga. Ces indices scorent 0 en session méga.
 */
export function industrialMegaPollutionCrownIndices(mega: IndustrialMega2x2): Set<number> {
  const rows = mega.indices.map((i) => Math.floor(i / COLS));
  const cols = mega.indices.map((i) => i % COLS);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);
  const megaSet = new Set<number>(mega.indices);
  const out = new Set<number>();
  for (let r = minRow - 1; r <= maxRow + 1; r++) {
    for (let c = minCol - 1; c <= maxCol + 1; c++) {
      if (r < 0 || r > 3 || c < 0 || c > 3) continue;
      const idx = r * COLS + c;
      if (!megaSet.has(idx)) out.add(idx);
    }
  }
  return out;
}
