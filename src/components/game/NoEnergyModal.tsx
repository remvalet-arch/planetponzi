"use client";

import Link from "next/link";

import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

type NoEnergyModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NoEnergyModal({ open, onClose }: NoEnergyModalProps) {
  const { t } = useAppStrings();

  const footer = (
    <div className="pp-modal-footer flex flex-col gap-2 border-rose-200/15 bg-pp-surface/98">
      <Link
        href="/shop"
        onClick={onClose}
        className="flex min-h-12 items-center justify-center rounded-pp-lg border border-amber-400/40 bg-gradient-to-r from-amber-600/90 via-amber-500/85 to-yellow-500/90 px-4 font-mono text-sm font-bold uppercase tracking-widest text-slate-950 shadow-[0_0_24px_rgb(251_191_36/0.25)] transition-[filter] hover:brightness-110"
      >
        {t.energy.shopCta}
      </Link>
      <button type="button" onClick={onClose} className="pp-btn-ghost">
        {t.energy.dismiss}
      </button>
    </div>
  );

  return (
    <BottomSheetShell open={open} onClose={onClose} closeOnBackdropPress footer={footer}>
      <div className="pp-modal-scroll pt-1">
        <div>
          <p className="pp-kicker text-rose-300/90">{t.energy.kicker}</p>
          <h2 className="mt-2 font-mono text-lg font-bold text-pp-text">{t.energy.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-pp-text-muted">{t.energy.body}</p>
        </div>
      </div>
    </BottomSheetShell>
  );
}
