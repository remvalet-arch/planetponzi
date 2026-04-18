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
      panelClassName="border-amber-500/35 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100 shadow-[0_0_48px_rgba(251,191,36,0.12)]"
      footer={footer}
    >
      <div className="shrink-0 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 to-transparent px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-200/90">{memoHeader}</p>
        <p className="mt-1 text-sm font-bold text-amber-50">{memo.kicker}</p>
      </div>
      <div className="pp-modal-scroll pb-2">
        <div className="flex gap-4">
          <div className="flex shrink-0 flex-col items-center gap-1">
            <div className="rounded-xl border border-amber-400/30 bg-slate-900/80 p-2 shadow-inner">
              <CeoTycoonMark />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">CEO</span>
          </div>
          <blockquote className="min-w-0 flex-1 border-l border-amber-500/15 pl-4">
            <p className="break-words text-sm leading-relaxed text-slate-200/95">&ldquo;{memo.quote}&rdquo;</p>
          </blockquote>
        </div>
      </div>
    </BottomSheetShell>
  );
}
