"use client";

import { useCallback, useMemo } from "react";
import { motion, type Variants } from "framer-motion";

import { Cell } from "@/src/components/game/Cell";
import { TutorialCoachBubble } from "@/src/components/game/TutorialCoachBubble";
import { TutorialOverlay } from "@/src/components/game/TutorialOverlay";
import { TutorialScoreFloat } from "@/src/components/game/TutorialScoreFloat";
import { getBiomeTheme } from "@/src/lib/game/biomes";
import { getLevelById } from "@/src/lib/levels";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import type { Cell as CellModel } from "@/src/types/game";

/** Tremblement : fusion méga-industrielle + faille sismique (`gridShakeNonce` côté store). */
const gridShakeVariants: Variants = {
  idle: { x: 0, y: 0, rotate: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -5, 5, -3, 3, 0],
    y: [0, 6, -6, 4, -4, 2, -2, 0],
    rotate: [0, -0.7, 0.7, -0.5, 0.5, -0.25, 0.25, 0],
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
};

export type GridProps = {
  /** Secteur (0–9). Si omis, dérivé du niveau courant dans le store. */
  planetId?: number;
  /** Grille figée (ex. bilan) — prioritaire sur le store si 16 cases. */
  staticGrid?: CellModel[] | null;
  staticFrozenCellIndices?: readonly number[] | null;
  /** Couleurs de cases sans emojis (ex. bilan + heatmap). */
  minimalMode?: boolean;
};

export function Grid({
  planetId: planetIdProp,
  staticGrid,
  staticFrozenCellIndices,
  minimalMode = false,
}: GridProps = {}) {
  const { t } = useAppStrings();
  const storeGrid = useLevelRunStore((s) => s.grid);
  const grid =
    Array.isArray(staticGrid) && staticGrid.length === 16 ? staticGrid : storeGrid;
  const status = useLevelRunStore((s) => s.status);
  const levelId = useLevelRunStore((s) => s.levelId);
  const activeBooster = useLevelRunStore((s) => s.activeBooster);
  const demolishFlash = useLevelRunStore((s) => s.demolishFlash);
  const placeBuilding = useLevelRunStore((s) => s.placeBuilding);
  const gridShakeNonce = useLevelRunStore((s) => s.gridShakeNonce);
  const storeFrozen = useLevelRunStore((s) => s.frozenCellIndices);
  const frozenCellIndices =
    Array.isArray(staticGrid) &&
    staticGrid.length === 16 &&
    Array.isArray(staticFrozenCellIndices)
      ? staticFrozenCellIndices
      : storeFrozen;

  const planetId = useMemo(() => {
    if (planetIdProp != null) return planetIdProp;
    const def = levelId >= 1 ? getLevelById(levelId) : undefined;
    return def?.planetId ?? 0;
  }, [planetIdProp, levelId]);

  const biome = useMemo(() => getBiomeTheme(planetId), [planetId]);

  const demolitionMode =
    !(Array.isArray(staticGrid) && staticGrid.length === 16) &&
    status === "playing" &&
    activeBooster === "demolition";

  const frozenSet = useMemo(() => new Set(frozenCellIndices), [frozenCellIndices]);
  const handleCellClick = useCallback(
    (cellIndex: number) => {
      placeBuilding(cellIndex);
    },
    [placeBuilding],
  );

  const gridAria = demolitionMode ? t.grid.ariaGridDemolition : t.grid.ariaGrid;

  return (
    <div
      className={`pp-game-grid-panel relative mx-auto flex aspect-square w-full max-h-full min-h-0 min-w-0 max-w-[400px] flex-col transition-[box-shadow] duration-200 ${
        demolitionMode
          ? "cursor-crosshair shadow-[0_0_0_2px_rgb(244_63_94/0.45),0_0_28px_rgb(244_63_94/0.2)]"
          : ""
      }`}
      role="grid"
      aria-label={gridAria}
    >
      <motion.div
        key={gridShakeNonce}
        variants={gridShakeVariants}
        initial={gridShakeNonce > 0 ? "shake" : false}
        animate={gridShakeNonce > 0 ? "shake" : "idle"}
        className={`relative grid min-h-0 min-w-0 flex-1 grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2 ${biome.gridBackground}`}
      >
        {grid.map((cell) => {
          const canPlace =
            status === "playing" &&
            !demolitionMode &&
            cell.isPlayable &&
            cell.building === null;
          const canDemolish =
            status === "playing" && demolitionMode && cell.building !== null;
          const onClick =
            canPlace || canDemolish ? () => handleCellClick(cell.index) : undefined;
          const flashNonce =
            demolishFlash?.index === cell.index ? demolishFlash.nonce : 0;

          return (
            <div key={cell.index} role="gridcell" className="min-w-0">
              <Cell
                cell={cell}
                planetId={planetId}
                onClick={onClick}
                demolitionTarget={demolitionMode && cell.building !== null}
                demolishFlashNonce={flashNonce}
                fiscalFrozen={frozenSet.has(cell.index)}
                minimalMode={minimalMode}
              />
            </div>
          );
        })}
        <TutorialOverlay />
        <TutorialScoreFloat />
      </motion.div>
      <TutorialCoachBubble />
    </div>
  );
}
