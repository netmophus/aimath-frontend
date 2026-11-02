"use client";

import { useRef, type KeyboardEvent } from "react";
import type { TablerIcon } from "@tabler/icons-react";

import { ongletApresTouche } from "@/lib/lecon/rubriques";
import { melange, NAVY } from "./teintesLecon";

export interface Onglet<T extends string> {
  id: T;
  label: string;
  /** Couleur d'identité de la rubrique — visible au repos (fond, bordure, pastille du numéro), renforcée quand l'onglet est actif. */
  couleur: string;
  icone: TablerIcon;
}

interface OngletsLeconProps<T extends string> {
  onglets: Onglet<T>[];
  actif: T;
  onChange: (id: T) => void;
  /** Préfixe des identifiants : onglet = `${prefixe}-onglet-${id}`, panneau = `${prefixe}-panneau-${id}`. */
  prefixe: string;
}

export function idOnglet(prefixe: string, id: string): string {
  return `${prefixe}-onglet-${id}`;
}

export function idPanneau(prefixe: string, id: string): string {
  return `${prefixe}-panneau-${id}`;
}

/**
 * Navigation entre les rubriques de la leçon (pattern WAI-ARIA « tabs »).
 *
 * - Sur grand écran (lg), liste verticale à gauche ; en dessous, grille compacte
 *   (2 colonnes sur mobile, une ligne dès sm) — aucun défilement horizontal.
 * - Un seul onglet est dans l'ordre de tabulation (« roving tabindex ») ; les flèches,
 *   Début et Fin déplacent le focus ET activent l'onglet (activation automatique,
 *   le contenu est déjà chargé : pas de coût à changer de rubrique).
 * - La page affiche le contenu de l'onglet actif dans un `role="tabpanel"` (voir idPanneau).
 *
 * Couleur jamais seule : chaque entrée garde son numéro, son icône et son titre.
 */
export default function OngletsLecon<T extends string>({ onglets, actif, onChange, prefixe }: OngletsLeconProps<T>) {
  const refs = useRef<Map<T, HTMLButtonElement>>(new Map());
  const impair = onglets.length % 2 === 1;

  function surTouche(evenement: KeyboardEvent<HTMLButtonElement>, courant: T) {
    const suivant = ongletApresTouche(
      onglets.map((o) => o.id),
      courant,
      evenement.key
    );
    if (suivant === null) return;
    evenement.preventDefault();
    onChange(suivant);
    refs.current.get(suivant)?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Rubriques de la leçon"
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:flex lg:flex-col lg:gap-3"
    >
      {onglets.map((onglet, index) => {
        const estActif = onglet.id === actif;
        const dernierOrphelin = impair && index === onglets.length - 1;
        const Icone = onglet.icone;

        return (
          <button
            key={onglet.id}
            ref={(noeud) => {
              if (noeud) refs.current.set(onglet.id, noeud);
              else refs.current.delete(onglet.id);
            }}
            type="button"
            role="tab"
            id={idOnglet(prefixe, onglet.id)}
            aria-selected={estActif}
            aria-controls={idPanneau(prefixe, onglet.id)}
            tabIndex={estActif ? 0 : -1}
            onClick={() => onChange(onglet.id)}
            onKeyDown={(e) => surTouche(e, onglet.id)}
            style={{
              backgroundColor: melange(onglet.couleur, estActif ? 16 : 8),
              borderColor: estActif ? onglet.couleur : melange(onglet.couleur, 40),
              color: NAVY,
            }}
            className={`relative flex min-h-14 items-center gap-2.5 overflow-hidden rounded-2xl border-2 py-2 pr-2 pl-2 text-left transition-[box-shadow,background-color,border-color] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] lg:min-h-[68px] lg:flex-none lg:gap-2.5 lg:px-3 lg:py-3 ${
              dernierOrphelin ? "col-span-2 sm:col-span-1" : ""
            } ${estActif ? "z-10 shadow-lg ring-1 ring-black/5" : "shadow-none hover:brightness-95"}`}
          >
            {/* Indicateur de sélection : barre de couleur (gauche sur grand écran, bas sinon) */}
            {estActif && (
              <span
                aria-hidden="true"
                className="absolute right-0 bottom-0 left-0 h-1.5 lg:top-0 lg:right-auto lg:h-auto lg:w-1.5"
                style={{ backgroundColor: onglet.couleur }}
              />
            )}

            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base font-extrabold text-white sm:h-9 sm:w-9 sm:text-lg lg:h-10 lg:w-10 lg:rounded-xl lg:text-xl"
              style={{ backgroundColor: onglet.couleur }}
            >
              {index + 1}
            </span>

            <span className="flex min-w-0 flex-1 flex-col">
              <span className={`text-[13px] leading-tight sm:text-sm lg:text-[15px] ${estActif ? "font-extrabold" : "font-bold"}`}>
                {onglet.label}
              </span>
            </span>

            <Icone
              size={24}
              stroke={1.75}
              aria-hidden="true"
              className="hidden shrink-0 sm:block"
              style={{ color: onglet.couleur }}
            />
          </button>
        );
      })}
    </div>
  );
}
