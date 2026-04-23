"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  computePassiveModifiers,
  getEffectiveLifeRechargeMs,
  getEffectiveMaxLives,
} from "@/src/lib/empire-tower";
import { getLocalDateSeed } from "@/src/lib/rng";
import { persistLocalStorage } from "@/src/lib/zustand-persist-storage";
import { useProgressStore } from "@/src/store/useProgressStore";

const STORAGE_KEY = "planet-ponzi-economy";
const PENDING_LAST_BONUS_KEY = "pp-pending-lastBonus-for-economy";
const DEFAULT_COINS = 100;

/** @deprecated Utiliser `getEffectiveMaxLives()` depuis `@/src/lib/empire-tower` pour le plafond réel. */
export { EMPIRE_BASE_MAX_LIVES as MAX_LIVES } from "@/src/lib/empire-tower";

function normalizeCoins(n: unknown): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return DEFAULT_COINS;
  return Math.max(0, Math.floor(n));
}

function normalizeLives(n: unknown): number {
  const cap = getEffectiveMaxLives();
  if (typeof n !== "number" || !Number.isFinite(n)) return cap;
  return Math.min(cap, Math.max(0, Math.floor(n)));
}

function readPendingLastBonusFromProgressMigration(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_LAST_BONUS_KEY);
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    localStorage.removeItem(PENDING_LAST_BONUS_KEY);
    return raw;
  } catch {
    return null;
  }
}

export type EconomyStore = {
  coins: number;
  lives: number;
  /** Horodatage (ms) servant d’ancre pour les recharges +1 vie lorsque lives &lt; max effectif. */
  lastLifeRechargeTime: number | null;
  /** Dernier jour (YYYY-MM-DD local) où le bonus quotidien carte a été encaissé. */
  lastBonusDate: string | null;
  /** Dernier tick (ms) du revenu passif online (1 min) — ancre pour éviter le double comptage avec le catch-up hors-ligne. */
  lastTickTimestamp: number | null;
  /** Pulse UI court après crédit passif online (non persisté). */
  passiveIncomePop: { amount: number; id: number } | null;

  checkLifeRecharge: () => void;
  clearPassiveIncomePop: () => void;
  addCoins: (amount: number) => void;
  /** Retourne `false` si solde insuffisant (aucune dépense). */
  spendCoins: (amount: number) => boolean;
  consumeLife: () => void;
  /** Ajoute des vies sans dépasser le plafond effectif (ex. bonus partage). */
  addLives: (amount: number) => void;
  refillLives: () => void;
  claimDailyBonus: () => void;
  /**
   * Prestige : solde à zéro + aligne les vies sur le nouveau plafond passif.
   * Le palier `prestigeLevel` et le multiplicateur de score (+10 % / palier) vivent dans
   * `useProgressStore` — appeler `incrementPrestige()` après cette wipe (ex. page Tour).
   */
  wipeEconomyForPrestige: () => void;
  /** Tick revenu passif pendant la session (crédit si taux &gt; 0). Met à jour `lastTickTimestamp`. */
  applyOnlinePassiveIncomeTick: (unlockedNodes: Record<string, boolean>) => void;
  /**
   * Crédite le passif hors-ligne depuis `lastTickTimestamp` (plafond 24 h).
   * Si `lastTickTimestamp` est absent, ancre à maintenant sans rétroactif.
   * @returns Pièces ajoutées (0 si rien à créditer).
   */
  applyOfflinePassiveIncome: (ratePerMinute: number) => number;
};

export const useEconomyStore = create<EconomyStore>()(
  persist(
    (set, get) => ({
      coins: DEFAULT_COINS,
      lives: getEffectiveMaxLives(),
      lastLifeRechargeTime: null,
      lastBonusDate: null,
      lastTickTimestamp: null,
      passiveIncomePop: null,

      clearPassiveIncomePop: () => set({ passiveIncomePop: null }),

      applyOnlinePassiveIncomeTick: (unlockedNodes) => {
        const rate = computePassiveModifiers(unlockedNodes).totalPassiveIncomePerMinute;
        const now = Date.now();
        set((s) => {
          const add = rate > 0 ? Math.floor(rate) : 0;
          const nextId = (s.passiveIncomePop?.id ?? 0) + 1;
          return {
            ...s,
            coins: add > 0 ? s.coins + add : s.coins,
            lastTickTimestamp: now,
            passiveIncomePop: add > 0 ? { amount: add, id: nextId } : s.passiveIncomePop,
          };
        });
      },

      applyOfflinePassiveIncome: (ratePerMinute) => {
        const now = Date.now();
        const last = get().lastTickTimestamp;
        if (last == null) {
          set({ lastTickTimestamp: now });
          return 0;
        }
        const CAP_MS = 24 * 60 * 60 * 1000;
        const elapsed = Math.min(now - last, CAP_MS);
        const minutes = Math.floor(elapsed / 60_000);
        if (minutes <= 0) return 0;
        if (ratePerMinute <= 0) {
          set({ lastTickTimestamp: now });
          return 0;
        }
        const gain = Math.floor(minutes * ratePerMinute);
        if (gain > 0) {
          set((state) => ({
            ...state,
            coins: state.coins + gain,
            lastTickTimestamp: now,
          }));
          return gain;
        }
        set({ lastTickTimestamp: now });
        return 0;
      },

      checkLifeRecharge: () => {
        const now = Date.now();
        const maxLives = getEffectiveMaxLives();
        const rechargeMs = getEffectiveLifeRechargeMs();
        set((s) => {
          const { lives, lastLifeRechargeTime } = s;
          if (lives >= maxLives) {
            return lastLifeRechargeTime === null ? s : { ...s, lastLifeRechargeTime: null };
          }
          if (lastLifeRechargeTime == null) {
            return { ...s, lastLifeRechargeTime: now };
          }
          const elapsed = now - lastLifeRechargeTime;
          const gained = Math.floor(elapsed / rechargeMs);
          if (gained <= 0) return s;
          const newLives = Math.min(maxLives, lives + gained);
          const newAnchor = lastLifeRechargeTime + gained * rechargeMs;
          return {
            ...s,
            lives: newLives,
            lastLifeRechargeTime: newLives >= maxLives ? null : newAnchor,
          };
        });
      },

      addCoins: (amount) => {
        const n = Math.floor(amount);
        if (!Number.isFinite(n) || n <= 0) return;
        set((s) => ({ ...s, coins: s.coins + n }));
      },

      spendCoins: (amount) => {
        const n = Math.floor(amount);
        if (!Number.isFinite(n) || n <= 0) return false;
        const { coins } = get();
        if (coins < n) return false;
        set({ coins: coins - n });
        return true;
      },

      consumeLife: () => {
        const maxLives = getEffectiveMaxLives();
        set((s) => {
          if (s.lives <= 0) return s;
          const next = s.lives - 1;
          const lastLifeRechargeTime =
            next < maxLives ? (s.lastLifeRechargeTime ?? Date.now()) : null;
          return { ...s, lives: next, lastLifeRechargeTime };
        });
      },

      addLives: (amount) => {
        const n = Math.floor(amount);
        if (!Number.isFinite(n) || n <= 0) return;
        const maxLives = getEffectiveMaxLives();
        set((s) => {
          const next = Math.min(maxLives, s.lives + n);
          const lastLifeRechargeTime =
            next >= maxLives ? null : (s.lastLifeRechargeTime ?? Date.now());
          return { ...s, lives: next, lastLifeRechargeTime };
        });
      },

      refillLives: () => {
        set({ lives: getEffectiveMaxLives(), lastLifeRechargeTime: null });
      },

      claimDailyBonus: () => {
        const today = getLocalDateSeed();
        const prog = useProgressStore.getState();
        prog.addBoosters("demolition", 1);
        prog.addBoosters("spy", 1);
        set({ lastBonusDate: today });
      },

      wipeEconomyForPrestige: () => {
        const maxLives = getEffectiveMaxLives();
        set((s) => {
          const nextLives = Math.min(maxLives, s.lives);
          return {
            coins: 0,
            lives: nextLives,
            lastLifeRechargeTime:
              nextLives < maxLives ? (s.lastLifeRechargeTime ?? Date.now()) : null,
            lastTickTimestamp: Date.now(),
            passiveIncomePop: null,
          };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 4,
      storage: persistLocalStorage,
      partialize: (state) => ({
        coins: state.coins,
        lives: state.lives,
        lastLifeRechargeTime: state.lastLifeRechargeTime,
        lastBonusDate: state.lastBonusDate,
        lastTickTimestamp: state.lastTickTimestamp,
      }),
      migrate: (persisted, fromVersion) => {
        const base = (persisted ?? {}) as Record<string, unknown>;
        let lastBonusDate: string | null =
          typeof base.lastBonusDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(base.lastBonusDate)
            ? base.lastBonusDate
            : null;
        if (fromVersion < 1 && !lastBonusDate) {
          lastBonusDate = readPendingLastBonusFromProgressMigration();
        }
        const lives = normalizeLives(base.lives);
        const lastTickTimestamp =
          typeof base.lastTickTimestamp === "number" && Number.isFinite(base.lastTickTimestamp)
            ? base.lastTickTimestamp
            : null;
        return {
          coins: normalizeCoins(base.coins),
          lives,
          lastLifeRechargeTime:
            typeof base.lastLifeRechargeTime === "number" && Number.isFinite(base.lastLifeRechargeTime)
              ? base.lastLifeRechargeTime
              : null,
          lastBonusDate,
          lastTickTimestamp,
        };
      },
      onRehydrateStorage: () => (_finished, error) => {
        if (error) return;
        queueMicrotask(() => {
          useEconomyStore.getState().checkLifeRecharge();
        });
      },
    },
  ),
);
