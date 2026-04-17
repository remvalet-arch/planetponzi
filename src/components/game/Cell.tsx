"use client";

import { motion } from "framer-motion";

import { getBuildingTheme } from "@/src/lib/ui-helpers";
import type { Cell as CellModel } from "@/src/types/game";

const baseTileClasses =
  "flex aspect-square w-full items-center justify-center rounded-lg text-3xl sm:text-4xl select-none";

export type CellProps = {
  cell: CellModel;
  onClick?: () => void;
};

export function Cell({ cell, onClick }: CellProps) {
  const { building } = cell;

  if (building === null) {
    const interactive = Boolean(onClick);
    return (
      <motion.button
        type="button"
        disabled={!interactive}
        whileTap={interactive ? { scale: 0.92 } : undefined}
        onClick={onClick}
        className={`${baseTileClasses} border-2 border-dashed border-pp-border-strong bg-pp-surface/50 text-pp-text-dim backdrop-blur-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60 ${
          interactive
            ? "cursor-pointer hover:border-pp-accent/50 hover:bg-pp-gold/15 hover:text-pp-text"
            : "cursor-not-allowed opacity-55"
        }`}
        aria-label={`Case ${cell.index + 1}, vide`}
      >
        <span className="text-xs font-mono uppercase tracking-widest text-pp-text-dim">+</span>
      </motion.button>
    );
  }

  const theme = getBuildingTheme(building);

  return (
    <motion.div
      layout
      initial={{ scale: 0.82, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={`${baseTileClasses} ${theme.color} shadow-inner shadow-white/25`}
      aria-label={`Bâtiment ${building}`}
    >
      <span aria-hidden className="drop-shadow-sm">
        {theme.emoji}
      </span>
    </motion.div>
  );
}
