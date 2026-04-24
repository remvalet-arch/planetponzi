"use client";

import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import { getTutorialCoachStep, isTutorialRailsActive } from "@/src/lib/tutorial-config";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

/**
 * Coach Board : masque + pastille sur la case autorisée (niveaux 1–3, tours scriptés).
 * Les clics hors cible sont absorbés ici ; `placeBuilding` applique aussi la contrainte.
 */
export function TutorialOverlay() {
  const { t } = useAppStrings();
  const levelId = useLevelRunStore((s) => s.levelId);
  const turn = useLevelRunStore((s) => s.turn);
  const status = useLevelRunStore((s) => s.status);
  const activeBooster = useLevelRunStore((s) => s.activeBooster);
  const level1IntroStep = useLevelRunStore((s) => s.level1IntroStep);

  if (!isTutorialRailsActive(levelId, status, turn)) {
    return null;
  }
  if (activeBooster === "demolition") {
    return null;
  }

  const step = getTutorialCoachStep(levelId, turn);
  const targetIndex = step!.allowedCellIndex as number;
  const introBlocksPlacement =
    levelId === 1 && turn === 0 && level1IntroStep < 2;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 grid grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2"
      role="presentation"
    >
      {Array.from({ length: 16 }, (_, i) => {
        const isTarget = i === targetIndex;
        if (introBlocksPlacement) {
          return (
            <div
              key={i}
              className="relative min-w-0 rounded-md bg-black/72 pointer-events-auto ring-1 ring-black/50"
            />
          );
        }
        return (
          <div
            key={i}
            className={`relative min-w-0 rounded-md ${isTarget ? "bg-transparent" : "pointer-events-auto bg-black/70"}`}
          >
            {isTarget ? (
              <div className="pointer-events-none flex h-full min-h-0 flex-col items-center justify-center gap-0.5 text-center">
                <span className="select-none text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] motion-safe:animate-bounce">
                  👇
                </span>
                <span className="select-none rounded bg-black/55 px-1 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-amber-100 ring-1 ring-amber-400/40 sm:text-[10px]">
                  {t.tutorial.coachCellHint}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
