import type { VariationsData } from "@/lib/variations";

import { nombreFr } from "./mathsLabo";

/** Nombre pour KaTeX : virgule décimale protégée de l'espace TeX (« 2{,}5 »). */
const nbTex = (v: number) => nombreFr(v, 1).replace(",", "{,}");

/**
 * Tableau de variations de f(x) = x + a/x pour a > 0, prêt pour components/TableauVariations.tsx.
 * Colonnes : −∞, −√a, 0 (valeur interdite, double barre), √a, +∞. Les valeurs √a et 2√a suivent a : elles sont
 * écrites avec le radical (« \sqrt{2} »), ou en entier quand a est un carré parfait (a = 1 → 1 et 2 ; a = 4 → 2 et 4).
 */
export function variationsFonction(a: number): VariationsData {
  const r = Math.sqrt(a);
  const entier = Math.abs(r - Math.round(r)) < 1e-9;
  const racine = entier ? String(Math.round(r)) : `\\sqrt{${nbTex(a)}}`;
  const deuxRacine = entier ? String(2 * Math.round(r)) : `2\\sqrt{${nbTex(a)}}`;

  return {
    fonction: "f",
    signes: ["+", "-", "-", "+"],
    colonnes: [
      { x: "-\\infty", interdit: false, marqueurSigne: null, valeurs: [{ texte: "-\\infty", position: "bas" }] },
      { x: `-${racine}`, interdit: false, marqueurSigne: "zero", valeurs: [{ texte: `-${deuxRacine}`, position: "haut" }] },
      {
        x: "0",
        interdit: true,
        marqueurSigne: "interdit",
        valeurs: [
          { texte: "-\\infty", position: "bas" },
          { texte: "+\\infty", position: "haut" },
        ],
      },
      { x: racine, interdit: false, marqueurSigne: "zero", valeurs: [{ texte: deuxRacine, position: "bas" }] },
      { x: "+\\infty", interdit: false, marqueurSigne: null, valeurs: [{ texte: "+\\infty", position: "haut" }] },
    ],
  };
}
