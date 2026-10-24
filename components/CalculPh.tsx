"use client";

import { useState } from "react";

import { depuisH3O, depuisPH } from "@/lib/chimiePh";
import { Sci } from "./EchellePh";

type Mode = "ph" | "h3o";

/** Calculatrice de pH : pH → concentrations, ou [H₃O⁺] → pH (Kₑ = 10⁻¹⁴, 25 °C). */
export default function CalculPh() {
  const [mode, setMode] = useState<Mode>("ph");
  const [saisie, setSaisie] = useState("3");

  const changerMode = (m: Mode) => {
    setMode(m);
    setSaisie(m === "ph" ? "3" : "0,001");
  };

  const r = saisie.trim() === "" ? null : mode === "ph" ? depuisPH(saisie) : depuisH3O(saisie);

  return (
    <div className="my-3 flex flex-col gap-3 rounded-2xl border border-fh-sable bg-white p-4">
      <p className="text-sm font-semibold text-fh-bleu">Calculatrice de pH</p>

      <div role="tablist" aria-label="Mode de calcul" className="flex gap-2">
        {([["ph", "pH → concentrations"], ["h3o", "[H₃O⁺] → pH"]] as const).map(([m, libelle]) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => changerMode(m)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              mode === m ? "border-fh-orange bg-fh-orange text-white" : "border-fh-sable bg-white text-fh-bleu hover:bg-fh-accent"
            }`}
          >
            {libelle}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-sm text-fh-ardoise">
        {mode === "ph" ? "pH" : "[H₃O⁺] en mol/L"}
        <input
          type="text"
          inputMode="decimal"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          placeholder={mode === "ph" ? "ex. 3" : "ex. 0,001 ou 1e-3"}
          className="rounded-lg border border-fh-sable px-3 py-2 text-base text-fh-bleu"
        />
      </label>

      {r === null ? (
        <p className="text-sm text-fh-ardoise/70">Saisis une valeur pour lancer le calcul.</p>
      ) : !r.ok ? (
        <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">{r.message}</p>
      ) : (
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          {mode === "h3o" && (
            <div className="rounded-lg bg-fh-creme px-3 py-2">
              <div className="text-xs text-fh-ardoise">pH = −log[H₃O⁺]</div>
              <div className="font-semibold text-fh-bleu">{r.pH.toFixed(2).replace(".", ",")}</div>
            </div>
          )}
          {mode === "ph" && (
            <div className="rounded-lg bg-fh-creme px-3 py-2">
              <div className="text-xs text-fh-ardoise">[H₃O⁺] = 10<sup>−pH</sup></div>
              <div className="font-semibold text-fh-bleu"><Sci x={r.h3o} /> mol/L</div>
            </div>
          )}
          <div className="rounded-lg bg-fh-creme px-3 py-2">
            <div className="text-xs text-fh-ardoise">[OH⁻] = Kₑ/[H₃O⁺]</div>
            <div className="font-semibold text-fh-bleu"><Sci x={r.oh} /> mol/L</div>
          </div>
          <div className="rounded-lg bg-fh-creme px-3 py-2">
            <div className="text-xs text-fh-ardoise">Nature</div>
            <div className="font-semibold text-fh-bleu">{r.pH < 7 ? "Acide" : r.pH > 7 ? "Basique" : "Neutre"}</div>
          </div>
        </div>
      )}

      <p className="text-xs text-fh-ardoise/70">à 25 °C : Kₑ = 10<sup>−14</sup> ; pH = −log[H₃O⁺] ; [OH⁻] = Kₑ/[H₃O⁺]</p>
    </div>
  );
}
