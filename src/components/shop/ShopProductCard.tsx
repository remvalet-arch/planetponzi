"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export type ShopProductAccent = "emerald" | "rose" | "violet";

const accentMap: Record<
  ShopProductAccent,
  { card: string; button: string; iconWrap: string }
> = {
  emerald: {
    card: "border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 via-slate-900/95 to-slate-950/90 shadow-[inset_0_1px_0_rgba(52,211,153,0.12)]",
    button:
      "border-emerald-500/50 bg-gradient-to-b from-emerald-600/90 to-emerald-900/95 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    iconWrap: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  },
  rose: {
    card: "border-rose-500/40 bg-gradient-to-br from-rose-950/45 via-slate-900/95 to-slate-950/90 shadow-[inset_0_1px_0_rgba(251,113,133,0.1)]",
    button:
      "border-rose-500/50 bg-gradient-to-b from-rose-600/90 to-rose-950/95 shadow-[0_0_20px_rgba(244,63,94,0.18)]",
    iconWrap: "border-rose-400/30 bg-rose-500/15 text-rose-200",
  },
  violet: {
    card: "border-violet-500/40 bg-gradient-to-br from-violet-950/50 via-slate-900/95 to-slate-950/90 shadow-[inset_0_1px_0_rgba(167,139,250,0.12)]",
    button:
      "border-violet-500/50 bg-gradient-to-b from-violet-600/90 to-violet-950/95 shadow-[0_0_20px_rgba(139,92,246,0.2)]",
    iconWrap: "border-violet-400/30 bg-violet-500/15 text-violet-200",
  },
};

const comingSoonCard =
  "border border-dashed border-slate-500/45 bg-gradient-to-br from-slate-900/60 via-slate-950/90 to-black/40 opacity-95 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]";

const comingSoonIconWrap =
  "border border-slate-500/35 bg-slate-800/50 text-slate-300 grayscale-[0.35]";

const comingSoonButton =
  "cursor-not-allowed border-slate-600/60 bg-slate-800/90 text-slate-400 opacity-95";

export type ShopProductCardProps = {
  title: string;
  description: string;
  price: number;
  /** Ligne prix i18n (ex. t.shop.priceCoins(price)). */
  priceLabel?: string;
  icon: ReactNode;
  buyLabel: string;
  onBuy: () => void;
  disabled: boolean;
  accent: ShopProductAccent;
  /** Teaser : bouton « Bientôt », carte atténuée, pas d’achat. */
  isComingSoon?: boolean;
  /** Masque la ligne prix (cosmétiques / teasing). */
  omitPrice?: boolean;
  /** Libellé bouton teaser (ex. t.shop.comingSoon). */
  soonLabel?: string;
  /** Si `soonLabel` absent en teaser (ex. t.shop.comingSoonEllipsis). */
  soonEllipsis?: string;
};

export function ShopProductCard({
  title,
  description,
  price,
  priceLabel,
  icon,
  buyLabel,
  onBuy,
  disabled,
  accent,
  isComingSoon = false,
  omitPrice = false,
  soonLabel,
  soonEllipsis,
}: ShopProductCardProps) {
  const a = accentMap[accent];
  const cardClass = isComingSoon ? comingSoonCard : a.card;
  const iconClass = isComingSoon ? comingSoonIconWrap : a.iconWrap;
  const dimmed = !isComingSoon && disabled;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-sm transition-opacity duration-200 ${cardClass} ${
        dimmed ? "opacity-55" : ""
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl ${iconClass}`}
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-mono text-sm font-bold tracking-tight text-slate-100">{title}</h2>
          <p className="mt-1 font-mono text-xs leading-relaxed text-slate-400">{description}</p>
          {!omitPrice ? (
            <p className="mt-2 font-mono text-xs font-semibold text-amber-400">
              {priceLabel ?? String(price)}
            </p>
          ) : null}
        </div>
      </div>
      <motion.button
        type="button"
        whileTap={isComingSoon || disabled ? undefined : { scale: 0.98 }}
        onClick={isComingSoon ? undefined : onBuy}
        disabled={isComingSoon || disabled}
        className={
          isComingSoon
            ? `mt-4 flex w-full min-h-11 items-center justify-center rounded-pp-lg border px-3 font-mono text-xs font-bold uppercase tracking-wide ${comingSoonButton}`
            : `mt-4 flex w-full min-h-11 items-center justify-center rounded-pp-lg border px-3 font-mono text-xs uppercase transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 ${a.button}`
        }
      >
        <span
          className={`font-bold tracking-wide ${
            isComingSoon ? "text-slate-300" : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
          }`}
        >
          {isComingSoon ? (soonLabel ?? soonEllipsis ?? "…") : buyLabel}
        </span>
      </motion.button>
    </article>
  );
}
