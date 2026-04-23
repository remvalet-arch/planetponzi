/** Retour d’haptique mobile (no-op si indisponible). */
function safeVibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* silencieux */
  }
}

/** Pose d’un bâtiment sur la grille. */
export function lightTap(): void {
  safeVibrate(15);
}

/** Fusion 2×2 industrielle ou victoire de niveau. */
export function successPop(): void {
  safeVibrate([30, 50, 30]);
}

/** Achat d’étage (Tour) ou bonus (Boutique). */
export function heavyCash(): void {
  safeVibrate([50, 50, 100]);
}

export function vibrateLevelTap(): void {
  safeVibrate(10);
}

export function vibratePlaceBuilding(): void {
  lightTap();
}

export function vibrateVictoryStars(): void {
  successPop();
}
