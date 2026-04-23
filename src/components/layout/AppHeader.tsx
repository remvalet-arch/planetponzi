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
  /** Titre principal (ex. nom du secteur / planète) — sinon libellé marketing. */
  brandTitle?: string;
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
  brandTitle,
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
        <div className="mx-auto flex w-full max-w-lg items-center gap-1 sm:gap-1.5">
          <motion.button
            type="button"
            whileTap={tap}
            onClick={() => setMenuOpen(true)}
            className="flex size-11 shrink-0 items-center justify-center rounded-pp-md border border-white/10 bg-slate-900/80 text-cyan-200 transition-colors hover:border-cyan-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/55 sm:size-12"
            aria-expanded={menuOpen}
            aria-controls="app-nav-drawer"
            aria-label={t.nav.menu}
          >
            <Menu className="size-6" strokeWidth={2} />
          </motion.button>

          <div className="min-w-0 flex-1 pr-0.5">
            <h1
              className="truncate text-left text-[0.95rem] font-black leading-tight tracking-tight sm:text-lg md:text-xl"
              title={brandTitle ?? t.brand.name}
            >
              <span className="bg-gradient-to-r from-pp-gold via-pp-accent to-rose-500 bg-clip-text text-transparent">
                {brandTitle ?? t.brand.name}
              </span>
            </h1>
          </div>

          <EconomyHeader compact className="max-w-[min(38vw,9.5rem)] shrink-0 justify-end sm:max-w-[min(44vw,11rem)] md:max-w-none" />

          <div className="shrink-0 rounded-pp-md border border-slate-600/70 bg-slate-900/80 px-1.5 py-1.5 text-right shadow-md shadow-black/30 sm:px-2.5 sm:py-2">
            <p className="font-mono text-[8px] uppercase tracking-widest text-slate-500 sm:text-[9px]">
              <span className="hidden sm:inline">{t.gameHud.valorization}</span>
              <span className="sm:hidden">{t.gameHud.valorizationShort}</span>
            </p>
            <motion.p
              key={score}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className={`whitespace-nowrap font-mono text-xs font-semibold tabular-nums sm:text-sm md:text-base ${
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
