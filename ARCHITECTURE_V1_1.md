# Planet Ponzi — Spécification d’architecture V1.1

**Rôle visé :** cadrage technique avant implémentation.  
**Base actuelle (rappel) :** Next.js, Tailwind, Zustand (`useEconomyStore`, `useProgressStore`, `useLevelRunStore`), Supabase ; grille **4×4** indexée **0–15** ; `Cell = { index, building }` ; séquence de **16** placements ; solver glouton dans `src/lib/solver.ts` (`estimateMaxScore`) sur grille vide **16 cases** ; score via `calculateGridScore` + multiplicateur deck.

---

## 1. Audit d’impact Zustand (Empire & Marché noir)

### 1.1 `useEconomyStore`

- **Aujourd’hui :** `coins`, `lives`, recharge, achats shop (dont survie), pas de notion de “bonus passif”.
- **V1.1 Empire :** les achats d’empire sont des **dépenses de coins** distinctes du shop (ou unifiées derrière un même `spendCoins` avec catégorie — à trancher produit). Il faudra au minimum :
  - soit **étendre** le store avec un sous-état persistant `empire: { nodesUnlocked: Record<NodeId, boolean | number>, … }` ;
  - soit **extraire** tout l’Empire dans un store dédié tout en réutilisant `spendCoins` / garde-fous solde.
- **Marché noir :** dépense **en pleine partie** → le store doit exposer une opération **transactionnelle** du type `trySpendCoins(amount): boolean` (déjà proche de `spendCoins`) sans effet de bord si la case n’est pas achetée. Aucun changement obligatoire sur `lives` ; risque de **race** si plusieurs actions async : garder les achats synchrones côté UI + store.

### 1.2 `useProgressStore`

- **Aujourd’hui :** déblocage Saga, étoiles, best scores, boosters, `playerId` / `pseudo`.
- **Empire :** peu de chevauchement direct **sauf** si une compétence débloque du contenu Saga (ex. booster permanent) — dans ce cas, soit **référence** depuis `useProgressStore` vers l’état Empire (IDs de nœuds débloqués), soit **inverse** : l’Empire appelle `addBoosters` après achat. Éviter la duplication : **une seule source de vérité** pour “le joueur a-t-il le nœud X”.
- **Recommandation :** ne pas surcharger `useProgressStore` avec l’arbre entier ; réserver ce store à la **progression Saga / profil**.

### 1.3 `useLevelRunStore`

- **Aujourd’hui :** `grid: Cell[]` (16), `turn` 0–15, `placementSequence` (16), `dailyInventory` (somme 16), `placeBuilding`, boosters, fin de partie + économie hardcore.
- **Bonus passifs Empire :** impact typiquement sur **(a)** multiplicateur effectif, **(b)** coins en fin de partie, **(c)** coût Marché noir, **(d)** seuils d’étoiles — à appliquer dans des **fonctions pures** (`scoring`, `levels.calculateStars`, ou un module `src/lib/empire-modifiers.ts` appelé depuis le store) pour garder le store lisible.
- **Marché noir :** nouvelles actions / état : file d’attente d’achat, restriction par tour, type de tuile achetée, coût dynamique. Risque : coupler trop `placeBuilding` → prévoir **`applyPlacement`** interne ou sous-réducteurs documentés.
- **Obstacles / boss / méga :** voir sections 2–3 ; le store deviendra le **coordinateur** de règles, pas le dépositaire de toute la logique.

### 1.4 Faut-il un `useEmpireStore` ?

**Oui, recommandé** pour V1.1 :

- Persistance **propre** (version migrate), arbre de nœuds, rangs débloqués, timestamps d’achat.
- API claire : `unlockNode(id)`, `isUnlocked(id)`, `getPassiveModifiers(): EmpireModifiers`.
- `useEconomyStore` reste la **caisse** ; `useEmpireStore` appelle `spendCoins` (ou reçoit un callback injecté pour tests).
- `useLevelRunStore` **lit** `getPassiveModifiers()` au démarrage de partie / à chaque recalcul de score (ou souscrit via sélecteur au mount du niveau) pour éviter les cycles d’import si besoin.

Alternative minimale : tout dans `useProgressStore` — **non recommandé** (mélange progression Saga / méta permanent / arbre).

---

## 2. Plan Terrain & Solver (obstacles, grille ≠ 16 jouables)

### 2.1 Modèle de données

- **Étendre `Cell`** (ou introduire `TerrainCell`) avec au minimum :
  - `terrain: "normal" | "obstacle_lac" | …` **ou** `isPlayable: boolean` + `obstacleKind` optionnel ;
  - pour obstacles **inconstructibles** : `building` reste `null` et la case est **exclue** des candidats `placeBuilding`.
- **Invariant à documenter :** la séquence du mandat reste-t-elle de **longueur 16** (une entrée par “coup”, les coups sur cases bloquées étant soit impossibles soit sautés) **ou** longueur = nombre de cases jouables ? Ce choix **pilote** manifeste, tutoriel, et `recordGameCompletion`.

### 2.2 `Grid` / `Cell` UI

- Cases obstacle : rendu distinct (sprite / icône), pas de hover placement ; accessibilité `aria-disabled` cohérente.
- La grille peut rester **visuellement 4×4** avec cases “morte” (recommandé pour layout) plutôt que redimensionner la topologie.

### 2.3 Solver (`estimateMaxScore` et futurs usages)

- **Aujourd’hui :** boucle `turn in 0..15`, candidats = indices où `building === null` sur 16 cases identiques.
- **Cible :** une fonction **`getPlayableIndices(grid): number[]`** (ou masque 16 bits) utilisée partout : jeu humain, solver, boss “gel”.
- **Greedy / recherche :** à chaque tour, filtrer les candidats **playables** ; le nombre de tours de simulation = **nombre de bâtiments encore à placer** (souvent 16 − nombre d’obstacles fixes).
- **Cache solver :** la clé actuelle `seed + deck` devient `seed + deck + obstacleSignature` (hash des cases bloquées + niveau) pour ne pas retourner un maxScore faux après changement de terrain.
- **Stars / seuils :** `calculateStars(score, levelId)` s’appuie sur un max par niveau — le max doit être **`estimateMaxScore(..., obstacleContext)`** aligné sur le **même** niveau (déjà partiellement en place côté `levels.ts` ; à généraliser).

### 2.4 Risques de régression

- Tout code qui suppose **`grid.length === 16`**, **`turn < 16`**, **`placementSequence.length === 16`**, **`dailyInventory` somme 16** doit être inventorié (API `game-completions`, `recordGameCompletion`, tests, tutoriel).

---

## 3. Intégration Méga-structures & Boss (greffage sans “god file”)

### 3.1 Méga-structures (fusion 2×2)

- **Détection :** après chaque `placeBuilding` réussi, module pur **`detectMegaPatterns(grid): MegaEvent | null`** (4 indices voisins formant un carré, types compatibles selon règle design).
- **Application :** soit **mutation immédiate** du `grid` (4 cases → 1 “méga-case” ou 3 vides + 1 méga) — **impact lourd** sur `Cell`, scoring, voisinage ; soit **effet de score** sans fusion visuelle (plus simple mais moins “juicy”). La V1.1 devra trancher **avant** code.
- **Solver :** si la fusion change la topologie ou le calcul des voisins, le solver doit appeler les **mêmes** primitives que le runtime (`applyPlacement` + `resolveMegas`). Sinon divergence maxScore / gameplay.

### 3.2 Boss “Contrôle fiscal” (gel périodique)

- **État session :** `bossFreeze: { nextTurnIndex: number, frozenCellIndex: number | null }` ou équivalent dans `useLevelRunStore` (ou sous-objet `levelModifiers` si plusieurs boss).
- **Hook unique :** après incrémentation de `turn`, si `turn % 4 === 0` (ou règle niveau), **`selectCellToFreeze(grid, scoreFn)`** (case la plus rentable **à cet instant** — définition “rentable” = contribution marginale au score, à documenter).
- **Greffe :** une fonction **`afterTurnHooks(state): Partial<State>`** (tableau de stratégies enregistrées par `levelId` ou `bossType`) évite d’empiler des `if` dans `placeBuilding`.
- **Grille :** la case gelée = **non jouable** pour N tours ou jusqu’à événement ; peut réutiliser le même mécanisme que **obstacle temporaire** (terrain dynamique).

### 3.3 Marché noir (rappel intégration)

- UI : bottom sheet ou barre contextuelle ; validation **coins** + **tour** + **case éligible**.
- Moteur : soit **remplace** le prochain type de la séquence pour ce tour, soit **consomme** un slot d’inventaire fictif — à aligner avec les règles “16 coups”.

### 3.4 Lisibilité du moteur

- Introduire un dossier **`src/lib/game-rules/`** (ou `level-engine/`) avec :
  - `playability.ts` (candidats, obstacles, gel),
  - `megas.ts`,
  - `boss-fiscal.ts`,
  - `black-market.ts` (validation uniquement),
  et **`useLevelRunStore` comme orchestrateur** qui enchaîne : validation → mutation grille → hooks → score.

---

## 4. Polish UI (rappel périmètre — pas d’architecture lourde)

- **Auto-scroll carte :** `LevelMap` + `scrollParentRef` ; logique scroll vers niveau courant / dernier débloqué (déjà des indices `data-pp-map-scroll`).
- **Z-index bannières :** inventaire des couches (`pp-mandate-strip`, modales, `EconomyHeader`, toasts) + convention unique (tokens CSS ou table dans ce doc en Sprint 1).
- **Animation coins EndScreen :** composant présentation + lecture `coins` avant/après gain (sans bloquer la navigation).
- **Briefing maxScore :** appel `estimateMaxScore(seed, deck)` + affichage conditionnel ; dépendra post-Sprint 4 de la **signature** solver si obstacles (afficher “objectif indicatif” vs “optimal théorique”).

---

## 5. Ordre de bataille (4 sprints)

Objectif : **régressions minimales**, livrables testables à chaque fin de sprint.

| Sprint | Thème | Contenu principal | Dépendances / notes |
|--------|--------|-------------------|---------------------|
| **Sprint 1** | **Polish UI** | Auto-scroll map, harmonisation z-index, animation pièces sur `EndScreen`, briefing + `maxScore` (sur **solver actuel** 16 cases). | Aucune modification de modèle `Cell` ; release safe. |
| **Sprint 2** | **Empire (méta)** | Route `/empire`, UI “Tour Ponzi”, **`useEmpireStore`** (persist), achats en coins, export **`getPassiveModifiers()`** ; branchement **lecture seule** sur score / seuils / coûts (même si premiers bonus = no-op ou +1% test). | Touche `useEconomyStore` (dépenses) ; pas encore obstacles. |
| **Sprint 3** | **Gameplay avancé (grille inchangée 4×4 pleine)** | Marché noir (achat tuile), détection **méga 2×2** + effet validé design, **niveaux boss** + gel tous les 4 tours sur **grille actuelle**. | S’appuyer sur hooks `afterTurnHooks` ; solver étendu seulement si méga affecte le maxScore **sans** obstacles encore. |
| **Sprint 4** | **Terrain V2 & solver généralisé** | Obstacles fixes/aléatoires par niveau, **`Cell` / manifeste / tours / API** cohérents, **`estimateMaxScore`** + `calculateStars` + **validation** `game-completions` / Zod. | Le plus risqué : **en dernier** pour ne pas bloquer Sprints 1–3 ; migration niveaux + QA matrice (obstacle × boss × méga). |

**Principe directeur :** tant que la topologie “16 cases jouables identiques” tient, les features **mécaniques** (S3) avancent ; dès que **< 16** cases ou cases typées, **Sprint 4** unifie données, solver et contrats serveur.

---

## 6. Synthèse des décisions à valider (hors code)

1. **Nouveau store `useEmpireStore`** : oui, avec persistance versionnée et interface de modificateurs pour le reste de l’app.  
2. **Séquence de placements vs cases jouables** : longueur fixe 16 vs variable — **à figer avant Sprint 4**.  
3. **Méga-structure** : fusion topologique vs bonus score seul — **à figer avant Sprint 3**.  
4. **Marché noir** : même sprint que mécaniques sur grille pleine (S3), pas mélangé aux obstacles (S4).

Une fois ce document validé, le **Sprint 1** peut démarrer (polish uniquement, sans toucher aux types `Cell` ni au solver).
