"use client";

import { type FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { getSupabaseBrowser } from "@/src/lib/supabase";

export function CloudAuthSection() {
  const { t } = useAppStrings();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    void sb.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null);
    });
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (!session) setSent(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const sb = getSupabaseBrowser();
  if (!sb) {
    return <p className="font-mono text-xs leading-relaxed text-pp-text-muted">{t.cloudSave.missingEnv}</p>;
  }

  const onMagic = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const origin = window.location.origin;
      const { error: err } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${origin}/settings` },
      });
      if (err) throw err;
      setSent(true);
    } catch {
      setError(t.cloudSave.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => {
    setError(null);
    void sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/settings` },
    });
  };

  if (userEmail) {
    return (
      <div className="flex flex-col gap-3">
        <p className="break-all font-mono text-sm text-pp-text">{t.cloudSave.signedInAs(userEmail)}</p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => void sb.auth.signOut()}
          className="rounded-pp-lg border border-pp-border bg-pp-surface/60 px-4 py-2.5 font-mono text-xs font-semibold text-pp-text hover:border-pp-accent/40"
        >
          {t.cloudSave.signOut}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onMagic} className="flex flex-col gap-2">
        <label className="font-mono text-[10px] uppercase tracking-widest text-pp-text-dim" htmlFor="cloud-email">
          {t.cloudSave.emailLabel}
        </label>
        <input
          id="cloud-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder={t.cloudSave.emailPlaceholder}
          className="rounded-pp-lg border border-pp-border bg-pp-surface/80 px-3 py-2 font-mono text-sm text-pp-text placeholder:text-pp-text-dim focus:border-pp-accent focus:outline-none"
        />
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="rounded-pp-lg border border-pp-accent bg-pp-accent/15 px-4 py-2.5 font-mono text-xs font-semibold text-pp-accent disabled:opacity-50"
        >
          {loading ? "…" : t.cloudSave.sendMagicLink}
        </motion.button>
      </form>
      <div className="relative py-1 text-center font-mono text-[10px] uppercase tracking-widest text-pp-text-dim">
        <span className="bg-pp-elevated/60 px-2">{t.cloudSave.orDivider}</span>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onGoogle}
        className="rounded-pp-lg border border-pp-border bg-pp-surface/80 px-4 py-2.5 font-mono text-xs font-semibold text-pp-text hover:border-pp-accent/40"
      >
        {t.cloudSave.googleCta}
      </motion.button>
      {sent ? (
        <p className="font-mono text-xs text-pp-accent">{t.cloudSave.magicLinkSent}</p>
      ) : null}
      {error ? <p className="font-mono text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
