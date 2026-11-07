/** Aides d'affichage partagées par les simulations du Laboratoire des nombres complexes (fonctions pures). */

import type { Cx } from "./complexes";
import { texNombre, texRacineEntiere, texReel } from "./complexesTex";

/** Réel en TeX, entre parenthèses s'il est négatif : « (-3) ». */
export function parTex(x: number): string {
  const t = texReel(x);
  return t.startsWith("-") ? `(${t})` : t;
}

/** Calcul du module en TeX : exact pour des entiers (\sqrt{(-3)^2+4^2} = \sqrt{25} = 5), approché sinon. */
export function texCalculModule(z: Cx): string {
  const dev = `\\sqrt{${parTex(z.re)}^2 + ${parTex(z.im)}^2}`;
  if (Number.isInteger(z.re) && Number.isInteger(z.im)) {
    const n = z.re * z.re + z.im * z.im;
    const exact = texRacineEntiere(n);
    return exact === `\\sqrt{${n}}` ? `${dev} = \\sqrt{${n}}` : `${dev} = \\sqrt{${n}} = ${exact}`;
  }
  const r = Math.hypot(z.re, z.im);
  return `${dev} \\approx ${texNombre(r)}`;
}

/** Position d'un point : quadrant I à IV, ou axe, ou origine. */
export function quadrant(z: Cx): string {
  if (z.re === 0 && z.im === 0) return "origine O";
  if (z.im === 0) return "sur l'axe des réels";
  if (z.re === 0) return "sur l'axe des imaginaires";
  if (z.re > 0) return z.im > 0 ? "quadrant I" : "quadrant IV";
  return z.im > 0 ? "quadrant II" : "quadrant III";
}

/** Texte brut d'un nombre avec virgule française (pour les libellés SVG). */
export function brut(x: number, decimales = 2): string {
  const v = Number(x.toFixed(decimales));
  return String(Object.is(v, -0) ? 0 : v).replace(".", ",");
}
