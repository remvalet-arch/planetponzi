"use client";

import { Snowflake } from "lucide-react";

/** Tampon visuel « gel fiscal » pour les directives Board. */
export function RulesVisualFiscalStamp({ label }: { label: string }) {
  return (
    <div
      className="mx-auto flex w-max flex-col items-center gap-1 rounded-xl border-2 border-dashed border-sky-400/50 bg-sky-950/40 px-4 py-3 shadow-inner"
      aria-hidden
    >
      <Snowflake className="size-7 text-sky-300" strokeWidth={1.75} />
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-sky-200/95">
        {label}
      </span>
    </div>
  );
}
