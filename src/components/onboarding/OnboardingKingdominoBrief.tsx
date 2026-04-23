"use client";

import {
  formatMultiplierFr,
  getDeckChallengeTitle,
} from "@/src/lib/difficulty";
import { DECK_CHALLENGE_LEVELS, type DeckChallengeLevel } from "@/src/types/game";

function SectionLabel({ id, children }: { id?: string; children: string }) {
  return (
    <p
      id={id}
      className="font-mono text-[9px] font-semibold uppercase tracking-[0.32em]"
      style={{ color: "var(--pp-text-dim)" }}
    >
      {children}
    </p>
  );
}

const ASSETS: { icon: string; name: string; short: string; detail: string }[] = [
  {
    icon: "⛏️",
    name: "Mine",
    short: "+3 M$",
    detail:
      "Cash pur. La pollution annule le score des Habitacles sur les cases voisines.",
  },
  {
    icon: "🏢",
    name: "Habitacle",
    short: "+2 M$",
    detail: "Stable. 0 M$ si une Mine est sur une case adjacente (haut / bas / gauche / droite).",
  },
  {
    icon: "🌱",
    name: "Serre",
    short: "+1 M$",
    detail: "+1 M$ bonus par autre Serre sur une case collée (pas en diagonale).",
  },
  {
    icon: "💧",
    name: "Eau",
    short: "0 M$",
    detail: "+2 M$ par Habitacle ou Serre sur une case voisine directe. Seule : 0 M$.",
  },
];

export function OnboardingKingdominoBrief() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <header className="shrink-0">
        <p className="pp-kicker">Briefing</p>
        <h1
          id="entry-flow-title"
          className="mt-1.5 font-mono text-lg font-bold leading-tight tracking-tight text-pp-text sm:text-xl"
        >
          Onboarding & règles
        </h1>
      </header>

      <section className="space-y-2" aria-labelledby="entry-objectif">
        <SectionLabel id="entry-objectif">L&apos;objectif</SectionLabel>
        <p
          className="font-mono text-xs leading-snug sm:text-[13px] sm:leading-snug"
          style={{ color: "var(--pp-text-muted)" }}
        >
          Bâtissez l&apos;empire le plus rentable de la galaxie sur une grille 4×4. 16 tours. Un seul
          objectif : le <span style={{ color: "var(--pp-text)" }}>ROI</span> (retour sur
          investissement).
        </p>
      </section>

      <section className="space-y-2" aria-labelledby="entry-actifs">
        <SectionLabel id="entry-actifs">Les actifs</SectionLabel>
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {ASSETS.map((a) => (
            <div
              key={a.name}
              className="flex min-h-0 gap-2 rounded-pp-lg border p-2 sm:p-2.5"
              style={{
                borderColor: "var(--pp-border-strong)",
                backgroundColor: "color-mix(in srgb, var(--pp-elevated) 55%, transparent)",
                boxShadow: "var(--pp-shadow-panel)",
              }}
            >
              <span className="shrink-0 text-base leading-none sm:text-lg" aria-hidden>
                {a.icon}
              </span>
              <div className="min-w-0 font-mono text-[10px] leading-snug sm:text-[11px]">
                <p className="font-semibold uppercase tracking-wide" style={{ color: "var(--pp-text)" }}>
                  {a.name}{" "}
                  <span style={{ color: "var(--pp-accent)" }}>({a.short})</span>
                </p>
                <p className="mt-0.5" style={{ color: "var(--pp-text-muted)" }}>
                  {a.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="space-y-2 rounded-pp-lg border p-2.5 sm:p-3"
        style={{
          borderColor: "var(--pp-border)",
          backgroundColor: "color-mix(in srgb, var(--pp-accent-glow) 35%, var(--pp-surface))",
        }}
        aria-labelledby="entry-difficulte"
      >
        <SectionLabel id="entry-difficulte">Difficulté & bonus ROI</SectionLabel>
        <p
          className="font-mono text-[10px] leading-snug sm:text-[11px]"
          style={{ color: "var(--pp-text-muted)" }}
        >
          Plus le manifeste est masqué, plus le coefficient multiplie votre ROI affiché en fin de
          grille (arrondi à l&apos;unité).
        </p>
        <ul className="grid grid-cols-1 gap-1 font-mono text-[10px] min-[400px]:grid-cols-2 sm:text-[11px]">
          {DECK_CHALLENGE_LEVELS.map((lvl) => (
            <li
              key={lvl}
              className="flex items-baseline justify-between gap-2 rounded-pp-md px-1.5 py-1"
              style={{ backgroundColor: "color-mix(in srgb, var(--pp-bg) 65%, transparent)" }}
            >
              <span className="min-w-0 truncate" style={{ color: "var(--pp-text)" }}>
                {getDeckChallengeTitle(lvl as DeckChallengeLevel)}
              </span>
              <span className="shrink-0 tabular-nums font-semibold text-pp-accent">
                {formatMultiplierFr(lvl as DeckChallengeLevel)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-1.5" aria-labelledby="entry-conseil">
        <SectionLabel id="entry-conseil">Le conseil du board</SectionLabel>
        <p
          className="font-mono text-xs italic leading-snug sm:text-[13px]"
          style={{ color: "var(--pp-text-muted)" }}
        >
          « Regroupez vos Serres. Isolez vos Mines. Arrosez vos colons. »
        </p>
      </section>
    </div>
  );
}
