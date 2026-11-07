"use client";

import { useState } from "react";
import { IconAxisX, IconCalculator, IconMathFunction, IconRotateClockwise2, IconHexagon, IconVectorTriangle } from "@tabler/icons-react";

import type { LaboComplexesData, OngletComplexes } from "@/lib/laboComplexes";
import { Onglets, type OngletDef } from "./ui";
import SimPlan from "./SimPlan";
import SimCalculs from "./SimCalculs";
import SimFormes from "./SimFormes";
import SimRotations from "./SimRotations";
import SimRacines from "./SimRacines";
import SimGeometrie from "./SimGeometrie";

const TAILLE = 26;
const ONGLETS: Array<OngletDef & { id: OngletComplexes }> = [
  { id: "plan", libelle: "Plan complexe", icone: <IconAxisX size={TAILLE} aria-hidden="true" className="text-sky-600" /> },
  { id: "calculs", libelle: "Calculs", icone: <IconCalculator size={TAILLE} aria-hidden="true" className="text-emerald-600" /> },
  { id: "formes", libelle: "Trois formes", icone: <IconMathFunction size={TAILLE} aria-hidden="true" className="text-violet-600" /> },
  { id: "rotations", libelle: "Rotations", icone: <IconRotateClockwise2 size={TAILLE} aria-hidden="true" className="text-orange-600" /> },
  { id: "racines", libelle: "Racines", icone: <IconHexagon size={TAILLE} aria-hidden="true" className="text-teal-600" /> },
  { id: "geometrie", libelle: "Géométrie", icone: <IconVectorTriangle size={TAILLE} aria-hidden="true" className="text-rose-600" /> },
];

function Panneau({ id }: { id: string }) {
  switch (id) {
    case "plan":
      return <SimPlan />;
    case "calculs":
      return <SimCalculs />;
    case "formes":
      return <SimFormes />;
    case "rotations":
      return <SimRotations />;
    case "racines":
      return <SimRacines />;
    default:
      return <SimGeometrie />;
  }
}

/** Laboratoire des nombres complexes : six simulations (calculs locaux, sans IA ni réseau). Menu latéral sur grand écran, onglets défilants sinon. */
export default function LaboComplexes({ data }: { data: LaboComplexesData }) {
  const [actif, setActif] = useState<string>(data.onglet);
  return (
    <div className="my-4 flex min-w-0 flex-col gap-4 rounded-2xl border border-fh-sable bg-gradient-to-b from-fh-accent/60 to-white p-3 sm:p-5">
      <header className="flex flex-col gap-0.5">
        <h3 className="text-xl font-extrabold text-fh-bleu">Laboratoire des nombres complexes</h3>
        <p className="text-sm text-fh-ardoise">Observe, manipule et comprends</p>
      </header>
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 lg:w-52 lg:shrink-0">
          {/* w-0 min-w-full : la bande défilante ne dicte jamais la largeur de la page (elle défile dans sa boîte). */}
          <div className="w-0 min-w-full overflow-x-auto pb-1 lg:w-auto lg:overflow-visible lg:pb-0">
            <Onglets
              onglets={ONGLETS}
              actif={actif}
              onChoisir={setActif}
              prefixe="complexes"
              etiquette="Simulations du laboratoire"
              grille="w-max grid-flow-col auto-cols-[7.5rem] lg:w-auto lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-1"
            />
          </div>
        </div>
        <div role="tabpanel" id={`complexes-panneau-${actif}`} aria-labelledby={`complexes-onglet-${actif}`} className="min-w-0 flex-1">
          <Panneau id={actif} />
        </div>
      </div>
    </div>
  );
}
