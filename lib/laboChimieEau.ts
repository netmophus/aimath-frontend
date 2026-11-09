/**
 * Bloc Markdown ```labo-chimie-eau du Laboratoire de chimie de l'eau. Directives (une par ligne « clé: valeur »), toutes facultatives :
 *   onglet: dissolution | ionisation | charges | autoprotolyse | ph | ph-metre   (défaut : dissolution)
 *   temperature: 0 | 25 | 60   (°C, utilisée par les onglets Autoprotolyse et pH ; défaut : 25)
 */
import { TEMPERATURES_PRISES_EN_CHARGE, estTemperatureSupportee, type Temperature } from "@/lib/chimieEau";

export class LaboChimieEauSyntaxeError extends Error {}

export const ONGLETS_CHIMIE_EAU = ["dissolution", "ionisation", "charges", "autoprotolyse", "ph", "ph-metre"] as const;
export type OngletChimieEau = (typeof ONGLETS_CHIMIE_EAU)[number];

export const LANGAGE_CHIMIE_EAU = "labo-chimie-eau";
export const estLangageChimieEau = (l: string | null | undefined): boolean => l === LANGAGE_CHIMIE_EAU;

export interface DonneesChimieEau {
  onglet: OngletChimieEau;
  temperature: Temperature;
}

export function parserLaboChimieEau(source: string): DonneesChimieEau {
  const res: DonneesChimieEau = { onglet: "dissolution", temperature: 25 };
  const vues = new Set<string>();
  for (const brute of source.split("\n")) {
    const ligne = brute.trim();
    if (!ligne || ligne.startsWith("#")) continue;
    const i = ligne.indexOf(":");
    if (i === -1) throw new LaboChimieEauSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    const cle = ligne.slice(0, i).trim().toLowerCase();
    const valeur = ligne.slice(i + 1).trim().toLowerCase();
    if (cle !== "onglet" && cle !== "temperature") throw new LaboChimieEauSyntaxeError(`Directive inconnue : « ${cle} » (attendu : onglet, temperature).`);
    if (vues.has(cle)) throw new LaboChimieEauSyntaxeError(`Directive répétée : « ${cle} ».`);
    vues.add(cle);
    if (cle === "onglet") {
      if (!(ONGLETS_CHIMIE_EAU as readonly string[]).includes(valeur)) throw new LaboChimieEauSyntaxeError(`Onglet inconnu : « ${valeur} » (attendu : ${ONGLETS_CHIMIE_EAU.join(", ")}).`);
      res.onglet = valeur as OngletChimieEau;
    } else {
      const sansUnite = valeur.replace(/\s*°?\s*c$/i, "");
      const n = Number(sansUnite.replace(",", "."));
      if (sansUnite === "" || !Number.isFinite(n) || !estTemperatureSupportee(n)) {
        throw new LaboChimieEauSyntaxeError(`"temperature:" doit valoir l'une des températures prises en charge : ${TEMPERATURES_PRISES_EN_CHARGE.join(", ")} (en °C, sans autre unité ; reçu « ${valeur} »).`);
      }
      res.temperature = n;
    }
  }
  return res;
}

export const SQUELETTE_LABO_CHIMIE_EAU = "\n\n```labo-chimie-eau\nonglet: dissolution\ntemperature: 25\n```\n\n";
