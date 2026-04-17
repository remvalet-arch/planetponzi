"use client";

import { useCallback, useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import type { LeaderboardRow } from "@/src/types/leaderboard";
import { useProgressStore } from "@/src/store/useProgressStore";

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
      setEntries(json.entries);
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
      <header className="relative z-10 shrink-0 border-b border-pp-border bg-pp-bg/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="size-5 text-amber-300/90" strokeWidth={2.2} aria-hidden />
          <h1 className="text-center font-mono text-lg font-bold tracking-tight text-pp-text">
            {t.nav.leaderboard}
          </h1>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {entries === null ? (
          <LeaderboardSkeleton />
        ) : error && entries.length === 0 ? (
          <p className="px-4 py-8 text-center font-mono text-sm text-pp-text-muted">{error}</p>
        ) : entries.length === 0 ? (
          <p className="px-4 py-8 text-center font-mono text-sm text-pp-text-muted">{t.leaderboard.empty}</p>
        ) : (
          <ol className="flex flex-col gap-2 px-3 py-3">
            {entries.map((row) => {
              const isYou = Boolean(playerId && row.player_key === playerId);
              return (
                <li
                  key={`${row.player_key}-${row.rank}`}
                  className={`flex items-center gap-3 rounded-pp-lg border px-3 py-3 font-mono text-sm transition-colors ${
                    isYou
                      ? "border-amber-400/55 bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-yellow-500/10 shadow-[0_0_20px_rgb(251_191_36/0.12)]"
                      : "border-pp-border-strong bg-pp-elevated/80"
                  }`}
                >
                  <span
                    className={`w-8 shrink-0 text-center text-xs font-bold ${
                      isYou ? "text-amber-200" : "text-pp-text-muted"
                    }`}
                  >
                    #{row.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-semibold ${isYou ? "text-amber-50" : "text-pp-text"}`}>
                      {row.pseudo}
                      {isYou ? (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-amber-200/90">
                          {t.leaderboard.you}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-pp-text-muted">{row.total_stars} ★</p>
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
