"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
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

  return (
    <BottomSheetShell
      open={open}
      onClose={onClose}
      panelClassName="pp-modal-panel--dark"
      handleClassName="!bg-slate-600/80 !ring-slate-500/40"
    >
      <div className="pp-modal-header">
        <div className="min-w-0">
          <p className="pp-kicker">Règles</p>
          <h2
            id="rules-modal-title"
            className="mt-1 font-mono text-base font-bold tracking-tight text-white"
          >
            Grille & score
          </h2>
        </div>
        <button type="button" onClick={onClose} className="pp-btn-icon" aria-label="Fermer">
          <X className="size-5" strokeWidth={2} />
        </button>
      </div>

      <div className="pp-modal-scroll pp-allow-select py-5">
        <RulesSummaryBody />
      </div>
    </BottomSheetShell>
  );
}
