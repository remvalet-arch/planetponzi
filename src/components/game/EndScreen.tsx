"use client";

import { useEffect, useState } from "react";
import { PanelBottomOpen, Share2, X } from "lucide-react";

import { copyShareToClipboard } from "@/src/lib/ui-helpers";
import { useGameStore } from "@/src/store/useGameStore";

function cynicalLineForScore(score: number): string {
  if (score > 40) return "Yacht acheté.";
  if (score < 15) return "Démission forcée.";
  if (score >= 32) return "Le board valide votre audace. Les poursuites, moins.";
  if (score >= 25) return "Bonus ESOP reporté au prochain trimestre.";
  if (score >= 18) return "Performance acceptable. La communication enterre le reste.";
  return "Mise au placard stratégique. Continuez à sourire sur Slack.";
}

type EndScreenProps = {
  onShareFeedback: (message: string) => void;
};

export function EndScreen({ onShareFeedback }: EndScreenProps) {
  const grid = useGameStore((s) => s.grid);
  const score = useGameStore((s) => s.score);
  const seed = useGameStore((s) => s.seed);
  const status = useGameStore((s) => s.status);
  const deckChallengeLevel = useGameStore((s) => s.deckChallengeLevel);

  const [shareLabel, setShareLabel] = useState<"idle" | "copied" | "error">("idle");
  /** Permet de quitter l’overlay tout en gardant la partie « terminée » dans le store. */
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (status !== "finished") {
      queueMicrotask(() => {
        setMinimized(false);
      });
    }
  }, [status]);

  useEffect(() => {
    if (status !== "finished" || minimized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMinimized(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, minimized]);

  if (status !== "finished") return null;

  const line = cynicalLineForScore(score);

  const handleShare = async () => {
    const ok = await copyShareToClipboard(
      grid,
      score,
      seed,
      deckChallengeLevel >= 2 ? { deckChallengeLevel } : undefined,
    );
    if (ok) {
      setShareLabel("copied");
      onShareFeedback("Copié — spammez vos actionnaires.");
    } else {
      setShareLabel("error");
      onShareFeedback("Échec du copier-coller. Le compliance a gagné.");
    }
    window.setTimeout(() => setShareLabel("idle"), 2200);
  };

  const buttonText =
    shareLabel === "copied"
      ? "Copié ✓"
      : shareLabel === "error"
        ? "Réessayer"
        : "Copier le bilan";

  if (minimized) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(5.5rem,env(safe-area-inset-bottom)+4rem)] z-[45] flex justify-center px-4 sm:justify-end sm:pr-4">
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="pointer-events-auto flex min-h-12 items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/95 px-4 py-2.5 font-mono text-xs font-semibold text-neutral-200 shadow-lg backdrop-blur-md transition-colors hover:border-cyan-600/50 hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500/60"
        >
          <PanelBottomOpen className="size-4 shrink-0 text-cyan-400" strokeWidth={2} aria-hidden />
          Bilan · {score >= 0 ? "+" : ""}
          {score}M$ — rouvrir
        </button>
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
        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="pp-btn-icon absolute right-3 top-3"
          aria-label="Fermer le bilan et retourner à la grille"
        >
          <X className="size-5" strokeWidth={2} />
        </button>

        <p className="pr-14 font-mono text-[10px] uppercase tracking-[0.35em] text-pp-text-dim">
          Clôture de mandat · {seed}
        </p>
        <h2 id="end-title" className="mt-2 font-mono text-lg font-bold text-pp-text sm:text-xl">
          Bilan consolidé
        </h2>

        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-pp-text-dim">
          ROI final
        </p>
        <p
          className={`mt-1 font-mono text-5xl font-black tabular-nums sm:text-6xl ${
            score >= 0 ? "text-pp-positive" : "text-pp-negative"
          }`}
        >
          {score >= 0 ? "+" : ""}
          {score}
          <span className="text-2xl font-bold text-pp-text-muted sm:text-3xl">M$</span>
        </p>

        <p className="mt-4 border-l-2 border-pp-accent/60 pl-3 font-mono text-sm leading-relaxed text-pp-text-muted">
          {line}
        </p>

        <button
          type="button"
          onClick={handleShare}
          className="mt-8 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/80 to-emerald-950/80 px-4 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.2)] transition-transform active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/80"
        >
          <Share2 className="size-5" strokeWidth={2} aria-hidden />
          {buttonText}
        </button>

        <button type="button" onClick={() => setMinimized(true)} className="pp-btn-ghost mt-3">
          Fermer — voir la grille
        </button>

        <p className="mt-3 text-center font-mono text-[10px] leading-relaxed text-pp-text-dim">
          🟩 = ROI Élevé, 🟥 = ROI Nul ou Malus
        </p>
        <p className="mt-1 text-center font-mono text-[10px] text-pp-text-dim">
          Échap ou zone sombre : fermer aussi.
        </p>
        <p className="mt-1 text-center font-mono text-[10px] text-pp-text-dim">
          Format texte — compatible groupes WhatsApp cyniques.
        </p>
      </div>
    </div>
  );
}
