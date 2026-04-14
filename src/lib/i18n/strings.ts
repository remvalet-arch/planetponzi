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
      title: "Règles",
      kicker: "Grille & score",
    },
    tutorial: {
      skip: "Passer",
      next: "Suivant",
      done: "Choisir le mode",
      step1Title: "Manifeste",
      step1Body:
        "Chaque jour : 16 bâtiments dans un ordre fixe. Le manifeste donne les quantités par type, pas les emplacements.",
      step2Title: "Grille",
      step2Body:
        "Une case par tour, voisins = haut, bas, gauche, droite. Pas de diagonale.",
      step3Title: "Score",
      step3Body:
        "Chaque case remplie rapporte des M$ selon son type et ses voisins. Total × coefficient du mode (menu Règles). Objectif : ROI affiché maximal.",
    },
  },
  en: {
    brand: {
      name: "Planet Ponzi",
      tagline: "Orbital capitalism. One mandate per day.",
    },
    rules: {
      title: "Rules",
      kicker: "Grid & score",
    },
    tutorial: {
      skip: "Skip",
      next: "Next",
      done: "Pick mode",
      step1Title: "Manifest",
      step1Body:
        "Each day: 16 buildings in a fixed order. The manifest shows counts per type, not positions.",
      step2Title: "Grid",
      step2Body:
        "One cell per turn; neighbors = up, down, left, right. No diagonals.",
      step3Title: "Score",
      step3Body:
        "Each filled cell pays M$ from its type and neighbors. Total × mode multiplier (Rules menu). Goal: maximize displayed ROI.",
    },
  },
} as const;

export function getStrings(locale: Locale) {
  return strings[locale];
}
