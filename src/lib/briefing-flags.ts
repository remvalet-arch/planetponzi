/** Persistance : l’utilisateur a validé le briefing Saga (une fois). */
export const BRIEFING_ACK_STORAGE_KEY = "pp-saga-briefing-ack-v1";

export function isBriefingAcked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(BRIEFING_ACK_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setBriefingAcked(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BRIEFING_ACK_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}
