/** Retour d’haptique mobile (no-op si indisponible). */
function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* silencieux */
  }
}

export function vibrateLevelTap(): void {
  vibrate(10);
}

export function vibratePlaceBuilding(): void {
  vibrate(20);
}

export function vibrateVictoryStars(): void {
  vibrate([30, 50, 30]);
}
