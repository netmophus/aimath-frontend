"use client";

import LaboOnglets from "./LaboOnglets";
import SimulationLentille from "./SimulationLentille";
import SimulationOhm from "./SimulationOhm";
import SimulationPendule from "./SimulationPendule";

const ONGLETS = [
  { id: "pendule", libelle: "Pendule", icone: "L", couleur: "#2b5a8c", couleurSoft: "#eef4fb", degrade: { de: "#9333EA", vers: "#5B21B6", bordure: "#C4B5FD" }, Composant: SimulationPendule },
  { id: "ohm", libelle: "Loi d'Ohm", icone: "Ω", couleur: "#c0531f", couleurSoft: "#fcefe7", degrade: { de: "#FF9500", vers: "#EA580C", bordure: "#FDBA74" }, Composant: SimulationOhm },
  { id: "lentille", libelle: "Lentille", icone: "◉", couleur: "#0f8a8a", couleurSoft: "#e7f6f6", degrade: { de: "#06C8D7", vers: "#0284C7", bordure: "#67E8F9" }, Composant: SimulationLentille },
];

/** Laboratoire de physique de la page d'accueil : pendule, loi d'Ohm, lentille convergente (React + SVG, aucun appel réseau). */
export default function LaboPhysique() {
  return <LaboOnglets etiquette="Laboratoire de physique" base="physique" onglets={ONGLETS} />;
}
