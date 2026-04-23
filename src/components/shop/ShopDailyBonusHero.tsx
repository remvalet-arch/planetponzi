"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { getLocalDateSeed } from "@/src/lib/rng";
import { useEconomyStore } from "@/src/store/useEconomyStore";

export function ShopDailyBonusHero() {
  const { t } = useAppStrings();
  const lastBonusDate = useEconomyStore((s) => s.lastBonusDate);
  const claimDailyBonus = useEconomyStore((s) => s.claimDailyBonus);

  const today = getLocalDateSeed();
  const bonusAvailable = lastBonusDate !== today;

  const handleClaim = useCallback(() => {
    claimDailyBonus();
  }, [claimDailyBonus]);

  if (bonusAvailable) {
    return (
      <section className="relative overflow-hidden rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-br from-slate-950 via-indigo-950/95 to-slate-950 p-5 shadow-[0_0_28px_rgb(34_211_238/0.35)]">
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/15 to-cyan-500/20"
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 shrink-0 text-cyan-300" strokeWidth={2} aria-hidden />
            <p className="pp-kicker text-cyan-300/90">{t.dailyBonus.kicker}</p>
          </div>
          <h2 className="mt-2 font-mono text-lg font-bold text-slate-100">{t.dailyBonus.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{t.dailyBonus.body}</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={handleClaim}
            className="mt-5 flex w-full min-h-12 items-center justify-center rounded-pp-xl border border-cyan-400/40 bg-gradient-to-r from-violet-600/90 via-fuchsia-600/85 to-cyan-600/90 px-4 font-mono text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_28px_rgb(34_211_238/0.28)] transition-[filter] hover:brightness-110"
          >
            {t.dailyBonus.cta}
          </motion.button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-900/55 p-5 opacity-90">
      <div className="flex items-center gap-2 opacity-80">
        <Sparkles className="size-5 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          {t.dailyBonus.kicker}
        </p>
      </div>
      <h2 className="mt-2 font-mono text-base font-bold text-slate-400">{t.dailyBonus.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{t.dailyBonus.allocationClaimed}</p>
    </section>
  );
}
