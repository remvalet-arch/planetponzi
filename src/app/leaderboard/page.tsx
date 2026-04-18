"use client";

import { useCallback, useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import type { LeaderboardRow } from "@/src/types/leaderboard";
import { useProgressStore } from "@/src/store/useProgressStore";

function rowSurfaceClasses(prestige: number, isYou: boolean): string {
  const p = Math.max(0, Math.floor(prestige));
  if (p >= 5) {
    return "border-2 border-cyan-200/80 bg-gradient-to-br from-cyan-950/50 via-slate-900/85 to-indigo-950/55 shadow-[0_0_26px_rgb(34_211_238/0.28)]";
  }
  if (p >= 3) {
    return "border-2 border-amber-400/70 bg-gradient-to-r from-amber-950/40 via-pp-elevated/88 to-yellow-950/30 shadow-[0_0_22px_rgb(251_191_36/0.2)]";
  }
  if (p >= 1) {
    return "border border-slate-300/55 bg-pp-elevated/88 shadow-[inset_0_1px_0_rgb(255_255_255/0.07)]";
  }
  if (isYou) {
    return "border-amber-400/55 bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-yellow-500/10 shadow-[0_0_20px_rgb(251_191_36/0.12)]";
  }
  return "border-pp-border-strong bg-pp-elevated/80";
}

function LeaderboardSkeleton() {
  return (
    <ul className="flex flex-col gap-2 px-3 py-2" aria-busy aria-label="Chargement du classement">
      {Array.from({ length: 10 }, (_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-pp-lg border border-pp-border-strong bg-pp-elevated/50 px-3 py-3"
        >
          <div className="h-4 w-8 animate-pulse rounded bg-pp-border-strong" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-2/5 max-w-[12rem] animate-pulse rounded bg-pp-border-strong" />
            <div className="h-3 w-16 animate-pulse rounded bg-pp-border-strong/80" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function LeaderboardPage() {
  const { t } = useAppStrings();
  const playerId = useProgressStore((s) => s.playerId);
  const [entries, setEntries] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setEntries(null);
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; entries?: LeaderboardRow[]; error?: string };
      if (!res.ok || !json.ok || !Array.isArray(json.entries)) {
        setError(json.error ?? t.leaderboard.loadError);
        setEntries([]);
        return;
      }
      setEntries(
        json.entries.map((e) => ({
          ...e,
          prestige_level: Number.isFinite(Number(e.prestige_level)) ? Number(e.prestige_level) : 0,
        })),
      );
    } catch {
      setError(t.leaderboard.loadError);
      setEntries([]);
    }
  }, [t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-pp-bg text-pp-text">
      <header className="relative z-40 min-h-0 shrink-0 border-b border-pp-border bg-pp-bg/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="size-5 text-amber-300/90" strokeWidth={2.2} aria-hidden />
          <h1 className="text-center font-mono text-lg font-bold tracking-tight text-pp-text">
            {t.nav.leaderboard}
          </h1>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        {entries === null ? (
          <LeaderboardSkeleton />
        ) : error && entries.length === 0 ? (
          <p className="px-4 py-8 text-center font-mono text-sm text-pp-text-muted">{error}</p>
        ) : entries.length === 0 ? (
          <p className="px-4 py-8 text-center font-mono text-sm text-pp-text-muted">{t.leaderboard.empty}</p>
        ) : (
          <ol className="flex flex-col gap-2 px-3 py-3 pb-16">
            {entries.map((row) => {
              const isYou = Boolean(playerId && row.player_key === playerId);
              const pl = Number.isFinite(row.prestige_level) ? Math.max(0, row.prestige_level) : 0;
              const tierEmoji = pl >= 5 ? "💎" : pl >= 3 ? "👑" : "";
              const ringYou =
                isYou && pl >= 1 ? " ring-2 ring-amber-400/45 ring-offset-2 ring-offset-pp-bg" : "";
              const surface = rowSurfaceClasses(pl, isYou);
              return (
                <li
                  key={`${row.player_key}-${row.rank}`}
                  className={`flex items-center gap-3 rounded-pp-lg px-3 py-3 font-mono text-sm transition-colors ${surface}${ringYou}`}
                >
                  <span
                    className={`w-8 shrink-0 text-center text-xs font-bold ${
                      isYou ? "text-amber-200" : pl >= 5 ? "text-cyan-200" : pl >= 3 ? "text-amber-200" : "text-pp-text-muted"
                    }`}
                  >
                    #{row.rank}
                  </span>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className={`flex min-w-0 items-center gap-2 font-semibold ${isYou ? "text-amber-50" : "text-pp-text"}`}>
                      {tierEmoji ? (
                        <span className="shrink-0 text-base leading-none" aria-hidden>
                          {tierEmoji}
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1 truncate">{row.pseudo}</span>
                      {isYou ? (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-amber-200/90">
                          {t.leaderboard.you}
                        </span>
                      ) : null}
                      {pl >= 1 ? (
                        <span className="shrink-0 rounded-md border border-amber-400/35 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-100/95">
                          {t.leaderboard.prestigeShort(pl)}
                        </span>
                      ) : null}
                    </div>
                    <p className="whitespace-nowrap text-xs text-pp-text-muted">{row.total_stars} ★</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
