"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  closeEmpirePrerequisiteGaps,
  computePassiveModifiers,
  EMPIRE_FLOORS,
  EMPIRE_MINING_FLOOR_IDS,
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
      version: 5,
      storage: persistLocalStorage,
      partialize: (state) => ({ unlockedNodes: state.unlockedNodes }),
      migrate: (persisted, fromVersion) => {
        const base = (persisted ?? {}) as { unlockedNodes?: Record<string, boolean> };
        const raw = base.unlockedNodes;
        const merged = { ...initialUnlockedNodes(), ...(typeof raw === "object" && raw ? raw : {}) };
        for (const f of EMPIRE_FLOORS) {
          if (f.defaultUnlocked) merged[f.id] = true;
        }
        /** Ancien id unique « Ferme de Minage (Bots) » → premier palier minage. */
        if (merged["ferme-minage-bots"]) {
          merged["botnet-etudiant"] = true;
          delete merged["ferme-minage-bots"];
        }
        /** v1 : « Direction » sans minage — évite un cul-de-sac (ancien ordre). */
        if (fromVersion < 2 && merged["etage-direction"]) {
          merged["botnet-etudiant"] = true;
        }
        /** v2→v3 : la chaîne minage compte 6 paliers ; si Direction était déjà débloquée, on aligne la progression. */
        if (fromVersion < 3 && merged["etage-direction"]) {
          for (const id of EMPIRE_MINING_FLOOR_IDS) {
            merged[id] = true;
          }
        }
        /**
         * v4 : nouvel ordre (Botnet avant Open Space) — si l’open space était pris sans botnet
         * (ancien arbre), on accorde le palier Botnet pour éviter un blocage de prérequis.
         */
        if (fromVersion < 4 && merged["open-space-toxique"] && !merged["botnet-etudiant"]) {
          merged["botnet-etudiant"] = true;
        }
        /**
         * v5 : chaîne de prérequis complète — l’ancienne migration minage (v3) pouvait laisser
         * des étages utilitaires (héliport, open space…) à false tout en marquant le calculateur,
         * ce qui bloquait définitivement « Siphonage Orbital ».
         */
        const unlockedNodes =
          fromVersion < 5 ? closeEmpirePrerequisiteGaps(merged) : merged;
        return { unlockedNodes };
      },
    },
  ),
);

/** Bonus passifs (lecture synchrone du store Empire). */
export function getPassiveModifiers(): EmpirePassiveModifiers {
  return useEmpireStore.getState().getPassiveModifiers();
}
