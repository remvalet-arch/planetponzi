import type { BuildingType } from "@/src/types/game";
import type { Cell } from "@/src/types/game";

export type SagaCompletionApiPayload = {
  levelId: number;
  stars: number;
  score: number;
  deckChallengeLevel: number;
  puzzleDate: string;
  deviceId: string;
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
    seed: payload.seed,
    grid: payload.grid.map((c) => ({ index: c.index, building: c.building })),
    placementSequence: [...payload.placementSequence],
  };

  void (async () => {
    try {
      const res = await fetch("/api/game-completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.warn(
          "[planet-ponzi] Sauvegarde serveur indisponible:",
          res.status,
          text.slice(0, 200),
        );
      }
    } catch (e) {
      console.warn("[planet-ponzi] Sauvegarde serveur (offline ou erreur réseau) :", e);
    }
  })();
}
