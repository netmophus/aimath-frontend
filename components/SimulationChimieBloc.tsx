"use client";

import type { SimulationChimie } from "@/lib/remarkChimie";
import EchellePh from "./EchellePh";
import TemperatureEau from "./TemperatureEau";
import CalculPh from "./CalculPh";
import EchelleLogPh from "./EchelleLogPh";
import { AutoprotolyseEau, HydratationNaCl, IonisationHCl, PolariteEau } from "./AnimationsChimie";
import { Electroneutralite, PapierPh, PhMetreVirtuel, TubesConductivite } from "./ExperiencesChimie";
import LaboChimie from "./LaboChimie";

interface SimulationChimieBlocProps {
  /** Nom de la fence : echelleph | temperature | calculph | echellelog | polarite | hydratation | ionisation | autoprotolyse | tubes | electroneutralite | indicateur | phmetre | labochimie (voir lib/remarkChimie.ts). */
  type: string;
}

/** Pont entre le Markdown et les simulations de chimie (aucun paramètre dans le bloc). */
export default function SimulationChimieBloc({ type }: SimulationChimieBlocProps) {
  switch (type as SimulationChimie) {
    case "echelleph":
      return <EchellePh />;
    case "temperature":
      return <TemperatureEau />;
    case "calculph":
      return <CalculPh />;
    case "echellelog":
      return <EchelleLogPh />;
    case "polarite":
      return <PolariteEau />;
    case "hydratation":
      return <HydratationNaCl />;
    case "ionisation":
      return <IonisationHCl />;
    case "autoprotolyse":
      return <AutoprotolyseEau />;
    case "tubes":
      return <TubesConductivite />;
    case "electroneutralite":
      return <Electroneutralite />;
    case "indicateur":
      return <PapierPh />;
    case "phmetre":
      return <PhMetreVirtuel />;
    case "labochimie":
      return <LaboChimie />;
    default:
      return null;
  }
}
