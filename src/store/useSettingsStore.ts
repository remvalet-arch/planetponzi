"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { persistLocalStorage } from "@/src/lib/zustand-persist-storage";

const STORAGE_KEY = "planet-ponzi-settings";

export type SettingsStore = {
  /** Si false, aucun appel à `navigator.vibrate` (accessibilité). */
  hapticsEnabled: boolean;
  /** Si false, les effets Web Audio de jeu sont coupés (`game-sounds.ts`). */
  soundEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hapticsEnabled: true,
      soundEnabled: true,

      setHapticsEnabled: (enabled) => {
        set({ hapticsEnabled: Boolean(enabled) });
      },

      setSoundEnabled: (enabled) => {
        set({ soundEnabled: Boolean(enabled) });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: persistLocalStorage,
      partialize: (state) => ({
        hapticsEnabled: state.hapticsEnabled,
        soundEnabled: state.soundEnabled,
      }),
      migrate: (persisted) => {
        const p = (persisted ?? {}) as { hapticsEnabled?: boolean; soundEnabled?: boolean };
        return {
          hapticsEnabled: p.hapticsEnabled !== false,
          soundEnabled: typeof p.soundEnabled === "boolean" ? p.soundEnabled : true,
        };
      },
    },
  ),
);
