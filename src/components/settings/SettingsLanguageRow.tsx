"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import type { Locale } from "@/src/lib/i18n/strings";

const STORAGE_KEY = "pp-locale";

export function SettingsLanguageRow() {
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "en" || raw === "fr") setLocale(raw);
    } catch {
      /* ignore */
    }
  }, []);

  const apply = (next: Locale) => {
    setLocale(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-2 rounded-pp-xl border border-slate-700/60 bg-slate-900/55 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Langue</p>
      <div className="flex gap-2">
        {(["fr", "en"] as const).map((loc) => (
          <motion.button
            key={loc}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => apply(loc)}
            className={`flex-1 rounded-pp-lg border px-3 py-2 font-mono text-xs font-semibold transition-colors ${
              locale === loc
                ? "border-cyan-500/50 bg-slate-800/90 text-cyan-300"
                : "border-slate-600/70 bg-slate-950/60 text-slate-400 hover:border-cyan-500/35"
            }`}
          >
            {loc === "fr" ? "Français" : "English"}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
