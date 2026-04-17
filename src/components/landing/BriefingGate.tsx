"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Droplets, Gem, Leaf, Rocket, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "pp-saga-briefing-ack-v1";

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
    text: "Source de vie : synergise avec habitacles et serres pour exploser le score.",
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

export function BriefingGate() {
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const ack = localStorage.getItem(STORAGE_KEY);
      setOpen(ack !== "1");
    } catch {
      setOpen(true);
    }
    setHydrated(true);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const canPlay = hydrated && !open;
  const playBlocked = hydrated && open;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-pp-bg">
      <AnimatePresence>
        {hydrated && open ? (
          <motion.div
            key="briefing"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pp-modal-backdrop !z-[120]"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="briefing-title"
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="pp-modal-panel max-w-md border-violet-500/35 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-pp-text shadow-[0_0_60px_rgb(124_58_237/0.35)]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="pp-bottom-sheet-handle bg-white/20" aria-hidden />

              <button
                type="button"
                onClick={dismiss}
                className="pp-btn-icon absolute right-3 top-7 border-white/10 bg-white/5 text-pp-text"
                aria-label="Fermer le briefing"
              >
                <X className="size-5" strokeWidth={2} />
              </button>

              <div className="pp-allow-select min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-2 pt-2">
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
                  Remplissez les quotas d&apos;étoiles de chaque secteur pour progresser.
                </p>

                <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-wide text-cyan-300/90">
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
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-0 flex-1 flex-col px-6 py-6">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto text-pp-text">
          <p className="pp-kicker text-center">Planet Ponzi Saga</p>
          <h1 className="max-w-md text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Puzzle spatial & synergies
          </h1>
          <p className="max-w-sm text-center text-sm text-pp-text-muted">
            Carte 100 niveaux, étoiles, PWA — devenez le CEO de la galaxie.
          </p>
        </div>

        <div className="shrink-0 space-y-2 border-t border-pp-border bg-pp-bg/95 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          {canPlay ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <Link
                href="/map"
                className="pp-tap-bounce flex min-h-14 w-full items-center justify-center rounded-pp-xl border border-pp-border-strong bg-gradient-to-r from-pp-gold via-amber-300 to-pp-gold px-8 py-3 font-mono text-sm font-semibold text-amber-950 shadow-lg hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60"
              >
                Commencer l&apos;aventure
              </Link>
            </motion.div>
          ) : (
            <button
              type="button"
              disabled
              className={`flex min-h-14 w-full items-center justify-center rounded-pp-xl border border-pp-border bg-pp-elevated/60 px-8 py-3 font-mono text-sm font-semibold text-pp-text-dim opacity-80 ${!hydrated ? "cursor-wait" : "cursor-not-allowed"}`}
              aria-describedby="briefing-hint"
            >
              {!hydrated ? "Préparation…" : "Lisez le briefing pour jouer"}
            </button>
          )}
          <p id="briefing-hint" className="text-center font-mono text-[10px] text-pp-text-dim">
            {playBlocked ? "Le bouton Jouer s’active après le briefing." : "\u00a0"}
          </p>
        </div>
      </div>
    </div>
  );
}
