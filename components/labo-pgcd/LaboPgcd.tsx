"use client";

import { useState } from "react";
import { IconCircles, IconClockHour4, IconDivide, IconEqual, IconKey, IconPuzzle } from "@tabler/icons-react";

import type { LaboPgcdData, OngletLabo } from "@/lib/laboPgcd";
import { Onglets, type OngletDef } from "./ui";
import SimEuclide from "./SimEuclide";
import SimFacteurs from "./SimFacteurs";
import SimBezout from "./SimBezout";
import SimGauss from "./SimGauss";
import SimEquations from "./SimEquations";
import SimModuloP from "./SimModuloP";

const TAILLE = 26;
const ONGLETS: Array<OngletDef & { id: OngletLabo }> = [
  { id: "euclide", libelle: "Euclide", icone: <IconDivide size={TAILLE} aria-hidden="true" /> },
  { id: "facteurs", libelle: "PGCD & PPCM", icone: <IconCircles size={TAILLE} aria-hidden="true" /> },
  { id: "bezout", libelle: "Bézout", icone: <IconKey size={TAILLE} aria-hidden="true" /> },
  { id: "gauss", libelle: "Gauss", icone: <IconPuzzle size={TAILLE} aria-hidden="true" /> },
  { id: "equations", libelle: "Équations", icone: <IconEqual size={TAILLE} aria-hidden="true" /> },
  { id: "modulo", libelle: "Modulo p", icone: <IconClockHour4 size={TAILLE} aria-hidden="true" /> },
];

function Panneau({ id }: { id: string }) {
  switch (id) {
    case "euclide":
      return <SimEuclide />;
    case "facteurs":
      return <SimFacteurs />;
    case "bezout":
      return <SimBezout />;
    case "gauss":
      return <SimGauss />;
    case "equations":
      return <SimEquations />;
    default:
      return <SimModuloP />;
  }
}

/** Laboratoire PGCD & PPCM : six simulations accessibles par onglets (calculs exacts, locaux, sans IA ni réseau). */
export default function LaboPgcd({ data }: { data: LaboPgcdData }) {
  const [actif, setActif] = useState<string>(data.onglet);
  return (
    <div className="my-4 flex min-w-0 flex-col gap-4 rounded-2xl border border-fh-sable bg-gradient-to-b from-fh-accent/60 to-white p-3 sm:p-5">
      <header className="flex flex-col gap-0.5">
        <h3 className="text-xl font-extrabold text-fh-bleu">Laboratoire PGCD &amp; PPCM</h3>
        <p className="text-sm text-fh-ardoise">Explore les nombres et comprends les calculs.</p>
      </header>
      <Onglets onglets={ONGLETS} actif={actif} onChoisir={setActif} prefixe="labo" etiquette="Simulations du laboratoire" grille="grid-cols-3 md:grid-cols-6" />
      <div role="tabpanel" id={`labo-panneau-${actif}`} aria-labelledby={`labo-onglet-${actif}`} className="min-w-0">
        <Panneau id={actif} />
      </div>
    </div>
  );
}
