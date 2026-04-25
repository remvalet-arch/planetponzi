"use client";

import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

import { Grid } from "@/src/components/game/Grid";
import { BoardComicShell } from "@/src/components/layout/BoardComicShell";
import { ContractIcon } from "@/src/components/ui/ContractIcon";
import { hasPendingHubUnlock } from "@/src/lib/ceo-memos";
import {
  calculateStars,
  getLevelById,
  getMandateProgressRows,
  getSpatialMandateFailures,
  LEVELS,
  starsFromScore,
} from "@/src/lib/levels";
import { getSessionCellScores } from "@/src/lib/session-scoring";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { computePassiveModifiers } from "@/src/lib/empire-tower";
import { useEmpireStore } from "@/src/store/useEmpireStore";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import { useProgressStore } from "@/src/store/useProgressStore";

function EndScreenHeatmapOverlay({ scores }: { scores: readonly number[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] p-3">
      <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2">
        {scores.map((cellScore, i) => (
          <div
            key={i}
            className="aspect-square min-h-0 min-w-0 text-center text-base font-bold leading-none text-white sm:text-lg"
          >
            {cellScore > 0 ? `+${cellScore}` : `${cellScore}`}
          </div>
        ))}
      </div>
    </div>
  );
}

type FailureStatusBlockProps = {
  showFiscalStamp: boolean;
  mandateBreach: boolean;
  mandateMissingDetail: string | null;
  earnedStars: number;
};

function FailureStatusBlock({
  showFiscalStamp,
  mandateBreach,
  mandateMissingDetail,
  earnedStars,
}: FailureStatusBlockProps) {
  const { t } = useAppStrings();
  return (
    <div
      className="relative mt-3 flex flex-col items-center gap-1 overflow-visible rounded-xl border border-rose-900/50 bg-gradient-to-b from-rose-950/50 to-slate-950/40 px-3 py-2 text-center shadow-inner"
      role="status"
    >
      {showFiscalStamp ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-2">
          <div className="max-w-[min(100%,18rem)] rounded-md border-2 border-red-600 bg-red-950/40 px-3 py-2 text-center font-mono text-xs font-black uppercase leading-tight tracking-[0.2em] text-red-500 shadow-[0_0_24px_rgba(220_38_38/0.45)]">
            {t.endScreen.failureStampText}
          </div>
        </div>
      ) : null}
      <span className="text-2xl leading-none" aria-hidden>
        💔
      </span>
      <p className="font-mono text-sm font-bold tracking-tight text-rose-100">
        {mandateBreach ? t.endScreen.mandateFailedTitle : t.endScreen.insufficientTitle}
      </p>
      {mandateBreach ? (
        <>
          <p className="max-w-sm font-mono text-[11px] font-semibold leading-snug text-amber-100/95">
            {t.endScreen.mandateFailedLead}
          </p>
          <p className="max-w-sm font-mono text-[11px] leading-relaxed text-rose-100/95">
            {mandateMissingDetail ?? t.endScreen.mandateFailedBody}
          </p>
        </>
      ) : (
        <p className="max-w-xs font-mono text-[10px] leading-relaxed text-rose-200/85">
          {earnedStars >= 1 ? t.endScreen.insufficientBodyPartialSuccess : t.endScreen.insufficientBody}
        </p>
      )}
    </div>
  );
}

type EndScreenProps = {
  onShareFeedback: (message: string) => void;
};

export function EndScreen({ onShareFeedback }: EndScreenProps) {
  void onShareFeedback;

  const { t } = useAppStrings();
  const router = useRouter();

  const grid = useLevelRunStore((s) => s.grid);
  const score = useLevelRunStore((s) => s.score);
  const levelId = useLevelRunStore((s) => s.levelId);
  const frozenCellIndices = useLevelRunStore((s) => s.frozenCellIndices);
  const status = useLevelRunStore((s) => s.status);
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const hasSeenShopUnlockCeoMemo = useProgressStore((s) => s.hasSeenShopUnlockCeoMemo);
  const hasSeenTowerUnlockCeoMemo = useProgressStore((s) => s.hasSeenTowerUnlockCeoMemo);
  const mineEmpireBonus = useEmpireStore((s) => computePassiveModifiers(s.unlockedNodes).mineScoreBonusPerMine);

  const [showDetailedReport, setShowDetailedReport] = useState(false);

  const levelDef = useMemo(() => (levelId >= 1 ? getLevelById(levelId) : undefined), [levelId]);
  const sessionCellScores = useMemo(() => {
    if (grid.length !== 16) return Array.from({ length: 16 }, () => 0);
    return getSessionCellScores(grid, frozenCellIndices, mineEmpireBonus, levelId);
  }, [grid, frozenCellIndices, mineEmpireBonus, levelId]);

  if (status !== "finished" || levelId < 1) return null;

  const earnedStars = calculateStars(score, levelId, grid);
  const earnedCoins = earnedStars > 0 ? earnedStars * 10 : 0;

  const scoreOnlyStars = levelDef ? starsFromScore(score, levelDef.stars) : (0 as const);
  const mandateBreach = Boolean(levelDef?.winCondition) && scoreOnlyStars >= 1 && earnedStars === 0;

  const mandateShortfallFragments =
    mandateBreach && levelDef?.winCondition
      ? getMandateProgressRows(grid, levelDef.winCondition)
          .filter((r) => r.current < r.required)
          .map((r) => {
            const b = t.biomes[levelDef.planetId];
            const label = r.building === "serre" && r.displayAsForests ? b.forests : b[r.building];
            return t.endScreen.mandateFailedFragment(label, r.current, r.required);
          })
      : [];

  const spatialFailFragments =
    mandateBreach && levelDef?.winCondition
      ? getSpatialMandateFailures(grid, levelDef.winCondition).map((f) => {
          const b = t.biomes[levelDef.planetId];
          if (f.kind === "isolated") return t.endScreen.mandateSpatialIsolatedFail(b[f.building]);
          return t.endScreen.mandateSpatialAlignedFail(b[f.building], f.currentRun, f.required);
        })
      : [];

  const mandateDetailFragments = [...mandateShortfallFragments, ...spatialFailFragments];
  const mandateMissingDetail =
    mandateDetailFragments.length > 0
      ? t.endScreen.mandateFailedMissing(mandateDetailFragments.join(" · "))
      : null;

  const nextId = levelId + 1;
  const hasNextLevel = LEVELS.some((l) => l.id === nextId);
  const nextUnlocked = hasNextLevel && (earnedStars >= 1 || unlockedLevels.includes(nextId));
  const pendingHubMemo = hasPendingHubUnlock({
    unlockedLevels,
    hasSeenShopUnlockCeoMemo,
    hasSeenTowerUnlockCeoMemo,
  });

  const handleContinue = () => {
    if (earnedStars >= 1 && pendingHubMemo) {
      router.push("/map");
      return;
    }
    if (nextUnlocked) {
      router.push(`/level/${nextId}`);
      return;
    }
    router.push("/map");
  };

  return (
    <div className="pp-end-backdrop" role="dialog" aria-modal="true" aria-label={t.endScreen.rewardsTitle}>
      <div className="pp-end-panel">
        <div className="pp-allow-select min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-visible overscroll-y-contain px-2 pb-0 pt-8 text-slate-100">
          <BoardComicShell
            variant="modal"
            mood={earnedStars > 1 ? "happy" : "angry"}
            dialogueText={earnedStars > 1 ? t.modalDialogue.win : t.modalDialogue.loss}
          >
            <div className="my-1 flex flex-col items-center" role="img" aria-label={t.endScreen.starsAria(earnedStars)}>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((index) => {
                  const earned = index < earnedStars;
                  return (
                    <span
                      key={index}
                      className={`inline-flex select-none leading-none ${
                        earned ? "drop-shadow-[0_0_8px_rgb(148_163_184/0.45)]" : ""
                      }`}
                      aria-hidden
                    >
                      <ContractIcon count={1} size="lg" seal="gold" muted={!earned} />
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 mb-3 flex items-center justify-center gap-6">
              <p className="font-mono text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.35)]">
                {score} <span className="text-lg text-cyan-300/90">{t.endScreen.msUnit}</span>
              </p>
              {earnedCoins > 0 ? (
                <p className="flex items-center gap-1.5 font-mono text-2xl font-black tabular-nums text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  +{earnedCoins}
                  <span className="inline-flex select-none text-3xl leading-none" aria-hidden>
                    💰
                  </span>
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setShowDetailedReport((v) => !v)}
              className="mx-auto mb-1 flex min-h-11 items-center justify-center gap-2 rounded-pp-lg border border-white/10 bg-[#15161E] px-4 py-2 font-mono text-xs text-slate-300 transition-colors hover:border-cyan-500/35 hover:text-slate-100"
            >
              {showDetailedReport ? t.endScreen.hideDetailedReport : t.endScreen.showDetailedReport}
              {showDetailedReport ? (
                <ChevronUp className="size-4 text-cyan-300" aria-hidden />
              ) : (
                <ChevronDown className="size-4 text-cyan-300" aria-hidden />
              )}
            </button>

            {showDetailedReport ? (
              <>
                {earnedStars <= 1 ? (
                  <FailureStatusBlock
                    showFiscalStamp={earnedStars === 0}
                    mandateBreach={mandateBreach}
                    mandateMissingDetail={mandateMissingDetail}
                    earnedStars={earnedStars}
                  />
                ) : null}

                <div className="pointer-events-none relative mx-auto mt-2 w-full max-w-full origin-top scale-[0.82] sm:scale-90" aria-hidden>
                  <Grid
                    planetId={levelDef?.planetId ?? 0}
                    staticGrid={grid}
                    staticFrozenCellIndices={frozenCellIndices}
                    minimalMode
                  />
                  <EndScreenHeatmapOverlay scores={sessionCellScores} />
                </div>
              </>
            ) : null}
          </BoardComicShell>
        </div>

        <div className="shrink-0 space-y-2 border-t border-white/10 bg-slate-950 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleContinue}
            className="flex min-h-14 w-full items-center justify-center rounded-pp-xl border border-emerald-600/60 bg-gradient-to-b from-emerald-500 to-emerald-700 px-5 py-3 font-mono text-sm font-semibold text-white shadow-lg hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            {earnedStars >= 1 && pendingHubMemo ? t.endScreen.returnToHqRequired : t.endScreen.continue}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
