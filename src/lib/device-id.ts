const STORAGE_KEY = "pp-device-id";

/** UUID stable pour corréler les parties avant auth (aligné sur game_completions.device_id). */
/** UUID factice mais syntaxiquement valide (v4) si pas de stockage (SSR / erreur). */
const FALLBACK_DEVICE_ID = "00000000-0000-4000-8000-000000000000";

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    return FALLBACK_DEVICE_ID;
  }
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return FALLBACK_DEVICE_ID;
  }
}
