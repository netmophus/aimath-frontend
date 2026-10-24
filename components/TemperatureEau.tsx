"use client";

import { useState } from "react";

import { eauPure, TEMPERATURES } from "@/lib/chimiePh";
import { Sci } from "./EchellePh";

/** Influence de la température sur Kₑ et sur le pH de neutralité de l'eau pure. */
export default function TemperatureEau() {
  const [indice, setIndice] = useState(1);
  const { celsius, pKe } = TEMPERATURES[indice];
  const eau = eauPure(pKe);

  return (
    <div className="my-3 flex flex-col gap-3 rounded-2xl border border-fh-sable bg-white p-4">
      <p className="text-sm font-semibold text-fh-bleu">Eau pure et température</p>

      <div role="radiogroup" aria-label="Température" className="flex gap-2">
        {TEMPERATURES.map((t, i) => (
          <button
            key={t.celsius}
            type="button"
            role="radio"
            aria-checked={i === indice}
            onClick={() => setIndice(i)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              i === indice ? "border-fh-orange bg-fh-orange text-white" : "border-fh-sable bg-white text-fh-bleu hover:bg-fh-accent"
            }`}
          >
            {t.celsius} °C
          </button>
        ))}
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-fh-creme px-3 py-2">
          <div className="text-xs text-fh-ardoise">Kₑ à {celsius} °C</div>
          <div className="font-semibold text-fh-bleu">≈ <Sci x={eau.ke} decimales={0} /></div>
        </div>
        <div className="rounded-lg bg-fh-creme px-3 py-2">
          <div className="text-xs text-fh-ardoise">[H₃O⁺] = [OH⁻] = √Kₑ</div>
          <div className="font-semibold text-fh-bleu">≈ <Sci x={eau.concentration} /> mol/L</div>
        </div>
        <div className="rounded-lg bg-fh-creme px-3 py-2">
          <div className="text-xs text-fh-ardoise">pH de neutralité = pKₑ/2</div>
          <div className="font-semibold text-fh-bleu">{String(eau.pHNeutre).replace(".", ",")}</div>
        </div>
      </div>

      <p className="rounded-lg bg-fh-accent px-3 py-2 text-sm text-fh-bleu">
        L&apos;eau reste neutre car [H₃O⁺]=[OH⁻], même si le pH de neutralité change avec la température.
      </p>
    </div>
  );
}
