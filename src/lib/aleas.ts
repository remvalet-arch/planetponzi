import { fnv1a32 } from "@/src/lib/rng";
import type { Cell } from "@/src/types/game";

/**
 * Choisit la case affectée par la Faille sismique (déterministe).
 * Si `explicit` est valide sur une case jouable, il est utilisé ; sinon une case occupée jouable.
 */
export function resolveSeismicTargetIndex(
  grid: Cell[],
  cargoSeed: string,
  explicit?: number,
): number | null {
  if (
    typeof explicit === "number" &&
    Number.isInteger(explicit) &&
    explicit >= 0 &&
    explicit <= 15 &&
    grid[explicit]?.isPlayable
  ) {
    return explicit;
  }
  const occupied: number[] = [];
  for (let i = 0; i < 16; i++) {
    const c = grid[i];
    if (c?.isPlayable && c.building != null) occupied.push(i);
  }
  if (!occupied.length) return null;
  const pick = fnv1a32(`${cargoSeed}|seismic-rift-v1`) % occupied.length;
  return occupied[pick] ?? null;
}
