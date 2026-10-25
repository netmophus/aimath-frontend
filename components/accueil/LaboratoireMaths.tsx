"use client";

import { useState } from "react";

import SimulationComplexes from "./SimulationComplexes";
import SimulationFonction from "./SimulationFonction";
import SimulationIntegrale from "./SimulationIntegrale";
import SimulationLimites from "./SimulationLimites";
import SimulationSuite from "./SimulationSuite";
import SimulationTrigo from "./SimulationTrigo";
import LaboChimie from "@/components/LaboChimie";
import OngletsCartes, { PanneauOnglets } from "@/components/ui/OngletsCartes";
import LaboPhysique from "./LaboPhysique";
import LaboSVT from "./LaboSVT";

const ONGLETS = [
  { id: "fonctions", icone: "ƒ", couleur: "#2b5a8c", couleurSoft: "#eef4fb", libelle: "Fonctions", Composant: SimulationFonction },
  { id: "suites", icone: "uₙ", couleur: "#2a9d4a", couleurSoft: "#eaf7ef", libelle: "Suites numériques", Composant: SimulationSuite },
  { id: "complexes", icone: "ℂ", couleur: "#6a4c93", couleurSoft: "#f1edf7", libelle: "Nombres complexes", Composant: SimulationComplexes },
  { id: "trigo", icone: "△", couleur: "#c0531f", couleurSoft: "#fcefe7", libelle: "Trigonométrie", Composant: SimulationTrigo },
  { id: "integrale", icone: "∫", couleur: "#0f8a8a", couleurSoft: "#e7f6f6", libelle: "Intégrale", Composant: SimulationIntegrale },
  { id: "limites", icone: "∞", couleur: "#b5366a", couleurSoft: "#fbeaf1", libelle: "Limites", Composant: SimulationLimites },
] as const;

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
    <section id="laboratoire" aria-labelledby="titre-laboratoire" className="scroll-mt-16 bg-white px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 id="titre-laboratoire" className="text-2xl font-bold text-fh-bleu sm:text-3xl">
            FAHIMTA enrichit chaque cours de simulations interactives
          </h2>
          <p className="mt-2 text-sm text-fh-ardoise sm:text-base">
            Explore les fonctions, les suites, les nombres complexes, la trigonométrie, l&apos;intégrale et les limites. Fais varier les paramètres et découvre les mathématiques en mouvement.
          </p>
        </div>

        <div className="rounded-2xl border border-fh-sable bg-fh-creme p-3 shadow-sm sm:p-6 lg:p-8">
          <OngletsCartes
            ariaLabel="Simulations mathématiques"
            onglets={ONGLETS.map((o) => ({ id: o.id, label: o.libelle, icone: o.icone, couleur: o.couleur, couleurSoft: o.couleurSoft }))}
            actif={actif}
            onChoisir={setActif}
            idOnglet={(id) => `onglet-${id}`}
            idPanneau={(id) => `panneau-${id}`}
          />

          <PanneauOnglets onglet={ONGLETS[actif]}>
            {ONGLETS.map((o, i) => (
              <div key={o.id} role="tabpanel" id={`panneau-${o.id}`} aria-labelledby={`onglet-${o.id}`} hidden={i !== actif}>
                <o.Composant />
              </div>
            ))}
          </PanneauOnglets>
        </div>

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
