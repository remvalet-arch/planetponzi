"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getLocalDateSeed } from "@/src/lib/rng";
import { useProgressStore } from "@/src/store/useProgressStore";

const STORAGE_KEY = "planet-ponzi-economy";
const PENDING_LAST_BONUS_KEY = "pp-pending-lastBonus-for-economy";
const DEFAULT_COINS = 100;

/** Plafond vies (mode hardcore). Exporté pour l’UI (EconomyHeader, etc.). */
export const MAX_LIVES = 3;

/** Délai entre deux recharges +1 vie lorsque `lives` &lt; MAX_LIVES. */
export const LIFE_RECHARGE_MS = 20 * 60 * 1000;

function normalizeCoins(n: unknown): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return DEFAULT_COINS;
  return Math.max(0, Math.floor(n));
}

function normalizeLives(n: unknown): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return MAX_LIVES;
  return Math.min(MAX_LIVES, Math.max(0, Math.floor(n)));
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
  /** Horodatage (ms) servant d’ancre pour les recharges +1 vie lorsque `lives` &lt; MAX_LIVES. */
  lastLifeRechargeTime: number | null;
  /** Dernier jour (YYYY-MM-DD local) où le bonus quotidien carte a été encaissé. */
  lastBonusDate: string | null;

  checkLifeRecharge: () => void;
  addCoins: (amount: number) => void;
  /** Retourne `false` si solde insuffisant (aucune dépense). */
  spendCoins: (amount: number) => boolean;
  consumeLife: () => void;
  refillLives: () => void;
  claimDailyBonus: () => void;
};

export const useEconomyStore = create<EconomyStore>()(
  persist(
    (set, get) => ({
      coins: DEFAULT_COINS,
      lives: MAX_LIVES,
      lastLifeRechargeTime: null,
      lastBonusDate: null,

      checkLifeRecharge: () => {
        const now = Date.now();
        set((s) => {
          const { lives, lastLifeRechargeTime } = s;
          if (lives >= MAX_LIVES) {
            return lastLifeRechargeTime === null ? s : { ...s, lastLifeRechargeTime: null };
          }
          if (lastLifeRechargeTime == null) {
            return { ...s, lastLifeRechargeTime: now };
          }
          const elapsed = now - lastLifeRechargeTime;
          const gained = Math.floor(elapsed / LIFE_RECHARGE_MS);
          if (gained <= 0) return s;
          const newLives = Math.min(MAX_LIVES, lives + gained);
          const newAnchor = lastLifeRechargeTime + gained * LIFE_RECHARGE_MS;
          return {
            ...s,
            lives: newLives,
            lastLifeRechargeTime: newLives >= MAX_LIVES ? null : newAnchor,
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
        set((s) => {
          if (s.lives <= 0) return s;
          const next = s.lives - 1;
          const lastLifeRechargeTime =
            next < MAX_LIVES ? (s.lastLifeRechargeTime ?? Date.now()) : null;
          return { ...s, lives: next, lastLifeRechargeTime };
        });
      },

      refillLives: () => {
        set({ lives: MAX_LIVES, lastLifeRechargeTime: null });
      },

      claimDailyBonus: () => {
        const today = getLocalDateSeed();
        const prog = useProgressStore.getState();
        prog.addBoosters("demolition", 1);
        prog.addBoosters("spy", 1);
        set({ lastBonusDate: today });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        coins: state.coins,
        lives: state.lives,
        lastLifeRechargeTime: state.lastLifeRechargeTime,
        lastBonusDate: state.lastBonusDate,
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
        return {
          coins: normalizeCoins(base.coins),
          lives: normalizeLives(base.lives),
          lastLifeRechargeTime:
            typeof base.lastLifeRechargeTime === "number" && Number.isFinite(base.lastLifeRechargeTime)
              ? base.lastLifeRechargeTime
              : null,
          lastBonusDate,
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
