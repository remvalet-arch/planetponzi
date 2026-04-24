/**
 * Dictionnaire FR / EN — centraliser ici les chaînes UI pour éviter la duplication.
 * L’app est encore majoritairement en FR dans les composants : migrer progressivement.
 *
 * Usage : import { strings } from '@/src/lib/i18n/strings'; strings.fr.rules.title
 */

import { BIOME_ROWS_EN, BIOME_ROWS_FR } from "@/src/lib/i18n/biome-copy";

/** Espace fin insécable + M$ — suffixe affiché après une valeur chiffrée (valorisation). */
export const VALORIZATION_MS_UNIT = "\u202fM$";

export type Locale = "fr" | "en";

export type PlanetStrings = {
  name: string;
  blurb: string;
};

export const strings = {
  fr: {
    brand: {
      name: "Planète Ponzi",
      tagline: "Capitalisme spatial. Un mandat par jour.",
    },
    homeSplash: {
      displayTitle: "PLANÈTE PONZI",
      slogan: "Jeu de réflexion capitaliste et cynique",
      boardLine1: "Prêt pour le prochain tour de table ?",
      boardLine2: "Le Board attend vos résultats.",
      boardLine3: "Optimisez la grille. Maximisez les profits.",
      cta: "Ouvrir la séance",
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
      passiveYieldChip: (n: number) => `+${n} 💰 / MIN`,
      sectorHudCompact: (roman: string, planetName: string, done: number) =>
        `Secteur ${roman} : ${planetName} · ${done}/10`,
      sectorProgressHint: (roman: string, planetName: string, done: number, total: number) =>
        `Progression : ${planetName} (secteur ${roman}) — ${done} marchés sur ${total}`,
      headerStarsCompact: (n: number) => `${n} contrats`,
      starGateHint:
        "Accumulez plus de contrats dans ce secteur pour affronter le Boss !",
      starGateBadge: (n: number, cap: number) => `${n} / ${cap}`,
      offlinePassiveToast: (gain: number) =>
        `Vos serveurs ont généré +${gain} 💰 en votre absence !`,
    },
    economy: {
      offlineGain: (gain: number) =>
        `Vos serveurs ont généré +${gain} 💰 en votre absence`,
    },
    grid: {
      cellEmpty: (n: number) => `Case ${n}, vide`,
      cellObstacle: (n: number, obstacleName: string) => `${obstacleName} — case ${n}`,
      cellBuilding: (name: string) => `Bâtiment ${name}`,
      cellDemolish: (name: string, n: number) => `Démolir ${name} — case ${n}`,
      fiscalFreezeTitle: "Contrôle fiscal — 0 pt sur cette case",
      ariaGrid: "Grille de placement quatre par quatre",
      ariaGridDemolition: "Grille — mode démolition",
    },
    biomes: BIOME_ROWS_FR,
    manifest: {
      deckTypesHidden: (n: number) => (n <= 1 ? "1 type masqué" : `${n} types masqués`),
      nextTilesLabel: "Suivants",
      spyNextTilesLabel: "Espion · 4 tuiles",
      hiddenNextTilesHint: "Comptes masqués",
      manifestHeader: (levelId: number, seed: string) =>
        `Cargaison · Niveau ${levelId} · ${seed}`,
    },
    installPwa: {
      bannerText: "Téléchargez Planète Ponzi pour jouer hors-ligne ! 🚀",
      installCta: "Installer",
      dismissAria: "Masquer pour cette session",
      bannerAria: "Proposition d’installation de l’application",
      iosModalTitle: "Sur l’écran d’accueil (iOS)",
      iosModalBody:
        "Touchez l’icône Partage ⬆️ en bas, puis « Sur l’écran d’accueil » pour ajouter Planète Ponzi comme une app.",
      closeCta: "OK",
    },
    nav: {
      map: "Carte des Marchés",
      empire: "Tour",
      shop: "Boutique",
      leaderboard: "Classement",
      bank: "Archives",
      support: "Lobbying (Soutenir)",
      /** Lien texte vers `/` (splash), distinct de la carte niveaux. */
      home: "Accueil",
      /** Lien secondaire vers `/map` (même nom d’écran que l’onglet). */
      backToMap: "Retour aux Marchés",
      menu: "Menu",
      closeMenu: "Fermer le menu",
      settings: "Conformité (Paramètres)",
      languages: "Langues",
      resetCareer: "Détruire les preuves (Reset)",
      resetConfirm: "Effacer toute la progression locale (niveaux, contrats) ?",
      restartLevel: "Restructurer (Recommencer)",
    },
    gameHud: {
      valorization: "VALORISATION",
      valorizationShort: "VALO.",
    },
    cloudSave: {
      sectionTitle: "Sauvegarde Cloud",
      sectionBody:
        "Connectez-vous pour synchroniser niveaux, contrats, prestige et économie entre appareils. Sans compte, la partie reste 100 % locale (invité).",
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
    settingsA11y: {
      sectionTitle: "Accessibilité",
      hapticsLabel: "Retour haptique (Vibrations)",
      hapticsBody:
        "Active ou désactive les vibrations du téléphone lors des actions du jeu (placements, succès, achats).",
    },
    settingsAudio: {
      sectionTitle: "Audio",
      soundLabel: "Effets sonores",
      soundBody: "Active ou coupe les bips et jingles générés pendant la partie (Web Audio).",
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
    briefing: {
      contractTiersBlurb:
        "Chaque mandat fixe trois seuils de valorisation (M$) : ils déterminent combien de contrats vous signez.",
    },
    modalDialogue: {
      mandat:
        "Voici vos objectifs pour ce secteur, CEO. Ne décevez pas le Board.",
      win: "Excellente rentabilité ! Le Board est ravi... pour l'instant.",
      loss: "Des chiffres catastrophiques. Vous êtes un gouffre financier.",
      daily: "Un petit stimulus pour booster votre productivité. Au travail.",
    },
    entryFlow: {
      mandate: "Mandat",
      objectives: "Objectifs de Contrats",
      starStripAria:
        "Seuils de valorisation : M$ requis pour signer 1, 2 ou 3 contrats sur ce mandat",
      msUnit: VALORIZATION_MS_UNIT,
      cta: "Lancer l'exploitation",
      ctaSub: "Jouer",
      loading: "Chargement du mandat…",
      maxEstimatedLabel: "Plafond estimé",
      starCard1: "1er contrat",
      starCard2: "2e contrat",
      starCard3: "3e contrat",
      specialDirectivesTitle: "⚠️ Directives",
      directiveMandateMin: (p: { count: number; label: string }) =>
        `Mandat : construisez au moins ${p.count} ${p.label} (en fin de partie).`,
      directiveSeismic: (turn: number) =>
        `Sismique : une case occupée sera détruite à la fin du tour ${turn}.`,
      directiveFiscalBoss:
        "Boss — Contrôle fiscal : tous les 4 tours, le Fisc gèle votre case la plus rentable (0 M$ au bilan pour cette case).",
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
      globalYieldBanner: (n: number) =>
        `RENDEMENT GLOBAL ACTUEL : +${n} 💰 / MINUTE`,
      yieldBadge: (n: number) => `RENDEMENT : +${n} 💰 / MIN`,
      yieldLabel: "Rendement :",
      yieldUnit: "💰 / min",
      activeFloorTag: "[ ACTIF ]",
      effectBadgePrefix: "EFFET :",
      effectFasterRecharge: "Recharge des vies 20 min → 15 min",
      effectMineBonus: (n: number) => `+${n} M$ scoring / mine`,
      effectLivesMax: (n: number) => `+${n} vie max`,
      effectLivesAndMine: (lives: number, minePts: number) =>
        `+${lives} vie max · +${minePts}\u202fM$ / mine`,
      amortizedHours: (hours: number) => {
        if (!Number.isFinite(hours) || hours <= 0) return "";
        if (hours < 1 / 60) return "Amorti < 1 min";
        if (hours < 1) return `Amorti en ${Math.max(1, Math.round(hours * 60))} min`;
        if (hours < 48) return `Amorti en ${hours.toFixed(1)} h`;
        return `Amorti en ${(hours / 24).toFixed(1)} j`;
      },
      purchased: "Acquis",
      locked: "Verrouillé",
      buyFor: "Acheter",
      needLower: "Achetez l’étage inférieur d’abord.",
      insufficient: "Solde insuffisant.",
      purchaseSuccess: "Étage acquis !",
      prestigeKicker: "Prestige",
      prestigeScoreBonus: "+10 % de valorisation finale par palier de prestige (toutes parties).",
      prestigeCurrent: (n: number) => `Palier actuel : ${n}`,
      bankruptcyCta: "Déposer le bilan",
      bankruptcyLocked: "Atteignez l’Héliport privé pour liquider la tour.",
      bankruptcyModalTitle: "Faillite stratégique ?",
      bankruptcyModalBody:
        "La tour repart à zéro, vos Ponzi Coins sont saisis, mais votre palier prestige augmente — et avec lui, votre bonus de valorisation sur chaque mandat.",
      bankruptcyConfirm: "Liquider",
      bankruptcyCancel: "Annuler",
      bankruptcyDone: "Bilan déposé. Le Board applaudit votre résilience.",
    },
    leaderboard: {
      empty: "Aucune donnée pour l’instant. Terminez des niveaux pour apparaître ici.",
      you: "Vous",
      loadError: "Classement indisponible.",
      prestigeShort: (n: number) => `P${n}`,
      contractsInline: (n: number) => `${n} contrats`,
      maxScoreLabel: "Meilleure valorisation",
      meritHint: "Tri : prestige → contrats → meilleure valorisation.",
    },
    shop: {
      coinsLabel: "Vos Ponzi Coins :",
      coinsUnit: "pièces",
      priceCoins: (n: number) => `${n} pièces`,
      buy: "Acheter",
      /** CTA boutique — boosters (lisible sur fond dégradé). */
      ctaAcquire: "Acquérir",
      comingSoon: "Bientôt",
      comingSoonEllipsis: "…",
      sectionBlackMarket: "Marché Noir (Boosters)",
      sectionPrestige: "Boutique Prestige (Cosmétiques)",
      sectionFunds: "Fonds d’Investissement",
      insufficient: "Solde insuffisant.",
      boughtSurvival: "Parachute Doré activé — vies rechargées.",
      boughtDemolition: "Expropriation sauvage ajoutée à la mallette (+1).",
      boughtSpy: "Délit d'Initié : +1 espion ajouté à la mallette.",
      packSurvivalTitle: "Parachute Doré (3 vies)",
      packSurvivalDesc: "Le Board éponge vos pertes. Recharge complète de l'énergie.",
      demolitionTitle: "Expropriation Sauvage",
      demolitionDesc: "Le droit de propriété est une suggestion. +1 démolition.",
      spyTitle: "Délit d'Initié",
      spyDesc: "Informations illégales. +1 utilisation espion (aperçu 4 prochains).",
      teaserCeoTitle: "Titre de CEO : Loup de Wall Street",
      teaserCeoDesc: "Brillez dans le classement avec ce titre exclusif.",
      teaserThemeTitle: "Thème : Grille Néon",
      teaserThemeDesc: "Skin holographique pour votre ville.",
      teaserBriefcaseTitle: "Mallette de Ponzi Coins",
      teaserBriefcaseDesc: "+5000 💰.",
    },
    blackMarket: {
      title: "Marché noir",
      ceoDialogue:
        "Le Board ferme les yeux sur l’origine de cette liquidité. Payez, choisissez, et faites taire la conformité.",
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
    unlockMemos: {
      shopMemoHeader: "Mémo Board — Ligne de crédit",
      towerMemoHeader: "Mémo Board — Actifs structurés",
      shopKicker: "La Boutique vous attend",
      shopQuote:
        "Stagiaire, j'ai autorisé l'ouverture de votre ligne de crédit. La Boutique est ouverte. Dépensez intelligemment.",
      towerKicker: "La Tour s'ouvre à vous",
      towerQuote:
        "Bienvenue dans la cour des grands. La Tour Ponzi (QG) est désormais accessible. Faites travailler l'argent des autres.",
    },
    ceoStory: {
      memos: {
        "1": {
          kicker: "Acte I — La Ceinture des Startups",
          quote:
            "Si vous lisez ceci, vous avez survécu au onboarding. Félicitations : vous êtes officiellement toxique pour le climat moral de l’open space.",
        },
        "11": {
          kicker: "Acte II — Nébuleuse de l’Endettement",
          quote:
            "Les taux montent, les promesses aussi. Un bon CEO ne paie jamais en cash — il paie en narratif. Continuez à empiler les actifs, pas les excuses.",
        },
        "21": {
          kicker: "Acte III — Archipel des Offshore",
          quote:
            "Premières contraintes de deck, capitaux flottants : le marché devient liquide, opaque, et surtout… facturable. Naviguez entre les îlots réglementaires.",
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
      levelKicker: (levelId: number) => `Trimestre ${levelId} · Clôturé`,
      rewardsTitle: "Contrats signés",
      finalYieldLabel: "Valorisation pour signer les contrats",
      starsAriaNone: "Aucun contrat signé sur 3",
      starsAria: (earned: number) =>
        earned <= 1
          ? `${earned} contrat signé sur 3`
          : `${earned} contrats signés sur 3`,
      msUnit: VALORIZATION_MS_UNIT,
      minimizeAria: "Réduire le bilan",
      reopenBilanSr: "Rouvrir le bilan",
      replay: "Réinvestir (Rejouer)",
      continue: "Prochain Trimestre",
      shareSummary: "Publier le bilan",
      shareCopied: "Copié ✓",
      shareRetry: "Réessayer",
      shareFeedbackCopied: "Résumé copié dans le presse-papiers.",
      shareFeedbackError: "Copie impossible sur cet appareil.",
      closeSeeGrid: "Fermer — voir la grille",
      insufficientTitle: "Redressement Judiciaire",
      insufficientBody: "Le Board vous retire sa confiance. (−1 vie)",
      /** 1★ sans mandat cassé : pas de perte de vie côté économie — message aligné. */
      insufficientBodyPartialSuccess:
        "Un seul contrat : le Board limite les dégâts. Aucune vie perdue sur ce trimestre — viser 2 ou 3 contrats au prochain bilan.",
      mandateFailedTitle: "Mandat non tenu",
      mandateFailedLead:
        "Le mandat grille n’a pas été respecté (pas un problème de valorisation M$ seule).",
      mandateFailedBody:
        "Conditions grille non remplies (ex. forêts). Valorisation OK, 0 contrat signé : le mandat prime.",
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
      nextStopLevel: (n: number) => `Suite : T${n}`,
      escapeOrBackdropHint: "Échap / fond : réduire",
      backToHqCountdown: (seconds: number) => `QG dans ${seconds}s`,
      /** Convocation CEO / mémo hub — CTA primaire quand la carte est requise avant le niveau suivant. */
      returnToHqRequired: "Retour au QG (Message du Board)",
      pendingMemoMapFirst: "Le Board exige un passage par la carte avant la suite.",
      failureStampText: "REDRESSEMENT FISCAL",
    },
    statsRse: {
      sectionTitle: "Bilan RSE & RH",
      carbonTitle: "Empreinte Carbone",
      carbonValue: (tons: number) => `${tons} Tonnes`,
      burnoutTitle: "Stagiaires en Burn-out",
      burnoutValue: (n: number) => `${n}`,
    },
    energy: {
      kicker: "Énergie",
      title: "Cessation de paiement !",
      body: "Vos avocats gagnent du temps (recharge auto) ou achetez un Parachute Doré.",
      dismiss: "Fermer",
      shareForLife: "Gagner 1 Vie 🎁",
      shareForLifeHint: "Partagez le jeu : +1 vie (une fois par jour).",
      shareForLifeUsed: "Bonus partage déjà utilisé aujourd’hui.",
      shareTwitter: "Partager sur X",
      shareCopy: (gameUrl: string) =>
        `Je viens de ruiner l'économie sur Planète Ponzi ! Battez ma valorisation : ${gameUrl}`,
    },
    corruptionRoulette: {
      solicitBoard: "Solliciter le Board",
      solicitSubtitle: "Obtenir un plein de vies gratuit via les canaux officiels.",
      rhAdClose: "Compris. Retour au travail.",
      rhQuotes: [
        "Rappel RH : Le sommeil est un vol de temps productif.",
        "Rappel RH : Le syndicalisme nuit gravement à votre carrière.",
        "Rappel RH : Votre famille ne vous paie pas, nous si. Respectez la hiérarchie.",
      ],
      bribeTitle: "Caisse Noire du Board",
      bribeBody:
        "Le Board refuse de diffuser des publicités de bas étage. Pour débloquer des fonds d'urgence, versez un pot-de-vin (soutien au développeur).",
      bribeAction: "Graisser la patte (Buy Me A Coffee)",
      bribeDecline: "Mendier des vies (Refuser)",
    },
    rules: {
      title: "Règles",
      kicker: "Grille & valorisation",
      modalCloseAria: "Fermer les règles",
      inductionKicker: "Manuel d’induction",
      inductionTitle: "Directives du Board",
      inductionSectorLine: (sectorName: string) =>
        `Secteur actuel : ${sectorName} — les icônes ci-dessous suivent votre biome.`,
      fiscalStampLabel: "GELÉ",
      megaStructureTitle: "Méga-structures (fusion 2×2)",
      megaStructureBody:
        "Placez quatre mines (usines) en carré 2×2 pour former le Complexe industriel : 30 M$ de ligne unique (plus le bonus Tour sur les quatre mines). La couronne d’une case tout autour du carré — côtés et diagonales — ne rapporte aucun M$ au bilan ; le reste de la grille compte normalement.",
      fiscalBossTitle: "Contrôle fiscal (Boss)",
      fiscalBossBody:
        "Tous les 10 niveaux (Niveaux Boss), le Fisc s'invite ! Tous les 4 tours de jeu, le Fisc gèlera votre case la plus rentable. Une case gelée rapporte 0 M$ à la fin de la partie. Construisez intelligemment pour minimiser les pertes.",
      fiscalFreezeTutorialBody:
        "Le Fisc vient de geler votre case la plus rentable : elle comptera pour 0 M$ au bilan final. Sur ce mandat Boss, le gel se répète tous les 4 tours — anticipez pour limiter l’impact.",
      fiscalFreezeTutorialCta: "J'ai compris",
      directive1Label: "Directive n°1 — Synergie de groupe",
      directive1Body:
        "Alignez quatre mines en carré 2×2 : fusion « méga-structure » industrielle — 30 M$ + bonus mines sur le bloc ; la couronne adjacente (rayon 1) est valorisée à 0 M$, le reste du plateau compte comme d’habitude (autres bâtiments : pas de fusion méga).",
      directive2Label: "Directive n°2 — Optimisation fiscale",
      directive2Body:
        "Sur les mandats Boss (tous les 10 niveaux), le fisc fige périodiquement votre case la plus rentable : elle tombe à 0 M$ au bilan. Anticipez la cadence des gels.",
      directive3Label: "Directive n°3 — Marchés sectoriels",
      directive3Body:
        "Chaque tranche de 10 niveaux change de secteur : matière noire (cases bloquées), austérité (eau amplifiée, mines pénalisées), flux tendus (bonus d’alignement), quotas, chaos… Lisez le briefing avant d’engager le capital.",
      summaryPartyTitle: "Partie",
      summaryPartyFixedOrder: "ordre fixe",
      summaryPartyNeighbors: "voisins",
      summaryPartyNoDiag: "pas diag.",
      summaryRoiTitle: "ROI affiché",
      summaryRoiFormulaLeft: "Σ cases",
      summaryRoiFormulaMode: "mode",
      summaryRoiFormulaResult: "arrondi",
      summaryPerCellTitle: "M$ par case",
      summaryMineBase: "+3 M$ (Évolutif)",
      summarySerreHint:
        "Serre : 1 M$ de base + bonus voisins · Eau : 0 si aucun voisin éligible",
      summaryChip4x4: "4×4",
      summaryChipOrth: "⊥",
      summaryLabelMine: "Mine",
      summaryLabelHabitacle: "Habitacle",
      summaryLabelSerre: "Serre",
      summaryLabelWater: "Eau",
      summaryLabelSerreNeighbor: "Serre voisine",
      summaryFormulaIsolation: "0 M$",
      summaryFormulaSerreResult: "1 + n M$",
      summaryFormulaWaterNeighbor: "+2 M$ / voisin",
    },
    tutorial: {
      coachDirectiveKicker: "Coach du Board",
      coachBubbleTitle: "CEO / Board",
      coachTapContinue: "▶ Appuyez pour continuer",
      coachCellHint: "Ici",
      level1PlaceMine: "Placez l'usine ici",
      level1Directive1Title: "Directive #1",
      level1Directive1Body: "Posez ces mines ici. C'est le début de votre empire.",
      level1Directive2Title: "Directive #2",
      level1Directive2Body:
        "Regardez ces 4 bâtiments fusionner. C'est beau, c'est rentable, c'est nous.",
      level1FusionToast:
        "Fusion réussie ! Les méga-structures rapportent beaucoup plus !",
      level1FusionToastCeo:
        "Vous voyez ce carré de 4 mines ? C'est ça, la synergie d'entreprise !",
      skip: "Passer",
      next: "Suivant",
      done: "Choisir le mode",
      step1Title: "Bienvenue, Stagiaire.",
      step1Body:
        "1. Regroupez les bâtiments identiques. 2. Atteignez l'objectif financier. 3. Survivez. Le Board n'accepte aucune excuse.",
      step2Title: "Cadence",
      step2Body:
        "Une case par tour. Voisins = haut, bas, gauche, droite — pas en diagonale : ce n’est pas la philanthropie.",
      step3Title: "Bilan",
      step3Body:
        "Le ROI affiché tranche. Trois contrats si vous performez ; sinon le mandat prime sur la valorisation. Capitalisme, pas crèche.",
    },
    /** Messages cyniques du Board pendant le coach (niveaux 1–3). Clés = `tutorial-config`. */
    tutorialCoach: {
      intro_1: "Ah, le nouveau CEO ! Bienvenue chez Planète Ponzi.",
      intro_2: "Notre mission : raser des planètes vierges pour maximiser nos profits.",
      intro_3: "Commençons l'extraction. Posez cet Habitacle (🏢) sur la case indiquée.",
      l1_t0:
        "Commençons l'extraction. Posez cet Habitacle (🏢) sur la case indiquée.",
      l1_t1:
        "L'Eau (💧) rapporte +2 M$ par Habitacle adjacent. Collez-les !",
      l1_t2:
        "Plus le groupe est grand, plus la valorisation explose. Continuez.",
      l1_t3:
        "Dernière case. Remplissez l'espace, le vide ne rapporte rien.",
      l1_free:
        "Continuez à regrouper les mêmes couleurs. Le Board vous regarde.",
      l2_t0:
        "Nouveau niveau, nouveau contrat. Vous connaissez la base.",
      l2_t1:
        "Seuls les voisins directs comptent (Haut, Bas, Gauche, Droite). Pas de diagonales.",
      l2_t2:
        "Construisez un bloc solide pour augmenter la valorisation.",
      l2_t3:
        "Voici une Mine (⛏️). Elle augmente la valeur de TOUTE la grille. Posez-la !",
      l2_free:
        "La Mine est en place. Complétez la grille pour maximiser son effet.",
      l3_t0:
        "Attention à l'obstacle (🕳️). Vous ne pouvez rien y construire.",
      l3_t1:
        "Regardez le Mandat en bas : il vous faut au moins 2 Habitacles (🏢).",
      l3_t2:
        "Gérez bien l'espace. La grille est plus petite cette fois.",
      l3_t3:
        "Dernier coup guidé. Maintenant, remplissez l'objectif (Mandat) seul, ou vous êtes viré.",
      l3_free:
        "Le Board attend ses résultats. Remplissez le Mandat ou démissionnez.",
    },
  },
  en: {
    brand: {
      name: "Planète Ponzi",
      tagline: "Orbital capitalism. One mandate per day.",
    },
    homeSplash: {
      displayTitle: "PLANÈTE PONZI",
      slogan: "A cynical capitalist puzzle game",
      boardLine1: "Ready for the next board round?",
      boardLine2: "The Board is waiting on your numbers.",
      boardLine3: "Optimize the grid. Maximize profit.",
      cta: "Enter the session",
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
      passiveYieldChip: (n: number) => `+${n} 💰 / MIN`,
      sectorHudCompact: (roman: string, planetName: string, done: number) =>
        `Sector ${roman}: ${planetName} · ${done}/10`,
      sectorProgressHint: (roman: string, planetName: string, done: number, total: number) =>
        `Progress: ${planetName} (sector ${roman}) — ${done} of ${total} markets`,
      headerStarsCompact: (n: number) => `${n} contracts`,
      starGateHint: "Earn more contracts in this sector to challenge the Boss!",
      starGateBadge: (n: number, cap: number) => `${n} / ${cap}`,
      offlinePassiveToast: (gain: number) =>
        `Your rigs minted +${gain} 💰 while you were away!`,
    },
    economy: {
      offlineGain: (gain: number) =>
        `Your rigs minted +${gain} 💰 while you were away`,
    },
    grid: {
      cellEmpty: (n: number) => `Cell ${n}, empty`,
      cellObstacle: (n: number, obstacleName: string) => `${obstacleName} — cell ${n}`,
      cellBuilding: (name: string) => `Building ${name}`,
      cellDemolish: (name: string, n: number) => `Demolish ${name} — cell ${n}`,
      fiscalFreezeTitle: "Tax audit — 0 M$ on this cell",
      ariaGrid: "Four by four placement grid",
      ariaGridDemolition: "Grid — demolition mode",
    },
    biomes: BIOME_ROWS_EN,
    manifest: {
      deckTypesHidden: (n: number) => (n <= 1 ? "1 hidden type" : `${n} hidden types`),
      nextTilesLabel: "Up next",
      spyNextTilesLabel: "Spy · 4 tiles",
      hiddenNextTilesHint: "Masked accounts",
      manifestHeader: (levelId: number, seed: string) =>
        `Cargo · Level ${levelId} · ${seed}`,
    },
    installPwa: {
      bannerText: "Install Planète Ponzi to play offline! 🚀",
      installCta: "Install",
      dismissAria: "Dismiss for this session",
      bannerAria: "App install offer",
      iosModalTitle: "Add to Home Screen (iOS)",
      iosModalBody:
        "Tap the Share button ⬆️ at the bottom, then “Add to Home Screen” to install Planète Ponzi like an app.",
      closeCta: "OK",
    },
    nav: {
      map: "Market Map",
      empire: "Tower",
      shop: "Shop",
      leaderboard: "Leaderboard",
      bank: "Archives",
      support: "Lobbying (Support)",
      home: "Home",
      backToMap: "Back to Markets",
      menu: "Menu",
      closeMenu: "Close menu",
      settings: "Compliance (Settings)",
      languages: "Languages",
      resetCareer: "Shred evidence (Reset)",
      resetConfirm: "Erase all local progress (levels, contracts)?",
      restartLevel: "Restructure (Restart)",
    },
    gameHud: {
      valorization: "VALUATION",
      valorizationShort: "VAL.",
    },
    cloudSave: {
      sectionTitle: "Cloud save",
      sectionBody:
        "Sign in to sync levels, contracts, prestige, and economy across devices. Without an account, progress stays 100% local (guest).",
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
    settingsA11y: {
      sectionTitle: "Accessibility",
      hapticsLabel: "Haptic feedback (vibrations)",
      hapticsBody:
        "Turn phone vibrations on or off for in-game actions (placements, wins, purchases).",
    },
    settingsAudio: {
      sectionTitle: "Audio",
      soundLabel: "Sound effects",
      soundBody: "Enable or mute in-game bleeps and jingles (Web Audio).",
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
    briefing: {
      contractTiersBlurb:
        "Each mandate sets three valuation (M$) thresholds — they determine how many contracts you sign.",
    },
    modalDialogue: {
      mandat:
        "Here are your objectives for this sector, CEO. Don't disappoint the Board.",
      win: "Excellent ROI! The Board is pleased... for now.",
      loss: "Catastrophic numbers. You are a financial sinkhole.",
      daily: "A little stimulus to boost your productivity. Get to work.",
    },
    entryFlow: {
      mandate: "Mandate",
      objectives: "Contract Objectives",
      starStripAria:
        "Valuation thresholds: M$ required to sign 1, 2, or 3 contracts on this mandate",
      msUnit: VALORIZATION_MS_UNIT,
      cta: "Start extraction",
      ctaSub: "Play",
      loading: "Loading mandate…",
      maxEstimatedLabel: "Est. cap",
      starCard1: "1st contract",
      starCard2: "2nd contract",
      starCard3: "3rd contract",
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
      globalYieldBanner: (n: number) => `CURRENT GLOBAL YIELD: +${n} 💰 / MINUTE`,
      yieldBadge: (n: number) => `YIELD: +${n} 💰 / MIN`,
      yieldLabel: "Yield:",
      yieldUnit: "💰 / min",
      activeFloorTag: "[ ACTIVE ]",
      effectBadgePrefix: "EFFECT:",
      effectFasterRecharge: "Life recharge 20 min → 15 min",
      effectMineBonus: (n: number) => `+${n} M$ scoring / mine`,
      effectLivesMax: (n: number) => `+${n} max lives`,
      effectLivesAndMine: (lives: number, minePts: number) =>
        `+${lives} max lives · +${minePts}\u202fM$ / mine`,
      amortizedHours: (hours: number) => {
        if (!Number.isFinite(hours) || hours <= 0) return "";
        if (hours < 1 / 60) return "< 1 min payback";
        if (hours < 1) return `Payback in ${Math.max(1, Math.round(hours * 60))} min`;
        if (hours < 48) return `Payback in ${hours.toFixed(1)} h`;
        return `Payback in ${(hours / 24).toFixed(1)} d`;
      },
      purchased: "Owned",
      locked: "Locked",
      buyFor: "Buy",
      needLower: "Unlock the floor below first.",
      insufficient: "Not enough coins.",
      purchaseSuccess: "Floor acquired!",
      prestigeKicker: "Prestige",
      prestigeScoreBonus: "+10% final valuation per prestige tier (every run).",
      prestigeCurrent: (n: number) => `Current tier: ${n}`,
      bankruptcyCta: "File for bankruptcy",
      bankruptcyLocked: "Reach the Private Helipad to liquidate the tower.",
      bankruptcyModalTitle: "Strategic bankruptcy?",
      bankruptcyModalBody:
        "The tower resets, your Ponzi Coins are seized, but your prestige tier rises — boosting your valuation on every mandate.",
      bankruptcyConfirm: "Liquidate",
      bankruptcyCancel: "Cancel",
      bankruptcyDone: "Bankruptcy filed. The board loves your resilience.",
    },
    leaderboard: {
      empty: "No entries yet. Finish levels to show up here.",
      you: "You",
      loadError: "Leaderboard unavailable.",
      prestigeShort: (n: number) => `P${n}`,
      contractsInline: (n: number) => `${n} contracts`,
      maxScoreLabel: "Best valuation",
      meritHint: "Order: prestige → contracts → best valuation.",
    },
    shop: {
      coinsLabel: "Your Ponzi Coins:",
      coinsUnit: "coins",
      priceCoins: (n: number) => `${n} coins`,
      buy: "Buy",
      ctaAcquire: "Acquire",
      comingSoon: "Coming soon",
      comingSoonEllipsis: "…",
      sectionBlackMarket: "Black market (boosters)",
      sectionPrestige: "Prestige boutique (cosmetics)",
      sectionFunds: "Investment funds",
      insufficient: "Not enough coins.",
      boughtSurvival: "Golden Parachute deployed — lives refilled.",
      boughtDemolition: "Hostile expropriation added to your kit (+1).",
      boughtSpy: "Insider trading: +1 spy added to your kit.",
      packSurvivalTitle: "Golden Parachute (3 lives)",
      packSurvivalDesc: "The Board covers your losses. Full energy refill.",
      demolitionTitle: "Hostile Expropriation",
      demolitionDesc: "Property rights are merely suggestions. +1 demolition.",
      spyTitle: "Insider Trading",
      spyDesc: "Illegal intel. +1 spy use (peek next 4).",
      teaserCeoTitle: "CEO title: Wolf of Wall Street",
      teaserCeoDesc: "Stand out on the leaderboard with this exclusive title.",
      teaserThemeTitle: "Theme: Neon grid",
      teaserThemeDesc: "Holographic skin for your city.",
      teaserBriefcaseTitle: "Ponzi Coins briefcase",
      teaserBriefcaseDesc: "+5000 💰.",
    },
    blackMarket: {
      title: "Black market",
      ceoDialogue:
        "The Board looks away from where this liquidity came from. Pay, pick your tile, and keep compliance quiet.",
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
    unlockMemos: {
      shopMemoHeader: "Board memo — Credit line",
      towerMemoHeader: "Board memo — Structured assets",
      shopKicker: "The Shop is open",
      shopQuote:
        "Intern, I’ve authorized your credit line. The Shop is open. Spend wisely.",
      towerKicker: "The Tower awaits",
      towerQuote:
        "Welcome to the inner circle. Ponzi Tower (HQ) is now unlocked. Put other people’s money to work.",
    },
    ceoStory: {
      memos: {
        "1": {
          kicker: "Act I — Startup Belt",
          quote:
            "If you’re reading this, you survived onboarding. Congrats: you’re now officially hazardous to the open-plan vibe.",
        },
        "11": {
          kicker: "Act II — Debt Nebula",
          quote:
            "Rates rise, promises rise faster. A good CEO never pays in cash—only in narrative. Keep stacking assets, not apologies.",
        },
        "21": {
          kicker: "Act III — Offshore Archipelago",
          quote:
            "First deck pressure, capital adrift: the market turns liquid, opaque, and—above all—billable. Sail between regulatory islands.",
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
      levelKicker: (levelId: number) => `Q${levelId} · Closed`,
      rewardsTitle: "Signed contracts",
      finalYieldLabel: "Valuation to sign contracts",
      starsAriaNone: "No contract signed out of 3",
      starsAria: (earned: number) =>
        `${earned} contract${earned > 1 ? "s" : ""} signed out of 3`,
      msUnit: VALORIZATION_MS_UNIT,
      minimizeAria: "Shrink summary",
      reopenBilanSr: "Open summary again",
      replay: "Reinvest (Replay)",
      continue: "Next Quarter",
      shareSummary: "Press Release",
      shareCopied: "Copied ✓",
      shareRetry: "Try again",
      shareFeedbackCopied: "Summary copied to clipboard.",
      shareFeedbackError: "Could not copy on this device.",
      closeSeeGrid: "Close — view grid",
      insufficientTitle: "Chapter 11 Bankruptcy",
      insufficientBody: "The Board has lost confidence in you. (−1 life)",
      insufficientBodyPartialSuccess:
        "Only one contract signed—the damage is contained. No life lost this quarter—aim for 2–3 contracts next time.",
      mandateFailedTitle: "Mandate not met",
      mandateFailedLead: "Grid mandate failed (not just M$ valuation).",
      mandateFailedBody:
        "Grid rules not met (e.g. forests). OK valuation, 0 contracts signed — mandate wins.",
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
      nextStopLevel: (n: number) => `Next: Q${n}`,
      escapeOrBackdropHint: "Esc / backdrop: shrink",
      backToHqCountdown: (seconds: number) => `HQ in ${seconds}s`,
      returnToHqRequired: "Return to HQ (Board message)",
      pendingMemoMapFirst: "The Board requires a stop at the map before you continue.",
      failureStampText: "AUDIT FAILED",
    },
    statsRse: {
      sectionTitle: "ESG & HR Report",
      carbonTitle: "Carbon footprint",
      carbonValue: (tons: number) => `${tons} metric tons`,
      burnoutTitle: "Interns in burnout",
      burnoutValue: (n: number) => `${n}`,
    },
    energy: {
      kicker: "Energy",
      title: "Liquidity Crisis!",
      body: "Your lawyers are stalling (auto-recharge) or buy a Golden Parachute.",
      dismiss: "Close",
      shareForLife: "Earn 1 life 🎁",
      shareForLifeHint: "Share the game: +1 life (once per day).",
      shareForLifeUsed: "Share bonus already claimed today.",
      shareTwitter: "Share on X",
      shareCopy: (gameUrl: string) =>
        `I just wrecked the economy on Planète Ponzi! Beat my valuation: ${gameUrl}`,
    },
    corruptionRoulette: {
      solicitBoard: "Lobby the Board",
      solicitSubtitle: "Get a free full life top-up through official channels.",
      rhAdClose: "Understood. Back to work.",
      rhQuotes: [
        "HR reminder: Sleep is theft of productive time.",
        "HR reminder: Unionizing is severely detrimental to your career.",
        "HR reminder: Your family doesn't pay you—we do. Respect the chain of command.",
      ],
      bribeTitle: "Board slush fund",
      bribeBody:
        "The Board refuses to run low-rent ads. To unlock emergency funds, grease the wheels (support the developer).",
      bribeAction: "Grease the palm (Buy Me a Coffee)",
      bribeDecline: "Beg for lives (Decline)",
    },
    rules: {
      title: "Rules",
      kicker: "Grid & valuation",
      modalCloseAria: "Close rules",
      inductionKicker: "Induction manual",
      inductionTitle: "Board directives",
      inductionSectorLine: (sectorName: string) =>
        `Current sector: ${sectorName} — icons below match your biome.`,
      fiscalStampLabel: "FROZEN",
      megaStructureTitle: "Mega-structures (2×2 fusion)",
      megaStructureBody:
        "Place four mines (factories) in a 2×2 square to form the Industrial Complex: one 30 M$ line item (plus your per-mine tower bonus on all four tiles). The one-tile ring around the square—including diagonals—scores 0 M$; the rest of the grid scores normally.",
      fiscalBossTitle: "Tax audit (Boss levels)",
      fiscalBossBody:
        "Every 10 levels (Boss levels), the taxman shows up! Every 4 turns, the taxman freezes your highest‑yielding cell. A frozen cell pays 0 M$ at the end of the run. Build smart to limit the damage.",
      fiscalFreezeTutorialBody:
        "The taxman just froze your highest‑yielding cell: it will count as 0 M$ in the final tally. On this Boss mandate, a freeze happens every 4 turns — plan ahead to limit the damage.",
      fiscalFreezeTutorialCta: "Got it",
      directive1Label: "Directive #1 — Group synergy",
      directive1Body:
        "Place four mines in a 2×2 square for the industrial mega-structure fusion — 30 M$ plus mine bonuses on the block; the ring of adjacent tiles (including diagonals) around the square pays 0 M$, the rest of the board scores as usual (other building types do not mega-fuse).",
      directive2Label: "Directive #2 — Tax optimization",
      directive2Body:
        "On Boss mandates (every 10 levels), the tax office periodically freezes your top-yielding cell: it pays 0 M$ in the final tally. Plan around the freeze cadence.",
      directive3Label: "Directive #3 — Sector markets",
      directive3Body:
        "Each 10-level band is a different sector: dark matter tiles, austerity (water up, mines taxed), flow bonuses, quotas, chaos… Read the briefing before you deploy capital.",
      summaryPartyTitle: "Match",
      summaryPartyFixedOrder: "fixed order",
      summaryPartyNeighbors: "neighbors",
      summaryPartyNoDiag: "no diag.",
      summaryRoiTitle: "Displayed ROI",
      summaryRoiFormulaLeft: "Σ cells",
      summaryRoiFormulaMode: "mode",
      summaryRoiFormulaResult: "rounded",
      summaryPerCellTitle: "M$ per cell",
      summaryMineBase: "+3 M$ (Scales)",
      summarySerreHint:
        "Greenhouse: 1 M$ base + neighbor bonus · Water: 0 if no eligible neighbor",
      summaryChip4x4: "4×4",
      summaryChipOrth: "⊥",
      summaryLabelMine: "Mine",
      summaryLabelHabitacle: "Habitat",
      summaryLabelSerre: "Greenhouse",
      summaryLabelWater: "Water",
      summaryLabelSerreNeighbor: "Adjacent greenhouse",
      summaryFormulaIsolation: "0 M$",
      summaryFormulaSerreResult: "1 + n M$",
      summaryFormulaWaterNeighbor: "+2 M$ / neighbor",
    },
    tutorial: {
      coachDirectiveKicker: "Board coach",
      coachBubbleTitle: "CEO / Board",
      coachTapContinue: "▶ Tap to continue",
      coachCellHint: "Here",
      level1PlaceMine: "Place the factory here",
      level1Directive1Title: "Directive #1",
      level1Directive1Body: "Drop those mines right here. This is where your empire starts.",
      level1Directive2Title: "Directive #2",
      level1Directive2Body:
        "Watch those four buildings merge. It’s beautiful, it’s profitable, it’s us.",
      level1FusionToast: "Fusion complete! Mega-structures pay a lot more!",
      level1FusionToastCeo:
        "See that 2×2 block of mines? That's what we call corporate synergy.",
      skip: "Skip",
      next: "Next",
      done: "Pick mode",
      step1Title: "Welcome, Intern.",
      step1Body:
        "1. Group identical buildings. 2. Hit the financial target. 3. Survive. The Board accepts no excuses.",
      step2Title: "Cadence",
      step2Body:
        "One cell per turn. Neighbors = up, down, left, right — no diagonals; this isn’t charity.",
      step3Title: "Valuation",
      step3Body:
        "Displayed ROI decides. Three contracts if you deliver; otherwise the mandate beats raw valuation. Capitalism, not daycare.",
    },
    tutorialCoach: {
      intro_1: "Ah, the new CEO! Welcome to Planet Ponzi.",
      intro_2: "Our mission: exploiting pristine planets for maximum profit.",
      intro_3: "Let's begin extraction. Place this Habitat (🏢) on the indicated tile.",
      l1_t0:
        "Let's begin extraction. Place this Habitat (🏢) on the indicated tile.",
      l1_t1:
        "Water (💧) earns +2 M$ per adjacent Habitat. Connect them!",
      l1_t2:
        "The bigger the group, the higher the valuation. Keep going.",
      l1_t3:
        "Last tile. Fill the space, emptiness pays nothing.",
      l1_free:
        "Keep grouping the same colors. The Board is watching.",
      l2_t0:
        "New level, new contract. You know the basics.",
      l2_t1:
        "Only direct neighbors count (Up, Down, Left, Right). No diagonals.",
      l2_t2:
        "Build a solid block to increase valuation.",
      l2_t3:
        "Here is a Mine (⛏️). It boosts the value of the ENTIRE grid. Place it!",
      l2_free:
        "The Mine is placed. Complete the grid to maximize its effect.",
      l3_t0:
        "Watch out for the obstacle (🕳️). You cannot build there.",
      l3_t1:
        "Look at the Mandate below: you need at least 2 Habitats (🏢).",
      l3_t2:
        "Manage your space well. The grid is smaller this time.",
      l3_t3:
        "Last guided move. Now, complete the Mandate alone, or you're fired.",
      l3_free:
        "The Board awaits results. Fulfill the Mandate or resign.",
    },
  },
} as const;

export function getStrings(locale: Locale) {
  return strings[locale];
}
