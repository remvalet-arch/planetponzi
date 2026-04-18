import type { BuildingType, Cell, DeckChallengeLevel } from "@/src/types/game";
import { formatMultiplierFr } from "@/src/lib/difficulty";
import { calculateStars } from "@/src/lib/levels";
import { getSessionCellScores } from "@/src/lib/session-scoring";

/** Thème visuel (emoji + utilitaires Tailwind) pour un type de bâtiment. */
export type BuildingTheme = {
  emoji: string;
  /** Classes Tailwind pour fond + texte sur la tuile. */
  color: string;
};

/** Tuiles type « briques » : dégradé + bord bas épais + ombre portée (effet 3D). */
const THEMES: Record<BuildingType, BuildingTheme> = {
  habitacle: {
    emoji: "🧑‍🚀",
    color:
      "border border-orange-200/90 bg-gradient-to-b from-amber-200 to-orange-500 text-orange-950 border-b-[6px] border-b-orange-800 shadow-[0_6px_0_rgba(194,65,12,0.28)]",
  },
  eau: {
    emoji: "💧",
    color:
      "border border-sky-200/90 bg-gradient-to-b from-sky-200 to-cyan-500 text-cyan-950 border-b-[6px] border-b-cyan-800 shadow-[0_6px_0_rgba(8,145,178,0.28)]",
  },
  serre: {
    emoji: "🌱",
    color:
      "border border-lime-200/90 bg-gradient-to-b from-lime-200 to-green-600 text-green-950 border-b-[6px] border-b-green-800 shadow-[0_6px_0_rgba(21,128,61,0.28)]",
  },
  mine: {
    emoji: "⬛",
    color:
      "border border-violet-200/90 bg-gradient-to-b from-violet-300 to-violet-700 text-violet-50 border-b-[6px] border-b-violet-950 shadow-[0_6px_0_rgba(91,33,182,0.28)]",
  },
};

export function getBuildingTheme(type: BuildingType): BuildingTheme {
  return THEMES[type];
}

/** Base URL pour le texte copié (alignée sur `NEXT_PUBLIC_SITE_URL` / metadata). */
function planetPonziShareBaseUrl(): string {
  const raw = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SITE_URL?.trim() : "";
  if (raw) {
    return raw.endsWith("/") ? raw : `${raw}/`;
  }
  return "https://planetponzi.vercel.app/";
}

export const PLANET_PONZI_SHARE_URL = planetPonziShareBaseUrl();

/** Case vide (partie incomplète) : tuile neutre pour la heatmap de partage. */
const SHARE_EMPTY_CELL = "⬛";

function heatEmojiForShare(cellScore: number, hasBuilding: boolean): string {
  if (!hasBuilding) return SHARE_EMPTY_CELL;
  if (cellScore >= 4) return "🟩";
  if (cellScore >= 1) return "🟨";
  return "🟥";
}

export type ShareMeta = {
  deckChallengeLevel: DeckChallengeLevel;
  levelId?: number;
  /** Cases gelées (boss) — heatmap alignée sur le score de session. */
  frozenCellIndices?: number[];
};

/**
 * Texte de partage (heatmap de performance par case + ROI).
 * Couleurs : ≥4 🟩, 1–3 🟨, ≤0 🟥, vide ⬛.
 */
function starLineForShare(score: number, levelId: number | undefined, grid: Cell[]): string {
  const n = levelId != null ? calculateStars(score, levelId, grid) : 0;
  const filled = "⭐".repeat(n);
  const empty = "☆".repeat(3 - n);
  return `${filled}${empty}`;
}

export function generateShareContent(
  grid: Cell[],
  score: number,
  seed: string,
  meta?: ShareMeta,
): string {
  const cellScores = getSessionCellScores(grid, meta?.frozenCellIndices ?? []);
  const rows: string[] = [];
  for (let r = 0; r < 4; r++) {
    let line = "";
    for (let c = 0; c < 4; c++) {
      const i = r * 4 + c;
      const hasBuilding = grid[i]?.building != null;
      line += heatEmojiForShare(cellScores[i] ?? 0, hasBuilding);
    }
    rows.push(line);
  }
  const sign = score >= 0 ? "+" : "";
  const headerLine1 =
    meta?.levelId != null
      ? `Planet Ponzi Saga 🚀 - Niveau ${meta.levelId}`
      : `Planet Ponzi Saga 🚀 - ${seed}`;
  const stars = starLineForShare(score, meta?.levelId, grid);
  const header: string[] = [
    headerLine1,
    `Score : ${sign}${score} pts | ${stars}`,
  ];
  if (meta && meta.deckChallengeLevel >= 1) {
    const n = meta.deckChallengeLevel;
    header.push(
      n === 1
        ? `Mode : 1 inconnue (${formatMultiplierFr(n)})`
        : `Mode : ${n} inconnues (${formatMultiplierFr(n)})`,
    );
  }
  return [
    ...header,
    "",
    ...rows,
    "",
    `Devenez le CEO de la galaxie : ${PLANET_PONZI_SHARE_URL}`,
  ].join("\n");
}

/** @deprecated Utiliser `generateShareContent` (heatmap). */
export const buildShareText = generateShareContent;

/** Copie le résumé de partie ; retourne `true` si la copie a réussi. */
export async function copyShareToClipboard(
  grid: Cell[],
  score: number,
  seed: string,
  meta?: ShareMeta,
): Promise<boolean> {
  const text = generateShareContent(grid, score, seed, meta);
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback ci-dessous */
  }
  try {
    if (typeof document === "undefined") return false;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
