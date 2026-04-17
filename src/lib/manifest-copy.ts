import type { BuildingType, DailyInventory, DeckChallengeLevel } from "@/src/types/game";

const DISPLAY_ORDER: BuildingType[] = [
  "habitacle",
  "eau",
  "serre",
  "mine",
];

function maxCount(stats: DailyInventory): number {
  let m = 0;
  for (const t of DISPLAY_ORDER) {
    if (stats[t] > m) m = stats[t];
  }
  return m;
}

/** Types ex-aequo sur le plus grand compte (ordre stable pour départager). */
function topTypesAt(stats: DailyInventory, value: number): BuildingType[] {
  return DISPLAY_ORDER.filter((t) => stats[t] === value);
}

/**
 * Ligne d’ambiance corporate / satirique au-dessus du manifeste,
 * pilotée par la répartition du jour.
 * Dès qu’au moins un compte est masqué, on évite les indices sur la répartition réelle.
 */
export function getManifestAmbientCopy(
  stats: DailyInventory,
  deckChallengeLevel: DeckChallengeLevel = 0,
): string {
  if (deckChallengeLevel >= 1) {
    return "Répartition masquée au manifeste — optimisez sans tableau croisé dynamique.";
  }

  const hi = maxCount(stats);
  const leaders = topTypesAt(stats, hi);

  if (hi >= 6) {
    if (leaders.includes("mine")) {
      return "Aujourd’hui : priorité à l’extraction. La santé des colons est facultative.";
    }
    if (leaders.includes("eau")) {
      return "Inondation prévue sur Mars. Optimisez l’irrigation.";
    }
    if (leaders.includes("habitacle")) {
      return "Capacité d’accueil surdimensionnée. Compressez les revendications syndicales.";
    }
    if (leaders.includes("serre")) {
      return "Audit agro : priorité biomasse. Les astéroïdes attendront.";
    }
  }

  if (hi >= 5 && leaders.length === 1) {
    const [only] = leaders;
    switch (only) {
      case "mine":
        return "Briefing court : creusez vite. Le juridique validera après coup.";
      case "eau":
        return "Directive humide : hydratez le rendement, pas les plaintes.";
      case "habitacle":
        return "Logements premium… au prix du standing. Densifiez sans documenter.";
      case "serre":
        return "KPI verdure : chaque feuille est une ligne sur le tableau de bord.";
      default: {
        const _ex: never = only;
        return _ex;
      }
    }
  }

  if (stats.mine >= 4 && stats.mine === hi) {
    return "Charge utile orientée minerais. Les EHS sont en maintenance prolongée.";
  }
  if (stats.eau >= 4 && stats.eau === hi) {
    return "Flux hydrique élevé : pensez synergies aquifères transverses.";
  }

  if (hi <= 4 && leaders.length >= 3) {
    return "Mix équilibré : personne n’est content, donc la stratégie est validée.";
  }

  return "Manifeste standard. Exécutez le plan sans interprétation créative.";
}
