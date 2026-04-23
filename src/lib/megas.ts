import type { BuildingType, Cell } from "@/src/types/game";

/** Score total lorsqu’un carré 2×2 de mines forme le Complexe Industriel. */
export const INDUSTRIAL_MEGA_TOTAL_SCORE = 40;

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
