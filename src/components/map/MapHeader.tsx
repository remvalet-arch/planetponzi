"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

import { AppNavDrawer } from "@/src/components/layout/AppNavDrawer";
import { ContractIcon } from "@/src/components/ui/ContractIcon";
import { EconomyHeader } from "@/src/components/layout/EconomyHeader";
import { RulesModal, markRulesFirstVisitDone } from "@/src/components/ui/RulesModal";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { getMapCurrentLevel, planetIdForLevel } from "@/src/lib/levels";
import { toRomanSector } from "@/src/lib/roman";
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
  const count = totalStars(starsByLevel);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

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
    return { roman, name, doneInSector };
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
              <ContractIcon count={1} size="sm" seal="gold" className="shrink-0 opacity-90" />
              <span className="min-w-0 truncate font-mono text-sm font-semibold text-white">
                {t.map.headerStarsCompact(count)}
              </span>
            </div>

            <EconomyHeader className="max-w-[min(52vw,15rem)] justify-end sm:max-w-none" />
          </div>

          <div
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-600/45 bg-slate-900/55 px-3 py-1.5"
            title={t.map.sectorProgressHint(sectorHud.roman, sectorHud.name, sectorHud.doneInSector, 10)}
          >
            <p className="min-w-0 truncate text-center font-mono text-[10px] leading-snug tracking-wide text-slate-300 sm:text-[11px]">
              {t.map.sectorHudCompact(sectorHud.roman, sectorHud.name, sectorHud.doneInSector)}
            </p>
            <span
              className="size-1.5 shrink-0 rounded-full bg-emerald-400/70 ring-1 ring-emerald-500/25"
              aria-hidden
            />
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
