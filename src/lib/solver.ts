import { getDeckScoreMultiplier } from "@/src/lib/difficulty";
import { generatePlacementSequence } from "@/src/lib/rng";
import { calculateGridScore } from "@/src/lib/scoring";
import type { BuildingType, Cell, DeckChallengeLevel } from "@/src/types/game";

const scoreCache = new Map<string, number>();

function emptyGrid(): Cell[] {
  return Array.from({ length: 16 }, (_, index) => ({
    index,
    building: null,
  }));
}

function cloneGrid(grid: Cell[]): Cell[] {
  return grid.map((c) => ({ index: c.index, building: c.building }));
}

function totalRoiScore(grid: Cell[], mult: number): number {
  return Math.round(calculateGridScore(grid) * mult);
}

/**
 * Une itération gloutonne : à chaque tour, place sur la case vide qui maximise le score total courant (ROI × multiplicateur).
 */
function greedyPlaythrough(
  sequence: BuildingType[],
  mult: number,
  tieNoise: (i: number) => number,
): number {
  const grid = emptyGrid();
  for (let turn = 0; turn < 16; turn++) {
    const building = sequence[turn]!;
    const candidates: number[] = [];
    for (let i = 0; i < 16; i++) {
      if (grid[i]!.building === null) candidates.push(i);
    }
    if (!candidates.length) break;

    let bestIdx = candidates[0]!;
    let best = Number.NEGATIVE_INFINITY;
    for (const idx of candidates) {
      const trial = cloneGrid(grid);
      trial[idx] = { ...trial[idx]!, building };
      const s = totalRoiScore(trial, mult) + tieNoise(idx) * 0.001;
      if (s > best) {
        best = s;
        bestIdx = idx;
      }
    }
    grid[bestIdx] = { ...grid[bestIdx]!, building };
  }
  return totalRoiScore(grid, mult);
}

/**
 * Estime un score maximal plausible (glouton × 100 essais, cache par seed + deck).
 * `cargoSeed` : même chaîne que pour `generatePlacementSequence` (ex. `pp-lvl-0001-v1`).
 */
export function estimateMaxScore(cargoSeed: string, deckChallengeLevel: DeckChallengeLevel): number {
  const key = `${cargoSeed}\0${deckChallengeLevel}`;
  const hit = scoreCache.get(key);
  if (hit !== undefined) return hit;

  const sequence = generatePlacementSequence(cargoSeed);
  const mult = getDeckScoreMultiplier(deckChallengeLevel);
  let best = 0;

  for (let iter = 0; iter < 100; iter++) {
    const noise = (idx: number) => ((iter * 31 + idx * 17) % 997) / 997;
    const score = greedyPlaythrough(sequence, mult, noise);
    if (score > best) best = score;
  }

  scoreCache.set(key, best);
  return best;
}
