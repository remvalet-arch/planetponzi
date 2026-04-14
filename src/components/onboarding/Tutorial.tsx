"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getStrings, type Locale } from "@/src/lib/i18n/strings";

export const TUTORIAL_DONE_KEY = "planet-ponzi-tutorial-v1";

export function hasCompletedTutorial(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(TUTORIAL_DONE_KEY) === "1";
}

export function markTutorialCompleted(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TUTORIAL_DONE_KEY, "1");
}

type TutorialStep = {
  id: string;
  title: string;
  body: string;
};

function buildSteps(locale: Locale): TutorialStep[] {
  const s = getStrings(locale).tutorial;
  return [
    { id: "manifest", title: s.step1Title, body: s.step1Body },
    { id: "grid", title: s.step2Title, body: s.step2Body },
    { id: "roi", title: s.step3Title, body: s.step3Body },
  ];
}

type TutorialProps = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  locale?: Locale;
};

/**
 * Tutoriel guidé (première visite) — remplace ou précède la simple modale « Règles ».
 * Design : panneau type terminal luxe, steps avec indicateurs, actions claires.
 */
export function Tutorial({ open, onClose, onComplete, locale = "fr" }: TutorialProps) {
  const steps = buildSteps(locale);
  const s = getStrings(locale).tutorial;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) queueMicrotask(() => setIndex(0));
  }, [open]);

  const goNext = useCallback(() => {
    if (index < steps.length - 1) {
      setIndex((i) => i + 1);
    } else {
      markTutorialCompleted();
      onComplete();
    }
  }, [index, steps.length, onComplete]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <div
      className="pp-modal-backdrop z-[115]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        className="pp-modal-panel max-h-[85dvh] rounded-pp-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pp-modal-header rounded-t-pp-2xl border-pp-border">
          <div className="min-w-0">
            <p className="pp-kicker">Onboarding — capitalisme spatial</p>
            <h2 id="tutorial-title" className="mt-1 font-mono text-sm font-bold uppercase tracking-wide text-pp-text sm:text-base">
              {step.title}
            </h2>
          </div>
          <div className="flex shrink-0 gap-1">
            <button type="button" onClick={onClose} className="pp-btn-icon" aria-label="Fermer">
              <X className="size-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="px-4 py-5">
          <div className="mb-6 flex justify-center gap-2" aria-hidden>
            {steps.map((st, i) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-pp-accent" : "w-2 bg-pp-border-strong hover:bg-pp-text-dim"
                }`}
                aria-label={`Étape ${i + 1}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-mono text-sm leading-relaxed text-pp-text-muted">{step.body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => {
                markTutorialCompleted();
                onClose();
              }}
              className="order-2 font-mono text-xs text-pp-text-dim underline-offset-4 hover:text-pp-text-muted hover:underline sm:order-1"
            >
              {s.skip}
            </button>
            <div className="order-1 flex gap-2 sm:order-2 sm:ml-auto">
              {index > 0 ? (
                <button
                  type="button"
                  onClick={goPrev}
                  className="pp-btn-icon min-w-[2.75rem]"
                  aria-label="Étape précédente"
                >
                  <ChevronLeft className="size-5" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={goNext}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pp-lg border border-pp-accent/40 bg-gradient-to-r from-cyan-950/50 to-emerald-950/40 px-5 font-mono text-sm font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-transform active:scale-[0.99] sm:min-w-[10rem]"
              >
                {isLast ? s.done : s.next}
                {!isLast ? <ChevronRight className="size-4" /> : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
