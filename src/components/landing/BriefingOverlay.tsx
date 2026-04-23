"use client";

import { motion } from "framer-motion";
import { Building2, Droplets, Gem, Leaf, Rocket, Sparkles, X } from "lucide-react";

import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
import { ContractIcon } from "@/src/components/ui/ContractIcon";
import { setBriefingAcked } from "@/src/lib/briefing-flags";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

const tileRows = [
  {
    type: "Habitacle",
    emoji: "🧑‍🚀",
    Icon: Building2,
    text: "Accueille vos colons : bonus quand il touche de l’eau ou de la verdure.",
    accent: "text-orange-300",
  },
  {
    type: "Eau",
    emoji: "💧",
    Icon: Droplets,
    text: "Source de vie : synergise avec habitacles et serres pour doper la valorisation M$.",
    accent: "text-sky-300",
  },
  {
    type: "Serre",
    emoji: "🌱",
    Icon: Leaf,
    text: "Production verte : combo avec l’eau et les voisins habités.",
    accent: "text-lime-300",
  },
  {
    type: "Mine",
    emoji: "⬛",
    Icon: Gem,
    text: "Ressource brute : haut risque / haute récompense selon le placement.",
    accent: "text-violet-300",
  },
] as const;

const thumbPad =
  "shrink-0 border-t border-white/10 bg-slate-950/80 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md";

type BriefingOverlayProps = {
  open: boolean;
  onComplete: () => void;
};

/** Briefing CEO en bottom sheet (première visite depuis l’écran d’accueil). */
const BRIEFING_CONTRACT_DEMOS = [
  { briefcases: 1, valor: 23 },
  { briefcases: 2, valor: 39 },
  { briefcases: 3, valor: 56 },
] as const;

export function BriefingOverlay({ open, onComplete }: BriefingOverlayProps) {
  const { t } = useAppStrings();
  const dismiss = () => {
    setBriefingAcked();
    onComplete();
  };

  return (
    <BottomSheetShell
      open={open}
      onClose={dismiss}
      closeOnBackdropPress={false}
      backdropClassName="!z-[100]"
      panelClassName="border-violet-500/35 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-pp-text shadow-[0_0_60px_rgb(124_58_237/0.35)]"
      handleClassName="bg-white/20"
    >
      <button
        type="button"
        onClick={dismiss}
        className="pp-btn-icon absolute right-2 top-[max(1rem,env(safe-area-inset-top))] z-[1] min-h-[44px] min-w-[44px] border-white/10 bg-white/5 text-pp-text"
        aria-label="Fermer le briefing"
      >
        <X className="size-5" strokeWidth={2} />
      </button>

      <div className="pp-allow-select min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-14 pt-2">
        <div className="mb-3 flex items-center gap-2 text-violet-300">
          <Sparkles className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em]">Briefing CEO</span>
        </div>

        <h2 id="briefing-title" className="pr-10 text-xl font-bold tracking-tight text-white">
          Bienvenue chez Ponzi Corp
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-slate-200/95">
          Félicitations pour votre embauche chez Ponzi Corp ! Votre mission : exploiter
          l&apos;univers. Placez vos bâtiments, créez des synergies, ignorez l&apos;écologie.
          Remplissez les quotas de contrats de chaque secteur pour progresser.
        </p>

        <p className="mt-5 font-mono text-lg font-bold tracking-tight text-white">{t.entryFlow.objectives}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">{t.briefing.contractTiersBlurb}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {BRIEFING_CONTRACT_DEMOS.map(({ briefcases, valor }) => (
            <span
              key={valor}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/55 bg-slate-900/70 px-3 py-1.5 font-mono text-xs text-slate-100 shadow-md backdrop-blur-sm"
            >
              <ContractIcon count={briefcases as 1 | 2 | 3} size="md" seal="gold" className="shrink-0" />
              <span className="font-black tabular-nums text-white">{valor}</span>
              <span className="text-[9px] font-semibold uppercase text-slate-400">{t.entryFlow.msUnit}</span>
            </span>
          ))}
        </div>

        <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-wide text-cyan-300/90">
          Les 4 tuiles
        </p>

        <ul className="mt-3 space-y-3">
          {tileRows.map(({ type, emoji, Icon, text, accent }) => (
            <li
              key={type}
              className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm"
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-b from-white/15 to-white/5 text-lg shadow-inner ${accent}`}
              >
                <span className="sr-only">{type}</span>
                <span aria-hidden>{emoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`flex items-center gap-1.5 text-sm font-bold ${accent}`}>
                  <Icon className="size-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                  {type}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={thumbPad}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={dismiss}
          className="pp-tap-bounce flex min-h-14 w-full items-center justify-center gap-2 rounded-pp-xl border border-cyan-400/40 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-4 py-3 font-mono text-sm font-semibold text-white shadow-lg hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300/70"
        >
          <Rocket className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          J&apos;ai compris — conquérir la galaxie
        </motion.button>
      </div>
    </BottomSheetShell>
  );
}
