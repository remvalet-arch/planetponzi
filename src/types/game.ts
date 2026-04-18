/** Identifiants stables des 4 types de bâtiments (alignés avec le PRD). */
export type BuildingType = "habitacle" | "eau" | "serre" | "mine";

/**
 * Niveaux de masquage au manifeste (déterministe par cargo).
 * `0` = tout visible. `1` = un type masqué (léger brouillard). `L>1` = L types masqués.
 */
export const DECK_CHALLENGE_LEVELS = [0, 1, 2, 3, 4] as const;
export type DeckChallengeLevel = (typeof DECK_CHALLENGE_LEVELS)[number];

/** Effectifs du manifeste pour la journée (somme = nombre de placements du mandat). */
export type DailyInventory = Record<BuildingType, number>;

export type TerrainType = "normal" | "lake" | "mountain" | "toxic";

/** Obstacle inconstructible : indice seul (= lac) ou indice + terrain. */
export type ObstacleSpec = number | { index: number; terrain: Exclude<TerrainType, "normal"> };

/** Cycle de vie minimal d’une partie (store + UI future). */
export type GameStatus = "ready" | "playing" | "finished";

/** Booster actif sur la grille (session, non persisté). */
export type ActiveBooster = "demolition";

/** Une case de la grille 4×4 (index 0–15, ligne par ligne). */
export type Cell = {
  index: number;
  building: BuildingType | null;
  /** `false` = obstacle (inconstructible). */
  isPlayable: boolean;
  /** Terrain décoratif / obstacle ; les cases jouables sont en général `normal`. */
  terrainType: TerrainType;
};

/** Snapshot sérialisable de l’état de jeu (tests, persistance éventuelle). */
export type GameState = {
  /** Identifiant du niveau Saga en cours (0 = aucune session chargée). */
  levelId: number;
  /** Seed de cargaison du niveau (RNG déterministe). */
  seed: string;
  placementSequence: BuildingType[];
  dailyInventory: DailyInventory;
  deckChallengeLevel: DeckChallengeLevel;
  /** Une fois égal à `seed`, la difficulté est figée pour la session (anti-triche manifeste). */
  deckChallengeLockedSeed: string | null;
  grid: Cell[];
  turn: number;
  score: number;
  status: GameStatus;
  /** Présent si le snapshot inclut l’état runtime des boosters. */
  activeBooster?: ActiveBooster | null;
  /** Cases gelées par le boss Contrôle fiscal (0 pt en fin de scoring). */
  frozenCellIndices?: number[];
};
