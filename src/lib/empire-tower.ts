/**
 * Tour Ponzi (méta-jeu) — données + agrégation des bonus passifs.
 * Lecture de `useEmpireStore` en lazy require pour éviter les cycles avec `useEconomyStore`.
 */

export const EMPIRE_BASE_MAX_LIVES = 3;
export const EMPIRE_DEFAULT_LIFE_RECHARGE_MS = 20 * 60 * 1000;
export const EMPIRE_FAST_LIFE_RECHARGE_MS = 15 * 60 * 1000;

export type EmpirePassiveModifiers = {
  livesMaxBonus: number;
  /** Intervalle entre deux +1 vie lorsque lives &lt; max. */
  lifeRechargeIntervalMs: number;
  /** Bonus par mine (Sprint 3 — scoring). */
  mineScoreBonusPerMine: number;
};

export type EmpireFloorDef = {
  id: string;
  /** Ordre ascendant : 0 = fondation (bas de la tour). */
  order: number;
  name: string;
  description: string;
  emoji: string;
  cost: number;
  /** Présent dans l’état initial `unlockedNodes`. */
  defaultUnlocked?: boolean;
  effects?: {
    livesMaxBonus?: number;
    /** Si true, recharge 15 min au lieu de 20. */
    fasterLifeRecharge?: boolean;
    mineScoreBonusPerMine?: number;
  };
};

/** Dernier étage achetable : débloque « Déposer le bilan » (prestige). */
export const EMPIRE_HELIPORT_FLOOR_ID = "heliport-prive";

export const EMPIRE_FLOORS: EmpireFloorDef[] = [
  {
    id: "garage-miteux",
    order: 0,
    name: "Le Garage Miteux",
    description: "Point de départ de toute grande pyramide. Pas de glamour, que du hustle.",
    emoji: "🛢️",
    cost: 0,
    defaultUnlocked: true,
  },
  {
    id: "open-space-toxique",
    order: 1,
    name: "L'Open Space Toxique",
    description: "Open bar, open burn-out. La productivité en open source (de vos nerfs).",
    emoji: "📎",
    cost: 500,
  },
  {
    id: "ferme-minage-bots",
    order: 2,
    name: "Ferme de Minage (Bots)",
    description:
      "Génère des Ponzi Coins en tâche de fond. +100 💰 toutes les 24h de connexion.",
    emoji: "⛏️",
    cost: 1500,
  },
  {
    id: "etage-direction",
    order: 3,
    name: "L'Étage de Direction",
    description: "Le comité exécutif accélère les cycles : recharges vie 20 min → 15 min.",
    emoji: "🪑",
    cost: 2000,
    effects: { fasterLifeRecharge: true },
  },
  {
    id: "serveurs-offshore",
    order: 4,
    name: "Serveurs Offshore",
    description: "Latence minimale, éthique maximale… négative. (+1 pt par mine — effet Sprint 3.)",
    emoji: "🖥️",
    cost: 5000,
    effects: { mineScoreBonusPerMine: 1 },
  },
  {
    id: EMPIRE_HELIPORT_FLOOR_ID,
    order: 5,
    name: "L'Héliport Privé",
    description: "Rooftop deal. +1 vie max pour négocier depuis les nuages.",
    emoji: "🚁",
    cost: 15000,
    effects: { livesMaxBonus: 1 },
  },
  {
    id: "skydeck-yield",
    order: 6,
    name: "Skydeck « Yield Infini »",
    description:
      "Terrasse vitrée où l'on respire le CO₂ des autres. Une vie de plus s'achète comme une option sur votre prochain burn-out.",
    emoji: "🌇",
    cost: 25000,
    effects: { livesMaxBonus: 1 },
  },
  {
    id: "cloison-structured",
    order: 7,
    name: "Cloisons structurées (tranche AAA-)",
    description:
      "Chaque mine rapporte plus, car la notation, c'est de la confiance... et la confiance se monnaie.",
    emoji: "🏗️",
    cost: 50000,
    effects: { mineScoreBonusPerMine: 1 },
  },
  {
    id: "wellness-captive",
    order: 8,
    name: "Étage Wellness Captif",
    description:
      "Fontaine à kombucha et +1 vie max : le bien-être n'est pas un droit, c'est un lock-in productif.",
    emoji: "🧘",
    cost: 100000,
    effects: { livesMaxBonus: 1 },
  },
  {
    id: "war-room-narratif",
    order: 9,
    name: "War Room du Narratif",
    description: "Table ovale et vérité ajustable. Les mines deviennent une story : +2 pts / mine.",
    emoji: "📡",
    cost: 225000,
    effects: { mineScoreBonusPerMine: 2 },
  },
  {
    id: "orbite-board",
    order: 10,
    name: "Orbite du Board (LEO)",
    description:
      "Satellite corporate. Visibilité planétaire, moralité nulle. Package exécutif : +1 vie max et +1 pt / mine.",
    emoji: "🛰️",
    cost: 500000,
    effects: { livesMaxBonus: 1, mineScoreBonusPerMine: 1 },
  },
];

export function getEmpireFloorById(id: string): EmpireFloorDef | undefined {
  return EMPIRE_FLOORS.find((f) => f.id === id);
}

export function getEmpireFloorByOrder(order: number): EmpireFloorDef | undefined {
  return EMPIRE_FLOORS.find((f) => f.order === order);
}

function readUnlockedNodesLazy(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    // Lazy : évite cycle useEconomyStore ↔ useEmpireStore au chargement du module.
    const { useEmpireStore } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- import dynamique synchrone (pas d’alternative sans refonte des stores)
      require("@/src/store/useEmpireStore") as typeof import("@/src/store/useEmpireStore");
    return useEmpireStore.getState().unlockedNodes ?? {};
  } catch {
    return {};
  }
}

export function computePassiveModifiers(unlocked: Record<string, boolean>): EmpirePassiveModifiers {
  let livesMaxBonus = 0;
  let lifeRechargeIntervalMs = EMPIRE_DEFAULT_LIFE_RECHARGE_MS;
  let mineScoreBonusPerMine = 0;

  for (const floor of EMPIRE_FLOORS) {
    if (!unlocked[floor.id]) continue;
    const e = floor.effects;
    if (!e) continue;
    if (typeof e.livesMaxBonus === "number") livesMaxBonus += e.livesMaxBonus;
    if (e.fasterLifeRecharge) lifeRechargeIntervalMs = EMPIRE_FAST_LIFE_RECHARGE_MS;
    if (typeof e.mineScoreBonusPerMine === "number") mineScoreBonusPerMine += e.mineScoreBonusPerMine;
  }

  return { livesMaxBonus, lifeRechargeIntervalMs, mineScoreBonusPerMine };
}

export function getEffectiveMaxLives(): number {
  return EMPIRE_BASE_MAX_LIVES + computePassiveModifiers(readUnlockedNodesLazy()).livesMaxBonus;
}

export function getEffectiveLifeRechargeMs(): number {
  return computePassiveModifiers(readUnlockedNodesLazy()).lifeRechargeIntervalMs;
}

/** Bonus mine agrégé (Tour) — pour scoring ; 0 hors client ou sans déblocage. */
export function getMineScoreBonusPerMine(): number {
  return computePassiveModifiers(readUnlockedNodesLazy()).mineScoreBonusPerMine;
}
