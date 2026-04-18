"use client";

import { motion } from "framer-motion";

import { CeoTycoonMark } from "@/src/components/map/PlayerAvatar";

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
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overscroll-y-none pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] sm:items-center"
      role="dialog"
      aria-modal
    >
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 z-[100] bg-slate-950/75 backdrop-blur-[2px]"
        aria-label="Fermer"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative z-[101] m-3 flex max-h-[min(88dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-amber-500/35 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-[0_0_48px_rgba(251,191,36,0.12)]"
      >
        <div className="shrink-0 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 to-transparent px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-200/90">{memoHeader}</p>
          <p className="mt-1 text-sm font-bold text-amber-50">{memo.kicker}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 pb-12">
          <div className="flex gap-4">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div className="rounded-xl border border-amber-400/30 bg-slate-900/80 p-2 shadow-inner">
                <CeoTycoonMark />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">CEO</span>
            </div>
            <blockquote className="min-w-0 flex-1 border-l border-amber-500/15 pl-4">
              <p className="break-words text-sm leading-relaxed text-slate-200/95">
                &ldquo;{memo.quote}&rdquo;
              </p>
            </blockquote>
          </div>
        </div>
        <div className="shrink-0 border-t border-white/5 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-amber-500/40 bg-amber-500/15 py-2.5 font-mono text-sm font-semibold text-amber-100 transition hover:bg-amber-500/25"
          >
            {closeLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
