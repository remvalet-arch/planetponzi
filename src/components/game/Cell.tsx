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
      <button
        type="button"
        disabled={!interactive}
        onClick={onClick}
        className={`${baseTileClasses} border-2 border-dashed border-neutral-800 bg-neutral-900/40 text-neutral-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500/60 ${
          interactive
            ? "cursor-pointer hover:border-neutral-600 hover:bg-neutral-800/50 active:scale-[0.98]"
            : "cursor-not-allowed opacity-60"
        }`}
        aria-label={`Case ${cell.index + 1}, vide`}
      >
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-600">
          +
        </span>
      </button>
    );
  }

  const theme = getBuildingTheme(building);

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={`${baseTileClasses} ${theme.color} shadow-inner shadow-black/20`}
      aria-label={`Bâtiment ${building}`}
    >
      <span aria-hidden>{theme.emoji}</span>
    </motion.div>
  );
}
