"use client";

import { useEffect, useState } from "react";
import { BarChart3, BookOpen, CalendarClock, Menu, RotateCcw, X } from "lucide-react";

import { useGameStore } from "@/src/store/useGameStore";

type AppHeaderProps = {
  formatRoi: (score: number) => string;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onTomorrowInfo: () => void;
  /** Après reset de la grille (feedback toast, etc.). */
  onRestartSameDay?: () => void;
};

export function AppHeader({
  formatRoi,
  onOpenRules,
  onOpenStats,
  onTomorrowInfo,
  onRestartSameDay,
}: AppHeaderProps) {
  const score = useGameStore((s) => s.score);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="pp-header-bar">
        <div className="mx-auto flex w-full max-w-lg items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex size-12 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500/60"
            aria-expanded={menuOpen}
            aria-controls="nav-drawer"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-6" strokeWidth={2} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-neutral-500 sm:text-[10px] sm:tracking-[0.35em]">
              Q4 · Spatial Yield Ops
            </p>
            <h1 className="truncate text-lg font-black tracking-tight sm:text-xl">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                Planet Ponzi
              </span>
            </h1>
          </div>

          <div className="shrink-0 rounded-md border border-neutral-800 bg-neutral-900/80 px-2.5 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 sm:text-[10px]">
              Live P&amp;L
            </p>
            <p
              className={`font-mono text-sm font-semibold tabular-nums sm:text-base ${
                score >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatRoi(score)}
            </p>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[70] flex"
          id="nav-drawer"
        >
          <button
            type="button"
            className="min-h-0 flex-1 bg-black/60"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="flex h-full w-[min(100%,22rem)] flex-col border-l border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-3">
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                Terminal
              </p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex size-12 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                aria-label="Fermer le menu"
              >
                <X className="size-6" />
              </button>
            </div>
            <nav
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3"
              aria-label="Navigation principale"
            >
              <button
                type="button"
                className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-left font-mono text-sm text-neutral-100 transition-colors hover:border-cyan-700/60 hover:bg-neutral-800/80 active:scale-[0.99]"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenRules();
                }}
              >
                <BookOpen className="size-5 shrink-0 text-cyan-400" strokeWidth={2} />
                Règles
              </button>
              <button
                type="button"
                className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-left font-mono text-sm text-neutral-100 transition-colors hover:border-violet-700/60 hover:bg-neutral-800/80 active:scale-[0.99]"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenStats();
                }}
              >
                <BarChart3 className="size-5 shrink-0 text-violet-400" strokeWidth={2} />
                Statistiques
              </button>
              <button
                type="button"
                className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-left font-mono text-sm text-neutral-100 transition-colors hover:border-amber-700/60 hover:bg-neutral-800/80 active:scale-[0.99]"
                onClick={() => {
                  setMenuOpen(false);
                  onTomorrowInfo();
                }}
              >
                <CalendarClock className="size-5 shrink-0 text-amber-400" strokeWidth={2} />
                Nouveau jeu (demain)
              </button>
              <button
                type="button"
                className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-left font-mono text-sm text-neutral-100 transition-colors hover:border-rose-700/50 hover:bg-neutral-800/80 active:scale-[0.99]"
                onClick={() => {
                  useGameStore.getState().restartTodayPuzzle();
                  setMenuOpen(false);
                  onRestartSameDay?.();
                }}
              >
                <RotateCcw className="size-5 shrink-0 text-rose-400" strokeWidth={2} />
                Recommencer aujourd’hui
              </button>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
