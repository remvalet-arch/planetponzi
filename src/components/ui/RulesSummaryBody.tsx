"use client";

import type { ReactNode } from "react";

import {
  formatMultiplierFr,
  getDeckChallengeTitle,
} from "@/src/lib/difficulty";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { RulesVisualFiscalStamp } from "@/src/components/ui/RulesVisualFiscalStamp";
import { RulesVisualFusion } from "@/src/components/ui/RulesVisualFusion";
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

function DirectiveCard({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-600/50 bg-slate-900/40 p-3 shadow-inner sm:p-4">
      <h3 className="border-b border-slate-600/40 pb-2 font-mono text-[11px] font-bold uppercase tracking-wide text-amber-200/95 sm:text-xs">
        {label}
      </h3>
      {children}
    </section>
  );
}

/** Manuel d’induction + grilles (modale menu, flux d’entrée). */
export function RulesSummaryBody() {
  const { t } = useAppStrings();
  const r = t.rules;

  return (
    <div className="space-y-5 text-slate-100">
      <header className="space-y-1 border-b border-slate-700/50 pb-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-300/90">
          {r.inductionKicker}
        </p>
        <h2 className="font-mono text-sm font-bold tracking-tight text-white sm:text-base">{r.inductionTitle}</h2>
      </header>

      <DirectiveCard label={r.directive1Label}>
        <RulesVisualFusion />
        <p className="text-center font-mono text-[11px] leading-relaxed text-slate-400">{r.directive1Body}</p>
        <p className="text-center font-mono text-[10px] leading-relaxed text-slate-500">{r.megaStructureBody}</p>
      </DirectiveCard>

      <DirectiveCard label={r.directive2Label}>
        <RulesVisualFiscalStamp label={r.fiscalStampLabel} />
        <p className="text-center font-mono text-[11px] leading-relaxed text-slate-400">{r.directive2Body}</p>
        <p className="text-center font-mono text-[10px] leading-relaxed text-slate-500">{r.fiscalBossBody}</p>
      </DirectiveCard>

      <DirectiveCard label={r.directive3Label}>
        <p className="text-center font-mono text-[11px] leading-relaxed text-slate-400">{r.directive3Body}</p>
      </DirectiveCard>

      <section className="space-y-2 border-t border-slate-700/50 pt-4">
        <SectionTitle>{r.summaryPartyTitle}</SectionTitle>
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/55 px-3 py-3 font-mono text-[11px] text-slate-400">
          <span className="rounded border border-slate-600/80 bg-slate-950 px-2 py-1 text-slate-100">
            {r.summaryChip4x4}
          </span>
          <span>{r.summaryPartyFixedOrder}</span>
          <span className="text-slate-600">·</span>
          <span>{r.summaryPartyNeighbors}</span>
          <span className="rounded border border-slate-600/80 bg-slate-950 px-2 py-1 text-slate-100">
            {r.summaryChipOrth}
          </span>
          <span className="text-[10px]">{r.summaryPartyNoDiag}</span>
        </div>
      </section>

      <section className="space-y-2 border-t border-slate-700/50 pt-4">
        <SectionTitle>{r.summaryRoiTitle}</SectionTitle>
        <FormulaRow
          left={<span className="text-slate-100">{r.summaryRoiFormulaLeft}</span>}
          op="×"
          right={<span className="text-slate-100">{r.summaryRoiFormulaMode}</span>}
          result={<span className="text-slate-100">{r.summaryRoiFormulaResult}</span>}
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
        <SectionTitle>{r.summaryPerCellTitle}</SectionTitle>
        <div className="divide-y divide-slate-700/50 rounded-xl border border-slate-700/60 bg-slate-900/45">
          <div className="flex flex-wrap items-center justify-center gap-2 py-2.5 font-mono text-[11px]">
            <TileBox emoji="⬛" label={r.summaryLabelMine} />
            <span className="text-slate-600">=</span>
            <span className="font-semibold text-cyan-300">{r.summaryMineBase}</span>
          </div>
          <FormulaRow
            left={<TileBox emoji="🧑‍🚀" label={r.summaryLabelHabitacle} />}
            op="⊥"
            right={<TileBox emoji="⬛" label={r.summaryLabelMine} />}
            result={<span className="text-rose-400">{r.summaryFormulaIsolation}</span>}
          />
          <FormulaRow
            left={<TileBox emoji="🌱" label={r.summaryLabelSerre} />}
            op="+"
            right={
              <span className="flex items-center gap-1">
                <span className="text-slate-600">n ×</span>
                <TileBox emoji="🌱" label={r.summaryLabelSerreNeighbor} />
              </span>
            }
            result={<span className="text-slate-100">{r.summaryFormulaSerreResult}</span>}
          />
          <FormulaRow
            left={<TileBox emoji="💧" label={r.summaryLabelWater} />}
            op="+"
            right={
              <span className="flex items-center gap-1">
                <TileBox emoji="🧑‍🚀" label={r.summaryLabelHabitacle} />
                <span className="text-slate-600">/</span>
                <TileBox emoji="🌱" label={r.summaryLabelSerre} />
              </span>
            }
            result={<span className="text-slate-100">{r.summaryFormulaWaterNeighbor}</span>}
          />
        </div>
        <p className="pt-1 text-center font-mono text-[9px] text-slate-500">{r.summarySerreHint}</p>
      </section>
    </div>
  );
}
