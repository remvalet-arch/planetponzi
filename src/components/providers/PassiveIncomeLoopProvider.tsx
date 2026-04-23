"use client";

import type { ReactNode } from "react";

import { usePassiveIncomeLoop } from "@/src/hooks/usePassiveIncomeLoop";

/**
 * Garde la boucle de revenu passif (1 min) active sur toutes les routes.
 */
export function PassiveIncomeLoopProvider({ children }: { children: ReactNode }) {
  usePassiveIncomeLoop();
  return <>{children}</>;
}
