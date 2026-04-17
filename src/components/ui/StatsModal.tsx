"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { StatsScreen } from "@/src/components/stats/StatsScreen";
import { getPlayerStats } from "@/src/lib/stats";

type StatsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function StatsModal({ open, onClose }: StatsModalProps) {
  const stats = open ? getPlayerStats() : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !stats) return null;

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
        aria-labelledby="stats-modal-title"
        className="pp-modal-panel max-w-md shadow-[0_0_32px_rgba(168,85,247,0.08)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pp-bottom-sheet-handle" aria-hidden />
        <div className="pp-modal-header">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-pp-violet/90">
              Local
            </p>
            <h2
              id="stats-modal-title"
              className="mt-1 font-mono text-base font-bold tracking-tight text-pp-text"
            >
              Statistiques
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pp-btn-icon focus-visible:outline-pp-accent/60"
            aria-label="Fermer les statistiques"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <StatsScreen />
        </div>
      </div>
    </div>
  );
}
