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
    <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-pp-text-dim">
      {children}
    </h3>
  );
}

function TileBox({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span
      className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-pp-border-strong bg-pp-elevated px-2 text-lg shadow-inner"
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
    <div className="flex flex-wrap items-center justify-center gap-2 py-2.5 font-mono text-[11px] text-pp-text-muted">
      <div className="flex flex-wrap items-center justify-center gap-1.5">{left}</div>
      <span className="text-pp-text-dim">{op}</span>
      <div className="flex flex-wrap items-center justify-center gap-1.5">{right}</div>
      <span className="text-pp-text-dim">=</span>
      <div className="font-semibold tabular-nums text-pp-accent">{result}</div>
    </div>
  );
}

/** Contenu pédagogique des règles (réutilisé par la modale menu et le flux d’entrée). */
export function RulesSummaryBody() {
  const { t } = useAppStrings();

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <SectionTitle>Partie</SectionTitle>
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-pp-border bg-pp-elevated/60 px-3 py-3 font-mono text-[11px] text-pp-text-muted">
          <span className="rounded border border-pp-border-strong bg-pp-surface px-2 py-1 text-pp-text">
            4×4
          </span>
          <span>ordre fixe</span>
          <span className="text-pp-text-dim">·</span>
          <span>voisins</span>
          <span className="rounded border border-pp-border-strong bg-pp-surface px-2 py-1 text-pp-text">
            ⊥
          </span>
          <span className="text-[10px]">pas diag.</span>
        </div>
      </section>

      <section className="space-y-2 border-t border-pp-border pt-4">
        <SectionTitle>ROI affiché</SectionTitle>
        <FormulaRow
          left={<span className="text-pp-text">Σ cases</span>}
          op="×"
          right={<span className="text-pp-text">mode</span>}
          result={<span className="text-pp-text">arrondi</span>}
        />
        <ul className="divide-y divide-pp-border font-mono text-[11px] text-pp-text-muted">
          {DECK_CHALLENGE_LEVELS.map((lvl) => (
            <li key={lvl} className="flex items-center justify-between gap-3 py-2">
              <span className="text-pp-text">{getDeckChallengeTitle(lvl as DeckChallengeLevel)}</span>
              <span className="shrink-0 tabular-nums text-pp-accent">
                {formatMultiplierFr(lvl as DeckChallengeLevel)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-1 border-t border-pp-border pt-4">
        <SectionTitle>M$ par case</SectionTitle>
        <div className="divide-y divide-pp-border rounded-xl border border-pp-border bg-pp-elevated/40">
          <div className="flex flex-wrap items-center justify-center gap-2 py-2.5 font-mono text-[11px]">
            <TileBox emoji="⬛" label="Mine" />
            <span className="text-pp-text-dim">=</span>
            <span className="font-semibold text-pp-accent">+3 M$</span>
          </div>
          <FormulaRow
            left={<TileBox emoji="🧑‍🚀" label="Habitacle" />}
            op="⊥"
            right={<TileBox emoji="⬛" label="Mine" />}
            result={<span className="text-pp-negative">0 M$</span>}
          />
          <FormulaRow
            left={<TileBox emoji="🌱" label="Serre" />}
            op="+"
            right={
              <span className="flex items-center gap-1">
                <span className="text-pp-text-dim">n ×</span>
                <TileBox emoji="🌱" label="Serre voisine" />
              </span>
            }
            result={<span className="text-pp-text">1 + n M$</span>}
          />
          <FormulaRow
            left={<TileBox emoji="💧" label="Eau" />}
            op="+"
            right={
              <span className="flex items-center gap-1">
                <TileBox emoji="🧑‍🚀" label="Habitacle" />
                <span className="text-pp-text-dim">/</span>
                <TileBox emoji="🌱" label="Serre" />
              </span>
            }
            result={<span className="text-pp-text">+2 M$ / voisin</span>}
          />
        </div>
        <p className="pt-1 text-center font-mono text-[9px] text-pp-text-dim">
          Serre : 1 M$ de base + bonus voisins · Eau : 0 si aucun voisin éligible
        </p>
      </section>

      <section className="space-y-2 border-t border-pp-border pt-4">
        <SectionTitle>{t.rules.megaStructureTitle}</SectionTitle>
        <p className="rounded-xl border border-pp-border bg-pp-elevated/50 px-3 py-3 text-center font-mono text-[11px] leading-relaxed text-pp-text-muted">
          {t.rules.megaStructureBody}
        </p>
      </section>

      <section className="space-y-2 border-t border-pp-border pt-4">
        <SectionTitle>{t.rules.fiscalBossTitle}</SectionTitle>
        <p className="rounded-xl border border-pp-border bg-pp-elevated/50 px-3 py-3 text-center font-mono text-[11px] leading-relaxed text-pp-text-muted">
          {t.rules.fiscalBossBody}
        </p>
      </section>
    </div>
  );
}
