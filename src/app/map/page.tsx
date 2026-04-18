"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { DailyBonusModal } from "@/src/components/map/DailyBonusModal";
import { LevelMap } from "@/src/components/map/LevelMap";
import { MapHeader } from "@/src/components/map/MapHeader";
import { StoryModal } from "@/src/components/map/StoryModal";
import { getPendingCeoStoryMilestone, markCeoMemoSeen } from "@/src/lib/ceo-memos";
import { resumeAudio } from "@/src/lib/game-sounds";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { getLocalDateSeed } from "@/src/lib/rng";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useProgressStore } from "@/src/store/useProgressStore";

export default function MapPage() {
  const { t } = useAppStrings();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [progressHydrated, setProgressHydrated] = useState(
    () => useProgressStore.persist.hasHydrated(),
  );
  const [storyDismissGen, setStoryDismissGen] = useState(0);

  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);

  useEffect(() => {
    return useProgressStore.persist.onFinishHydration(() => setProgressHydrated(true));
  }, []);

  const storyMilestone = useMemo(() => {
    void storyDismissGen;
    if (!progressHydrated || bonusOpen) return null;
    return getPendingCeoStoryMilestone(unlockedLevels);
  }, [progressHydrated, bonusOpen, unlockedLevels, storyDismissGen]);

  const closeStory = useCallback(() => {
    if (storyMilestone != null) markCeoMemoSeen(storyMilestone);
    setStoryDismissGen((n) => n + 1);
  }, [storyMilestone]);

  const storyMemo =
    storyMilestone != null
      ? ((t.ceoStory.memos as Record<string, { kicker: string; quote: string }>)[String(storyMilestone)] ??
        t.ceoStory.fallback)
      : null;

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
    <div
      className="flex min-h-0 flex-1 flex-col bg-pp-bg text-pp-text"
      onPointerDownCapture={() => resumeAudio()}
    >
      <MapHeader />
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain scroll-pt-[calc(env(safe-area-inset-top)+6.25rem)] pt-[max(2rem,calc(env(safe-area-inset-top)+5rem))] pb-10"
        data-pp-map-scroll
      >
        <LevelMap scrollParentRef={scrollRef} />
      </div>
      <BottomNav />
      <DailyBonusModal open={bonusOpen} onClose={() => setBonusOpen(false)} />
      {storyMilestone != null && storyMemo ? (
        <StoryModal
          key={storyMilestone}
          open
          memo={storyMemo}
          memoHeader={t.storyModal.memoHeader(storyMilestone)}
          closeLabel={t.storyModal.closeCta}
          onClose={closeStory}
        />
      ) : null}
    </div>
  );
}
