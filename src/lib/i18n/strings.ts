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
      loadingProgress: "Chargement de la progression…",
      starGateHint:
        "Accumulez plus d'étoiles dans ce secteur pour affronter le Boss !",
      starGateBadge: (n: number, cap: number) => `⭐ ${n} / ${cap}`,
    },
    manifest: {
      deckTypesHidden: (n: number) => (n <= 1 ? "1 type masqué" : `${n} types masqués`),
    },
    installPwa: {
      bannerText: "Téléchargez Planet Ponzi pour jouer hors-ligne ! 🚀",
      installCta: "Installer",
      dismissAria: "Masquer pour cette session",
      bannerAria: "Proposition d’installation de l’application",
      iosModalTitle: "Sur l’écran d’accueil (iOS)",
      iosModalBody:
        "Touchez l’icône Partage ⬆️ en bas, puis « Sur l’écran d’accueil » pour ajouter Planet Ponzi comme une app.",
      closeCta: "OK",
    },
    nav: {
      map: "Carte",
      empire: "Tour",
      shop: "Boutique",
      leaderboard: "Classement",
      bank: "Archives",
      support: "Soutenir",
      /** Lien texte vers `/` (splash), distinct de la carte niveaux. */
      home: "Accueil",
      /** Lien secondaire vers `/map` (même nom d’écran que l’onglet). */
      backToMap: "Retour à la carte",
      menu: "Menu",
      closeMenu: "Fermer le menu",
      settings: "Paramètres",
      languages: "Langues",
      resetCareer: "Réinitialiser ma carrière",
      resetConfirm: "Effacer toute la progression locale (niveaux, étoiles) ?",
      restartLevel: "Recommencer le niveau",
    },
    cloudSave: {
      sectionTitle: "Sauvegarde Cloud",
      sectionBody:
        "Connectez-vous pour synchroniser niveaux, étoiles, prestige et économie entre appareils. Sans compte, la partie reste 100 % locale (invité).",
      missingEnv:
        "Supabase n’est pas configuré (URL / clé anon). Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      signedInAs: (email: string) => `Connecté : ${email}`,
      signOut: "Se déconnecter",
      emailLabel: "E-mail",
      emailPlaceholder: "vous@exemple.com",
      sendMagicLink: "Envoyer le lien magique",
      magicLinkSent: "Vérifiez votre boîte mail : le lien arrive sous peu.",
      googleCta: "Continuer avec Google",
      orDivider: "ou",
      errorGeneric: "Une erreur est survenue. Réessayez.",
    },
    ceoDisplayName: {
      kicker: "Identité",
      title: "Nom de PDG",
      bodyAuth: "Ce nom apparaît sur le classement public lorsque vous êtes connecté.",
      bodyGuest: "Pseudo stocké localement pour le classement (invité). Connectez-vous pour le lier au cloud.",
      label: "Affichage",
      placeholder: "Ex. LunaYield",
      save: "Enregistrer",
      saved: "Enregistré.",
      error: "Impossible d’enregistrer.",
      empty: "Entrez au moins un caractère.",
    },
    ceoContract: {
      kicker: "Identité",
      title: "Signez votre contrat",
      body: "Entrez votre Pseudo de CEO (15 caractères max) — présence au classement et contrat moral.",
      label: "Pseudo de CEO",
      placeholder: "Ex. LunaYield",
      cta: "Signer",
    },
    dailyBonus: {
      kicker: "Quotidien",
      title: "Cadeau du Board",
      body: "Cadeau du Board : +1 Démolition, +1 Espion !",
      cta: "Encaisser",
      allocationClaimed: "Allocation récupérée. Revenez demain.",
    },
    entryFlow: {
      mandate: "Mandat",
      objectives: "Objectifs de Dividendes",
      starStripAria:
        "Seuils de Profit : scores requis pour valider les dividendes 1, 2 et 3",
      ptsSuffix: "pts",
      cta: "Lancer l'exploitation",
      ctaSub: "Jouer",
      loading: "Chargement du mandat…",
      maxEstimatedLabel: "Plafond estimé",
      starCard1: "1er Palier 💰",
      starCard2: "2ème Palier 💰💰",
      starCard3: "3ème Palier 💰💰💰",
      specialDirectivesTitle: "⚠️ Directives",
      directiveMandateMin: (p: { count: number; label: string }) =>
        `Mandat : construisez au moins ${p.count} ${p.label} (en fin de partie).`,
      directiveSeismic: (turn: number) =>
        `Sismique : une case occupée sera détruite à la fin du tour ${turn}.`,
      directiveFiscalBoss:
        "Boss — Contrôle fiscal : tous les 4 tours, le Fisc gèle votre case la plus rentable (0 pt au bilan pour cette case).",
    },
    mandate: {
      buildings: {
        habitacle: "Habitacles",
        eau: "Eau",
        serre: "Serres",
        mine: "Mines",
        forests: "Forêts (serres)",
      },
      trackerLine: (label: string, current: number, required: number) => `${label} : ${current}/${required}`,
      spatialIsolatedBrief: (label: string) =>
        `Mandat spatial — ${label} isolés : aucune paire du même type ne doit être orthogonalement adjacente.`,
      spatialAlignedBrief: (label: string, n: number) =>
        `Mandat spatial — alignement : au moins ${n} ${label} consécutifs sur une même ligne ou colonne.`,
      trackerIsolatedOk: (label: string) => `${label} isolés ✓`,
      trackerIsolatedBad: (label: string) => `${label} isolés : KO`,
      trackerAligned: (label: string, cur: number, req: number) => `${label} alignés : ${cur}/${req}`,
    },
    empirePage: {
      title: "Tour Ponzi",
      subtitle: "Investissez vos Ponzi Coins pour grimper la hiérarchie.",
      purchased: "Acquis",
      locked: "Verrouillé",
      buyFor: "Acheter",
      needLower: "Achetez l’étage inférieur d’abord.",
      insufficient: "Solde insuffisant.",
      purchaseSuccess: "Étage acquis !",
      prestigeKicker: "Prestige",
      prestigeScoreBonus: "+10 % de score final par palier de prestige (toutes parties).",
      prestigeCurrent: (n: number) => `Palier actuel : ${n}`,
      bankruptcyCta: "Déposer le bilan",
      bankruptcyLocked: "Atteignez l’Héliport privé pour liquider la tour.",
      bankruptcyModalTitle: "Faillite stratégique ?",
      bankruptcyModalBody:
        "La tour repart à zéro, vos Ponzi Coins sont saisis, mais votre palier prestige augmente — et avec lui, votre bonus de score sur chaque mandat.",
      bankruptcyConfirm: "Liquider",
      bankruptcyCancel: "Annuler",
      bankruptcyDone: "Bilan déposé. Le Board applaudit votre résilience.",
    },
    leaderboard: {
      empty: "Aucune donnée pour l’instant. Terminez des niveaux pour apparaître ici.",
      you: "Vous",
      loadError: "Classement indisponible.",
      prestigeShort: (n: number) => `P${n}`,
      maxScoreLabel: "Record",
      meritHint: "Tri : prestige → étoiles → meilleur score.",
    },
    shop: {
      coinsLabel: "Vos Ponzi Coins :",
      buy: "Acheter",
      comingSoon: "Bientôt",
      sectionBlackMarket: "Marché Noir (Boosters)",
      sectionPrestige: "Boutique Prestige (Cosmétiques)",
      sectionFunds: "Fonds d’Investissement",
      insufficient: "Solde insuffisant.",
      boughtSurvival: "Pack Survie livré — vies rechargées.",
      boughtDemolition: "Licence de démolition ajoutée à la mallette.",
      boughtSpy: "Espion industriel recruté.",
      packSurvivalTitle: "Pack Survie (3 vies)",
      packSurvivalDesc: "Recharge complète du compteur énergie.",
      demolitionTitle: "Licence de démolition",
      demolitionDesc: "+1 utilisation démolition sur la grille.",
      spyTitle: "L’Espion industriel",
      spyDesc: "+1 utilisation espion (aperçu 4 prochains).",
      teaserCeoTitle: "Titre de CEO : Loup de Wall Street",
      teaserCeoDesc: "Brillez dans le classement avec ce titre exclusif.",
      teaserThemeTitle: "Thème : Grille Néon",
      teaserThemeDesc: "Skin holographique pour votre ville.",
      teaserBriefcaseTitle: "Mallette de Ponzi Coins",
      teaserBriefcaseDesc: "+5000 💰.",
    },
    blackMarket: {
      title: "Marché noir",
      subtitle: "200 💰 : la prochaine tuile du mandat devient celle que vous choisissez.",
      openAria: "Ouvrir le marché noir",
      close: "Fermer",
      buy: "Injecter cette tuile",
      insufficient: "Solde insuffisant.",
      success: "Tuile injectée dans le mandat.",
    },
    storyModal: {
      memoHeader: (n: number) => `Mémo #${n}`,
      closeCta: "Compris — retour à la carte",
    },
    ceoStory: {
      memos: {
        "1": {
          kicker: "Acte I — La Ceinture des Startups",
          quote:
            "Si vous lisez ceci, vous avez survécu au onboarding. Félicitations : vous êtes officiellement toxique pour le climat moral de l’open space.",
        },
        "21": {
          kicker: "Acte II — Nébuleuse de l’Endettement",
          quote:
            "Les taux montent, les promesses aussi. Un bon CEO ne paie jamais en cash — il paie en narratif. Continuez à empiler les actifs, pas les excuses.",
        },
        "41": {
          kicker: "Acte III — Gisement de Bulles",
          quote:
            "Les mines ne sont pas des mines : ce sont des options sur l’espoir des autres. Creusez plus profond : quelqu’un d’autre remblayera.",
        },
        "61": {
          kicker: "Acte IV — Anneau des Actifs structurés",
          quote:
            "Titriser, c’est emballer la poussière en barres dorées. Vous n’êtes pas un fraudeur : vous êtes un « arrangeur de complexité ».",
        },
        "81": {
          kicker: "Acte V — Limite du Marché gris",
          quote:
            "La liquidité est une religion et vous êtes au pulpitre. Si la morale appelle, renvoyez-la en boîte vocale : vous êtes en roadshow.",
        },
      },
      fallback: {
        kicker: "Transmission CEO",
        quote: "Le marché dort. Ne le réveillez pas sans slide deck.",
      },
    },
    endScreen: {
      levelKicker: (levelId: number) => `Niveau ${levelId} · terminé`,
      rewardsTitle: "Récompenses",
      finalYieldLabel: "Rendement Final",
      starsAriaNone: "Aucun palier de profit sur 3",
      starsAria: (earned: number) =>
        earned <= 1 ? `${earned} palier de profit sur 3` : `${earned} paliers de profit sur 3`,
      pointsUnit: "pts",
      minimizeAria: "Réduire le bilan",
      reopenBilanSr: "Rouvrir le bilan",
      replay: "Rejouer",
      continue: "Continuer",
      shareSummary: "Partager le résumé",
      shareCopied: "Copié ✓",
      shareRetry: "Réessayer",
      shareFeedbackCopied: "Résumé copié dans le presse-papiers.",
      shareFeedbackError: "Copie impossible sur cet appareil.",
      closeSeeGrid: "Fermer — voir la grille",
      insufficientTitle: "Rendement insuffisant",
      insufficientBody: "−1 vie.",
      mandateFailedTitle: "Mandat non tenu",
      mandateFailedLead: "Le mandat grille n’a pas été respecté (pas un problème de points seuls).",
      mandateFailedBody:
        "Conditions grille non remplies (ex. forêts). Score OK, 0 palier de profit validé : le mandat prime.",
      mandateFailedMissing: (fragments: string) =>
        `Manque : ${fragments}. Rejouez en ciblant ça.`,
      mandateFailedFragment: (label: string, current: number, required: number) =>
        `${label} (${current}/${required} requis)`,
      mandateSpatialIsolatedFail: (label: string) =>
        `${label} : mandat d’isolation non respecté (deux mêmes types ne doivent pas se toucher).`,
      mandateSpatialAlignedFail: (label: string, cur: number, req: number) =>
        `${label} alignés : ${cur}/${req} requis sur une ligne ou colonne.`,
      optimalBanner: "Plafond atteint",
      coinsEarned: (n: number) => `+${n} 💰`,
      /** Mode deck masqué — texte très lisible sur le bilan (évite tout jargon « type inconnu »). */
      hiddenDeckBanner: (hiddenCount: number) =>
        hiddenCount <= 1 ? "1 type masqué sur le manifeste" : `${hiddenCount} types masqués`,
      nextStopLevel: (n: number) => `Suite : niv. ${n}`,
      escapeOrBackdropHint: "Échap / fond : réduire",
      backToHqCountdown: (seconds: number) => `QG dans ${seconds}s`,
    },
    energy: {
      kicker: "Énergie",
      title: "Plus d’énergie !",
      body: "Revenez plus tard (recharge automatique) ou visitez la boutique.",
      dismiss: "Fermer",
      shareForLife: "Gagner 1 Vie 🎁",
      shareForLifeHint: "Partagez le jeu : +1 vie (une fois par jour).",
      shareForLifeUsed: "Bonus partage déjà utilisé aujourd’hui.",
      shareTwitter: "Partager sur X",
      shareCopy: (gameUrl: string) =>
        `Je viens de ruiner l'économie sur Planet Ponzi ! Battez mon score : ${gameUrl}`,
    },
    rules: {
      title: "Règles",
      kicker: "Grille & score",
      megaStructureTitle: "Méga-structures (fusion 2×2)",
      megaStructureBody:
        "Formez un carré 2×2 avec le même type de bâtiment (ex. : 4 Mines) pour créer une Méga-Structure qui rapporte énormément de points.",
      fiscalBossTitle: "Contrôle fiscal (Boss)",
      fiscalBossBody:
        "Tous les 10 niveaux (Niveaux Boss), le Fisc s'invite ! Tous les 4 tours de jeu, le Fisc gèlera votre case la plus rentable. Une case gelée rapporte 0 M$ à la fin de la partie. Construisez intelligemment pour minimiser les pertes.",
      fiscalFreezeTutorialBody:
        "Le Fisc vient de geler votre case la plus rentable : elle comptera pour 0 M$ au bilan final. Sur ce mandat Boss, le gel se répète tous les 4 tours — anticipez pour limiter l’impact.",
      fiscalFreezeTutorialCta: "J'ai compris",
    },
    tutorial: {
      level1PlaceMine: "Placez l'usine ici",
      level1FusionToast:
        "Fusion réussie ! Les méga-structures rapportent beaucoup plus !",
      level1FusionToastCeo:
        "Vous voyez ce carré de 4 mines ? C'est ça, la synergie d'entreprise !",
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
      loadingProgress: "Loading progress…",
      starGateHint: "Earn more stars in this sector to challenge the Boss!",
      starGateBadge: (n: number, cap: number) => `⭐ ${n} / ${cap}`,
    },
    manifest: {
      deckTypesHidden: (n: number) => (n <= 1 ? "1 hidden type" : `${n} hidden types`),
    },
    installPwa: {
      bannerText: "Install Planet Ponzi to play offline! 🚀",
      installCta: "Install",
      dismissAria: "Dismiss for this session",
      bannerAria: "App install offer",
      iosModalTitle: "Add to Home Screen (iOS)",
      iosModalBody:
        "Tap the Share button ⬆️ at the bottom, then “Add to Home Screen” to install Planet Ponzi like an app.",
      closeCta: "OK",
    },
    nav: {
      map: "Map",
      empire: "Tower",
      shop: "Shop",
      leaderboard: "Leaderboard",
      bank: "Archives",
      support: "Support",
      home: "Home",
      backToMap: "Back to the map",
      menu: "Menu",
      closeMenu: "Close menu",
      settings: "Settings",
      languages: "Languages",
      resetCareer: "Reset my career",
      resetConfirm: "Erase all local progress (levels, stars)?",
      restartLevel: "Restart level",
    },
    cloudSave: {
      sectionTitle: "Cloud save",
      sectionBody:
        "Sign in to sync levels, stars, prestige, and economy across devices. Without an account, progress stays 100% local (guest).",
      missingEnv:
        "Supabase is not configured (URL / anon key). Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      signedInAs: (email: string) => `Signed in: ${email}`,
      signOut: "Sign out",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      sendMagicLink: "Send magic link",
      magicLinkSent: "Check your inbox — the link should arrive shortly.",
      googleCta: "Continue with Google",
      orDivider: "or",
      errorGeneric: "Something went wrong. Try again.",
    },
    ceoDisplayName: {
      kicker: "Identity",
      title: "CEO display name",
      bodyAuth: "Shown on the public leaderboard when you are signed in.",
      bodyGuest: "Stored locally for the leaderboard (guest). Sign in to sync it to the cloud.",
      label: "Handle",
      placeholder: "e.g. LunaYield",
      save: "Save",
      saved: "Saved.",
      error: "Could not save.",
      empty: "Enter at least one character.",
    },
    ceoContract: {
      kicker: "Identity",
      title: "Sign your contract",
      body: "Pick your CEO handle for the leaderboard and your saved profile.",
      label: "CEO handle",
      placeholder: "e.g. LunaYield",
      cta: "Sign",
    },
    dailyBonus: {
      kicker: "Daily",
      title: "Board gift",
      body: "+1 Demolition, +1 Spy — stakeholder value (yours).",
      cta: "Claim",
      allocationClaimed: "Allocation claimed. Come back tomorrow.",
    },
    entryFlow: {
      mandate: "Mandate",
      objectives: "Dividend targets",
      starStripAria:
        "Profit thresholds: scores required to validate dividend tiers 1, 2, and 3",
      ptsSuffix: "pts",
      cta: "Start extraction",
      ctaSub: "Play",
      loading: "Loading mandate…",
      maxEstimatedLabel: "Est. cap",
      starCard1: "Tier 1 💰",
      starCard2: "Tier 2 💰💰",
      starCard3: "Tier 3 💰💰💰",
      specialDirectivesTitle: "⚠️ Directives",
      directiveMandateMin: (p: { count: number; label: string }) =>
        `Mandate: place at least ${p.count} ${p.label} on the final grid.`,
      directiveSeismic: (turn: number) =>
        `Seismic risk: one occupied cell will be destroyed after turn ${turn}.`,
      directiveFiscalBoss:
        "Boss — tax audit: every 4 turns, the taxman freezes your highest‑yielding cell (0 M$ for that cell at tally).",
    },
    mandate: {
      buildings: {
        habitacle: "Habitats",
        eau: "Water",
        serre: "Greenhouses",
        mine: "Mines",
        forests: "Forests (greenhouses)",
      },
      trackerLine: (label: string, current: number, required: number) => `${label}: ${current}/${required}`,
      spatialIsolatedBrief: (label: string) =>
        `Spatial mandate — isolated ${label}: no orthogonal adjacency between two tiles of that type.`,
      spatialAlignedBrief: (label: string, n: number) =>
        `Spatial mandate — alignment: at least ${n} consecutive ${label} on one row or column.`,
      trackerIsolatedOk: (label: string) => `${label} isolated ✓`,
      trackerIsolatedBad: (label: string) => `${label} isolated: fail`,
      trackerAligned: (label: string, cur: number, req: number) => `${label} aligned: ${cur}/${req}`,
    },
    empirePage: {
      title: "Ponzi Tower",
      subtitle: "Spend Ponzi Coins to climb the corporate ladder.",
      purchased: "Owned",
      locked: "Locked",
      buyFor: "Buy",
      needLower: "Unlock the floor below first.",
      insufficient: "Not enough coins.",
      purchaseSuccess: "Floor acquired!",
      prestigeKicker: "Prestige",
      prestigeScoreBonus: "+10% final score per prestige tier (every run).",
      prestigeCurrent: (n: number) => `Current tier: ${n}`,
      bankruptcyCta: "File for bankruptcy",
      bankruptcyLocked: "Reach the Private Helipad to liquidate the tower.",
      bankruptcyModalTitle: "Strategic bankruptcy?",
      bankruptcyModalBody:
        "The tower resets, your Ponzi Coins are seized, but your prestige tier rises — boosting your score on every mandate.",
      bankruptcyConfirm: "Liquidate",
      bankruptcyCancel: "Cancel",
      bankruptcyDone: "Bankruptcy filed. The board loves your resilience.",
    },
    leaderboard: {
      empty: "No entries yet. Finish levels to show up here.",
      you: "You",
      loadError: "Leaderboard unavailable.",
      prestigeShort: (n: number) => `P${n}`,
      maxScoreLabel: "Best",
      meritHint: "Order: prestige → stars → best score.",
    },
    shop: {
      coinsLabel: "Your Ponzi Coins:",
      buy: "Buy",
      comingSoon: "Coming soon",
      sectionBlackMarket: "Black market (boosters)",
      sectionPrestige: "Prestige boutique (cosmetics)",
      sectionFunds: "Investment funds",
      insufficient: "Not enough coins.",
      boughtSurvival: "Survival pack delivered — lives refilled.",
      boughtDemolition: "Demolition license added to your kit.",
      boughtSpy: "Industrial spy hired.",
      packSurvivalTitle: "Survival pack (3 lives)",
      packSurvivalDesc: "Full energy bar refill.",
      demolitionTitle: "Demolition license",
      demolitionDesc: "+1 demolition use on the grid.",
      spyTitle: "Industrial spy",
      spyDesc: "+1 spy use (peek next 4 buildings).",
      teaserCeoTitle: "CEO title: Wolf of Wall Street",
      teaserCeoDesc: "Stand out on the leaderboard with this exclusive title.",
      teaserThemeTitle: "Theme: Neon grid",
      teaserThemeDesc: "Holographic skin for your city.",
      teaserBriefcaseTitle: "Ponzi Coins briefcase",
      teaserBriefcaseDesc: "+5000 💰.",
    },
    blackMarket: {
      title: "Black market",
      subtitle: "200 💰: your next mandate tile becomes the one you pick.",
      openAria: "Open black market",
      close: "Close",
      buy: "Inject this tile",
      insufficient: "Not enough coins.",
      success: "Tile injected into the mandate.",
    },
    storyModal: {
      memoHeader: (n: number) => `Memo #${n}`,
      closeCta: "Got it — back to the map",
    },
    ceoStory: {
      memos: {
        "1": {
          kicker: "Act I — Startup Belt",
          quote:
            "If you’re reading this, you survived onboarding. Congrats: you’re now officially hazardous to the open-plan vibe.",
        },
        "21": {
          kicker: "Act II — Debt Nebula",
          quote:
            "Rates rise, promises rise faster. A good CEO never pays in cash—only in narrative. Keep stacking assets, not apologies.",
        },
        "41": {
          kicker: "Act III — Speculation Vein",
          quote:
            "Mines aren’t mines—they’re call options on other people’s hope. Dig deeper: someone else will fill the hole.",
        },
        "61": {
          kicker: "Act IV — Structured Assets Ring",
          quote:
            "Securitization is packing dust into gold bars. You’re not a fraudster—you’re a “complexity arranger.”",
        },
        "81": {
          kicker: "Act V — Grey Market Frontier",
          quote:
            "Liquidity is a religion and you’re at the pulpit. If ethics calls, send it to voicemail—you’re on a roadshow.",
        },
      },
      fallback: {
        kicker: "CEO transmission",
        quote: "The market is asleep. Don’t wake it without a deck.",
      },
    },
    endScreen: {
      levelKicker: (levelId: number) => `Level ${levelId} · complete`,
      rewardsTitle: "Rewards",
      finalYieldLabel: "Final yield",
      starsAriaNone: "No profit tier out of 3",
      starsAria: (earned: number) =>
        `${earned} profit tier${earned > 1 ? "s" : ""} out of 3`,
      pointsUnit: "pts",
      minimizeAria: "Shrink summary",
      reopenBilanSr: "Open summary again",
      replay: "Replay",
      continue: "Continue",
      shareSummary: "Share summary",
      shareCopied: "Copied ✓",
      shareRetry: "Try again",
      shareFeedbackCopied: "Summary copied to clipboard.",
      shareFeedbackError: "Could not copy on this device.",
      closeSeeGrid: "Close — view grid",
      insufficientTitle: "Insufficient yield",
      insufficientBody: "−1 life.",
      mandateFailedTitle: "Mandate not met",
      mandateFailedLead: "Grid mandate failed (not just points).",
      mandateFailedBody:
        "Grid rules not met (e.g. forests). OK score, 0 profit tiers validated — mandate wins.",
      mandateFailedMissing: (fragments: string) =>
        `Missing: ${fragments}. Replay with focus.`,
      mandateFailedFragment: (label: string, current: number, required: number) =>
        `${label} (${current}/${required} required)`,
      mandateSpatialIsolatedFail: (label: string) =>
        `${label}: isolation mandate failed (same types cannot touch orthogonally).`,
      mandateSpatialAlignedFail: (label: string, cur: number, req: number) =>
        `${label} aligned: ${cur}/${req} required on one row or column.`,
      optimalBanner: "Cap reached",
      coinsEarned: (n: number) => `+${n} 💰`,
      hiddenDeckBanner: (hiddenCount: number) =>
        hiddenCount <= 1 ? "1 hidden type on manifest" : `${hiddenCount} hidden types`,
      nextStopLevel: (n: number) => `Next: L${n}`,
      escapeOrBackdropHint: "Esc / backdrop: shrink",
      backToHqCountdown: (seconds: number) => `HQ in ${seconds}s`,
    },
    energy: {
      kicker: "Energy",
      title: "Out of energy!",
      body: "Come back later (auto recharge) or visit the shop.",
      dismiss: "Close",
      shareForLife: "Earn 1 life 🎁",
      shareForLifeHint: "Share the game: +1 life (once per day).",
      shareForLifeUsed: "Share bonus already claimed today.",
      shareTwitter: "Share on X",
      shareCopy: (gameUrl: string) =>
        `I just wrecked the economy on Planet Ponzi! Beat my score: ${gameUrl}`,
    },
    rules: {
      title: "Rules",
      kicker: "Grid & score",
      megaStructureTitle: "Mega-structures (2×2 fusion)",
      megaStructureBody:
        "Make a 2×2 square of the same building type (e.g. four Mines) to create a Mega-Structure that pays a huge score bonus.",
      fiscalBossTitle: "Tax audit (Boss levels)",
      fiscalBossBody:
        "Every 10 levels (Boss levels), the taxman shows up! Every 4 turns, the taxman freezes your highest‑yielding cell. A frozen cell pays 0 M$ at the end of the run. Build smart to limit the damage.",
      fiscalFreezeTutorialBody:
        "The taxman just froze your highest‑yielding cell: it will count as 0 M$ in the final tally. On this Boss mandate, a freeze happens every 4 turns — plan ahead to limit the damage.",
      fiscalFreezeTutorialCta: "Got it",
    },
    tutorial: {
      level1PlaceMine: "Place the factory here",
      level1FusionToast: "Fusion complete! Mega-structures pay a lot more!",
      level1FusionToastCeo:
        "See that 2×2 block of mines? That's what we call corporate synergy.",
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
