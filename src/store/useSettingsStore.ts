"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { persistLocalStorage } from "@/src/lib/zustand-persist-storage";

const STORAGE_KEY = "planet-ponzi-settings";

export type SettingsStore = {
  /** Si false, aucun appel à `navigator.vibrate` (accessibilité). */
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hapticsEnabled: true,

      setHapticsEnabled: (enabled) => {
        set({ hapticsEnabled: Boolean(enabled) });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: persistLocalStorage,
      partialize: (state) => ({ hapticsEnabled: state.hapticsEnabled }),
    },
  ),
);
