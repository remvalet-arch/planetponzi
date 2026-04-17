"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Eye, Hammer, Shuffle } from "lucide-react";

import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import { useProgressStore } from "@/src/store/useProgressStore";

type BoosterRowProps = {
  title: string;
  subtitle: string;
  count: number;
  disabled: boolean;
  active?: boolean;
  icon: ReactNode;
  onClick: () => void;
  ariaLabel: string;
};

function BoosterRow({
  title,
  subtitle,
  count,
  disabled,
  active,
  icon,
  onClick,
  ariaLabel,
}: BoosterRowProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      className={`relative flex w-full items-center gap-2 rounded-pp-md border px-2.5 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 disabled:cursor-not-allowed disabled:opacity-45 ${
        active
          ? "border-rose-500/70 bg-rose-950/50 shadow-[0_0_16px_rgb(244_63_94/0.35)]"
          : "border-pp-border bg-pp-elevated/80 hover:border-violet-400/35 hover:bg-pp-surface"
      }`}
      aria-pressed={active}
      aria-label={ariaLabel}
    >
      {active ? (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-pp-md bg-rose-500/10"
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          aria-hidden
        />
      ) : null}
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-md border border-pp-border-strong bg-pp-surface text-lg">
        {icon}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block font-mono text-[11px] font-semibold text-pp-text">{title}</span>
        <span className="mt-0.5 block font-mono text-[9px] text-pp-text-muted">{subtitle}</span>
      </span>
      <span className="relative flex min-w-[1.5rem] items-center justify-center rounded-full border border-pp-border-strong bg-pp-bg px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-pp-text">
        {count}
      </span>
    </motion.button>
  );
}

/** Mallette CEO : démolition, espion, lobbying. */
export function BoostersBar() {
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

  return (
    <aside
      className="flex w-full max-h-[min(30dvh,12rem)] shrink-0 flex-col overflow-y-auto overscroll-contain rounded-pp-lg border border-pp-border-strong bg-pp-surface/90 px-3 py-2.5 shadow-lg backdrop-blur-sm sm:max-h-[min(52vh,22rem)] sm:max-w-[11rem]"
      aria-label="Mallette CEO — boosters"
    >
      <p className="mb-2 shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-pp-text-dim">
        Mallette CEO
      </p>
      <div className="flex min-h-0 flex-col gap-2">
        <BoosterRow
          title="Démolition"
          subtitle="Vider une case"
          count={demolition}
          disabled={demolitionDisabled}
          active={demolitionActive}
          icon={<Hammer className="size-4 text-rose-300" strokeWidth={2.25} aria-hidden />}
          onClick={() => toggleBooster("demolition")}
          ariaLabel={
            demolitionActive
              ? "Désactiver le mode démolition"
              : `Démolition, ${demolition} restant${demolition > 1 ? "s" : ""}`
          }
        />
        <BoosterRow
          title="Espion"
          subtitle="4 prochains · 3 tours"
          count={spy}
          disabled={!playing || spy <= 0}
          icon={<Eye className="size-4 text-violet-300" strokeWidth={2.25} aria-hidden />}
          onClick={() => activateSpyBooster()}
          ariaLabel={`Espion industriel, ${spy} restant${spy > 1 ? "s" : ""}`}
        />
        <BoosterRow
          title="Lobbying"
          subtitle="Échange le mandat"
          count={lobbying}
          disabled={!playing || lobbying <= 0}
          icon={<Shuffle className="size-4 text-amber-300" strokeWidth={2.25} aria-hidden />}
          onClick={() => activateLobbyingBooster()}
          ariaLabel={`Lobbying, ${lobbying} restant${lobbying > 1 ? "s" : ""}`}
        />
      </div>
    </aside>
  );
}
