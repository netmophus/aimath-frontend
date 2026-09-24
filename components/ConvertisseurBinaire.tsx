"use client";

import { useId, useMemo, useState, type ChangeEvent } from "react";

import { decomposerEnPuissances, puissancesDeDeux, versBinaire, type BinaireData } from "@/lib/binaire";

/**
 * Convertisseur décimal ↔ binaire — cases de bits cliquables (chacune avec
 * sa puissance de 2 au-dessus) + champ décimal, une seule source de vérité
 * (`valeur`) pour les deux modes. HTML + React maison, SSR-safe (aucune API
 * navigateur), même raisonnement que components/TableauVariations.tsx.
 */

interface ConvertisseurBinaireProps {
  data: BinaireData;
}

export default function ConvertisseurBinaire({ data }: ConvertisseurBinaireProps) {
  const idChamp = useId();
  const idCurseur = useId();
  const puissances = useMemo(() => puissancesDeDeux(data.max), [data.max]);
  const maxRepresentable = useMemo(() => puissances.reduce((somme, p) => somme + p, 0), [puissances]);

  const [valeur, setValeur] = useState(data.valeurInitiale);

  const bitsActifs = useMemo(() => decomposerEnPuissances(valeur, puissances), [valeur, puissances]);
  const ecritureBinaire = versBinaire(valeur, puissances.length);

  function basculerBit(puissance: number) {
    setValeur((v) => ((v & puissance) !== 0 ? v - puissance : v + puissance));
  }

  function handleChangeValeur(event: ChangeEvent<HTMLInputElement>) {
    const brut = event.target.value;
    if (brut === "") {
      setValeur(0);
      return;
    }
    const n = Number(brut);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return;
    setValeur(Math.min(n, maxRepresentable));
  }

  // Curseur : même source de vérité `valeur` que les cases de bits et le
  // champ décimal ci-dessus — les trois sont donc toujours cohérents, sans
  // état séparé à synchroniser manuellement.
  function handleCurseur(event: ChangeEvent<HTMLInputElement>) {
    setValeur(Number(event.target.value));
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-fh-sable bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={idChamp} className="text-sm font-medium text-fh-bleu">
          Nombre décimal :
        </label>
        <input
          id={idChamp}
          type="number"
          min={0}
          max={maxRepresentable}
          value={valeur}
          onChange={handleChangeValeur}
          className="h-11 w-28 rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={idCurseur} className="text-xs text-fh-ardoise/70">
          Curseur (de 0 à {maxRepresentable})
        </label>
        <input
          id={idCurseur}
          type="range"
          min={0}
          max={maxRepresentable}
          step={1}
          value={valeur}
          onChange={handleCurseur}
          className="h-11 w-full accent-fh-orange"
        />
      </div>

      <div className="w-full max-w-full overflow-x-auto">
        <div className="flex w-fit gap-1.5">
          {puissances.map((puissance) => {
            const actif = (valeur & puissance) !== 0;
            return (
              <div key={puissance} className="flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-fh-ardoise/60">{puissance}</span>
                <button
                  type="button"
                  onClick={() => basculerBit(puissance)}
                  aria-pressed={actif}
                  aria-label={`Bit ${puissance} — ${actif ? "activé" : "désactivé"}`}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 text-base font-bold transition-colors ${
                    actif
                      ? "border-fh-orange bg-fh-orange text-white"
                      : "border-fh-sable bg-fh-creme text-fh-ardoise/50 hover:border-fh-bleu-vif/40"
                  }`}
                >
                  {actif ? 1 : 0}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm text-fh-ardoise">
        <p>
          <span className="font-semibold text-fh-bleu">Décomposition :</span>{" "}
          {valeur} = {bitsActifs.length > 0 ? bitsActifs.join(" + ") : "0"}
        </p>
        <p>
          <span className="font-semibold text-fh-bleu">Écriture binaire :</span>{" "}
          <span className="font-mono">
            {ecritureBinaire}
            <sub>2</sub>
          </span>
        </p>
      </div>
    </div>
  );
}
