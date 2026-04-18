/** Quota d’étoiles cumulées sur les 9 niveaux précédant un Boss pour débloquer l’accès au Boss. */
export const STAR_GATE_QUOTA = 18;

export function isSagaBossLevel(levelId: number): boolean {
  return levelId > 0 && levelId % 10 === 0;
}

/** Niveaux inclusifs dont les étoiles comptent pour la porte du Boss `bossLevelId` (ex. Boss 10 → 1–9). */
export function preBossStarRange(bossLevelId: number): { from: number; to: number } {
  return { from: bossLevelId - 9, to: bossLevelId - 1 };
}

export function sumStarsInLevelRange(
  starsByLevel: Record<string, number>,
  from: number,
  to: number,
): number {
  let sum = 0;
  for (let L = from; L <= to; L++) {
    const raw = starsByLevel[String(L)];
    const n = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
    sum += Math.min(3, Math.max(0, Math.floor(n)));
  }
  return sum;
}

/** Boss verrouillé tant que le secteur précédent n’a pas assez d’étoiles cumulées. */
export function isStarGatedBoss(levelId: number, starsByLevel: Record<string, number>): boolean {
  if (!isSagaBossLevel(levelId)) return false;
  const { from, to } = preBossStarRange(levelId);
  return sumStarsInLevelRange(starsByLevel, from, to) < STAR_GATE_QUOTA;
}

/** Accès effectif à un niveau (déblocage Saga + porte des étoiles pour les Boss). */
export function canPlayLevel(
  levelId: number,
  unlockedLevels: readonly number[],
  starsByLevel: Record<string, number>,
): boolean {
  if (!unlockedLevels.includes(levelId)) return false;
  if (isStarGatedBoss(levelId, starsByLevel)) return false;
  return true;
}
