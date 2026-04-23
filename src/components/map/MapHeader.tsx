"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, Star } from "lucide-react";

import { AppNavDrawer } from "@/src/components/layout/AppNavDrawer";
import { EconomyHeader } from "@/src/components/layout/EconomyHeader";
import { RulesModal, markRulesFirstVisitDone } from "@/src/components/ui/RulesModal";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useProgressStore } from "@/src/store/useProgressStore";

function totalStars(starsByLevel: Record<string, number>): number {
  let sum = 0;
  for (const v of Object.values(starsByLevel)) {
    if (typeof v === "number" && v > 0) sum += Math.min(3, Math.max(0, v));
  }
  return sum;
}

const tap = { scale: 0.92 };

export function MapHeader() {
  const { t } = useAppStrings();
  const starsByLevel = useProgressStore((s) => s.starsByLevel);
  const count = totalStars(starsByLevel);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const closeRules = () => {
    setRulesOpen(false);
    markRulesFirstVisitDone();
  };

  useEffect(() => {
    if (!drawerOpen && !rulesOpen) return;
    const shell = document.getElementById("pp-game-shell");
    const prev = shell?.style.overflow ?? "";
    if (shell) shell.style.overflow = "hidden";
    return () => {
      if (shell) shell.style.overflow = prev;
    };
  }, [drawerOpen, rulesOpen]);

  return (
    <>
      <header className="relative z-40 min-h-0 shrink-0 border-b border-cyan-500/20 bg-slate-950/90 px-3 pb-3 pt-[max(env(safe-area-inset-top),1rem)] text-slate-100 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <motion.button
            type="button"
            whileTap={tap}
            onClick={() => setDrawerOpen(true)}
            className="flex size-11 shrink-0 items-center justify-center rounded-pp-md border border-white/10 bg-slate-900/80 text-cyan-200 transition-colors hover:border-cyan-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/55"
            aria-expanded={drawerOpen}
            aria-controls="app-nav-drawer"
            aria-label={t.nav.menu}
          >
            <Menu className="size-6" strokeWidth={2} />
          </motion.button>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-pp-lg border border-slate-600/60 bg-slate-900/70 px-3 py-2">
            <Star className="size-5 shrink-0 fill-amber-400 text-amber-500" strokeWidth={1.5} aria-hidden />
            <span className="font-mono text-sm font-semibold tabular-nums text-white">
              {count}
              <span className="ml-1 text-xs font-medium text-slate-400">étoiles</span>
            </span>
          </div>

          <EconomyHeader className="max-w-[min(52vw,14rem)] sm:max-w-none" />
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
