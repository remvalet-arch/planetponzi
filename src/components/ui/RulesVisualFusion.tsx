"use client";

import { motion } from "framer-motion";

/**
 * Mini-grille 2×2 pour la directive « synergie de groupe » (fusion méga).
 */
export function RulesVisualFusion() {
  return (
    <div
      className="mx-auto grid w-max grid-cols-2 gap-1 rounded-lg border border-cyan-500/35 bg-slate-950/80 p-2 shadow-inner shadow-cyan-950/40"
      aria-hidden
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="flex size-9 items-center justify-center rounded border border-cyan-400/50 bg-gradient-to-b from-slate-800 to-slate-950 text-base"
          animate={{
            scale: [1, 1.06, 1],
            boxShadow: [
              "0 0 0 0 rgba(34,211,238,0.12)",
              "0 0 14px 2px rgba(34,211,238,0.35)",
              "0 0 0 0 rgba(34,211,238,0.12)",
            ],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.12,
          }}
        >
          ⬛
        </motion.span>
      ))}
    </div>
  );
}
