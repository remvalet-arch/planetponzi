"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Globe, RotateCcw, Settings, X } from "lucide-react";

import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useProgressStore } from "@/src/store/useProgressStore";

const tap = { scale: 0.92 };

type MapNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MapNavDrawer({ open, onClose }: MapNavDrawerProps) {
  const { t, locale, setLocale } = useAppStrings();
  const resetCareer = useProgressStore((s) => s.resetCareer);

  const handleLanguages = () => {
    const next = locale === "fr" ? "en" : "fr";
    setLocale(next);
    onClose();
  };

  const handleReset = () => {
    if (typeof window === "undefined") return;
    if (window.confirm(t.nav.resetConfirm)) {
      resetCareer();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex" id="map-nav-drawer" role="presentation">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative z-[100] min-h-0 flex-1 bg-slate-950/55 backdrop-blur-[2px]"
            aria-label="Fermer le menu"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="relative z-[101] flex h-full w-[min(100%,20rem)] flex-col border-l border-pp-border-strong bg-pp-surface shadow-2xl"
          >
            <div className="flex min-h-0 items-center justify-between border-b border-pp-border px-3 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
              <p className="font-mono text-xs uppercase tracking-widest text-pp-text-dim">{t.nav.menu}</p>
              <motion.button
                type="button"
                whileTap={tap}
                onClick={onClose}
                className="flex size-11 items-center justify-center rounded-pp-md border border-pp-border-strong bg-pp-elevated text-pp-text hover:bg-pp-surface"
                aria-label="Fermer"
              >
                <X className="size-5" strokeWidth={2} />
              </motion.button>
            </div>
            <nav
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain p-3 pb-12"
              aria-label="Menu carte"
            >
              <Link
                href="/"
                onClick={onClose}
                className="flex min-h-12 items-center rounded-pp-lg border border-pp-border-strong bg-pp-elevated/90 px-4 py-3 font-mono text-sm text-pp-text hover:border-pp-accent/40"
              >
                Accueil
              </Link>
              <Link
                href="/empire"
                onClick={onClose}
                className="flex min-h-12 items-center gap-2 rounded-pp-lg border border-cyan-500/30 bg-slate-900/85 px-4 py-3 font-mono text-sm text-cyan-100 hover:border-cyan-400/50"
              >
                <Building2 className="size-5 shrink-0 text-cyan-300" strokeWidth={2} aria-hidden />
                {t.nav.empire}
              </Link>
              <Link
                href="/settings"
                onClick={onClose}
                className="flex min-h-12 items-center gap-3 rounded-pp-lg border border-pp-border-strong bg-pp-elevated/90 px-4 py-3 font-mono text-sm text-pp-text hover:border-pp-accent/40"
              >
                <Settings className="size-5 shrink-0 text-pp-accent" strokeWidth={2} aria-hidden />
                {t.nav.settings}
              </Link>
              <motion.button
                type="button"
                whileTap={tap}
                onClick={handleLanguages}
                className="flex min-h-12 items-center gap-3 rounded-pp-lg border border-pp-border-strong bg-pp-elevated/90 px-4 py-3 text-left font-mono text-sm text-pp-text hover:border-pp-violet/40"
              >
                <Globe className="size-5 shrink-0 text-pp-violet" strokeWidth={2} aria-hidden />
                {t.nav.languages}
                <span className="ml-auto font-mono text-[10px] text-pp-text-dim">{locale.toUpperCase()}</span>
              </motion.button>
              <motion.button
                type="button"
                whileTap={tap}
                onClick={handleReset}
                className="flex min-h-12 items-center gap-3 rounded-pp-lg border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-left font-mono text-sm text-rose-800 hover:border-rose-500/55"
              >
                <RotateCcw className="size-5 shrink-0 text-rose-600" strokeWidth={2} aria-hidden />
                {t.nav.resetCareer}
              </motion.button>
            </nav>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
