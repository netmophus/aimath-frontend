"use client";

import { useState, type ReactNode } from "react";

import { TitrageLabo } from "@/components/accueil/TitrageDemo";
import { OngletLabo } from "@/components/labo/commun";
import OngletsCartes, { PanneauOnglets } from "@/components/ui/OngletsCartes";
import { SimulationAvancement, SimulationConductivite, SimulationDilution, SimulationGaz, SimulationPh, SimulationPredominance } from "@/components/labo/Simulations";

/**
 * Laboratoire de chimie des cours (fence ```labochimie, voir lib/remarkChimie.ts) : sept onglets, chacun avec
 * l'encart « Le concept », ses formules (KaTeX) et une simulation interactive. Un seul onglet est monté à la fois :
 * les animations des onglets masqués ne tournent pas. Le titrage est le même moteur que la vitrine de la page d'accueil.
 */

interface Onglet {
  id: string;
  libelle: string;
  icone: string;
  couleur: string;
  couleurSoft: string;
  concept: ReactNode;
  formules: string[];
  Simulation: (vitrine: boolean) => ReactNode;
}

const ONGLETS: Onglet[] = [
  {
    id: "titrage",
    libelle: "Titrage",
    icone: "⇵",
    couleur: "#2b5a8c",
    couleurSoft: "#eef4fb",
    concept:
      "Doser une espèce, c'est la faire réagir complètement avec un réactif de concentration connue. À l'équivalence, les réactifs ont été introduits dans les proportions de l'équation : ici, une mole d'ions oxonium pour une mole d'ions hydroxyde. Le saut de pH et le virage de l'indicateur coloré repèrent le volume équivalent, qui donne la concentration de l'acide.",
    formules: ["\\mathrm{H_3O^+} + \\mathrm{HO^-} \\longrightarrow 2\\,\\mathrm{H_2O}", "C_a V_a = C_b V_{\\text{éq}}"],
    Simulation: (vitrine) => <TitrageLabo vitrine={vitrine} />,
  },
  {
    id: "ph",
    libelle: "Échelle de pH",
    icone: "pH",
    couleur: "#c0531f",
    couleurSoft: "#fcefe7",
    concept:
      "Le pH mesure l'acidité d'une solution : il traduit sa concentration en ions oxonium. Une unité de pH correspond à un facteur dix sur cette concentration. À 25 °C, l'eau pure est neutre (pH égal à 7), une solution acide a un pH inférieur à 7 et une solution basique un pH supérieur à 7.",
    formules: ["\\mathrm{pH} = -\\log[\\mathrm{H_3O^+}]", "[\\mathrm{OH^-}] = \\dfrac{K_e}{[\\mathrm{H_3O^+}]} \\qquad K_e = 10^{-14}\\ \\text{à } 25\\,^{\\circ}\\mathrm{C}"],
    Simulation: () => <SimulationPh />,
  },
  {
    id: "predominance",
    libelle: "Prédominance",
    icone: "⇌",
    couleur: "#6a4c93",
    couleurSoft: "#f1edf7",
    concept:
      "Dans un couple acide-base, la forme acide et la forme basique (la base conjuguée) coexistent en solution. Quand le pH est égal au pKa, les deux formes ont la même concentration. En dessous du pKa, l'acide prédomine ; au-dessus, c'est la base conjuguée.",
    formules: ["\\mathrm{pH} = \\mathrm{p}K_a + \\log\\dfrac{[\\mathrm{A^-}]}{[\\mathrm{AH}]}"],
    Simulation: () => <SimulationPredominance />,
  },
  {
    id: "avancement",
    libelle: "Avancement",
    icone: "x",
    couleur: "#2a9d4a",
    couleurSoft: "#eaf7ef",
    concept:
      "L'avancement x indique combien de fois la réaction s'est produite. Il grandit jusqu'à ce qu'un réactif soit entièrement consommé : c'est le réactif limitant, qui fixe l'avancement maximal et donc les quantités formées.",
    formules: ["2\\,\\mathrm{H_2} + \\mathrm{O_2} \\longrightarrow 2\\,\\mathrm{H_2O}", "x_{\\max} = \\min\\!\\left(\\dfrac{n(\\mathrm{H_2})}{2}, \\dfrac{n(\\mathrm{O_2})}{1}\\right)"],
    Simulation: () => <SimulationAvancement />,
  },
  {
    id: "dilution",
    libelle: "Dilution",
    icone: "H₂O",
    couleur: "#0f8a8a",
    couleurSoft: "#e7f6f6",
    concept:
      "Diluer, c'est ajouter du solvant à une solution. La quantité de soluté prélevée ne change pas ; elle est simplement répartie dans un volume plus grand, donc la concentration diminue. Le facteur de dilution compare les volumes final et prélevé.",
    formules: ["C_1 V_1 = C_2 V_2", "C_2 = \\dfrac{C_1 V_1}{V_2} \\qquad F = \\dfrac{V_2}{V_1} = \\dfrac{C_1}{C_2}"],
    Simulation: () => <SimulationDilution />,
  },
  {
    id: "gaz",
    libelle: "Gaz parfaits",
    icone: "PV",
    couleur: "#b5366a",
    couleurSoft: "#fbeaf1",
    concept:
      "Dans un gaz parfait, les molécules sont très éloignées les unes des autres et n'interagissent pas. La pression vient des chocs des molécules sur les parois : elle augmente avec la quantité de gaz et la température, et diminue quand le volume augmente.",
    formules: ["PV = nRT", "P = \\dfrac{nRT}{V} \\qquad R = 8{,}314\\ \\mathrm{J\\cdot mol^{-1}\\cdot K^{-1}}"],
    Simulation: () => <SimulationGaz />,
  },
  {
    id: "conductivite",
    libelle: "Conductivité",
    icone: "I",
    couleur: "#a66a1e",
    couleurSoft: "#f7efe2",
    concept:
      "Une solution conduit le courant grâce aux ions mobiles qu'elle contient. Une espèce moléculaire comme le sucre ne libère aucun ion : la solution ne conduit pas. Plus la concentration en ions est grande, plus la conductivité est élevée, et chaque ion y contribue selon sa conductivité ionique molaire.",
    formules: ["\\sigma = \\sum_i \\lambda_i\\,[\\mathrm{X}_i]"],
    Simulation: () => <SimulationConductivite />,
  },
];

/** `vitrine` : page d'accueil, l'onglet Titrage joue son auto-démo en boucle (dans les cours, versement à la demande). */
export default function LaboChimie({ vitrine = false }: { vitrine?: boolean }) {
  const [actif, setActif] = useState(0);
  const o = ONGLETS[actif];
  return (
    // Les paragraphes des leçons sont justifiés avec une marge basse (.rendu-markdown p) : ici, texte aligné à gauche, sans marge.
    <div className="my-6 rounded-2xl border border-fh-sable bg-fh-creme p-3 shadow-sm sm:p-5 lg:p-6 [&_p]:mb-0! [&_p]:text-left! [&_p]:hyphens-manual!">
      <OngletsCartes
        ariaLabel="Laboratoire de chimie"
        onglets={ONGLETS.map((t) => ({ id: t.id, label: t.libelle, icone: t.icone, couleur: t.couleur, couleurSoft: t.couleurSoft }))}
        actif={actif}
        onChoisir={setActif}
        idOnglet={(id) => `labo-onglet-${id}`}
        idPanneau={() => "labo-panneau"}
      />

      <PanneauOnglets onglet={o}>
        <div role="tabpanel" id="labo-panneau" aria-labelledby={`labo-onglet-${o.id}`} className="text-left">
          <OngletLabo key={o.id} concept={o.concept} formules={o.formules}>
            {o.Simulation(vitrine)}
          </OngletLabo>
        </div>
      </PanneauOnglets>
    </div>
  );
}
