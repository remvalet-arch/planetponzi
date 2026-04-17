"use client";

import { useMemo } from "react";

import { formatMultiplierFr } from "@/src/lib/difficulty";
import {
  formatAvgScore,
  getLevelLabel,
  getPlayerStats,
  getTotalGamesCompleted,
} from "@/src/lib/stats";
import { DECK_CHALLENGE_LEVELS, type DeckChallengeLevel } from "@/src/types/game";

/**
 * Contenu des statistiques (page `/stats` ou modale).
 */
export function StatsScreen() {
  const stats = useMemo(() => getPlayerStats(), []);
  const totalPlayed = getTotalGamesCompleted();

  const maxBar = useMemo(() => {
    let m = 1;
    for (const lvl of DECK_CHALLENGE_LEVELS) {
      m = Math.max(m, stats.byLevel[String(lvl)]?.playCount ?? 0);
    }
    return m;
  }, [stats]);

  return (
    <div className="pp-allow-select space-y-5 px-4 py-5">
      <section aria-labelledby="stats-total-heading">
        <p id="stats-total-heading" className="font-mono text-xs text-pp-text-muted">
          Parties terminées
        </p>
        <p className="mt-1 font-mono text-4xl font-black tabular-nums text-fuchsia-300">
          {totalPlayed}
        </p>
        {stats.legacyCompletions != null && stats.legacyCompletions > 0 ? (
          <p className="mt-1 font-mono text-[10px] text-pp-text-dim">
            Inclut {stats.legacyCompletions} partie(s) sans détail par mode (ancien compteur).
          </p>
        ) : null}
      </section>

      <section
        className="rounded-pp-lg border border-pp-border bg-pp-elevated/30 px-3 py-3"
        aria-labelledby="stats-streak-heading"
      >
        <p id="stats-streak-heading" className="font-mono text-[10px] uppercase tracking-widest text-pp-text-dim">
          Série
        </p>
        <div className="mt-2 flex gap-6">
          <div>
            <p className="font-mono text-2xl font-black tabular-nums text-emerald-300">
              {stats.currentStreak}
            </p>
            <p className="font-mono text-[10px] text-pp-text-muted">Actuelle</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-black tabular-nums text-cyan-300">
              {stats.maxStreak}
            </p>
            <p className="font-mono text-[10px] text-pp-text-muted">Record</p>
          </div>
        </div>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-pp-text-dim">
          Jours consécutifs avec au moins une grille terminée (fuseau local). Même jour : pas
          d’incrément supplémentaire.
        </p>
      </section>

      <section aria-labelledby="stats-dist-heading">
        <p id="stats-dist-heading" className="font-mono text-[10px] uppercase tracking-widest text-pp-text-dim">
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
                <span className="font-mono text-[9px] font-bold text-pp-text-muted">
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
            const avg = avgRaw === "—" ? "—" : `${avgRaw}M$`;
            const best = row && c > 0 ? `${row.bestScore}M$` : "—";
            return (
              <li
                key={lvl}
                className="pp-panel-inset flex flex-col gap-1.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-semibold text-pp-text">
                    {getLevelLabel(lvl as DeckChallengeLevel)}
                  </p>
                  <p className="font-mono text-[10px] text-pp-text-dim">
                    Coeff. ROI {formatMultiplierFr(lvl as DeckChallengeLevel)}
                  </p>
                </div>
                <dl className="flex shrink-0 gap-4 font-mono text-[10px] tabular-nums sm:text-xs">
                  <div>
                    <dt className="text-pp-text-dim">Parties</dt>
                    <dd className="font-bold text-fuchsia-200">{c}</dd>
                  </div>
                  <div>
                    <dt className="text-pp-text-dim">Moy. ROI</dt>
                    <dd className="font-bold text-pp-text">{avg}</dd>
                  </div>
                  <div>
                    <dt className="text-pp-text-dim">Record</dt>
                    <dd className="font-bold text-emerald-300">{best}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="border-t border-pp-border pt-3 font-mono text-[10px] text-pp-text-dim">
        Données enregistrées sur cet appareil uniquement.
      </p>
    </div>
  );
}
