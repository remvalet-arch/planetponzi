import type { ReactNode } from "react";

import {
  formatMultiplierFr,
  getDeckChallengeTitle,
} from "@/src/lib/difficulty";
import { DECK_CHALLENGE_LEVELS, type DeckChallengeLevel } from "@/src/types/game";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-pp-text-dim">
      {children}
    </h3>
  );
}

/** Contenu pédagogique des règles (réutilisé par la modale menu et le flux d’entrée). */
export function RulesSummaryBody() {
  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <SectionTitle>Partie</SectionTitle>
        <p className="font-mono text-xs leading-relaxed text-pp-text-muted">
          4×4 cases. Un bâtiment par tour, dans l’ordre indiqué.{" "}
          <span className="text-pp-text">Voisin</span> = haut, bas, gauche ou droite uniquement (pas
          de diagonale).
        </p>
      </section>

      <section className="space-y-2 border-t border-pp-border pt-4">
        <SectionTitle>ROI affiché</SectionTitle>
        <p className="font-mono text-xs leading-relaxed text-pp-text-muted">
          On additionne les M$ de chaque case occupée, puis on multiplie par le coefficient du mode
          choisi. Résultat <span className="text-pp-text">arrondi à l’unité</span>.
        </p>
        <ul className="divide-y divide-pp-border font-mono text-[11px] text-pp-text-muted">
          {DECK_CHALLENGE_LEVELS.map((lvl) => (
            <li key={lvl} className="flex items-center justify-between gap-3 py-2">
              <span className="text-pp-text">{getDeckChallengeTitle(lvl as DeckChallengeLevel)}</span>
              <span className="shrink-0 tabular-nums text-pp-accent">
                {formatMultiplierFr(lvl as DeckChallengeLevel)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 border-t border-pp-border pt-4">
        <SectionTitle>M$ par case (une fois la case remplie)</SectionTitle>
        <ul className="space-y-2.5 font-mono text-[11px] leading-snug text-pp-text-muted">
          <li className="flex gap-2">
            <span className="shrink-0 text-lg leading-none" aria-hidden>
              ⬛
            </span>
            <span>
              <span className="font-semibold text-pp-text">Mine</span> — +3 M$ (fixe).
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-lg leading-none" aria-hidden>
              🧑‍🚀
            </span>
            <span>
              <span className="font-semibold text-pp-text">Habitacle</span> — +2 M$, ou{" "}
              <span className="text-pp-negative">0 M$</span> si une mine touche la case (voisin
              direct).
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-lg leading-none" aria-hidden>
              🌱
            </span>
            <span>
              <span className="font-semibold text-pp-text">Serre</span> — 1 M$ +{" "}
              <span className="text-pp-text">1 M$</span> par autre serre sur une case voisine directe.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-lg leading-none" aria-hidden>
              💧
            </span>
            <span>
              <span className="font-semibold text-pp-text">Eau</span> —{" "}
              <span className="text-pp-text">+2 M$</span> par habitacle ou serre sur une case voisine
              directe (sinon 0 M$).
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
