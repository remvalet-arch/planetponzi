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
import { useGameStore } from "@/src/store/useGameStore";

const MANIFEST_ORDER: BuildingType[] = [
  "habitacle",
  "eau",
  "serre",
  "mine",
];

export function Manifest() {
  const seed = useGameStore((s) => s.seed);
  const dailyInventory = useGameStore((s) => s.dailyInventory);
  const deckChallengeLevel = useGameStore((s) => s.deckChallengeLevel);

  const hiddenTypes = useMemo(
    () => pickHiddenDeckBuildingTypes(seed, deckChallengeLevel),
    [seed, deckChallengeLevel],
  );

  const ambient = getManifestAmbientCopy(dailyInventory, deckChallengeLevel);
  const refYear = seed.slice(0, 4) || String(new Date().getFullYear());

  return (
    <section
      className="w-full max-w-sm border border-neutral-800 bg-neutral-900/40 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
      aria-label="Manifeste de cargaison"
    >
      <div className="mb-2 flex items-start justify-between gap-2 border-b border-dotted border-neutral-700 pb-2">
        <p className="font-mono text-[9px] uppercase leading-snug tracking-[0.2em] text-neutral-500">
          Cargaison · ref. {refYear}-PPZ · {seed}
        </p>
        <span className="shrink-0 font-mono text-[9px] text-neutral-600">
          CONFIDENTIEL
        </span>
      </div>
      <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-amber-500/90">
        {getDeckChallengeTitle(deckChallengeLevel)} · {formatMultiplierFr(deckChallengeLevel)}
      </p>
      <p className="mb-2 font-mono text-[11px] leading-relaxed text-neutral-400">
        {ambient}
      </p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-neutral-300">
        {MANIFEST_ORDER.map((type, i) => {
          const theme = getBuildingTheme(type);
          const count = dailyInventory[type];
          const hidden = hiddenTypes.has(type);
          return (
            <span key={type} className="inline-flex items-center gap-1">
              {i > 0 ? (
                <span className="text-neutral-600" aria-hidden>
                  |
                </span>
              ) : null}
              <span className="text-base leading-none" aria-hidden>
                {theme.emoji}
              </span>
              <span
                className={`tabular-nums ${hidden ? "text-neutral-500" : "text-neutral-200"}`}
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
