"use client";

import type { ReactNode } from "react";

import { CeoAvatar, type CeoMood } from "@/src/components/ui/CeoAvatar";

export type BoardComicShellVariant = "inline" | "modal";

export type BoardComicShellProps = {
  children: ReactNode;
  mood: CeoMood;
  /** En-tête bulle (optionnel). */
  title?: string;
  /** Pour `aria-labelledby` sur la modale parente. */
  titleId?: string;
  className?: string;
  bubbleClassName?: string;
  avatarSize?: "md" | "lg";
  /**
   * `inline` : avatar + bulle en ligne avec queue (coach in-game).
   * `modale` : panneau pleine largeur, avatar au-dessus du coin, sans queue.
   */
  variant?: BoardComicShellVariant;
  /** Réplique CEO (mode modale) — court texte cynique. */
  dialogueText?: string;
};

/**
 * Enveloppe « visual novel » : avatar CEO + bulle BD.
 */
export function BoardComicShell({
  children,
  mood,
  title,
  titleId,
  className = "",
  bubbleClassName = "",
  avatarSize = "lg",
  variant = "inline",
  dialogueText,
}: BoardComicShellProps) {
  if (variant === "modal") {
    return (
      <div className={`relative mt-8 w-full min-w-0 ${className}`}>
        <div className="pointer-events-none absolute -top-10 left-0 z-30">
          <CeoAvatar
            mood={mood}
            size={avatarSize}
            className="drop-shadow-[0_10px_28px_rgba(0,0,0,0.5)]"
          />
        </div>

        <div
          className={`w-full min-w-0 overflow-visible rounded-xl border-2 border-slate-700 bg-[#14141f] shadow-[0_12px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] ${bubbleClassName}`}
        >
          {dialogueText ? (
            <div className="rounded-t-xl border-b border-slate-700/50 bg-slate-800/30 pb-3 pl-24 pr-4 pt-4 sm:pl-28">
              <p className="m-0 min-w-0 text-sm italic leading-snug text-amber-100 sm:text-[15px] sm:leading-relaxed">
                {dialogueText}
              </p>
            </div>
          ) : null}

          <div className="w-full p-4">
            {title ? (
              <p
                id={titleId}
                className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/95 sm:text-[11px]"
              >
                {title}
              </p>
            ) : null}
            <div className={title ? "mt-2 min-w-0 text-slate-100" : "min-w-0 text-slate-100"}>{children}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full max-w-full min-w-0 flex-row items-end gap-0 ${className}`}>
      <CeoAvatar mood={mood} size={avatarSize} className="relative z-[2] -mr-1 translate-y-1" />

      <div className="relative min-w-0 flex-1 translate-y-0.5">
        <div
          className="absolute bottom-[2.35rem] left-0 z-[1] size-0 -translate-x-full border-y-[9px] border-r-[11px] border-y-transparent border-r-[#14141f] sm:bottom-[2.6rem]"
          aria-hidden
        />
        <div
          className="absolute bottom-[2.35rem] left-[2px] z-0 size-0 -translate-x-full border-y-[8px] border-r-[10px] border-y-transparent border-r-slate-600/90 sm:bottom-[2.6rem]"
          aria-hidden
        />

        <div
          className={`relative rounded-2xl border-2 border-slate-700 bg-[#14141f] px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-4 sm:py-3.5 ${bubbleClassName}`}
        >
          {title ? (
            <p
              id={titleId}
              className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/95 sm:text-[11px]"
            >
              {title}
            </p>
          ) : null}
          <div className={title ? "mt-2 min-w-0 text-slate-100" : "min-w-0 text-slate-100"}>{children}</div>
        </div>
      </div>
    </div>
  );
}
