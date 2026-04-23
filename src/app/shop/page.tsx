"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Heart, Pickaxe, ScanSearch } from "lucide-react";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { ContractIcon } from "@/src/components/ui/ContractIcon";
import { HubShellBar } from "@/src/components/layout/HubShellBar";
import { ShopDailyBonusHero } from "@/src/components/shop/ShopDailyBonusHero";
import { ShopProductCard, type ShopProductAccent } from "@/src/components/shop/ShopProductCard";
import { heavyCash } from "@/src/lib/haptics";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useProgressStore } from "@/src/store/useProgressStore";

const PRICE_SURVIVAL = 100;
const PRICE_DEMOLITION = 50;
const PRICE_SPY = 30;

const noop = () => {};

type BoosterRow = {
  id: "survival" | "demolition" | "spy";
  accent: ShopProductAccent;
  icon: ReactNode;
};

function ShopRayonTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <h2 className="max-w-[min(100%,15rem)] shrink-0 font-mono text-[11px] font-bold uppercase leading-snug tracking-[0.2em] text-cyan-200/95 sm:max-w-none sm:text-xs">
        {children}
      </h2>
      <div
        className="h-px min-w-[2rem] flex-1 bg-gradient-to-r from-cyan-400/60 via-violet-500/50 to-transparent"
        aria-hidden
      />
    </div>
  );
}

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
    heavyCash();
    setToast(t.shop.boughtSurvival);
  }, [refillLives, spendCoins, t.shop]);

  const buyDemolition = useCallback(() => {
    if (!spendCoins(PRICE_DEMOLITION)) {
      setToast(t.shop.insufficient);
      return;
    }
    addBoosters("demolition", 1);
    heavyCash();
    setToast(t.shop.boughtDemolition);
  }, [addBoosters, spendCoins, t.shop]);

  const buySpy = useCallback(() => {
    if (!spendCoins(PRICE_SPY)) {
      setToast(t.shop.insufficient);
      return;
    }
    addBoosters("spy", 1);
    heavyCash();
    setToast(t.shop.boughtSpy);
  }, [addBoosters, spendCoins, t.shop]);

  const boosterRows = useMemo<BoosterRow[]>(
    () => [
      {
        id: "demolition",
        accent: "rose",
        icon: <Pickaxe className="size-6" strokeWidth={2} aria-hidden />,
      },
      {
        id: "spy",
        accent: "violet",
        icon: <ScanSearch className="size-6" strokeWidth={2} aria-hidden />,
      },
      {
        id: "survival",
        accent: "emerald",
        icon: <Heart className="size-6" strokeWidth={2} aria-hidden />,
      },
    ],
    [],
  );

  const productMeta = useMemo(
    () => ({
      survival: {
        title: t.shop.packSurvivalTitle,
        description: t.shop.packSurvivalDesc,
        price: PRICE_SURVIVAL,
        onBuy: buySurvival,
      },
      demolition: {
        title: t.shop.demolitionTitle,
        description: t.shop.demolitionDesc,
        price: PRICE_DEMOLITION,
        onBuy: buyDemolition,
      },
      spy: {
        title: t.shop.spyTitle,
        description: t.shop.spyDesc,
        price: PRICE_SPY,
        onBuy: buySpy,
      },
    }),
    [t.shop, buySurvival, buyDemolition, buySpy],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0B0F19] text-slate-100">
      <HubShellBar title={t.nav.shop} variant="dark" />

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-y-contain px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4">
        <header className="rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900/95 to-slate-950/90 px-4 py-5 text-center shadow-[inset_0_1px_0_rgba(251,191,36,0.06)] shadow-black/30">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">{t.shop.coinsLabel}</p>
          <p className="mt-1 flex items-center justify-center gap-2 text-4xl font-black tabular-nums text-amber-400">
            <span aria-hidden>💰</span>
            <motion.span
              key={coins}
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              {coins}
            </motion.span>
          </p>
        </header>

        <ShopDailyBonusHero />

        <section className="space-y-4">
          <ShopRayonTitle>{t.shop.sectionBlackMarket}</ShopRayonTitle>
          <div className="space-y-4">
            {boosterRows.map((p) => {
              const meta = productMeta[p.id];
              return (
                <ShopProductCard
                  key={p.id}
                  title={meta.title}
                  description={meta.description}
                  price={meta.price}
                  priceLabel={t.shop.priceCoins(meta.price)}
                  icon={p.icon}
                  buyLabel={t.shop.ctaAcquire}
                  onBuy={meta.onBuy}
                  disabled={coins < meta.price}
                  accent={p.accent}
                />
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <ShopRayonTitle>{t.shop.sectionPrestige}</ShopRayonTitle>
          <div className="space-y-4">
            <ShopProductCard
              title={t.shop.teaserCeoTitle}
              description={t.shop.teaserCeoDesc}
              price={0}
              icon={<span className="text-2xl leading-none">👔</span>}
              buyLabel={t.shop.buy}
              onBuy={noop}
              disabled={false}
              accent="violet"
              isComingSoon
              omitPrice
              soonLabel={t.shop.comingSoon}
              soonEllipsis={t.shop.comingSoonEllipsis}
            />
            <ShopProductCard
              title={t.shop.teaserThemeTitle}
              description={t.shop.teaserThemeDesc}
              price={0}
              icon={<span className="text-2xl leading-none">🎨</span>}
              buyLabel={t.shop.buy}
              onBuy={noop}
              disabled={false}
              accent="emerald"
              isComingSoon
              omitPrice
              soonLabel={t.shop.comingSoon}
              soonEllipsis={t.shop.comingSoonEllipsis}
            />
          </div>
        </section>

        <section className="space-y-4 pb-2">
          <ShopRayonTitle>{t.shop.sectionFunds}</ShopRayonTitle>
          <div className="space-y-4">
            <ShopProductCard
              title={t.shop.teaserBriefcaseTitle}
              description={t.shop.teaserBriefcaseDesc}
              price={0}
              icon={<ContractIcon count={1} size="lg" seal="gold" className="opacity-95" />}
              buyLabel={t.shop.buy}
              onBuy={noop}
              disabled={false}
              accent="emerald"
              isComingSoon
              omitPrice
              soonLabel={t.shop.comingSoon}
              soonEllipsis={t.shop.comingSoonEllipsis}
            />
          </div>
        </section>
      </div>

      {toast ? (
        <div
          className="pointer-events-none fixed bottom-24 left-1/2 z-[90] max-w-sm -translate-x-1/2 rounded-pp-lg border border-slate-600/70 bg-slate-900/95 px-4 py-2 font-mono text-xs text-slate-100 shadow-xl shadow-black/40"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <BottomNav variant="dark" />
    </div>
  );
}
