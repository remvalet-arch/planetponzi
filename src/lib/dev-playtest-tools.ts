/**
 * Outils internes playtest / équilibrage — **désactivés en build production** (`NODE_ENV`).
 */

import { EMPIRE_FLOORS } from "@/src/lib/empire-tower";
import { getEffectiveMaxLives } from "@/src/lib/empire-tower";
import { LEVELS } from "@/src/lib/levels";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useEmpireStore } from "@/src/store/useEmpireStore";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import { useProgressStore } from "@/src/store/useProgressStore";
import { DEFAULT_BOOSTERS } from "@/src/types/boosters";

export function isDevPlaytestToolsEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Console : seuils 1★ / 2★ / 3★ (échantillon chaque début de secteur + niveau 100). */
export function logDifficultyCurveAudit(): void {
  if (!isDevPlaytestToolsEnabled() || typeof console === "undefined") return;
  const rows = LEVELS.filter((l) => l.id === 100 || (l.id - 1) % 10 === 0).map((l) => ({
    id: l.id,
    planetId: l.planetId,
    deck: l.deckChallengeLevel ?? 0,
    "1★": l.stars.one,
    "2★": l.stars.two,
    "3★": l.stars.three,
  }));
  console.info("[Planète Ponzi playtest] Courbe contrats — `levels.ts` (`dynamicStarThresholds`, fractions 0.65 / 0.80 / 0.95).");
  console.table(rows);
}

/** Console : coût, Δ passif/min, amortissement marginal (minutes) si Δ>0. */
export function logEmpirePaybackAudit(): void {
  if (!isDevPlaytestToolsEnabled() || typeof console === "undefined") return;
  const ordered = [...EMPIRE_FLOORS].sort((a, b) => a.order - b.order);
  let cumPassive = 0;
  const rows: Record<string, string | number>[] = [];
  for (const f of ordered) {
    const delta =
      typeof f.effects?.passiveIncomePerMinute === "number"
        ? Math.max(0, Math.floor(f.effects.passiveIncomePerMinute))
        : 0;
    const paybackMin =
      f.cost > 0 && delta > 0 ? Math.round((f.cost / delta) * 10) / 10 : f.cost <= 0 ? 0 : NaN;
    rows.push({
      id: f.id,
      cost: f.cost,
      deltaPassivePerMin: delta,
      passiveStackAfter: cumPassive + delta,
      paybackMin: Number.isFinite(paybackMin) ? paybackMin : "∞",
    });
    cumPassive += delta;
  }
  console.info("[Planète Ponzi playtest] Tour — voir bloc audit dans `empire-tower.ts`.");
  console.table(rows);
}

export function devUnlockAllLevels(): void {
  if (!isDevPlaytestToolsEnabled()) return;
  useProgressStore.setState({ unlockedLevels: LEVELS.map((l) => l.id) });
}

export function devAddCheatMoney(): void {
  if (!isDevPlaytestToolsEnabled()) return;
  useEconomyStore.getState().addCoins(1_000_000);
}

/** Progression + économie + Tour + session niveau — repart comme après install (CEO / pseudo effacés). */
export function devResetAllPlaytest(): void {
  if (!isDevPlaytestToolsEnabled()) return;
  useEmpireStore.getState().resetTowerAfterBankruptcy();
  useProgressStore.setState({
    unlockedLevels: [1],
    starsByLevel: {},
    bestScoreByLevel: {},
    boosters: { ...DEFAULT_BOOSTERS },
    lastCompletedLevelId: null,
    prestigeLevel: 0,
    hasSeenFiscalFreezeTutorial: false,
    hasSeenShopUnlockCeoMemo: false,
    hasSeenTowerUnlockCeoMemo: false,
    playerId: null,
    pseudo: null,
  });
  const maxLives = getEffectiveMaxLives();
  useEconomyStore.setState({
    coins: 100,
    lives: maxLives,
    lastLifeRechargeTime: null,
    lastBonusDate: null,
    lastTickTimestamp: null,
    passiveIncomePop: null,
  });
  useLevelRunStore.getState().hardResetSession();
  queueMicrotask(() => {
    useEconomyStore.getState().checkLifeRecharge();
  });
}
