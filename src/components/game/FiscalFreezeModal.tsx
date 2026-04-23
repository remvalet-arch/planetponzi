"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

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

  const footer = (
    <div className="pp-modal-footer flex flex-col gap-2 border-white/10 bg-slate-950/95">
      <button
        type="button"
        onClick={onClose}
        className="flex min-h-12 w-full items-center justify-center rounded-pp-lg border border-cyan-500/45 bg-cyan-600/90 px-4 font-mono text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgb(34_211_238/0.25)] transition-[filter] hover:brightness-110"
      >
        {t.rules.fiscalFreezeTutorialCta}
      </button>
    </div>
  );

  return (
    <BottomSheetShell
      open={open}
      onClose={onClose}
      footer={footer}
      panelClassName="pp-modal-panel--dark"
      handleClassName="!bg-slate-600/80 !ring-slate-500/40"
    >
      <div className="pp-modal-header">
        <div className="min-w-0">
          <p className="pp-kicker">Boss</p>
          <h2 id="fiscal-freeze-modal-title" className="mt-1 font-mono text-base font-bold tracking-tight text-white">
            {t.rules.fiscalBossTitle}
          </h2>
        </div>
        <button type="button" onClick={onClose} className="pp-btn-icon" aria-label={t.energy.dismiss}>
          <X className="size-5" strokeWidth={2} />
        </button>
      </div>

      <div className="pp-modal-scroll pp-allow-select py-5 text-slate-100">
        <p className="text-sm leading-relaxed text-slate-400">{t.rules.fiscalFreezeTutorialBody}</p>
      </div>
    </BottomSheetShell>
  );
}
