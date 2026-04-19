"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Sparkles } from "lucide-react";

import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
import { markRulesFirstVisitDone } from "@/src/components/ui/RulesModal";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { computePassiveModifiers } from "@/src/lib/empire-tower";
import { isFiscalBossLevel } from "@/src/lib/level-run-engine";
import { getLevelById, getSolverLevelContext } from "@/src/lib/levels";
import { estimateMaxScore } from "@/src/lib/solver";
import { markTutorialCompleted } from "@/src/lib/onboarding-flags";
import { useEmpireStore } from "@/src/store/useEmpireStore";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

const thumbPad =
  "border-t border-cyan-500/25 bg-gradient-to-t from-slate-950 via-slate-950 to-indigo-950/90 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 px-4 backdrop-blur-md";

type GameEntryFlowProps = {
  /** Afficher le flux (mandat prêt, exploitation pas encore lancée). */
  open: boolean;
};

/**
 * Avant la partie : cibles d’étoiles + lancement (deck imposé par la définition Saga).
 */
export function GameEntryFlow({ open }: GameEntryFlowProps) {
  const { t } = useAppStrings();
  const seed = useLevelRunStore((s) => s.seed);
  const lockedSeed = useLevelRunStore((s) => s.deckChallengeLockedSeed);
  const levelId = useLevelRunStore((s) => s.levelId);
  const beginPlacement = useLevelRunStore((s) => s.beginPlacement);
  const mineEmpireBonus = useEmpireStore((s) =>
    computePassiveModifiers(s.unlockedNodes).mineScoreBonusPerMine,
  );

  const sheetOpen = open && lockedSeed !== seed;
  const def = levelId > 0 ? getLevelById(levelId) : undefined;

  const maxEstimated = useMemo(() => {
    if (!def) return null;
    return estimateMaxScore(def.seed, def.deckChallengeLevel ?? 0, {
      ...getSolverLevelContext(def),
      mineScoreBonusPerMine: mineEmpireBonus,
    });
  }, [def, mineEmpireBonus]);

  const specialDirectives = useMemo(() => {
    if (!def) return [];
    const lines: string[] = [];
    const wc = def.winCondition;
    const b = t.mandate.buildings;
    if (wc) {
      if (typeof wc.minHabitacle === "number") {
        lines.push(t.entryFlow.directiveMandateMin({ count: wc.minHabitacle, label: b.habitacle }));
      }
      if (typeof wc.minEau === "number") {
        lines.push(t.entryFlow.directiveMandateMin({ count: wc.minEau, label: b.eau }));
      }
      if (typeof wc.minMine === "number") {
        lines.push(t.entryFlow.directiveMandateMin({ count: wc.minMine, label: b.mine }));
      }
      const serreNeed = wc.minSerre ?? wc.minForests;
      if (typeof serreNeed === "number") {
        const label =
          typeof wc.minForests === "number" && typeof wc.minSerre !== "number" ? b.forests : b.serre;
        lines.push(t.entryFlow.directiveMandateMin({ count: serreNeed, label }));
      }
      for (const r of wc.spatialRules ?? []) {
        const label = b[r.building];
        if (r.kind === "isolated") lines.push(t.mandate.spatialIsolatedBrief(label));
        else lines.push(t.mandate.spatialAlignedBrief(label, r.minCount));
      }
    }
    if (def.seismicRift) {
      lines.push(t.entryFlow.directiveSeismic(def.seismicRift.triggerAtTurn));
    }
    if (isFiscalBossLevel(def.id)) {
      lines.push(t.entryFlow.directiveFiscalBoss);
    }
    return lines;
  }, [def, t]);

  const handlePlay = useCallback(() => {
    markRulesFirstVisitDone();
    markTutorialCompleted();
    beginPlacement();
  }, [beginPlacement]);

  const footer = (
    <div className={thumbPad}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={handlePlay}
        disabled={!def}
        className="pp-tap-bounce relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 overflow-hidden rounded-pp-xl border-2 border-cyan-400/50 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-4 font-mono text-sm font-bold text-white shadow-[0_0_28px_rgb(34_211_238/0.35)] transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <motion.span
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <span className="relative">{t.entryFlow.cta}</span>
        <span className="relative text-[11px] font-semibold uppercase tracking-widest text-cyan-100/90">
          {t.entryFlow.ctaSub}
        </span>
      </motion.button>
    </div>
  );

  return (
    <BottomSheetShell
      open={sheetOpen}
      onClose={() => {}}
      onSwipeDismiss={handlePlay}
      closeOnBackdropPress={false}
      backdropClassName="!z-[100]"
      panelClassName="!max-h-[min(92dvh,720px)] flex flex-col overflow-hidden border-t border-x border-violet-500/35 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-slate-100 shadow-[0_0_48px_rgb(124_58_237/0.25)]"
      footer={footer}
      handleClassName="bg-cyan-400/40"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 pb-16 pt-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 shrink-0 text-cyan-300" strokeWidth={2} aria-hidden />
          <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-200/80">
            {t.entryFlow.mandate} · <span className="text-violet-200/90">{seed || "—"}</span>
          </p>
        </div>

        {maxEstimated != null ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 rounded-xl border border-amber-400/35 bg-gradient-to-br from-amber-500/20 via-slate-900/80 to-violet-900/30 px-3 py-2.5 shadow-inner"
          >
            <p className="text-center font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-amber-200/90">
              🎯 {t.entryFlow.maxEstimatedLabel}
            </p>
            <p className="mt-1 text-center font-mono text-xl font-black tabular-nums tracking-tight text-amber-100">
              {maxEstimated} <span className="text-sm font-bold text-amber-200/80">{t.entryFlow.ptsSuffix}</span>
            </p>
          </motion.div>
        ) : null}

        {specialDirectives.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="mt-4 rounded-xl border-2 border-rose-500/45 bg-gradient-to-br from-rose-950/70 via-slate-950/90 to-amber-950/40 px-3 py-3 shadow-[0_0_24px_rgb(244_63_94/0.2)]"
            role="region"
            aria-label={t.entryFlow.specialDirectivesTitle}
          >
            <div className="flex items-center gap-2 border-b border-rose-500/25 pb-2">
              <AlertTriangle className="size-4 shrink-0 text-amber-300" strokeWidth={2.2} aria-hidden />
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-amber-100">
                {t.entryFlow.specialDirectivesTitle}
              </p>
            </div>
            <ul className="mt-2.5 list-none space-y-2 font-mono text-[11px] leading-snug text-rose-50/95 sm:text-xs">
              {specialDirectives.map((line, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-amber-300/90" aria-hidden>
                    ▸
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}

        <h2
          id="entry-flow-title"
          className="mt-5 font-mono text-lg font-bold tracking-tight text-white"
        >
          {t.entryFlow.objectives}
        </h2>

        {def ? (
          <motion.div
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            aria-label={t.entryFlow.objectives}
          >
            {[
              {
                k: "1" as const,
                starCount: 1 as const,
                label: t.entryFlow.starCard1,
                pts: def.stars.one,
                ring: "border-amber-400/45 bg-amber-500/15",
              },
              {
                k: "2" as const,
                starCount: 2 as const,
                label: t.entryFlow.starCard2,
                pts: def.stars.two,
                ring: "border-cyan-400/40 bg-cyan-500/12",
              },
              {
                k: "3" as const,
                starCount: 3 as const,
                label: t.entryFlow.starCard3,
                pts: def.stars.three,
                ring: "border-violet-400/45 bg-violet-500/12",
              },
            ].map((row, i) => (
              <motion.div
                key={row.k}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.04 + i * 0.05, type: "spring", stiffness: 420, damping: 22 }}
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 shadow-md ${row.ring}`}
                title={`${row.label} — ${row.pts} ${t.entryFlow.ptsSuffix}`}
                aria-label={`${row.label}: ${row.pts} ${t.entryFlow.ptsSuffix}`}
              >
                <span
                  className="select-none text-[15px] leading-none tracking-[-0.08em]"
                  aria-hidden
                >
                  {"⭐".repeat(row.starCount)}
                </span>
                <span className="font-mono text-sm font-black tabular-nums text-white">{row.pts}</span>
                <span className="font-mono text-[9px] font-semibold uppercase text-slate-400">
                  {t.entryFlow.ptsSuffix}
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="mt-5 font-mono text-sm text-slate-400">{t.entryFlow.loading}</p>
        )}
      </div>
    </BottomSheetShell>
  );
}
