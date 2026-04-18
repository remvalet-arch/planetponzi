"use client";

import { useEffect, useRef } from "react";

import { getOrCreateDeviceId } from "@/src/lib/device-id";
import {
  computeCloudMerge,
  fetchCloudPlayerSave,
  syncSaveToCloud,
  type EconomyPersistSlice,
  type ProgressPersistSlice,
} from "@/src/lib/cloud-save";
import { getSupabaseBrowser } from "@/src/lib/supabase";
import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useProgressStore } from "@/src/store/useProgressStore";

const UPLOAD_DEBOUNCE_MS = 3200;

function pickProgress(): ProgressPersistSlice {
  const s = useProgressStore.getState();
  return {
    unlockedLevels: s.unlockedLevels,
    starsByLevel: s.starsByLevel,
    bestScoreByLevel: s.bestScoreByLevel,
    boosters: s.boosters,
    prestigeLevel: s.prestigeLevel,
    hasSeenFiscalFreezeTutorial: s.hasSeenFiscalFreezeTutorial,
  };
}

function pickEconomy(): EconomyPersistSlice {
  const s = useEconomyStore.getState();
  return {
    coins: s.coins,
    lives: s.lives,
    lastLifeRechargeTime: s.lastLifeRechargeTime,
    lastBonusDate: s.lastBonusDate,
  };
}

/**
 * Télécharge / fusionne la sauvegarde cloud au login, puis upload débouncé
 * sur les changements progression + économie (utilisateur connecté uniquement).
 */
export function CloudSaveSyncProvider({ children }: { children: React.ReactNode }) {
  const applyingCloud = useRef(false);
  const debounceRef = useRef<number | null>(null);
  const userIdRef = useRef<string | null>(null);
  const subsAttached = useRef(false);
  const unsubProgressRef = useRef<(() => void) | null>(null);
  const unsubEcoRef = useRef<(() => void) | null>(null);
  /** Auth peut arriver avant la fin de la réhydratation localStorage — on retarde le merge cloud. */
  const pendingUidRef = useRef<string | null>(null);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;

    const clearDebounce = () => {
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };

    const scheduleUpload = () => {
      if (!userIdRef.current || applyingCloud.current) return;
      clearDebounce();
      debounceRef.current = window.setTimeout(() => {
        debounceRef.current = null;
        const client = getSupabaseBrowser();
        if (!client || !userIdRef.current) return;
        void (async () => {
          const {
            data: { session },
          } = await client.auth.getSession();
          const uid = session?.user?.id;
          if (!uid) return;
          await syncSaveToCloud(client, uid, pickProgress(), pickEconomy());
        })();
      }, UPLOAD_DEBOUNCE_MS);
    };

    const attachStoreSubs = () => {
      if (subsAttached.current) return;
      if (!useProgressStore.persist.hasHydrated() || !useEconomyStore.persist.hasHydrated()) return;
      subsAttached.current = true;
      unsubProgressRef.current = useProgressStore.subscribe(() => {
        if (userIdRef.current && !applyingCloud.current) scheduleUpload();
      });
      unsubEcoRef.current = useEconomyStore.subscribe(() => {
        if (userIdRef.current && !applyingCloud.current) scheduleUpload();
      });
    };

    const flushPendingDownload = () => {
      const uid = pendingUidRef.current;
      if (!uid) return;
      if (!useProgressStore.persist.hasHydrated() || !useEconomyStore.persist.hasHydrated()) return;
      pendingUidRef.current = null;
      void runDownload(uid);
    };

    const runDownloadWhenReady = (uid: string) => {
      if (!useProgressStore.persist.hasHydrated() || !useEconomyStore.persist.hasHydrated()) {
        pendingUidRef.current = uid;
        return;
      }
      pendingUidRef.current = null;
      void runDownload(uid);
    };

    const attachDeviceAndHydrateDisplayName = async (uid: string, accessToken: string | undefined) => {
      if (accessToken) {
        try {
          const attachKey = `pp-gc-attach-${uid}`;
          if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(attachKey)) {
            const deviceId = getOrCreateDeviceId();
            const res = await fetch("/api/game-completions/attach", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ deviceId }),
            });
            if (res.ok && typeof sessionStorage !== "undefined") {
              sessionStorage.setItem(attachKey, "1");
            }
          }
        } catch {
          /* offline / non bloquant */
        }
      }
      try {
        const { data, error } = await sb
          .from("profiles")
          .select("display_name")
          .eq("user_id", uid)
          .maybeSingle();
        if (error) return;
        const name = typeof data?.display_name === "string" ? data.display_name.trim() : "";
        if (name) {
          useProgressStore.setState({ pseudo: name.slice(0, 15) });
        }
      } catch {
        /* table absente / hors-ligne */
      }
    };

    const runDownload = async (uid: string) => {
      userIdRef.current = uid;
      const cloud = await fetchCloudPlayerSave(sb, uid);
      const localP = pickProgress();
      const localE = pickEconomy();

      if (!cloud) {
        await syncSaveToCloud(sb, uid, localP, localE);
        return;
      }

      const { progressPatch, economyPatch } = computeCloudMerge(localP, localE, cloud);
      if (!progressPatch && !economyPatch) return;

      applyingCloud.current = true;
      if (progressPatch) useProgressStore.setState(progressPatch);
      if (economyPatch) useEconomyStore.setState(economyPatch);
      queueMicrotask(() => {
        applyingCloud.current = false;
        useEconomyStore.getState().checkLifeRecharge();
      });
    };

    const tryHydratedAuth = () => {
      attachStoreSubs();
      flushPendingDownload();
    };

    const unsubProgHydrate = useProgressStore.persist.onFinishHydration(tryHydratedAuth);
    const unsubEcoHydrate = useEconomyStore.persist.onFinishHydration(tryHydratedAuth);
    tryHydratedAuth();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        pendingUidRef.current = null;
        userIdRef.current = null;
        clearDebounce();
        return;
      }
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        const uid = session?.user?.id;
        if (uid) {
          runDownloadWhenReady(uid);
          void attachDeviceAndHydrateDisplayName(uid, session.access_token);
        } else {
          pendingUidRef.current = null;
          userIdRef.current = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubProgHydrate();
      unsubEcoHydrate();
      clearDebounce();
      unsubProgressRef.current?.();
      unsubEcoRef.current?.();
      unsubProgressRef.current = null;
      unsubEcoRef.current = null;
      subsAttached.current = false;
      pendingUidRef.current = null;
      userIdRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
