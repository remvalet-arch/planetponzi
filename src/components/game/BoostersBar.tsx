"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Hammer, ShoppingCart, Shuffle } from "lucide-react";

import { BlackMarketModal } from "@/src/components/game/BlackMarketModal";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import { useProgressStore } from "@/src/store/useProgressStore";

type BoosterChipProps = {
  count: number;
  disabled: boolean;
  active?: boolean;
  icon: ReactNode;
  onClick: () => void;
  ariaLabel: string;
};

function BoosterChip({ count, disabled, active, icon, onClick, ariaLabel }: BoosterChipProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={!disabled ? { scale: 0.92 } : undefined}
      className={`relative flex size-14 shrink-0 items-center justify-center rounded-xl border-2 shadow-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 disabled:cursor-not-allowed disabled:opacity-45 sm:size-[3.75rem] ${
        active
          ? "border-rose-500/80 bg-gradient-to-b from-rose-950/90 to-rose-900/70 shadow-[0_0_18px_rgb(244_63_94/0.45)]"
          : "border-slate-600/70 bg-gradient-to-b from-slate-800/95 to-slate-950/90 hover:border-violet-400/45 hover:from-slate-800"
      }`}
      aria-pressed={active}
      aria-label={ariaLabel}
    >
      {active ? (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-xl bg-rose-500/15"
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          aria-hidden
        />
      ) : null}
      <span className="relative text-xl sm:text-2xl" aria-hidden>
        {icon}
      </span>
      <span className="absolute -right-1 -top-1 flex min-w-[1.25rem] items-center justify-center rounded-full border border-slate-600/80 bg-slate-950 px-1 py-0.5 font-mono text-[10px] font-bold leading-none tabular-nums text-slate-200 shadow-sm">
        {count}
      </span>
    </motion.button>
  );
}

type BoostersBarProps = {
  onToast?: (message: string) => void;
};

/** Boosters compacts : une rangée d’icônes + pastille quantité (mobile-first). */
export function BoostersBar({ onToast }: BoostersBarProps) {
  const { t } = useAppStrings();
  const [blackMarketOpen, setBlackMarketOpen] = useState(false);

  const demolition = useProgressStore((s) => s.boosters.demolition);
  const spy = useProgressStore((s) => s.boosters.spy);
  const lobbying = useProgressStore((s) => s.boosters.lobbying);

  const activeBooster = useLevelRunStore((s) => s.activeBooster);
  const status = useLevelRunStore((s) => s.status);
  const toggleBooster = useLevelRunStore((s) => s.toggleBooster);
  const activateSpyBooster = useLevelRunStore((s) => s.activateSpyBooster);
  const activateLobbyingBooster = useLevelRunStore((s) => s.activateLobbyingBooster);

  const playing = status === "playing";
  const demolitionActive = activeBooster === "demolition";
  const demolitionDisabled = !playing || (!demolitionActive && demolition <= 0);

  const toast = onToast ?? (() => {});

  return (
    <aside
      className="relative flex w-full shrink-0 flex-row flex-wrap items-center justify-center gap-4 rounded-pp-lg border border-slate-700/60 bg-slate-900/75 px-2 py-2 shadow-lg shadow-black/25 backdrop-blur-sm md:max-w-none"
      aria-label="Mallette CEO — boosters"
    >
      <BoosterChip
        count={demolition}
        disabled={demolitionDisabled}
        active={demolitionActive}
        icon={<Hammer className="size-5 text-rose-300 sm:size-6" strokeWidth={2.25} aria-hidden />}
        onClick={() => toggleBooster("demolition")}
        ariaLabel={
          demolitionActive
            ? "Désactiver le mode démolition"
            : `Démolition, ${demolition} restant${demolition > 1 ? "s" : ""}`
        }
      />
      <BoosterChip
        count={spy}
        disabled={!playing || spy <= 0}
        icon={<Eye className="size-5 text-violet-300 sm:size-6" strokeWidth={2.25} aria-hidden />}
        onClick={() => activateSpyBooster()}
        ariaLabel={`Espion industriel, ${spy} restant${spy > 1 ? "s" : ""}`}
      />
      <BoosterChip
        count={lobbying}
        disabled={!playing || lobbying <= 0}
        icon={<Shuffle className="size-5 text-amber-300 sm:size-6" strokeWidth={2.25} aria-hidden />}
        onClick={() => activateLobbyingBooster()}
        ariaLabel={`Lobbying, ${lobbying} restant${lobbying > 1 ? "s" : ""}`}
      />
      <motion.button
        type="button"
        disabled={!playing}
        whileTap={playing ? { scale: 0.92 } : undefined}
        onClick={() => setBlackMarketOpen(true)}
        className="flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/80 to-slate-900/90 text-xl shadow-md transition-colors hover:border-emerald-400/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-45 sm:size-[3.75rem]"
        aria-label={t.blackMarket.openAria}
      >
        <ShoppingCart className="size-5 text-emerald-300 sm:size-6" strokeWidth={2.25} aria-hidden />
      </motion.button>
      <BlackMarketModal
        open={blackMarketOpen}
        onClose={() => setBlackMarketOpen(false)}
        copy={t.blackMarket}
        onToast={toast}
      />
    </aside>
  );
}
