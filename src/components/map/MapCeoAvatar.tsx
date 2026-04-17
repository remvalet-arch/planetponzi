"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

import { CeoTycoonMark } from "@/src/components/map/PlayerAvatar";
import { getMapCurrentLevel, LEVELS } from "@/src/lib/levels";
import { useProgressStore } from "@/src/store/useProgressStore";

/**
 * CEO sur la carte : position courante, ou vol animé depuis le dernier niveau gagné.
 */
export function MapCeoAvatar() {
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const starsByLevel = useProgressStore((s) => s.starsByLevel);
  const lastId = useProgressStore((s) => s.lastCompletedLevelId);
  const clearLast = useProgressStore((s) => s.clearLastCompletedLevel);

  const currentLevel = getMapCurrentLevel(unlockedLevels, starsByLevel);
  const fromPos = lastId ? LEVELS.find((l) => l.id === lastId)?.position : undefined;
  const toPos = LEVELS.find((l) => l.id === currentLevel)?.position;

  const shouldFly =
    lastId != null &&
    fromPos != null &&
    toPos != null &&
    lastId !== currentLevel;

  useEffect(() => {
    if (lastId != null && lastId === currentLevel) {
      clearLast();
    }
  }, [lastId, currentLevel, clearLast]);

  if (!toPos) return null;

  if (shouldFly && fromPos) {
    return (
      <motion.div
        key={`fly-${lastId}-${currentLevel}`}
        className="pointer-events-none absolute z-[6] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        initial={{ left: `${fromPos.x}%`, top: `${fromPos.y}%` }}
        animate={{ left: `${toPos.x}%`, top: `${toPos.y}%` }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => clearLast()}
      >
        <CeoTycoonMark />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="idle-ceo"
      className="pointer-events-none absolute z-[6] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${toPos.x}%`, top: `${toPos.y}%` }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <CeoTycoonMark />
    </motion.div>
  );
}
