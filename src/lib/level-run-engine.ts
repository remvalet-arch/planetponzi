import { resolveSeismicTargetIndex } from "@/src/lib/aleas";
import { detectIndustrialMega2x2, megaJustFormed } from "@/src/lib/megas";
import { getCellScores } from "@/src/lib/scoring";
import { calculateSessionGridScore } from "@/src/lib/session-scoring";
import type { ActiveBooster, BuildingType, Cell, GameStatus } from "@/src/types/game";

export type GridTemporaryEffect =
  | { kind: "fiscal_freeze"; turn: number; cellIndex: number }
  | { kind: "mega_industrial_fusion"; turn: number; topLeft: number }
  | { kind: "seismic_rift"; turn: number; cellIndex: number };

export type LevelRunPlacementSlice = {
  status: GameStatus;
  turn: number;
  grid: Cell[];
  placementSequence: BuildingType[];
  activeBooster: ActiveBooster | null;
};

export type ValidatePlacementResult =
  | { ok: true; mode: "demolition"; cellIndex: number }
  | { ok: true; mode: "place"; cellIndex: number; building: BuildingType }
  | { ok: false };

function maxTurns(state: LevelRunPlacementSlice): number {
  return state.placementSequence.length;
}

export function validatePlacement(state: LevelRunPlacementSlice, cellIndex: number): ValidatePlacementResult {
  if (state.status !== "playing") return { ok: false };
  if (cellIndex < 0 || cellIndex > 15) return { ok: false };

  const cap = maxTurns(state);

  if (state.activeBooster === "demolition") {
    if (state.turn >= cap) return { ok: false };
    const cell = state.grid[cellIndex];
    if (!cell || cell.building === null) return { ok: false };
    return { ok: true, mode: "demolition", cellIndex };
  }

  if (state.turn >= cap) return { ok: false };
  const target = state.grid[cellIndex];
  if (!target?.isPlayable) return { ok: false };
  if (target.building !== null) return { ok: false };
  if (state.placementSequence.length < 1) return { ok: false };
  const building = state.placementSequence[state.turn];
  return { ok: true, mode: "place", cellIndex, building };
}

export function applyBuildingToGrid(grid: Cell[], cellIndex: number, building: BuildingType): Cell[] {
  return grid.map((c, i) => (i === cellIndex ? { ...c, building } : c));
}

export function clearBuildingAt(grid: Cell[], cellIndex: number): Cell[] {
  return grid.map((c, i) => (i === cellIndex ? { ...c, building: null } : c));
}

export function isFiscalBossLevel(levelId: number): boolean {
  return levelId > 0 && levelId % 10 === 0;
}

/**
 * Choisit la case occupée (hors déjà gelée) avec la plus forte contribution de score de base.
 */
export function pickFiscalFreezeTarget(
  grid: Cell[],
  frozenCellIndices: readonly number[],
  mineScoreBonusPerMine = 0,
): number | null {
  const scores = getCellScores(grid, { mineScoreBonusPerMine });
  const frozen = new Set(frozenCellIndices);
  let best = -Infinity;
  let bestIdx: number | null = null;
  for (let i = 0; i < 16; i++) {
    if (grid[i]?.isPlayable === false) continue;
    if (grid[i]?.building == null) continue;
    if (frozen.has(i)) continue;
    const s = scores[i] ?? 0;
    if (s > best) {
      best = s;
      bestIdx = i;
    } else if (s === best && bestIdx !== null && i < bestIdx) {
      bestIdx = i;
    }
  }
  return bestIdx;
}

export type SeismicRiftDef = {
  triggerAtTurn: number;
  targetCellIndex?: number;
};

export type EvaluateTriggersInput = {
  levelId: number;
  gridBeforePlacement: Cell[];
  gridAfterPlacement: Cell[];
  newTurn: number;
  frozenCellIndices: readonly number[];
  maxTurn: number;
  cargoSeed: string;
  seismicRift?: SeismicRiftDef;
  /** Bonus Tour Ponzi par mine (gel fiscal : cible la plus forte contribution). */
  mineScoreBonusPerMine?: number;
};

export type EvaluateTriggersOutput = {
  nextFrozenCellIndices: number[];
  newTemporaryEffects: GridTemporaryEffect[];
  gridShake: boolean;
  /** Grille après aléas (faille sismique) — identique à l’entrée si aucun effet. */
  postAleasGrid: Cell[];
};

/**
 * Hooks post-placement : méga (shake), boss Contrôle fiscal (gel), Faille sismique.
 */
export function evaluateTriggers(input: EvaluateTriggersInput): EvaluateTriggersOutput {
  const newEffects: GridTemporaryEffect[] = [];
  let working = input.gridAfterPlacement;

  let gridShake = megaJustFormed(input.gridBeforePlacement, working);
  if (gridShake) {
    const mega = detectIndustrialMega2x2(working);
    if (mega) {
      newEffects.push({
        kind: "mega_industrial_fusion",
        turn: input.newTurn,
        topLeft: mega.topLeft,
      });
    }
  }

  let nextFrozen = [...input.frozenCellIndices];
  if (
    isFiscalBossLevel(input.levelId) &&
    input.newTurn > 0 &&
    input.newTurn <= input.maxTurn &&
    input.newTurn % 4 === 0
  ) {
    const pick = pickFiscalFreezeTarget(working, nextFrozen, input.mineScoreBonusPerMine ?? 0);
    if (pick != null && !nextFrozen.includes(pick)) {
      nextFrozen = [...nextFrozen, pick];
      newEffects.push({ kind: "fiscal_freeze", turn: input.newTurn, cellIndex: pick });
    }
  }

  if (
    input.seismicRift &&
    input.newTurn === input.seismicRift.triggerAtTurn &&
    input.cargoSeed.length > 0
  ) {
    const idx = resolveSeismicTargetIndex(working, input.cargoSeed, input.seismicRift.targetCellIndex);
    if (idx != null) {
      working = clearBuildingAt(working, idx);
      newEffects.push({ kind: "seismic_rift", turn: input.newTurn, cellIndex: idx });
      gridShake = true;
    }
  }

  return {
    nextFrozenCellIndices: nextFrozen,
    newTemporaryEffects: newEffects,
    gridShake,
    postAleasGrid: working,
  };
}

export function scoreGridForDeck(
  grid: Cell[],
  frozenCellIndices: readonly number[],
  deckMultiplier: number,
  mineScoreBonusPerMine?: number,
): number {
  const base = calculateSessionGridScore(grid, frozenCellIndices, mineScoreBonusPerMine);
  return Math.round(base * deckMultiplier);
}
