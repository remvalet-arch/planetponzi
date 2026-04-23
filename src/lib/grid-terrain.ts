import type { Cell, ObstacleSpec, TerrainType } from "@/src/types/game";

const GRID_SIZE = 16;

/** Normalise les obstacles (indices uniques 0–15 + terrain). */
export function normalizeObstacleMap(obstacles?: readonly ObstacleSpec[]): Map<number, Exclude<TerrainType, "normal">> {
  const out = new Map<number, Exclude<TerrainType, "normal">>();
  for (const spec of obstacles ?? []) {
    if (typeof spec === "number") {
      if (spec >= 0 && spec < GRID_SIZE) out.set(spec, "lake");
    } else if (spec && typeof spec.index === "number") {
      const idx = spec.index;
      if (idx >= 0 && idx < GRID_SIZE) out.set(idx, spec.terrain);
    }
  }
  return out;
}

/** Nombre de tuiles constructibles (= longueur du mandat / tours de placement). */
export function getPlacementLengthFromObstacles(obstacles?: readonly ObstacleSpec[]): number {
  return GRID_SIZE - normalizeObstacleMap(obstacles).size;
}

export function buildGridFromObstacles(obstacles?: readonly ObstacleSpec[]): Cell[] {
  const m = normalizeObstacleMap(obstacles);
  return Array.from({ length: GRID_SIZE }, (_, index) => ({
    index,
    building: null,
    isPlayable: !m.has(index),
    terrainType: (m.get(index) ?? "normal") as TerrainType,
  }));
}

export function mergeGridTerrainWithBuildings(template: Cell[], persisted: Cell[] | undefined): Cell[] {
  if (!Array.isArray(persisted) || persisted.length !== GRID_SIZE) return template;
  return template.map((cell, i) => {
    const p = persisted[i];
    const building = p?.building ?? null;
    const safeBuilding = cell.isPlayable ? building : null;
    return { ...cell, building: safeBuilding };
  });
}

export function normalizePersistedCell(raw: unknown, index: number): Cell {
  const o = raw as Partial<Cell> | null | undefined;
  const building = o?.building ?? null;
  const isPlayable = typeof o?.isPlayable === "boolean" ? o.isPlayable : true;
  const terrain =
    o?.terrainType === "lake" ||
    o?.terrainType === "mountain" ||
    o?.terrainType === "toxic" ||
    o?.terrainType === "void" ||
    o?.terrainType === "normal"
      ? o.terrainType
      : "normal";
  return {
    index: typeof o?.index === "number" ? o.index : index,
    building: isPlayable ? building : null,
    isPlayable,
    terrainType: terrain,
  };
}
