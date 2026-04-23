"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  computePassiveModifiers,
  EMPIRE_BASE_MAX_LIVES,
} from "@/src/lib/empire-tower";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useEmpireStore } from "@/src/store/useEmpireStore";

function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * Badges compacts pièces + vies (+ compte à rebours recharge si vies &lt; max).
 */
export function EconomyHeader({
  className = "",
  showLives = true,
}: {
  className?: string;
  /** Affiche le badge vies + timer (ex. masqué sur la Tour). */
  showLives?: boolean;
}) {
  const coins = useEconomyStore((s) => s.coins);
  const lives = useEconomyStore((s) => s.lives);
  const lastLifeRechargeTime = useEconomyStore((s) => s.lastLifeRechargeTime);
  const checkLifeRecharge = useEconomyStore((s) => s.checkLifeRecharge);
  const empireUnlocked = useEmpireStore((s) => s.unlockedNodes);

  const [tick, setTick] = useState(0);
  const [nowMs, setNowMs] = useState<number | undefined>(undefined);

  const { maxLives, rechargeMs } = useMemo(() => {
    const m = computePassiveModifiers(empireUnlocked);
    return {
      maxLives: EMPIRE_BASE_MAX_LIVES + m.livesMaxBonus,
      rechargeMs: m.lifeRechargeIntervalMs,
    };
  }, [empireUnlocked]);

  useEffect(() => {
    const pulse = () => {
      setNowMs(Date.now());
      checkLifeRecharge();
      setTick((n) => n + 1);
    };
    queueMicrotask(pulse);
    const id = window.setInterval(pulse, 1000);
    return () => window.clearInterval(id);
  }, [checkLifeRecharge]);

  const showTimer =
    lives < maxLives && lastLifeRechargeTime != null && Number.isFinite(lastLifeRechargeTime);

  const remainingMs =
    showTimer && typeof nowMs === "number"
      ? Math.max(0, lastLifeRechargeTime + rechargeMs - nowMs)
      : 0;

  const pill =
    "inline-flex max-w-[min(46vw,11rem)] items-center gap-1 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/70 px-2 py-1 font-mono text-[10px] font-semibold tabular-nums text-white shadow-md backdrop-blur-sm sm:max-w-none sm:gap-1.5 sm:px-2.5 sm:text-[11px]";

  return (
    <div className={`flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-1.5 ${className}`.trim()}>
      <span className={pill} title="Ponzi Coins">
        <span className="shrink-0 text-sm leading-none sm:text-base" aria-hidden>
          💰
        </span>
        <motion.span
          key={coins}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0 truncate whitespace-nowrap text-amber-200 tabular-nums"
        >
          {coins}
        </motion.span>
      </span>
      {showLives ? (
        <span className={pill} title="Vies">
          <span className="shrink-0 text-sm leading-none sm:text-base" aria-hidden>
            ❤️
          </span>
          <span className="whitespace-nowrap text-rose-100">
            {lives}/{maxLives}
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
      ) : null}
    </div>
  );
}
