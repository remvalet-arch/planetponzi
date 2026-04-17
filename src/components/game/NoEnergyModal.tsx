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

  return (
    <BottomSheetShell open={open} onClose={onClose} closeOnBackdropPress>
      <div className="flex max-h-[min(85dvh,28rem)] min-h-0 flex-col gap-4 overflow-y-auto overscroll-y-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <div>
          <p className="pp-kicker text-rose-300/90">{t.energy.kicker}</p>
          <h2 className="mt-2 font-mono text-lg font-bold text-pp-text">{t.energy.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-pp-text-muted">{t.energy.body}</p>
        </div>
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
    </BottomSheetShell>
  );
}
