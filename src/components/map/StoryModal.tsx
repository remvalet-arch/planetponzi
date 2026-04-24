"use client";

import { BoardComicShell } from "@/src/components/layout/BoardComicShell";
import type { CeoMood } from "@/src/components/ui/CeoAvatar";
import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";

type StoryMemo = {
  kicker: string;
  quote: string;
};

type StoryModalProps = {
  open: boolean;
  memo: StoryMemo;
  memoHeader: string;
  closeLabel: string;
  onClose: () => void;
  mood: CeoMood;
};

export function StoryModal({ open, memo, memoHeader, closeLabel, onClose, mood }: StoryModalProps) {
  return (
    <BottomSheetShell
      open={open}
      onClose={onClose}
      showHandle={false}
      backdropClassName="!items-center !justify-center !py-8 !pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      panelClassName="pp-modal-panel--story-compact border-amber-500/35 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100 shadow-[0_0_48px_rgba(251,191,36,0.12)] sm:!rounded-2xl"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-visible overscroll-y-contain px-3 pb-6 pt-8">
        <BoardComicShell
          variant="modal"
          mood={mood}
          title={memo.kicker}
          titleId="story-modal-title"
          dialogueText={memo.quote}
          bubbleClassName="!border-amber-500/35"
        >
          <p className="mb-4 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-amber-200/75">
            {memoHeader}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-amber-500/40 bg-amber-500/15 py-2.5 font-mono text-sm font-semibold text-amber-100 transition hover:bg-amber-500/25"
          >
            {closeLabel}
          </button>
        </BoardComicShell>
      </div>
    </BottomSheetShell>
  );
}
