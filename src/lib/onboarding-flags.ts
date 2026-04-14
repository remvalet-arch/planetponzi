/** Ancien flag « tutoriel » — conservé pour migration ; le flux d’entrée marque aussi ce flag. */
const TUTORIAL_DONE_KEY = "planet-ponzi-tutorial-v1";

export function hasCompletedTutorial(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(TUTORIAL_DONE_KEY) === "1";
}

export function markTutorialCompleted(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TUTORIAL_DONE_KEY, "1");
}
