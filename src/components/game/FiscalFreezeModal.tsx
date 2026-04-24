"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { BoardComicShell } from "@/src/components/layout/BoardComicShell";
import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

type FiscalFreezeModalProps = {
  open: boolean;
  onClose: () => void;
};

export function FiscalFreezeModal({ open, onClose }: FiscalFreezeModalProps) {
  const { t } = useAppStrings();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <BottomSheetShell
      open={open}
      onClose={onClose}
      panelClassName="pp-modal-panel--dark overflow-visible"
      handleClassName="!bg-slate-600/80 !ring-slate-500/40"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-visible overscroll-y-contain px-2 pb-4 pt-8">
        <BoardComicShell
          variant="modal"
          mood="angry"
          title={t.rules.fiscalBossTitle}
          titleId="fiscal-freeze-modal-title"
          dialogueText={t.rules.fiscalFreezeTutorialBody}
          bubbleClassName="!border-cyan-500/30"
        >
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={onClose} className="pp-btn-icon" aria-label={t.energy.dismiss}>
              <X className="size-5" strokeWidth={2} />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-12 w-full items-center justify-center rounded-pp-lg border border-cyan-500/45 bg-cyan-600/90 px-4 font-mono text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgb(34_211_238/0.25)] transition-[filter] hover:brightness-110"
          >
            {t.rules.fiscalFreezeTutorialCta}
          </button>
        </BoardComicShell>
      </div>
    </BottomSheetShell>
  );
}
