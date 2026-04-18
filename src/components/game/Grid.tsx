"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { Cell } from "@/src/components/game/Cell";
import { TutorialOverlay } from "@/src/components/game/TutorialOverlay";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

export function Grid() {
  const grid = useLevelRunStore((s) => s.grid);
  const status = useLevelRunStore((s) => s.status);
  const activeBooster = useLevelRunStore((s) => s.activeBooster);
  const demolishFlash = useLevelRunStore((s) => s.demolishFlash);
  const placeBuilding = useLevelRunStore((s) => s.placeBuilding);
  const gridShakeNonce = useLevelRunStore((s) => s.gridShakeNonce);
  const frozenCellIndices = useLevelRunStore((s) => s.frozenCellIndices);

  const demolitionMode = status === "playing" && activeBooster === "demolition";

  const frozenSet = useMemo(() => new Set(frozenCellIndices), [frozenCellIndices]);

  return (
    <div
      className={`pp-game-grid-panel mx-auto flex aspect-square w-full max-h-full min-h-0 min-w-0 max-w-[400px] flex-col transition-[box-shadow] duration-200 ${
        demolitionMode
          ? "cursor-crosshair shadow-[0_0_0_2px_rgb(244_63_94/0.45),0_0_28px_rgb(244_63_94/0.2)]"
          : ""
      }`}
      role="grid"
      aria-label={demolitionMode ? "Grille — mode démolition" : "Grille de placement 4 par 4"}
    >
      <motion.div
        key={gridShakeNonce}
        initial={false}
        animate={
          gridShakeNonce > 0
            ? { x: [0, -6, 6, -5, 5, -3, 3, 0], rotate: [0, -0.45, 0.45, -0.35, 0.35, 0] }
            : { x: 0, rotate: 0 }
        }
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        className="relative grid min-h-0 min-w-0 flex-1 grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2"
      >
        {grid.map((cell) => {
          const canPlace =
            status === "playing" &&
            !demolitionMode &&
            cell.isPlayable &&
            cell.building === null;
          const canDemolish =
            status === "playing" && demolitionMode && cell.isPlayable && cell.building !== null;
          const onClick =
            canPlace || canDemolish ? () => placeBuilding(cell.index) : undefined;
          const flashNonce =
            demolishFlash?.index === cell.index ? demolishFlash.nonce : 0;

          return (
            <div key={cell.index} role="gridcell" className="min-w-0">
              <Cell
                cell={cell}
                onClick={onClick}
                demolitionTarget={demolitionMode && cell.building !== null}
                demolishFlashNonce={flashNonce}
                fiscalFrozen={frozenSet.has(cell.index)}
              />
            </div>
          );
        })}
        <TutorialOverlay />
      </motion.div>
    </div>
  );
}
