"use client";

import LaboOnglets from "./LaboOnglets";
import SimulationGenetique from "./SimulationGenetique";
import SimulationGermination from "./SimulationGermination";
import SimulationRespiration from "./SimulationRespiration";

const ONGLETS = [
  { id: "germination", libelle: "Germination", icone: "graine", couleur: "#2a9d4a", couleurSoft: "#eaf7ef", Composant: SimulationGermination },
  { id: "respiration", libelle: "Respiration", icone: "air", couleur: "#2b5a8c", couleurSoft: "#eef4fb", Composant: SimulationRespiration },
  { id: "genetique", libelle: "Génétique", icone: "Aa", couleur: "#6a4c93", couleurSoft: "#f1edf7", Composant: SimulationGenetique },
];

/** Laboratoire de SVT de la page d'accueil : germination, respiration, génétique (React + SVG, aucun appel réseau). */
export default function LaboSVT() {
  return <LaboOnglets etiquette="Laboratoire de SVT" base="svt" onglets={ONGLETS} />;
}
