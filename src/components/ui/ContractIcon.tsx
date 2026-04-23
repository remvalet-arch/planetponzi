"use client";

import { useId, type SVGProps } from "react";

export type ContractIconCount = 1 | 2 | 3;

export type ContractIconProps = {
  count: ContractIconCount;
  /** Sceau : cire rubis (défaut) ou or « board ». */
  seal?: "ruby" | "gold";
  size?: "sm" | "md" | "lg";
  muted?: boolean;
  className?: string;
} & Omit<SVGProps<SVGSVGElement>, "children" | "viewBox">;

const sizeClass: Record<NonNullable<ContractIconProps["size"]>, string> = {
  sm: "h-[1.1rem] w-[1.2rem]",
  md: "h-8 w-[2.2rem]",
  lg: "h-11 w-[3.05rem]",
};

const sealFill: Record<NonNullable<ContractIconProps["seal"]>, string> = {
  ruby: "#7f1d1d",
  gold: "#92400e",
};

/**
 * Contrat « premium » : papier ivoire, coin plié, pile 1–3, sceau de cire avec $.
 */
export function ContractIcon({
  count,
  seal = "ruby",
  size = "md",
  muted = false,
  className = "",
  ...rest
}: ContractIconProps) {
  const uid = useId().replace(/:/g, "");
  const filterId = `pp-contract-glow-${uid}`;
  const sealColor = sealFill[seal];
  const c = Math.min(3, Math.max(1, count)) as ContractIconCount;
  const dollarFill = seal === "gold" ? "#fffbeb" : "#fef3c7";

  const Doc = ({
    dx,
    dy,
    showSeal,
    opacity = 1,
  }: {
    dx: number;
    dy: number;
    showSeal: boolean;
    opacity?: number;
  }) => (
    <g transform={`translate(${dx},${dy})`} opacity={opacity}>
      {/* Papier ivoire */}
      <rect
        x="1"
        y="1"
        width="20"
        height="26"
        rx="1.35"
        fill="#faf6ef"
        className="stroke-slate-500/90"
        strokeWidth="0.75"
      />
      {/* Coin plié (rabat haut-droit) */}
      <path
        d="M 17 1 L 21 1 L 21 5.2 L 17 1 Z"
        fill="#e8e0d4"
        className="stroke-slate-500/70"
        strokeWidth="0.35"
        strokeLinejoin="miter"
      />
      <line x1="17" y1="1" x2="21" y2="5.2" className="stroke-slate-400/55" strokeWidth="0.35" />
      {/* Lignes de texte */}
      <line x1="4" y1="8" x2="15" y2="8" className="stroke-stone-400/85" strokeWidth="0.5" strokeLinecap="round" />
      <line x1="4" y1="11" x2="14" y2="11" className="stroke-stone-300/90" strokeWidth="0.42" strokeLinecap="round" />
      <line x1="4" y1="14.5" x2="15.5" y2="14.5" className="stroke-stone-300/90" strokeWidth="0.42" strokeLinecap="round" />
      {showSeal ? (
        <g>
          <circle cx="16.25" cy="20.75" r="4.35" fill={sealColor} opacity={0.95} />
          <circle
            cx="16.25"
            cy="20.75"
            r="3.25"
            className="fill-none stroke-black/25"
            strokeWidth="0.3"
          />
          <text
            x="16.25"
            y="22.35"
            textAnchor="middle"
            fill={dollarFill}
            fontSize="5.2"
            fontWeight="800"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            style={{ letterSpacing: "-0.02em" }}
          >
            $
          </text>
        </g>
      ) : null}
    </g>
  );

  return (
    <svg
      viewBox="0 0 28 34"
      aria-hidden
      className={`shrink-0 ${sizeClass[size]} ${muted ? "opacity-35 grayscale" : "drop-shadow-[0_1px_3px_rgba(15,23,42,0.22)]"} ${className}`.trim()}
      {...rest}
    >
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.35" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        {c === 1 ? <Doc dx={0} dy={0} showSeal opacity={1} /> : null}
        {c === 2 ? (
          <>
            <Doc dx={2.5} dy={2.5} showSeal={false} opacity={0.52} />
            <Doc dx={0} dy={0} showSeal />
          </>
        ) : null}
        {c === 3 ? (
          <>
            <Doc dx={4.5} dy={4} showSeal={false} opacity={0.38} />
            <Doc dx={2} dy={2} showSeal={false} opacity={0.62} />
            <Doc dx={0} dy={0} showSeal />
          </>
        ) : null}
      </g>
    </svg>
  );
}
