"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/caftouchstudio";

type BribeDeveloperModalProps = {
  open: boolean;
  title: string;
  body: string;
  bribeLabel: string;
  declineLabel: string;
  onSettled: () => void;
};

export function BribeDeveloperModal({
  open,
  title,
  body,
  bribeLabel,
  declineLabel,
  onSettled,
}: BribeDeveloperModalProps) {
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

  const handleBribe = () => {
    window.open(BUY_ME_A_COFFEE_URL, "_blank", "noopener,noreferrer");
    onSettled();
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="bribe-developer"
          role="presentation"
          className="fixed inset-0 z-[200] flex items-center justify-center overscroll-contain bg-slate-950/98 p-4"
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
            aria-labelledby="bribe-modal-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-emerald-900/50 bg-[#0B0F19] shadow-2xl shadow-black/50 ring-1 ring-white/5"
            initial={{ scale: 0.94, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Briefcase
              className="pointer-events-none absolute left-1/2 top-1/2 size-[min(20rem,78vw)] -translate-x-1/2 -translate-y-1/2 text-emerald-400/10"
              strokeWidth={1}
              aria-hidden
            />
            <div className="relative z-[1] flex flex-col gap-5 px-6 pb-6 pt-8">
              <div>
                <h2
                  id="bribe-modal-title"
                  className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-emerald-300/90"
                >
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-emerald-100/90 sm:text-[0.95rem]">{body}</p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleBribe}
                  className="pp-tap-bounce flex min-h-12 w-full items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-600 px-4 text-sm font-semibold tracking-tight text-white shadow-[0_0_24px_rgb(5_150_105/0.35)] transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300/60"
                >
                  {bribeLabel}
                </button>
                <button
                  type="button"
                  onClick={onSettled}
                  className="pp-tap-bounce py-2 text-center text-sm text-slate-500 underline decoration-slate-600 underline-offset-4 transition-colors hover:text-slate-400"
                >
                  {declineLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
