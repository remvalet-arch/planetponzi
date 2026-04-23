"use client";

import { useMemo } from "react";

import { formatMultiplierFr, getDeckChallengeTitle } from "@/src/lib/difficulty";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { pickHiddenDeckBuildingTypes } from "@/src/lib/rng";
import { getBuildingTheme } from "@/src/lib/ui-helpers";
import { getManifestAmbientCopy } from "@/src/lib/manifest-copy";
import type { BuildingType } from "@/src/types/game";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

function nextPiecesPreview(
  sequence: BuildingType[],
  turn: number,
  count: number,
): BuildingType[] {
  const cap = sequence.length;
  if (cap < 1 || turn >= cap) return [];
  const out: BuildingType[] = [];
  for (let i = 0; i < count && turn + i < cap; i++) {
    out.push(sequence[turn + i]!);
  }
  return out;
}

const MANIFEST_ORDER: BuildingType[] = [
  "habitacle",
  "eau",
  "serre",
  "mine",
];

export function Manifest() {
  const { t } = useAppStrings();
  const levelId = useLevelRunStore((s) => s.levelId);
  const seed = useLevelRunStore((s) => s.seed);
  const dailyInventory = useLevelRunStore((s) => s.dailyInventory);
  const deckChallengeLevel = useLevelRunStore((s) => s.deckChallengeLevel);
  const placementSequence = useLevelRunStore((s) => s.placementSequence);
  const turn = useLevelRunStore((s) => s.turn);
  const spyPreviewTurnsRemaining = useLevelRunStore((s) => s.spyPreviewTurnsRemaining);
  const status = useLevelRunStore((s) => s.status);

  const previewCount = spyPreviewTurnsRemaining > 0 ? 4 : 2;
  const nextPieces =
    status === "playing"
      ? nextPiecesPreview(placementSequence, turn, previewCount)
      : [];

  const hiddenTypes = useMemo(
    () => pickHiddenDeckBuildingTypes(seed, deckChallengeLevel),
    [seed, deckChallengeLevel],
  );

  const ambient = getManifestAmbientCopy(dailyInventory, deckChallengeLevel);
  return (
    <section
      className="w-full max-w-sm shrink-0 rounded-pp-lg border border-slate-700/60 bg-slate-900/75 p-2 shadow-lg shadow-black/25 backdrop-blur-sm sm:p-3"
      aria-label="Manifeste de cargaison"
    >
      <div className="mb-1 flex items-start justify-between gap-2 border-b border-dotted border-slate-600/50 pb-1 sm:mb-1.5 sm:pb-1.5">
        <p className="line-clamp-1 min-w-0 font-mono text-[8px] uppercase leading-tight tracking-[0.14em] text-slate-500 sm:text-[9px] sm:tracking-[0.2em]">
          Cargaison · Niveau {levelId || "—"} · {seed || "—"}
        </p>
        <span className="shrink-0 font-mono text-[8px] font-semibold text-cyan-400 sm:text-[9px]">FUN</span>
      </div>
      <p className="mb-0.5 font-mono text-[11px] font-bold uppercase leading-snug tracking-wide text-amber-300/95 sm:text-xs">
        {deckChallengeLevel >= 1
          ? `${t.manifest.deckTypesHidden(deckChallengeLevel)} · ${formatMultiplierFr(deckChallengeLevel)}`
          : `${getDeckChallengeTitle(deckChallengeLevel)} · ${formatMultiplierFr(deckChallengeLevel)}`}
      </p>
      <p className="mb-1 hidden font-mono text-[11px] leading-relaxed text-slate-400 sm:mb-2 sm:block">
        {ambient}
      </p>

      {nextPieces.length > 0 ? (
        <div className="mb-1 rounded-md border border-slate-600/50 bg-slate-950/60 px-1.5 py-1 sm:mb-1.5">
          <p className="mb-0.5 font-mono text-[7px] uppercase leading-tight tracking-wider text-violet-300/90 sm:text-[8px] sm:tracking-widest">
            {spyPreviewTurnsRemaining > 0 ? "Espion · 4" : "Suivants"}
          </p>
          <div className="flex flex-wrap items-center gap-0.5">
            {nextPieces.map((type, i) => {
              const theme = getBuildingTheme(type);
              return (
                <span
                  key={`${i}-${type}`}
                  className="inline-flex items-center gap-0.5 rounded border border-slate-600/60 bg-slate-900/90 px-0.5 py-px font-mono text-[9px] text-slate-100 sm:px-1 sm:py-0.5 sm:text-[10px]"
                >
                  <span aria-hidden>{theme.emoji}</span>
                  <span className="text-slate-500">{i + 1}</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 font-mono text-[10px] text-slate-100 sm:gap-x-2 sm:text-xs">
        {MANIFEST_ORDER.map((type, i) => {
          const theme = getBuildingTheme(type);
          const count = dailyInventory[type];
          const hidden = hiddenTypes.has(type);
          return (
            <span key={type} className="inline-flex items-center gap-1">
              {i > 0 ? (
                <span className="text-slate-600" aria-hidden>
                  |
                </span>
              ) : null}
              <span className="text-sm leading-none sm:text-base" aria-hidden>
                {theme.emoji}
              </span>
              <span
                className={`tabular-nums ${hidden ? "text-slate-500" : "font-semibold text-slate-100"}`}
                aria-label={
                  hidden
                    ? `${type}, effectif masqué pour ce mode`
                    : `${type}, ${count} unités`
                }
              >
                {hidden ? "× ?" : `×${count}`}
              </span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
