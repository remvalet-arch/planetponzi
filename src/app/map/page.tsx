"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { DailyBonusModal } from "@/src/components/map/DailyBonusModal";
import { LevelMap } from "@/src/components/map/LevelMap";
import { MapHeader } from "@/src/components/map/MapHeader";
import { StoryModal } from "@/src/components/map/StoryModal";
import {
  CEO_HUB_UNLOCK_MAX_LEVEL,
  getPendingCeoStoryMilestone,
  markCeoMemoSeen,
} from "@/src/lib/ceo-memos";
import { computePassiveModifiers } from "@/src/lib/empire-tower";
import { resumeAudio } from "@/src/lib/game-sounds";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { getLocalDateSeed } from "@/src/lib/rng";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useEmpireStore } from "@/src/store/useEmpireStore";
import { useProgressStore } from "@/src/store/useProgressStore";

export default function MapPage() {
  const { t, locale } = useAppStrings();
  const tRef = useRef(t);
  tRef.current = t;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [progressHydrated, setProgressHydrated] = useState(
    () => useProgressStore.persist.hasHydrated(),
  );
  const [storyDismissGen, setStoryDismissGen] = useState(0);
  const [mapHint, setMapHint] = useState<string | null>(null);

  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const hasSeenShopUnlockCeoMemo = useProgressStore((s) => s.hasSeenShopUnlockCeoMemo);
  const hasSeenTowerUnlockCeoMemo = useProgressStore((s) => s.hasSeenTowerUnlockCeoMemo);
  const markShopUnlockCeoMemoSeen = useProgressStore((s) => s.markShopUnlockCeoMemoSeen);
  const markTowerUnlockCeoMemoSeen = useProgressStore((s) => s.markTowerUnlockCeoMemoSeen);

  const maxUnlocked = useMemo(
    () => (unlockedLevels.length ? Math.max(...unlockedLevels) : 1),
    [unlockedLevels],
  );

  useEffect(() => {
    return useProgressStore.persist.onFinishHydration(() => setProgressHydrated(true));
  }, []);

  useEffect(() => {
    if (!progressHydrated) return;
    try {
      const msg = sessionStorage.getItem("pp-map-hint");
      if (msg) {
        sessionStorage.removeItem("pp-map-hint");
        queueMicrotask(() => {
          setMapHint(msg);
          window.setTimeout(() => setMapHint(null), 4200);
        });
      }
    } catch {
      /* ignore */
    }
  }, [progressHydrated]);

  const sectorMilestone = useMemo(() => {
    void storyDismissGen;
    if (!progressHydrated || bonusOpen) return null;
    return getPendingCeoStoryMilestone(unlockedLevels);
  }, [progressHydrated, bonusOpen, unlockedLevels, storyDismissGen]);

  const unlockKind = useMemo(() => {
    if (!progressHydrated || bonusOpen) return null;
    if (sectorMilestone != null) return null;
    if (maxUnlocked >= CEO_HUB_UNLOCK_MAX_LEVEL.shop && !hasSeenShopUnlockCeoMemo)
      return "shop" as const;
    if (maxUnlocked >= CEO_HUB_UNLOCK_MAX_LEVEL.tower && !hasSeenTowerUnlockCeoMemo)
      return "tower" as const;
    return null;
  }, [
    progressHydrated,
    bonusOpen,
    sectorMilestone,
    maxUnlocked,
    hasSeenShopUnlockCeoMemo,
    hasSeenTowerUnlockCeoMemo,
  ]);

  const closeStoryModal = useCallback(() => {
    if (sectorMilestone != null) {
      markCeoMemoSeen(sectorMilestone);
    } else if (unlockKind === "shop") {
      markShopUnlockCeoMemoSeen();
    } else if (unlockKind === "tower") {
      markTowerUnlockCeoMemoSeen();
    }
    setStoryDismissGen((n) => n + 1);
  }, [
    sectorMilestone,
    unlockKind,
    markShopUnlockCeoMemoSeen,
    markTowerUnlockCeoMemoSeen,
  ]);

  const storyPayload = useMemo(() => {
    if (sectorMilestone != null) {
      const memo =
        (t.ceoStory.memos as Record<string, { kicker: string; quote: string }>)[String(sectorMilestone)] ??
        t.ceoStory.fallback;
      return {
        key: `sector-${sectorMilestone}`,
        memoHeader: t.storyModal.memoHeader(sectorMilestone),
        memo,
      };
    }
    if (unlockKind === "shop") {
      return {
        key: "unlock-shop",
        memoHeader: t.unlockMemos.shopMemoHeader,
        memo: { kicker: t.unlockMemos.shopKicker, quote: t.unlockMemos.shopQuote },
      };
    }
    if (unlockKind === "tower") {
      return {
        key: "unlock-tower",
        memoHeader: t.unlockMemos.towerMemoHeader,
        memo: { kicker: t.unlockMemos.towerKicker, quote: t.unlockMemos.towerQuote },
      };
    }
    return null;
  }, [t, sectorMilestone, unlockKind]);

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

  useEffect(() => {
    const applyOffline = () => {
      if (!useEconomyStore.persist.hasHydrated() || !useEmpireStore.persist.hasHydrated()) return;
      const rate = computePassiveModifiers(useEmpireStore.getState().unlockedNodes).totalPassiveIncomePerMinute;
      const gain = useEconomyStore.getState().applyOfflinePassiveIncome(rate);
      if (gain > 0) {
        const msg = tRef.current.economy.offlineGain(gain);
        queueMicrotask(() => {
          setMapHint(msg);
          window.setTimeout(() => setMapHint((m) => (m === msg ? null : m)), 4200);
        });
      }
    };
    const uEco = useEconomyStore.persist.onFinishHydration(applyOffline);
    const uEmp = useEmpireStore.persist.onFinishHydration(applyOffline);
    applyOffline();
    return () => {
      uEco();
      uEmp();
    };
  }, [locale]);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col bg-[#0B0F19] text-slate-100"
      onPointerDownCapture={() => resumeAudio()}
    >
      <MapHeader />
      <div
        ref={scrollRef}
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-none scroll-pt-[calc(env(safe-area-inset-top)+6.25rem)] pt-[max(2rem,calc(env(safe-area-inset-top)+5rem))] pb-10"
        data-pp-map-scroll
      >
        {progressHydrated ? (
          <LevelMap scrollParentRef={scrollRef} />
        ) : (
          <div
            className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 px-4"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="size-9 animate-pulse rounded-full bg-violet-500/25 ring-2 ring-violet-400/20" />
            <p className="text-center font-mono text-[10px] text-slate-400">{t.map.loadingProgress}</p>
          </div>
        )}
      </div>
      <BottomNav variant="dark" />
      <DailyBonusModal open={bonusOpen} onClose={() => setBonusOpen(false)} />
      {storyPayload ? (
        <StoryModal
          key={storyPayload.key}
          open
          memo={storyPayload.memo}
          memoHeader={storyPayload.memoHeader}
          closeLabel={t.storyModal.closeCta}
          onClose={closeStoryModal}
        />
      ) : null}
      {mapHint ? (
        <div
          className="pointer-events-none fixed bottom-[max(5.5rem,env(safe-area-inset-bottom)+4.5rem)] left-1/2 z-[95] w-[min(92vw,22rem)] -translate-x-1/2 rounded-pp-md border border-amber-500/45 bg-slate-950/95 px-4 py-3 text-center font-mono text-xs leading-snug text-amber-100 shadow-lg backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          {mapHint}
        </div>
      ) : null}
    </div>
  );
}
