/**
 * Déblocage hub (Boutique / Tour) : StoryModal sur la carte quand `max(unlockedLevels)`
 * atteint ces seuils — textes dans `strings.unlockMemos`, flags dans `useProgressStore`.
 * (Distinct des paliers secteur ci-dessous.)
 */
export const CEO_HUB_UNLOCK_MAX_LEVEL = {
  shop: 3,
  tower: 5,
} as const;

/** Paliers narration CEO sur la carte (nouveau secteur / acte). */
export const CEO_STORY_MILESTONES = [1, 11, 21, 41, 61, 81] as const;

export type CeoStoryMilestone = (typeof CEO_STORY_MILESTONES)[number];

export function isCeoStoryMilestone(levelId: number): levelId is CeoStoryMilestone {
  return (CEO_STORY_MILESTONES as readonly number[]).includes(levelId);
}

const STORAGE_KEY = "pp-ceo-story-memos-seen-v1";

function readSeenRaw(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((n): n is number => typeof n === "number" && Number.isInteger(n) && n > 0);
  } catch {
    return [];
  }
}

export function readSeenCeoMemos(): Set<number> {
  return new Set(readSeenRaw());
}

export function markCeoMemoSeen(levelId: number): void {
  if (typeof window === "undefined") return;
  const s = readSeenCeoMemos();
  s.add(levelId);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...s].sort((a, b) => a - b)));
  } catch {
    /* ignore */
  }
}

/**
 * Premier palier atteint (niveau débloqué ≥ palier) pas encore lu.
 * — Le mémo #1 (Acte I) n’est plus proposé si le joueur a déjà dépassé le secteur 1 (max > 10),
 *   pour éviter d’afficher la Ceinture des Startups après la Nébuleuse.
 * — Le mémo #11 correspond à l’entrée en secteur 2 (niveaux 11–20).
 */
export function getPendingCeoStoryMilestone(unlockedLevels: readonly number[]): number | null {
  const seen = readSeenCeoMemos();
  const maxU = unlockedLevels.length ? Math.max(...unlockedLevels) : 1;
  for (const m of CEO_STORY_MILESTONES) {
    if (m > maxU) break;
    if (m === 1 && maxU > 10 && !seen.has(1)) {
      continue;
    }
    if (!seen.has(m)) return m;
  }
  return null;
}

/** État minimal pour savoir si la carte doit afficher (ou imposer) un mémo CEO majeur. */
export type HubUnlockMemoPendingState = {
  unlockedLevels: readonly number[];
  hasSeenShopUnlockCeoMemo: boolean;
  hasSeenTowerUnlockCeoMemo: boolean;
};

/**
 * Mémo CEO / déblocage hub en attente (carte requise avant d’enchaîner le trimestre suivant).
 * — Boutique / Tour : seuils `CEO_HUB_UNLOCK_MAX_LEVEL` + flags progression.
 * — Narration secteur : `getPendingCeoStoryMilestone` (localStorage « vus »).
 */
export function hasPendingHubUnlock(state: HubUnlockMemoPendingState): boolean {
  const maxUnlocked = state.unlockedLevels.length ? Math.max(...state.unlockedLevels) : 1;
  if (maxUnlocked >= CEO_HUB_UNLOCK_MAX_LEVEL.shop && !state.hasSeenShopUnlockCeoMemo) return true;
  if (maxUnlocked >= CEO_HUB_UNLOCK_MAX_LEVEL.tower && !state.hasSeenTowerUnlockCeoMemo) return true;
  if (getPendingCeoStoryMilestone(state.unlockedLevels) != null) return true;
  return false;
}
