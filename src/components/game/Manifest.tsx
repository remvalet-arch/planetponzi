"use client";

import { useMemo } from "react";

import {
  formatMultiplierFr,
  getDeckChallengeTitle,
} from "@/src/lib/difficulty";
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
  if (sequence.length !== 16 || turn >= 16) return [];
  const out: BuildingType[] = [];
  for (let i = 0; i < count && turn + i < 16; i++) {
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
      className="w-full max-w-sm shrink-0 rounded-pp-lg border border-pp-border-strong bg-pp-surface/90 px-3 py-2.5 shadow-lg backdrop-blur-sm"
      aria-label="Manifeste de cargaison"
    >
      <div className="mb-2 flex items-start justify-between gap-2 border-b border-dotted border-pp-border pb-2">
        <p className="font-mono text-[9px] uppercase leading-snug tracking-[0.2em] text-pp-text-dim">
          Cargaison · Niveau {levelId || "—"} · {seed || "—"}
        </p>
        <span className="shrink-0 font-mono text-[9px] font-semibold text-pp-accent">FUN</span>
      </div>
      <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-pp-gold-dark">
        {getDeckChallengeTitle(deckChallengeLevel)} · {formatMultiplierFr(deckChallengeLevel)}
      </p>
      <p className="mb-2 font-mono text-[11px] leading-relaxed text-pp-text-muted">{ambient}</p>

      {nextPieces.length > 0 ? (
        <div className="mb-2 rounded-md border border-pp-border bg-pp-elevated/60 px-2 py-1.5">
          <p className="mb-1 font-mono text-[8px] uppercase tracking-widest text-violet-300/90">
            {spyPreviewTurnsRemaining > 0 ? "Ordre (espion — 4 coups)" : "Prochaines pièces"}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {nextPieces.map((type, i) => {
              const theme = getBuildingTheme(type);
              return (
                <span
                  key={`${i}-${type}`}
                  className="inline-flex items-center gap-0.5 rounded border border-pp-border-strong bg-pp-surface/90 px-1 py-0.5 font-mono text-[10px] text-pp-text"
                >
                  <span aria-hidden>{theme.emoji}</span>
                  <span className="text-pp-text-dim">{i + 1}</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-pp-text">
        {MANIFEST_ORDER.map((type, i) => {
          const theme = getBuildingTheme(type);
          const count = dailyInventory[type];
          const hidden = hiddenTypes.has(type);
          return (
            <span key={type} className="inline-flex items-center gap-1">
              {i > 0 ? (
                <span className="text-pp-text-dim" aria-hidden>
                  |
                </span>
              ) : null}
              <span className="text-base leading-none" aria-hidden>
                {theme.emoji}
              </span>
              <span
                className={`tabular-nums ${hidden ? "text-pp-text-dim" : "font-semibold text-pp-text"}`}
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
