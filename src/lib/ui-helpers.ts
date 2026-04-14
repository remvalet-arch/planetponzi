import type { BuildingType, Cell, DeckChallengeLevel } from "@/src/types/game";
import { formatMultiplierFr } from "@/src/lib/difficulty";
import { getCellScores } from "@/src/lib/scoring";

/** Thème visuel (emoji + utilitaires Tailwind) pour un type de bâtiment. */
export type BuildingTheme = {
  emoji: string;
  /** Classes Tailwind pour fond + texte sur la tuile. */
  color: string;
};

const THEMES: Record<BuildingType, BuildingTheme> = {
  habitacle: {
    emoji: "🧑‍🚀",
    color: "bg-orange-500 text-orange-50",
  },
  eau: {
    emoji: "💧",
    color: "bg-cyan-500 text-cyan-50",
  },
  serre: {
    emoji: "🌱",
    color: "bg-green-500 text-green-50",
  },
  mine: {
    emoji: "⬛",
    color: "bg-slate-700 text-slate-300",
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
};

/**
 * Texte de partage (heatmap de performance par case + ROI).
 * Couleurs : ≥4 🟩, 1–3 🟨, ≤0 🟥, vide ⬛.
 */
export function generateShareContent(
  grid: Cell[],
  score: number,
  seed: string,
  meta?: ShareMeta,
): string {
  const cellScores = getCellScores(grid);
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
  const header: string[] = [
    `Planet Ponzi #${seed} 🚀`,
    `ROI : ${sign}${score}M $`,
  ];
  if (meta && meta.deckChallengeLevel >= 2) {
    const n = meta.deckChallengeLevel;
    header.push(`Mode : ${n} inconnues (${formatMultiplierFr(n)})`);
  }
  return [
    ...header,
    "",
    ...rows,
    "",
    `Jouez ici : ${PLANET_PONZI_SHARE_URL}`,
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
