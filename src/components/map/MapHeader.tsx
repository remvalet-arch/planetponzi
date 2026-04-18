"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Menu, Star } from "lucide-react";

import { MapNavDrawer } from "@/src/components/map/MapNavDrawer";
import { EconomyHeader } from "@/src/components/layout/EconomyHeader";
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

  return (
    <>
      <header className="relative z-40 shrink-0 border-b border-pp-border bg-pp-bg/95 px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <motion.button
            type="button"
            whileTap={tap}
            onClick={() => setDrawerOpen(true)}
            className="flex size-11 shrink-0 items-center justify-center rounded-pp-md border border-pp-border-strong bg-pp-elevated text-pp-text transition-colors hover:border-pp-accent/40 hover:bg-pp-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60"
            aria-expanded={drawerOpen}
            aria-controls="map-nav-drawer"
            aria-label={t.nav.menu}
          >
            <Menu className="size-6" strokeWidth={2} />
          </motion.button>

          <Link
            href="/empire"
            className="flex size-11 shrink-0 items-center justify-center rounded-pp-md border border-cyan-500/35 bg-slate-900/80 text-lg shadow-md backdrop-blur-sm transition-colors hover:border-cyan-400/60 hover:bg-slate-800/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/60"
            aria-label={t.nav.empire}
            title={t.nav.empire}
          >
            <Building2 className="size-5 shrink-0 text-cyan-300" strokeWidth={2} aria-hidden />
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-pp-lg border border-pp-border-strong bg-pp-elevated/70 px-3 py-2">
            <Star className="size-5 shrink-0 fill-amber-400 text-amber-500" strokeWidth={1.5} aria-hidden />
            <span className="font-mono text-sm font-semibold tabular-nums text-pp-text">
              {count}
              <span className="ml-1 text-xs font-medium text-pp-text-muted">étoiles</span>
            </span>
          </div>

          <EconomyHeader className="max-w-[min(52vw,14rem)] sm:max-w-none" />
        </div>
      </header>

      <MapNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
