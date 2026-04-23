"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type MockCorporateAdModalProps = {
  open: boolean;
  quote: string;
  closeLabel: string;
  onSettled: () => void;
};

export function MockCorporateAdModal({ open, quote, closeLabel, onSettled }: MockCorporateAdModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSettled();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onSettled]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mock-rh-ad"
          role="presentation"
          className="fixed inset-0 z-[200] flex items-center justify-center overscroll-contain bg-slate-950/65 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onSettled();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mock-rh-ad-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-900/50 bg-slate-950/90 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-xl"
            initial={{ scale: 0.94, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <AlertTriangle
              className="pointer-events-none absolute left-1/2 top-1/2 size-[min(22rem,85vw)] -translate-x-1/2 -translate-y-1/2 text-rose-400/10"
              strokeWidth={1}
              aria-hidden
            />
            <div className="relative z-[1] flex flex-col gap-6 px-6 pb-6 pt-8 font-sans">
              <p
                id="mock-rh-ad-title"
                className="text-center text-sm font-medium leading-relaxed tracking-tight text-rose-100/90 sm:text-base"
              >
                {quote}
              </p>
              <button
                type="button"
                onClick={onSettled}
                className="pp-tap-bounce flex min-h-12 w-full items-center justify-center rounded-xl border border-rose-500/40 bg-rose-600 px-4 text-sm font-semibold tracking-tight text-white shadow-[0_0_24px_rgb(225_29_72/0.35)] transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300/60"
              >
                {closeLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
