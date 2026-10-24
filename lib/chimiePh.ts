/**
 * Calculs purs des simulations de chimie (pH, Kₑ, échelle logarithmique).
 * Tout est à 25 °C sauf la simulation « temperature » : Kₑ = 10⁻¹⁴ mol²/L².
 */

export const KE_25C = 1e-14;

export interface NotationScientifique {
  mantisse: string; // « 1,0 » (virgule française)
  exposant: number; // -3
}

/** Notation scientifique à `decimales` décimales : 0,001 -> { "1,0", -3 }. Robuste aux arrondis (9,96e-4 -> 1,0×10⁻³). */
export function notationScientifique(x: number, decimales = 1): NotationScientifique {
  const [m, e] = x.toExponential(decimales).split("e");
  return { mantisse: m.replace(".", ","), exposant: Number(e) };
}

/** Concentration 10^(−t/10) pour un pH donné en dixièmes (t entier : évite les erreurs de flottants du curseur). */
export function concentrationH3O(pHDixiemes: number): number {
  return Math.pow(10, -pHDixiemes / 10);
}

/** Concentration [OH⁻] = 10^(pH−14), pH en dixièmes. */
export function concentrationOH(pHDixiemes: number): number {
  return Math.pow(10, (pHDixiemes - 140) / 10);
}

export type NatureSolution = "Acide" | "Neutre" | "Basique";

export function natureSolution(pHDixiemes: number): NatureSolution {
  if (pHDixiemes < 70) return "Acide";
  if (pHDixiemes > 70) return "Basique";
  return "Neutre";
}

export const TEMPERATURES = [
  { celsius: 0, pKe: 15 },
  { celsius: 25, pKe: 14 },
  { celsius: 60, pKe: 13 },
] as const;

/** Kₑ, [H₃O⁺]=[OH⁻]=√Kₑ et pH de neutralité pKₑ/2 pour l'eau pure. */
export function eauPure(pKe: number) {
  const ke = Math.pow(10, -pKe);
  return { ke, concentration: Math.sqrt(ke), pHNeutre: pKe / 2 };
}

export type ResultatCalcul =
  | { ok: true; pH: number; h3o: number; oh: number }
  | { ok: false; message: string };

/** Lit un nombre saisi par un élève : virgule ou point, « 1e-3 » accepté, « 1×10^-3 » et « 10^-3 » aussi. */
export function lireNombre(texte: string): number | null {
  let t = texte.trim().replace(/\s+/g, "").replace(",", ".");
  if (!t) return null;
  t = t.replace(/[×x*]10\^?\(?([+\-−]?\d+(?:\.\d+)?)\)?$/i, "e$1").replace(/^10\^\(?([+\-−]?\d+(?:\.\d+)?)\)?$/, "1e$1");
  t = t.replace("−", "-");
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function depuisPH(texte: string): ResultatCalcul {
  const pH = lireNombre(texte);
  if (pH === null) return { ok: false, message: "Entre un nombre, par exemple 3 ou 8,5." };
  if (pH < 0 || pH > 14) return { ok: false, message: "À 25 °C, le pH d'une solution aqueuse usuelle est compris entre 0 et 14." };
  return { ok: true, pH, h3o: Math.pow(10, -pH), oh: KE_25C / Math.pow(10, -pH) };
}

export function depuisH3O(texte: string): ResultatCalcul {
  const h3o = lireNombre(texte);
  if (h3o === null) return { ok: false, message: "Entre un nombre positif, par exemple 0,001 ou 1e-3." };
  if (h3o <= 0) return { ok: false, message: "[H₃O⁺] doit être strictement positive (le logarithme n'existe pas sinon)." };
  const pH = -Math.log10(h3o);
  return { ok: true, pH, h3o, oh: KE_25C / h3o };
}

/** Facteur 10^|Δ| entre deux pH entiers. */
export function facteurEntre(pHa: number, pHb: number): number {
  return Math.pow(10, Math.abs(pHa - pHb));
}
