"use client";

import { useState } from "react";
import { IconCompass } from "@tabler/icons-react";

import { resoudreSimulation } from "@/lib/simulations/registre";
import type { SimulationExercice as Simulation } from "@/lib/simulations/types";

/**
 * Simulation GeoGebra d'une question de la correction. Réservée au développement local (licence commerciale
 * GeoGebra en cours) : `process.env.NODE_ENV` est remplacé à la compilation, donc en production ce composant ne
 * rend rien et le code GeoGebra n'est jamais appelé. Rien n'est chargé avant le clic sur le bouton.
 * Modèle inconnu, version inattendue ou paramètres invalides : rien n'est affiché (la correction reste normale).
 */
export default function SimulationExercice({ simulation }: { simulation: Simulation }) {
  const [ouverte, setOuverte] = useState(false);
  if (process.env.NODE_ENV !== "development") return null;
  const resolue = resoudreSimulation(simulation);
  if (!resolue) return null;
  const { Composant, parametres } = resolue;

  return (
    <section aria-label={`Simulation — ${simulation.titre}`} className="rounded-xl bg-fh-creme px-3 py-3 ring-1 ring-fh-sable">
      {!ouverte ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-fh-ardoise">{simulation.titre}</p>
          <button
            type="button"
            onClick={() => setOuverte(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-fh-bleu px-4 text-sm font-semibold text-white transition-colors hover:bg-fh-bleu-vif"
          >
            <IconCompass size={18} aria-hidden="true" /> Explorer avec GeoGebra
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Composant parametres={parametres} titre={simulation.titre} />
          <p className="rounded-lg bg-white px-3 py-2 text-xs text-fh-ardoise ring-1 ring-fh-sable">
            {simulation.avertissement}{" "}
            {simulation.verification.methodes.length === 0
              ? null
              : simulation.verification.concordance_correction === "confirmee"
              ? `${simulation.modele === "vecteur_deux_points" ? "Les coordonnées ont" : "Les valeurs ont"} été recalculées indépendamment et correspondent au résultat de la correction.`
              : simulation.verification.concordance_correction === "non_verifiee"
                ? `${simulation.modele === "vecteur_deux_points" ? "Les coordonnées ont" : "Les valeurs ont"} été recalculées indépendamment à partir de l'énoncé ; la concordance avec la réponse rédigée n'a pas été vérifiée.`
                : `${simulation.modele === "vecteur_deux_points" ? "Les coordonnées ont" : "Les valeurs ont"} été recalculées indépendamment à partir de l'énoncé.`}{" "}
            <span className="text-fh-ardoise/60">
              Made with GeoGebra® —{" "}
              <a href="https://www.geogebra.org" target="_blank" rel="noopener noreferrer" className="underline">
                geogebra.org
              </a>
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
