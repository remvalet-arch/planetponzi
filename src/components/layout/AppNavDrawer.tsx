"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Coffee,
  Map,
  RotateCcw,
  Settings,
  Trophy,
  X,
} from "lucide-react";

import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import { useProgressStore } from "@/src/store/useProgressStore";

const tap = { scale: 0.92 };

/** Liens & boutons nav : accent gauche + léger glow au survol (cyan / violet alternés). */
const navLinkClass =
  "group flex min-h-12 items-center gap-3 rounded-pp-lg border border-slate-700/60 border-l-[3px] border-l-transparent bg-slate-900/90 px-4 py-3 font-mono text-sm text-slate-100 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/50";

const navLinkHoverCyan =
  "hover:border-l-cyan-400/85 hover:shadow-[0_0_22px_rgba(34,211,238,0.18),inset_0_0_0_1px_rgba(34,211,238,0.08)]";

const navLinkHoverViolet =
  "hover:border-l-violet-400/80 hover:shadow-[0_0_22px_rgba(139,92,246,0.16),inset_0_0_0_1px_rgba(139,92,246,0.06)]";

const navRowClass = `${navLinkClass} w-full text-left`;

export type AppNavLevelMenuExtras = {
  onNavigateToMap: () => void;
  onRestartLevel?: () => void;
};

export type AppNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  onOpenRules: () => void;
  /** Archives : modale stats sur le niveau au lieu de `/stats`. */
  onOpenStats?: () => void;
  /** Mandat : Recommencer uniquement (Carte = entrée principale). */
  levelMenu?: AppNavLevelMenuExtras | null;
};

export function AppNavDrawer({
  open,
  onClose,
  onOpenRules,
  onOpenStats,
  levelMenu,
}: AppNavDrawerProps) {
  const { t } = useAppStrings();
  const resetCareer = useProgressStore((s) => s.resetCareer);
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const maxUnlocked = useMemo(
    () => (unlockedLevels.length ? Math.max(...unlockedLevels) : 1),
    [unlockedLevels],
  );
  const leaderboardUnlocked = maxUnlocked >= 10;

  const handleReset = () => {
    if (typeof window === "undefined") return;
    if (window.confirm(t.nav.resetConfirm)) {
      resetCareer();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex" id="app-nav-drawer" role="presentation">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative z-[100] min-h-0 flex-1 bg-slate-950/55 backdrop-blur-[2px]"
            aria-label={t.nav.closeMenu}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="relative z-[101] flex h-full w-[min(100%,20rem)] flex-col border-l border-slate-700/70 bg-slate-950 text-slate-100 shadow-2xl shadow-black/50"
          >
            <div className="flex min-h-0 items-center justify-between border-b border-slate-800 px-3 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
              <p className="font-mono text-xs uppercase tracking-widest text-slate-500">{t.nav.menu}</p>
              <motion.button
                type="button"
                whileTap={tap}
                onClick={onClose}
                className="flex size-11 items-center justify-center rounded-pp-md border border-slate-600/80 bg-slate-900 text-slate-200 hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white"
                aria-label={t.nav.closeMenu}
              >
                <X className="size-5" strokeWidth={2} />
              </motion.button>
            </div>
            <nav
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain p-3 pb-12"
              aria-label={t.nav.menu}
            >
              <Link
                href="/map"
                onClick={onClose}
                className={`${navLinkClass} ${navLinkHoverCyan}`}
              >
                <Map className="size-5 shrink-0 text-pp-gold-dark" strokeWidth={2} aria-hidden />
                {t.nav.map}
              </Link>
              {leaderboardUnlocked ? (
                <Link
                  href="/leaderboard"
                  onClick={onClose}
                  className={`${navLinkClass} ${navLinkHoverViolet}`}
                >
                  <Trophy className="size-5 shrink-0 text-amber-400" strokeWidth={2} aria-hidden />
                  {t.nav.leaderboard}
                </Link>
              ) : null}
              {onOpenStats ? (
                <motion.button
                  type="button"
                  whileTap={tap}
                  className={`${navRowClass} ${navLinkHoverCyan}`}
                  onClick={() => {
                    onClose();
                    onOpenStats();
                  }}
                >
                  <BarChart3 className="size-5 shrink-0 text-pp-violet" strokeWidth={2} aria-hidden />
                  {t.nav.bank}
                </motion.button>
              ) : (
                <Link
                  href="/stats"
                  onClick={onClose}
                  className={`${navLinkClass} ${navLinkHoverCyan}`}
                >
                  <BarChart3 className="size-5 shrink-0 text-pp-violet" strokeWidth={2} aria-hidden />
                  {t.nav.bank}
                </Link>
              )}
              <motion.button
                type="button"
                whileTap={tap}
                onClick={() => {
                  onClose();
                  onOpenRules();
                }}
                className={`${navRowClass} ${navLinkHoverViolet}`}
              >
                <BookOpen className="size-5 shrink-0 text-pp-accent" strokeWidth={2} aria-hidden />
                {t.rules.title}
              </motion.button>
              <Link
                href="/support"
                onClick={onClose}
                className={`${navLinkClass} ${navLinkHoverCyan}`}
              >
                <Coffee className="size-5 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                {t.nav.support}
              </Link>
              <Link
                href="/settings"
                onClick={onClose}
                className={`${navLinkClass} ${navLinkHoverViolet}`}
              >
                <Settings className="size-5 shrink-0 text-pp-accent" strokeWidth={2} aria-hidden />
                {t.nav.settings}
              </Link>

              {levelMenu?.onRestartLevel ? (
                <motion.button
                  type="button"
                  whileTap={tap}
                  className="flex min-h-12 w-full items-center gap-3 rounded-pp-lg border border-slate-700/60 border-l-[3px] border-l-transparent bg-slate-900/90 px-4 py-3 text-left font-mono text-sm text-slate-100 transition-all duration-200 hover:border-l-rose-400/70 hover:border-slate-600 hover:bg-rose-950/40 hover:shadow-[0_0_18px_rgba(244,63,94,0.12)]"
                  onClick={() => {
                    useLevelRunStore.getState().restartCurrentLevel();
                    onClose();
                    levelMenu.onRestartLevel?.();
                  }}
                >
                  <RotateCcw className="size-5 shrink-0 text-rose-500" strokeWidth={2} aria-hidden />
                  {t.nav.restartLevel}
                </motion.button>
              ) : null}

              <motion.button
                type="button"
                whileTap={tap}
                onClick={handleReset}
                className="flex min-h-12 w-full items-center gap-3 rounded-pp-lg border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-left font-mono text-sm text-rose-200 hover:border-rose-400/55 hover:bg-rose-950/45"
              >
                <RotateCcw className="size-5 shrink-0 text-rose-600" strokeWidth={2} aria-hidden />
                {t.nav.resetCareer}
              </motion.button>
            </nav>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
