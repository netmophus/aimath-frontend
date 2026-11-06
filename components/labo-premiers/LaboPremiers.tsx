"use client";

import { useState } from "react";
import { IconClockHour4, IconDivide, IconGridDots, IconHierarchy2, IconSearch, IconSquare } from "@tabler/icons-react";

import type { LaboPremiersData, OngletPremiers } from "@/lib/laboPremiers";
import { Onglets, type OngletDef } from "./ui";
import SimCrible from "./SimCrible";
import SimFacteurs from "./SimFacteurs";
import SimPrimalite from "./SimPrimalite";
import SimCarre from "./SimCarre";
import SimModulo from "./SimModulo";
import SimDiviseurs from "./SimDiviseurs";

const TAILLE = 26;
const ONGLETS: Array<OngletDef & { id: OngletPremiers }> = [
  { id: "crible", libelle: "Crible", icone: <IconGridDots size={TAILLE} aria-hidden="true" className="text-sky-600" /> },
  { id: "facteurs", libelle: "Facteurs premiers", icone: <IconHierarchy2 size={TAILLE} aria-hidden="true" className="text-emerald-600" /> },
  { id: "primalite", libelle: "Premier ou composé ?", icone: <IconSearch size={TAILLE} aria-hidden="true" className="text-violet-600" /> },
  { id: "carre", libelle: "Carré parfait", icone: <IconSquare size={TAILLE} aria-hidden="true" className="text-orange-600" /> },
  { id: "modulo", libelle: "Modulo p", icone: <IconClockHour4 size={TAILLE} aria-hidden="true" className="text-teal-600" /> },
  { id: "diviseurs", libelle: "Diviseurs", icone: <IconDivide size={TAILLE} aria-hidden="true" className="text-rose-600" /> },
];

function Panneau({ id }: { id: string }) {
  switch (id) {
    case "crible":
      return <SimCrible />;
    case "facteurs":
      return <SimFacteurs />;
    case "primalite":
      return <SimPrimalite />;
    case "carre":
      return <SimCarre />;
    case "modulo":
      return <SimModulo />;
    default:
      return <SimDiviseurs />;
  }
}

/** Laboratoire des nombres premiers : six simulations (calculs exacts, locaux, sans IA ni réseau). Menu latéral sur grand écran, onglets défilants sinon. */
export default function LaboPremiers({ data }: { data: LaboPremiersData }) {
  const [actif, setActif] = useState<string>(data.onglet);
  return (
    <div className="my-4 flex min-w-0 flex-col gap-4 rounded-2xl border border-fh-sable bg-gradient-to-b from-fh-accent/60 to-white p-3 sm:p-5">
      <header className="flex flex-col gap-0.5">
        <h3 className="text-xl font-extrabold text-fh-bleu">Laboratoire des nombres premiers</h3>
        <p className="text-sm text-fh-ardoise">Explore les nombres et découvre leurs secrets.</p>
      </header>
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 lg:w-52 lg:shrink-0">
          {/* w-0 min-w-full : la bande défilante ne dicte jamais la largeur de la page (elle défile dans sa boîte). */}
          <div className="w-0 min-w-full overflow-x-auto pb-1 lg:w-auto lg:overflow-visible lg:pb-0">
            <Onglets
              onglets={ONGLETS}
              actif={actif}
              onChoisir={setActif}
              prefixe="premiers"
              etiquette="Simulations du laboratoire"
              grille="w-max grid-flow-col auto-cols-[7.5rem] lg:w-auto lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-1"
            />
          </div>
        </div>
        <div role="tabpanel" id={`premiers-panneau-${actif}`} aria-labelledby={`premiers-onglet-${actif}`} className="min-w-0 flex-1">
          <Panneau id={actif} />
        </div>
      </div>
    </div>
  );
}
