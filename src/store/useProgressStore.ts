"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { LEVELS } from "@/src/lib/levels";
import { persistLocalStorage } from "@/src/lib/zustand-persist-storage";
import { DEFAULT_BOOSTERS, type BoosterType } from "@/src/types/boosters";

export type StarsCount = 0 | 1 | 2 | 3;

export type BoostersState = {
  demolition: number;
  spy: number;
  lobbying: number;
};

export type ProgressStore = {
  unlockedLevels: number[];
  starsByLevel: Record<string, StarsCount>;
  bestScoreByLevel: Record<string, number>;
  boosters: BoostersState;
  /** UUID guest stable (contrat CEO / sync serveur / classement). */
  playerId: string | null;
  /** Pseudo affiché (null tant que le joueur ne l’a pas choisi). */
  pseudo: string | null;
  /** Dernier niveau gagné (≥1★) — pour animer le CEO sur la carte ; consommé après l’anim. */
  lastCompletedLevelId: number | null;
  /** Prestige (faillite stratégique) : +10 % score final par palier. */
  prestigeLevel: number;
  /** Tutoriel gel fiscal (modale à brancher plus tard). */
  hasSeenFiscalFreezeTutorial: boolean;
  incrementPrestige: () => void;
  markFiscalFreezeTutorialSeen: () => void;
  /**
   * Fin de partie : meilleur score / étoiles, débloque le niveau suivant si au moins 1★.
   * Idempotent si les valeurs ne sont pas meilleures que l’existant.
   * La persistance serveur (`game_completions`) est déclenchée dans `recordGameCompletion`
   * au moment où la grille est complète (données grille + séquence disponibles).
   */
  commitLevelResult: (levelId: number, stars: StarsCount, score: number) => void;
  /** Remet la progression Saga locale à zéro (niveau 1 seulement débloqué). */
  resetCareer: () => void;
  consumeBooster: (type: BoosterType) => void;
  addBoosters: (type: BoosterType, amount: number) => void;
  clearLastCompletedLevel: () => void;
  setPseudo: (pseudo: string) => void;
};

const defaultUnlocked = (): number[] => [1];

const defaultBoosters = (): BoostersState => ({ ...DEFAULT_BOOSTERS });

function normalizeBoosters(raw: unknown): BoostersState {
  const b = defaultBoosters();
  if (!raw || typeof raw !== "object") return b;
  const o = raw as Record<string, unknown>;
  for (const k of Object.keys(b) as BoosterType[]) {
    const n = o[k];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) {
      b[k] = Math.floor(n);
    }
  }
  return b;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      unlockedLevels: defaultUnlocked(),
      starsByLevel: {},
      bestScoreByLevel: {},
      boosters: defaultBoosters(),
      playerId: null,
      pseudo: null,
      lastCompletedLevelId: null,
      prestigeLevel: 0,
      hasSeenFiscalFreezeTutorial: false,

      incrementPrestige: () => {
        set((s) => ({
          prestigeLevel: Math.min(999, Math.max(0, Math.floor(s.prestigeLevel)) + 1),
        }));
      },

      clearLastCompletedLevel: () => set({ lastCompletedLevelId: null }),

      markFiscalFreezeTutorialSeen: () => set({ hasSeenFiscalFreezeTutorial: true }),

      setPseudo: (raw) => {
        const t = raw.trim().slice(0, 15);
        if (!t) return;
        set({ pseudo: t });
      },

      resetCareer: () => {
        set((s) => ({
          unlockedLevels: defaultUnlocked(),
          starsByLevel: {},
          bestScoreByLevel: {},
          boosters: defaultBoosters(),
          lastCompletedLevelId: null,
          playerId: s.playerId,
          pseudo: s.pseudo,
          prestigeLevel: s.prestigeLevel,
          hasSeenFiscalFreezeTutorial: false,
        }));
      },

      consumeBooster: (type) => {
        if (type !== "demolition" && type !== "spy" && type !== "lobbying") return;
        set((s) => {
          const prev = s.boosters[type];
          if (prev <= 0) return s;
          return { boosters: { ...s.boosters, [type]: prev - 1 } };
        });
      },

      addBoosters: (type, amount) => {
        if (type !== "demolition" && type !== "spy" && type !== "lobbying") return;
        const n = Math.floor(amount);
        if (!Number.isFinite(n) || n <= 0) return;
        set((s) => ({
          boosters: { ...s.boosters, [type]: s.boosters[type] + n },
        }));
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
            lastCompletedLevelId: stars >= 1 ? levelId : null,
          };
        });
      },
    }),
    {
      name: "planet-ponzi-progress",
      version: 10,
      storage: persistLocalStorage,
      partialize: (state) => ({
        unlockedLevels: state.unlockedLevels,
        starsByLevel: state.starsByLevel,
        bestScoreByLevel: state.bestScoreByLevel,
        boosters: state.boosters,
        lastCompletedLevelId: state.lastCompletedLevelId,
        playerId: state.playerId,
        pseudo: state.pseudo,
        prestigeLevel: state.prestigeLevel,
        hasSeenFiscalFreezeTutorial: state.hasSeenFiscalFreezeTutorial,
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
        if (fromVersion < 5) {
          const raw = base.boosters;
          const ok =
            raw &&
            typeof raw === "object" &&
            typeof (raw as { demolition?: unknown }).demolition === "number" &&
            Number.isFinite((raw as { demolition: number }).demolition);
          if (!ok) {
            base = { ...base, boosters: defaultBoosters() };
          }
        }
        if (fromVersion < 6) {
          base = {
            ...base,
            boosters: normalizeBoosters(base.boosters),
            lastCompletedLevelId:
              typeof base.lastCompletedLevelId === "number" && base.lastCompletedLevelId >= 1
                ? base.lastCompletedLevelId
                : null,
          };
        }
        if (fromVersion < 7) {
          const pid = base.playerId;
          const pse = base.pseudo;
          const lbd = base.lastBonusDate;
          const uuidRe =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          base = {
            ...base,
            playerId: typeof pid === "string" && uuidRe.test(pid) ? pid : null,
            pseudo: typeof pse === "string" && pse.trim() ? pse.trim().slice(0, 15) : null,
            lastBonusDate:
              typeof lbd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(lbd) ? lbd : null,
          };
        }
        if (fromVersion < 8) {
          const lbd = base.lastBonusDate;
          if (
            typeof window !== "undefined" &&
            typeof lbd === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(lbd)
          ) {
            try {
              localStorage.setItem("pp-pending-lastBonus-for-economy", lbd);
            } catch {
              /* ignore */
            }
          }
          delete (base as { lastBonusDate?: unknown }).lastBonusDate;
        }
        if (fromVersion < 9) {
          const pl = base.prestigeLevel;
          const n =
            typeof pl === "number" && Number.isFinite(pl) ? Math.min(999, Math.max(0, Math.floor(pl))) : 0;
          base = { ...base, prestigeLevel: n };
        }
        if (fromVersion < 10) {
          base = {
            ...base,
            hasSeenFiscalFreezeTutorial:
              typeof base.hasSeenFiscalFreezeTutorial === "boolean"
                ? base.hasSeenFiscalFreezeTutorial
                : false,
          };
        }
        return base;
      },
    },
  ),
);
