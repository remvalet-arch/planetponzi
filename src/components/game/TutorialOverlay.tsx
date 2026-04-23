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
  const directiveTitle =
    turn < 3 ? t.tutorial.level1Directive1Title : t.tutorial.level1Directive2Title;
  const directiveBody =
    turn < 3 ? t.tutorial.level1Directive1Body : t.tutorial.level1Directive2Body;

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
                <div
                  className="max-w-[95%] animate-pulse select-none rounded bg-black/60 px-1.5 py-1 font-mono text-[8px] leading-snug text-amber-50 ring-1 ring-amber-400/45 sm:text-[9px]"
                  aria-live="polite"
                >
                  <p className="font-bold uppercase tracking-wide text-amber-100">{directiveTitle}</p>
                  <p className="mt-0.5 line-clamp-3 text-left font-medium normal-case tracking-normal text-amber-50/95">
                    {directiveBody}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
