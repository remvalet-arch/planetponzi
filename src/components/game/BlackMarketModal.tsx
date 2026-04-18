"use client";

import { motion } from "framer-motion";

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

  if (!open) return null;

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overscroll-y-none pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] sm:items-center"
      role="dialog"
      aria-modal
    >
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 z-[100] bg-slate-950/70 backdrop-blur-[2px]"
        aria-label={copy.close}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="relative z-[101] m-2 flex max-h-[min(92dvh,680px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-emerald-500/35 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.15)] sm:m-4"
      >
        <div className="flex shrink-0 items-start justify-between gap-2 p-4 pb-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/90">🛒</p>
            <h2 className="text-lg font-black tracking-tight text-white">{copy.title}</h2>
            <p className="mt-1 text-xs text-slate-400">{copy.subtitle}</p>
            <p className="mt-2 whitespace-nowrap font-mono text-xs text-amber-200/90">
              Solde : {coins} 💰 · coût : {BLACK_MARKET_TILE_COST} 💰
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-white/10 px-3 font-mono text-xs text-slate-300 hover:bg-white/5"
          >
            {copy.close}
          </button>
        </div>
        <ul className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto overscroll-y-contain px-4 pb-16 pt-0 sm:grid-cols-4">
          {ALL_TYPES.map((t) => {
            const th = getBuildingTheme(t);
            return (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => handlePick(t)}
                  className="flex w-full flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-3 text-center transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                >
                  <span className={`flex size-12 items-center justify-center rounded-lg text-2xl ${th.color}`}>
                    <span aria-hidden>{th.emoji}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{t}</span>
                  <span className="text-[11px] font-semibold text-emerald-300/90">{copy.buy}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
