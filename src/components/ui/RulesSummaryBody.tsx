"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import {
  formatMultiplierFr,
  getDeckChallengeTitle,
} from "@/src/lib/difficulty";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { planetIdForLevel } from "@/src/lib/levels";
import { getBuildingTheme } from "@/src/lib/ui-helpers";
import { RulesVisualFiscalStamp } from "@/src/components/ui/RulesVisualFiscalStamp";
import { RulesVisualFusion } from "@/src/components/ui/RulesVisualFusion";
import { useProgressStore } from "@/src/store/useProgressStore";
import { DECK_CHALLENGE_LEVELS, type DeckChallengeLevel } from "@/src/types/game";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
      {children}
    </h3>
  );
}

function TileBox({
  emoji,
  label,
  tileClassName,
}: {
  emoji: string;
  label: string;
  /** Classes biome (fond, bordure) — sinon style neutre. */
  tileClassName?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg px-2 text-lg shadow-inner ${
        tileClassName ?? "border border-white/10 bg-[#15161E] text-slate-100"
      }`}
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
    <section className="pp-panel-sci space-y-3 rounded-xl p-3 shadow-inner sm:p-4">
      <h3 className="border-b border-white/10 pb-2 font-mono text-[11px] font-bold uppercase tracking-wide text-amber-200/95 sm:text-xs">
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
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const planetId = useMemo(() => {
    const maxU = unlockedLevels.length ? Math.max(...unlockedLevels) : 1;
    return planetIdForLevel(maxU);
  }, [unlockedLevels]);
  const sectorName = t.planets[planetId]!.name;
  const mineSkin = getBuildingTheme("mine", planetId);
  const habitacleSkin = getBuildingTheme("habitacle", planetId);
  const serreSkin = getBuildingTheme("serre", planetId);
  const eauSkin = getBuildingTheme("eau", planetId);

  return (
    <div className="space-y-5 text-slate-100">
      <header className="space-y-1 border-b border-white/10 pb-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-300/90">
          {r.inductionKicker}
        </p>
        <h2 className="font-mono text-sm font-bold tracking-tight text-white sm:text-base">{r.inductionTitle}</h2>
        <p className="font-mono text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
          {r.inductionSectorLine(sectorName)}
        </p>
      </header>

      <DirectiveCard label={r.directive1Label}>
        <RulesVisualFusion planetId={planetId} />
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

      <section className="space-y-2 border-t border-white/10 pt-4">
        <SectionTitle>{r.summaryPartyTitle}</SectionTitle>
        <div className="pp-panel-sci flex flex-wrap items-center justify-center gap-2 rounded-xl px-3 py-3 font-mono text-[11px] text-slate-400">
          <span className="rounded border border-white/10 bg-[#0B0C10] px-2 py-1 text-slate-100">
            {r.summaryChip4x4}
          </span>
          <span>{r.summaryPartyFixedOrder}</span>
          <span className="text-slate-600">·</span>
          <span>{r.summaryPartyNeighbors}</span>
          <span className="rounded border border-white/10 bg-[#0B0C10] px-2 py-1 text-slate-100">
            {r.summaryChipOrth}
          </span>
          <span className="text-[10px]">{r.summaryPartyNoDiag}</span>
        </div>
      </section>

      <section className="space-y-2 border-t border-white/10 pt-4">
        <SectionTitle>{r.summaryRoiTitle}</SectionTitle>
        <FormulaRow
          left={<span className="text-slate-100">{r.summaryRoiFormulaLeft}</span>}
          op="×"
          right={<span className="text-slate-100">{r.summaryRoiFormulaMode}</span>}
          result={<span className="text-slate-100">{r.summaryRoiFormulaResult}</span>}
        />
        <ul className="divide-y divide-white/10 font-mono text-[11px] text-slate-400">
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

      <section className="space-y-1 border-t border-white/10 pt-4">
        <SectionTitle>{r.summaryPerCellTitle}</SectionTitle>
        <div className="pp-panel-sci divide-y divide-white/10 rounded-xl">
          <div className="flex flex-wrap items-center justify-center gap-2 py-2.5 font-mono text-[11px]">
            <TileBox emoji={mineSkin.emoji} label={r.summaryLabelMine} tileClassName={mineSkin.color} />
            <span className="text-slate-600">=</span>
            <span className="font-semibold text-cyan-300">{r.summaryMineBase}</span>
          </div>
          <FormulaRow
            left={
              <TileBox
                emoji={habitacleSkin.emoji}
                label={r.summaryLabelHabitacle}
                tileClassName={habitacleSkin.color}
              />
            }
            op="⊥"
            right={<TileBox emoji={mineSkin.emoji} label={r.summaryLabelMine} tileClassName={mineSkin.color} />}
            result={<span className="text-rose-400">{r.summaryFormulaIsolation}</span>}
          />
          <FormulaRow
            left={<TileBox emoji={serreSkin.emoji} label={r.summaryLabelSerre} tileClassName={serreSkin.color} />}
            op="+"
            right={
              <span className="flex items-center gap-1">
                <span className="text-slate-600">n ×</span>
                <TileBox
                  emoji={serreSkin.emoji}
                  label={r.summaryLabelSerreNeighbor}
                  tileClassName={serreSkin.color}
                />
              </span>
            }
            result={<span className="text-slate-100">{r.summaryFormulaSerreResult}</span>}
          />
          <FormulaRow
            left={<TileBox emoji={eauSkin.emoji} label={r.summaryLabelWater} tileClassName={eauSkin.color} />}
            op="+"
            right={
              <span className="flex items-center gap-1">
                <TileBox
                  emoji={habitacleSkin.emoji}
                  label={r.summaryLabelHabitacle}
                  tileClassName={habitacleSkin.color}
                />
                <span className="text-slate-600">/</span>
                <TileBox emoji={serreSkin.emoji} label={r.summaryLabelSerre} tileClassName={serreSkin.color} />
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
