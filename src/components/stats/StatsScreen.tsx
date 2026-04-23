"use client";

import { useMemo } from "react";

import { formatMultiplierFr } from "@/src/lib/difficulty";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import {
  formatAvgScore,
  getLevelLabel,
  getPlayerStats,
  getTotalGamesCompleted,
} from "@/src/lib/stats";
import { useProgressStore } from "@/src/store/useProgressStore";
import { DECK_CHALLENGE_LEVELS, type DeckChallengeLevel } from "@/src/types/game";

/**
 * Contenu des statistiques (page `/stats` ou modale).
 */
export function StatsScreen() {
  const { t } = useAppStrings();
  const stats = useMemo(() => getPlayerStats(), []);
  const totalPlayed = getTotalGamesCompleted();
  const totalBuildingsPlaced = useProgressStore((s) => s.totalBuildingsPlaced);
  const totalFailures = useProgressStore((s) => s.totalFailures);
  const carbonTons = totalBuildingsPlaced * 150;
  const burnoutInterns = totalFailures * 3;

  const maxBar = useMemo(() => {
    let m = 1;
    for (const lvl of DECK_CHALLENGE_LEVELS) {
      m = Math.max(m, stats.byLevel[String(lvl)]?.playCount ?? 0);
    }
    return m;
  }, [stats]);

  const rowCard =
    "rounded-pp-lg border border-slate-700/60 bg-slate-900/75 shadow-lg shadow-black/20";

  return (
    <div className="pp-allow-select space-y-5 px-4 py-5 text-slate-100">
      <section aria-labelledby="stats-total-heading">
        <p id="stats-total-heading" className="font-mono text-xs text-slate-400">
          Parties terminées
        </p>
        <p className="mt-1 font-mono text-4xl font-black tabular-nums text-fuchsia-300">
          {totalPlayed}
        </p>
        {stats.legacyCompletions != null && stats.legacyCompletions > 0 ? (
          <p className="mt-1 font-mono text-[10px] text-slate-500">
            Inclut {stats.legacyCompletions} partie(s) sans détail par mode (ancien compteur).
          </p>
        ) : null}
      </section>

      <section
        className="rounded-pp-lg border border-slate-700/60 bg-slate-900/50 px-3 py-3"
        aria-labelledby="stats-streak-heading"
      >
        <p id="stats-streak-heading" className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Série
        </p>
        <div className="mt-2 flex gap-6">
          <div>
            <p className="font-mono text-2xl font-black tabular-nums text-emerald-300">
              {stats.currentStreak}
            </p>
            <p className="font-mono text-[10px] text-slate-400">Actuelle</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-black tabular-nums text-cyan-300">
              {stats.maxStreak}
            </p>
            <p className="font-mono text-[10px] text-slate-400">Record</p>
          </div>
        </div>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-500">
          Jours consécutifs avec au moins une grille terminée (fuseau local). Même jour : pas
          d’incrément supplémentaire.
        </p>
      </section>

      <section aria-labelledby="stats-dist-heading">
        <p id="stats-dist-heading" className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Parties par mode
        </p>
        <div className="mt-3 flex h-24 items-end justify-between gap-1.5 px-1">
          {DECK_CHALLENGE_LEVELS.map((lvl) => {
            const n = stats.byLevel[String(lvl)]?.playCount ?? 0;
            const barPx = Math.max(n === 0 ? 3 : 6, Math.round((n / maxBar) * 88));
            return (
              <div
                key={lvl}
                className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-end gap-1"
              >
                <div
                  className="w-full max-w-[2.5rem] rounded-t-sm bg-gradient-to-t from-violet-950/80 to-fuchsia-500/50 transition-[height]"
                  style={{ height: barPx }}
                  title={`${n} partie(s)`}
                />
                <span className="font-mono text-[9px] font-bold text-slate-400">
                  {lvl === 0 ? "0" : String(lvl)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-label="Détail par difficulté">
        <ul className="space-y-2">
          {DECK_CHALLENGE_LEVELS.map((lvl) => {
            const row = stats.byLevel[String(lvl)];
            const c = row?.playCount ?? 0;
            const avgRaw = row ? formatAvgScore(row.sumScore, row.playCount) : "—";
            const avg = avgRaw === "—" ? "—" : `${avgRaw}\u202fM$`;
            const best = row && c > 0 ? `${row.bestScore}\u202fM$` : "—";
            return (
              <li
                key={lvl}
                className={`${rowCard} flex flex-col gap-1.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between`}
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-semibold text-slate-100">
                    {getLevelLabel(lvl as DeckChallengeLevel)}
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    Coeff. ROI {formatMultiplierFr(lvl as DeckChallengeLevel)}
                  </p>
                </div>
                <dl className="flex shrink-0 gap-4 font-mono text-[10px] tabular-nums sm:text-xs">
                  <div>
                    <dt className="text-slate-500">Parties</dt>
                    <dd className="font-bold text-fuchsia-200">{c}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Moy. ROI</dt>
                    <dd className="font-bold text-slate-200">{avg}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Record</dt>
                    <dd className="font-bold text-emerald-300">{best}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className={`${rowCard} space-y-3 px-3 py-3`}
        aria-labelledby="stats-rse-heading"
      >
        <p
          id="stats-rse-heading"
          className="font-mono text-[10px] uppercase tracking-widest text-rose-300/90"
        >
          {t.statsRse.sectionTitle}
        </p>
        <div className="flex flex-col gap-2 font-mono text-xs sm:flex-row sm:justify-between sm:gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {t.statsRse.carbonTitle}
            </p>
            <p className="mt-1 text-lg font-black tabular-nums text-emerald-400/90">
              {t.statsRse.carbonValue(carbonTons)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {t.statsRse.burnoutTitle}
            </p>
            <p className="mt-1 text-lg font-black tabular-nums text-rose-300/90">
              {t.statsRse.burnoutValue(burnoutInterns)}
            </p>
          </div>
        </div>
      </section>

      <p className="border-t border-slate-700/60 pt-3 font-mono text-[10px] text-slate-500">
        Données enregistrées sur cet appareil uniquement.
      </p>
    </div>
  );
}
