# Planet Ponzi — Product Vision & Game Design Document (v2.0)

**Document fondateur** : référence unique pour aligner produit, design, code et sessions IA sur les sprints à venir. Toute évolution majeure du jeu doit **mettre à jour ce fichier** ou y pointer via une ADR / spec annexe.

---

## Elevator Pitch

> Planet Ponzi est un puzzle-game tactique cynique où vous incarnez un PDG impitoyable : fusionnez des usines sur une grille 4x4, respectez des mandats spatiaux, évitez le Fisc, et déclarez faillite (Prestige) pour mieux recommencer.

---

## Core Loop (boucle de jeu)

**Résumé exécutif** : séquence de **16 tuiles** (RNG **déterministe** avec **garantie de solvabilité** via quotas mandat + alignement solveur / deck), **fusions 2×2**, **obstacles topologiques**, et un **solveur** qui calibre le **fair-play** des **seuils de victoire** (étoiles).

| Pilier | Description |
|--------|-------------|
| **Grille** | Partie au tour par tour sur une grille **4×4** ; une tuile du mandat placée par tour jusqu’à épuisement de la séquence. |
| **Séquence** | **16 placements** (ou longueur dérivée des obstacles) générés par **RNG déterministe** (`seed` / cargaison). Le deck est ajusté pour respecter les **quotas minimaux** imposés par les mandats (comptage + alignements), afin de préserver la **solvabilité** avec le solveur. |
| **Score & synergies** | Score issu des types de bâtiments, des voisins orthogonaux et des règles de session (coefficient de difficulté, bonus Tour, etc.). |
| **Méga-structures** | Détection de blocs **2×2** industriels et fusion en **méga** (feedback visuel + scoring). |
| **Topologie** | Cases **non jouables** ou terrain spécial (lac, montagne, zone toxique) selon la définition du niveau. |
| **Mandats** | **Win conditions** : objectifs **quantitatifs** (ex. nombre de serres) et/ou **spatiaux** (isolation, alignement). Le non-respect d’un mandat peut annuler les étoiles malgré un score élevé. |
| **Aléas & Boss** | **Faille sismique** : destruction d’une tuile à un tour donné. **Boss fiscal** (tous les 10 niveaux) : **gel** périodique d’une case à fort rendement (0 pt pour cette case au bilan). |
| **Solveur & fair-play** | Un **solveur glouton** estime un **score maximal plausible** par niveau (seed, deck, obstacles, mandats, aléas simulés). Les **seuils 1★ / 2★ / 3★** en découlent. |

---

## Méta-progression

| Élément | Description |
|---------|-------------|
| **Carte Saga** | Parcours **unifié** des niveaux **1 à 100** : chemin SVG continu, **ascension visuelle** (sommet = niveaux élevés, base = début de saga), **secteurs** thématiques avec **bannières** entre blocs. |
| **Star Gate** | Aux **Boss** (niveaux **10, 20, …, 100**), l’accès effectif est **bloqué** tant que le joueur n’a pas cumulé un **quota d’étoiles** (ex. **18**) sur les **9 niveaux précédents** du secteur — incitation à la rejouabilité et à la maîtrise avant le Boss. |
| **Narration** | **Mémos CEO** et ton **corporate dystopia** entre secteurs ; cohérent avec la DA cynique du titre. |

---

## Économie & end-game

| Système | Rôle |
|---------|------|
| **Vies (énergie)** | Limite le spam de parties ; recharge et packs possibles côté produit. |
| **Coins** | Monnaie soft ; gains liés aux performances (ex. étoiles), dépenses Tour / marché noir / boutique. |
| **Tour Empire** | **Skill tree** spatial : étages débloquables pour **bonus passifs** permanents (score, vies, etc.). |
| **Marché noir** | Achat in-run pour **modifier la prochaine tuile** du mandat (trade-off coins / tactique). |
| **Prestige (faillite stratégique)** | **End-game** : sacrifice de la progression économique / tour contre un **bonus de score global** (+10 % par palier typiquement), pour relancer la boucle avec une courbe de puissance long terme. |
| **Social** | **Classement** connecté (ex. Supabase) mettant en avant le **prestige** et les performances synchronisées. |

---

## Directives d’architecture (règles d’or)

1. **Solveur & score** — Ne **jamais** modifier le solveur (`estimateMaxScore`, heuristiques mandat, post-traitements) ni la génération de deck **sans** vérifier l’impact sur le **score max estimé**, les **seuils d’étoiles** et la **solvabilité** perçue. Prévoir recalcul / QA sur un échantillon de niveaux après chaque changement.
2. **Transparence joueur** — L’**UI** doit **toujours** informer le joueur des **règles actives** : **mandats** (comptage + spatial), **faille sismique** (tour de déclenchement), **Boss fiscal** (rythme du gel). Briefing pré-partie, traqueur in-game si pertinent, écran de fin explicite en cas d’échec mandat.
3. **Cohérence données** — `WinCondition`, `spatialRules`, obstacles et **séquence** doivent rester alignés entre **moteur**, **solveur**, **RNG** et **persistance** (`game_completions`, etc.).
4. **Star Gate** — Toute évolution du **quota** ou de la **période** (9 niveaux / Boss) doit mettre à jour **à la fois** la logique métier et les **textes / UX** (carte, messages, tutoriels).
5. **Document vivant** — Les décisions qui contredisent ce GDD doivent soit **mettre à jour** ce fichier, soit référencer une **ADR** / spec annexée pour éviter la dérive silencieuse.

---

## Références code utiles (pour les sprints)

- Niveaux & mandats : `src/lib/levels.ts`, `src/lib/grid-topology.ts`, `src/types/game.ts`
- Solveur : `src/lib/solver.ts` — RNG deck : `src/lib/rng.ts`
- Progression & Star Gate : `src/lib/star-gate.ts`, `src/store/useProgressStore.ts`
- Carte : `src/components/map/LevelMap.tsx`
- UX mandats : `src/components/onboarding/GameEntryFlow.tsx`, `src/components/game/MandateTracker.tsx`, `src/components/game/EndScreen.tsx`
- i18n : `src/lib/i18n/strings.ts`

---

*Dernière mise à jour : v2.0 — vision figée pour développements futurs.*
