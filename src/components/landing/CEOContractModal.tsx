"use client";

import { useCallback, useState } from "react";

import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useProgressStore } from "@/src/store/useProgressStore";

type CEOContractModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CEOContractModal({ open, onClose }: CEOContractModalProps) {
  const { t } = useAppStrings();
  const setPseudo = useProgressStore((s) => s.setPseudo);
  const [value, setValue] = useState("");

  const handleSign = useCallback(() => {
    const next = value.trim().slice(0, 15);
    if (!next) return;
    setPseudo(next);
    setValue("");
    onClose();
  }, [value, onClose, setPseudo]);

  return (
    <BottomSheetShell open={open} onClose={onClose} closeOnBackdropPress>
      <div className="flex max-h-[min(70dvh,520px)] flex-col gap-4 overflow-y-auto overscroll-y-contain px-4 pb-4 pt-2">
        <div>
          <p className="pp-kicker text-amber-200/90">{t.ceoContract.kicker}</p>
          <h2 className="mt-2 font-mono text-lg font-bold text-pp-text">{t.ceoContract.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-pp-text-muted">{t.ceoContract.body}</p>
        </div>
        <label className="flex flex-col gap-2 font-mono text-xs text-pp-text-muted">
          {t.ceoContract.label}
          <input
            type="text"
            maxLength={15}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, 15))}
            placeholder={t.ceoContract.placeholder}
            className="min-h-12 rounded-pp-lg border border-pp-border-strong bg-pp-elevated px-3 font-mono text-sm text-pp-text placeholder:text-pp-text-dim focus:border-pp-accent/50 focus:outline-none focus:ring-1 focus:ring-pp-accent/40"
            autoComplete="nickname"
          />
        </label>
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handleSign}
            disabled={!value.trim()}
            className="min-h-12 rounded-pp-lg border border-amber-400/40 bg-gradient-to-r from-amber-600/90 via-amber-500/85 to-yellow-500/90 px-4 font-mono text-sm font-bold uppercase tracking-widest text-slate-950 shadow-[0_0_24px_rgb(251_191_36/0.25)] transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t.ceoContract.cta}
          </button>
        </div>
      </div>
    </BottomSheetShell>
  );
}
