"use client";

import { motion } from "framer-motion";

import { getBuildingTheme } from "@/src/lib/ui-helpers";
import type { Cell as CellModel } from "@/src/types/game";

const baseTileClasses =
  "flex aspect-square w-full items-center justify-center rounded-lg text-3xl sm:text-4xl select-none";

export type CellProps = {
  cell: CellModel;
  /** Placement normal (case vide) ou démolition (case occupée). */
  onClick?: () => void;
  /** Mode marteau : surbrillance des cases occupées. */
  demolitionTarget?: boolean;
  /** Après démolition : flash / secousse sur la case devenue vide. */
  demolishFlashNonce?: number;
};

export function Cell({ cell, onClick, demolitionTarget, demolishFlashNonce = 0 }: CellProps) {
  const { building } = cell;

  if (building === null) {
    const interactive = Boolean(onClick);
    const hasFlash = demolishFlashNonce > 0;

    return (
      <motion.button
        type="button"
        key={hasFlash ? `fl-${cell.index}-${demolishFlashNonce}` : `empty-${cell.index}`}
        disabled={!interactive}
        whileTap={interactive ? { scale: 0.92 } : undefined}
        onClick={onClick}
        initial={hasFlash ? { opacity: 0.35, scale: 0.85, x: 0 } : false}
        animate={
          hasFlash
            ? {
                opacity: [0.45, 1, 0.88, 1],
                scale: [0.88, 1.1, 0.96, 1],
                x: [0, -5, 5, -4, 4, 0],
              }
            : { opacity: 1, scale: 1, x: 0 }
        }
        transition={
          hasFlash ? { duration: 0.44, ease: [0.22, 1, 0.36, 1] } : { duration: 0.15 }
        }
        className={`${baseTileClasses} border-2 border-dashed border-pp-border-strong bg-pp-surface/50 text-pp-text-dim backdrop-blur-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60 ${
          interactive
            ? "cursor-pointer hover:border-pp-accent/50 hover:bg-pp-gold/15 hover:text-pp-text"
            : "cursor-not-allowed opacity-55"
        } ${hasFlash ? "ring-2 ring-rose-400/75 ring-offset-2 ring-offset-pp-bg" : ""}`}
        aria-label={`Case ${cell.index + 1}, vide`}
      >
        <span className="text-xs font-mono uppercase tracking-widest text-pp-text-dim">+</span>
      </motion.button>
    );
  }

  const theme = getBuildingTheme(building);
  const interactive = Boolean(onClick);

  if (interactive) {
    return (
      <motion.button
        type="button"
        layout
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        className={`${baseTileClasses} ${theme.color} shadow-inner shadow-white/25 ring-2 transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400/80 ${
          demolitionTarget
            ? "cursor-crosshair ring-rose-500/90 shadow-[0_0_22px_rgb(244_63_94/0.5)]"
            : "ring-transparent"
        }`}
        aria-label={`Démolir ${building} — case ${cell.index + 1}`}
      >
        <span aria-hidden className="drop-shadow-sm">
          {theme.emoji}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      layout
      initial={{ scale: 0.82, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={`${baseTileClasses} ${theme.color} shadow-inner shadow-white/25 ${
        demolitionTarget ? "ring-2 ring-rose-500/55" : ""
      }`}
      aria-label={`Bâtiment ${building}`}
    >
      <span aria-hidden className="drop-shadow-sm">
        {theme.emoji}
      </span>
    </motion.div>
  );
}
