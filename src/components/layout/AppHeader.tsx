"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

import { AppNavDrawer, type AppNavLevelMenuExtras } from "@/src/components/layout/AppNavDrawer";
import { EconomyHeader } from "@/src/components/layout/EconomyHeader";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

const tap = { scale: 0.92 };

type AppHeaderProps = {
  formatRoi: (score: number) => string;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onRestartLevel?: () => void;
  /** Partie en cours : abandon + navigation (ex. vers /map). */
  onNavigateToMap?: () => void;
  /** Entrées Carte + Recommencer dans le menu global (même tiroir que la carte). */
  levelMenu?: AppNavLevelMenuExtras | null;
};

export function AppHeader({
  formatRoi,
  onOpenRules,
  onOpenStats,
  onRestartLevel,
  onNavigateToMap,
  levelMenu,
}: AppHeaderProps) {
  const { t } = useAppStrings();
  const score = useLevelRunStore((s) => s.score);
  const [menuOpen, setMenuOpen] = useState(false);

  const resolvedLevelMenu: AppNavLevelMenuExtras | null =
    onNavigateToMap != null
      ? { onNavigateToMap, onRestartLevel }
      : null;

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
      <header className="pp-header-bar min-h-0 shrink-0">
        <div className="mx-auto flex w-full max-w-lg items-center gap-1.5 sm:gap-2">
          <motion.button
            type="button"
            whileTap={tap}
            onClick={() => setMenuOpen(true)}
            className="flex size-12 shrink-0 items-center justify-center rounded-pp-md border border-white/10 bg-slate-900/80 text-cyan-200 transition-colors hover:border-cyan-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/55"
            aria-expanded={menuOpen}
            aria-controls="app-nav-drawer"
            aria-label={t.nav.menu}
          >
            <Menu className="size-6" strokeWidth={2} />
          </motion.button>

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-slate-500 sm:text-[10px] sm:tracking-[0.35em]">
              Saga · Grille 4×4
            </p>
            <h1 className="truncate text-lg font-black tracking-tight sm:text-xl">
              <span className="bg-gradient-to-r from-pp-gold via-pp-accent to-rose-500 bg-clip-text text-transparent">
                Planet Ponzi
              </span>
            </h1>
          </div>

          <EconomyHeader className="max-w-[min(42vw,12rem)] sm:max-w-none" />

          <div className="shrink-0 rounded-pp-md border border-slate-600/70 bg-slate-900/80 px-2 py-2 text-right shadow-md shadow-black/30 sm:px-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 sm:text-[10px]">
              Score
            </p>
            <motion.p
              key={score}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className={`whitespace-nowrap font-mono text-sm font-semibold tabular-nums sm:text-base ${
                score >= 0 ? "text-pp-positive" : "text-pp-negative"
              }`}
            >
              {formatRoi(score)}
            </motion.p>
          </div>
        </div>
      </header>

      <AppNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenRules={onOpenRules}
        onOpenStats={onOpenStats}
        levelMenu={levelMenu ?? resolvedLevelMenu}
      />
    </>
  );
}
