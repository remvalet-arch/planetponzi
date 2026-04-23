"use client";

import { useMemo } from "react";

import { heavyCash, lightTap, successPop } from "@/src/lib/haptics";

/**
 * Retours haptiques pour le game feel mobile (no-op si `navigator.vibrate` absent
 * ou si le joueur a désactivé les vibrations dans Paramètres).
 */
export function useHaptics() {
  return useMemo(
    () => ({
      lightTap,
      successPop,
      heavyCash,
    }),
    [],
  );
}
