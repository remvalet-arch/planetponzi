"use client";

import { useMemo, useState } from "react";

import { Check } from "lucide-react";
import { ChevronDown } from "lucide-react";

import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import {
  getLevelById,
  getMandateProgressRows,
  getSpatialMandateHudRows,
  type MandateProgressRow,
  type SpatialMandateHudRow,
} from "@/src/lib/levels";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

type BuildingLabels = {
  habitacle: string;
  eau: string;
  serre: string;
  mine: string;
  forests: string;
};

function rowLabel(row: MandateProgressRow, buildings: BuildingLabels): string {
  if (row.building === "serre" && row.displayAsForests) return buildings.forests;
  return buildings[row.building];
}

function spatialLabel(row: SpatialMandateHudRow, buildings: BuildingLabels): string {
  return buildings[row.building];
}

/**
 * Compteurs mandat (min. bâtiments + règles spatiales) pendant la partie — grille temps réel.
 */
export function MandateTracker() {
  const { t } = useAppStrings();
  const levelId = useLevelRunStore((s) => s.levelId);
  const grid = useLevelRunStore((s) => s.grid);
  const status = useLevelRunStore((s) => s.status);
  const [expanded, setExpanded] = useState(false);

  if (status !== "playing" || levelId < 1) return null;
  const def = getLevelById(levelId);
  const countRows = getMandateProgressRows(grid, def?.winCondition);
  const spatialRows = getSpatialMandateHudRows(grid, def?.winCondition);
  if (countRows.length === 0 && spatialRows.length === 0) return null;

  const totalChecks = countRows.length + spatialRows.length;
  const doneChecks =
    countRows.filter((row) => row.current >= row.required).length +
    spatialRows.filter((row) => row.ok).length;
  const summary = t.mandate.trackerCompactSummary(doneChecks, totalChecks);
  const detailsId = `mandate-details-${levelId}`;

  const countDetail = useMemo(
    () =>
      countRows.map((row, i) => {
        const ok = row.current >= row.required;
        const label = rowLabel(row, t.biomes[def?.planetId ?? 0]);
        const line = t.mandate.trackerLine(label, row.current, row.required);
        return (
          <span
            key={`c-${row.building}-${i}`}
            className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold tabular-nums sm:text-xs ${
              ok ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {ok ? <Check className="size-3.5 shrink-0 stroke-[3]" strokeWidth={2.5} aria-hidden /> : null}
            {line}
          </span>
        );
      }),
    [countRows, def?.planetId, t.biomes, t.mandate],
  );

  const spatialDetail = useMemo(
    () =>
      spatialRows.map((row, i) => {
        const label = spatialLabel(row, t.biomes[def?.planetId ?? 0]);
        if (row.kind === "isolated") {
          const line = row.ok ? t.mandate.trackerIsolatedOk(label) : t.mandate.trackerIsolatedBad(label);
          return (
            <span
              key={`s-iso-${row.building}-${i}`}
              className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold tabular-nums sm:text-xs ${
                row.ok ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {row.ok ? <Check className="size-3.5 shrink-0 stroke-[3]" strokeWidth={2.5} aria-hidden /> : null}
              {line}
            </span>
          );
        }
        const line = t.mandate.trackerAligned(label, row.currentRun, row.required);
        return (
          <span
            key={`s-aln-${row.building}-${i}`}
            className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold tabular-nums sm:text-xs ${
              row.ok ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {row.ok ? <Check className="size-3.5 shrink-0 stroke-[3]" strokeWidth={2.5} aria-hidden /> : null}
            {line}
          </span>
        );
      }),
    [spatialRows, def?.planetId, t.biomes, t.mandate],
  );

  return (
    <div className="mx-auto w-full max-w-lg shrink-0 border-b border-white/10 bg-[#0B0C10]/95 px-2 py-1.5" role="status" aria-live="polite" aria-label={t.entryFlow.mandate}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-1.5 py-1 text-left transition-colors hover:bg-white/[0.04]"
        aria-expanded={expanded}
        aria-controls={detailsId}
      >
        <span className="truncate font-mono text-[11px] text-slate-300 sm:text-xs">{summary}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div id={detailsId} className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pb-1">
          {countDetail}
          {spatialDetail}
        </div>
      ) : null}
    </div>
  );
}
