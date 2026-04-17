"use client";

import { Cell } from "@/src/components/game/Cell";
import { useLevelRunStore } from "@/src/store/useLevelRunStore";

export function Grid() {
  const grid = useLevelRunStore((s) => s.grid);
  const status = useLevelRunStore((s) => s.status);
  const activeBooster = useLevelRunStore((s) => s.activeBooster);
  const demolishFlash = useLevelRunStore((s) => s.demolishFlash);
  const placeBuilding = useLevelRunStore((s) => s.placeBuilding);

  const demolitionMode = status === "playing" && activeBooster === "demolition";

  return (
    <div
      className={`pp-game-grid-panel mx-auto w-full max-w-sm transition-[box-shadow] duration-200 ${
        demolitionMode
          ? "cursor-crosshair shadow-[0_0_0_2px_rgb(244_63_94/0.45),0_0_28px_rgb(244_63_94/0.2)]"
          : ""
      }`}
      role="grid"
      aria-label={demolitionMode ? "Grille — mode démolition" : "Grille de placement 4 par 4"}
    >
      <div className="grid grid-cols-4 gap-2">
        {grid.map((cell) => {
          const canPlace = status === "playing" && !demolitionMode && cell.building === null;
          const canDemolish =
            status === "playing" && demolitionMode && cell.building !== null;
          const onClick =
            canPlace || canDemolish ? () => placeBuilding(cell.index) : undefined;
          const flashNonce =
            demolishFlash?.index === cell.index ? demolishFlash.nonce : 0;

          return (
            <div key={cell.index} role="gridcell" className="min-w-0">
              <Cell
                cell={cell}
                onClick={onClick}
                demolitionTarget={demolitionMode && cell.building !== null}
                demolishFlashNonce={flashNonce}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
