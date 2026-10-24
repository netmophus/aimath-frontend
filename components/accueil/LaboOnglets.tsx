"use client";

import { useState, type ComponentType, type ReactNode } from "react";

import OngletsCartes, { PanneauOnglets } from "@/components/ui/OngletsCartes";

export interface OngletLaboMatiere {
  id: string;
  libelle: string;
  icone: ReactNode;
  couleur: string;
  couleurSoft: string;
  Composant: ComponentType;
}

/**
 * Onglets (cartes avec icônes) des labos de physique et de SVT de la page d'accueil. Un seul onglet est monté à la fois :
 * les animations des onglets masqués ne tournent pas.
 */
export default function LaboOnglets({ etiquette, base, onglets }: { etiquette: string; base: string; onglets: OngletLaboMatiere[] }) {
  const [actif, setActif] = useState(0);
  const o = onglets[actif];
  return (
    <div className="rounded-2xl border border-fh-sable bg-fh-creme p-3 shadow-sm sm:p-6 lg:p-8">
      <OngletsCartes
        ariaLabel={etiquette}
        onglets={onglets.map((t) => ({ id: t.id, label: t.libelle, icone: t.icone, couleur: t.couleur, couleurSoft: t.couleurSoft }))}
        actif={actif}
        onChoisir={setActif}
        idOnglet={(id) => `${base}-onglet-${id}`}
        idPanneau={() => `${base}-panneau`}
      />
      <PanneauOnglets onglet={o}>
        <div role="tabpanel" id={`${base}-panneau`} aria-labelledby={`${base}-onglet-${o.id}`}>
          <o.Composant key={o.id} />
        </div>
      </PanneauOnglets>
    </div>
  );
}
