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
  type PlanetDefinition,
} from "@/src/lib/levels";
import { toRomanSector } from "@/src/lib/roman";
import { useProgressStore } from "@/src/store/useProgressStore";

const orderedLevels = [...LEVELS].sort((a, b) => a.id - b.id);

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

type LevelMapProps = {
  scrollParentRef: RefObject<HTMLDivElement | null>;
};

const CONSTELLATION_CHAINS: number[][] = [
  [1, 28, 55, 82, 100],
  [12, 40, 68, 95],
];

function constellationPointsForChain(chain: number[]): string {
  const pts: string[] = [];
  for (const id of chain) {
    const l = LEVELS.find((x) => x.id === id);
    if (l) pts.push(`${l.position.x},${l.position.y}`);
  }
  return pts.join(" ");
}

const FLOATING_MONEY = [
  { emoji: "💵", left: "8%", top: "18%", d: 5.2 },
  { emoji: "💰", left: "88%", top: "22%", d: 6.1 },
  { emoji: "💵", left: "14%", top: "72%", d: 5.5 },
  { emoji: "💰", left: "78%", top: "58%", d: 6.8 },
  { emoji: "💵", left: "48%", top: "12%", d: 7.2 },
  { emoji: "💰", left: "62%", top: "88%", d: 5.9 },
] as const;

export function LevelMap({ scrollParentRef }: LevelMapProps) {
  const uid = useId().replace(/:/g, "");
  const filterId = `pp-path-glow-${uid}`;
  const gradId = `pp-neon-stroke-${uid}`;

  const { t } = useAppStrings();
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const starsByLevel = useProgressStore((s) => s.starsByLevel);
  const currentLevel = getMapCurrentLevel(unlockedLevels, starsByLevel);

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

  useLayoutEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const root = scrollParentRef.current;
        const node = root?.querySelector(`[data-pp-map-level="${currentLevel}"]`);
        node?.scrollIntoView({ behavior: "smooth", block: "center" });
        updateBgFromScroll();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [currentLevel, scrollParentRef, updateBgFromScroll]);

  const pathD = orderedLevels.map((l) => `${l.position.x},${l.position.y}`).join(" ");
  const progressLevels = orderedLevels.filter((l) => l.id <= currentLevel);
  const progressPts = progressLevels.map((l) => `${l.position.x},${l.position.y}`);
  const progressD =
    progressPts.length >= 2
      ? progressPts.join(" ")
      : progressPts.length === 1
        ? `${progressPts[0]} ${progressPts[0]}`
        : "";

  const trackHeightPx = Math.max(3200, orderedLevels.length * 52);

  const sectorBanners = useMemo(() => {
    const out: Array<{
      planet: PlanetDefinition;
      first: (typeof orderedLevels)[number];
      title: string;
      subtitle: string;
      blurb: string;
    }> = [];
    for (const planet of PLANETS) {
      const first = orderedLevels.find((l) => l.id === planet.levelMin);
      if (!first) continue;
      const roman = toRomanSector(planet.id + 1);
      const meta = t.planets[planet.id];
      const title =
        planet.id === 0
          ? `${t.map.sectorFirst.replace("{{roman}}", roman)} · ${meta?.name ?? ""}`
          : t.map.sectorEnter.replace("{{roman}}", roman);
      out.push({
        planet,
        first,
        title,
        subtitle: meta?.name ?? "",
        blurb: meta?.blurb ?? "",
      });
    }
    return out;
  }, [t]);

  return (
    <section
      className="relative w-full min-w-0 px-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-2"
      aria-label="Carte de progression des niveaux"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-violet-500/25 shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-[background] duration-300 ease-out"
        style={{
          minHeight: trackHeightPx,
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

        <svg
          className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.85]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {CONSTELLATION_CHAINS.map((chain, i) => (
            <polyline
              key={i}
              fill="none"
              points={constellationPointsForChain(chain)}
              stroke="rgb(250 250 250)"
              strokeOpacity={0.14}
              strokeWidth={0.22}
              strokeDasharray="0.6 1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>

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

        {sectorBanners.map(({ planet, first, title, subtitle, blurb }) => (
          <div
            key={planet.id}
            className="pointer-events-none absolute z-[3] w-[min(92%,20rem)]"
            style={{
              left: "50%",
              top: `${first.position.y}%`,
              transform: "translate(-50%, calc(-100% - 0.75rem))",
            }}
          >
            <div className="rounded-2xl border border-white/20 bg-slate-950/75 px-3 py-2 text-center shadow-lg backdrop-blur-md">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/95">
                {title}
              </p>
              {planet.id > 0 ? (
                <p className="mt-0.5 text-sm font-bold leading-tight text-white">{subtitle}</p>
              ) : null}
              <p className="mt-1 font-mono text-[10px] leading-snug text-slate-300/90">{blurb}</p>
            </div>
          </div>
        ))}

        <svg
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
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
          <polyline
            fill="none"
            points={pathD}
            stroke="rgb(15 23 42 / 0.55)"
            strokeWidth="0.45"
            strokeDasharray="1.2 1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {progressD ? (
            <polyline
              fill="none"
              points={progressD}
              stroke={`url(#${gradId})`}
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${filterId})`}
            />
          ) : null}
        </svg>

        {orderedLevels.map((level) => {
          const { x, y } = level.position;
          const unlocked = unlockedLevels.includes(level.id);
          const isLocked = !unlocked || level.id > currentLevel;
          const isActive = unlocked && level.id === currentLevel;
          const isDone = unlocked && level.id < currentLevel;
          const earned = (starsByLevel[String(level.id)] ?? 0) as 0 | 1 | 2 | 3;

          const nodeSize = "size-[clamp(2.85rem,12vw,3.35rem)]";

          return (
            <div
              key={level.id}
              data-pp-map-level={level.id}
              className="absolute z-[2]"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="relative flex flex-col items-center gap-1">
                {isLocked ? (
                  <div
                    className={`${nodeSize} relative flex cursor-not-allowed flex-col items-center justify-center rounded-full border-2 border-slate-700/90 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 text-slate-300 shadow-[inset_0_2px_8px_rgb(0_0_0/0.5),0_4px_0_rgb(15_23_42)] ring-1 ring-black/40`}
                    title={`Niveau ${level.id} verrouillé`}
                  >
                    <Lock className="size-[1.1rem] shrink-0 opacity-80" strokeWidth={2.5} aria-hidden />
                    <span className="sr-only">Niveau {level.id} verrouillé</span>
                    <span className="absolute bottom-1 font-mono text-[10px] font-black tabular-nums leading-none text-slate-500">
                      {level.id}
                    </span>
                  </div>
                ) : isDone ? (
                  <Link
                    href={`/level/${level.id}`}
                    onPointerDown={() => vibrateLevelTap()}
                    className="group flex flex-col items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400/70"
                    aria-label={`Niveau ${level.id} terminé, rejouer`}
                  >
                    <div
                      className={`${nodeSize} flex items-center justify-center rounded-full border-2 border-emerald-400/70 bg-gradient-to-b from-amber-300 via-emerald-400 to-emerald-700 font-mono text-sm font-black text-emerald-950 shadow-[0_0_20px_rgb(52_211_153/0.55),inset_0_2px_6px_rgb(255_255_255/0.35)] ring-2 ring-emerald-300/40 transition-transform group-hover:scale-[1.04] group-active:scale-[0.96]`}
                    >
                      <Check className="size-6 stroke-[3] text-emerald-950 drop-shadow-sm" aria-hidden />
                    </div>
                    <div className="flex h-4 items-center justify-center gap-0.5" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < earned
                              ? "fill-amber-400 text-amber-600 drop-shadow-[0_0_4px_rgb(251_191_36/0.8)]"
                              : "fill-slate-600/50 text-slate-500"
                          }`}
                          strokeWidth={1.25}
                        />
                      ))}
                    </div>
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
                        className={`${nodeSize} flex items-center justify-center rounded-full border-2 border-cyan-200/90 bg-gradient-to-b from-violet-200 via-fuchsia-300 to-cyan-300 font-mono text-base font-black text-violet-950 shadow-[0_0_28px_rgb(34_211_238/0.65),0_0_14px_rgb(167_139_250/0.9),inset_0_2px_8px_rgb(255_255_255/0.5)] ring-2 ring-cyan-200/50 transition-transform group-hover:scale-[1.05] group-active:scale-[0.95]`}
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

        <MapCeoAvatar />
      </div>
    </section>
  );
}
