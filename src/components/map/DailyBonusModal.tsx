"use client";

import { useCallback } from "react";

import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useEconomyStore } from "@/src/store/useEconomyStore";

type DailyBonusModalProps = {
  open: boolean;
  onClose: () => void;
};

export function DailyBonusModal({ open, onClose }: DailyBonusModalProps) {
  const { t } = useAppStrings();
  const claimDailyBonus = useEconomyStore((s) => s.claimDailyBonus);

  const handleClaim = useCallback(() => {
    claimDailyBonus();
    onClose();
  }, [claimDailyBonus, onClose]);

  const footer = (
    <div className="pp-modal-footer border-cyan-400/20 bg-pp-surface/98">
      <button
        type="button"
        onClick={handleClaim}
        className="min-h-12 w-full rounded-pp-lg border border-cyan-400/35 bg-gradient-to-r from-violet-600/90 via-fuchsia-600/85 to-cyan-600/90 px-4 font-mono text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_28px_rgb(34_211_238/0.28)] transition-[filter] hover:brightness-110"
      >
        {t.dailyBonus.cta}
      </button>
    </div>
  );

  return (
    <BottomSheetShell
      open={open}
      onClose={onClose}
      closeOnBackdropPress={false}
      disableSwipeDown
      footer={footer}
    >
      <div className="pp-modal-scroll pt-1">
        <div>
          <p className="pp-kicker text-cyan-300/90">{t.dailyBonus.kicker}</p>
          <h2 className="mt-2 font-mono text-lg font-bold text-pp-text">{t.dailyBonus.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-pp-text-muted">{t.dailyBonus.body}</p>
        </div>
      </div>
    </BottomSheetShell>
  );
}
