"use client";

import { useCallback } from "react";
import { createPortal } from "react-dom";

import { BoardComicShell } from "@/src/components/layout/BoardComicShell";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import { getTutorialCoachStep, isTutorialRailsActive } from "@/src/lib/tutorial-config";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

/**
 * Coach hors grille : BoardComicShell + intro N1 tap-to-continue (voile plein écran).
 */
export function TutorialCoachBubble() {
  const { t } = useAppStrings();
  const levelId = useLevelRunStore((s) => s.levelId);
  const turn = useLevelRunStore((s) => s.turn);
  const status = useLevelRunStore((s) => s.status);
  const activeBooster = useLevelRunStore((s) => s.activeBooster);
  const level1IntroStep = useLevelRunStore((s) => s.level1IntroStep);
  const advanceLevel1Intro = useLevelRunStore((s) => s.advanceLevel1Intro);

  const onAdvance = useCallback(() => {
    advanceLevel1Intro();
  }, [advanceLevel1Intro]);

  if (!isTutorialRailsActive(levelId, status, turn)) {
    return null;
  }
  if (activeBooster === "demolition") {
    return null;
  }

  const step = getTutorialCoachStep(levelId, turn);
  const coach = t.tutorialCoach as Record<string, string>;
  const isLevel1Intro = levelId === 1 && turn === 0;
  const introKey = `intro_${level1IntroStep + 1}`;
  const body = isLevel1Intro ? (coach[introKey] ?? "") : (coach[step?.messageKey ?? ""] ?? "");
  const showIntroVeil = isLevel1Intro && level1IntroStep < 2;

  const panel = (
    <BoardComicShell
      mood="neutral"
      title={t.tutorial.coachBubbleTitle}
      avatarSize="md"
      className="mx-auto max-w-[min(100%,26rem)]"
    >
      <p className="max-h-[min(36vh,11rem)] overflow-y-auto text-sm font-medium leading-snug text-amber-50/98 sm:max-h-[min(38vh,12rem)] sm:text-[0.95rem] sm:leading-relaxed">
        {body}
      </p>
      {showIntroVeil ? (
        <p className="pointer-events-none mt-3 text-right font-mono text-[10px] font-semibold uppercase tracking-wide text-cyan-300/90 motion-safe:animate-pulse sm:text-[11px]">
          {t.tutorial.coachTapContinue}
        </p>
      ) : null}
    </BoardComicShell>
  );

  if (showIntroVeil && typeof document !== "undefined") {
    return createPortal(
      <>
        <button
          type="button"
          aria-label={t.tutorial.coachTapContinue}
          className="fixed inset-0 z-[140] cursor-pointer border-0 bg-black/35 backdrop-blur-[2px] transition-colors hover:bg-black/40"
          onClick={onAdvance}
        />
        <div className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom)+0.5rem)] z-[145] mx-auto flex max-w-lg justify-center sm:inset-x-6">
          {panel}
        </div>
      </>,
      document.body,
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-2 bottom-3 z-[92] flex justify-center sm:bottom-4 sm:inset-x-3">
      {panel}
    </div>
  );
}
