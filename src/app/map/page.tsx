"use client";

import { useEffect, useRef, useState } from "react";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { DailyBonusModal } from "@/src/components/map/DailyBonusModal";
import { LevelMap } from "@/src/components/map/LevelMap";
import { MapHeader } from "@/src/components/map/MapHeader";
import { getLocalDateSeed } from "@/src/lib/rng";
import { useEconomyStore } from "@/src/store/useEconomyStore";

export default function MapPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [bonusOpen, setBonusOpen] = useState(false);

  useEffect(() => {
    const run = () => {
      if (!useEconomyStore.persist.hasHydrated()) return;
      useEconomyStore.getState().checkLifeRecharge();
      const { lastBonusDate } = useEconomyStore.getState();
      const today = getLocalDateSeed();
      if (lastBonusDate !== today) setBonusOpen(true);
    };
    const unsub = useEconomyStore.persist.onFinishHydration(run);
    run();
    return unsub;
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-pp-bg text-pp-text">
      <MapHeader />
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
        data-pp-map-scroll
      >
        <LevelMap scrollParentRef={scrollRef} />
      </div>
      <BottomNav />
      <DailyBonusModal open={bonusOpen} onClose={() => setBonusOpen(false)} />
    </div>
  );
}
