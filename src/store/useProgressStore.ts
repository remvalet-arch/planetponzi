"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { LEVELS } from "@/src/lib/levels";

export type StarsCount = 0 | 1 | 2 | 3;

export type ProgressStore = {
  unlockedLevels: number[];
  starsByLevel: Record<string, StarsCount>;
  bestScoreByLevel: Record<string, number>;
  /**
   * Fin de partie : meilleur score / étoiles, débloque le niveau suivant si au moins 1★.
   * Idempotent si les valeurs ne sont pas meilleures que l’existant.
   * La persistance serveur (`game_completions`) est déclenchée dans `recordGameCompletion`
   * au moment où la grille est complète (données grille + séquence disponibles).
   */
  commitLevelResult: (levelId: number, stars: StarsCount, score: number) => void;
  /** Remet la progression Saga locale à zéro (niveau 1 seulement débloqué). */
  resetCareer: () => void;
};

const defaultUnlocked = (): number[] => [1];

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      unlockedLevels: defaultUnlocked(),
      starsByLevel: {},
      bestScoreByLevel: {},

      resetCareer: () => {
        set({
          unlockedLevels: defaultUnlocked(),
          starsByLevel: {},
          bestScoreByLevel: {},
        });
      },

      commitLevelResult: (levelId, stars, score) => {
        const key = String(levelId);
        set((s) => {
          const prevStars = s.starsByLevel[key] ?? 0;
          const nextStars = Math.max(prevStars, stars) as StarsCount;
          const prevBest = s.bestScoreByLevel[key] ?? Number.NEGATIVE_INFINITY;
          const nextBest = Math.max(prevBest, score);

          const unlocked = new Set(s.unlockedLevels);
          if (stars >= 1) {
            const nextLevelId = levelId + 1;
            if (LEVELS.some((l) => l.id === nextLevelId)) {
              unlocked.add(nextLevelId);
            }
          }

          return {
            unlockedLevels: Array.from(unlocked).sort((a, b) => a - b),
            starsByLevel: { ...s.starsByLevel, [key]: nextStars },
            bestScoreByLevel: { ...s.bestScoreByLevel, [key]: nextBest },
          };
        });
      },
    }),
    {
      name: "planet-ponzi-progress",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        unlockedLevels: state.unlockedLevels,
        starsByLevel: state.starsByLevel,
        bestScoreByLevel: state.bestScoreByLevel,
      }),
      migrate: (persisted, fromVersion) => {
        let base = (persisted ?? {}) as Record<string, unknown>;
        if (fromVersion < 2) {
          base = { ...base, bestScoreByLevel: {} };
        }
        if (fromVersion < 3) {
          const ids = new Set(LEVELS.map((l) => l.id));
          const raw = base.unlockedLevels;
          const unlocked = Array.isArray(raw)
            ? (raw as unknown[]).filter((n): n is number => typeof n === "number" && ids.has(n))
            : [];
          base = {
            ...base,
            unlockedLevels: unlocked.length ? [...new Set(unlocked)].sort((a, b) => a - b) : [1],
          };
        }
        return base;
      },
    },
  ),
);
