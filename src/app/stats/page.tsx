"use client";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { StatsScreen } from "@/src/components/stats/StatsScreen";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

export default function StatsPage() {
  const { t } = useAppStrings();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-pp-bg text-pp-text">
      <header className="relative z-40 min-h-0 shrink-0 border-b border-pp-border bg-pp-bg/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md">
        <h1 className="text-center font-mono text-lg font-bold tracking-tight text-pp-text">{t.nav.bank}</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <StatsScreen />
      </div>
      <BottomNav />
    </div>
  );
}
