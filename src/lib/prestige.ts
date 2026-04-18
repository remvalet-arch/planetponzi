/** +10 % de score final par palier de prestige (arrondi). */
export function getPrestigeScoreMultiplier(prestigeLevel: number): number {
  const p = Math.max(0, Math.floor(prestigeLevel));
  return 1 + 0.1 * p;
}

export function applyPrestigeToRawScore(raw: number, prestigeLevel: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.round(raw * getPrestigeScoreMultiplier(prestigeLevel));
}
