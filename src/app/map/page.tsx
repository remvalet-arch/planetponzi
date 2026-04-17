"use client";

import { useRef } from "react";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { LevelMap } from "@/src/components/map/LevelMap";
import { MapHeader } from "@/src/components/map/MapHeader";

export default function MapPage() {
  const scrollRef = useRef<HTMLDivElement>(null);

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
    </div>
  );
}
