"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BoostersBar } from "@/src/components/game/BoostersBar";
import { EndScreen } from "@/src/components/game/EndScreen";
import { FiscalFreezeModal } from "@/src/components/game/FiscalFreezeModal";
import { Grid } from "@/src/components/game/Grid";
import { MandateTracker } from "@/src/components/game/MandateTracker";
import { Manifest } from "@/src/components/game/Manifest";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { NoEnergyModal } from "@/src/components/game/NoEnergyModal";
import { GameEntryFlow } from "@/src/components/onboarding/GameEntryFlow";
import { RulesModal, hasSeenRulesFirstVisit, markRulesFirstVisitDone } from "@/src/components/ui/RulesModal";
import { StatsModal } from "@/src/components/ui/StatsModal";
import { Toast } from "@/src/components/ui/Toast";
import { getLevelById } from "@/src/lib/levels";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { hasCompletedTutorial, markTutorialCompleted } from "@/src/lib/onboarding-flags";
import { canPlayLevel } from "@/src/lib/star-gate";
import { playMegaFusion } from "@/src/lib/game-sounds";
import { getBuildingTheme } from "@/src/lib/ui-helpers";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";
import { useProgressStore } from "@/src/store/useProgressStore";

function formatRoi(score: number): string {
  const sign = score >= 0 ? "+" : "";
  return `${sign}${score} pts`;
}

export default function LevelPage() {
  const router = useRouter();
  const { t } = useAppStrings();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const levelValid = Number.isFinite(id) && Boolean(getLevelById(id));

  const deckChallengeLockedSeed = useLevelRunStore((s) => s.deckChallengeLockedSeed);
  const seed = useLevelRunStore((s) => s.seed);
  const deckUnlocked = deckChallengeLockedSeed === seed && seed.length > 0;

  const status = useLevelRunStore((s) => s.status);
  const turn = useLevelRunStore((s) => s.turn);
  const placementSequence = useLevelRunStore((s) => s.placementSequence);
  const lives = useEconomyStore((s) => s.lives);
  const gridTemporaryEffects = useLevelRunStore((s) => s.gridTemporaryEffects);
  const hasSeenFiscalFreezeTutorial = useProgressStore((s) => s.hasSeenFiscalFreezeTutorial);
  const markFiscalFreezeTutorialSeen = useProgressStore((s) => s.markFiscalFreezeTutorialSeen);

  const [rulesOpen, setRulesOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [persistReady, setPersistReady] = useState(false);
  const [noEnergyOpen, setNoEnergyOpen] = useState(false);
  const [fiscalModalOpen, setFiscalModalOpen] = useState(false);
  const fusionToastShownRef = useRef(false);
  const megaFusionSfxPlayedRef = useRef(false);

  useEffect(() => {
    const bump = () => {
      if (
        !useLevelRunStore.persist.hasHydrated() ||
        !useProgressStore.persist.hasHydrated() ||
        !useEconomyStore.persist.hasHydrated()
      ) {
        return;
      }
      useEconomyStore.getState().checkLifeRecharge();
      setPersistReady(true);
      if (!levelValid) return;
      const unlocked = useProgressStore.getState().unlockedLevels;
      const starsByLevel = useProgressStore.getState().starsByLevel;
      if (!unlocked.includes(id)) {
        router.replace("/map");
        return;
      }
      if (!canPlayLevel(id, unlocked, starsByLevel)) {
        try {
          sessionStorage.setItem("pp-map-hint", t.map.starGateHint);
        } catch {
          /* ignore */
        }
        router.replace("/map");
        return;
      }
      const currentLives = useEconomyStore.getState().lives;
      if (currentLives <= 0) {
        setNoEnergyOpen(true);
        return;
      }
      setNoEnergyOpen(false);
      const s = useLevelRunStore.getState();
      const shouldEnter =
        s.levelId !== id || s.status === "finished" || s.levelId === 0;
      if (shouldEnter) {
        useLevelRunStore.getState().enterLevel(id);
      }
    };

    const unsubRun = useLevelRunStore.persist.onFinishHydration(bump);
    const unsubProg = useProgressStore.persist.onFinishHydration(bump);
    const unsubEco = useEconomyStore.persist.onFinishHydration(bump);
    bump();

    return () => {
      unsubRun();
      unsubProg();
      unsubEco();
    };
    /**
     * Ne pas dépendre de `lives` ici : après une fin de partie (≤1★), `consumeLife`
     * mettrait à jour les vies, relancerait `bump` et `enterLevel` à cause de
     * `status === "finished"`, ce qui efface le bilan (score / étoiles) encore affiché.
     */
  }, [id, levelValid, router, t.map.starGateHint]);

  /** Vies / recharge : à part de l’effet d’hydratation pour ne pas réinitialiser un run `finished`. */
  useEffect(() => {
    if (!persistReady || !levelValid) return;
    useEconomyStore.getState().checkLifeRecharge();
    if (useEconomyStore.getState().lives <= 0) {
      setNoEnergyOpen(true);
    } else {
      setNoEnergyOpen(false);
    }
  }, [persistReady, levelValid, lives]);

  useEffect(() => {
    if (!persistReady) return;
    const hasFiscalFreeze = gridTemporaryEffects.some((e) => e.kind === "fiscal_freeze");
    if (!hasFiscalFreeze || hasSeenFiscalFreezeTutorial) return;
    const tid = window.setTimeout(() => {
      setFiscalModalOpen(true);
      markFiscalFreezeTutorialSeen();
    }, 0);
    return () => window.clearTimeout(tid);
  }, [persistReady, gridTemporaryEffects, hasSeenFiscalFreezeTutorial, markFiscalFreezeTutorialSeen]);

  useEffect(() => {
    fusionToastShownRef.current = false;
    megaFusionSfxPlayedRef.current = false;
  }, [id]);

  useEffect(() => {
    if (turn === 0 && status === "ready") {
      fusionToastShownRef.current = false;
      megaFusionSfxPlayedRef.current = false;
    }
  }, [turn, status]);

  useEffect(() => {
    const hasMega = gridTemporaryEffects.some((e) => e.kind === "mega_industrial_fusion");
    if (hasMega && !megaFusionSfxPlayedRef.current) {
      megaFusionSfxPlayedRef.current = true;
      queueMicrotask(() => playMegaFusion());
    }
    if (id !== 1) return;
    if (hasMega && !fusionToastShownRef.current) {
      fusionToastShownRef.current = true;
      queueMicrotask(() =>
        setToastMessage(
          `${t.tutorial.level1FusionToast}\n\n${t.tutorial.level1FusionToastCeo}`,
        ),
      );
    }
  }, [id, gridTemporaryEffects, t.tutorial.level1FusionToast, t.tutorial.level1FusionToastCeo]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasSeenRulesFirstVisit() && !hasCompletedTutorial()) {
      markTutorialCompleted();
    }
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const ms = toastMessage.length > 120 ? 5200 : 2800;
    const tid = window.setTimeout(() => setToastMessage(null), ms);
    return () => window.clearTimeout(tid);
  }, [toastMessage]);

  const closeRules = () => {
    setRulesOpen(false);
    markRulesFirstVisitDone();
  };

  const mandateLen = placementSequence.length;
  const nextType =
    mandateLen > 0 && turn < mandateLen ? placementSequence[turn] : null;
  const nextTheme = nextType ? getBuildingTheme(nextType) : null;

  if (!levelValid) {
    notFound();
  }

  return (
    <div className="relative flex h-full min-h-0 max-h-[100dvh] flex-1 flex-col overflow-hidden overscroll-y-none overscroll-x-none bg-pp-bg text-pp-text [overscroll-behavior-y:none]">
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
        onRestartLevel={() =>
          setToastMessage("Grille réinitialisée — même manifeste et même ordre de placement.")
        }
        onNavigateToMap={() => {
          useLevelRunStore.getState().quitGame();
          router.push("/map");
        }}
      />

      {persistReady && deckUnlocked && !noEnergyOpen ? <MandateTracker /> : null}

      {persistReady && deckUnlocked && !noEnergyOpen ? (
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex w-full shrink-0 flex-col gap-2 px-2 pt-2 md:flex-row md:items-start md:gap-4 md:px-3 md:pt-3">
            <div className="min-w-0 shrink-0 md:w-64">
              <Manifest />
            </div>
            <BoostersBar onToast={setToastMessage} />
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2">
            <Grid />
          </div>

          {status === "playing" && nextTheme && nextType ? (
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
                    {nextType} · tour {turn + 1}/{mandateLen || "—"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      ) : persistReady && !noEnergyOpen ? (
        <main
          className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 py-8"
          aria-hidden
        />
      ) : null}

      {persistReady ? <GameEntryFlow open={!deckUnlocked && lives > 0} /> : null}
      {persistReady ? <EndScreen onShareFeedback={setToastMessage} /> : null}
      <NoEnergyModal
        open={noEnergyOpen}
        onClose={() => {
          setNoEnergyOpen(false);
          router.push("/map");
        }}
      />
      <RulesModal open={rulesOpen} onClose={closeRules} />
      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
      <FiscalFreezeModal open={fiscalModalOpen} onClose={() => setFiscalModalOpen(false)} />
      <Toast message={toastMessage} />
    </div>
  );
}
