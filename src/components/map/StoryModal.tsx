"use client";

import { CeoTycoonMark } from "@/src/components/map/PlayerAvatar";
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
};

export function StoryModal({ open, memo, memoHeader, closeLabel, onClose }: StoryModalProps) {
  const footer = (
    <div className="pp-modal-footer border-amber-500/20 bg-slate-950/95">
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl border border-amber-500/40 bg-amber-500/15 py-2.5 font-mono text-sm font-semibold text-amber-100 transition hover:bg-amber-500/25"
      >
        {closeLabel}
      </button>
    </div>
  );

  return (
    <BottomSheetShell
      open={open}
      onClose={onClose}
      showHandle={false}
      backdropClassName="!items-center !justify-center !py-8 !pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      panelClassName="pp-modal-panel--story-compact border-amber-500/35 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100 shadow-[0_0_48px_rgba(251,191,36,0.12)] sm:!rounded-2xl"
      footer={footer}
    >
      <div className="shrink-0 border-b border-amber-500/15 bg-gradient-to-r from-amber-950/30 to-transparent px-5 py-2.5 text-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-amber-200/80">{memoHeader}</p>
        <p className="mt-1 text-sm font-bold leading-snug text-amber-50">{memo.kicker}</p>
      </div>
      <div className="px-5 py-4">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <div className="flex shrink-0 scale-[0.82] flex-col items-center gap-0.5 origin-top sm:origin-top-left">
            <div className="rounded-lg border border-amber-400/25 bg-slate-900/70 p-1.5 shadow-inner">
              <CeoTycoonMark />
            </div>
          </div>
          <blockquote className="min-w-0 max-w-prose flex-1 border-amber-500/10 sm:border-l sm:pl-4 sm:text-left">
            <p className="break-words text-sm leading-relaxed text-slate-200/95">&ldquo;{memo.quote}&rdquo;</p>
          </blockquote>
        </div>
      </div>
    </BottomSheetShell>
  );
}
