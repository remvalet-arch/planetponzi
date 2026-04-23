"use client";

import { motion } from "framer-motion";

import { clampPlanetId, getBiomeBuildingSkin, getBiomeObstacleSkin } from "@/src/lib/game/biomes";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import type { Cell as CellModel, TerrainType } from "@/src/types/game";

const baseTileClasses =
  "flex aspect-square w-full items-center justify-center rounded-lg text-3xl sm:text-4xl select-none";

function obstacleCopyLabel(
  terrain: TerrainType,
  row: {
    obstacleLake: string;
    obstacleMountain: string;
    obstacleToxic: string;
    obstacleDefault: string;
  },
): string {
  if (terrain === "mountain") return row.obstacleMountain;
  if (terrain === "toxic") return row.obstacleToxic;
  if (terrain === "lake") return row.obstacleLake;
  return row.obstacleDefault;
}

export type CellProps = {
  cell: CellModel;
  /** Secteur Saga (0–9) — skins + libellés ARIA. */
  planetId?: number;
  /** Placement normal (case vide) ou démolition (case occupée). */
  onClick?: () => void;
  /** Mode marteau : surbrillance des cases occupées. */
  demolitionTarget?: boolean;
  /** Après démolition : flash / secousse sur la case devenue vide. */
  demolishFlashNonce?: number;
  /** Boss Contrôle fiscal : contribution forcée à 0. */
  fiscalFrozen?: boolean;
  /** Bilan / heatmap : couleurs uniquement, sans emojis ni gel. */
  minimalMode?: boolean;
};

export function Cell({
  cell,
  planetId = 0,
  onClick,
  demolitionTarget,
  demolishFlashNonce = 0,
  fiscalFrozen = false,
  minimalMode = false,
}: CellProps) {
  const { t } = useAppStrings();
  const pid = clampPlanetId(planetId);
  const bio = t.biomes[pid]!;
  const { building, isPlayable, terrainType } = cell;

  if (!isPlayable) {
    const terrainForSkin: TerrainType = terrainType === "normal" ? "lake" : terrainType;
    const o = getBiomeObstacleSkin(pid, terrainForSkin);
    const labelTerrain: TerrainType = terrainType === "normal" ? "lake" : terrainType;
    const labelText = obstacleCopyLabel(labelTerrain, bio);
    return (
      <div
        className={`${baseTileClasses} ${o.className} cursor-not-allowed opacity-95`}
        aria-label={t.grid.cellObstacle(cell.index + 1, labelText)}
      >
        {!minimalMode ? (
          <span aria-hidden className="drop-shadow-sm">
            {o.emoji}
          </span>
        ) : null}
      </div>
    );
  }

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
        className={`${baseTileClasses} border-2 border-dashed border-slate-600/55 bg-slate-900/45 text-slate-500 backdrop-blur-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/55 ${
          interactive
            ? "cursor-pointer hover:border-cyan-400/45 hover:bg-amber-500/10 hover:text-slate-200"
            : "cursor-not-allowed opacity-55"
        } ${hasFlash ? "ring-2 ring-rose-400/75 ring-offset-2 ring-offset-[#0B0F19]" : ""}`}
        aria-label={t.grid.cellEmpty(cell.index + 1)}
      >
        {!minimalMode ? (
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500">+</span>
        ) : null}
      </motion.button>
    );
  }

  const theme = getBiomeBuildingSkin(pid, building);
  const buildingLabel = bio[building];
  const interactive = Boolean(onClick);

  const freezeOverlay =
    !minimalMode && fiscalFrozen ? (
      <span
        className="pointer-events-none absolute right-0.5 top-0.5 flex size-6 items-center justify-center rounded-md border border-sky-400/50 bg-slate-950/80 text-sm shadow-md backdrop-blur-sm"
        title={t.grid.fiscalFreezeTitle}
        aria-hidden
      >
        🧊
      </span>
    ) : null;

  if (interactive) {
    return (
      <motion.button
        type="button"
        layout
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        className={`relative ${baseTileClasses} ${theme.color} shadow-inner shadow-white/25 ring-2 transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400/80 ${
          demolitionTarget
            ? "cursor-crosshair ring-rose-500/90 shadow-[0_0_22px_rgb(244_63_94/0.5)]"
            : "ring-transparent"
        } ${fiscalFrozen ? "ring-sky-400/50 ring-offset-2 ring-offset-slate-950" : ""}`}
        aria-label={t.grid.cellDemolish(buildingLabel, cell.index + 1)}
      >
        {freezeOverlay}
        {!minimalMode ? (
          <span aria-hidden className="drop-shadow-sm">
            {theme.emoji}
          </span>
        ) : null}
      </motion.button>
    );
  }

  return (
    <motion.div
      layout
      initial={{ scale: 0.82, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={`relative ${baseTileClasses} ${theme.color} shadow-inner shadow-white/25 ${
        demolitionTarget ? "ring-2 ring-rose-500/55" : ""
      } ${fiscalFrozen ? "ring-2 ring-sky-400/45" : ""}`}
      aria-label={t.grid.cellBuilding(buildingLabel)}
    >
      {freezeOverlay}
      {!minimalMode ? (
        <span aria-hidden className="drop-shadow-sm">
          {theme.emoji}
        </span>
      ) : null}
    </motion.div>
  );
}
