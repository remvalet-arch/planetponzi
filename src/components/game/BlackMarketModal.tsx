"use client";

import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
import { BLACK_MARKET_TILE_COST } from "@/src/lib/black-market";
import { playErrorBuzzer } from "@/src/lib/game-sounds";
import { getBuildingTheme } from "@/src/lib/ui-helpers";
import type { BuildingType } from "@/src/types/game";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

const ALL_TYPES: BuildingType[] = ["habitacle", "eau", "serre", "mine"];

type BlackMarketCopy = {
  title: string;
  subtitle: string;
  close: string;
  buy: string;
  insufficient: string;
  success: string;
};

type BlackMarketModalProps = {
  open: boolean;
  onClose: () => void;
  copy: BlackMarketCopy;
  onToast: (message: string) => void;
};

export function BlackMarketModal({ open, onClose, copy, onToast }: BlackMarketModalProps) {
  const coins = useEconomyStore((s) => s.coins);
  const purchaseBlackMarketTile = useLevelRunStore((s) => s.purchaseBlackMarketTile);

  const handlePick = (t: BuildingType) => {
    if (useEconomyStore.getState().coins < BLACK_MARKET_TILE_COST) {
      playErrorBuzzer();
      onToast(copy.insufficient);
      return;
    }
    const ok = purchaseBlackMarketTile(t);
    if (ok) {
      onToast(copy.success);
      onClose();
    } else {
      playErrorBuzzer();
      onToast(copy.insufficient);
    }
  };

  const footer = (
    <div className="pp-modal-footer border-emerald-500/25 bg-slate-950/95">
      <p className="text-center font-mono text-xs leading-relaxed text-amber-200/95">
        <span className="font-semibold text-white">Coût : {BLACK_MARKET_TILE_COST}</span>
        <span aria-hidden> 💰</span>
        <span className="mx-1.5 text-slate-500">·</span>
        <span className="text-slate-300">Solde : {coins}</span>
        <span aria-hidden> 💰</span>
      </p>
    </div>
  );

  return (
    <BottomSheetShell
      open={open}
      onClose={onClose}
      panelClassName="pp-modal-panel--dark border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.18)]"
      footer={footer}
    >
      <div className="shrink-0 border-b border-emerald-500/25 bg-slate-950/90 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300/95">
              Marché noir
            </p>
            <h2 id="pp-black-market-title" className="mt-1.5 text-lg font-black tracking-tight text-white">
              {copy.title}
            </h2>
            <p className="mt-1.5 text-sm leading-snug text-slate-400">{copy.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 font-mono text-xs text-slate-200 hover:bg-white/10"
            aria-label={copy.close}
          >
            {copy.close}
          </button>
        </div>
      </div>

      <div className="pp-modal-scroll grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {ALL_TYPES.map((t) => {
          const th = getBuildingTheme(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => handlePick(t)}
              className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-3 text-center transition hover:border-emerald-400/45 hover:bg-emerald-500/10"
            >
              <span className={`flex size-12 items-center justify-center rounded-lg text-2xl ${th.color}`}>
                <span aria-hidden>{th.emoji}</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{t}</span>
              <span className="whitespace-normal break-words text-center text-[11px] font-semibold leading-tight text-emerald-300/95">
                {copy.buy}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-amber-200/90">{BLACK_MARKET_TILE_COST} 💰</span>
            </button>
          );
        })}
      </div>
    </BottomSheetShell>
  );
}
