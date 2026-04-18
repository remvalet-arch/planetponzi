"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { BriefingOverlay } from "@/src/components/landing/BriefingOverlay";
import { CEOContractModal } from "@/src/components/landing/CEOContractModal";
import { isBriefingAcked } from "@/src/lib/briefing-flags";
import { useProgressStore } from "@/src/store/useProgressStore";

function starfieldCss(opacity: number): string {
  const dots: string[] = [];
  const seeds = [11, 17, 23, 29, 31, 37, 41, 43];
  for (let i = 0; i < 56; i++) {
    const x = ((i * 17 + seeds[i % 8]) % 100) + (i % 3) * 0.6;
    const y = ((i * 23 + seeds[(i + 3) % 8]) % 100) + ((i * 7) % 5) * 0.35;
    const c = i % 6 === 0 ? "255 250 180" : "255 255 255";
    dots.push(`radial-gradient(1.1px 1.1px at ${x}% ${y}%, rgb(${c} / ${opacity}) 50%, transparent 52%)`);
  }
  return dots.join(", ");
}

const floatTitle = {
  animate: { y: [0, -10, 0] },
  transition: { duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" as const },
};

const pulseCta = {
  animate: { opacity: [0.55, 1, 0.55], scale: [0.98, 1, 0.98] },
  transition: { duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" as const },
};

export function HomeSplash() {
  const router = useRouter();
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ceoOpen, setCeoOpen] = useState(false);

  useEffect(() => {
    const syncIdentity = () => {
      if (!useProgressStore.persist.hasHydrated()) return;
      const st = useProgressStore.getState();
      if (!st.playerId) {
        useProgressStore.setState({ playerId: crypto.randomUUID() });
      }
      const after = useProgressStore.getState();
      if (!after.pseudo) setCeoOpen(true);
    };
    const unsub = useProgressStore.persist.onFinishHydration(syncIdentity);
    syncIdentity();
    return unsub;
  }, []);

  const goMap = useCallback(() => {
    router.push("/map");
  }, [router]);

  const handleTapStart = useCallback(() => {
    if (busy) return;
    setBusy(true);
    if (isBriefingAcked()) {
      goMap();
      return;
    }
    setBriefingOpen(true);
  }, [busy, goMap]);

  const handleBriefingDone = useCallback(() => {
    setBriefingOpen(false);
    goMap();
  }, [goMap]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#070b14] text-pp-text">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage: `${starfieldCss(0.5)}, ${starfieldCss(0.28)}`,
          backgroundSize: "100% 100%, 115% 115%",
          backgroundPosition: "0 0, 8% 6%",
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage: starfieldCss(0.2),
          backgroundSize: "130% 130%",
          backgroundPosition: "20% 10%",
        }}
        animate={{ backgroundPosition: ["20% 10%", "22% 12%", "20% 10%"] }}
        transition={{ duration: 28, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-8 pt-[max(3rem,calc(env(safe-area-inset-top)+2.5rem))]">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div {...floatTitle}>
            <p className="pp-kicker mb-2 text-cyan-300/90">Planet Ponzi</p>
            <h1 className="max-w-lg bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
              Planet Ponzi Saga
            </h1>
          </motion.div>
          <p className="mt-5 max-w-sm font-mono text-xs leading-relaxed text-slate-400">
            Conquête · synergies · 100 secteurs
          </p>
        </motion.div>

        <motion.button
          type="button"
          {...pulseCta}
          disabled={busy && !briefingOpen}
          onClick={handleTapStart}
          className="relative z-[2] mt-14 min-h-[3.25rem] rounded-2xl border border-cyan-400/35 bg-gradient-to-r from-violet-600/90 via-fuchsia-600/85 to-cyan-600/90 px-10 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_40px_rgb(34_211_238/0.35)] backdrop-blur-sm transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300/70 disabled:opacity-60"
        >
          Tap to Start
        </motion.button>
      </div>

      <BriefingOverlay open={briefingOpen} onComplete={handleBriefingDone} />
      <CEOContractModal open={ceoOpen} onClose={() => setCeoOpen(false)} />
    </div>
  );
}
