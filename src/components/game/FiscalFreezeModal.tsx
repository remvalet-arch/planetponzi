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
    <div className="pp-modal-footer flex flex-col gap-2 border-pp-border/20 bg-pp-surface/98">
      <button
        type="button"
        onClick={onClose}
        className="flex min-h-12 w-full items-center justify-center rounded-pp-lg border border-pp-accent/45 bg-pp-accent/90 px-4 font-mono text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_var(--color-pp-accent-glow)] transition-[filter] hover:brightness-110"
      >
        {t.rules.fiscalFreezeTutorialCta}
      </button>
    </div>
  );

  return (
    <BottomSheetShell open={open} onClose={onClose} footer={footer}>
      <div className="pp-modal-header">
        <div className="min-w-0">
          <p className="pp-kicker">Boss</p>
          <h2 id="fiscal-freeze-modal-title" className="mt-1 font-mono text-base font-bold tracking-tight text-pp-text">
            {t.rules.fiscalBossTitle}
          </h2>
        </div>
        <button type="button" onClick={onClose} className="pp-btn-icon" aria-label={t.energy.dismiss}>
          <X className="size-5" strokeWidth={2} />
        </button>
      </div>

      <div className="pp-modal-scroll pp-allow-select py-5">
        <p className="text-sm leading-relaxed text-pp-text-muted">{t.rules.fiscalFreezeTutorialBody}</p>
      </div>
    </BottomSheetShell>
  );
}
