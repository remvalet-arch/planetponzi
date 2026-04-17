/**
 * Dictionnaire FR / EN — centraliser ici les chaînes UI pour éviter la duplication.
 * L’app est encore majoritairement en FR dans les composants : migrer progressivement.
 *
 * Usage : import { strings } from '@/src/lib/i18n/strings'; strings.fr.rules.title
 */

export type Locale = "fr" | "en";

export type PlanetStrings = {
  name: string;
  blurb: string;
};

export const strings = {
  fr: {
    brand: {
      name: "Planet Ponzi",
      tagline: "Capitalisme spatial. Un mandat par jour.",
    },
    /** Secteurs 1–10 (10 niveaux chacun) — lore cynique. */
    planets: [
      { name: "La Ceinture des Startups", blurb: "Débutant · on rêve en unicorn." },
      { name: "Nébuleuse de l'Endettement", blurb: "La difficulté monte avec les taux." },
      { name: "Archipel des Offshore", blurb: "Premières contraintes de deck, capitaux flottants." },
      { name: "Désert de l'Austérité", blurb: "Peu d’eau sur les comptes publics." },
      { name: "Gisement de Bulles Spéculatives", blurb: "Mines partout, promesses d’or." },
      { name: "Plateau des Levées de fonds", blurb: "Série B ou bust — dilution cosmique." },
      { name: "Anneau des Actifs structurés", blurb: "Titrisé, empaqueté, noté AAA par défaut." },
      { name: "Quadrant de l'Effet de levier", blurb: "Dette bonne / mauvaise : même recette." },
      { name: "Limite du Marché gris", blurb: "Liquidité opaque, volatilité saine (non)." },
      { name: "Le Trou Noir de l'Exit", blurb: "Le boss final — cash-out ou absorption." },
    ] as const satisfies readonly PlanetStrings[],
    map: {
      sectorFirst: "Secteur {{roman}}",
      sectorEnter: "Vous entrez dans le Secteur {{roman}}",
    },
    nav: {
      empire: "Empire",
      bank: "Banque",
      support: "Soutenir",
      menu: "Menu",
      settings: "Paramètres",
      languages: "Langues",
      resetCareer: "Réinitialiser ma carrière",
      resetConfirm: "Effacer toute la progression locale (niveaux, étoiles) ?",
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
    planets: [
      { name: "The Startup Belt", blurb: "Beginner dreams — unicorn optics." },
      { name: "Nebula of Indebtedness", blurb: "Difficulty rises with the coupons." },
      { name: "Offshore Archipelago", blurb: "First deck pressure — capital adrift." },
      { name: "Desert of Austerity", blurb: "Not much water in the public wells." },
      { name: "Speculative Bubble Field", blurb: "Mines everywhere, golden promises." },
      { name: "Fundraising Plateau", blurb: "Series B or bust — cosmic dilution." },
      { name: "Ring of Structured Assets", blurb: "Packaged, tranched, rated AAA by default." },
      { name: "Leverage Quadrant", blurb: "Good debt / bad debt — same recipe." },
      { name: "Grey Market Frontier", blurb: "Opaque liquidity, “healthy” volatility." },
      { name: "The Exit Black Hole", blurb: "Final boss — cash out or get absorbed." },
    ] as const satisfies readonly PlanetStrings[],
    map: {
      sectorFirst: "Sector {{roman}}",
      sectorEnter: "You are entering Sector {{roman}}",
    },
    nav: {
      empire: "Empire",
      bank: "Bank",
      support: "Support",
      menu: "Menu",
      settings: "Settings",
      languages: "Languages",
      resetCareer: "Reset my career",
      resetConfirm: "Erase all local progress (levels, stars)?",
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
