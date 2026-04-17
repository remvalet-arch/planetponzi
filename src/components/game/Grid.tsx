"use client";

import { Cell } from "@/src/components/game/Cell";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

export function Grid() {
  const grid = useLevelRunStore((s) => s.grid);
  const status = useLevelRunStore((s) => s.status);
  const placeBuilding = useLevelRunStore((s) => s.placeBuilding);

  return (
    <div
      className="pp-game-grid-panel mx-auto w-full max-w-sm"
      role="grid"
      aria-label="Grille de placement 4 par 4"
    >
      <div className="grid grid-cols-4 gap-2">
        {grid.map((cell) => (
          <div key={cell.index} role="gridcell" className="min-w-0">
            <Cell
              cell={cell}
              onClick={
                status === "playing" && cell.building === null
                  ? () => placeBuilding(cell.index)
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
