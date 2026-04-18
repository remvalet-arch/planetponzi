import type {
  BuildingType,
  DailyInventory,
  DeckChallengeLevel,
} from "@/src/types/game";

const BUILDING_TYPES: readonly BuildingType[] = [
  "habitacle",
  "eau",
  "serre",
  "mine",
] as const;

function assertNonEmptyCargoSeed(seed: string): void {
  if (typeof seed !== "string" || seed.length === 0) {
    throw new Error(`Invalid cargo seed: expected non-empty string.`);
  }
}

/** FNV-1a 32-bit — déterministe, suffisant pour dériver un RNG. */
export function fnv1a32(input: string): number {
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
 * Déterministe pour (`cargoSeed`, L).
 */
export function pickHiddenDeckBuildingTypes(
  cargoSeed: string,
  level: DeckChallengeLevel,
): ReadonlySet<BuildingType> {
  assertNonEmptyCargoSeed(cargoSeed);
  if (level === 0) return new Set();
  const pool = [...BUILDING_TYPES] as BuildingType[];
  const rand = mulberry32(fnv1a32(`planet-ponzi|deck-occult|${cargoSeed}|${level}`));
  shuffleInPlace(pool, rand);
  return new Set(pool.slice(0, level));
}

/**
 * Retourne la date locale au format YYYY-MM-DD (fuseau du runtime).
 * Utilisé côté stats (séries), pas pour la génération de niveau.
 */
export function getLocalDateSeed(reference: Date = new Date()): string {
  const y = reference.getFullYear();
  const m = String(reference.getMonth() + 1).padStart(2, "0");
  const d = String(reference.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Génère la séquence de bâtiments à placer, déterministe pour une `cargoSeed` donnée.
 * @param length Nombre de tours (= cases constructibles), défaut 16.
 */
export function generatePlacementSequence(cargoSeed: string, length = 16): BuildingType[] {
  assertNonEmptyCargoSeed(cargoSeed);
  const n = Math.max(1, Math.min(16, Math.floor(length)));
  const rand = mulberry32(fnv1a32(`planet-ponzi|deck|${cargoSeed}`));
  const sequence: BuildingType[] = [];
  for (let i = 0; i < n; i++) {
    const pick = Math.floor(rand() * BUILDING_TYPES.length);
    sequence.push(BUILDING_TYPES[pick]!);
  }
  return sequence;
}

/** Compte chaque type présent dans la séquence (somme = longueur de la séquence). */
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
