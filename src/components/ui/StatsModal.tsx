"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { StatsScreen } from "@/src/components/stats/StatsScreen";
import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
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
    <BottomSheetShell
      open={open}
      onClose={onClose}
      panelClassName="shadow-[0_0_32px_rgba(168,85,247,0.08)]"
    >
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

      <div className="pp-modal-scroll px-0 py-0">
        <StatsScreen />
      </div>
    </BottomSheetShell>
  );
}
