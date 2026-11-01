"use client";

import { useState } from "react";

import SimulationComplexes from "./SimulationComplexes";
import SimulationFonction from "./SimulationFonction";
import SimulationIntegrale from "./SimulationIntegrale";
import SimulationLimites from "./SimulationLimites";
import SimulationSuite from "./SimulationSuite";
import SimulationTrigo from "./SimulationTrigo";
import LaboChimie from "@/components/LaboChimie";
import { ICONES_MATHS } from "./CadreMaths";
import OngletsMaths from "./OngletsMaths";
import LaboPhysique from "./LaboPhysique";
import LaboSVT from "./LaboSVT";

const ONGLETS = [
  { id: "fonctions", icone: ICONES_MATHS.fonctions, libelle: "Fonctions", Composant: SimulationFonction },
  { id: "suites", icone: ICONES_MATHS.suites, libelle: "Suites numériques", Composant: SimulationSuite },
  { id: "complexes", icone: ICONES_MATHS.complexes, libelle: "Nombres complexes", Composant: SimulationComplexes },
  { id: "trigo", icone: ICONES_MATHS.trigo, libelle: "Trigonométrie", Composant: SimulationTrigo },
  { id: "integrale", icone: ICONES_MATHS.integrale, libelle: "Intégrale", Composant: SimulationIntegrale },
  { id: "limites", icone: ICONES_MATHS.limites, libelle: "Limites", Composant: SimulationLimites },
] as const;

/** Pictogrammes de la barre de navigation. */
const ICONES_NAV: Record<(typeof ONGLETS)[number]["id"], string> = {
  fonctions: "f(x)",
  suites: "uₙ",
  complexes: "ℂ",
  trigo: "△",
  integrale: "∫",
  limites: "lim",
};

const AVANTAGES = [
  { titre: "Observe", texte: "Découvre les courbes, les figures et les propriétés mathématiques.", carte: "bg-gradient-to-br from-fh-bleu to-fh-bleu-charbon text-white", textes: "text-white/90", titreCouleur: "text-fh-orange-clair" },
  { titre: "Manipule", texte: "Modifie les paramètres et observe immédiatement leurs effets.", carte: "bg-gradient-to-br from-fh-orange to-fh-orange-fonce text-white", textes: "text-white/95", titreCouleur: "text-white" },
  { titre: "Comprends", texte: "Relie les résultats graphiques aux calculs et aux explications.", carte: "bg-gradient-to-br from-fh-bleu-vif to-fh-bleu text-white", textes: "text-white/90", titreCouleur: "text-fh-accent" },
] as const;

/**
 * Laboratoire public de la page d'accueil : quatre simulations de Terminale C, entièrement locales (React + SVG,
 * aucun appel réseau, aucune connexion). Un seul onglet est visible à la fois ; les autres restent montés mais
 * masqués, pour que le visiteur retrouve ses réglages en revenant sur un onglet.
 */
export default function LaboratoireMaths() {
  const [actif, setActif] = useState(0);

  return (
    <section id="laboratoire" aria-labelledby="titre-laboratoire" className="scroll-mt-16 bg-fh-creme px-3 py-10 sm:px-6 sm:py-16">
      {/* Partie maths : plus large que le reste de la page, pour laisser la place à la barre latérale. */}
      <div className="mx-auto max-w-[1320px]">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <h2 id="titre-laboratoire" className="text-3xl font-extrabold leading-tight tracking-tight text-fh-bleu-charbon sm:text-4xl">
            FAHIMTA enrichit chaque cours de simulations interactives
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Explore les fonctions, les suites, les nombres complexes, la trigonométrie, l&apos;intégrale et les limites. Fais varier les paramètres et découvre les mathématiques en mouvement.
          </p>
          <span aria-hidden="true" className="mx-auto mt-4 block h-1 w-16 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600" />
        </div>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <OngletsMaths
            titre="Simulations mathématiques"
            ariaLabel="Simulations mathématiques"
            onglets={ONGLETS.map((o) => ({ id: o.id, label: o.libelle, icone: ICONES_NAV[o.id] }))}
            actif={actif}
            onChoisir={setActif}
            idOnglet={(id) => `onglet-${id}`}
            idPanneau={(id) => `panneau-${id}`}
          />

          <div className="min-w-0">
            {ONGLETS.map((o, i) => (
              <div key={o.id} role="tabpanel" id={`panneau-${o.id}`} aria-labelledby={`onglet-${o.id}`} hidden={i !== actif}>
                <o.Composant />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {AVANTAGES.map((a) => (
            <li key={a.titre} className={`rounded-xl p-5 text-center shadow-sm ${a.carte}`}>
              <p className={`text-xl font-bold ${a.titreCouleur}`}>{a.titre}</p>
              <p className={`mt-1 text-sm ${a.textes}`}>{a.texte}</p>
            </li>
          ))}
        </ul>

        <div id="titrage" aria-labelledby="titre-titrage" className="mt-12">
          <div className="mx-auto mb-6 max-w-2xl text-center">
            <h3 id="titre-titrage" className="text-xl font-bold text-fh-bleu sm:text-2xl">
              La chimie en action
            </h3>
            <p className="mt-2 text-sm text-fh-ardoise sm:text-base">Dose un acide par une base, explore le pH, les dilutions, les gaz et bien plus : observe en direct.</p>
          </div>
          <LaboChimie vitrine />
        </div>

        <div id="physique" aria-labelledby="titre-physique" className="mt-12">
          <div className="mx-auto mb-6 max-w-2xl text-center">
            <h3 id="titre-physique" className="text-xl font-bold text-fh-bleu sm:text-2xl">
              La physique en action
            </h3>
            <p className="mt-2 text-sm text-fh-ardoise sm:text-base">Fais osciller un pendule, fais circuler le courant et forme une image avec une lentille.</p>
          </div>
          <LaboPhysique />
        </div>

        <div id="svt" aria-labelledby="titre-svt" className="mt-12">
          <div className="mx-auto mb-6 max-w-2xl text-center">
            <h3 id="titre-svt" className="text-xl font-bold text-fh-bleu sm:text-2xl">
              La SVT en action
            </h3>
            <p className="mt-2 text-sm text-fh-ardoise sm:text-base">Éclaire une feuille, fais respirer des poumons et croise des parents pour prévoir leurs descendants.</p>
          </div>
          <LaboSVT />
        </div>
      </div>
    </section>
  );
}
