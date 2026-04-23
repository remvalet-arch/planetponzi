import { hasMinAligned, isIsolatedForBuilding, maxAlignedRunLength } from "@/src/lib/grid-topology";
import { getPlacementLengthFromObstacles } from "@/src/lib/grid-terrain";
import { fnv1a32 } from "@/src/lib/rng";
import {
  chaosGameplayForLevel,
  isInflationStarSector,
  isSiliconMineQuotaLevel,
} from "@/src/lib/sector-rules";
import { estimateMaxScore, type SolverLevelContext } from "@/src/lib/solver";
import type {
  BuildingType,
  Cell,
  DeckChallengeLevel,
  ObstacleSpec,
  SpatialWinRule,
  TerrainType,
  WinCondition,
} from "@/src/types/game";

export type { SpatialWinRule, WinCondition };

/** Seuils de score final pour 1 / 2 / 3 étoiles (inclus). */
export type LevelStarThresholds = {
  one: number;
  two: number;
  three: number;
};

/** Position sur la carte des marchés (pourcentages 0–100, coin supérieur gauche du plateau). */
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

/** Nombre de niveaux sur la carte (génération carte + progression). */
export const LEVEL_COUNT = 100;

const CENTER_VOID_OBSTACLES: ObstacleSpec[] = [
  { index: 5, terrain: "void" },
  { index: 6, terrain: "void" },
  { index: 9, terrain: "void" },
  { index: 10, terrain: "void" },
];

type ObstacleTerrain = Exclude<TerrainType, "normal">;

function obstacleSpecToEntry(spec: ObstacleSpec): { index: number; terrain: ObstacleTerrain } {
  if (typeof spec === "number") return { index: spec, terrain: "lake" };
  return { index: spec.index, terrain: spec.terrain };
}

function mergeObstacleSpecs(
  base: readonly ObstacleSpec[] | undefined,
  extra: readonly ObstacleSpec[],
): ObstacleSpec[] | undefined {
  const m = new Map<number, ObstacleTerrain>();
  for (const spec of base ?? []) {
    const { index, terrain } = obstacleSpecToEntry(spec);
    if (index >= 0 && index < 16) m.set(index, terrain);
  }
  for (const spec of extra) {
    const { index, terrain } = obstacleSpecToEntry(spec);
    if (index >= 0 && index < 16) m.set(index, terrain);
  }
  if (m.size === 0) return undefined;
  return [...m.entries()].map(([index, terrain]) => ({ index, terrain }));
}

function pickTwoDistinctGridIndices(levelId: number, salt: string): [number, number] {
  const a = fnv1a32(`pp-void|${levelId}|${salt}|a`) % 16;
  let b = fnv1a32(`pp-void|${levelId}|${salt}|b`) % 16;
  if (b === a) {
    b = (b + 1 + (fnv1a32(`pp-void|${levelId}|${salt}|c`) % 15)) % 16;
  }
  return [a, b];
}

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

/**
 * Courbe de difficulté « contrats » (1–100) — audit playtest
 * ----------------------------------------------------------
 * Les cibles **ne sont pas** une progression arithmétique fixe sur l’id niveau : elles sont
 * **proportionnelles au plafond glouton** `estimateMaxScore(seed, deck, ctx)` pour chaque mandat.
 *
 * - **Forme** : `one = max(15, ⌊0.65×max⌋)`, `two = ⌊0.80×max⌋`, `three = ⌊0.95×max⌋` (avec +1 si
 *   égalités pour garder 1 < 2 < 3). Courbe **impitoyable** : ~60 % du max ne suffit plus pour 1★ ;
 *   le joueur doit structurer la grille (synergies, méga 2×2, mandats) sous peine de 0★.
 * - **Deck / multiplicateur** : `deckChallengeForLevel` — mode 0 jusqu’au 20, puis 2 jusqu’au 80, puis 3
 *   (sauf 4 réservé). Saut de difficulté **par paliers d’ids**, pas par planetId seul.
 * - **Secteur (planetId)** : obstacles / chaos / mandats (`winCondition`, sismique niv.100) modulent le
 *   `solverCtx` → **maxScore varie par vague** ; certains secteurs appliquent encore **×1,2** sur les
 *   trois seuils (`isInflationStarSector`). Le **plafond estimé** UI (`getDisplayedEstimatedMaxScoreForLevel`)
 *   applique le même facteur pour rester aligné avec les contrats. Les planètes ne sont donc pas un simple
 *   « re-skin » : elles déforment la courbe via la géométrie de grille + règles.
 * - **Synthèse** : la courbe globale 1→100 suit l’**enveloppe du solver** sous contraintes de plus en
 *   plus dures ; inspecter `LEVELS.map(l => l.stars)` ou lancer l’audit console en dev (`dev-playtest-tools`).
 */
/** Même facteur que `isInflationStarSector` sur les seuils d’étoiles. */
const STAR_INFLATION_MULT = 1.2 as const;

/** Seuils 1★ / 2★ / 3★ à partir du plafond glouton `greedyMax` (avant inflation secteur). */
function starThresholdsFromGreedyMax(greedyMax: number): LevelStarThresholds {
  let three = Math.floor(greedyMax * 0.95);
  let two = Math.floor(greedyMax * 0.8);
  const one = Math.max(15, Math.floor(greedyMax * 0.65));
  if (two <= one) two = one + 1;
  if (three <= two) three = two + 1;
  return { one, two, three };
}

function applyInflationToStarThresholds(t: LevelStarThresholds): LevelStarThresholds {
  return {
    one: Math.ceil(t.one * STAR_INFLATION_MULT),
    two: Math.ceil(t.two * STAR_INFLATION_MULT),
    three: Math.ceil(t.three * STAR_INFLATION_MULT),
  };
}

/**
 * Plafond glouton affiché au joueur (mandat / bilan) : inclut ×1,2 si le secteur gonfle les contrats,
 * pour rester cohérent avec `def.stars` générés dans `generateLevels`.
 */
export function getDisplayedEstimatedMaxScoreForLevel(
  def: LevelDefinition,
  mineScoreBonusPerMine?: number,
): number {
  const greedyMax = estimateMaxScore(def.seed, def.deckChallengeLevel ?? 0, {
    ...getSolverLevelContext(def),
    ...(mineScoreBonusPerMine !== undefined ? { mineScoreBonusPerMine } : {}),
  });
  if (!isInflationStarSector(def.id)) return greedyMax;
  return Math.ceil(greedyMax * STAR_INFLATION_MULT);
}

/** Après inflation éventuelle : borne `three` au plafond affiché et rétablit 1 < 2 < 3. */
function capThreeStarToDisplayedCeiling(
  stars: LevelStarThresholds,
  displayCeiling: number,
): LevelStarThresholds {
  let { one, two, three } = stars;
  three = Math.min(three, displayCeiling);
  if (three <= two) three = Math.min(displayCeiling, two + 1);
  if (three <= two) two = Math.max(one + 1, three - 1);
  if (two <= one) two = one + 1;
  if (three <= two) three = Math.min(displayCeiling, two + 1);
  return { one, two, three };
}

/**
 * Campagne : pas de mode 4 (réservé futur hardcore).
 * Au moins 2 types masqués dès qu’il y a du « brouillard » manifeste (évite la déduction par soustraction).
 */
function deckChallengeForLevel(levelId: number): DeckChallengeLevel {
  if (levelId <= 20) return 0;
  if (levelId <= 50) return 2;
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
    let obstacles: ObstacleSpec[] | undefined =
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

    const chaos = chaosGameplayForLevel(id);

    if (planetId === 8 && id !== 100) {
      obstacles = mergeObstacleSpecs(obstacles, CENTER_VOID_OBSTACLES);
    }

    if (planetId === 1 && id !== 100 && !obstacles?.length) {
      const [a, b] = pickTwoDistinctGridIndices(id, seed);
      obstacles = [
        { index: a, terrain: "void" },
        { index: b, terrain: "void" },
      ];
    }

    if (chaos?.centerVoidObstacles) {
      obstacles = mergeObstacleSpecs(obstacles, CENTER_VOID_OBSTACLES);
    }
    if (chaos?.extraVoidPair) {
      const [a, b] = pickTwoDistinctGridIndices(id, `${seed}|chaos-pair`);
      obstacles = mergeObstacleSpecs(obstacles, [
        { index: a, terrain: "void" },
        { index: b, terrain: "void" },
      ]);
    }

    if (isSiliconMineQuotaLevel(id)) {
      winCondition = { ...winCondition, minMine: Math.max(4, winCondition?.minMine ?? 0) };
    }

    const solverCtx = buildSolverContext(id, seed, obstacles, seismicRift, winCondition);
    const greedyMax = estimateMaxScore(seed, deckChallengeLevel, solverCtx);
    let stars = starThresholdsFromGreedyMax(greedyMax);
    if (isInflationStarSector(id)) {
      const displayCeiling = Math.ceil(greedyMax * STAR_INFLATION_MULT);
      stars = applyInflationToStarThresholds(stars);
      stars = capThreeStarToDisplayedCeiling(stars, displayCeiling);
    }

    out.push({
      id,
      planetId,
      seed,
      stars,
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
 * Niveau « courant » sur la carte : premier objectif pertinent dans l’ordre des mandats.
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
