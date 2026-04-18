import { hasMinAligned, isIsolatedForBuilding, maxAlignedRunLength } from "@/src/lib/grid-topology";
import { getPlacementLengthFromObstacles } from "@/src/lib/grid-terrain";
import { estimateMaxScore, type SolverLevelContext } from "@/src/lib/solver";
import type {
  BuildingType,
  Cell,
  DeckChallengeLevel,
  ObstacleSpec,
  SpatialWinRule,
  WinCondition,
} from "@/src/types/game";

export type { SpatialWinRule, WinCondition };

/** Seuils de score final pour 1 / 2 / 3 étoiles (inclus). */
export type LevelStarThresholds = {
  one: number;
  two: number;
  three: number;
};

/** Position sur la carte Saga (pourcentages 0–100, coin supérieur gauche du plateau). */
export type LevelMapPosition = {
  x: number;
  y: number;
};

/** 10 secteurs (10 niveaux chacun) — noms & ambiances dans `strings.*.planets`. */
export type PlanetId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type PlanetDefinition = {
  id: PlanetId;
  levelMin: number;
  levelMax: number;
  /** Couleurs pour fond / interpolation scroll (RGB). */
  toneA: [number, number, number];
  toneB: [number, number, number];
  toneDeep: [number, number, number];
};

/**
 * Mondes cyniques (1–10, 11–20, … 91–100).
 * Noms affichés : i18n `planets[i]` (FR/EN).
 */
export const PLANETS: PlanetDefinition[] = [
  {
    id: 0,
    levelMin: 1,
    levelMax: 10,
    toneA: [99, 102, 241],
    toneB: [59, 130, 246],
    toneDeep: [15, 23, 42],
  },
  {
    id: 1,
    levelMin: 11,
    levelMax: 20,
    toneA: [30, 58, 138],
    toneB: [76, 29, 149],
    toneDeep: [15, 23, 42],
  },
  {
    id: 2,
    levelMin: 21,
    levelMax: 30,
    toneA: [6, 182, 212],
    toneB: [14, 165, 233],
    toneDeep: [8, 47, 73],
  },
  {
    id: 3,
    levelMin: 31,
    levelMax: 40,
    toneA: [217, 119, 6],
    toneB: [245, 158, 11],
    toneDeep: [67, 20, 7],
  },
  {
    id: 4,
    levelMin: 41,
    levelMax: 50,
    toneA: [236, 72, 153],
    toneB: [244, 114, 182],
    toneDeep: [59, 7, 31],
  },
  {
    id: 5,
    levelMin: 51,
    levelMax: 60,
    toneA: [34, 197, 94],
    toneB: [16, 185, 129],
    toneDeep: [6, 78, 59],
  },
  {
    id: 6,
    levelMin: 61,
    levelMax: 70,
    toneA: [120, 113, 108],
    toneB: [87, 83, 78],
    toneDeep: [28, 25, 23],
  },
  {
    id: 7,
    levelMin: 71,
    levelMax: 80,
    toneA: [71, 85, 105],
    toneB: [51, 65, 85],
    toneDeep: [15, 23, 42],
  },
  {
    id: 8,
    levelMin: 81,
    levelMax: 90,
    toneA: [220, 38, 38],
    toneB: [249, 115, 22],
    toneDeep: [69, 10, 10],
  },
  {
    id: 9,
    levelMin: 91,
    levelMax: 100,
    toneA: [88, 28, 135],
    toneB: [15, 23, 42],
    toneDeep: [3, 7, 18],
  },
];

export function planetIdForLevel(levelId: number): PlanetId {
  const idx = Math.floor((levelId - 1) / 10);
  return Math.min(9, Math.max(0, idx)) as PlanetId;
}

export function getPlanetById(id: PlanetId): PlanetDefinition {
  return PLANETS[id]!;
}

export function getPlanetForLevel(levelId: number): PlanetDefinition {
  return getPlanetById(planetIdForLevel(levelId));
}

export function countBuildingOnGrid(grid: Cell[], type: BuildingType): number {
  return grid.reduce((acc, c) => acc + (c.isPlayable && c.building === type ? 1 : 0), 0);
}

export function satisfiesWinCondition(grid: Cell[], wc: WinCondition | undefined): boolean {
  if (!wc) return true;
  if (typeof wc.minHabitacle === "number" && countBuildingOnGrid(grid, "habitacle") < wc.minHabitacle) {
    return false;
  }
  if (typeof wc.minEau === "number" && countBuildingOnGrid(grid, "eau") < wc.minEau) return false;
  if (typeof wc.minMine === "number" && countBuildingOnGrid(grid, "mine") < wc.minMine) return false;
  const needSerre = wc.minSerre ?? wc.minForests;
  if (typeof needSerre === "number" && countBuildingOnGrid(grid, "serre") < needSerre) return false;
  for (const rule of wc.spatialRules ?? []) {
    if (rule.kind === "isolated" && !isIsolatedForBuilding(grid, rule.building)) return false;
    if (rule.kind === "aligned" && !hasMinAligned(grid, rule.building, rule.minCount)) return false;
  }
  return true;
}

export type SpatialMandateFailure =
  | { kind: "isolated"; building: BuildingType }
  | { kind: "aligned"; building: BuildingType; currentRun: number; required: number };

export function getSpatialMandateFailures(grid: Cell[], wc: WinCondition | undefined): SpatialMandateFailure[] {
  if (!wc?.spatialRules?.length) return [];
  const out: SpatialMandateFailure[] = [];
  for (const rule of wc.spatialRules) {
    if (rule.kind === "isolated" && !isIsolatedForBuilding(grid, rule.building)) {
      out.push({ kind: "isolated", building: rule.building });
    }
    if (rule.kind === "aligned" && !hasMinAligned(grid, rule.building, rule.minCount)) {
      out.push({
        kind: "aligned",
        building: rule.building,
        currentRun: maxAlignedRunLength(grid, rule.building),
        required: rule.minCount,
      });
    }
  }
  return out;
}

export type SpatialMandateHudRow =
  | { kind: "isolated"; building: BuildingType; displayAsForests: boolean; ok: boolean }
  | {
      kind: "aligned";
      building: BuildingType;
      displayAsForests: boolean;
      currentRun: number;
      required: number;
      ok: boolean;
    };

export function getSpatialMandateHudRows(grid: Cell[], wc: WinCondition | undefined): SpatialMandateHudRow[] {
  if (!wc?.spatialRules?.length) return [];
  const rows: SpatialMandateHudRow[] = [];
  for (const rule of wc.spatialRules) {
    if (rule.kind === "isolated") {
      rows.push({
        kind: "isolated",
        building: rule.building,
        displayAsForests: false,
        ok: isIsolatedForBuilding(grid, rule.building),
      });
    } else {
      const cur = maxAlignedRunLength(grid, rule.building);
      rows.push({
        kind: "aligned",
        building: rule.building,
        displayAsForests: false,
        currentRun: cur,
        required: rule.minCount,
        ok: cur >= rule.minCount,
      });
    }
  }
  return rows;
}

/** Lignes mandat « min bâtiments » pour UI (briefing, traqueur, écran de fin). */
export type MandateProgressRow = {
  building: BuildingType;
  /** Affichage narratif forêt (mandat `minForests` sans `minSerre`). */
  displayAsForests: boolean;
  current: number;
  required: number;
};

export function getMandateProgressRows(grid: Cell[], wc: WinCondition | undefined): MandateProgressRow[] {
  if (!wc) return [];
  const rows: MandateProgressRow[] = [];
  if (typeof wc.minHabitacle === "number") {
    rows.push({
      building: "habitacle",
      displayAsForests: false,
      current: countBuildingOnGrid(grid, "habitacle"),
      required: wc.minHabitacle,
    });
  }
  if (typeof wc.minEau === "number") {
    rows.push({
      building: "eau",
      displayAsForests: false,
      current: countBuildingOnGrid(grid, "eau"),
      required: wc.minEau,
    });
  }
  if (typeof wc.minMine === "number") {
    rows.push({
      building: "mine",
      displayAsForests: false,
      current: countBuildingOnGrid(grid, "mine"),
      required: wc.minMine,
    });
  }
  const needSerre = wc.minSerre ?? wc.minForests;
  if (typeof needSerre === "number") {
    rows.push({
      building: "serre",
      displayAsForests:
        typeof wc.minForests === "number" && typeof wc.minSerre !== "number",
      current: countBuildingOnGrid(grid, "serre"),
      required: needSerre,
    });
  }
  return rows;
}

export type LevelDefinition = {
  id: number;
  /** Secteur / biome (0 = niveaux 1–10, … 9 = 91–100). */
  planetId: PlanetId;
  /** Entrée RNG déterministe pour la cargaison (longueur = cases constructibles). */
  seed: string;
  stars: LevelStarThresholds;
  /** Niveau de défi manifeste (0 = tout visible). */
  deckChallengeLevel?: DeckChallengeLevel;
  /** Coordonnées % pour le chemin vertical (ordre des niveaux = ordre du parcours). */
  position: LevelMapPosition;
  /** Cases inconstructibles (lac par défaut si nombre seul). */
  obstacles?: ObstacleSpec[];
  /** Aléa : à la fin du tour `triggerAtTurn`, détruit une tuile (Faille sismique). */
  seismicRift?: {
    triggerAtTurn: number;
    targetCellIndex?: number;
  };
  /** Mandat : contraintes indépendantes du score (sinon 0★ même si seuils dépassés). */
  winCondition?: WinCondition;
};

/** Nombre de niveaux Saga générés (carte + progression). */
export const LEVEL_COUNT = 100;

function buildSolverContext(
  levelId: number,
  seed: string,
  obstacles: ObstacleSpec[] | undefined,
  seismic: { triggerAtTurn: number; targetCellIndex?: number } | undefined,
  winCondition: WinCondition | undefined,
): SolverLevelContext {
  return {
    levelId,
    obstacles,
    placementCount: getPlacementLengthFromObstacles(obstacles),
    seismicRift: seismic,
    cargoSeed: seed,
    winCondition,
  };
}

/** Contexte solver pour l’UI (bannière optimal, etc.). */
export function getSolverLevelContext(def: LevelDefinition): SolverLevelContext {
  return buildSolverContext(def.id, def.seed, def.obstacles, def.seismicRift, def.winCondition);
}

/** Seuils dérivés du score max estimé (solver glouton + marges 35 % / 60 % / 85 %). */
function dynamicStarThresholds(
  cargoSeed: string,
  deck: DeckChallengeLevel,
  solverCtx: SolverLevelContext,
): LevelStarThresholds {
  const maxScore = estimateMaxScore(cargoSeed, deck, solverCtx);
  let three = Math.floor(maxScore * 0.85);
  let two = Math.floor(maxScore * 0.6);
  const one = Math.max(15, Math.floor(maxScore * 0.35));
  if (two <= one) two = one + 1;
  if (three <= two) three = two + 1;
  return { one, two, three };
}

/** Campagne : pas de mode 4 (réservé futur hardcore). */
function deckChallengeForLevel(levelId: number): DeckChallengeLevel {
  if (levelId <= 20) return 0;
  if (levelId <= 50) return 1;
  if (levelId <= 80) return 2;
  return 3;
}

/**
 * Génère `count` niveaux avec difficulté progressive et positions en S sur une grande hauteur.
 */
export function generateLevels(count: number): LevelDefinition[] {
  const out: LevelDefinition[] = [];
  for (let id = 1; id <= count; id++) {
    const i = id - 1;
    const t = count > 1 ? i / (count - 1) : 0;
    const y = 98 - t * 94;
    const xRaw = 50 + 42 * Math.sin(i * 0.52 + 0.45) + 6 * Math.sin(i * 0.31);
    const x = Math.min(92, Math.max(8, Math.round(xRaw * 10) / 10));
    const planetId = planetIdForLevel(id);

    const seed = `pp-lvl-${String(id).padStart(4, "0")}-v1`;
    const deckChallengeLevel = deckChallengeForLevel(id);
    /** Niveau 100 : mandat VIP (obstacles variés) + Faille sismique au 8ᵉ tour. */
    const obstacles: ObstacleSpec[] | undefined =
      id === 100
        ? [
            { index: 5, terrain: "mountain" },
            { index: 10, terrain: "lake" },
          ]
        : undefined;
    const seismicRift = id === 100 ? { triggerAtTurn: 8 } : undefined;
    /** Niveau 15 : mandat comptage. 16–17 : démos mandats spatiaux (alignement / isolation). */
    let winCondition: WinCondition | undefined;
    if (id === 15) winCondition = { minForests: 4 };
    else if (id === 16)
      winCondition = { spatialRules: [{ kind: "aligned", building: "serre", minCount: 3 }] };
    else if (id === 17) winCondition = { spatialRules: [{ kind: "isolated", building: "mine" }] };

    const solverCtx = buildSolverContext(id, seed, obstacles, seismicRift, winCondition);
    out.push({
      id,
      planetId,
      seed,
      stars: dynamicStarThresholds(seed, deckChallengeLevel, solverCtx),
      deckChallengeLevel,
      position: { x, y },
      obstacles,
      seismicRift,
      winCondition,
    });
  }
  return out;
}

export const LEVELS: LevelDefinition[] = generateLevels(LEVEL_COUNT);

export function getLevelById(id: number): LevelDefinition | undefined {
  return LEVELS.find((l) => l.id === id);
}

/** Nombre d’étoiles (0–3) selon le score final et les seuils du niveau. */
export function starsFromScore(
  score: number,
  thresholds: LevelStarThresholds,
): 0 | 1 | 2 | 3 {
  if (score >= thresholds.three) return 3;
  if (score >= thresholds.two) return 2;
  if (score >= thresholds.one) return 1;
  return 0;
}

/**
 * Étoiles gagnées pour un score final sur un niveau donné
 * (seuils `one` / `two` / `three` dans la config = cibles 1★ / 2★ / 3★).
 * Si `grid` est fourni, le mandat `winCondition` peut forcer **0★** même si le score le permettait.
 */
export function calculateStars(score: number, levelId: number, grid?: Cell[]): 0 | 1 | 2 | 3 {
  const def = getLevelById(levelId);
  if (!def) return 0;
  const s = starsFromScore(score, def.stars);
  if (grid && !satisfiesWinCondition(grid, def.winCondition)) return 0;
  return s;
}

/**
 * Niveau « courant » sur la carte : premier objectif pertinent dans l’ordre Saga.
 * - On privilégie la **progression avant** : si un palier plus haut est déjà débloqué,
 *   un ancien niveau incomplet (moins de 3★) ne bloque plus l’indicateur carte (évite la
 *   carte « figée » au niveau 15 après avoir gagné 16–18 avec 1–2★ sur 15).
 * - Sinon : premier niveau non débloqué, ou premier débloqué sans 3★.
 * Si tout est débloqué et 3★, renvoie le dernier niveau (hub de replay).
 */
export function getMapCurrentLevel(
  unlockedLevels: number[],
  starsByLevel: Record<string, number>,
): number {
  const ordered = [...LEVELS].sort((a, b) => a.id - b.id);
  const maxUnlocked = unlockedLevels.length ? Math.max(...unlockedLevels) : 1;

  for (const l of ordered) {
    if (!unlockedLevels.includes(l.id)) return l.id;
    const stars = starsByLevel[String(l.id)] ?? 0;
    if (stars < 3) {
      if (l.id < maxUnlocked) continue;
      return l.id;
    }
  }
  return ordered[ordered.length - 1]?.id ?? 1;
}
