import type { BuildingType, Cell } from "@/src/types/game";

/** Voisins orthogonaux dans une grille 4×4 (indices 0–15). */
export function orthogonalNeighbors4(index: number): number[] {
  const r = Math.floor(index / 4);
  const c = index % 4;
  const out: number[] = [];
  if (r > 0) out.push(index - 4);
  if (r < 3) out.push(index + 4);
  if (c > 0) out.push(index - 1);
  if (c < 3) out.push(index + 1);
  return out;
}

/**
 * Vrai si aucune paire de bâtiments `building` n’est orthogonalement adjacente
 * (cases jouables uniquement).
 */
export function isIsolatedForBuilding(grid: Cell[], building: BuildingType): boolean {
  for (let i = 0; i < 16; i++) {
    const cell = grid[i];
    if (!cell?.isPlayable || cell.building !== building) continue;
    for (const j of orthogonalNeighbors4(i)) {
      const n = grid[j];
      if (n?.isPlayable && n.building === building) return false;
    }
  }
  return true;
}

/**
 * Plus long segment consécutif de `building` sur une même ligne ou colonne
 * (cases jouables ; les cases vides ou autres types cassent le segment).
 */
export function maxAlignedRunLength(grid: Cell[], building: BuildingType): number {
  let best = 0;
  for (let r = 0; r < 4; r++) {
    let run = 0;
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c;
      const cell = grid[idx];
      if (cell?.isPlayable && cell.building === building) {
        run++;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    }
  }
  for (let c = 0; c < 4; c++) {
    let run = 0;
    for (let r = 0; r < 4; r++) {
      const idx = r * 4 + c;
      const cell = grid[idx];
      if (cell?.isPlayable && cell.building === building) {
        run++;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    }
  }
  return best;
}

export function hasMinAligned(grid: Cell[], building: BuildingType, minCount: number): boolean {
  return maxAlignedRunLength(grid, building) >= minCount;
}

/** Vrai si placer `building` en `cellIndex` créerait une adjacence orthogonale avec le même type. */
export function placementTouchesSameBuilding(
  grid: Cell[],
  cellIndex: number,
  building: BuildingType,
): boolean {
  for (const j of orthogonalNeighbors4(cellIndex)) {
    const n = grid[j];
    if (n?.isPlayable && n.building === building) return true;
  }
  return false;
}
