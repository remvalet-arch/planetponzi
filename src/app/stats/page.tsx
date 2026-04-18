"use client";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { HubShellBar } from "@/src/components/layout/HubShellBar";
import { StatsScreen } from "@/src/components/stats/StatsScreen";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

export default function StatsPage() {
  const { t } = useAppStrings();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-pp-bg text-pp-text">
      <HubShellBar title={t.nav.bank} />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <StatsScreen />
      </div>
      <BottomNav />
    </div>
  );
}
