/**
 * Thèmes visuels par secteur (planetId 0–9 ↔ tranches de 10 niveaux).
 * Les libellés joueur (ARIA, mandats) vivent dans `strings.*.biomes`.
 */

import type { PlanetId } from "@/src/lib/levels";
import type { BuildingType, TerrainType } from "@/src/types/game";

export type ObstacleTerrainKey = Exclude<TerrainType, "normal">;

export type BiomeBuildingSkin = {
  emoji: string;
  /** Classes Tailwind (fond + bordure + texte). */
  color: string;
};

export type BiomeObstacleSkin = {
  emoji: string;
  className: string;
};

export type BiomeThemeDefinition = {
  buildings: Record<BuildingType, BiomeBuildingSkin>;
  obstacles: Record<ObstacleTerrainKey, BiomeObstacleSkin>;
  obstacleDefault: BiomeObstacleSkin;
  /** Classes pour le conteneur interne 4×4 (ambiance secteur). */
  gridBackground: string;
};

const brick = (args: {
  border: string;
  from: string;
  to: string;
  text: string;
  bottom: string;
  shadow: string;
}) =>
  `border ${args.border} bg-gradient-to-b ${args.from} ${args.to} ${args.text} border-b-[6px] ${args.bottom} shadow-[${args.shadow}]`;

/** Matière noire / case inconstructible (terrain `void`). */
const VOID_OBSTACLE: BiomeObstacleSkin = {
  emoji: "🕳️",
  className:
    "border-2 border-black bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-zinc-600 shadow-[inset_0_0_18px_rgba(0,0,0,0.95)]",
};

/** Secteur 0 — rendu historique « Planète Ponzi ». */
const classic: BiomeThemeDefinition = {
  buildings: {
    habitacle: {
      emoji: "🏢",
      color: brick({
        border: "border-orange-200/90",
        from: "from-amber-200",
        to: "to-orange-500",
        text: "text-orange-950",
        bottom: "border-b-orange-800",
        shadow: "0_6px_0_rgba(194,65,12,0.28)",
      }),
    },
    eau: {
      emoji: "💧",
      color: brick({
        border: "border-sky-200/90",
        from: "from-sky-200",
        to: "to-cyan-500",
        text: "text-cyan-950",
        bottom: "border-b-cyan-800",
        shadow: "0_6px_0_rgba(8,145,178,0.28)",
      }),
    },
    serre: {
      emoji: "🌱",
      color: brick({
        border: "border-lime-200/90",
        from: "from-lime-200",
        to: "to-green-600",
        text: "text-green-950",
        bottom: "border-b-green-800",
        shadow: "0_6px_0_rgba(21,128,61,0.28)",
      }),
    },
    mine: {
      emoji: "⛏️",
      color: brick({
        border: "border-violet-200/90",
        from: "from-violet-300",
        to: "to-violet-700",
        text: "text-violet-50",
        bottom: "border-b-violet-950",
        shadow: "0_6px_0_rgba(91,33,182,0.28)",
      }),
    },
  },
  obstacles: {
    lake: {
      emoji: "🌊",
      className:
        "border-2 border-cyan-500/50 bg-gradient-to-b from-slate-900 to-cyan-950/90 text-cyan-100 shadow-inner",
    },
    mountain: {
      emoji: "⛰️",
      className:
        "border-2 border-stone-500/55 bg-gradient-to-b from-stone-800 to-slate-950 text-stone-200 shadow-inner",
    },
    toxic: {
      emoji: "☠️",
      className:
        "border-2 border-lime-500/45 bg-gradient-to-b from-lime-950/90 to-slate-950 text-lime-200 shadow-inner",
    },
    void: VOID_OBSTACLE,
  },
  obstacleDefault: {
    emoji: "⬛",
    className: "border-2 border-slate-600 bg-slate-900 text-slate-400",
  },
  gridBackground: "rounded-lg bg-slate-950/40 ring-1 ring-slate-700/40 p-1.5 sm:p-2",
};

/** Secteur 1 — orbital / labo. */
const space: BiomeThemeDefinition = {
  buildings: {
    habitacle: {
      emoji: "🛰️",
      color:
        "border border-indigo-200/80 bg-gradient-to-b from-slate-200 to-indigo-700 text-indigo-950 border-b-[6px] border-b-indigo-950 shadow-[0_6px_0_rgba(49,46,129,0.35)]",
    },
    eau: {
      emoji: "🧪",
      color:
        "border border-cyan-300/80 bg-gradient-to-b from-cyan-100 to-teal-600 text-teal-950 border-b-[6px] border-b-teal-900 shadow-[0_6px_0_rgba(13,148,136,0.3)]",
    },
    serre: {
      emoji: "🦠",
      color:
        "border border-emerald-200/80 bg-gradient-to-b from-lime-100 to-emerald-600 text-emerald-950 border-b-[6px] border-b-emerald-900 shadow-[0_6px_0_rgba(5,150,105,0.28)]",
    },
    mine: {
      emoji: "☄️",
      color:
        "border border-violet-200/90 bg-gradient-to-b from-fuchsia-200 to-violet-800 text-violet-50 border-b-[6px] border-b-violet-950 shadow-[0_6px_0_rgba(91,33,182,0.35)]",
    },
  },
  obstacles: {
    lake: {
      emoji: "🌑",
      className:
        "border-2 border-zinc-700/80 bg-gradient-to-b from-black to-zinc-900 text-zinc-300 shadow-[inset_0_0_12px_rgba(99,102,241,0.25)]",
    },
    mountain: {
      emoji: "🪨",
      className:
        "border-2 border-slate-500/60 bg-gradient-to-b from-slate-600 to-slate-950 text-slate-200 shadow-inner",
    },
    toxic: {
      emoji: "☢️",
      className:
        "border-2 border-amber-500/50 bg-gradient-to-b from-amber-900/90 to-slate-950 text-amber-200 shadow-inner",
    },
    void: VOID_OBSTACLE,
  },
  obstacleDefault: {
    emoji: "⚫",
    className: "border-2 border-slate-700 bg-black text-slate-500",
  },
  gridBackground: "rounded-lg bg-gradient-to-br from-indigo-950/80 via-slate-950 to-black ring-1 ring-indigo-500/30 p-1.5 sm:p-2",
};

/** Secteur 2 — eaux / archipel offshore. */
const offshore: BiomeThemeDefinition = {
  buildings: {
    habitacle: {
      emoji: "🏝️",
      color:
        "border border-amber-100/90 bg-gradient-to-b from-amber-50 to-teal-600 text-teal-950 border-b-[6px] border-b-teal-900 shadow-[0_6px_0_rgba(15,118,110,0.3)]",
    },
    eau: {
      emoji: "🌊",
      color:
        "border border-sky-300/90 bg-gradient-to-b from-sky-100 to-blue-600 text-blue-950 border-b-[6px] border-b-blue-900 shadow-[0_6px_0_rgba(29,78,216,0.28)]",
    },
    serre: {
      emoji: "🌴",
      color:
        "border border-rose-200/80 bg-gradient-to-b from-rose-100 to-pink-600 text-rose-950 border-b-[6px] border-b-rose-900 shadow-[0_6px_0_rgba(190,24,93,0.25)]",
    },
    mine: {
      emoji: "🛢️",
      color:
        "border border-slate-300/90 bg-gradient-to-b from-slate-200 to-slate-700 text-slate-900 border-b-[6px] border-b-slate-900 shadow-[0_6px_0_rgba(30,41,59,0.35)]",
    },
  },
  obstacles: {
    lake: {
      emoji: "🌀",
      className:
        "border-2 border-blue-400/50 bg-gradient-to-b from-blue-950 to-cyan-900 text-cyan-100 shadow-inner",
    },
    mountain: {
      emoji: "🗿",
      className:
        "border-2 border-stone-600/60 bg-gradient-to-b from-stone-700 to-stone-950 text-stone-200",
    },
    toxic: {
      emoji: "🛢️",
      className:
        "border-2 border-amber-800/60 bg-gradient-to-b from-amber-950 to-black text-amber-500/90",
    },
    void: VOID_OBSTACLE,
  },
  obstacleDefault: {
    emoji: "⬛",
    className: "border-2 border-slate-700 bg-slate-950 text-slate-500",
  },
  gridBackground: "rounded-lg bg-gradient-to-b from-cyan-950/70 via-slate-950 to-blue-950/80 ring-1 ring-cyan-500/25 p-1.5 sm:p-2",
};

/** Secteur 3 — désert / austérité. */
const desert: BiomeThemeDefinition = {
  buildings: {
    habitacle: {
      emoji: "⛺",
      color:
        "border border-orange-200/80 bg-gradient-to-b from-yellow-100 to-orange-700 text-orange-950 border-b-[6px] border-b-orange-900 shadow-[0_6px_0_rgba(194,65,12,0.3)]",
    },
    eau: {
      emoji: "🏺",
      color:
        "border border-amber-200/80 bg-gradient-to-b from-amber-50 to-amber-700 text-amber-950 border-b-[6px] border-b-amber-900 shadow-[0_6px_0_rgba(180,83,9,0.28)]",
    },
    serre: {
      emoji: "🌵",
      color:
        "border border-lime-200/70 bg-gradient-to-b from-lime-100 to-green-700 text-green-950 border-b-[6px] border-b-green-900 shadow-[0_6px_0_rgba(21,128,61,0.28)]",
    },
    mine: {
      emoji: "🪨",
      color:
        "border border-stone-300/80 bg-gradient-to-b from-stone-200 to-stone-700 text-stone-900 border-b-[6px] border-b-stone-900 shadow-[0_6px_0_rgba(68,64,60,0.35)]",
    },
  },
  obstacles: {
    lake: {
      emoji: "🏜️",
      className:
        "border-2 border-amber-600/50 bg-gradient-to-b from-amber-900 to-orange-950 text-amber-200/90 shadow-inner",
    },
    mountain: {
      emoji: "🪨",
      className:
        "border-2 border-orange-900/60 bg-gradient-to-b from-orange-950 to-stone-950 text-orange-100/80",
    },
    toxic: {
      emoji: "☠️",
      className:
        "border-2 border-lime-500/45 bg-gradient-to-b from-lime-950 to-stone-950 text-lime-200",
    },
    void: VOID_OBSTACLE,
  },
  obstacleDefault: {
    emoji: "⬛",
    className: "border-2 border-amber-900/50 bg-stone-950 text-amber-900/60",
  },
  gridBackground: "rounded-lg bg-gradient-to-b from-amber-950/50 via-stone-950 to-orange-950/60 ring-1 ring-orange-600/20 p-1.5 sm:p-2",
};

/** Secteur 4 — bulle spéculative / néon rose. */
const bubble: BiomeThemeDefinition = {
  buildings: {
    habitacle: {
      emoji: "🏙️",
      color:
        "border border-fuchsia-200/90 bg-gradient-to-b from-pink-100 to-fuchsia-600 text-fuchsia-950 border-b-[6px] border-b-fuchsia-900 shadow-[0_6px_0_rgba(162,28,175,0.3)]",
    },
    eau: {
      emoji: "🫧",
      color:
        "border border-sky-200/90 bg-gradient-to-b from-sky-100 to-fuchsia-500 text-fuchsia-950 border-b-[6px] border-b-fuchsia-800 shadow-[0_6px_0_rgba(192,38,211,0.25)]",
    },
    serre: {
      emoji: "🌷",
      color:
        "border border-pink-200/90 bg-gradient-to-b from-pink-50 to-rose-600 text-rose-950 border-b-[6px] border-b-rose-900 shadow-[0_6px_0_rgba(190,24,93,0.28)]",
    },
    mine: {
      emoji: "📈",
      color:
        "border border-violet-200/90 bg-gradient-to-b from-violet-200 to-purple-700 text-violet-50 border-b-[6px] border-b-violet-950 shadow-[0_6px_0_rgba(91,33,182,0.35)]",
    },
  },
  obstacles: {
    lake: {
      emoji: "💗",
      className:
        "border-2 border-pink-500/50 bg-gradient-to-b from-fuchsia-950 to-purple-950 text-pink-200 shadow-inner",
    },
    mountain: {
      emoji: "🎢",
      className:
        "border-2 border-fuchsia-600/50 bg-gradient-to-b from-purple-900 to-fuchsia-950 text-fuchsia-100",
    },
    toxic: {
      emoji: "💔",
      className:
        "border-2 border-rose-500/50 bg-gradient-to-b from-rose-950 to-black text-rose-200",
    },
    void: VOID_OBSTACLE,
  },
  obstacleDefault: {
    emoji: "⬛",
    className: "border-2 border-fuchsia-900/50 bg-purple-950 text-fuchsia-300/50",
  },
  gridBackground: "rounded-lg bg-gradient-to-br from-fuchsia-950/70 via-purple-950 to-slate-950 ring-1 ring-pink-500/30 p-1.5 sm:p-2",
};

/** Secteur 5 — levées de fonds / corporate vert. */
const fundraise: BiomeThemeDefinition = {
  buildings: {
    habitacle: {
      emoji: "🏦",
      color:
        "border border-emerald-200/80 bg-gradient-to-b from-emerald-100 to-emerald-700 text-emerald-950 border-b-[6px] border-b-emerald-900 shadow-[0_6px_0_rgba(4,120,87,0.3)]",
    },
    eau: {
      emoji: "🥂",
      color:
        "border border-teal-200/80 bg-gradient-to-b from-teal-50 to-teal-600 text-teal-950 border-b-[6px] border-b-teal-900 shadow-[0_6px_0_rgba(15,118,110,0.28)]",
    },
    serre: {
      emoji: "🍇",
      color:
        "border border-lime-200/80 bg-gradient-to-b from-lime-50 to-lime-600 text-lime-950 border-b-[6px] border-b-lime-800 shadow-[0_6px_0_rgba(63,98,18,0.28)]",
    },
    mine: {
      emoji: "💼",
      color:
        "border border-slate-300/90 bg-gradient-to-b from-slate-100 to-slate-700 text-slate-900 border-b-[6px] border-b-slate-900 shadow-[0_6px_0_rgba(51,65,85,0.35)]",
    },
  },
  obstacles: {
    lake: {
      emoji: "🏊",
      className:
        "border-2 border-teal-500/45 bg-gradient-to-b from-teal-950 to-emerald-950 text-teal-100",
    },
    mountain: {
      emoji: "📑",
      className:
        "border-2 border-slate-500/50 bg-gradient-to-b from-slate-700 to-slate-950 text-slate-200",
    },
    toxic: {
      emoji: "📉",
      className:
        "border-2 border-red-500/40 bg-gradient-to-b from-red-950 to-slate-950 text-red-200/90",
    },
    void: VOID_OBSTACLE,
  },
  obstacleDefault: {
    emoji: "⬛",
    className: "border-2 border-emerald-900/40 bg-slate-950 text-emerald-800/60",
  },
  gridBackground: "rounded-lg bg-gradient-to-b from-emerald-950/60 via-slate-950 to-teal-950/50 ring-1 ring-emerald-500/25 p-1.5 sm:p-2",
};

/** Secteur 6 — actifs structurés / béton. */
const structured: BiomeThemeDefinition = {
  buildings: {
    habitacle: {
      emoji: "🧱",
      color:
        "border border-stone-300/90 bg-gradient-to-b from-stone-100 to-stone-600 text-stone-900 border-b-[6px] border-b-stone-800 shadow-[0_6px_0_rgba(68,64,60,0.35)]",
    },
    eau: {
      emoji: "🧊",
      color:
        "border border-slate-300/90 bg-gradient-to-b from-slate-100 to-slate-600 text-slate-900 border-b-[6px] border-b-slate-800 shadow-[0_6px_0_rgba(51,65,85,0.3)]",
    },
    serre: {
      emoji: "🌾",
      color:
        "border border-zinc-300/80 bg-gradient-to-b from-zinc-100 to-zinc-600 text-zinc-900 border-b-[6px] border-b-zinc-800 shadow-[0_6px_0_rgba(63,63,70,0.28)]",
    },
    mine: {
      emoji: "🚜",
      color:
        "border border-orange-300/80 bg-gradient-to-b from-orange-100 to-orange-700 text-orange-950 border-b-[6px] border-b-orange-900 shadow-[0_6px_0_rgba(194,65,12,0.3)]",
    },
  },
  obstacles: {
    lake: {
      emoji: "🪣",
      className:
        "border-2 border-slate-500/50 bg-gradient-to-b from-slate-800 to-slate-950 text-slate-300",
    },
    mountain: {
      emoji: "🧱",
      className:
        "border-2 border-stone-600/55 bg-gradient-to-b from-stone-800 to-neutral-950 text-stone-200",
    },
    toxic: {
      emoji: "⚠️",
      className:
        "border-2 border-yellow-600/50 bg-gradient-to-b from-yellow-950 to-stone-950 text-yellow-200/90",
    },
    void: VOID_OBSTACLE,
  },
  obstacleDefault: {
    emoji: "⬛",
    className: "border-2 border-neutral-700 bg-neutral-950 text-neutral-500",
  },
  gridBackground: "rounded-lg bg-gradient-to-br from-stone-900/80 via-neutral-950 to-slate-950 ring-1 ring-stone-600/30 p-1.5 sm:p-2",
};

/** Secteur 7 — effet de levier / acier bleu. */
const leverage: BiomeThemeDefinition = {
  buildings: {
    habitacle: {
      emoji: "🏛️",
      color:
        "border border-slate-200/90 bg-gradient-to-b from-slate-100 to-slate-700 text-slate-900 border-b-[6px] border-b-slate-900 shadow-[0_6px_0_rgba(30,41,59,0.35)]",
    },
    eau: {
      emoji: "☕",
      color:
        "border border-blue-200/90 bg-gradient-to-b from-blue-100 to-blue-700 text-blue-950 border-b-[6px] border-b-blue-900 shadow-[0_6px_0_rgba(29,78,216,0.28)]",
    },
    serre: {
      emoji: "🍋",
      color:
        "border border-cyan-200/80 bg-gradient-to-b from-cyan-50 to-cyan-600 text-cyan-950 border-b-[6px] border-b-cyan-800 shadow-[0_6px_0_rgba(14,116,144,0.28)]",
    },
    mine: {
      emoji: "🧲",
      color:
        "border border-indigo-200/90 bg-gradient-to-b from-indigo-100 to-indigo-800 text-indigo-50 border-b-[6px] border-b-indigo-950 shadow-[0_6px_0_rgba(55,48,163,0.35)]",
    },
  },
  obstacles: {
    lake: {
      emoji: "🌊",
      className:
        "border-2 border-blue-500/45 bg-gradient-to-b from-slate-900 to-blue-950 text-blue-100/90",
    },
    mountain: {
      emoji: "⛰️",
      className:
        "border-2 border-slate-600/50 bg-gradient-to-b from-slate-800 to-slate-950 text-slate-200",
    },
    toxic: {
      emoji: "☠️",
      className:
        "border-2 border-lime-500/45 bg-gradient-to-b from-lime-950 to-slate-950 text-lime-200",
    },
    void: VOID_OBSTACLE,
  },
  obstacleDefault: {
    emoji: "⬛",
    className: "border-2 border-slate-600 bg-slate-900 text-slate-400",
  },
  gridBackground: "rounded-lg bg-gradient-to-b from-slate-900/90 via-blue-950/40 to-slate-950 ring-1 ring-blue-500/20 p-1.5 sm:p-2",
};

/** Secteur 8 — marché gris / rouge danger. */
const greyMarket: BiomeThemeDefinition = {
  buildings: {
    habitacle: {
      emoji: "🏚️",
      color:
        "border border-red-200/80 bg-gradient-to-b from-red-100 to-red-700 text-red-950 border-b-[6px] border-b-red-900 shadow-[0_6px_0_rgba(185,28,28,0.3)]",
    },
    eau: {
      emoji: "🛢️",
      color:
        "border border-rose-200/80 bg-gradient-to-b from-rose-100 to-rose-700 text-rose-950 border-b-[6px] border-b-rose-900 shadow-[0_6px_0_rgba(190,18,60,0.28)]",
    },
    serre: {
      emoji: "🍄",
      color:
        "border border-orange-200/80 bg-gradient-to-b from-orange-100 to-red-600 text-red-950 border-b-[6px] border-b-red-900 shadow-[0_6px_0_rgba(153,27,27,0.28)]",
    },
    mine: {
      emoji: "📦",
      color:
        "border border-stone-400/90 bg-gradient-to-b from-stone-200 to-stone-800 text-stone-100 border-b-[6px] border-b-stone-950 shadow-[0_6px_0_rgba(28,25,23,0.4)]",
    },
  },
  obstacles: {
    lake: {
      emoji: "🔥",
      className:
        "border-2 border-orange-600/50 bg-gradient-to-b from-red-950 to-black text-orange-300/90",
    },
    mountain: {
      emoji: "🗡️",
      className:
        "border-2 border-red-900/55 bg-gradient-to-b from-red-950 to-stone-950 text-red-200/80",
    },
    toxic: {
      emoji: "☠️",
      className:
        "border-2 border-lime-500/45 bg-gradient-to-b from-lime-950 to-black text-lime-200",
    },
    void: VOID_OBSTACLE,
  },
  obstacleDefault: {
    emoji: "⬛",
    className: "border-2 border-red-950/60 bg-black text-red-900/50",
  },
  gridBackground: "rounded-lg bg-gradient-to-br from-red-950/50 via-black to-orange-950/40 ring-1 ring-red-600/30 p-1.5 sm:p-2",
};

/** Secteur 9 — trou noir / exit cosmique. */
const voidExit: BiomeThemeDefinition = {
  buildings: {
    habitacle: {
      emoji: "🛸",
      color:
        "border border-violet-300/80 bg-gradient-to-b from-violet-200 to-violet-900 text-violet-50 border-b-[6px] border-b-violet-950 shadow-[0_6px_0_rgba(91,33,182,0.4)]",
    },
    eau: {
      emoji: "🌪️",
      color:
        "border border-indigo-200/80 bg-gradient-to-b from-indigo-100 to-purple-800 text-indigo-50 border-b-[6px] border-b-purple-950 shadow-[0_6px_0_rgba(88,28,135,0.35)]",
    },
    serre: {
      emoji: "🥀",
      color:
        "border border-fuchsia-200/80 bg-gradient-to-b from-fuchsia-100 to-purple-700 text-fuchsia-50 border-b-[6px] border-b-purple-900 shadow-[0_6px_0_rgba(126,34,206,0.3)]",
    },
    mine: {
      emoji: "💎",
      color:
        "border border-zinc-400/90 bg-gradient-to-b from-zinc-300 to-black text-zinc-100 border-b-[6px] border-b-black shadow-[0_6px_0_rgba(0,0,0,0.5)]",
    },
  },
  obstacles: {
    lake: {
      emoji: "🌑",
      className:
        "border-2 border-violet-800/60 bg-gradient-to-b from-black via-violet-950 to-black text-violet-300/80 shadow-[inset_0_0_20px_rgba(139,92,246,0.2)]",
    },
    mountain: {
      emoji: "🪐",
      className:
        "border-2 border-purple-700/50 bg-gradient-to-b from-purple-950 to-black text-purple-200/80",
    },
    toxic: {
      emoji: "👾",
      className:
        "border-2 border-fuchsia-500/45 bg-gradient-to-b from-fuchsia-950 to-black text-fuchsia-300",
    },
    void: VOID_OBSTACLE,
  },
  obstacleDefault: {
    emoji: "⬛",
    className: "border-2 border-violet-950/70 bg-black text-violet-500/40",
  },
  gridBackground: "rounded-lg bg-gradient-to-br from-black via-violet-950/80 to-purple-950/60 ring-1 ring-violet-500/35 p-1.5 sm:p-2",
};

export const BIOME_THEMES: Record<PlanetId, BiomeThemeDefinition> = {
  0: classic,
  1: space,
  2: offshore,
  3: desert,
  4: bubble,
  5: fundraise,
  6: structured,
  7: leverage,
  8: greyMarket,
  9: voidExit,
};

export function clampPlanetId(n: number): PlanetId {
  if (!Number.isFinite(n)) return 0;
  const x = Math.floor(n);
  if (x < 0) return 0;
  if (x > 9) return 9;
  return x as PlanetId;
}

export function getBiomeTheme(planetId: number): BiomeThemeDefinition {
  return BIOME_THEMES[clampPlanetId(planetId)];
}

export function getBiomeBuildingSkin(planetId: number, type: BuildingType): BiomeBuildingSkin {
  return getBiomeTheme(planetId).buildings[type];
}

export function getBiomeObstacleSkin(
  planetId: number,
  terrain: TerrainType,
): BiomeObstacleSkin {
  const theme = getBiomeTheme(planetId);
  if (terrain === "normal") return theme.obstacles.lake;
  return theme.obstacles[terrain] ?? theme.obstacleDefault;
}
