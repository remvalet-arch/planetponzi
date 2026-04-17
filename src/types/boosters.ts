/** Types de jokers consommables (progression globale). */
export type BoosterType = "demolition" | "spy" | "lobbying";

export const DEFAULT_BOOSTERS: Record<BoosterType, number> = {
  demolition: 3,
  spy: 2,
  lobbying: 2,
};
