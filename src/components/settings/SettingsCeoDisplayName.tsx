"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { getSupabaseBrowser } from "@/src/lib/supabase";
import { useProgressStore } from "@/src/store/useProgressStore";

const MAX = 15;

export function SettingsCeoDisplayName() {
  const { t } = useAppStrings();
  const guestPseudo = useProgressStore((s) => s.pseudo);
  const setPseudo = useProgressStore((s) => s.setPseudo);
  const [hasAuth, setHasAuth] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<"idle" | "ok" | "err" | "empty">("idle");

  const syncFromStores = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setHasAuth(false);
      setValue((guestPseudo ?? "").slice(0, MAX));
      return;
    }
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (session?.user) {
      setHasAuth(true);
      const { data } = await sb
        .from("profiles")
        .select("display_name")
        .eq("user_id", session.user.id)
        .maybeSingle();
      const dn = typeof data?.display_name === "string" ? data.display_name.trim() : "";
      setValue(dn.slice(0, MAX) || (guestPseudo ?? "").slice(0, MAX));
    } else {
      setHasAuth(false);
      setValue((guestPseudo ?? "").slice(0, MAX));
    }
  }, [guestPseudo]);

  useEffect(() => {
    void syncFromStores();
  }, [syncFromStores]);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(() => {
      void syncFromStores();
    });
    return () => subscription.unsubscribe();
  }, [syncFromStores]);

  const save = async () => {
    const trimmed = value.trim().slice(0, MAX);
    if (!trimmed) {
      setHint("empty");
      return;
    }
    setHint("idle");
    const sb = getSupabaseBrowser();
    if (sb) {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (session?.user) {
        setLoading(true);
        const { error } = await sb.from("profiles").upsert(
          {
            user_id: session.user.id,
            display_name: trimmed,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        setLoading(false);
        if (error) {
          console.warn("[settings] profiles upsert:", error.message);
          setHint("err");
          return;
        }
      }
    }
    setPseudo(trimmed);
    setHint("ok");
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-pp-xl border border-slate-700/60 bg-slate-900/55 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{t.ceoDisplayName.kicker}</p>
      <h2 className="font-mono text-sm font-bold text-slate-100">{t.ceoDisplayName.title}</h2>
      <p className="font-mono text-xs leading-relaxed text-slate-400">
        {hasAuth ? t.ceoDisplayName.bodyAuth : t.ceoDisplayName.bodyGuest}
      </p>
      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500" htmlFor="settings-ceo-name">
        {t.ceoDisplayName.label}
      </label>
      <input
        id="settings-ceo-name"
        type="text"
        maxLength={MAX}
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX))}
        placeholder={t.ceoDisplayName.placeholder}
        className="rounded-pp-lg border border-slate-600/80 bg-slate-950/80 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
      />
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        onClick={() => void save()}
        className="rounded-pp-lg border border-cyan-500/45 bg-cyan-500/10 px-4 py-2.5 font-mono text-xs font-semibold text-cyan-300 disabled:opacity-50"
      >
        {loading ? "…" : t.ceoDisplayName.save}
      </motion.button>
      {hint === "ok" ? <p className="font-mono text-xs text-cyan-400">{t.ceoDisplayName.saved}</p> : null}
      {hint === "err" ? <p className="font-mono text-xs text-red-400">{t.ceoDisplayName.error}</p> : null}
      {hint === "empty" ? <p className="font-mono text-xs text-amber-200/90">{t.ceoDisplayName.empty}</p> : null}
    </div>
  );
}
