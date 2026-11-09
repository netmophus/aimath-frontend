"use client";

import { useState } from "react";
import { IconArrowsExchange, IconBolt, IconFlask2, IconGauge, IconPlusMinus, IconSalt } from "@tabler/icons-react";

import type { OngletChimieEau } from "@/lib/laboChimieEau";
import type { Temperature } from "@/lib/chimieEau";
import { Onglets, type OngletDef } from "./ui";
import Dissolution from "./Dissolution";
import Ionisation from "./Ionisation";
import Electroneutralite from "./Electroneutralite";
import Autoprotolyse from "./Autoprotolyse";
import PHConcentrations from "./PHConcentrations";
import PHMetre from "./PHMetre";

const TAILLE = 30;
const ONGLETS: Array<OngletDef & { id: OngletChimieEau }> = [
  { id: "dissolution", libelle: "Dissolution", icone: <IconSalt size={TAILLE} aria-hidden="true" className="text-sky-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "ionisation", libelle: "Ionisation", icone: <IconBolt size={TAILLE} aria-hidden="true" className="text-amber-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "charges", libelle: "Charges", icone: <IconPlusMinus size={TAILLE} aria-hidden="true" className="text-violet-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "autoprotolyse", libelle: "Autoprotolyse", icone: <IconArrowsExchange size={TAILLE} aria-hidden="true" className="text-cyan-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "ph", libelle: "pH", icone: <IconFlask2 size={TAILLE} aria-hidden="true" className="text-emerald-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "ph-metre", libelle: "pH-mètre", icone: <IconGauge size={TAILLE} aria-hidden="true" className="text-rose-600 [button[aria-selected=true]_&]:text-white" /> },
];

export function SimulationChimieEau({ id, temperature = 25 }: { id: OngletChimieEau; temperature?: Temperature }) {
  switch (id) {
    case "dissolution":
      return <Dissolution />;
    case "ionisation":
      return <Ionisation />;
    case "charges":
      return <Electroneutralite />;
    case "autoprotolyse":
      return <Autoprotolyse initial={{ T: temperature }} />;
    case "ph":
      return <PHConcentrations initial={{ pH: 3, T: temperature }} />;
    default:
      return <PHMetre />;
  }
}

/** Laboratoire de chimie de l'eau : six onglets (dissolution, ionisation, charges, autoprotolyse, pH, pH-mètre). Un seul onglet est monté à la fois. */
export default function LaboChimieEau({ onglet = "dissolution", temperature = 25 }: { onglet?: OngletChimieEau; temperature?: Temperature }) {
  const [actif, setActif] = useState<OngletChimieEau>(onglet);
  return (
    <div className="my-4 flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[#c9d8f5] bg-[#EFF6FF] shadow-md">
      <header className="flex items-start gap-3 bg-gradient-to-br from-[#0b4a6f] via-[#0e6b8f] to-[#0891B2] px-4 py-5 text-white sm:px-6">
        <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30" aria-hidden="true">
          <IconFlask2 size={28} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="!text-2xl !text-white font-extrabold tracking-tight">Laboratoire de chimie de l&apos;eau</h3>
          <p className="text-sm text-cyan-50">Dissolution, ions, autoprotolyse et pH : observe, comprends, calcule.</p>
        </div>
      </header>
      <div className="flex min-w-0 flex-col gap-4 p-3 sm:p-5">
        <div className="w-0 min-w-full overflow-x-auto pb-1 md:w-auto md:overflow-visible md:pb-0">
          <Onglets
            onglets={ONGLETS}
            actif={actif}
            onChoisir={(id) => setActif(id as OngletChimieEau)}
            prefixe="chimie-eau"
            etiquette="Simulations du laboratoire de chimie de l'eau"
            grille="w-max grid-flow-col auto-cols-[8.5rem] md:w-full md:grid-flow-row md:auto-cols-auto md:grid-cols-6"
          />
        </div>
        <div role="tabpanel" id={`chimie-eau-panneau-${actif}`} aria-labelledby={`chimie-eau-onglet-${actif}`} className="min-w-0">
          <SimulationChimieEau key={actif} id={actif} temperature={temperature} />
        </div>
      </div>
    </div>
  );
}
