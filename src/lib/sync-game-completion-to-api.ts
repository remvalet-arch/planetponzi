import { getSupabaseBrowser } from "@/src/lib/supabase";
import type { BuildingType } from "@/src/types/game";
import type { Cell } from "@/src/types/game";

export type SagaCompletionApiPayload = {
  levelId: number;
  stars: number;
  score: number;
  deckChallengeLevel: number;
  puzzleDate: string;
  deviceId: string;
  playerId?: string | null;
  pseudo?: string | null;
  /** Prestige au moment de la partie (classement). */
  prestigeLevel?: number;
  seed: string;
  grid: Cell[];
  placementSequence: BuildingType[];
};

/**
 * Envoie la partie terminée vers `/api/game-completions` (Supabase via service role).
 * Ne bloque jamais l’UI : en cas d’erreur réseau ou 5xx, log seulement.
 */
export function syncGameCompletionToApi(payload: SagaCompletionApiPayload): void {
  if (typeof window === "undefined") return;

  const body = {
    levelId: payload.levelId,
    stars: payload.stars,
    score: payload.score,
    deckChallengeLevel: payload.deckChallengeLevel,
    puzzleDate: payload.puzzleDate,
    deviceId: payload.deviceId,
    playerId: payload.playerId ?? null,
    pseudo: payload.pseudo ?? null,
    prestigeLevel:
      typeof payload.prestigeLevel === "number" && Number.isFinite(payload.prestigeLevel)
        ? Math.min(999, Math.max(0, Math.floor(payload.prestigeLevel)))
        : 0,
    seed: payload.seed,
    grid: payload.grid.map((c) => ({ index: c.index, building: c.building })),
    placementSequence: [...payload.placementSequence],
  };

  void (async () => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const sb = getSupabaseBrowser();
      if (sb) {
        const {
          data: { session },
        } = await sb.auth.getSession();
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
      }
      const res = await fetch("/api/game-completions", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error(
          "[planet-ponzi] game_completions : HTTP",
          res.status,
          res.statusText,
          "| corps:",
          text.slice(0, 400),
          "| Indice : 503 = clé service / URL serveur ; 400 = payload ; 500 = DB ou contraintes.",
        );
      }
    } catch (e) {
      console.error("[planet-ponzi] game_completions : échec réseau / fetch (offline ?)", e);
    }
  })();
}
