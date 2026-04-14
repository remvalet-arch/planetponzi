"use client";

import { Cell } from "@/src/components/game/Cell";
import { useGameStore } from "@/src/store/useGameStore";

export function Grid() {
  const grid = useGameStore((s) => s.grid);
  const status = useGameStore((s) => s.status);
  const placeBuilding = useGameStore((s) => s.placeBuilding);

  return (
    <div
      className="grid w-full max-w-sm grid-cols-4 gap-2 mx-auto"
      role="grid"
      aria-label="Grille de placement 4 par 4"
    >
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
  );
}
