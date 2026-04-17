"use client";

import { useEffect, useState } from "react";

import {
  LIFE_RECHARGE_MS,
  MAX_LIVES,
  useEconomyStore,
} from "@/src/store/useEconomyStore";

function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * Badges compacts pièces + vies (+ compte à rebours recharge si vies &lt; max).
 */
export function EconomyHeader({ className = "" }: { className?: string }) {
  const coins = useEconomyStore((s) => s.coins);
  const lives = useEconomyStore((s) => s.lives);
  const lastLifeRechargeTime = useEconomyStore((s) => s.lastLifeRechargeTime);
  const checkLifeRecharge = useEconomyStore((s) => s.checkLifeRecharge);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      checkLifeRecharge();
      setTick((n) => n + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [checkLifeRecharge]);

  const showTimer =
    lives < MAX_LIVES && lastLifeRechargeTime != null && Number.isFinite(lastLifeRechargeTime);

  const remainingMs = showTimer
    ? Math.max(0, lastLifeRechargeTime + LIFE_RECHARGE_MS - Date.now())
    : 0;

  const pill =
    "inline-flex max-w-[min(46vw,11rem)] items-center gap-1 rounded-full border border-white/10 bg-slate-950/70 px-2 py-1 font-mono text-[10px] font-semibold tabular-nums text-white shadow-md backdrop-blur-sm sm:max-w-none sm:gap-1.5 sm:px-2.5 sm:text-[11px]";

  return (
    <div className={`flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-1.5 ${className}`.trim()}>
      <span className={pill} title="Ponzi Coins">
        <span className="shrink-0 text-sm leading-none sm:text-base" aria-hidden>
          💰
        </span>
        <span className="min-w-0 truncate text-amber-200">{coins}</span>
      </span>
      <span className={pill} title="Vies">
        <span className="shrink-0 text-sm leading-none sm:text-base" aria-hidden>
          ❤️
        </span>
        <span className="whitespace-nowrap text-rose-100">
          {lives}/{MAX_LIVES}
        </span>
        {showTimer ? (
          <span
            key={tick}
            className="border-l border-white/15 pl-1 font-mono text-[9px] tabular-nums text-slate-300 sm:text-[10px]"
          >
            {formatCountdown(remainingMs)}
          </span>
        ) : null}
      </span>
    </div>
  );
}
