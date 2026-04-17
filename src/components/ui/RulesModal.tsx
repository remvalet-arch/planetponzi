"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { RulesSummaryBody } from "@/src/components/ui/RulesSummaryBody";

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
      className="pp-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-modal-title"
        className="pp-modal-panel max-w-md"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pp-bottom-sheet-handle" aria-hidden />
        <div className="pp-modal-header">
          <div className="min-w-0">
            <p className="pp-kicker">Règles</p>
            <h2
              id="rules-modal-title"
              className="mt-1 font-mono text-base font-bold tracking-tight text-pp-text"
            >
              Grille & score
            </h2>
          </div>
          <button type="button" onClick={onClose} className="pp-btn-icon" aria-label="Fermer">
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="pp-allow-select min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-5">
          <RulesSummaryBody />
        </div>
      </div>
    </div>
  );
}
