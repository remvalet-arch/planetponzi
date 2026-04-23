function readHapticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const { useSettingsStore } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- évite cycle settings ↔ économie au chargement
      require("@/src/store/useSettingsStore") as typeof import("@/src/store/useSettingsStore");
    return useSettingsStore.getState().hapticsEnabled !== false;
  } catch {
    return true;
  }
}

/** Retour d’haptique mobile (no-op si indisponible ou désactivé dans Paramètres). */
function safeVibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (!readHapticsEnabled()) return;
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

/** Fin de mandat sans contrat (0★) — feedback d’échec fort. */
export function failureShock(): void {
  safeVibrate([100, 50, 100]);
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
