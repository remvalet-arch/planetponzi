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
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

type EntryStep = "brief" | "difficulty";

type GameEntryFlowProps = {
  /** Afficher le flux (mandat du jour sans difficulté encore choisie). */
  open: boolean;
};

const stepMotion = {
  initial: { scale: 0.98, opacity: 0, y: 8 },
  animate: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.98, opacity: 0, y: 6 },
  transition: { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.88 },
};

const thumbPad =
  "pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 px-4 border-t border-pp-border-strong bg-pp-surface/95 backdrop-blur-sm";

/**
 * Avant la partie : briefing → choix de difficulté (CTA en zone pouce, bottom sheet).
 */
export function GameEntryFlow({ open }: GameEntryFlowProps) {
  const seed = useLevelRunStore((s) => s.seed);
  const lockedSeed = useLevelRunStore((s) => s.deckChallengeLockedSeed);
  const confirmDeckDifficulty = useLevelRunStore((s) => s.confirmDeckDifficulty);

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
    <div className="pp-modal-backdrop !z-[200]" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-flow-title"
        className="pp-modal-panel max-w-md"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pp-bottom-sheet-handle" aria-hidden />

        <div className="flex shrink-0 justify-center gap-2 border-b border-pp-border px-4 py-2.5" aria-hidden>
          {(["brief", "difficulty"] as const).map((s, i) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex ? "w-6 bg-pp-accent" : "w-1.5 bg-pp-border-strong"
              }`}
            />
          ))}
        </div>

        <p className="shrink-0 px-4 pt-2 text-center font-mono text-[10px] uppercase tracking-widest text-pp-text-dim">
          Mandat · {seed}
        </p>

        <div className="pp-allow-select min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3">
          <AnimatePresence mode="wait">
            {step === "brief" ? (
              <motion.div key="brief" {...stepMotion}>
                <OnboardingKingdominoBrief />
              </motion.div>
            ) : (
              <motion.div key="difficulty" {...stepMotion} className="flex flex-col gap-3 pb-2">
                <div>
                  <h1
                    id="entry-flow-title"
                    className="font-mono text-lg font-bold tracking-tight text-pp-text"
                  >
                    Niveau de difficulté
                  </h1>
                  <p className="mt-2 font-mono text-xs leading-snug text-pp-text-muted">
                    Un choix par jour (minuit local). Le coefficient s&apos;applique au ROI total en fin
                    de grille.
                  </p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setStep("brief")}
                    className="mt-3 flex items-center gap-1 font-mono text-[11px] text-pp-text-dim hover:text-pp-text-muted"
                  >
                    <ChevronLeft className="size-3.5" strokeWidth={2} aria-hidden />
                    Retour au briefing
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === "brief" ? (
          <div className={`shrink-0 ${thumbPad}`}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setStep("difficulty")}
              className="pp-tap-bounce flex min-h-14 w-full items-center justify-center rounded-pp-xl border-2 border-pp-gold-dark/40 bg-gradient-to-r from-pp-gold via-amber-300 to-pp-gold font-mono text-sm font-semibold text-amber-950 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/50"
            >
              Signer le contrat de profit
            </motion.button>
          </div>
        ) : null}

        {step === "difficulty" ? (
          <div className={`shrink-0 ${thumbPad} flex flex-col gap-2`}>
            {DECK_CHALLENGE_LEVELS.filter((lvl) => lvl !== 4).map((lvl) => (
              <motion.button
                key={lvl}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => pickDifficulty(lvl as DeckChallengeLevel)}
                className="flex min-h-14 w-full flex-col items-stretch justify-center rounded-pp-xl border border-pp-border-strong bg-pp-elevated/95 px-4 py-3 text-left font-mono text-sm text-pp-text shadow-md transition-colors hover:border-pp-accent/45 hover:bg-pp-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60"
              >
                <span className="font-semibold text-pp-accent">
                  {getDeckChallengeTitle(lvl as DeckChallengeLevel)}
                </span>
                <span className="mt-0.5 block text-[11px] text-pp-text-muted">
                  {lvl === 0
                    ? "Tout visible sur le manifeste · ×1"
                    : lvl === 1
                      ? `1 compte masqué · ${formatMultiplierFr(lvl as DeckChallengeLevel)} sur le ROI`
                      : `${lvl} comptes masqués · ${formatMultiplierFr(lvl as DeckChallengeLevel)} sur le ROI`}
                </span>
              </motion.button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
