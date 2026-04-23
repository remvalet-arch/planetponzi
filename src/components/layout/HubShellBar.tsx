"use client";

import { cloneElement, isValidElement, type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

import { AppNavDrawer } from "@/src/components/layout/AppNavDrawer";
import { EconomyHeader } from "@/src/components/layout/EconomyHeader";
import { RulesModal, markRulesFirstVisitDone } from "@/src/components/ui/RulesModal";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

const tap = { scale: 0.92 };

type HubShellBarProps = {
  title: string;
  subtitle?: string;
  /** Ex. `<EconomyHeader />` sur la Tour */
  rightSlot?: ReactNode;
  variant?: "light" | "dark";
  /** Propagé à `EconomyHeader` dans `rightSlot` quand c’est ce composant. Défaut : true. */
  showLives?: boolean;
};

function injectEconomyHeaderShowLives(rightSlot: ReactNode, showLives: boolean): ReactNode {
  if (!isValidElement(rightSlot) || rightSlot.type !== EconomyHeader) return rightSlot;
  const prev = rightSlot.props as { showLives?: boolean };
  return cloneElement(rightSlot, {
    showLives: prev.showLives ?? showLives,
  });
}

export function HubShellBar({
  title,
  subtitle,
  rightSlot,
  variant = "light",
  showLives = true,
}: HubShellBarProps) {
  const { t } = useAppStrings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const closeRules = () => {
    setRulesOpen(false);
    markRulesFirstVisitDone();
  };

  const isDark = variant === "dark";

  return (
    <>
      <header
        className={
          isDark
            ? "relative z-40 min-h-0 shrink-0 border-b border-cyan-500/20 bg-slate-950/90 px-3 pb-3 pt-[max(env(safe-area-inset-top),1rem)] text-slate-100 backdrop-blur-md"
            : "relative z-40 min-h-0 shrink-0 border-b border-pp-border bg-pp-bg/95 px-3 pb-3 pt-[max(1rem,env(safe-area-inset-top))] text-pp-text backdrop-blur-md"
        }
      >
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <motion.button
            type="button"
            whileTap={tap}
            onClick={() => setDrawerOpen(true)}
            className={
              isDark
                ? "flex size-11 shrink-0 items-center justify-center rounded-pp-md border border-white/10 bg-slate-900/80 text-cyan-200 transition-colors hover:border-cyan-400/40"
                : "flex size-11 shrink-0 items-center justify-center rounded-pp-md border border-pp-border-strong bg-pp-elevated text-pp-text transition-colors hover:border-pp-accent/40 hover:bg-pp-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60"
            }
            aria-expanded={drawerOpen}
            aria-controls="app-nav-drawer"
            aria-label={t.nav.menu}
          >
            <Menu className="size-6" strokeWidth={2} />
          </motion.button>
          <div className="min-w-0 flex-1 text-center">
            <h1
              className={`font-mono text-base font-bold tracking-tight ${isDark ? "text-white" : "text-pp-text"}`}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className={`mt-0.5 font-mono text-[10px] ${isDark ? "text-cyan-200/70" : "text-pp-text-muted sm:text-xs"}`}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          {rightSlot ? (
            <div className="shrink-0">{injectEconomyHeaderShowLives(rightSlot, showLives)}</div>
          ) : (
            <div className="w-11 shrink-0 sm:w-0" aria-hidden />
          )}
        </div>
      </header>

      <AppNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenRules={() => setRulesOpen(true)}
      />
      <RulesModal open={rulesOpen} onClose={closeRules} />
    </>
  );
}
