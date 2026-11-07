"use client";

import { useState } from "react";
import { IconAtom, IconHexagon, IconMathFunction, IconRotate360, IconSum, IconVectorTriangle, IconWaveSine } from "@tabler/icons-react";

import type { LaboMoivreData, OngletMoivre } from "@/lib/laboMoivre";
import { Onglets, type OngletDef } from "./ui";
import Moivre from "./Moivre";
import Euler from "./Euler";
import Linearisation from "./Linearisation";
import AnglesMultiples from "./AnglesMultiples";
import Racines from "./Racines";
import Geometrie from "./Geometrie";

const TAILLE = 26;
const ONGLETS: Array<OngletDef & { id: OngletMoivre }> = [
  { id: "moivre", libelle: "Moivre", icone: <IconRotate360 size={TAILLE} aria-hidden="true" className="text-sky-600" /> },
  { id: "euler", libelle: "Euler", icone: <IconWaveSine size={TAILLE} aria-hidden="true" className="text-emerald-600" /> },
  { id: "linearisation", libelle: "Linéariser", icone: <IconSum size={TAILLE} aria-hidden="true" className="text-violet-600" /> },
  { id: "angles", libelle: "Angles multiples", icone: <IconMathFunction size={TAILLE} aria-hidden="true" className="text-orange-600" /> },
  { id: "racines", libelle: "Racines", icone: <IconHexagon size={TAILLE} aria-hidden="true" className="text-teal-600" /> },
  { id: "geometrie", libelle: "Géométrie", icone: <IconVectorTriangle size={TAILLE} aria-hidden="true" className="text-rose-600" /> },
];

function Panneau({ id }: { id: string }) {
  switch (id) {
    case "moivre":
      return <Moivre />;
    case "euler":
      return <Euler />;
    case "linearisation":
      return <Linearisation />;
    case "angles":
      return <AnglesMultiples />;
    case "racines":
      return <Racines />;
    default:
      return <Geometrie />;
  }
}

/**
 * Laboratoire « Formule de Moivre, formules d'Euler et racines n-ièmes » (Terminale C) : six simulations, calculs locaux
 * sans IA ni réseau. Menu latéral sur grand écran, onglets défilants sinon. Complète (ne remplace pas) le laboratoire des
 * nombres complexes.
 */
export default function LaboMoivreEuler({ data }: { data: LaboMoivreData }) {
  const [actif, setActif] = useState<string>(data.onglet);
  return (
    <div className="my-4 flex min-w-0 flex-col gap-4 rounded-2xl border border-fh-sable bg-gradient-to-b from-fh-accent/60 to-white p-3 sm:p-5">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fh-bleu text-white" aria-hidden="true">
          <IconAtom size={26} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-xl font-extrabold text-fh-bleu">Laboratoire Moivre, Euler et racines n-ièmes</h3>
          <p className="text-sm text-fh-ardoise">Observe, manipule, comprends et vérifie</p>
        </div>
      </header>
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 lg:w-52 lg:shrink-0">
          {/* w-0 min-w-full : la bande défilante ne dicte jamais la largeur de la page (elle défile dans sa boîte). */}
          <div className="w-0 min-w-full overflow-x-auto pb-1 lg:w-auto lg:overflow-visible lg:pb-0">
            <Onglets
              onglets={ONGLETS}
              actif={actif}
              onChoisir={setActif}
              prefixe="moivre"
              etiquette="Simulations du laboratoire Moivre-Euler"
              grille="w-max grid-flow-col auto-cols-[7.5rem] lg:w-auto lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-1"
            />
          </div>
        </div>
        <div role="tabpanel" id={`moivre-panneau-${actif}`} aria-labelledby={`moivre-onglet-${actif}`} className="min-w-0 flex-1">
          <Panneau id={actif} />
        </div>
      </div>
    </div>
  );
}
