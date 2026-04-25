"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { Eye, Hammer, ShoppingCart, Sparkles, Shuffle } from "lucide-react";

import { BlackMarketModal } from "@/src/components/game/BlackMarketModal";
import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
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
      className={`relative flex size-14 shrink-0 items-center justify-center rounded-xl border shadow-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 disabled:cursor-not-allowed disabled:opacity-45 sm:size-[3.75rem] ${
        active
          ? "border-rose-500/80 bg-gradient-to-b from-rose-950/90 to-rose-900/70 shadow-[0_0_18px_rgb(244_63_94/0.45)]"
          : "border-white/10 bg-gradient-to-b from-slate-800/95 to-slate-950/90 hover:border-violet-400/45 hover:from-slate-800"
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
      <span className="absolute -right-1 -top-1 flex min-w-[1.25rem] items-center justify-center rounded-full border border-white/10 bg-slate-950 px-1 py-0.5 font-mono text-[10px] font-bold leading-none tabular-nums text-slate-200 shadow-sm">
        {count}
      </span>
    </motion.button>
  );
}

type BoostersBarProps = {
  onToast?: (message: string) => void;
};

/**
 * Mode compact : un seul FAB « Boosters » qui ouvre la palette à la demande.
 */
export function BoostersBar({ onToast }: BoostersBarProps) {
  const { t } = useAppStrings();
  const [blackMarketOpen, setBlackMarketOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

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

  const totalBoosters = useMemo(() => demolition + spy + lobbying, [demolition, spy, lobbying]);

  return (
    <>
      <aside
        className="pointer-events-none fixed bottom-[max(6.2rem,env(safe-area-inset-bottom)+5rem)] right-3 z-[85] shrink-0"
        aria-label="Mallette CEO — boosters"
      >
        <motion.button
          type="button"
          disabled={!playing}
          whileTap={playing ? { scale: 0.92 } : undefined}
          onClick={() => setPanelOpen(true)}
          className="pointer-events-auto relative inline-flex min-h-12 items-center gap-2 rounded-full border border-violet-400/35 bg-[#15161E] px-3 py-2 font-mono text-xs font-semibold text-violet-100 shadow-[0_8px_26px_rgba(0,0,0,0.45)] transition-colors hover:border-violet-300/55 disabled:opacity-45"
          aria-label="Ouvrir la mallette boosters"
        >
          <Sparkles className="size-4 text-violet-300" strokeWidth={2.2} aria-hidden />
          Boosters
          <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-white/10 bg-slate-950 px-1 py-0.5 font-mono text-[10px] leading-none tabular-nums text-slate-200">
            {totalBoosters}
          </span>
        </motion.button>
      </aside>

      <BottomSheetShell
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        dialogAriaLabel="Mallette boosters"
        panelClassName="max-w-md"
      >
        <div className="px-4 pb-4 pt-2">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">Boosters</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
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
              onClick={() => {
                setPanelOpen(false);
                setBlackMarketOpen(true);
              }}
              className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/80 to-slate-900/90 text-xl shadow-md transition-colors hover:border-emerald-400/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-45 sm:size-[3.75rem]"
              aria-label={t.blackMarket.openAria}
            >
              <ShoppingCart className="size-5 text-emerald-300 sm:size-6" strokeWidth={2.25} aria-hidden />
            </motion.button>
          </div>
        </div>
      </BottomSheetShell>

      <BlackMarketModal
        open={blackMarketOpen}
        onClose={() => setBlackMarketOpen(false)}
        copy={t.blackMarket}
        onToast={toast}
      />
    </>
  );
}
