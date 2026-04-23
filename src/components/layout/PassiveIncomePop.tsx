"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useEconomyStore } from "@/src/store/useEconomyStore";

/**
 * Court +vert qui monte quand le tick passif online crédite des pièces.
 */
export function PassiveIncomePop() {
  const pop = useEconomyStore((s) => s.passiveIncomePop);
  const clearPassiveIncomePop = useEconomyStore((s) => s.clearPassiveIncomePop);

  useEffect(() => {
    if (!pop) return;
    const id = window.setTimeout(() => clearPassiveIncomePop(), 1_400);
    return () => window.clearTimeout(id);
  }, [pop, clearPassiveIncomePop]);

  return (
    <span className="pointer-events-none absolute -right-2 top-1/2 z-10 -translate-y-1/2 sm:-right-3">
      <AnimatePresence mode="wait">
        {pop ? (
          <motion.span
            key={pop.id}
            initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: -18, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -28 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-[11px] font-bold tabular-nums text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)] sm:text-xs"
          >
            +{pop.amount}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
