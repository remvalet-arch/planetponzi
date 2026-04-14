/**
 * Dictionnaire FR / EN — centraliser ici les chaînes UI pour éviter la duplication.
 * L’app est encore majoritairement en FR dans les composants : migrer progressivement.
 *
 * Usage : import { strings } from '@/src/lib/i18n/strings'; strings.fr.rules.title
 */

export type Locale = "fr" | "en";

export const strings = {
  fr: {
    brand: {
      name: "Planet Ponzi",
      tagline: "Capitalisme spatial. Un mandat par jour.",
    },
    rules: {
      title: "Manuel interne (confidentiel)",
      kicker: "Niveau 0 — conformité narrative",
    },
    tutorial: {
      skip: "Passer",
      next: "Suivant",
      done: "Lancer le mandat",
      step1Title: "Le manifeste",
      step1Body:
        "Chaque jour, 16 cartes dans un ordre fixe. Le manifeste te dit combien tu as de chaque type — pas où les placer.",
      step2Title: "La grille 4×4",
      step2Body:
        "Place un bâtiment par tour. Voisin uniquement haut / bas / gauche / droite. Pas de diagonale, pas de téléportation.",
      step3Title: "Le ROI",
      step3Body:
        "Chaque type a des règles de score (synergies, mines qui cassent le voisinage…). Le but : maximiser le ROI cynique.",
    },
  },
  en: {
    brand: {
      name: "Planet Ponzi",
      tagline: "Orbital capitalism. One mandate per day.",
    },
    rules: {
      title: "Internal handbook (confidential)",
      kicker: "Level 0 — narrative compliance",
    },
    tutorial: {
      skip: "Skip",
      next: "Next",
      done: "Start mandate",
      step1Title: "The manifest",
      step1Body:
        "Every day, 16 cards in a fixed order. The manifest shows how many of each building you have — not where to put them.",
      step2Title: "The 4×4 grid",
      step2Body:
        "Place one building per turn. Neighbors are only up / down / left / right. No diagonal, no teleport.",
      step3Title: "ROI",
      step3Body:
        "Each type has scoring rules (synergies, mines ruining neighbors…). Maximize cynical ROI.",
    },
  },
} as const;

export function getStrings(locale: Locale) {
  return strings[locale];
}
