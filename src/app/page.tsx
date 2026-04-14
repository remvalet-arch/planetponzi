"use client";

import { useEffect, useState } from "react";

import { DeckDifficultyGate } from "@/src/components/game/DeckDifficultyGate";
import { EndScreen } from "@/src/components/game/EndScreen";
import { Grid } from "@/src/components/game/Grid";
import { Manifest } from "@/src/components/game/Manifest";
import { AppHeader } from "@/src/components/layout/AppHeader";
import {
  Tutorial,
  hasCompletedTutorial,
  markTutorialCompleted,
} from "@/src/components/onboarding/Tutorial";
import { RulesModal, hasSeenRulesFirstVisit, markRulesFirstVisitDone } from "@/src/components/ui/RulesModal";
import { StatsModal } from "@/src/components/ui/StatsModal";
import { Toast } from "@/src/components/ui/Toast";
import { getLocalDateSeed } from "@/src/lib/rng";
import { getBuildingTheme } from "@/src/lib/ui-helpers";
import { useGameStore } from "@/src/store/useGameStore";

function formatRoi(score: number): string {
  const sign = score >= 0 ? "+" : "";
  return `ROI: ${sign}${score}M$`;
}

export default function HomePage() {
  const deckChallengeLockedSeed = useGameStore((s) => s.deckChallengeLockedSeed);
  const seed = useGameStore((s) => s.seed);
  const deckUnlocked = deckChallengeLockedSeed === seed;

  const status = useGameStore((s) => s.status);
  const turn = useGameStore((s) => s.turn);
  const dailySequence = useGameStore((s) => s.dailySequence);

  const [rulesOpen, setRulesOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  /** Tant que `persist` n’a pas relu le stockage, l’état par défaut ferait clignoter la modale puis l’écran de jeu. */
  const [persistReady, setPersistReady] = useState(false);

  useEffect(() => {
    const sync = () => useGameStore.getState().syncTodaySession();

    const unsub = useGameStore.persist.onFinishHydration(() => {
      setPersistReady(true);
      sync();
    });

    if (useGameStore.persist.hasHydrated()) {
      queueMicrotask(() => {
        setPersistReady(true);
        sync();
      });
    }

    return () => {
      unsub();
    };
  }, []);

  /** Anciens joueurs : déjà vu les règles → ne pas forcer le tutoriel guidé. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasSeenRulesFirstVisit() && !hasCompletedTutorial()) {
      markTutorialCompleted();
    }
  }, []);

  useEffect(() => {
    if (!persistReady || !deckUnlocked) return;
    if (hasCompletedTutorial()) return;
    queueMicrotask(() => setTutorialOpen(true));
  }, [persistReady, deckUnlocked]);

  useEffect(() => {
    if (!persistReady || !deckUnlocked) return;
    if (!hasCompletedTutorial()) return;
    if (hasSeenRulesFirstVisit()) return;
    queueMicrotask(() => setRulesOpen(true));
  }, [persistReady, deckUnlocked]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  const closeRules = () => {
    setRulesOpen(false);
    markRulesFirstVisitDone();
  };

  const handleTomorrowInfo = () => {
    const today = getLocalDateSeed();
    const { seed: s, syncTodaySession } = useGameStore.getState();
    if (s !== today) {
      syncTodaySession();
      setToastMessage("Nouvelle date détectée — mandat rechargé.");
      return;
    }
    setToastMessage(
      "Le prochain puzzle débloque après minuit (heure locale). D’ici là : mindfulness obligatoire.",
    );
  };

  const nextType = turn < 16 ? dailySequence[turn] : null;
  const nextTheme = nextType ? getBuildingTheme(nextType) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-pp-bg text-pp-text">
      {!persistReady ? (
        <div className="pp-loading-screen" role="status" aria-live="polite" aria-busy="true">
          <p className="pp-kicker opacity-90">Chargement du mandat</p>
          <p className="mt-3 max-w-xs text-center font-mono text-xs text-pp-text-muted">
            Synchronisation avec votre session locale…
          </p>
        </div>
      ) : null}

      <AppHeader
        formatRoi={formatRoi}
        onOpenRules={() => setRulesOpen(true)}
        onOpenStats={() => setStatsOpen(true)}
        onTomorrowInfo={handleTomorrowInfo}
        onRestartSameDay={() =>
          setToastMessage("Grille réinitialisée — même manifeste et même ordre de placement.")
        }
      />

      {persistReady && deckUnlocked ? (
        <main className="relative flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
          <Manifest />
          <Grid />
        </main>
      ) : persistReady ? (
        <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-8" aria-hidden />
      ) : null}

      {persistReady && deckUnlocked && status === "playing" && nextTheme && nextType ? (
        <div className="pp-mandate-strip">
          <div className="pp-mandate-strip-inner">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-md text-3xl ${nextTheme.color}`}
            >
              <span aria-hidden>{nextTheme.emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-pp-text-dim">
                Mandat terrain
              </p>
              <p className="truncate text-sm font-semibold text-pp-text">
                Bâtiment à placer
              </p>
              <p className="truncate font-mono text-xs uppercase text-pp-text-muted">
                {nextType} · tour {turn + 1}/16
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {persistReady ? (
        <DeckDifficultyGate onOpenRules={() => setRulesOpen(true)} />
      ) : null}
      {persistReady ? <EndScreen onShareFeedback={setToastMessage} /> : null}
      {persistReady ? (
        <Tutorial
          open={tutorialOpen}
          onClose={() => setTutorialOpen(false)}
          onComplete={() => {
            setTutorialOpen(false);
            markRulesFirstVisitDone();
          }}
        />
      ) : null}
      <RulesModal open={rulesOpen} onClose={closeRules} />
      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
      <Toast message={toastMessage} />
    </div>
  );
}
