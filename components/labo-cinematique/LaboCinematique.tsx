"use client";

import { useState } from "react";
import { IconArrowsMove, IconChartLine, IconCircleDashed, IconVectorBezierArc, IconCamera, IconMapPin2 } from "@tabler/icons-react";

import type { LaboCinematiqueData, OngletCinematique } from "@/lib/laboCinematique";
import { Onglets, type OngletDef } from "./ui";
import Mru from "./Mru";
import Circulaire from "./Circulaire";
import Frenet from "./Frenet";
import Hodographe from "./Hodographe";
import Chronophoto from "./Chronophoto";
import Referentiels from "./Referentiels";

const TAILLE = 30;
const ONGLETS: Array<OngletDef & { id: OngletCinematique }> = [
  { id: "mru", libelle: "MRU / MRUV", icone: <IconArrowsMove size={TAILLE} aria-hidden="true" className="text-sky-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "circulaire", libelle: "Circulaire", icone: <IconCircleDashed size={TAILLE} aria-hidden="true" className="text-violet-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "frenet", libelle: "Frenet", icone: <IconVectorBezierArc size={TAILLE} aria-hidden="true" className="text-cyan-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "hodographe", libelle: "Hodographe", icone: <IconChartLine size={TAILLE} aria-hidden="true" className="text-emerald-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "chronophoto", libelle: "Chronophoto", icone: <IconCamera size={TAILLE} aria-hidden="true" className="text-orange-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "referentiels", libelle: "Référentiels", icone: <IconMapPin2 size={TAILLE} aria-hidden="true" className="text-rose-600 [button[aria-selected=true]_&]:text-white" /> },
];

function Panneau({ id }: { id: string }) {
  switch (id) {
    case "mru":
      return <Mru />;
    case "circulaire":
      return <Circulaire />;
    case "frenet":
      return <Frenet />;
    case "hodographe":
      return <Hodographe />;
    case "chronophoto":
      return <Chronophoto />;
    default:
      return <Referentiels />;
  }
}

/**
 * Laboratoire de cinématique (Terminale C) : six simulations, calculs locaux sans IA ni réseau. Même structure que le
 * Laboratoire Équations complexes (bandeau bleu profond, onglets à grandes icônes défilants sur téléphone). Il complète les
 * blocs ```mouvement, ```circulaire et ```courbe existants sans les remplacer.
 */
export default function LaboCinematique({ data }: { data: LaboCinematiqueData }) {
  const [actif, setActif] = useState<string>(data.onglet);
  return (
    <div className="my-4 flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[#c9d8f5] bg-[#EFF6FF] shadow-md">
      <header className="flex items-start gap-3 bg-gradient-to-br from-[#102A66] via-[#173a8c] to-[#2563EB] px-4 py-5 text-white sm:px-6">
        <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30" aria-hidden="true">
          <IconArrowsMove size={28} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="!text-2xl !text-white font-extrabold tracking-tight">Laboratoire de cinématique</h3>
          <p className="text-sm text-sky-100">Observe, mesure et comprends le mouvement.</p>
        </div>
      </header>
      <div className="flex min-w-0 flex-col gap-4 p-3 sm:p-5">
        <div className="w-0 min-w-full overflow-x-auto pb-1 md:w-auto md:overflow-visible md:pb-0">
          <Onglets
            onglets={ONGLETS}
            actif={actif}
            onChoisir={setActif}
            prefixe="cinematique"
            etiquette="Simulations du laboratoire de cinématique"
            grille="w-max grid-flow-col auto-cols-[8.5rem] md:w-full md:grid-flow-row md:auto-cols-auto md:grid-cols-6"
          />
        </div>
        <div role="tabpanel" id={`cinematique-panneau-${actif}`} aria-labelledby={`cinematique-onglet-${actif}`} className="min-w-0">
          <Panneau id={actif} />
        </div>
      </div>
    </div>
  );
}
