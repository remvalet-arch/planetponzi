"use client";

import { motion } from "framer-motion";

import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

/**
 * Pop M$ après placement (tutoriel / dopamine) — une cellule, disparaît vers le haut.
 */
export function TutorialScoreFloat() {
  const { t } = useAppStrings();
  const scorePop = useLevelRunStore((s) => s.scorePop);

  if (!scorePop) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[35] grid grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2"
      aria-hidden
    >
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} className="relative flex min-h-0 items-start justify-center">
          {i === scorePop.cellIndex ? (
            <motion.span
              key={scorePop.nonce}
              initial={{ opacity: 0, y: 6, scale: 0.85 }}
              animate={{ opacity: [0, 1, 1, 0], y: [6, -6, -32, -44], scale: [0.85, 1.05, 1, 0.92] }}
              transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1 font-mono text-[11px] font-black tabular-nums text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.55)] sm:text-xs"
            >
              +{scorePop.amount}
              {t.entryFlow.msUnit}
            </motion.span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
