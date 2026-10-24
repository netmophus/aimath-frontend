"use client";

import { useState } from "react";

import { concentrationH3O, concentrationOH, natureSolution, notationScientifique } from "@/lib/chimiePh";

/** Concentration en notation scientifique : 1,0×10⁻³ mol/L. */
export function Sci({ x, decimales = 1 }: { x: number; decimales?: number }) {
  const { mantisse, exposant } = notationScientifique(x, decimales);
  return (
    <span className="whitespace-nowrap">
      {mantisse}×10<sup>{exposant < 0 ? `−${-exposant}` : exposant}</sup>
    </span>
  );
}

const DEGRADE = "linear-gradient(to right, #dc2626, #f97316, #facc15, #22c55e, #14b8a6, #3b82f6, #7c3aed)";

/** Curseur de pH (0 à 14, pas 0,1) : [H₃O⁺], [OH⁻] et nature de la solution, à 25 °C. */
export default function EchellePh() {
  const [dixiemes, setDixiemes] = useState(70);
  const nature = natureSolution(dixiemes);
  const couleurNature = nature === "Acide" ? "text-red-700" : nature === "Basique" ? "text-violet-700" : "text-green-700";

  return (
    <div className="my-3 flex flex-col gap-3 rounded-2xl border border-fh-sable bg-white p-4">
      <p className="text-sm font-semibold text-fh-bleu">Échelle de pH</p>

      <div className="relative pt-5">
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 text-xs font-bold text-fh-bleu"
          style={{ left: `${(dixiemes / 140) * 100}%` }}
          aria-hidden
        >
          ▼
        </div>
        <div className="h-4 w-full rounded-full" style={{ background: DEGRADE }} aria-hidden />
        <div className="mt-1 flex justify-between text-[10px] text-fh-ardoise" aria-hidden>
          <span>0</span>
          <span>7</span>
          <span>14</span>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm text-fh-ardoise">
        <span>
          pH = <strong className="text-fh-bleu">{(dixiemes / 10).toFixed(1).replace(".", ",")}</strong>
        </span>
        <input
          type="range"
          min={0}
          max={140}
          step={1}
          value={dixiemes}
          onChange={(e) => setDixiemes(Number(e.target.value))}
          className="w-full accent-fh-orange"
          aria-label="pH de la solution"
        />
      </label>

      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-fh-creme px-3 py-2">
          <div className="text-xs text-fh-ardoise">[H₃O⁺] = 10<sup>−pH</sup></div>
          <div className="font-semibold text-fh-bleu">
            <Sci x={concentrationH3O(dixiemes)} /> mol/L
          </div>
        </div>
        <div className="rounded-lg bg-fh-creme px-3 py-2">
          <div className="text-xs text-fh-ardoise">[OH⁻] = 10<sup>pH−14</sup></div>
          <div className="font-semibold text-fh-bleu">
            <Sci x={concentrationOH(dixiemes)} /> mol/L
          </div>
        </div>
        <div className="rounded-lg bg-fh-creme px-3 py-2">
          <div className="text-xs text-fh-ardoise">Nature</div>
          <div className={`font-semibold ${couleurNature}`}>{nature}</div>
        </div>
      </div>

      <p className="text-xs text-fh-ardoise/70">à 25 °C</p>
    </div>
  );
}
