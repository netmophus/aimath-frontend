"use client";

import LaboOnglets from "./LaboOnglets";
import SimulationLentille from "./SimulationLentille";
import SimulationOhm from "./SimulationOhm";
import SimulationPendule from "./SimulationPendule";

const ONGLETS = [
  { id: "pendule", libelle: "Pendule", icone: "L", couleur: "#2b5a8c", couleurSoft: "#eef4fb", Composant: SimulationPendule },
  { id: "ohm", libelle: "Loi d'Ohm", icone: "Ω", couleur: "#c0531f", couleurSoft: "#fcefe7", Composant: SimulationOhm },
  { id: "lentille", libelle: "Lentille", icone: "◉", couleur: "#0f8a8a", couleurSoft: "#e7f6f6", Composant: SimulationLentille },
];

/** Laboratoire de physique de la page d'accueil : pendule, loi d'Ohm, lentille convergente (React + SVG, aucun appel réseau). */
export default function LaboPhysique() {
  return <LaboOnglets etiquette="Laboratoire de physique" base="physique" onglets={ONGLETS} />;
}
