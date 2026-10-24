"use client";

import { useState } from "react";

import { facteurEntre } from "@/lib/chimiePh";

const PH_MAX = 14;

function Barre({ etiquette, pct, couleur, valeur }: { etiquette: string; pct: number; couleur: string; valeur: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-fh-ardoise">
      <span className="w-14 shrink-0 font-semibold">{etiquette}</span>
      <div className="h-5 flex-1 rounded bg-fh-creme">
        <div className={`h-5 rounded ${couleur}`} style={{ width: `${Math.max(pct, 0.4)}%`, minWidth: 2 }} />
      </div>
      <span className="w-20 shrink-0 text-right text-fh-bleu">{valeur}</span>
    </div>
  );
}

/** Deux pH entiers : [H₃O⁺] de chacun, facteur 10^Δ, barres en échelle réelle puis logarithmique. */
export default function EchelleLogPh() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(5);
  const delta = Math.abs(a - b);
  const facteur = facteurEntre(a, b);
  const [acide, base] = a <= b ? [a, b] : [b, a];
  const valeur = (ph: number) => `10⁻${String(ph).replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)])} mol/L`;
  const reel = (ph: number) => 100 / Math.pow(10, ph - acide); // la plus grande [H₃O⁺] = 100 %
  const log = (ph: number) => ((PH_MAX - ph) / PH_MAX) * 100; // longueur ∝ exposant + 14

  return (
    <div className="my-3 flex flex-col gap-3 rounded-2xl border border-fh-sable bg-white p-4">
      <p className="text-sm font-semibold text-fh-bleu">L&apos;échelle logarithmique du pH</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {([["Premier pH", a, setA], ["Second pH", b, setB]] as const).map(([titre, v, set]) => (
          <label key={titre} className="flex flex-col gap-1 text-sm text-fh-ardoise">
            <span>
              {titre} = <strong className="text-fh-bleu">{v}</strong>
            </span>
            <input type="range" min={0} max={PH_MAX} step={1} value={v} onChange={(e) => set(Number(e.target.value))} className="w-full accent-fh-orange" aria-label={titre} />
          </label>
        ))}
      </div>

      <div className="rounded-lg bg-fh-creme px-3 py-2 text-sm text-fh-bleu">
        pH {a} : [H₃O⁺] = <strong>{valeur(a)}</strong> &nbsp;·&nbsp; pH {b} : [H₃O⁺] = <strong>{valeur(b)}</strong>
        <div className="mt-1">
          {delta === 0
            ? "Même pH : même concentration (facteur 1)."
            : <>Facteur : 10<sup>{delta}</sup> = <strong>{facteur.toLocaleString("fr-FR")}</strong> — la solution de pH {acide} contient {facteur.toLocaleString("fr-FR")} fois plus d&apos;ions H₃O⁺ que celle de pH {base}.</>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-fh-ardoise">Échelle réelle (proportionnelle à [H₃O⁺])</p>
        <Barre etiquette={`pH ${a}`} pct={reel(a)} couleur="bg-fh-orange" valeur={valeur(a)} />
        <Barre etiquette={`pH ${b}`} pct={reel(b)} couleur="bg-fh-bleu-vif" valeur={valeur(b)} />
        <p className="mt-1 text-xs font-semibold text-fh-ardoise">Échelle logarithmique (×10 par unité de pH)</p>
        <Barre etiquette={`pH ${a}`} pct={log(a)} couleur="bg-fh-orange" valeur={`exposant ${-a}`} />
        <Barre etiquette={`pH ${b}`} pct={log(b)} couleur="bg-fh-bleu-vif" valeur={`exposant ${-b}`} />
      </div>

      <p className="rounded-lg bg-fh-accent px-3 py-2 text-sm text-fh-bleu">
        Chaque unité de pH correspond à un facteur 10 sur [H₃O⁺].
      </p>
    </div>
  );
}
