# Planet Ponzi — Product Requirements Document

## Vision

**Planet Ponzi** est une Web App (PWA) proposant un **puzzle quotidien** au ton **satirique**, inspiré du **capitalisme spatial cynique** (ambiance proche d’une **MPG** — narration légère, ironique, corporate absurde).

L’objectif produit est la **viralité** via le **partage d’emoji-art** (résultat du jour lisible partout) et une **monétisation / exit** rapide (boucle courte, compréhension immédiate, FOMO quotidien).

## Plateau et bâtiments

- **Grille** : **4×4** (**16 cases**), indices **0–15** (par convention : ligne par ligne, de haut en bas, gauche à droite).
- **Séquence du jour** : exactement **16 bâtiments** tirés parmi les **4 types** ci-dessous, dans un **ordre fixe pour la journée** (voir section RNG).

| Bâtiment | Couleur (UI future) | Règle de base (scoring détaillé en itération suivante) |
|----------|---------------------|--------------------------------------------------------|
| **Habitacle** | Orange | **2 pts** ; **−2** si **adjacent** à une **Mine** (cases **partageant un bord** sur la grille 4×4). |
| **Eau** | Bleu | **0 pt** de base ; **+2** par **Habitacle** ou **Serre** **adjacent** (même définition de voisinage). |
| **Serre** | Vert | **1 pt** ; **+1** par **Serre** **adjacente** (même définition). |
| **Mine** | Gris | **3 pts**. |

## Logique quotidienne (fair-play viral)

- **Seed** : la **date du jour** au format **`YYYY-MM-DD`** (fuseau à définir côté produit ; par défaut **date locale** du navigateur pour le MVP).
- **Tirage unique** : pour une date donnée, **tous les joueurs** reçoivent la **même liste ordonnée** de **16 bâtiments** (même seed → même permutation du paquet).
- **Paquet** : **4 exemplaires** de chaque type (**16 cartes** au total), puis **mélange déterministe** dérivé de la seed (voir `src/lib/rng.ts`).

## Boucle de jeu (MVP)

1. L’utilisateur ouvre le puzzle du jour (seed implicite ou explicite).
2. Il place les **16 bâtiments un par un** dans l’ordre imposé par la séquence (tour **0 → 15**).
3. À la fin du placement, le **score** est calculé à partir de la grille finale (logique dans `src/lib/`, hors scope de la fondation UI).
4. **Partage** : export **emoji-art** / résumé textuel + score (spec partage à venir).

## États de partie

- **`ready`** : séquence du jour chargée, grille vide, partie non commencée.
- **`playing`** : placements en cours (`tour` 0–15).
- **`finished`** : les 16 cases sont remplies ; score figé (recalcul autorisé si les règles évoluent, avec garde-fous produit).

## Contraintes techniques (stack)

- **Next.js** (App Router), **Tailwind CSS**, **Lucide React**, **Zustand**.
- Code **modulaire**, **strictement typé** ; logique métier dans `src/lib/`, état global jeu dans `src/store/`.

## Hors scope (cette itération)

- Interface visuelle complète de la grille, PWA manifest/service worker, moteur de score complet, partage social, backend.
