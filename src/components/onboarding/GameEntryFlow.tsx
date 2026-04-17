"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";

import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
import { markRulesFirstVisitDone } from "@/src/components/ui/RulesModal";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { getLevelById } from "@/src/lib/levels";
import { markTutorialCompleted } from "@/src/lib/onboarding-flags";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

const thumbPad =
  "pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 px-4 border-t border-pp-border-strong bg-pp-surface/95 backdrop-blur-sm";

type GameEntryFlowProps = {
  /** Afficher le flux (mandat prêt, exploitation pas encore lancée). */
  open: boolean;
};

/**
 * Avant la partie : cibles d’étoiles + lancement (deck imposé par la définition Saga).
 */
export function GameEntryFlow({ open }: GameEntryFlowProps) {
  const { t } = useAppStrings();
  const seed = useLevelRunStore((s) => s.seed);
  const lockedSeed = useLevelRunStore((s) => s.deckChallengeLockedSeed);
  const levelId = useLevelRunStore((s) => s.levelId);
  const beginPlacement = useLevelRunStore((s) => s.beginPlacement);

  const sheetOpen = open && lockedSeed !== seed;
  const def = levelId > 0 ? getLevelById(levelId) : undefined;

  const handlePlay = useCallback(() => {
    markRulesFirstVisitDone();
    markTutorialCompleted();
    beginPlacement();
  }, [beginPlacement]);

  const footer = (
    <div className={thumbPad}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handlePlay}
        disabled={!def}
        className="pp-tap-bounce flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-pp-xl border-2 border-pp-gold-dark/40 bg-gradient-to-r from-pp-gold via-amber-300 to-pp-gold px-4 font-mono text-sm font-bold text-amber-950 shadow-lg transition-[filter] hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{t.entryFlow.cta}</span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-900/90">
          {t.entryFlow.ctaSub}
        </span>
      </motion.button>
    </div>
  );

  return (
    <BottomSheetShell
      open={sheetOpen}
      onClose={() => {}}
      closeOnBackdropPress={false}
      backdropClassName="!z-[285]"
      panelClassName="!max-h-[min(92dvh,720px)] flex flex-col overflow-hidden border-t border-pp-border-strong bg-pp-surface"
      footer={footer}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 pb-4 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-pp-text-dim">
          {t.entryFlow.mandate} · {seed || "—"}
        </p>
        <h2
          id="entry-flow-title"
          className="mt-3 font-mono text-lg font-bold tracking-tight text-pp-text"
        >
          {t.entryFlow.objectives}
        </h2>

        {def ? (
          <ul
            className="mt-5 space-y-3 font-mono text-sm leading-relaxed text-pp-text"
            aria-label={t.entryFlow.objectives}
          >
            <li>
              1★ ={" "}
              <span className="font-bold tabular-nums text-amber-200">{def.stars.one}</span>{" "}
              {t.entryFlow.ptsSuffix}
            </li>
            <li>
              2★ ={" "}
              <span className="font-bold tabular-nums text-amber-200">{def.stars.two}</span>{" "}
              {t.entryFlow.ptsSuffix}
            </li>
            <li>
              3★ ={" "}
              <span className="font-bold tabular-nums text-amber-200">{def.stars.three}</span>{" "}
              {t.entryFlow.ptsSuffix}
            </li>
          </ul>
        ) : (
          <p className="mt-5 font-mono text-sm text-pp-text-muted">{t.entryFlow.loading}</p>
        )}
      </div>
    </BottomSheetShell>
  );
}
