"use client";

import { useMemo } from "react";

import { formatMultiplierFr, getDeckChallengeTitle } from "@/src/lib/difficulty";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { getLevelById } from "@/src/lib/levels";
import { pickHiddenDeckBuildingTypes } from "@/src/lib/rng";
import { getBuildingTheme } from "@/src/lib/ui-helpers";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import type { BuildingType } from "@/src/types/game";

const MANIFEST_ORDER: BuildingType[] = ["habitacle", "eau", "serre", "mine"];

export function Manifest() {
  const { t } = useAppStrings();
  const levelId = useLevelRunStore((s) => s.levelId);
  const seed = useLevelRunStore((s) => s.seed);
  const dailyInventory = useLevelRunStore((s) => s.dailyInventory);
  const deckChallengeLevel = useLevelRunStore((s) => s.deckChallengeLevel);

  const planetId = useMemo(() => {
    const def = levelId >= 1 ? getLevelById(levelId) : undefined;
    return def?.planetId ?? 0;
  }, [levelId]);

  const hiddenTypes = useMemo(
    () => pickHiddenDeckBuildingTypes(seed, deckChallengeLevel),
    [seed, deckChallengeLevel],
  );

  return (
    <section
      className="w-full max-w-sm shrink-0 rounded-pp-lg border border-white/10 bg-[#15161E] p-2 shadow-lg shadow-black/25 sm:p-3"
      aria-label="Manifeste de cargaison"
    >
      <div className="mb-1 border-b border-dotted border-white/10 pb-1 sm:mb-1.5 sm:pb-1.5">
        <p className="line-clamp-1 min-w-0 font-mono text-[8px] uppercase leading-tight tracking-[0.14em] text-slate-500 sm:text-[9px] sm:tracking-[0.2em]">
          {levelId >= 1 && seed ? t.manifest.manifestHeader(levelId, seed) : `— · ${seed || "—"}`}
        </p>
      </div>

      <p className="mb-1.5 font-mono text-[11px] font-bold uppercase leading-snug tracking-wide text-amber-300/95 sm:text-xs">
        {deckChallengeLevel >= 1
          ? `${t.manifest.deckTypesHidden(deckChallengeLevel)} · ${formatMultiplierFr(deckChallengeLevel)}`
          : `${getDeckChallengeTitle(deckChallengeLevel)} · ${formatMultiplierFr(deckChallengeLevel)}`}
      </p>

      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 font-mono text-[10px] text-slate-100 sm:gap-x-2 sm:text-xs">
        {MANIFEST_ORDER.map((type, i) => {
          const theme = getBuildingTheme(type, planetId);
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
                aria-label={hidden ? `${type}, effectif masqué pour ce mode` : `${type}, ${count} unités`}
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
