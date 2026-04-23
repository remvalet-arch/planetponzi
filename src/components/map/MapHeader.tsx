"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Menu, Star } from "lucide-react";

import { AppNavDrawer } from "@/src/components/layout/AppNavDrawer";
import { EconomyHeader } from "@/src/components/layout/EconomyHeader";
import { RulesModal, markRulesFirstVisitDone } from "@/src/components/ui/RulesModal";
import { computePassiveModifiers } from "@/src/lib/empire-tower";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { getMapCurrentLevel, planetIdForLevel } from "@/src/lib/levels";
import { toRomanSector } from "@/src/lib/roman";
import { useEmpireStore } from "@/src/store/useEmpireStore";
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
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const empireUnlocked = useEmpireStore((s) => s.unlockedNodes);
  const count = totalStars(starsByLevel);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const passivePerMin = useMemo(
    () => computePassiveModifiers(empireUnlocked).totalPassiveIncomePerMinute,
    [empireUnlocked],
  );

  const currentLevel = useMemo(
    () => getMapCurrentLevel(unlockedLevels, starsByLevel),
    [unlockedLevels, starsByLevel],
  );

  const sectorHud = useMemo(() => {
    const pid = planetIdForLevel(currentLevel);
    const start = pid * 10 + 1;
    const end = Math.min(100, (pid + 1) * 10);
    const doneInSector = unlockedLevels.filter((id) => id >= start && id <= end).length;
    const roman = toRomanSector(pid + 1);
    const meta = t.planets[pid];
    const name = meta?.name ?? "";
    return {
      roman,
      name,
      doneInSector,
      total: 10,
      pct: Math.min(100, Math.round((doneInSector / 10) * 100)),
    };
  }, [currentLevel, unlockedLevels, t]);

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
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
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

            <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-pp-lg border border-slate-600/60 bg-slate-900/70 px-2 py-2 sm:gap-2 sm:px-3">
              <Star className="size-5 shrink-0 fill-amber-400 text-amber-500" strokeWidth={1.5} aria-hidden />
              <span className="font-mono text-sm font-semibold tabular-nums text-white">
                {t.map.headerStarsCompact(count)}
              </span>
            </div>

            <div className="flex max-w-[min(38vw,9.5rem)] shrink-0 flex-col items-end gap-0.5 sm:max-w-none">
              <div className="w-full rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-2 py-1 text-center font-mono text-[9px] font-semibold uppercase leading-tight tracking-wide text-emerald-100/95 shadow-inner shadow-emerald-950/25 sm:text-[10px]">
                {t.map.passiveYieldChip(passivePerMin)}
              </div>
              <EconomyHeader className="max-w-[min(52vw,14rem)] justify-end sm:max-w-none" />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 shadow-inner shadow-emerald-950/20">
            <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-100/90 sm:text-[11px]">
              {t.map.sectorHudLine(sectorHud.roman, sectorHud.name)}
            </p>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800/90"
              role="progressbar"
              aria-valuenow={sectorHud.doneInSector}
              aria-valuemin={0}
              aria-valuemax={sectorHud.total}
              aria-label={t.map.sectorProgress(sectorHud.roman, sectorHud.doneInSector, sectorHud.total)}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-cyan-400 transition-[width] duration-500 ease-out"
                style={{ width: `${sectorHud.pct}%` }}
              />
            </div>
            <p className="mt-1.5 text-center font-mono text-[9px] text-emerald-200/80 sm:text-[10px]">
              {t.map.sectorProgress(sectorHud.roman, sectorHud.doneInSector, sectorHud.total)}
            </p>
          </div>
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
