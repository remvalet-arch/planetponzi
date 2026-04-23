/**
 * Règles de gameplay par secteur (planetId = floor((levelId - 1) / 10)).
 * Niveaux 91–99 : chaos — combinaisons déterministes dérivées de la seed de règle.
 */

import { getMineScoreBonusPerMine } from "@/src/lib/empire-tower";
import { fnv1a32 } from "@/src/lib/rng";

export type ChaosGameplayFlags = {
  inflatedStars: boolean;
  austerityScoring: boolean;
  mega60: boolean;
  fluxAlign: boolean;
  minMine4: boolean;
  extraVoidPair: boolean;
  centerVoidObstacles: boolean;
};

/** Niveaux 91–99 uniquement ; `null` sinon. */
export function chaosGameplayForLevel(levelId: number): ChaosGameplayFlags | null {
  if (levelId < 91 || levelId > 99) return null;
  const h = fnv1a32(`planet-ponzi|chaos-v1|${levelId}`);
  const flags: ChaosGameplayFlags = {
    inflatedStars: (h & 1) !== 0,
    austerityScoring: (h & 2) !== 0,
    mega60: (h & 4) !== 0,
    fluxAlign: (h & 8) !== 0,
    minMine4: (h & 16) !== 0,
    extraVoidPair: (h & 32) !== 0,
    centerVoidObstacles: (h & 64) !== 0,
  };
  if (!Object.values(flags).some(Boolean)) {
    const keys: (keyof ChaosGameplayFlags)[] = [
      "inflatedStars",
      "austerityScoring",
      "mega60",
      "fluxAlign",
      "minMine4",
      "extraVoidPair",
      "centerVoidObstacles",
    ];
    const forced = keys[(h >>> 16) % keys.length]!;
    return { ...flags, [forced]: true };
  }
  return flags;
}

/** Niveaux 31–40 — stress hydrique : eau amplifiée, mines « coûtent » du rendement. */
export function isAusterityHydricSector(levelId: number): boolean {
  if (levelId < 1) return false;
  if (Math.floor((levelId - 1) / 10) === 3) return true;
  return chaosGameplayForLevel(levelId)?.austerityScoring === true;
}

/** Niveaux 61–70 — flux tendus : bonus si ≥3 mêmes bâtiments alignés sur une ligne/colonne. */
export function isFluxTendusSector(levelId: number): boolean {
  if (levelId < 1) return false;
  if (Math.floor((levelId - 1) / 10) === 6) return true;
  return chaosGameplayForLevel(levelId)?.fluxAlign === true;
}

/** Niveaux 51–60 — Série B : méga 2×2 mines rapporte 60 M$ au lieu de 40. */
export function isMegaPlateauSector(levelId: number): boolean {
  if (levelId < 1) return false;
  if (Math.floor((levelId - 1) / 10) === 5) return true;
  return chaosGameplayForLevel(levelId)?.mega60 === true;
}

/** Niveaux 21–30 — comptes masqués : le manifeste cache les 2 prochaines tuiles. */
export function isHiddenNextTilesSector(levelId: number): boolean {
  if (levelId < 1) return false;
  return Math.floor((levelId - 1) / 10) === 2;
}

/** Niveaux 41–50 (+ chaos) : seuils d’étoiles gonflés ~+20 %. */
export function isInflationStarSector(levelId: number): boolean {
  if (levelId < 1) return false;
  if (Math.floor((levelId - 1) / 10) === 4) return true;
  return chaosGameplayForLevel(levelId)?.inflatedStars === true;
}

/** Niveaux 71–80 (+ chaos) : mandat ≥4 mines pour valider. */
export function isSiliconMineQuotaLevel(levelId: number): boolean {
  if (levelId < 1) return false;
  if (Math.floor((levelId - 1) / 10) === 7) return true;
  return chaosGameplayForLevel(levelId)?.minMine4 === true;
}

/**
 * Score méga-industriel (2×2 mines) : base secteur (40 ou 60) + bonus Tour × 4 mines
 * (aligné sur quatre cases du bloc — la méga reste compétitive en fin de partie).
 */
export function industrialMegaTotalForLevel(levelId: number, mineScoreBonusPerMine?: number): number {
  const base = isMegaPlateauSector(levelId) ? 60 : 40;
  const bonus =
    mineScoreBonusPerMine !== undefined ? mineScoreBonusPerMine : getMineScoreBonusPerMine();
  const mineBonus = Math.max(0, Math.floor(bonus));
  return base + 4 * mineBonus;
}
