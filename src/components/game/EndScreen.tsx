"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { PanelBottomOpen, Share2, X } from "lucide-react";

import { Grid } from "@/src/components/game/Grid";
import { ContractIcon } from "@/src/components/ui/ContractIcon";
import { playUIClick, playVictoryCash } from "@/src/lib/game-sounds";
import { successPop } from "@/src/lib/haptics";
import { computePassiveModifiers } from "@/src/lib/empire-tower";
import {
  calculateStars,
  getLevelById,
  getMandateProgressRows,
  getSolverLevelContext,
  getSpatialMandateFailures,
  LEVELS,
  starsFromScore,
} from "@/src/lib/levels";
import { getSessionCellScores } from "@/src/lib/session-scoring";
import { estimateMaxScore } from "@/src/lib/solver";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { copyShareToClipboard } from "@/src/lib/ui-helpers";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useEmpireStore } from "@/src/store/useEmpireStore";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import { useProgressStore } from "@/src/store/useProgressStore";

const VICTORY_CONFETTI_GOLD = ["#FFD700", "#FFA500", "#FFEC8B", "#E6AC00", "#FFC107"];

/** Délai de la barre « retour QG » avant navigation auto vers `/map`. */
const AUTO_MAP_REDIRECT_SEC = 15;

const thumbZone =
  "shrink-0 space-y-2 border-t border-slate-700/60 bg-slate-950 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]";

const endCoinStripParent = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

const endCoinPopIn = {
  hidden: { scale: 0.22, opacity: 0, rotate: -16 },
  show: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 580, damping: 14 },
  },
};

function EndScreenHeatmapOverlay({ scores }: { scores: readonly number[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] p-3">
      <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2">
        {scores.map((cellScore, i) => (
          <div
            key={i}
            className="flex min-h-0 min-w-0 aspect-square items-center justify-center text-center text-base font-bold tabular-nums leading-none text-white sm:text-lg"
          >
            {cellScore > 0 ? `+${cellScore}` : `${cellScore}`}
          </div>
        ))}
      </div>
    </div>
  );
}

type EndScreenProps = {
  onShareFeedback: (message: string) => void;
};

export function EndScreen({ onShareFeedback }: EndScreenProps) {
  const { t } = useAppStrings();
  const router = useRouter();
  const grid = useLevelRunStore((s) => s.grid);
  const score = useLevelRunStore((s) => s.score);
  const seed = useLevelRunStore((s) => s.seed);
  const levelId = useLevelRunStore((s) => s.levelId);
  const frozenCellIndices = useLevelRunStore((s) => s.frozenCellIndices);
  const status = useLevelRunStore((s) => s.status);
  const deckChallengeLevel = useLevelRunStore((s) => s.deckChallengeLevel);
  const enterLevel = useLevelRunStore((s) => s.enterLevel);
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const mineEmpireBonus = useEmpireStore((s) =>
    computePassiveModifiers(s.unlockedNodes).mineScoreBonusPerMine,
  );

  const [shareLabel, setShareLabel] = useState<"idle" | "copied" | "error">("idle");
  const [minimized, setMinimized] = useState(false);
  const [showVictoryExitBar, setShowVictoryExitBar] = useState(false);
  const victoryVibrateRef = useRef(false);
  const skipAutoMapRef = useRef(false);
  const confettiPlayedRef = useRef<string | null>(null);
  const victorySoundPlayedRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "finished") {
      confettiPlayedRef.current = null;
      victorySoundPlayedRef.current = null;
      skipAutoMapRef.current = false;
      victoryVibrateRef.current = false;
      queueMicrotask(() => {
        setShowVictoryExitBar(false);
        setMinimized(false);
      });
    }
  }, [status]);

  useEffect(() => {
    if (status !== "finished" || levelId < 1 || minimized) return;
    if (calculateStars(score, levelId, grid) !== 3) return;
    const runKey = `${seed}|${levelId}|${score}`;
    if (confettiPlayedRef.current === runKey) return;
    confettiPlayedRef.current = runKey;
    const burst = () => {
      confetti({
        particleCount: 340,
        spread: 360,
        startVelocity: 44,
        ticks: 240,
        scalar: 1.08,
        origin: { x: 0.5, y: 0.4 },
        colors: VICTORY_CONFETTI_GOLD,
      });
      window.setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 88,
          startVelocity: 36,
          ticks: 200,
          scalar: 1.05,
          origin: { x: 0.5, y: 0.52 },
          colors: VICTORY_CONFETTI_GOLD,
        });
      }, 140);
      window.setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 270,
          spread: 55,
          startVelocity: 28,
          origin: { x: 0.5, y: 0.12 },
          colors: VICTORY_CONFETTI_GOLD,
        });
      }, 260);
    };
    const id = window.requestAnimationFrame(burst);
    return () => window.cancelAnimationFrame(id);
  }, [status, levelId, score, seed, minimized, grid]);

  useEffect(() => {
    if (status !== "finished" || levelId < 1) return;
    const earned = calculateStars(score, levelId, grid);
    if (earned < 1) return;
    const key = `${seed}|${levelId}|${score}|mandate`;
    if (victorySoundPlayedRef.current === key) return;
    victorySoundPlayedRef.current = key;
    playVictoryCash();
  }, [status, levelId, score, seed, grid]);

  useEffect(() => {
    if (status !== "finished" || minimized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMinimized(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, minimized]);

  useEffect(() => {
    if (status !== "finished" || minimized || victoryVibrateRef.current) return;
    victoryVibrateRef.current = true;
    const id = window.setTimeout(() => successPop(), 480);
    return () => window.clearTimeout(id);
  }, [status, minimized]);

  /** Après les étoiles : victoire (≥1★) → barre 3s puis /map (sauf navigation manuelle). */
  useEffect(() => {
    if (status !== "finished" || minimized) {
      queueMicrotask(() => setShowVictoryExitBar(false));
      return;
    }
    const stars = calculateStars(score, levelId, grid);
    if (stars <= 0) {
      queueMicrotask(() => setShowVictoryExitBar(false));
      return;
    }
    const id = window.setTimeout(() => setShowVictoryExitBar(true), 1300);
    return () => window.clearTimeout(id);
  }, [status, minimized, score, levelId, grid]);

  const levelDef = useMemo(() => (levelId >= 1 ? getLevelById(levelId) : undefined), [levelId]);
  const maxScoreEstimate = useMemo(() => {
    if (!levelDef) return 0;
    const deck = levelDef.deckChallengeLevel ?? 0;
    return estimateMaxScore(levelDef.seed, deck, {
      ...getSolverLevelContext(levelDef),
      mineScoreBonusPerMine: mineEmpireBonus,
    });
  }, [levelDef, mineEmpireBonus]);

  const sessionCellScores = useMemo(() => {
    if (grid.length !== 16) return Array.from({ length: 16 }, () => 0);
    return getSessionCellScores(grid, frozenCellIndices, mineEmpireBonus, levelId);
  }, [grid, frozenCellIndices, mineEmpireBonus, levelId]);

  if (status !== "finished" || levelId < 1) return null;

  const earnedStars = calculateStars(score, levelId, grid);
  const scoreOnlyStars = levelDef ? starsFromScore(score, levelDef.stars) : (0 as const);
  const mandateBreach =
    Boolean(levelDef?.winCondition) && scoreOnlyStars >= 1 && earnedStars === 0;
  const mandateShortfallFragments =
    mandateBreach && levelDef?.winCondition
      ? getMandateProgressRows(grid, levelDef.winCondition)
          .filter((r) => r.current < r.required)
          .map((r) => {
            const b = t.biomes[levelDef!.planetId];
            const label = r.building === "serre" && r.displayAsForests ? b.forests : b[r.building];
            return t.endScreen.mandateFailedFragment(label, r.current, r.required);
          })
      : [];
  const spatialFailFragments =
    mandateBreach && levelDef?.winCondition
      ? getSpatialMandateFailures(grid, levelDef.winCondition).map((f) => {
          const b = t.biomes[levelDef!.planetId];
          if (f.kind === "isolated") return t.endScreen.mandateSpatialIsolatedFail(b[f.building]);
          return t.endScreen.mandateSpatialAlignedFail(b[f.building], f.currentRun, f.required);
        })
      : [];
  const mandateDetailFragments = [...mandateShortfallFragments, ...spatialFailFragments];
  const mandateMissingDetail =
    mandateDetailFragments.length > 0
      ? t.endScreen.mandateFailedMissing(mandateDetailFragments.join(" · "))
      : null;
  const isOptimalYield = maxScoreEstimate > 0 && score >= maxScoreEstimate;
  const earnedCoins = earnedStars > 1 ? earnedStars * 10 : 0;

  const nextId = levelId + 1;
  const hasNextLevel = LEVELS.some((l) => l.id === nextId);
  /** ≥1★ sur ce run débloque toujours le suivant (évite un `unlockedLevels` React légèrement obsolète). */
  const nextUnlocked =
    hasNextLevel && (earnedStars >= 1 || unlockedLevels.includes(nextId));

  const handleShare = async () => {
    const ok = await copyShareToClipboard(grid, score, seed, {
      deckChallengeLevel,
      levelId,
      frozenCellIndices,
    });
    if (ok) {
      setShareLabel("copied");
      onShareFeedback(t.endScreen.shareFeedbackCopied);
    } else {
      setShareLabel("error");
      onShareFeedback(t.endScreen.shareFeedbackError);
    }
    window.setTimeout(() => setShareLabel("idle"), 2200);
  };

  const handleReplay = () => {
    if (useEconomyStore.getState().lives <= 0) {
      router.push("/shop");
      return;
    }
    enterLevel(levelId);
    setMinimized(false);
  };

  const handleContinue = () => {
    playUIClick();
    skipAutoMapRef.current = true;
    setShowVictoryExitBar(false);
    if (nextUnlocked) {
      router.push(`/level/${nextId}`);
    } else {
      router.push("/map");
    }
  };

  const shareButtonText =
    shareLabel === "copied"
      ? t.endScreen.shareCopied
      : shareLabel === "error"
        ? t.endScreen.shareRetry
        : t.endScreen.shareSummary;

  if (minimized) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(5.5rem,env(safe-area-inset-bottom)+4rem)] z-[105] flex justify-center px-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => setMinimized(false)}
          className="pointer-events-auto flex min-h-12 items-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/95 px-4 py-2.5 font-mono text-xs font-semibold text-slate-100 shadow-lg shadow-black/40 backdrop-blur-md transition-colors hover:border-cyan-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/50"
        >
          <PanelBottomOpen className="size-4 shrink-0 text-cyan-300" strokeWidth={2} aria-hidden />
          <span className="flex items-center gap-1.5">
            {Array.from({ length: earnedStars }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 560,
                  damping: 14,
                  delay: i * 0.08,
                }}
                className="inline-flex select-none drop-shadow-[0_0_6px_rgb(148_163_184/0.35)]"
                aria-hidden
              >
                <ContractIcon count={1} size="lg" seal="gold" />
              </motion.span>
            ))}
            <span className="whitespace-nowrap tabular-nums text-slate-400">
              · {score} {t.endScreen.pointsUnit}
            </span>
          </span>
          <span className="sr-only">{t.endScreen.reopenBilanSr}</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div
      className="pp-end-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setMinimized(true);
      }}
    >
      <div className="pp-end-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div
          className="pp-bottom-sheet-handle mx-auto mt-2.5 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-slate-600/80 ring-1 ring-slate-500/40"
          aria-hidden
        />

        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="absolute right-2 top-[max(1rem,env(safe-area-inset-top))] z-[1] flex min-h-[44px] min-w-[44px] items-center justify-center rounded-pp-md border border-slate-600/80 bg-slate-800/90 text-slate-200 transition-colors hover:border-cyan-500/45 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/55 active:scale-[0.92]"
          aria-label={t.endScreen.minimizeAria}
        >
          <X className="size-5" strokeWidth={2} />
        </button>

        <div className="pp-allow-select min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-0 pt-2 text-slate-100">
          <p className="pr-14 font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">
            {t.endScreen.levelKicker(levelId)}
          </p>
          <h2 id="end-title" className="mt-1 text-xl font-bold tracking-tight text-white">
            {t.endScreen.rewardsTitle}
          </h2>

          <div
            className="my-1 flex flex-col items-center"
            role="img"
            aria-label={
              earnedStars === 0 ? t.endScreen.starsAriaNone : t.endScreen.starsAria(earnedStars)
            }
          >
            <motion.div
              className="flex justify-center gap-1"
              variants={endCoinStripParent}
              initial="hidden"
              animate="show"
            >
              {[0, 1, 2].map((index) => {
                const earned = index < earnedStars;
                return (
                  <motion.span
                    key={index}
                    variants={endCoinPopIn}
                    className={`inline-flex select-none leading-none ${
                      earned ? "drop-shadow-[0_0_8px_rgb(148_163_184/0.45)]" : ""
                    }`}
                    aria-hidden
                  >
                    <ContractIcon count={1} size="lg" seal="gold" muted={!earned} />
                  </motion.span>
                );
              })}
            </motion.div>
          </div>
          <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400">
            {t.endScreen.finalYieldLabel}
          </p>
          <div className="mt-1 mb-3 flex items-center justify-center gap-6">
            <p className="text-3xl font-black text-white">
              {score}{" "}
              <span className="text-lg text-slate-400">{t.endScreen.pointsUnit}</span>
            </p>
            {earnedCoins > 0 && (
              <p className="flex items-center gap-1.5 text-2xl font-black text-amber-400 tabular-nums">
                +{earnedCoins}
                <span
                  className="inline-flex select-none text-3xl leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  aria-hidden
                >
                  💰
                </span>
              </p>
            )}
          </div>

          <div
            className="pointer-events-none relative mx-auto mt-2 max-w-[min(100%,22rem)] origin-top scale-[0.75]"
            aria-hidden
          >
            <Grid
              planetId={levelDef?.planetId ?? 0}
              staticGrid={grid}
              staticFrozenCellIndices={frozenCellIndices}
              minimalMode
            />
            <EndScreenHeatmapOverlay scores={sessionCellScores} />
          </div>

          {isOptimalYield ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.35 }}
              className="mt-3 flex justify-center px-1"
            >
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-amber-400/70 bg-gradient-to-r from-amber-600/95 via-yellow-500/90 to-amber-500/95 px-3 py-2 text-center shadow-[0_0_32px_rgb(251_191_36/0.45)]">
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/25 to-transparent"
                  animate={{ opacity: [0.35, 0.65, 0.35] }}
                  transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <p className="relative font-mono text-sm font-black uppercase tracking-[0.12em] text-amber-950 drop-shadow-sm">
                  🏆 {t.endScreen.optimalBanner}
                </p>
              </div>
            </motion.div>
          ) : null}

          {earnedStars <= 1 ? (
            <div
              className="mt-3 flex flex-col items-center gap-1 rounded-xl border border-rose-900/50 bg-gradient-to-b from-rose-950/50 to-slate-950/40 px-3 py-2 text-center shadow-inner"
              role="status"
            >
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
                  {t.endScreen.insufficientBody}
                </p>
              )}
            </div>
          ) : null}

          {nextUnlocked ? (
            <p className="mt-2 text-center font-mono text-[10px] text-slate-500">
              {t.endScreen.nextStopLevel(nextId)}
            </p>
          ) : (
            <p className="mt-2 text-center font-mono text-[10px] text-slate-500">
              {t.nav.backToMap}
            </p>
          )}

          <p className="mt-2 text-center font-mono text-[10px] leading-relaxed text-slate-400">
            <Link
              href="/map"
              className="text-cyan-400 underline-offset-2 hover:text-cyan-300 hover:underline"
              onClick={() => {
                playUIClick();
                skipAutoMapRef.current = true;
              }}
            >
              {t.nav.map}
            </Link>
            {" · "}
            {t.endScreen.escapeOrBackdropHint}
          </p>

          {earnedStars > 0 && showVictoryExitBar ? (
            <div className="mt-2 px-1">
              <p className="mb-1 text-center font-mono text-[10px] text-slate-400">
                {t.endScreen.backToHqCountdown(AUTO_MAP_REDIRECT_SEC)}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/80">
                <motion.div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: AUTO_MAP_REDIRECT_SEC, ease: "linear" }}
                  onAnimationComplete={() => {
                    if (!skipAutoMapRef.current) {
                      router.push("/map");
                    }
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className={thumbZone}>
          <div className="flex flex-col gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleReplay}
              className="flex min-h-14 w-full items-center justify-center rounded-pp-xl border border-slate-600/80 bg-slate-800/90 px-5 py-3 font-mono text-sm font-semibold text-slate-100 shadow-lg shadow-black/30 hover:border-cyan-500/40 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/50"
            >
              {t.endScreen.replay}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleContinue}
              className="flex min-h-14 w-full items-center justify-center rounded-pp-xl border border-emerald-600/60 bg-gradient-to-b from-emerald-500 to-emerald-700 px-5 py-3 font-mono text-sm font-semibold text-white shadow-lg hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
            >
              {t.endScreen.continue}
            </motion.button>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleShare}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-pp-lg border border-slate-600/70 bg-slate-800/80 px-4 py-2.5 font-mono text-xs font-medium text-slate-300 transition-colors hover:border-cyan-500/35 hover:text-slate-100"
          >
            <Share2 className="size-4" strokeWidth={2} aria-hidden />
            {shareButtonText}
          </motion.button>

          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="flex min-h-12 w-full items-center justify-center rounded-pp-lg border border-slate-600/60 bg-slate-900/80 px-4 py-2.5 font-mono text-xs font-medium text-slate-400 transition-colors hover:border-slate-500 hover:bg-slate-800/90 hover:text-slate-200 active:scale-[0.98]"
          >
            {t.endScreen.closeSeeGrid}
          </button>
        </div>
      </div>
    </div>
  );
}
