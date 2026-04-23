"use client";

import Link from "next/link";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { HubShellBar } from "@/src/components/layout/HubShellBar";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

export function SupportShell() {
  const { t } = useAppStrings();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0B0F19] text-slate-100">
      <HubShellBar title={t.nav.support} variant="dark" />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto overscroll-y-contain px-6 py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300/90">Merci</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Un mot du développeur</h1>
          <p className="mt-4 font-mono text-sm leading-relaxed text-slate-400">
            Merci d&apos;avoir joué à <span className="font-semibold text-slate-100">Planet Ponzi Saga</span>.
            Si le jeu vous a fait sourire (ou rager sur une grille), un petit soutien aide à garder le projet
            vivant : correctifs, niveaux, et idées un peu trop ambitieuses.
          </p>
        </div>

        <a
          href="https://buymeacoffee.com/caftouchstudio"
          target="_blank"
          rel="noopener noreferrer"
          className="pp-tap-bounce inline-flex min-h-14 items-center justify-center rounded-pp-xl border-2 border-amber-500/50 bg-gradient-to-r from-pp-gold via-amber-300 to-pp-gold px-8 py-3 font-mono text-sm font-bold text-amber-950 shadow-xl hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pp-accent/60"
        >
          Buy me a Coffee
        </a>

        <p className="font-mono text-[11px] text-slate-500">
          Lien externe — s&apos;ouvre dans un nouvel onglet
        </p>

        <Link
          href="/map"
          className="font-mono text-sm text-cyan-400 underline-offset-4 hover:underline"
        >
          {t.nav.backToMap}
        </Link>
      </div>
      <BottomNav variant="dark" />
    </div>
  );
}
