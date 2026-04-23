"use client";

import { useEffect, useRef } from "react";

import { useEconomyStore } from "@/src/store/useEconomyStore";
import { useEmpireStore } from "@/src/store/useEmpireStore";

const MINUTE_MS = 60_000;

/**
 * Crédite le revenu passif une fois par minute tant que l’app est ouverte.
 * Attend la réhydratation economy + empire avant d’armer l’intervalle.
 */
export function usePassiveIncomeLoop() {
  /** ID minuteur navigateur (`number`) — forcer le type évite `NodeJS.Timeout` vs `number` selon la résolution TS (ex. Vercel). */
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTick = () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const arm = () => {
      if (!useEconomyStore.persist.hasHydrated() || !useEmpireStore.persist.hasHydrated()) return;
      clearTick();
      intervalRef.current = window.setInterval(() => {
        const unlocked = useEmpireStore.getState().unlockedNodes;
        useEconomyStore.getState().applyOnlinePassiveIncomeTick(unlocked);
      }, MINUTE_MS);
    };

    const unsubEco = useEconomyStore.persist.onFinishHydration(arm);
    const unsubEmp = useEmpireStore.persist.onFinishHydration(arm);
    arm();

    return () => {
      unsubEco();
      unsubEmp();
      clearTick();
    };
  }, []);
}
