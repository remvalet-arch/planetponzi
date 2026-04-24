"use client";

import { useCallback } from "react";

import { BoardComicShell } from "@/src/components/layout/BoardComicShell";
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
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-visible overscroll-y-contain px-2 pb-3 pt-8 w-full min-w-0">
        <BoardComicShell variant="modal" mood="happy" title={t.dailyBonus.title} dialogueText={t.modalDialogue.daily}>
          <p className="pp-kicker text-cyan-300/90">{t.dailyBonus.kicker}</p>
          <p className="mt-2 text-sm leading-relaxed text-pp-text-muted">{t.dailyBonus.body}</p>
        </BoardComicShell>
      </div>
    </BottomSheetShell>
  );
}
