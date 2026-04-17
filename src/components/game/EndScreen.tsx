"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PanelBottomOpen, Share2, Star, X } from "lucide-react";

import { vibrateVictoryStars } from "@/src/lib/haptics";
import { calculateStars, LEVELS } from "@/src/lib/levels";
import { copyShareToClipboard } from "@/src/lib/ui-helpers";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import { useProgressStore } from "@/src/store/useProgressStore";

const starContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.22, delayChildren: 0.12 },
  },
};

const starItem = {
  hidden: { scale: 0, opacity: 0, rotate: -28 },
  show: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 520, damping: 18 },
  },
};

const thumbZone =
  "shrink-0 space-y-3 border-t border-pp-border bg-pp-surface px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]";

type EndScreenProps = {
  onShareFeedback: (message: string) => void;
};

export function EndScreen({ onShareFeedback }: EndScreenProps) {
  const router = useRouter();
  const grid = useLevelRunStore((s) => s.grid);
  const score = useLevelRunStore((s) => s.score);
  const seed = useLevelRunStore((s) => s.seed);
  const levelId = useLevelRunStore((s) => s.levelId);
  const status = useLevelRunStore((s) => s.status);
  const deckChallengeLevel = useLevelRunStore((s) => s.deckChallengeLevel);
  const enterLevel = useLevelRunStore((s) => s.enterLevel);
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const commitLevelResult = useProgressStore((s) => s.commitLevelResult);

  const [shareLabel, setShareLabel] = useState<"idle" | "copied" | "error">("idle");
  const [minimized, setMinimized] = useState(false);
  const [showVictoryExitBar, setShowVictoryExitBar] = useState(false);
  const committedRef = useRef(false);
  const victoryVibrateRef = useRef(false);
  const skipAutoMapRef = useRef(false);

  useEffect(() => {
    if (status !== "finished") {
      committedRef.current = false;
      skipAutoMapRef.current = false;
      setShowVictoryExitBar(false);
      queueMicrotask(() => setMinimized(false));
    }
  }, [status]);

  useEffect(() => {
    if (status !== "finished" || levelId < 1 || committedRef.current) return;
    committedRef.current = true;
    const stars = calculateStars(score, levelId);
    commitLevelResult(levelId, stars, score);
  }, [status, levelId, score, commitLevelResult]);

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
    const id = window.setTimeout(() => vibrateVictoryStars(), 480);
    return () => window.clearTimeout(id);
  }, [status, minimized]);

  /** Après les étoiles : victoire (≥1★) → barre 3s puis /map (sauf navigation manuelle). */
  useEffect(() => {
    if (status !== "finished" || minimized) {
      setShowVictoryExitBar(false);
      return;
    }
    const stars = calculateStars(score, levelId);
    if (stars <= 0) {
      setShowVictoryExitBar(false);
      return;
    }
    const id = window.setTimeout(() => setShowVictoryExitBar(true), 1300);
    return () => window.clearTimeout(id);
  }, [status, minimized, score, levelId]);

  if (status !== "finished" || levelId < 1) return null;

  const earnedStars = calculateStars(score, levelId);
  const nextId = levelId + 1;
  const hasNextLevel = LEVELS.some((l) => l.id === nextId);
  const nextUnlocked = hasNextLevel && unlockedLevels.includes(nextId);

  const handleShare = async () => {
    const ok = await copyShareToClipboard(grid, score, seed, {
      deckChallengeLevel,
      levelId,
    });
    if (ok) {
      setShareLabel("copied");
      onShareFeedback("Résumé copié dans le presse-papiers.");
    } else {
      setShareLabel("error");
      onShareFeedback("Copie impossible sur cet appareil.");
    }
    window.setTimeout(() => setShareLabel("idle"), 2200);
  };

  const handleReplay = () => {
    enterLevel(levelId);
    setMinimized(false);
  };

  const handleContinue = () => {
    skipAutoMapRef.current = true;
    setShowVictoryExitBar(false);
    if (nextUnlocked) {
      router.push(`/level/${nextId}`);
    } else {
      router.push("/map");
    }
  };

  const shareButtonText =
    shareLabel === "copied" ? "Copié ✓" : shareLabel === "error" ? "Réessayer" : "Partager le résumé";

  if (minimized) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(5.5rem,env(safe-area-inset-bottom)+4rem)] z-[45] flex justify-center px-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => setMinimized(false)}
          className="pointer-events-auto flex min-h-12 items-center gap-2 rounded-full border border-pp-border-strong bg-pp-elevated/95 px-4 py-2.5 font-mono text-xs font-semibold text-pp-text shadow-lg backdrop-blur-md transition-colors hover:border-pp-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60"
        >
          <PanelBottomOpen className="size-4 shrink-0 text-pp-accent" strokeWidth={2} aria-hidden />
          <span className="flex items-center gap-1.5">
            {Array.from({ length: earnedStars }).map((_, i) => (
              <Star key={i} className="size-4 fill-amber-400 text-amber-500" strokeWidth={1.5} aria-hidden />
            ))}
            <span className="tabular-nums text-pp-text-muted">· {score} pts</span>
          </span>
          <span className="sr-only">Rouvrir le bilan</span>
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
        <div className="pp-bottom-sheet-handle" aria-hidden />

        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="pp-btn-icon absolute right-3 top-7 z-[1]"
          aria-label="Réduire le bilan"
        >
          <X className="size-5" strokeWidth={2} />
        </button>

        <div className="pp-allow-select min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-4 pt-8">
          <p className="pr-14 font-mono text-[10px] uppercase tracking-[0.35em] text-pp-text-dim">
            Niveau {levelId} · terminé
          </p>
          <h2 id="end-title" className="mt-2 text-xl font-bold tracking-tight text-pp-text">
            Récompenses
          </h2>

          <motion.div
            className="mt-8 flex justify-center gap-4"
            variants={starContainer}
            initial="hidden"
            animate="show"
            role="list"
            aria-label={
              earnedStars === 0
                ? "Aucune étoile sur 3"
                : `${earnedStars} étoile${earnedStars > 1 ? "s" : ""} sur 3`
            }
          >
            {[0, 1, 2].map((index) => {
              const filled = index < earnedStars;
              return (
                <motion.div key={index} variants={starItem} role="listitem">
                  <Star
                    className={`size-[clamp(3rem,14vw,4.25rem)] drop-shadow-md ${
                      filled
                        ? "fill-amber-400 text-amber-600"
                        : "fill-slate-200/80 text-slate-400"
                    }`}
                    strokeWidth={filled ? 1.25 : 1.5}
                    aria-hidden
                  />
                </motion.div>
              );
            })}
          </motion.div>

          <p className="mt-8 text-center font-mono text-sm text-pp-text-muted">
            Score obtenu :{" "}
            <span className="font-semibold tabular-nums text-pp-text">{score}</span>
          </p>

          {nextUnlocked ? (
            <p className="mt-3 text-center font-mono text-[10px] text-pp-text-dim">
              Prochain arrêt : niveau {nextId}
            </p>
          ) : (
            <p className="mt-3 text-center font-mono text-[10px] text-pp-text-dim">
              Retour à la carte des niveaux
            </p>
          )}

          <p className="mt-6 text-center font-mono text-[10px] leading-relaxed text-pp-text-dim">
            <Link
              href="/map"
              className="text-pp-accent underline-offset-2 hover:underline"
              onClick={() => {
                skipAutoMapRef.current = true;
              }}
            >
              Carte
            </Link>
            {" · "}
            Échap ou fond : réduire
          </p>

          {earnedStars > 0 && showVictoryExitBar ? (
            <div className="mt-5 px-1">
              <p className="mb-2 text-center font-mono text-[10px] text-pp-text-muted">
                Retour au QG dans 3s…
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-pp-border">
                <motion.div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 3, ease: "linear" }}
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
          <div className="flex flex-col gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleReplay}
              className="flex min-h-14 w-full items-center justify-center rounded-pp-xl border border-pp-border-strong bg-pp-elevated px-5 py-3 font-mono text-sm font-semibold text-pp-text shadow-lg hover:border-pp-accent/40 hover:bg-pp-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60"
            >
              Rejouer
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleContinue}
              className="flex min-h-14 w-full items-center justify-center rounded-pp-xl border border-emerald-600/60 bg-gradient-to-b from-emerald-500 to-emerald-700 px-5 py-3 font-mono text-sm font-semibold text-white shadow-lg hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
            >
              Continuer
            </motion.button>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleShare}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-pp-lg border border-pp-border bg-pp-elevated/80 px-4 py-2.5 font-mono text-xs font-medium text-pp-text-muted transition-colors hover:border-pp-accent/40 hover:text-pp-text"
          >
            <Share2 className="size-4" strokeWidth={2} aria-hidden />
            {shareButtonText}
          </motion.button>

          <button type="button" onClick={() => setMinimized(true)} className="pp-btn-ghost">
            Fermer — voir la grille
          </button>
        </div>
      </div>
    </div>
  );
}
