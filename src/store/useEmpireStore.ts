"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  computePassiveModifiers,
  EMPIRE_FLOORS,
  getEmpireFloorById,
  type EmpirePassiveModifiers,
} from "@/src/lib/empire-tower";
import { persistLocalStorage } from "@/src/lib/zustand-persist-storage";

const STORAGE_KEY = "planet-ponzi-empire";

function initialUnlockedNodes(): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const f of EMPIRE_FLOORS) {
    if (f.defaultUnlocked) out[f.id] = true;
  }
  return out;
}

export type EmpireStore = {
  unlockedNodes: Record<string, boolean>;
  /** Achat d’un étage : vérifie coût, solde, prérequis, dépense les coins. Retourne false si refusé. */
  purchaseNode: (nodeId: string, cost: number) => boolean;
  /** Prestige : repart de la fondation (garde les étages `defaultUnlocked`). */
  resetTowerAfterBankruptcy: () => void;
  getPassiveModifiers: () => EmpirePassiveModifiers;
};

export const useEmpireStore = create<EmpireStore>()(
  persist(
    (set, get) => ({
      unlockedNodes: initialUnlockedNodes(),

      getPassiveModifiers: () => computePassiveModifiers(get().unlockedNodes),

      resetTowerAfterBankruptcy: () => {
        set({ unlockedNodes: initialUnlockedNodes() });
      },

      purchaseNode: (nodeId: string, cost: number) => {
        const floor = getEmpireFloorById(nodeId);
        if (!floor || floor.cost !== cost) return false;
        const { unlockedNodes } = get();
        if (unlockedNodes[nodeId]) return false;

        const ordered = [...EMPIRE_FLOORS].sort((a, b) => a.order - b.order);
        for (const f of ordered) {
          if (f.order >= floor.order) continue;
          if (!unlockedNodes[f.id]) return false;
        }

        if (floor.cost > 0) {
          const { useEconomyStore } =
            // eslint-disable-next-line @typescript-eslint/no-require-imports -- évite cycle empire ↔ economy à l’init du module
            require("@/src/store/useEconomyStore") as typeof import("@/src/store/useEconomyStore");
          if (!useEconomyStore.getState().spendCoins(floor.cost)) return false;
        }

        set({ unlockedNodes: { ...get().unlockedNodes, [nodeId]: true } });
        return true;
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: persistLocalStorage,
      partialize: (state) => ({ unlockedNodes: state.unlockedNodes }),
      migrate: (persisted, fromVersion) => {
        const base = (persisted ?? {}) as { unlockedNodes?: Record<string, boolean> };
        const raw = base.unlockedNodes;
        const merged = { ...initialUnlockedNodes(), ...(typeof raw === "object" && raw ? raw : {}) };
        for (const f of EMPIRE_FLOORS) {
          if (f.defaultUnlocked) merged[f.id] = true;
        }
        /** Ancienne progression : « Direction » avant l’étage Ferme de Minage — évite un cul-de-sac. */
        if (fromVersion < 2 && merged["etage-direction"]) {
          merged["ferme-minage-bots"] = true;
        }
        return { unlockedNodes: merged };
      },
    },
  ),
);

/** Bonus passifs (lecture synchrone du store Empire). */
export function getPassiveModifiers(): EmpirePassiveModifiers {
  return useEmpireStore.getState().getPassiveModifiers();
}
