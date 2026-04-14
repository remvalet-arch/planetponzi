"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

const FIRST_VISIT_KEY = "planet-ponzi-first-visit";

export function hasSeenRulesFirstVisit(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(FIRST_VISIT_KEY) === "1";
}

export function markRulesFirstVisitDone(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FIRST_VISIT_KEY, "1");
}

type RulesModalProps = {
  open: boolean;
  onClose: () => void;
};

const RULE_ROWS = [
  {
    emoji: "⬛",
    title: "Mine",
    body: "+3M$. Bruyante (annule le score des Habitacles voisins).",
  },
  {
    emoji: "🧑‍🚀",
    title: "Habitacle",
    body: "+2M$. Fragile (vaut 0M$ si voisin d’une Mine).",
  },
  {
    emoji: "🌱",
    title: "Serre",
    body: "+1M$. Synergie (+1M$ par Serre voisine).",
  },
  {
    emoji: "💧",
    title: "Eau",
    body: "0M$. Multiplicateur (+2M$ par Habitacle ou Serre voisin).",
  },
] as const;

export function RulesModal({ open, onClose }: RulesModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="pp-modal-backdrop z-[110]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-modal-title"
        className="pp-modal-panel"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pp-modal-header">
          <div className="min-w-0">
            <p className="pp-kicker">Niveau 0 — conformité narrative</p>
            <h2
              id="rules-modal-title"
              className="mt-1 font-mono text-sm font-bold uppercase leading-snug tracking-wide text-pp-text sm:text-base"
            >
              Manuel de formation interne (confidentiel)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pp-btn-icon"
            aria-label="Fermer le manuel"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <p className="font-mono text-xs leading-relaxed text-pp-text-muted">
            Grille 4×4. Voisinage <span className="text-pp-text">strictement orthogonal</span>{" "}
            (haut / bas / gauche / droite). Pas de téléportation entre fin et début de ligne.
          </p>

          <ul className="space-y-3">
            {RULE_ROWS.map((row) => (
              <li
                key={row.title}
                className="pp-panel-inset flex gap-3 p-3"
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {row.emoji}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wide text-pp-text">
                    {row.title}
                  </p>
                  <p className="mt-1 font-mono text-[11px] leading-relaxed text-pp-text-muted">
                    {row.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="border-t border-dotted border-pp-border-strong pt-3 font-mono text-[10px] uppercase tracking-widest text-pp-text-dim">
            Signature électronique du CEO requise pour toute lecture au-delà de cette ligne. (Non
            requise.)
          </p>
        </div>
      </div>
    </div>
  );
}
