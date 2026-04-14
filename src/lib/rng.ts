import type {
  BuildingType,
  DailyInventory,
  DeckChallengeLevel,
} from "@/src/types/game";

/** Format attendu pour la seed quotidienne (date ISO locale). */
export const DAILY_SEED_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const BUILDING_TYPES: readonly BuildingType[] = [
  "habitacle",
  "eau",
  "serre",
  "mine",
] as const;

function assertValidDailySeed(seed: string): void {
  if (!DAILY_SEED_PATTERN.test(seed)) {
    throw new Error(
      `Invalid daily seed "${seed}". Expected YYYY-MM-DD (e.g. 2026-04-14).`,
    );
  }
}

/** FNV-1a 32-bit — déterministe, suffisant pour dériver un RNG. */
function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** PRNG dérivé de la seed (Mulberry32). */
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(items: T[], random: () => number): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

/**
 * Pour un niveau L>0, choisit **L** types dont le compte sera masqué au manifeste.
 * Déterministe pour (dateSeed, L) — même joueur, même jour, même difficulté → mêmes cases noires.
 */
export function pickHiddenDeckBuildingTypes(
  dateSeed: string,
  level: DeckChallengeLevel,
): ReadonlySet<BuildingType> {
  assertValidDailySeed(dateSeed);
  if (level === 0) return new Set();
  const pool = [...BUILDING_TYPES] as BuildingType[];
  const rand = mulberry32(fnv1a32(`planet-ponzi|deck-occult|${dateSeed}|${level}`));
  shuffleInPlace(pool, rand);
  return new Set(pool.slice(0, level));
}

/**
 * Retourne la date locale au format YYYY-MM-DD (fuseau du runtime).
 * À documenter côté produit si un fuseau fixe (ex. UTC) est requis.
 */
export function getLocalDateSeed(reference: Date = new Date()): string {
  const y = reference.getFullYear();
  const m = String(reference.getMonth() + 1).padStart(2, "0");
  const d = String(reference.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Génère la séquence des 16 bâtiments du jour : **16 tirages indépendants**
 * parmi les 4 types, déterministes pour une seed `YYYY-MM-DD` donnée
 * (même résultat pour tous les joueurs).
 */
export function generateDailyBuildingSequence(
  dateSeed: string,
): BuildingType[] {
  assertValidDailySeed(dateSeed);
  const rand = mulberry32(fnv1a32(`planet-ponzi|deck|${dateSeed}`));
  const sequence: BuildingType[] = [];
  for (let i = 0; i < 16; i++) {
    const pick = Math.floor(rand() * BUILDING_TYPES.length);
    sequence.push(BUILDING_TYPES[pick]!);
  }
  return sequence;
}

/** Compte chaque type présent dans la séquence du jour (16 entrées attendues). */
export function getDailyStats(sequence: BuildingType[]): DailyInventory {
  const counts: DailyInventory = {
    habitacle: 0,
    eau: 0,
    serre: 0,
    mine: 0,
  };
  for (const b of sequence) {
    counts[b]++;
  }
  return counts;
}
