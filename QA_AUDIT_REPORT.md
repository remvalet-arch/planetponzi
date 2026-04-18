# Planet Ponzi — Rapport d’audit statique QA (V1.1)

**Périmètre :** `src/` (priorité `components/`, `app/`), dictionnaire `src/lib/i18n/strings.ts`, navigation Next.js.  
**Mode :** audit uniquement (aucune modification du code applicatif).  
**Date de génération :** 2026-04-18.

---

## Synthèse exécutive

| Domaine | Verdict |
|--------|---------|
| **i18n** | Dictionnaire FR/EN cohérent pour les clés définies ; l’UI reste **majoritairement en français en dur** dans les composants (confirmé par le commentaire en tête de `strings.ts`). Plusieurs chaînes **anglaises isolées** (`Tap to Start`, `Buy me a Coffee`, `coins`) créent un mélange FR/EN. |
| **UI / overflow** | Bon usage de `truncate` / `min-w-0` à plusieurs endroits critiques ; risques résiduels sur **libellés longs** (CTA multi-mots, stats, briefing) et sur **nombres + libellés** dans des pills étroites. |
| **Navigation** | Peu d’**impasses** réelles ; des **flux « forcés »** (bonus quotidien, mandat avant partie) exigent une action explicite. **BottomNav** : onglet actif correct sur `/empire` et `/shop` au rafraîchissement ; `/` (splash) n’a pas de barre (attendu). **`/settings`** n’inclut pas la BottomNav (cohérence produit à trancher). |

---

## 1. Localisation (i18n) et textes en dur

### 1.1 Dictionnaire `src/lib/i18n/strings.ts`

- **Structure FR vs EN :** les deux branches `fr` et `en` reprennent les mêmes domaines (`brand`, `planets`, `nav`, `ceoContract`, `dailyBonus`, `entryFlow`, `empirePage`, `leaderboard`, `shop`, `blackMarket`, `storyModal`, `ceoStory`, `endScreen`, `energy`, `rules`, `tutorial`). Aucune **section** présente uniquement en FR n’a été repérée à la lecture statique.
- **Sous-clés sensibles :** `rules` inclut bien `fiscalBossTitle`, `fiscalBossBody`, `fiscalFreezeTutorialBody`, `fiscalFreezeTutorialCta` des deux côtés. Les mémos `ceoStory.memos` utilisent les mêmes clés (`"1"`, `"21"`, etc.) en FR et EN.
- **Recommandation outillage :** ajouter en CI un script de **parité des clés** (parcours récursif des objets `strings.fr` / `strings.en`) pour éviter les régressions futures ; ce rapport ne remplace pas ce contrôle automatisé.

### 1.2 Métadonnées et document racine

| Emplacement | Observation |
|-------------|---------------|
| `src/app/layout.tsx` | `lang="fr"` fixe ; `siteDescription`, `keywords`, OpenGraph `locale: "fr_FR"` en français — **non synchronisés** avec la locale UI choisie par l’utilisateur. |

### 1.3 Données métier françaises (hors dictionnaire)

| Fichier / source | Contenu |
|------------------|---------|
| `src/lib/empire-tower.ts` | Noms et descriptions d’étages (`EMPIRE_FLOORS`) en français. |
| `src/lib/difficulty.ts` | `getDeckChallengeTitle` : libellés de mode (« Transparent », « 1 inconnue », …) en français **pour toutes les locales**. `formatMultiplierFr` force `toLocaleString("fr-FR", …)` → format numérique français même en EN. |

### 1.4 Textes français (ou non passés par `t`) dans le JSX / chaînes UI

Liste orientée **exhaustivité relative** (scan accents + revue ciblée des écrans). Les commentaires et clés techniques seuls sont exclus.

#### `src/app/`

| Fichier | Texte / comportement |
|---------|----------------------|
| `level/[id]/page.tsx` | `formatRoi` : suffixe **`pts`** ; écran chargement **« Chargement du mandat »**, **« Synchronisation avec votre session locale… »** ; toast **« Grille réinitialisée — … »** ; bandeau mandat **« Mandat terrain »**, **« Bâtiment à placer »**, **« tour »** dans la ligne `nextType · tour …`. |
| `~offline/page.tsx` | Titres, paragraphe, bouton **« Retour à l'accueil »** ; métadonnée titre **« Hors ligne »**. |
| `settings/page.tsx` | **« Cette section sera enrichie dans une prochaine itération. »** |
| `support/SupportShell.tsx` | Bloc **« Merci »**, titre **« Un mot du développeur »**, paragraphe entier en FR ; **« Lien externe — s'ouvre dans un nouvel onglet »** ; CTA externe **« Buy me a Coffee »** (anglais). |

#### `src/components/layout/`

| Fichier | Texte |
|---------|--------|
| `AppHeader.tsx` | `aria-label` **« Ouvrir le menu »** / **« Fermer le menu »** ; `aria-label` **« Navigation principale »** ; en-tête **« Saga · Grille 4×4 »**, titre gradient **« Planet Ponzi »** ; **« Score »** ; bouton menu **« Règles »** ; **« Recommencer le niveau »**. |

#### `src/components/map/`

| Fichier | Texte |
|---------|--------|
| `MapHeader.tsx` | Suffixe **« étoiles »** (non lié à `t`). |
| `MapNavDrawer.tsx` | `aria-label` **« Fermer le menu »**, **« Fermer »**, **« Menu carte »**. |
| `LevelMap.tsx` | `title` / `aria-label` / `sr-only` du type **« Niveau X verrouillé »**, **« terminé, rejouer »**, **« à jouer »**. |
| `DailyBonusModal.tsx` | Contenu principal via `t` ; comportement voir section 3. |

#### `src/components/game/`

| Fichier | Texte |
|---------|--------|
| `EndScreen.tsx` | Feedback **« Résumé copié dans le presse-papiers. »** / **« Copie impossible sur cet appareil. »** ; libellés bouton partage **« Copié ✓ »**, **« Réessayer »**, **« Partager le résumé »** ; `aria-label` **« Réduire le bilan »** ; **« Niveau {id} · terminé »**, **« Récompenses »** ; `aria-label` liste étoiles **« Aucune étoile sur 3 »** / **« N étoile(s) sur 3 »** ; **« Score obtenu : »** ; **« Retour au QG dans 3s… »** ; boutons **« Rejouer »**, **« Continuer »** ; **« Fermer — voir la grille »** ; chip minimisé `sr-only` **« Rouvrir le bilan »**. |
| `BlackMarketModal.tsx` | Bandeau footer **« Coût : »**, **« Solde : »** ; kicker **« Marché noir »** (doublon partiel avec `copy.title` i18n) ; tuiles : libellé technique **`{t}`** (`habitacle`, `eau`, …) — **non traduit** pour l’utilisateur final. |
| `BoostersBar.tsx` | `aria-label` **« Mallette CEO — boosters »** ; libellés dynamiques démolition / espion / lobbying en français. |
| `FiscalFreezeModal.tsx` | Kicker **« Boss »** en dur (le titre principal utilise `t`). |

#### `src/components/ui/`

| Fichier | Texte |
|---------|--------|
| `RulesModal.tsx` | `pp-kicker` **« Règles »** ; `h2` **« Grille & score »** (non synchronisés avec `t.rules.title` / `t.rules.kicker`) ; `aria-label` **« Fermer »**. |
| `RulesSummaryBody.tsx` | Titres de section **« Partie »**, **« ROI affiché »**, **« M$ par case »** ; libellés **« ordre fixe »**, **« voisins »**, **« pas diag. »** ; **« Σ cases »**, **« mode »**, **« arrondi »** ; `TileBox` labels **« Mine »**, **« Habitacle »**, **« Serre »**, **« Serre voisine »**, **« Eau »** ; formules et note de bas de page sur serre / eau en FR. |
| `StatsModal.tsx` | Kicker **« Local »** (anglais / neutre, hors `t`). |

#### `src/components/stats/`

| Fichier | Texte |
|---------|--------|
| `StatsScreen.tsx` | **« Parties terminées »**, **« Inclut … partie(s) sans détail … »** ; **« Série »**, **« Actuelle »**, **« Record »** ; paragraphe explicatif streak ; **« Parties par mode »** ; `title` barres **`${n} partie(s)`** ; `aria-label` **« Détail par difficulté »** ; **« Coeff. ROI »** ; **« Parties »**, **« Moy. ROI »**, **« Record »** ; pied **« Données enregistrées sur cet appareil uniquement. »** |

#### `src/components/landing/`

| Fichier | Texte |
|---------|--------|
| `BriefingOverlay.tsx` | Tableau `tileRows` (titres **Habitacle**, **Eau**, **Serre**, **Mine** + textes) ; **« Briefing CEO »** ; **« Bienvenue chez Ponzi Corp »** ; paragraphes d’intro ; **« Les 4 tuiles »** ; bouton **« J'ai compris — conquérir la galaxie »** ; `aria-label` **« Fermer le briefing »**. |
| `HomeSplash.tsx` | **« Planet Ponzi »**, **« Planet Ponzi Saga »**, tagline **« Conquête · synergies · 100 secteurs »** ; bouton **« Tap to Start »** (**anglais**). |

#### `src/app/shop/page.tsx`

| Texte | Détail |
|--------|--------|
| Prix | Lignes **`{PRICE} coins`** — mot **« coins »** en anglais alors que le reste du shop utilise `t.shop`. |

#### Autres

| Fichier | Texte |
|---------|--------|
| `app/leaderboard/page.tsx` | `aria-label` skeleton **« Chargement du classement »**. |

### 1.5 Chaînes anglaises ou « mix » notables (hors `strings.en`)

- **`HomeSplash`** : **« Tap to Start »** alors que le flux landing / briefing est FR.
- **`SupportShell`** : CTA **« Buy me a Coffee »** (marque anglophone acceptable, mais incohérent avec le corps FR).
- **`StatsModal`** : **« Local »**.
- **`BlackMarketModal`** : types de bâtiments affichés tels quels (identifiants de code).
- **`html lang="fr"`** : ne reflète pas `locale === "en"`.

---

## 2. Risques UI et overflow (boutons, modales, BottomNav)

### 2.1 Points déjà bien traités

- **`BottomNav`** : `min-w-0`, `flex-1`, `truncate` sur le libellé ; `min-h-[3.5rem]` / `sm:min-h-14` — bonne base pour libellés courts (`t.nav.*`).
- **`EconomyHeader`** : `truncate` sur les pièces, `whitespace-nowrap` sur vies / timer ; `max-w-[min(46vw,11rem)]` sur les pills — limite les débordements.
- **`EndScreen`** CTA principaux : `min-h-14`, `w-full` — hauteur minimale confortable.
- **`BlackMarketModal`** grille tuiles : `whitespace-normal break-words` sur le libellé d’action répété (`copy.buy`) — limite le débordement vertical.

### 2.2 Composants / zones à risque (recommandations Tailwind / layout)

| Zone | Risque | Piste de correction (pour phase correctrice) |
|------|--------|-----------------------------------------------|
| **`RulesSummaryBody`** | Lignes `FormulaRow` et listes mode : beaucoup de texte FR court sur mobile ; `flex-wrap` déjà présent — OK modéré. | Sur très petits écrans, envisager `text-[10px]` uniforme ou `gap` réduit ; **éviter** `whitespace-nowrap` sur des phrases futures. |
| **`BriefingOverlay`** CTA footer | **« J'ai compris — conquérir la galaxie »** est long ; `min-h-14` + `px-4` sans `truncate` — peut **casser sur 2 lignes** de hauteur inégale selon police. | `text-center`, `leading-tight`, `px-3`, ou **raccourcir la chaîne** i18n ; éventuellement `sm:text-sm`. |
| **`EndScreen`** | Bandeau optimal / textes longs : déjà `px-1` / `max-w-md` sur bannière. Bouton partage : texte variable **« Partager le résumé »** long en FR. | `text-balance` / `text-center` / `text-xs` sur mobile pour le bouton secondaire. |
| **`AppHeader`** | Bloc titre + `EconomyHeader` + score : `truncate` sur le titre `h1` — OK ; `max-w-[min(42vw,12rem)]` sur économie — **forte densité** si compteur large. | Vérifier visuellement avec `coins` à 7+ chiffres ; ajuster `max-w` ou passer le score sous le header sur XS. |
| **`shop/page.tsx`** | Sous-titre pièces : `whitespace-nowrap` — **dépassement horizontal** possible si `coinsLabel` EN long + gros nombre. | Remplacer par `flex-wrap justify-center` + `text-center` ou retirer `whitespace-nowrap`. |
| **`StatsScreen`** | `dl` en `flex` avec libellés courts — sur **très** petit écran, **« Coeff. ROI »** + valeur peut tasser la colonne pseudo dans la liste du haut (autre section). | Déjà `truncate` sur le nom de mode ; garder `min-w-0` sur les conteneurs flex parents. |
| **`BlackMarketModal`** footer | Une ligne avec coût + solde : `text-xs` sans wrap — **débordement** si localisation allonge la phrase. | `flex-wrap justify-center gap-x-2 text-center` ou empiler **Coût** / **Solde** sur 2 lignes. |
| **`MapHeader`** bloc étoiles | `whitespace-nowrap` sur le conteneur étoiles + suffixe — OK pour « 123 étoiles » court ; si **« stars »** en EN plus long à l’avenir, surveiller. | Remplacer suffixe hardcodé par clé i18n + test EN. |
| **`EmpirePage`** boutons d’achat | Contenu surtout **💰 + nombre** — faible risque ; descriptions `floor.description` longues : déjà `break-words`. | — |
| **`LevelMap`** nœuds | Cercles petits : texte limité aux icônes — OK. | — |

### 2.3 BottomNav et locale

- Les libellés viennent de `t.nav.*` — **pas de texte en dur** dans le composant.
- **Rafraîchissement** : voir section 3.2.

---

## 3. Navigation et cas limites

### 3.1 « Dead ends » et fermeture des vues

| Écran / modale | Fermeture / sortie | Commentaire |
|----------------|-------------------|---------------|
| **`EndScreen`** | Réduire (X, fond, Échap), rouvrir depuis le chip ; liens **Carte** ; **Rejouer** / **Continuer** ; **Fermer — voir la grille**. | Pas d’impasse. |
| **`NoEnergyModal`** | `onClose` renvoie vers **`/map`**. | Sortie claire. |
| **`RulesModal`**, **`StatsModal`**, **`FiscalFreezeModal`** | Fermeture X, fond (selon shell), Échap où implémenté. | OK. |
| **`SupportShell`** | Lien **`t.nav.backToMap`** ; **BottomNav** (dont Carte). | OK. |
| **`StoryModal`** | CTA footer + probable fermeture backdrop (`BottomSheetShell` par défaut). | OK. |
| **`CEOContractModal`** | Fermeture backdrop / interaction shell ; si fermeture sans pseudo, **réouverture** possible via `HomeSplash` — boucle UX mais pas blocage total. | À documenter en test manuel. |
| **`GameEntryFlow`** | `closeOnBackdropPress={false}`, `onClose={() => {}}` — **impossible** de fermer le sheet sans **« Lancer l'exploitation »** (sauf navigation navigateur / retour matériel). | **Flux forcé** (volontaire ?) — pas une impasse absolue mais **stress test** : utilisateur bloqué dans le flux mandat jusqu’à lancer ou quitter la route. |
| **`DailyBonusModal`** | `closeOnBackdropPress={false}` — fermeture uniquement via **« Encaisser »** (`handleClaim` → `onClose`). | **Flux forcé** jusqu’à claim (comportement produit assumé typiquement). |
| **`BriefingOverlay`** | Bouton X, CTA bas, `onClose` = dismiss ; `closeOnBackdropPress={false}`. | Sortie toujours possible via **X** ou CTA. |
| **`~offline/page.tsx`** | Lien vers **`/`**. | Pas de BottomNav ; accès accueil — OK. |
| **`/settings`** | Liens Support + **Retour carte** ; **pas de BottomNav**. | Pas de dead end ; navigation **différente** du reste de l’app (pas d’onglets persistants). |

### 3.2 BottomNav et état actif (rafraîchissement)

**Fichier :** `src/components/layout/BottomNav.tsx`

- **Logique :** `const active = pathname === href || (href === "/map" && pathname === "/");`
- **`/empire`** et **`/shop`** : correspondance stricte `pathname === href` → **au rafraîchissement**, l’onglet correct reste actif.
- **`/map`** : actif pour **`/map`** et pour **`/`** (splash) — le splash **n’affiche pas** la BottomNav dans l’arbre actuel (`HomeSplash` seul sur `/`), donc **pas de conflit visuel**.
- **Routes sans BottomNav :** `/`, `/settings`, `/level/[id]` — pas d’état d’onglet ; **comportement attendu** pour le niveau plein écran ; **incohérence mineure** pour `/settings` vs autres hubs.

### 3.3 Routing (`Link`, `useRouter`)

- Abandon niveau : **`AppHeader`** → lien **`/map`** avec `preventDefault` + `onNavigateToMap` si partie en cours — cohérent avec sortie contrôlée.
- **EndScreen** : navigation auto vers **`/map`** après délai si victoire ; annulable via lien Carte — déjà documenté en commentaire composant.

---

## 4. Recommandations priorisées (pour la phase correctrice — hors périmètre audit)

1. **Centraliser** les chaînes listées en **§1.4–1.5** dans `strings.ts` (ou fichiers par domaine) et **brancher `useAppStrings`** partout où l’UI est encore FR en dur.
2. **`difficulty.ts`** : exposer titres / format multiplicateur **selon `locale`** (ou déplacer les libellés de mode dans `strings`).
3. **`empire-tower.ts`** : prévoir clés i18n par `floor.id` si la V1.1 doit être **100 % bilingue**.
4. **HTML `lang`** et **metadata** : les aligner sur la locale active (ou `lang="en"` dynamique).
5. **UI** : appliquer les ajustements **§2.2** sur les zones à risque identifiées après test manuel sur **320px** et **locale EN**.
6. **CI** : test de parité des clés `strings.fr` / `strings.en` + règle ESLint **no-literal-in-jsx** (progressive) sur `src/components` et `src/app`.

---

*Fin du rapport — généré par audit statique du dépôt.*
