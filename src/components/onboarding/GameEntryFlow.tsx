"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { OnboardingKingdominoBrief } from "@/src/components/onboarding/OnboardingKingdominoBrief";
import { markRulesFirstVisitDone } from "@/src/components/ui/RulesModal";
import {
  formatMultiplierFr,
  getDeckChallengeTitle,
} from "@/src/lib/difficulty";
import { markTutorialCompleted } from "@/src/lib/onboarding-flags";
import { DECK_CHALLENGE_LEVELS, type DeckChallengeLevel } from "@/src/types/game";
import { useGameStore } from "@/src/store/useGameStore";

type EntryStep = "brief" | "difficulty";

type GameEntryFlowProps = {
  /** Afficher le flux (mandat du jour sans difficulté encore choisie). */
  open: boolean;
};

const stepMotion = {
  initial: { scale: 0.94, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.96, opacity: 0 },
  transition: { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.88 },
};

/**
 * Avant la partie : briefing (pitch + actifs + difficulté + conseil) → choix de difficulté,
 * puis manifeste + grille.
 */
export function GameEntryFlow({ open }: GameEntryFlowProps) {
  const seed = useGameStore((s) => s.seed);
  const lockedSeed = useGameStore((s) => s.deckChallengeLockedSeed);
  const confirmDeckDifficulty = useGameStore((s) => s.confirmDeckDifficulty);

  const [step, setStep] = useState<EntryStep>("brief");

  useEffect(() => {
    if (!open) queueMicrotask(() => setStep("brief"));
  }, [open, seed]);

  const pickDifficulty = useCallback(
    (lvl: DeckChallengeLevel) => {
      markRulesFirstVisitDone();
      markTutorialCompleted();
      confirmDeckDifficulty(lvl);
    },
    [confirmDeckDifficulty],
  );

  if (!open || lockedSeed === seed) return null;

  const stepIndex = step === "brief" ? 0 : 1;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-y-auto bg-pp-bg px-3 py-6 sm:px-4 sm:py-8"
      style={{ backgroundColor: "var(--pp-bg)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-flow-title"
    >
      <div
        className="w-full max-w-md rounded-pp-2xl border p-4 shadow-pp-modal sm:p-5"
        style={{
          borderColor: "var(--pp-border-strong)",
          backgroundColor: "color-mix(in srgb, var(--pp-elevated) 60%, transparent)",
          boxShadow: "var(--pp-shadow-modal)",
        }}
      >
        <div className="mb-3 flex justify-center gap-2 sm:mb-4" aria-hidden>
          {(["brief", "difficulty"] as const).map((s, i) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex ? "w-6 bg-pp-accent" : "w-1.5 bg-pp-border-strong"
              }`}
            />
          ))}
        </div>

        <p className="pp-kicker text-center sm:text-left">Mandat {seed}</p>

        <AnimatePresence mode="wait">
          {step === "brief" ? (
            <motion.div key="brief" {...stepMotion}>
              <OnboardingKingdominoBrief onSignContract={() => setStep("difficulty")} />
            </motion.div>
          ) : (
            <motion.div key="difficulty" {...stepMotion} className="flex flex-col gap-4">
              <div>
                <h1
                  id="entry-flow-title"
                  className="mt-2 font-mono text-lg font-bold tracking-tight text-pp-text"
                >
                  Niveau de difficulté
                </h1>
                <p className="mt-2 font-mono text-xs leading-snug text-pp-text-muted">
                  Un choix par jour (minuit local). Le coefficient s&apos;applique au ROI total en fin
                  de grille.
                </p>
                <button
                  type="button"
                  onClick={() => setStep("brief")}
                  className="mt-3 flex items-center gap-1 font-mono text-[11px] text-pp-text-dim hover:text-pp-text-muted"
                >
                  <ChevronLeft className="size-3.5" strokeWidth={2} aria-hidden />
                  Retour au briefing
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {DECK_CHALLENGE_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => pickDifficulty(lvl as DeckChallengeLevel)}
                    className="min-h-14 rounded-pp-xl border border-pp-border-strong bg-pp-bg/80 px-4 py-3 text-left font-mono text-sm text-pp-text transition-colors hover:border-pp-accent/50 hover:bg-cyan-950/25 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60"
                  >
                    <span className="font-semibold text-cyan-100">
                      {getDeckChallengeTitle(lvl as DeckChallengeLevel)}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-pp-text-muted">
                      {lvl === 0
                        ? "Tout visible sur le manifeste · ×1"
                        : `${lvl} comptes masqués · ${formatMultiplierFr(lvl as DeckChallengeLevel)} sur le ROI`}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
