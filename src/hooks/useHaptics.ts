"use client";

import { useMemo } from "react";

import { heavyCash, lightTap, successPop } from "@/src/lib/haptics";

/**
 * Retours haptiques pour le game feel mobile (no-op si `navigator.vibrate` absent).
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
