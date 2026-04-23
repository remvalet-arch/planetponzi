"use client";

import type { ReactNode } from "react";

import {
  formatMultiplierFr,
  getDeckChallengeTitle,
} from "@/src/lib/difficulty";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { DECK_CHALLENGE_LEVELS, type DeckChallengeLevel } from "@/src/types/game";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
      {children}
    </h3>
  );
}

function TileBox({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span
      className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-600/70 bg-slate-900/80 px-2 text-lg shadow-inner"
      title={label}
    >
      <span aria-hidden>{emoji}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

function FormulaRow({
  left,
  op = "+",
  right,
  result,
}: {
  left: ReactNode;
  op?: string;
  right: ReactNode;
  result: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-2.5 font-mono text-[11px] text-slate-400">
      <div className="flex flex-wrap items-center justify-center gap-1.5">{left}</div>
      <span className="text-slate-600">{op}</span>
      <div className="flex flex-wrap items-center justify-center gap-1.5">{right}</div>
      <span className="text-slate-600">=</span>
      <div className="font-semibold tabular-nums text-cyan-300">{result}</div>
    </div>
  );
}

/** Contenu pédagogique des règles (réutilisé par la modale menu et le flux d’entrée). */
export function RulesSummaryBody() {
  const { t } = useAppStrings();

  return (
    <div className="space-y-5 text-slate-100">
      <section className="space-y-2">
        <SectionTitle>Partie</SectionTitle>
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/55 px-3 py-3 font-mono text-[11px] text-slate-400">
          <span className="rounded border border-slate-600/80 bg-slate-950 px-2 py-1 text-slate-100">
            4×4
          </span>
          <span>ordre fixe</span>
          <span className="text-slate-600">·</span>
          <span>voisins</span>
          <span className="rounded border border-slate-600/80 bg-slate-950 px-2 py-1 text-slate-100">
            ⊥
          </span>
          <span className="text-[10px]">pas diag.</span>
        </div>
      </section>

      <section className="space-y-2 border-t border-slate-700/50 pt-4">
        <SectionTitle>ROI affiché</SectionTitle>
        <FormulaRow
          left={<span className="text-slate-100">Σ cases</span>}
          op="×"
          right={<span className="text-slate-100">mode</span>}
          result={<span className="text-slate-100">arrondi</span>}
        />
        <ul className="divide-y divide-slate-700/50 font-mono text-[11px] text-slate-400">
          {DECK_CHALLENGE_LEVELS.map((lvl) => (
            <li key={lvl} className="flex items-center justify-between gap-3 py-2">
              <span className="text-slate-100">{getDeckChallengeTitle(lvl as DeckChallengeLevel)}</span>
              <span className="shrink-0 tabular-nums text-cyan-300">
                {formatMultiplierFr(lvl as DeckChallengeLevel)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-1 border-t border-slate-700/50 pt-4">
        <SectionTitle>M$ par case</SectionTitle>
        <div className="divide-y divide-slate-700/50 rounded-xl border border-slate-700/60 bg-slate-900/45">
          <div className="flex flex-wrap items-center justify-center gap-2 py-2.5 font-mono text-[11px]">
            <TileBox emoji="⬛" label="Mine" />
            <span className="text-slate-600">=</span>
            <span className="font-semibold text-cyan-300">+3 M$</span>
          </div>
          <FormulaRow
            left={<TileBox emoji="🧑‍🚀" label="Habitacle" />}
            op="⊥"
            right={<TileBox emoji="⬛" label="Mine" />}
            result={<span className="text-rose-400">0 M$</span>}
          />
          <FormulaRow
            left={<TileBox emoji="🌱" label="Serre" />}
            op="+"
            right={
              <span className="flex items-center gap-1">
                <span className="text-slate-600">n ×</span>
                <TileBox emoji="🌱" label="Serre voisine" />
              </span>
            }
            result={<span className="text-slate-100">1 + n M$</span>}
          />
          <FormulaRow
            left={<TileBox emoji="💧" label="Eau" />}
            op="+"
            right={
              <span className="flex items-center gap-1">
                <TileBox emoji="🧑‍🚀" label="Habitacle" />
                <span className="text-slate-600">/</span>
                <TileBox emoji="🌱" label="Serre" />
              </span>
            }
            result={<span className="text-slate-100">+2 M$ / voisin</span>}
          />
        </div>
        <p className="pt-1 text-center font-mono text-[9px] text-slate-500">
          Serre : 1 M$ de base + bonus voisins · Eau : 0 si aucun voisin éligible
        </p>
      </section>

      <section className="space-y-2 border-t border-slate-700/50 pt-4">
        <SectionTitle>{t.rules.megaStructureTitle}</SectionTitle>
        <p className="rounded-xl border border-slate-700/60 bg-slate-900/50 px-3 py-3 text-center font-mono text-[11px] leading-relaxed text-slate-400">
          {t.rules.megaStructureBody}
        </p>
      </section>

      <section className="space-y-2 border-t border-slate-700/50 pt-4">
        <SectionTitle>{t.rules.fiscalBossTitle}</SectionTitle>
        <p className="rounded-xl border border-slate-700/60 bg-slate-900/50 px-3 py-3 text-center font-mono text-[11px] leading-relaxed text-slate-400">
          {t.rules.fiscalBossBody}
        </p>
      </section>
    </div>
  );
}
