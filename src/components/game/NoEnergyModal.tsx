"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BottomSheetShell } from "@/src/components/ui/BottomSheetShell";
import { WEB_SHARE_TITLE } from "@/src/lib/share-branding";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { getLocalDateSeed } from "@/src/lib/rng";
import { useEconomyStore } from "@/src/store/useEconomyStore";

const SHARE_LIFE_STORAGE_PREFIX = "pp-share-for-life-";

function shareLifeStorageKey(): string {
  return `${SHARE_LIFE_STORAGE_PREFIX}${getLocalDateSeed()}`;
}

function hasClaimedShareLifeToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(shareLifeStorageKey()) === "1";
  } catch {
    return false;
  }
}

function markShareLifeClaimed(): void {
  try {
    window.localStorage.setItem(shareLifeStorageKey(), "1");
  } catch {
    /* ignore */
  }
}

type NoEnergyModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NoEnergyModal({ open, onClose }: NoEnergyModalProps) {
  const { t } = useAppStrings();
  const addLives = useEconomyStore((s) => s.addLives);
  const [usedToday, setUsedToday] = useState(() => hasClaimedShareLifeToday());

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setUsedToday(hasClaimedShareLifeToday()));
  }, [open]);

  const gameUrl = useMemo(() => {
    if (typeof window === "undefined") {
      const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/?$/, "") ?? "https://planetponzi.vercel.app";
      return `${base}/`;
    }
    return `${window.location.origin}/`;
  }, []);

  const shareText = useMemo(() => t.energy.shareCopy(gameUrl), [gameUrl, t]);

  const grantAndClose = useCallback(() => {
    if (hasClaimedShareLifeToday()) return;
    markShareLifeClaimed();
    addLives(1);
    setUsedToday(true);
    onClose();
  }, [addLives, onClose]);

  const openTwitterIntent = useCallback(() => {
    const q = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${q}`, "_blank", "noopener,noreferrer");
  }, [shareText]);

  const handleShareForLife = useCallback(async () => {
    if (usedToday || hasClaimedShareLifeToday()) return;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: WEB_SHARE_TITLE,
          text: shareText,
          url: gameUrl,
        });
        grantAndClose();
        return;
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }

    openTwitterIntent();
    grantAndClose();
  }, [gameUrl, grantAndClose, openTwitterIntent, shareText, usedToday]);

  const handleTwitterOnly = useCallback(() => {
    if (usedToday || hasClaimedShareLifeToday()) return;
    openTwitterIntent();
    grantAndClose();
  }, [grantAndClose, openTwitterIntent, usedToday]);

  const footer = (
    <div className="pp-modal-footer flex flex-col gap-2 border-rose-500/20 bg-slate-950/95">
      <Link
        href="/shop"
        onClick={onClose}
        className="flex min-h-12 items-center justify-center rounded-pp-lg border border-amber-400/40 bg-gradient-to-r from-amber-600/90 via-amber-500/85 to-yellow-500/90 px-4 font-mono text-sm font-bold uppercase tracking-widest text-slate-950 shadow-[0_0_24px_rgb(251_191_36/0.25)] transition-[filter] hover:brightness-110"
      >
        {t.nav.shop}
      </Link>
      <button
        type="button"
        disabled={usedToday}
        onClick={() => void handleShareForLife()}
        className="flex min-h-12 items-center justify-center rounded-pp-lg border border-emerald-500/45 bg-emerald-950/50 px-4 font-mono text-sm font-bold uppercase tracking-wide text-emerald-100 transition-colors hover:bg-emerald-900/55 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {usedToday ? t.energy.shareForLifeUsed : t.energy.shareForLife}
      </button>
      {typeof navigator !== "undefined" && typeof navigator.share === "function" && !usedToday ? (
        <button
          type="button"
          onClick={() => void handleTwitterOnly()}
          className="flex min-h-11 w-full items-center justify-center rounded-pp-lg border border-emerald-500/30 bg-slate-900/60 px-4 py-2.5 font-mono text-xs text-emerald-200/90 transition-colors hover:border-emerald-400/40 hover:bg-slate-800/80"
        >
          {t.energy.shareTwitter}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onClose}
        className="flex min-h-12 w-full items-center justify-center rounded-pp-lg border border-slate-600/60 bg-slate-900/50 px-4 py-2.5 font-mono text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800/70"
      >
        {t.energy.dismiss}
      </button>
    </div>
  );

  return (
    <BottomSheetShell
      open={open}
      onClose={onClose}
      closeOnBackdropPress
      footer={footer}
      panelClassName="pp-modal-panel--dark"
      handleClassName="!bg-slate-600/80 !ring-slate-500/40"
    >
      <div className="pp-modal-scroll pt-1 text-slate-100">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-rose-300/90">{t.energy.kicker}</p>
          <h2 className="mt-2 font-mono text-lg font-bold text-white">{t.energy.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{t.energy.body}</p>
          {!usedToday ? (
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-500">{t.energy.shareForLifeHint}</p>
          ) : null}
        </div>
      </div>
    </BottomSheetShell>
  );
}
