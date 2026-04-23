"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useLayoutEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, Star } from "lucide-react";

import { MapCeoAvatar } from "@/src/components/map/MapCeoAvatar";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";
import { vibrateLevelTap } from "@/src/lib/haptics";
import {
  getMapCurrentLevel,
  LEVELS,
  PLANETS,
  planetIdForLevel,
  type PlanetDefinition,
} from "@/src/lib/levels";
import { toRomanSector } from "@/src/lib/roman";
import {
  STAR_GATE_QUOTA,
  canPlayLevel,
  isStarGatedBoss,
  preBossStarRange,
  sumStarsInLevelRange,
} from "@/src/lib/star-gate";
import { useProgressStore } from "@/src/store/useProgressStore";

const orderedLevels = [...LEVELS].sort((a, b) => a.id - b.id);

/** Espacement vertical nominal entre centres de nœuds consécutifs. */
const STEP_PX = 56;
/** Espace réservé entre la fin d’un bloc ×10 et le suivant (bannière + respiration du tracé). */
const BANNER_GAP_PX = 250;
const PAD_PX = 28;

const CONSTELLATION_CHAINS: number[][] = [
  [1, 28, 55, 82, 100],
  [12, 40, 68, 95],
];

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  const u = Math.min(1, Math.max(0, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * u),
    Math.round(a[1] + (b[1] - a[1]) * u),
    Math.round(a[2] + (b[2] - a[2]) * u),
  ];
}

function buildScrollGradient(
  c0: PlanetDefinition,
  c1: PlanetDefinition,
  t: number,
): string {
  const deep = mixRgb(c0.toneDeep, c1.toneDeep, t);
  const a = mixRgb(c0.toneA, c1.toneA, t);
  const b = mixRgb(c0.toneB, c1.toneB, t);
  const [dr, dg, db] = deep;
  const [ar, ag, ab] = a;
  const [br, bg, bb] = b;
  return `
    radial-gradient(ellipse 120% 70% at 50% 18%, rgb(${ar} ${ag} ${ab} / 0.5) 0%, transparent 52%),
    radial-gradient(ellipse 90% 55% at 85% 55%, rgb(${br} ${bg} ${bb} / 0.22) 0%, transparent 48%),
    radial-gradient(ellipse 100% 50% at 12% 75%, rgb(${ar} ${ag} ${ab} / 0.28) 0%, transparent 42%),
    linear-gradient(180deg, rgb(${dr} ${dg} ${db}) 0%, rgb(${Math.round((dr + ar) / 2)} ${Math.round((dg + ag) / 2)} ${Math.round((db + ab) / 2)}) 45%, rgb(${br} ${bg} ${bb}) 100%)
  `;
}

function starfieldLayer(opacity: number): string {
  const dots: string[] = [];
  const seeds = [11, 17, 23, 29, 31, 37, 41, 43];
  for (let i = 0; i < 48; i++) {
    const x = ((i * 17 + seeds[i % 8]) % 100) + (i % 3) * 0.7;
    const y = ((i * 23 + seeds[(i + 3) % 8]) % 100) + ((i * 7) % 5) * 0.3;
    const c = i % 5 === 0 ? "255 250 180" : "255 255 255";
    dots.push(`radial-gradient(1.2px 1.2px at ${x}% ${y}%, rgb(${c} / ${opacity}) 50%, transparent 52%)`);
  }
  return dots.join(", ");
}

/** Abscisse % (8–92) : même logique sinusoïdale que `generateLevels` pour une courbe continue. */
function xPercentForLevelId(levelId: number): number {
  const i = levelId - 1;
  const xRaw = 50 + 42 * Math.sin(i * 0.52 + 0.45) + 6 * Math.sin(i * 0.31);
  return Math.min(92, Math.max(8, Math.round(xRaw * 10) / 10));
}

type BannerLayout = {
  planet: PlanetDefinition;
  yCenterPx: number;
  title: string;
  subtitle: string;
  blurb: string;
};

type MapLayout = {
  heightPx: number;
  /** Centre vertical du nœud en % du conteneur (0 = haut). */
  yPctByLevelId: Record<number, number>;
  banners: BannerLayout[];
};

/**
 * Carte « ascension » : parcours du niveau max au 1, y croissant vers le bas.
 * - Niveau 100 en haut (y faible), niveau 1 en bas (y fort).
 * - Bannière de secteur dans le gap au-dessus des blocs 10, 20, … 90 et bannière d’entrée au-dessus du bloc sommet (91–100).
 */
function buildMapLayout(
  levels: typeof orderedLevels,
  getBannerCopy: (planet: PlanetDefinition) => { title: string; subtitle: string; blurb: string },
): MapLayout {
  const sorted = [...levels].sort((a, b) => a.id - b.id);
  const minId = sorted[0]?.id ?? 1;
  const maxId = sorted[sorted.length - 1]?.id ?? 100;

  let y = PAD_PX;
  const yCenterPxByLevelId: Record<number, number> = {};
  const banners: BannerLayout[] = [];

  for (let id = maxId; id >= minId; id--) {
    if (id === maxId) {
      const planetIdx = planetIdForLevel(maxId);
      const planet = PLANETS[planetIdx];
      if (planet) {
        const copy = getBannerCopy(planet);
        banners.push({
          planet,
          yCenterPx: y + BANNER_GAP_PX / 2,
          ...copy,
        });
      }
      y += BANNER_GAP_PX;
    } else if (id % 10 === 0) {
      const planetIdx = planetIdForLevel(id);
      const planet = PLANETS[planetIdx];
      if (planet) {
        const copy = getBannerCopy(planet);
        banners.push({
          planet,
          yCenterPx: y + BANNER_GAP_PX / 2,
          ...copy,
        });
      }
      y += BANNER_GAP_PX;
    }
    yCenterPxByLevelId[id] = y + STEP_PX / 2;
    y += STEP_PX;
  }

  const heightPx = Math.max(y + PAD_PX, 800);
  const yPctByLevelId: Record<number, number> = {};
  for (const l of sorted) {
    const py = yCenterPxByLevelId[l.id];
    yPctByLevelId[l.id] = py != null ? (py / heightPx) * 100 : 50;
  }

  return { heightPx, yPctByLevelId, banners };
}

function constellationPointsForChain(chain: number[], yPctByLevelId: Record<number, number>): string {
  const pts: string[] = [];
  for (const id of chain) {
    const x = xPercentForLevelId(id);
    pts.push(`${x},${yPctByLevelId[id] ?? 50}`);
  }
  return pts.join(" ");
}

type LevelMapProps = {
  scrollParentRef: RefObject<HTMLDivElement | null>;
};

const FLOATING_MONEY = [
  { emoji: "💵", left: "8%", top: "18%", d: 5.2 },
  { emoji: "💰", left: "88%", top: "22%", d: 6.1 },
  { emoji: "💵", left: "14%", top: "72%", d: 5.5 },
  { emoji: "💰", left: "78%", top: "58%", d: 6.8 },
  { emoji: "💵", left: "48%", top: "12%", d: 7.2 },
  { emoji: "💰", left: "62%", top: "88%", d: 5.9 },
] as const;

/** Jauge Star Gate : animation « récolte » quand le total du secteur augmente. */
function StarGateQuotaBadge({ gateStars }: { gateStars: number }) {
  const { t } = useAppStrings();
  return (
    <motion.span
      key={gateStars}
      className="rounded-full border border-amber-500/40 bg-amber-950/80 px-1.5 py-0.5 font-mono text-[9px] font-bold tabular-nums text-amber-200"
      initial={{ scale: 0.35, rotate: -42, opacity: 0.35 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 440, damping: 14 }}
    >
      {t.map.starGateBadge(gateStars, STAR_GATE_QUOTA)}
    </motion.span>
  );
}

/** Étoiles sous un nœud terminé : pop échelonné quand le score du niveau augmente. */
function LevelCompletedStars({ earned }: { earned: 0 | 1 | 2 | 3 }) {
  return (
    <motion.div
      key={earned}
      className="flex h-4 items-center justify-center gap-0.5"
      aria-hidden
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { scale: 0.2, opacity: 0.25, rotate: -52 },
            show: {
              scale: 1,
              opacity: 1,
              rotate: 0,
              transition: { type: "spring", stiffness: 500, damping: 13 },
            },
          }}
        >
          <Star
            className={`size-3.5 ${
              i < earned
                ? "fill-amber-400 text-amber-600 drop-shadow-[0_0_4px_rgb(251_191_36/0.8)]"
                : "fill-slate-600/50 text-slate-500"
            }`}
            strokeWidth={1.25}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function LevelMap({ scrollParentRef }: LevelMapProps) {
  const uid = useId().replace(/:/g, "");
  const filterId = `pp-path-glow-${uid}`;
  const gradId = `pp-neon-stroke-${uid}`;

  const { t } = useAppStrings();
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const starsByLevel = useProgressStore((s) => s.starsByLevel);
  const currentLevel = getMapCurrentLevel(unlockedLevels, starsByLevel);
  const [starGateHint, setStarGateHint] = useState<string | null>(null);

  const layout = useMemo(() => {
    return buildMapLayout(orderedLevels, (planet) => {
      const roman = toRomanSector(planet.id + 1);
      const meta = t.planets[planet.id];
      const title =
        planet.id === 0
          ? `${t.map.sectorFirst.replace("{{roman}}", roman)} · ${meta?.name ?? ""}`
          : t.map.sectorEnter.replace("{{roman}}", roman);
      return {
        title,
        subtitle: meta?.name ?? "",
        blurb: meta?.blurb ?? "",
      };
    });
  }, [t]);

  const { heightPx, yPctByLevelId, banners } = layout;

  const pathD = useMemo(
    () => orderedLevels.map((l) => `${xPercentForLevelId(l.id)},${yPctByLevelId[l.id] ?? 50}`).join(" "),
    [layout],
  );

  const progressD = useMemo(() => {
    const pts = orderedLevels
      .filter((l) => l.id <= currentLevel)
      .map((l) => `${xPercentForLevelId(l.id)},${yPctByLevelId[l.id] ?? 50}`);
    if (pts.length >= 2) return pts.join(" ");
    if (pts.length === 1) return `${pts[0]} ${pts[0]}`;
    return "";
  }, [currentLevel, layout]);

  const [scrollBg, setScrollBg] = useState(() =>
    buildScrollGradient(PLANETS[0]!, PLANETS[0]!, 0),
  );
  const [scrollParallax, setScrollParallax] = useState(0);

  const updateBgFromScroll = useCallback(() => {
    const el = scrollParentRef.current;
    if (!el) return;
    const max = Math.max(1, el.scrollHeight - el.clientHeight);
    const ratio = el.scrollTop / max;
    setScrollParallax(ratio);
    /* Haut de scroll = niveaux élevés ; bas = niveaux bas → on interpole depuis 100 vers 1 */
    const levelFloat = 100 - ratio * 99;
    const pf = (levelFloat - 1) / 10;
    const p0 = Math.min(9, Math.max(0, Math.floor(pf)));
    const tRaw = pf - p0;
    const p1 = Math.min(9, p0 + 1);
    const c0 = PLANETS[p0]!;
    const c1 = PLANETS[p1]!;
    const t = p0 === p1 ? 0 : Math.min(1, Math.max(0, tRaw));
    setScrollBg(buildScrollGradient(c0, c1, t));
  }, [scrollParentRef]);

  useEffect(() => {
    const el = scrollParentRef.current;
    if (!el) return;
    updateBgFromScroll();
    el.addEventListener("scroll", updateBgFromScroll, { passive: true });
    return () => el.removeEventListener("scroll", updateBgFromScroll);
  }, [scrollParentRef, updateBgFromScroll]);

  const scrollCurrentLevelIntoView = useCallback(
    (behavior: ScrollBehavior) => {
      const root = scrollParentRef.current;
      const node = root?.querySelector(`[data-pp-map-level="${currentLevel}"]`);
      /* Ancrer le niveau courant vers le bas de la fenêtre : base de l’ascension, regard vers le haut */
      node?.scrollIntoView({ behavior, block: "end", inline: "nearest" });
      updateBgFromScroll();
    },
    [currentLevel, scrollParentRef, updateBgFromScroll],
  );

  useLayoutEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        scrollCurrentLevelIntoView("smooth");
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [scrollCurrentLevelIntoView]);

  useEffect(() => {
    const bump = () => {
      scrollCurrentLevelIntoView("smooth");
      window.setTimeout(() => scrollCurrentLevelIntoView("smooth"), 320);
    };
    if (useProgressStore.persist.hasHydrated()) {
      window.setTimeout(bump, 80);
    }
    const unsub = useProgressStore.persist.onFinishHydration(() => {
      window.setTimeout(bump, 80);
    });
    return unsub;
  }, [scrollCurrentLevelIntoView]);

  useEffect(() => {
    if (!starGateHint) return;
    const id = window.setTimeout(() => setStarGateHint(null), 3400);
    return () => window.clearTimeout(id);
  }, [starGateHint]);

  return (
    <section
      className="relative w-full min-w-0 shrink-0 px-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))]"
      aria-label="Carte de progression des niveaux"
    >
      <div
        className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-violet-500/25 shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-[background] duration-300 ease-out"
        style={{
          height: heightPx,
          minHeight: heightPx,
          background: scrollBg,
          boxShadow: "inset 0 0 80px rgb(0 0 0 / 0.35)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.65] transition-opacity duration-300"
          style={{
            backgroundImage: `${starfieldLayer(0.55)}, ${starfieldLayer(0.35)}`,
            backgroundSize: "100% 100%, 120% 120%",
            backgroundPosition: "0 0, 12% 8%",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 animate-pulse opacity-30"
          style={{
            backgroundImage: starfieldLayer(0.25),
            backgroundSize: "140% 140%",
            backgroundPosition: "30% 20%",
          }}
        />

        <motion.div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          style={{
            transform: `translateY(${-scrollParallax * 10}px) scale(${1 + scrollParallax * 0.025})`,
          }}
          aria-hidden
        >
          <svg
            className="h-full w-full opacity-50"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <radialGradient id={`${filterId}-neb-a`} cx="32%" cy="22%" r="58%">
                <stop offset="0%" stopColor="rgb(167 139 250 / 0.42)" />
                <stop offset="55%" stopColor="rgb(99 102 241 / 0.12)" />
                <stop offset="100%" stopColor="rgb(15 23 42 / 0)" />
              </radialGradient>
              <radialGradient id={`${filterId}-neb-b`} cx="78%" cy="72%" r="48%">
                <stop offset="0%" stopColor="rgb(34 211 238 / 0.28)" />
                <stop offset="100%" stopColor="rgb(15 23 42 / 0)" />
              </radialGradient>
            </defs>
            <ellipse cx="34" cy="26" rx="42" ry="36" fill={`url(#${filterId}-neb-a)`} />
            <ellipse cx="74" cy="70" rx="36" ry="30" fill={`url(#${filterId}-neb-b)`} />
          </svg>
          <motion.div
            className="absolute inset-0 mix-blend-screen"
            style={{
              backgroundImage: starfieldLayer(0.16),
              backgroundSize: "110% 110%",
              backgroundPosition: `${12 + scrollParallax * 6}% ${8 + scrollParallax * 4}%`,
            }}
            animate={{ opacity: [0.28, 0.52, 0.28] }}
            transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          {FLOATING_MONEY.map((m, i) => (
            <motion.span
              key={i}
              className="absolute text-sm"
              style={{ left: m.left, top: m.top, opacity: 0.1 }}
              animate={{ y: [0, -8, 0], x: [0, 4, 0], rotate: [0, 6, 0] }}
              transition={{ duration: m.d, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              {m.emoji}
            </motion.span>
          ))}
        </div>

        {starGateHint ? (
          <div
            className="pointer-events-none fixed bottom-[max(6rem,env(safe-area-inset-bottom)+5rem)] left-1/2 z-[60] w-[min(92vw,22rem)] -translate-x-1/2 rounded-pp-md border border-amber-500/50 bg-slate-950/95 px-4 py-3 text-center font-mono text-xs leading-snug text-amber-100 shadow-lg backdrop-blur-md"
            role="status"
            aria-live="polite"
          >
            {starGateHint}
          </div>
        ) : null}

        {/* Chemin SVG sous les bannières ; z-index < bannières < nœuds */}
        <svg
          className="pointer-events-none absolute inset-0 z-[4] h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.35" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="45%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>
          </defs>
          {CONSTELLATION_CHAINS.map((chain, i) => (
            <polyline
              key={`c-${i}`}
              fill="none"
              points={constellationPointsForChain(chain, yPctByLevelId)}
              stroke="rgb(250 250 250)"
              strokeOpacity={0.14}
              strokeWidth={0.22}
              strokeDasharray="0.6 1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <polyline
            fill="none"
            points={pathD}
            stroke="rgb(15 23 42 / 0.55)"
            strokeWidth={0.45}
            strokeDasharray="1.2 1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {progressD ? (
            <>
              <polyline
                fill="none"
                points={progressD}
                stroke={`url(#${gradId})`}
                strokeWidth={0.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${filterId})`}
              />
              <polyline
                className="animate-data-flow"
                fill="none"
                points={progressD}
                stroke={`url(#${gradId})`}
                strokeWidth={1.5}
                strokeDasharray="4 12"
                strokeDashoffset={0}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.92}
              />
            </>
          ) : null}
        </svg>

        {banners.map((b) => (
          <header
            key={`banner-${b.planet.id}`}
            className="absolute left-1/2 z-[14] w-[min(92%,22rem)] -translate-x-1/2 -translate-y-1/2 px-1"
            style={{ top: `${(b.yCenterPx / heightPx) * 100}%` }}
          >
            <div className="rounded-2xl border border-cyan-500/50 bg-slate-900 px-4 py-4 text-center shadow-[0_0_15px_rgba(6,182,212,0.4)] backdrop-blur-md">
              <p className="pp-map-banner-kicker font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                {b.title}
              </p>
              {b.planet.id > 0 ? (
                <p className="pp-map-banner-title mt-3 text-base font-bold leading-snug text-white sm:text-lg">{b.subtitle}</p>
              ) : null}
              <p className="pp-map-banner-body mt-3 whitespace-normal break-words font-mono text-xs leading-relaxed text-slate-200 sm:text-sm">
                {b.blurb}
              </p>
            </div>
          </header>
        ))}

        {/* Nœuds : premier plan au-dessus du chemin et des bannières */}
        <div className="absolute inset-0 z-[25] min-h-0 w-full">
          {orderedLevels.map((level) => {
            const xPct = xPercentForLevelId(level.id);
            const topPct = yPctByLevelId[level.id] ?? 50;
            const unlocked = unlockedLevels.includes(level.id);
            const forwardLocked = unlocked && level.id > currentLevel;
            const starGated = unlocked && !forwardLocked && isStarGatedBoss(level.id, starsByLevel);
            const playable = canPlayLevel(level.id, unlockedLevels, starsByLevel);
            const isActive = playable && level.id === currentLevel;
            const isDone = unlocked && !forwardLocked && !starGated && level.id < currentLevel;
            const earned = (starsByLevel[String(level.id)] ?? 0) as 0 | 1 | 2 | 3;
            const gateRange = preBossStarRange(level.id);
            const gateStars = starGated ? sumStarsInLevelRange(starsByLevel, gateRange.from, gateRange.to) : 0;

            const nodeSize = "size-[clamp(2.85rem,12vw,3.35rem)]";
            /** Orbe « verre » sans backdrop-blur coûteux (sauf nœud actif). */
            const orbGlassBase = `${nodeSize} rounded-full border border-slate-500/30 bg-slate-900/60 shadow-[inset_0_4px_12px_rgba(255,255,255,0.05),0_4px_15px_rgba(0,0,0,0.5)]`;

            return (
              <div
                key={level.id}
                data-pp-map-level={level.id}
                className="absolute z-[25]"
                style={{
                  left: `${xPct}%`,
                  top: `${topPct}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative flex flex-col items-center gap-1">
                  {!unlocked ? (
                    <div
                      className={`${orbGlassBase} relative flex cursor-not-allowed flex-col items-center justify-center text-slate-300`}
                      title={`Niveau ${level.id} verrouillé`}
                    >
                      <Lock className="size-[1.1rem] shrink-0 opacity-80" strokeWidth={2.5} aria-hidden />
                      <span className="sr-only">Niveau {level.id} verrouillé</span>
                      <span className="absolute bottom-1 font-mono text-[10px] font-black tabular-nums leading-none text-slate-500">
                        {level.id}
                      </span>
                    </div>
                  ) : forwardLocked ? (
                    <div
                      className={`${orbGlassBase} relative flex cursor-not-allowed flex-col items-center justify-center text-slate-400`}
                      title={`Niveau ${level.id} — terminez les niveaux précédents`}
                    >
                      <Lock className="size-[1.1rem] shrink-0 opacity-80" strokeWidth={2.5} aria-hidden />
                      <span className="sr-only">Niveau {level.id} verrouillé</span>
                      <span className="absolute bottom-1 font-mono text-[10px] font-black tabular-nums leading-none text-slate-500">
                        {level.id}
                      </span>
                    </div>
                  ) : starGated ? (
                    level.id === currentLevel ? (
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        <button
                          type="button"
                          onClick={() => setStarGateHint(t.map.starGateHint)}
                          className={`${orbGlassBase} relative flex cursor-pointer flex-col items-center justify-center gap-0.5 border-amber-500/50 bg-slate-950/80 text-amber-100 ring-2 ring-amber-400/35 transition-transform hover:scale-[1.03] active:scale-[0.97]`}
                          aria-label={t.map.starGateHint}
                        >
                          <span className="text-base leading-none" aria-hidden>
                            🔒
                          </span>
                          <Lock className="size-[0.65rem] shrink-0 opacity-70" strokeWidth={2.5} aria-hidden />
                          <StarGateQuotaBadge gateStars={gateStars} />
                          <span className="absolute bottom-0.5 font-mono text-[10px] font-black tabular-nums leading-none text-amber-200/80">
                            {level.id}
                          </span>
                        </button>
                      </motion.div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStarGateHint(t.map.starGateHint)}
                        className={`${orbGlassBase} relative flex cursor-pointer flex-col items-center justify-center gap-0.5 border-amber-500/50 bg-slate-950/80 text-amber-100 ring-2 ring-amber-400/35 transition-transform hover:scale-[1.03] active:scale-[0.97]`}
                        aria-label={t.map.starGateHint}
                      >
                        <span className="text-base leading-none" aria-hidden>
                          🔒
                        </span>
                        <Lock className="size-[0.65rem] shrink-0 opacity-70" strokeWidth={2.5} aria-hidden />
                        <StarGateQuotaBadge gateStars={gateStars} />
                        <span className="absolute bottom-0.5 font-mono text-[10px] font-black tabular-nums leading-none text-amber-200/80">
                          {level.id}
                        </span>
                      </button>
                    )
                  ) : isDone ? (
                    <Link
                      href={`/level/${level.id}`}
                      onPointerDown={() => vibrateLevelTap()}
                      className="group flex flex-col items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400/70"
                      aria-label={`Niveau ${level.id} terminé, rejouer`}
                    >
                      <div
                        className={`${orbGlassBase} flex items-center justify-center border-2 border-emerald-400/70 font-mono text-sm font-black text-emerald-200 shadow-[inset_0_4px_12px_rgba(255,255,255,0.06),0_4px_15px_rgba(0,0,0,0.5),0_0_18px_rgba(52,211,153,0.4)] transition-transform group-hover:scale-[1.04] group-active:scale-[0.96]`}
                      >
                        <Check className="size-6 stroke-[3] text-emerald-200 drop-shadow-[0_0_6px_rgba(167,243,208,0.7)]" aria-hidden />
                      </div>
                      <LevelCompletedStars earned={earned} />
                    </Link>
                  ) : isActive ? (
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="flex flex-col items-center gap-1"
                    >
                      <Link
                        href={`/level/${level.id}`}
                        onPointerDown={() => vibrateLevelTap()}
                        className="group flex flex-col items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400/80"
                        aria-current="step"
                        aria-label={`Niveau ${level.id} — à jouer`}
                      >
                        <div
                          className={`${nodeSize} flex items-center justify-center rounded-full border-2 border-amber-400 bg-gradient-to-b from-violet-300/85 via-fuchsia-300/80 to-cyan-300/85 font-mono text-base font-black text-violet-950 backdrop-blur-sm shadow-[inset_0_4px_12px_rgba(255,255,255,0.2),0_0_20px_rgba(251,191,36,0.6)] transition-transform group-hover:scale-[1.05] group-active:scale-[0.95]`}
                        >
                          {level.id}
                        </div>
                      </Link>
                    </motion.div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <MapCeoAvatar stackedTopPercent={(id) => yPctByLevelId[id] ?? 50} />
      </div>
    </section>
  );
}
