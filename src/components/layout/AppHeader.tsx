"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Map, Menu, RotateCcw, X } from "lucide-react";

import { useLevelRunStore } from "@/src/store/useLevelRunStore";

const MotionLink = motion.create(Link);

const tap = { scale: 0.92 };

type AppHeaderProps = {
  formatRoi: (score: number) => string;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onRestartLevel?: () => void;
};

export function AppHeader({
  formatRoi,
  onOpenRules,
  onOpenStats,
  onRestartLevel,
}: AppHeaderProps) {
  const score = useLevelRunStore((s) => s.score);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const shell = document.getElementById("pp-game-shell");
    const prev = shell?.style.overflow ?? "";
    if (shell) shell.style.overflow = "hidden";
    return () => {
      if (shell) shell.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="pp-header-bar shrink-0">
        <div className="mx-auto flex w-full max-w-lg items-center gap-2">
          <motion.button
            type="button"
            whileTap={tap}
            onClick={() => setMenuOpen(true)}
            className="flex size-12 shrink-0 items-center justify-center rounded-pp-md border border-pp-border-strong bg-pp-elevated text-pp-text transition-colors hover:border-pp-accent/40 hover:bg-pp-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60"
            aria-expanded={menuOpen}
            aria-controls="nav-drawer"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-6" strokeWidth={2} />
          </motion.button>

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-pp-text-dim sm:text-[10px] sm:tracking-[0.35em]">
              Saga · Grille 4×4
            </p>
            <h1 className="truncate text-lg font-black tracking-tight sm:text-xl">
              <span className="bg-gradient-to-r from-pp-gold via-pp-accent to-rose-500 bg-clip-text text-transparent">
                Planet Ponzi
              </span>
            </h1>
          </div>

          <div className="shrink-0 rounded-pp-md border border-pp-border-strong bg-pp-surface px-2.5 py-2 text-right shadow-md sm:px-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-pp-text-dim sm:text-[10px]">
              Score
            </p>
            <p
              className={`font-mono text-sm font-semibold tabular-nums sm:text-base ${
                score >= 0 ? "text-pp-positive" : "text-pp-negative"
              }`}
            >
              {formatRoi(score)}
            </p>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[70] flex" id="nav-drawer">
          <motion.button
            type="button"
            whileTap={tap}
            className="min-h-0 flex-1 bg-slate-900/30 backdrop-blur-[2px]"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="flex h-full w-[min(100%,22rem)] flex-col border-l border-pp-border-strong bg-pp-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-pp-border px-3 py-3">
              <p className="font-mono text-xs uppercase tracking-widest text-pp-text-dim">Menu</p>
              <motion.button
                type="button"
                whileTap={tap}
                onClick={() => setMenuOpen(false)}
                className="flex size-12 items-center justify-center rounded-pp-md border border-pp-border-strong bg-pp-elevated text-pp-text hover:bg-pp-surface"
                aria-label="Fermer le menu"
              >
                <X className="size-6" />
              </motion.button>
            </div>
            <nav
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3"
              aria-label="Navigation principale"
            >
              <motion.button
                type="button"
                whileTap={tap}
                className="flex min-h-14 w-full items-center gap-3 rounded-pp-lg border border-pp-border-strong bg-pp-elevated/90 px-4 py-3 text-left font-mono text-sm text-pp-text transition-colors hover:border-pp-accent/45 hover:bg-pp-surface"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenRules();
                }}
              >
                <BookOpen className="size-5 shrink-0 text-pp-accent" strokeWidth={2} />
                Règles
              </motion.button>
              <motion.button
                type="button"
                whileTap={tap}
                className="flex min-h-14 w-full items-center gap-3 rounded-pp-lg border border-pp-border-strong bg-pp-elevated/90 px-4 py-3 text-left font-mono text-sm text-pp-text transition-colors hover:border-pp-violet/45 hover:bg-pp-surface"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenStats();
                }}
              >
                <BarChart3 className="size-5 shrink-0 text-pp-violet" strokeWidth={2} />
                Statistiques
              </motion.button>
              <MotionLink
                href="/map"
                whileTap={tap}
                className="flex min-h-14 w-full items-center gap-3 rounded-pp-lg border border-pp-border-strong bg-pp-elevated/90 px-4 py-3 font-mono text-sm text-pp-text transition-colors hover:border-pp-gold/50 hover:bg-pp-surface"
                onClick={() => setMenuOpen(false)}
              >
                <Map className="size-5 shrink-0 text-pp-gold-dark" strokeWidth={2} />
                Carte des niveaux
              </MotionLink>
              <motion.button
                type="button"
                whileTap={tap}
                className="flex min-h-14 w-full items-center gap-3 rounded-pp-lg border border-pp-border-strong bg-pp-elevated/90 px-4 py-3 text-left font-mono text-sm text-pp-text transition-colors hover:border-rose-400/45 hover:bg-pp-surface"
                onClick={() => {
                  useLevelRunStore.getState().restartCurrentLevel();
                  setMenuOpen(false);
                  onRestartLevel?.();
                }}
              >
                <RotateCcw className="size-5 shrink-0 text-rose-500" strokeWidth={2} />
                Recommencer le niveau
              </motion.button>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
