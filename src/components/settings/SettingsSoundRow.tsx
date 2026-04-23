"use client";

import { useEffect, useState } from "react";

import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { useSettingsStore } from "@/src/store/useSettingsStore";

export function SettingsSoundRow() {
  const { t } = useAppStrings();
  const storeEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const on = mounted ? storeEnabled : true;

  return (
    <div className="flex w-full max-w-sm flex-col gap-2 rounded-pp-xl border border-slate-700/60 bg-slate-900/55 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
        {t.settingsAudio.sectionTitle}
      </p>
      <p className="font-mono text-xs leading-relaxed text-slate-400">{t.settingsAudio.soundBody}</p>
      <div className="mt-1 flex items-center justify-between gap-4 rounded-pp-lg border border-slate-600/50 bg-slate-950/50 px-3 py-3">
        <span className="font-mono text-sm font-semibold text-slate-200" id="pp-sound-label">
          {t.settingsAudio.soundLabel}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby="pp-sound-label"
          onClick={() => setSoundEnabled(!on)}
          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border border-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/70 ${
            on ? "bg-emerald-600/90" : "bg-slate-700"
          }`}
        >
          <span
            className={`pointer-events-none absolute left-1 top-1 size-5 rounded-full bg-white shadow transition-transform ${
              on ? "translate-x-5" : "translate-x-0"
            }`}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
