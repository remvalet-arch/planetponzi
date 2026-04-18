"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { EconomyHeader } from "@/src/components/layout/EconomyHeader";
import { HubShellBar } from "@/src/components/layout/HubShellBar";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { EMPIRE_FLOORS, EMPIRE_HELIPORT_FLOOR_ID } from "@/src/lib/empire-tower";
import { playEmpirePurchase } from "@/src/lib/game-sounds";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useEmpireStore } from "@/src/store/useEmpireStore";
import { useProgressStore } from "@/src/store/useProgressStore";

export default function EmpirePage() {
  const { t } = useAppStrings();
  const coins = useEconomyStore((s) => s.coins);
  const unlockedNodes = useEmpireStore((s) => s.unlockedNodes);
  const purchaseNode = useEmpireStore((s) => s.purchaseNode);
  const resetTowerAfterBankruptcy = useEmpireStore((s) => s.resetTowerAfterBankruptcy);
  const wipeEconomyForPrestige = useEconomyStore((s) => s.wipeEconomyForPrestige);
  const prestigeLevel = useProgressStore((s) => s.prestigeLevel);
  const incrementPrestige = useProgressStore((s) => s.incrementPrestige);

  const [toast, setToast] = useState<string | null>(null);
  const [bankruptcyOpen, setBankruptcyOpen] = useState(false);

  const heliportOwned = Boolean(unlockedNodes[EMPIRE_HELIPORT_FLOOR_ID]);

  useEffect(() => {
    const bump = () => {
      if (!useEconomyStore.persist.hasHydrated()) return;
      useEconomyStore.getState().checkLifeRecharge();
    };
    const unsubEco = useEconomyStore.persist.onFinishHydration(bump);
    const unsubEmp = useEmpireStore.persist.onFinishHydration(bump);
    bump();
    return () => {
      unsubEco();
      unsubEmp();
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const floorsAsc = useMemo(() => [...EMPIRE_FLOORS].sort((a, b) => a.order - b.order), []);

  const canUnlock = useCallback(
    (floorId: string) => {
      const floor = floorsAsc.find((f) => f.id === floorId);
      if (!floor) return false;
      for (const f of floorsAsc) {
        if (f.order >= floor.order) continue;
        if (!unlockedNodes[f.id]) return false;
      }
      return true;
    },
    [floorsAsc, unlockedNodes],
  );

  const handleBuy = (floorId: string, cost: number) => {
    if (!canUnlock(floorId)) {
      setToast(t.empirePage.needLower);
      return;
    }
    if (cost > 0 && coins < cost) {
      setToast(t.empirePage.insufficient);
      return;
    }
    const ok = purchaseNode(floorId, cost);
    setToast(ok ? t.empirePage.purchaseSuccess : t.empirePage.insufficient);
    if (ok) {
      playEmpirePurchase();
      useEconomyStore.getState().checkLifeRecharge();
    }
  };

  const confirmBankruptcy = () => {
    resetTowerAfterBankruptcy();
    wipeEconomyForPrestige();
    incrementPrestige();
    useEconomyStore.getState().checkLifeRecharge();
    setBankruptcyOpen(false);
    setToast(t.empirePage.bankruptcyDone);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-slate-100">
      <HubShellBar
        variant="dark"
        title={t.empirePage.title}
        subtitle={t.empirePage.subtitle}
        rightSlot={<EconomyHeader className="max-w-[min(52vw,14rem)] sm:max-w-none" />}
      />

      <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-y-auto overscroll-y-contain px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <div className="flex w-full shrink-0 flex-col gap-6 pb-16">
          {floorsAsc.map((floor, i) => {
            const owned = Boolean(unlockedNodes[floor.id]);
            const unlockable = canUnlock(floor.id);
            const blocked = !owned && !unlockable;
            const affordable = floor.cost === 0 || coins >= floor.cost;

            return (
              <motion.section
                key={floor.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex h-auto shrink-0 flex-col overflow-visible rounded-2xl border p-4 shadow-lg ${
                  owned
                    ? "border-emerald-500/40 bg-emerald-950/35"
                    : "border-violet-500/35 bg-slate-900/70 backdrop-blur-sm"
                }`}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                  aria-hidden
                />
                <div className="flex items-start gap-3">
                  <span className="shrink-0 text-3xl leading-none" aria-hidden>
                    {floor.emoji}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <h2 className="font-mono text-sm font-bold text-white">{floor.name}</h2>
                    <p className="whitespace-normal break-words text-left text-sm font-mono leading-relaxed text-slate-400">
                      {floor.description}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-violet-300/90">
                      {owned ? t.empirePage.purchased : blocked ? t.empirePage.locked : t.empirePage.buyFor}
                    </p>
                  </div>
                </div>
                {!owned ? (
                  <div className="mt-4 shrink-0">
                    {blocked ? (
                      <p className="flex items-center gap-2 font-mono text-xs text-amber-200/90">
                        <Lock className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                        {t.empirePage.needLower}
                      </p>
                    ) : (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        disabled={!affordable}
                        onClick={() => handleBuy(floor.id, floor.cost)}
                        className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-600/90 via-yellow-500/85 to-amber-500/90 p-4 font-mono text-sm font-bold text-amber-950 shadow-[0_0_24px_rgb(251_191_36/0.25)] transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span>💰</span>
                        <span className="tabular-nums">{floor.cost === 0 ? "0" : floor.cost}</span>
                      </motion.button>
                    )}
                  </div>
                ) : null}
              </motion.section>
            );
          })}

          <section className="mt-2 shrink-0 rounded-2xl border border-rose-500/30 bg-slate-950/60 p-4 shadow-lg backdrop-blur-sm">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-rose-200/90">
              {t.empirePage.prestigeKicker}
            </p>
            <p className="mt-2 whitespace-normal break-words text-left font-mono text-xs text-slate-300">
              {t.empirePage.prestigeScoreBonus}
            </p>
            <p className="mt-3 font-mono text-sm font-bold text-white">{t.empirePage.prestigeCurrent(prestigeLevel)}</p>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={!heliportOwned}
              title={!heliportOwned ? t.empirePage.bankruptcyLocked : undefined}
              onClick={() => heliportOwned && setBankruptcyOpen(true)}
              className="mt-4 flex w-full min-h-12 items-center justify-center rounded-xl border-2 border-rose-500/55 bg-gradient-to-r from-rose-950/80 via-rose-900/70 to-rose-950/80 p-4 font-mono text-sm font-bold text-rose-100 shadow-[0_0_20px_rgb(244_63_94/0.18)] transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {t.empirePage.bankruptcyCta}
            </motion.button>
            {!heliportOwned ? (
              <p className="mt-2 font-mono text-[11px] text-rose-200/70">{t.empirePage.bankruptcyLocked}</p>
            ) : null}
          </section>
        </div>
      </div>

      {bankruptcyOpen ? (
        <div
          className="pp-modal-backdrop bg-black/75"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pp-bankruptcy-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setBankruptcyOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-[101] w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-md"
          >
            <h2 id="pp-bankruptcy-title" className="font-mono text-base font-bold text-white">
              {t.empirePage.bankruptcyModalTitle}
            </h2>
            <p className="mt-3 font-mono text-sm leading-relaxed text-slate-300">{t.empirePage.bankruptcyModalBody}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setBankruptcyOpen(false)}
                className="min-h-11 rounded-xl border border-white/15 bg-slate-900/80 px-4 font-mono text-sm font-semibold text-slate-200"
              >
                {t.empirePage.bankruptcyCancel}
              </button>
              <button
                type="button"
                onClick={confirmBankruptcy}
                className="min-h-11 rounded-xl border-2 border-rose-500/60 bg-gradient-to-r from-rose-700 to-rose-600 px-4 font-mono text-sm font-bold text-white"
              >
                {t.empirePage.bankruptcyConfirm}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}

      {toast ? (
        <div
          className="pointer-events-none fixed bottom-24 left-1/2 z-[90] max-w-sm -translate-x-1/2 rounded-pp-lg border border-cyan-500/40 bg-slate-950/95 px-4 py-2 font-mono text-xs text-cyan-100 shadow-xl"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <BottomNav />
    </div>
  );
}
