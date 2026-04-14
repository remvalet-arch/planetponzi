"use client";

import { BookOpen } from "lucide-react";

import {
  formatMultiplierFr,
  getDeckChallengeTitle,
} from "@/src/lib/difficulty";
import { DECK_CHALLENGE_LEVELS, type DeckChallengeLevel } from "@/src/types/game";
import { useGameStore } from "@/src/store/useGameStore";

type DeckDifficultyGateProps = {
  onOpenRules: () => void;
};

/**
 * Bloque toute la page tant que la difficulté n’est pas choisie pour la date courante,
 * afin qu’on ne puisse pas voir le manifeste puis changer de mode pour tricher.
 */
export function DeckDifficultyGate({ onOpenRules }: DeckDifficultyGateProps) {
  const seed = useGameStore((s) => s.seed);
  const lockedSeed = useGameStore((s) => s.deckChallengeLockedSeed);
  const confirmDeckDifficulty = useGameStore((s) => s.confirmDeckDifficulty);

  if (lockedSeed === seed) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-y-auto bg-pp-bg px-4 py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deck-gate-title"
    >
      <div className="w-full max-w-md rounded-pp-2xl border border-pp-border-strong bg-pp-elevated/60 p-5 shadow-pp-modal">
        <p className="pp-kicker">
          Mandat {seed}
        </p>
        <h1
          id="deck-gate-title"
          className="mt-2 font-mono text-lg font-bold leading-snug text-pp-text sm:text-xl"
        >
          Choisissez votre niveau d’information logistique
        </h1>
        <p className="mt-3 font-mono text-xs leading-relaxed text-pp-text-muted">
          Sans validation, aucun manifeste ni grille ne s’affiche. Dès qu’au moins une ligne est
          masquée, ce sont <span className="text-neutral-200">au moins 2 comptes</span> (sinon la
          somme à 16 cartes révèle le dernier type). Après votre choix, la difficulté est{" "}
          <span className="text-pp-text">verrouillée pour la journée</span> (même en
          recommençant la grille).
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {DECK_CHALLENGE_LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => confirmDeckDifficulty(lvl as DeckChallengeLevel)}
              className="min-h-14 rounded-pp-xl border border-pp-border-strong bg-pp-bg/80 px-4 py-3 text-left font-mono text-sm text-pp-text transition-colors hover:border-pp-accent/50 hover:bg-cyan-950/25 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60"
            >
              <span className="font-semibold text-cyan-100">
                {getDeckChallengeTitle(lvl)}
              </span>
              <span className="mt-1 block text-[11px] text-pp-text-muted">
                {lvl === 0
                  ? "Manifeste complet — les 4 effectifs visibles"
                  : `${lvl} comptes masqués au hasard (seed du jour) · bonus ${formatMultiplierFr(lvl)}`}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenRules}
          className="pp-btn-ghost mt-6 gap-2"
        >
          <BookOpen className="size-4 text-cyan-400" strokeWidth={2} aria-hidden />
          Consulter le manuel (sans manifeste)
        </button>
      </div>
    </div>
  );
}
