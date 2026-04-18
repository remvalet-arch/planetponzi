"use client";

import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import {
  isLevel1TutorialRailsActive,
  LEVEL1_TUTORIAL_CELL_BY_TURN,
} from "@/src/lib/level1-tutorial";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

/**
 * Surcouche « on rails » pour le Niveau 1 : masque + indication sur la case autorisée (tours 0–3).
 * Les clics hors cible sont bloqués dans `placeBuilding` ; ici on absorbe les événements sur les autres cases.
 */
export function TutorialOverlay() {
  const { t } = useAppStrings();
  const levelId = useLevelRunStore((s) => s.levelId);
  const turn = useLevelRunStore((s) => s.turn);
  const status = useLevelRunStore((s) => s.status);
  const activeBooster = useLevelRunStore((s) => s.activeBooster);

  if (levelId !== 1 || !isLevel1TutorialRailsActive(levelId, status, turn)) {
    return null;
  }
  if (activeBooster === "demolition") {
    return null;
  }

  const targetIndex = LEVEL1_TUTORIAL_CELL_BY_TURN[turn]!;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 grid grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2"
      role="presentation"
    >
      {Array.from({ length: 16 }, (_, i) => {
        const isTarget = i === targetIndex;
        return (
          <div
            key={i}
            className={`relative min-w-0 rounded-md ${isTarget ? "bg-transparent" : "pointer-events-auto bg-black/70"}`}
          >
            {isTarget ? (
              <div className="pointer-events-none flex h-full min-h-0 flex-col items-center justify-end gap-0.5 pb-0.5 text-center">
                <span className="select-none text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] motion-safe:animate-bounce">
                  👇
                </span>
                <span
                  className="max-w-[95%] animate-pulse select-none rounded bg-black/55 px-1 py-0.5 font-mono text-[9px] font-semibold uppercase leading-tight text-amber-100 ring-1 ring-amber-400/40 sm:text-[10px]"
                  aria-live="polite"
                >
                  {t.tutorial.level1PlaceMine}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
