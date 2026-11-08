"use client";

import { useState } from "react";
import { IconBallBasketball, IconCar, IconElevator, IconRotate360, IconScale, IconTriangle } from "@tabler/icons-react";

import type { OngletDynamique } from "@/lib/laboDynamique";
import type { ParamsAtwood, ParamsMonteCharge, ParamsPendule, ParamsPlan, ParamsSphere, ParamsVirage } from "@/lib/dynamique";
import { Onglets, type OngletDef } from "./ui";
import PlanIncline from "./PlanIncline";
import MachineAtwood from "./MachineAtwood";
import PenduleConique from "./PenduleConique";
import MonteCharge from "./MonteCharge";
import VehiculeVirage from "./VehiculeVirage";
import SolideSphere from "./SolideSphere";

const TAILLE = 30;
const ONGLETS: Array<OngletDef & { id: OngletDynamique }> = [
  { id: "plan", libelle: "Plan incliné", icone: <IconTriangle size={TAILLE} aria-hidden="true" className="text-sky-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "atwood", libelle: "Atwood", icone: <IconScale size={TAILLE} aria-hidden="true" className="text-violet-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "pendule", libelle: "Pendule", icone: <IconRotate360 size={TAILLE} aria-hidden="true" className="text-cyan-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "monte-charge", libelle: "Monte-charge", icone: <IconElevator size={TAILLE} aria-hidden="true" className="text-emerald-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "virage", libelle: "Virage", icone: <IconCar size={TAILLE} aria-hidden="true" className="text-orange-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "sphere", libelle: "Sphère", icone: <IconBallBasketball size={TAILLE} aria-hidden="true" className="text-rose-600 [button[aria-selected=true]_&]:text-white" /> },
];

/** Paramètres initiaux facultatifs par simulation (fournis par les blocs Markdown dédiés). */
export interface InitialDynamique {
  plan?: ParamsPlan;
  atwood?: ParamsAtwood;
  pendule?: ParamsPendule;
  "monte-charge"?: ParamsMonteCharge;
  virage?: ParamsVirage;
  sphere?: ParamsSphere;
}

export function Simulation({ id, initial }: { id: OngletDynamique; initial?: InitialDynamique }) {
  switch (id) {
    case "plan":
      return <PlanIncline initial={initial?.plan} />;
    case "atwood":
      return <MachineAtwood initial={initial?.atwood} />;
    case "pendule":
      return <PenduleConique initial={initial?.pendule} />;
    case "monte-charge":
      return <MonteCharge initial={initial?.["monte-charge"]} />;
    case "virage":
      return <VehiculeVirage initial={initial?.virage} />;
    default:
      return <SolideSphere initial={initial?.sphere} />;
  }
}

const TITRES: Record<OngletDynamique, string> = {
  plan: "Plan incliné sans frottement",
  atwood: "Machine d'Atwood",
  pendule: "Pendule conique",
  "monte-charge": "Monte-charge",
  virage: "Véhicule dans un virage",
  sphere: "Solide glissant sur une sphère",
};

function Entete({ sous }: { sous: string }) {
  return (
    <header className="flex items-start gap-3 bg-gradient-to-br from-[#102A66] via-[#173a8c] to-[#2563EB] px-4 py-5 text-white sm:px-6">
      <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30" aria-hidden="true">
        <IconScale size={28} />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="!text-2xl !text-white font-extrabold tracking-tight">Laboratoire de dynamique</h3>
        <p className="text-sm text-sky-100">{sous}</p>
      </div>
    </header>
  );
}

const CADRE = "my-4 flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[#c9d8f5] bg-[#EFF6FF] shadow-md";

/** Laboratoire complet : six onglets (théorème du centre d'inertie, Terminale C). */
export default function LaboDynamique({ onglet = "plan", initial }: { onglet?: OngletDynamique; initial?: InitialDynamique }) {
  const [actif, setActif] = useState<OngletDynamique>(onglet);
  return (
    <div className={CADRE}>
      <Entete sous="Théorème du centre d'inertie : observe, comprends, calcule." />
      <div className="flex min-w-0 flex-col gap-4 p-3 sm:p-5">
        <div className="w-0 min-w-full overflow-x-auto pb-1 md:w-auto md:overflow-visible md:pb-0">
          <Onglets
            onglets={ONGLETS}
            actif={actif}
            onChoisir={(id) => setActif(id as OngletDynamique)}
            prefixe="dynamique"
            etiquette="Simulations du laboratoire de dynamique"
            grille="w-max grid-flow-col auto-cols-[8.5rem] md:w-full md:grid-flow-row md:auto-cols-auto md:grid-cols-6"
          />
        </div>
        <div role="tabpanel" id={`dynamique-panneau-${actif}`} aria-labelledby={`dynamique-onglet-${actif}`} className="min-w-0">
          <Simulation id={actif} initial={initial} />
        </div>
      </div>
    </div>
  );
}

/** Une seule simulation dans le cadre du laboratoire (blocs dédiés : plan-incline, machine-atwood, …). */
export function LaboDynamiqueSimple({ onglet, initial }: { onglet: OngletDynamique; initial?: InitialDynamique }) {
  return (
    <div className={CADRE}>
      <Entete sous={TITRES[onglet]} />
      <div className="flex min-w-0 flex-col gap-4 p-3 sm:p-5">
        <Simulation id={onglet} initial={initial} />
      </div>
    </div>
  );
}
