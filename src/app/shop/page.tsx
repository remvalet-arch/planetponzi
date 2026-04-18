"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useProgressStore } from "@/src/store/useProgressStore";

const PRICE_SURVIVAL = 100;
const PRICE_DEMOLITION = 50;
const PRICE_SPY = 30;

export default function ShopPage() {
  const { t } = useAppStrings();
  const coins = useEconomyStore((s) => s.coins);
  const spendCoins = useEconomyStore((s) => s.spendCoins);
  const refillLives = useEconomyStore((s) => s.refillLives);
  const addBoosters = useProgressStore((s) => s.addBoosters);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const bump = () => {
      if (!useEconomyStore.persist.hasHydrated()) return;
      useEconomyStore.getState().checkLifeRecharge();
    };
    const unsub = useEconomyStore.persist.onFinishHydration(bump);
    bump();
    return unsub;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const buySurvival = useCallback(() => {
    if (!spendCoins(PRICE_SURVIVAL)) {
      setToast(t.shop.insufficient);
      return;
    }
    refillLives();
    setToast(t.shop.boughtSurvival);
  }, [refillLives, spendCoins, t.shop]);

  const buyDemolition = useCallback(() => {
    if (!spendCoins(PRICE_DEMOLITION)) {
      setToast(t.shop.insufficient);
      return;
    }
    addBoosters("demolition", 1);
    setToast(t.shop.boughtDemolition);
  }, [addBoosters, spendCoins, t.shop]);

  const buySpy = useCallback(() => {
    if (!spendCoins(PRICE_SPY)) {
      setToast(t.shop.insufficient);
      return;
    }
    addBoosters("spy", 1);
    setToast(t.shop.boughtSpy);
  }, [addBoosters, spendCoins, t.shop]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-pp-bg text-pp-text">
      <header className="relative z-40 min-h-0 shrink-0 border-b border-pp-border bg-pp-bg/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="flex items-center justify-center gap-2">
          <ShoppingCart className="size-5 text-amber-300/90" strokeWidth={2.2} aria-hidden />
          <h1 className="text-center font-mono text-lg font-bold tracking-tight text-pp-text">
            {t.nav.shop}
          </h1>
        </div>
        <p className="mt-2 whitespace-nowrap text-center font-mono text-sm text-pp-text-muted">
          {t.shop.coinsLabel}{" "}
          <span className="font-bold tabular-nums text-amber-200">💰 {coins}</span>
        </p>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-4 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <article className="rounded-pp-lg border border-pp-border-strong bg-pp-elevated/90 p-4">
          <h2 className="font-mono text-sm font-bold text-pp-text">{t.shop.packSurvivalTitle}</h2>
          <p className="mt-1 font-mono text-xs text-pp-text-muted">{t.shop.packSurvivalDesc}</p>
          <p className="mt-2 font-mono text-xs text-pp-accent">{PRICE_SURVIVAL} coins</p>
          <button
            type="button"
            onClick={buySurvival}
            className="mt-3 w-full min-h-11 rounded-pp-lg border border-emerald-500/45 bg-emerald-950/40 px-3 font-mono text-xs font-bold uppercase tracking-wide text-emerald-100 transition-colors hover:bg-emerald-900/50"
          >
            {t.shop.buy}
          </button>
        </article>

        <article className="rounded-pp-lg border border-pp-border-strong bg-pp-elevated/90 p-4">
          <h2 className="font-mono text-sm font-bold text-pp-text">{t.shop.demolitionTitle}</h2>
          <p className="mt-1 font-mono text-xs text-pp-text-muted">{t.shop.demolitionDesc}</p>
          <p className="mt-2 font-mono text-xs text-pp-accent">{PRICE_DEMOLITION} coins</p>
          <button
            type="button"
            onClick={buyDemolition}
            className="mt-3 w-full min-h-11 rounded-pp-lg border border-rose-500/45 bg-rose-950/35 px-3 font-mono text-xs font-bold uppercase tracking-wide text-rose-100 transition-colors hover:bg-rose-900/45"
          >
            {t.shop.buy}
          </button>
        </article>

        <article className="rounded-pp-lg border border-pp-border-strong bg-pp-elevated/90 p-4">
          <h2 className="font-mono text-sm font-bold text-pp-text">{t.shop.spyTitle}</h2>
          <p className="mt-1 font-mono text-xs text-pp-text-muted">{t.shop.spyDesc}</p>
          <p className="mt-2 font-mono text-xs text-pp-accent">{PRICE_SPY} coins</p>
          <button
            type="button"
            onClick={buySpy}
            className="mt-3 w-full min-h-11 rounded-pp-lg border border-violet-500/45 bg-violet-950/40 px-3 font-mono text-xs font-bold uppercase tracking-wide text-violet-100 transition-colors hover:bg-violet-900/50"
          >
            {t.shop.buy}
          </button>
        </article>
      </div>

      {toast ? (
        <div
          className="pointer-events-none fixed bottom-24 left-1/2 z-[90] max-w-sm -translate-x-1/2 rounded-pp-lg border border-pp-border-strong bg-pp-surface px-4 py-2 font-mono text-xs text-pp-text shadow-xl"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <BottomNav />
    </div>
  );
}
