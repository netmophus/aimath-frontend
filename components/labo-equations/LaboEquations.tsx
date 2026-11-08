"use client";

import { useState } from "react";
import { IconChartDots, IconCircleCheck, IconCube, IconMathSymbols, IconSquareRoot2, IconVariable } from "@tabler/icons-react";

import type { LaboEquationsData, OngletEquations } from "@/lib/laboEquations";
import { Onglets, type OngletDef } from "./ui";
import Discriminant from "./Discriminant";
import RacinesCarrees from "./RacinesCarrees";
import Resolution from "./Resolution";
import TroisiemeDegre from "./TroisiemeDegre";
import Verification from "./Verification";

const TAILLE = 30;
const ONGLETS: Array<OngletDef & { id: OngletEquations }> = [
  { id: "discriminant", libelle: "Discriminant", icone: <IconChartDots size={TAILLE} aria-hidden="true" className="text-sky-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "racines", libelle: "Racines carrées", icone: <IconSquareRoot2 size={TAILLE} aria-hidden="true" className="text-violet-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "resolution", libelle: "Résolution", icone: <IconVariable size={TAILLE} aria-hidden="true" className="text-cyan-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "troisieme-degre", libelle: "Troisième degré", icone: <IconCube size={TAILLE} aria-hidden="true" className="text-orange-600 [button[aria-selected=true]_&]:text-white" /> },
  { id: "verification", libelle: "Vérification", icone: <IconCircleCheck size={TAILLE} aria-hidden="true" className="text-emerald-600 [button[aria-selected=true]_&]:text-white" /> },
];

function Panneau({ id }: { id: string }) {
  switch (id) {
    case "discriminant":
      return <Discriminant />;
    case "racines":
      return <RacinesCarrees />;
    case "resolution":
      return <Resolution />;
    case "troisieme-degre":
      return <TroisiemeDegre />;
    default:
      return <Verification />;
  }
}

/**
 * Laboratoire « Équations complexes » (Terminale C) : cinq simulations, calculs locaux sans IA ni réseau.
 * Bandeau bleu profond, onglets à grandes icônes (défilants sur téléphone), deux colonnes sur ordinateur dans chaque onglet.
 * Complète (ne remplace pas) les laboratoires « Nombres complexes » et « Moivre, Euler et racines n-ièmes ».
 */
export default function LaboEquations({ data }: { data: LaboEquationsData }) {
  const [actif, setActif] = useState<string>(data.onglet);
  return (
    <div className="my-4 flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[#c9d8f5] bg-[#EFF6FF] shadow-md">
      <header className="flex items-start gap-3 bg-gradient-to-br from-[#102A66] via-[#173a8c] to-[#2563EB] px-4 py-5 text-white sm:px-6">
        <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30" aria-hidden="true">
          <IconMathSymbols size={28} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="!text-2xl !text-white font-extrabold tracking-tight">Équations complexes</h3>
          <p className="text-sm text-sky-100">Explore, calcule et comprends les racines dans ℂ.</p>
        </div>
      </header>
      <div className="flex min-w-0 flex-col gap-4 p-3 sm:p-5">
        {/* w-0 min-w-full : la bande défilante ne dicte jamais la largeur de la page (elle défile dans sa boîte). */}
        <div className="w-0 min-w-full overflow-x-auto pb-1 md:w-auto md:overflow-visible md:pb-0">
          <Onglets
            onglets={ONGLETS}
            actif={actif}
            onChoisir={setActif}
            prefixe="equations"
            etiquette="Simulations du laboratoire Équations complexes"
            grille="w-max grid-flow-col auto-cols-[8.5rem] md:w-full md:grid-flow-row md:auto-cols-auto md:grid-cols-5"
          />
        </div>
        <div role="tabpanel" id={`equations-panneau-${actif}`} aria-labelledby={`equations-onglet-${actif}`} className="min-w-0">
          <Panneau id={actif} />
        </div>
      </div>
    </div>
  );
}
