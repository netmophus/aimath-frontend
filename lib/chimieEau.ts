/**
 * Moteur du Laboratoire de chimie « L'eau, solvant : dissolution, ions, autoprotolyse, pH ».
 * Fonctions pures, sans dépendance à React, testées indépendamment.
 *
 * Conventions : concentrations en mol/L, volumes en L, quantités de matière en mol, masses en g, températures en °C
 * (les trois températures prises en charge sont 0, 25 et 60 °C), pH et pOH sans unité. Le pH est calculé avec le modèle scolaire
 * des solutions aqueuses suffisamment diluées : pH = −log([H₃O⁺]/c°), c° = 1 mol/L (l'activité est assimilée à la concentration).
 */

export class ChimieEauErreur extends Error {}

// --- Espèces chimiques, équations, bilans ------------------------------------------------------------------------------

export interface Espece {
  formule: string;
  /** Écriture TeX (formule seule, sans état physique). */
  tex: string;
  atomes: Record<string, number>;
  /** Charge portée, en nombre de charges élémentaires e. */
  charge: number;
}

export const ESPECES = {
  H2O: { formule: "H2O", tex: String.raw`\mathrm{H_2O}`, atomes: { H: 2, O: 1 }, charge: 0 },
  H3O: { formule: "H3O+", tex: String.raw`\mathrm{H_3O^+}`, atomes: { H: 3, O: 1 }, charge: 1 },
  OH: { formule: "OH-", tex: String.raw`\mathrm{OH^-}`, atomes: { H: 1, O: 1 }, charge: -1 },
  Na: { formule: "Na+", tex: String.raw`\mathrm{Na^+}`, atomes: { Na: 1 }, charge: 1 },
  Cl: { formule: "Cl-", tex: String.raw`\mathrm{Cl^-}`, atomes: { Cl: 1 }, charge: -1 },
  Ca: { formule: "Ca2+", tex: String.raw`\mathrm{Ca^{2+}}`, atomes: { Ca: 1 }, charge: 2 },
  SO4: { formule: "SO4 2-", tex: String.raw`\mathrm{SO_4^{2-}}`, atomes: { S: 1, O: 4 }, charge: -2 },
  HCl: { formule: "HCl", tex: String.raw`\mathrm{HCl}`, atomes: { H: 1, Cl: 1 }, charge: 0 },
  NaCl: { formule: "NaCl", tex: String.raw`\mathrm{NaCl}`, atomes: { Na: 1, Cl: 1 }, charge: 0 },
  CaCl2: { formule: "CaCl2", tex: String.raw`\mathrm{CaCl_2}`, atomes: { Ca: 1, Cl: 2 }, charge: 0 },
  saccharose: { formule: "C12H22O11", tex: String.raw`\mathrm{C_{12}H_{22}O_{11}}`, atomes: { C: 12, H: 22, O: 11 }, charge: 0 },
} as const satisfies Record<string, Espece>;
export type CleEspece = keyof typeof ESPECES;

export interface Terme {
  espece: CleEspece;
  coef: number;
}
export interface Equation {
  reactifs: Terme[];
  produits: Terme[];
  /** Double flèche (équilibre) ou flèche simple (réaction totale / dissolution). */
  equilibre?: boolean;
}

function totaux(termes: Terme[]) {
  const atomes: Record<string, number> = {};
  let charge = 0;
  for (const { espece, coef } of termes) {
    const e: Espece = ESPECES[espece];
    for (const [a, n] of Object.entries(e.atomes)) atomes[a] = (atomes[a] ?? 0) + n * coef;
    charge += e.charge * coef;
  }
  return { atomes, charge };
}

/** Bilan d'une équation : conservation de chaque élément et de la charge électrique. */
export function bilanEquation(eq: Equation): { atomesOk: boolean; chargesOk: boolean; ok: boolean; atomesAvant: Record<string, number>; atomesApres: Record<string, number> } {
  const av = totaux(eq.reactifs);
  const ap = totaux(eq.produits);
  const cles = new Set([...Object.keys(av.atomes), ...Object.keys(ap.atomes)]);
  const atomesOk = [...cles].every((a) => (av.atomes[a] ?? 0) === (ap.atomes[a] ?? 0));
  const chargesOk = av.charge === ap.charge;
  return { atomesOk, chargesOk, ok: atomesOk && chargesOk, atomesAvant: av.atomes, atomesApres: ap.atomes };
}

const t = (espece: CleEspece, coef = 1): Terme => ({ espece, coef });

export const EQUATIONS = {
  dissolutionNaCl: { reactifs: [t("NaCl")], produits: [t("Na"), t("Cl")] },
  dissolutionCaCl2: { reactifs: [t("CaCl2")], produits: [t("Ca"), t("Cl", 2)] },
  /** Dissolution moléculaire : même espèce avant et après (aucun ion formé). */
  dissolutionSaccharose: { reactifs: [t("saccharose")], produits: [t("saccharose")] },
  ionisationHCl: { reactifs: [t("HCl"), t("H2O")], produits: [t("H3O"), t("Cl")] },
  autoprotolyse: { reactifs: [t("H2O", 2)], produits: [t("H3O"), t("OH")], equilibre: true },
} as const satisfies Record<string, Equation>;

/** Équations en TeX avec états physiques (affichage). */
export const TEX_EQUATIONS = {
  dissolutionNaCl: String.raw`\mathrm{NaCl(s)} \longrightarrow \mathrm{Na^+(aq)} + \mathrm{Cl^-(aq)}`,
  dissolutionCaCl2: String.raw`\mathrm{CaCl_2(s)} \longrightarrow \mathrm{Ca^{2+}(aq)} + 2\,\mathrm{Cl^-(aq)}`,
  dissolutionSaccharose: String.raw`\mathrm{C_{12}H_{22}O_{11}(s)} \longrightarrow \mathrm{C_{12}H_{22}O_{11}(aq)}`,
  ionisationHCl: String.raw`\mathrm{HCl} + \mathrm{H_2O} \longrightarrow \mathrm{H_3O^+} + \mathrm{Cl^-}`,
  ionisationHClEtats: String.raw`\mathrm{HCl(g)} + \mathrm{H_2O(l)} \longrightarrow \mathrm{H_3O^+(aq)} + \mathrm{Cl^-(aq)}`,
  autoprotolyse: String.raw`2\,\mathrm{H_2O} \rightleftharpoons \mathrm{H_3O^+} + \mathrm{OH^-}`,
} as const;

// --- Quantités de matière, concentrations, unités ------------------------------------------------------------------

export const MASSE_MOLAIRE = { NaCl: 58.44, saccharose: 342.3 } as const; // g/mol

const positif = (nom: string, x: number) => {
  if (!Number.isFinite(x) || x <= 0) throw new ChimieEauErreur(`${nom} doit être un nombre strictement positif (reçu ${x}).`);
  return x;
};

export function volumeEnLitres(valeur: number, unite: "L" | "mL"): number {
  positif("Le volume", valeur);
  return unite === "mL" ? valeur / 1000 : valeur;
}
export function quantiteDepuisMasse(masse: number, masseMolaire: number): number {
  return positif("La masse", masse) / positif("La masse molaire", masseMolaire);
}
export function concentrationMolaire(n: number, V: number): number {
  return positif("La quantité de matière", n) / positif("Le volume", V);
}
export const kelvin = (celsius: number) => celsius + 273.15;

// --- Produit ionique, pH, pOH --------------------------------------------------------------------------------------

export const TEMPERATURES_PRISES_EN_CHARGE = [0, 25, 60] as const;
export type Temperature = (typeof TEMPERATURES_PRISES_EN_CHARGE)[number];
/** pKe de référence (valeurs arrondies, donc « approximatives »). Aucune interpolation entre ces points. */
export const PKE: Record<Temperature, number> = { 0: 14.95, 25: 14.0, 60: 13.02 };

export const estTemperatureSupportee = (T: number): T is Temperature => (TEMPERATURES_PRISES_EN_CHARGE as readonly number[]).includes(T);
function verifierTemperature(T: number): Temperature {
  if (!estTemperatureSupportee(T)) throw new ChimieEauErreur(`Température non prise en charge : ${T} °C (valeurs disponibles : ${TEMPERATURES_PRISES_EN_CHARGE.join(", ")} °C).`);
  return T;
}

export const pKe = (T: number): number => PKE[verifierTemperature(T)];
export const Ke = (T: number): number => 10 ** -pKe(T);
export const pHNeutre = (T: number): number => pKe(T) / 2;
/** Concentration de chaque ion dans l'eau pure : √Ke. */
export const concentrationEauPure = (T: number): number => Math.sqrt(Ke(T));

export function pH(concH3O: number): number {
  return -Math.log10(positif("[H₃O⁺]", concH3O));
}
export function concentrationH3O(valeurPH: number): number {
  if (!Number.isFinite(valeurPH)) throw new ChimieEauErreur("Le pH doit être un nombre fini.");
  return 10 ** -valeurPH;
}
export const pOH = (valeurPH: number, T = 25): number => pKe(T) - valeurPH;
export const concentrationOH = (valeurPH: number, T = 25): number => 10 ** -pOH(valeurPH, T);
export function concentrationOHDepuisH3O(h: number, T = 25): number {
  return Ke(T) / positif("[H₃O⁺]", h);
}
export function concentrationH3ODepuisOH(oh: number, T = 25): number {
  return Ke(T) / positif("[OH⁻]", oh);
}

export type Nature = "acide" | "neutre" | "basique";
/** Nature d'une solution à la température T : comparaison avec le pH de neutralité pKe/2 (pas toujours 7). */
export function natureSolution(valeurPH: number, T = 25): Nature {
  const ecart = valeurPH - pHNeutre(T);
  if (Math.abs(ecart) < 1e-9) return "neutre";
  return ecart < 0 ? "acide" : "basique";
}

/** Plage de validité du modèle dilué : chaque concentration ionique ≤ 1 mol/L. */
export const CONCENTRATION_MAX_MODELE = 1;
export const PH_MIN_AFFICHE = 0;
export const PH_MAX_AFFICHE = 14;

export interface EtatPH {
  pH: number;
  pOH: number;
  h3o: number;
  oh: number;
  produit: number;
  T: Temperature;
  nature: Nature;
  /** Faux si une des concentrations dépasse 1 mol/L : le modèle des solutions diluées n'est plus fiable. */
  diluee: boolean;
}

export function etatDepuisPH(valeurPH: number, T: number = 25): EtatPH {
  const Tv = verifierTemperature(T);
  const h3o = concentrationH3O(valeurPH);
  const oh = concentrationOH(valeurPH, Tv);
  return { pH: valeurPH, pOH: pOH(valeurPH, Tv), h3o, oh, produit: h3o * oh, T: Tv, nature: natureSolution(valeurPH, Tv), diluee: h3o <= CONCENTRATION_MAX_MODELE * (1 + 1e-12) && oh <= CONCENTRATION_MAX_MODELE * (1 + 1e-12) };
}
export const etatDepuisH3O = (h: number, T: number = 25): EtatPH => etatDepuisPH(pH(h), T);
/** pOH = −log[OH⁻], puis pH = pKe − pOH. */
export const etatDepuisOH = (oh: number, T: number = 25): EtatPH => etatDepuisPH(pKe(T) + Math.log10(positif("[OH⁻]", oh)), T);

/** Facteur sur [H₃O⁺] entre deux solutions : combien de fois A est plus riche en H₃O⁺ que B (= 10^(pH_B − pH_A)). */
export const facteurH3O = (pHA: number, pHB: number): number => 10 ** (pHB - pHA);

/** Teneur de l'eau en eau (mol/L, approximation 1000 g/L ÷ 18,015 g/mol) et rapport « molécules d'eau pour un ion formé ». */
export const CONCENTRATION_EAU = 55.5;
export function moleculesPourUnIon(T: number): number {
  return CONCENTRATION_EAU / concentrationEauPure(T);
}

// --- Acide fort : HCl dilué ---------------------------------------------------------------------------------------

export const C_MIN_ACIDE_FORT = 1e-6;
export const C_MAX_ACIDE_FORT = 0.1;
export type ValiditeAcideFort = "ok" | "trop-dilue" | "trop-concentre";

export function validiteAcideFort(C: number): ValiditeAcideFort {
  positif("La concentration apportée", C);
  if (C < C_MIN_ACIDE_FORT) return "trop-dilue";
  if (C > C_MAX_ACIDE_FORT) return "trop-concentre";
  return "ok";
}

/** pH d'une solution de HCl de concentration apportée C (réaction totale, autoprotolyse négligée) ; null hors du domaine de validité. */
export function pHAcideFort(C: number): number | null {
  return validiteAcideFort(C) === "ok" ? -Math.log10(C) : null;
}
/** Concentration exacte en H₃O⁺ avec l'autoprotolyse à 25 °C : h² − C h − Ke = 0 (sert à justifier l'approximation). */
export function h3oAcideFortExacte(C: number): number {
  positif("La concentration apportée", C);
  return (C + Math.sqrt(C * C + 4 * Ke(25))) / 2;
}

// --- Électroneutralité ---------------------------------------------------------------------------------------------

export type CleIon = "Na" | "Cl" | "Ca" | "SO4" | "H3O" | "OH";
export const IONS: CleIon[] = ["Na", "Cl", "Ca", "SO4", "H3O", "OH"];
export const chargeIon = (ion: CleIon): number => ESPECES[ion].charge;

export interface Assemblage {
  Na: number;
  Cl: number;
  Ca: number;
  SO4: number;
  H3O: number;
  OH: number;
}
export const ASSEMBLAGE_VIDE: Assemblage = { Na: 0, Cl: 0, Ca: 0, SO4: 0, H3O: 0, OH: 0 };

/** Bilan des charges élémentaires d'un assemblage d'ions (nombres entiers de particules). */
export function bilanCharges(a: Assemblage): { positives: number; negatives: number; net: number; neutre: boolean } {
  let positives = 0;
  let negatives = 0;
  for (const ion of IONS) {
    const n = a[ion];
    if (!Number.isInteger(n) || n < 0) throw new ChimieEauErreur(`Le nombre d'ions ${ESPECES[ion].formule} doit être un entier positif ou nul (reçu ${n}).`);
    const z = chargeIon(ion);
    if (z > 0) positives += n * z;
    else negatives += n * -z;
  }
  return { positives, negatives, net: positives - negatives, neutre: positives === negatives };
}

export type SelModele = "NaCl" | "CaCl2";
/** Nombre d'ions par unité formulaire : NaCl → 1 Na⁺ + 1 Cl⁻ ; CaCl₂ → 1 Ca²⁺ + 2 Cl⁻. */
export const STOECHIOMETRIE: Record<SelModele, Partial<Record<CleIon, number>>> = { NaCl: { Na: 1, Cl: 1 }, CaCl2: { Ca: 1, Cl: 2 } };

export function assemblageDepuisSel(sel: SelModele, unites: number): Assemblage {
  if (!Number.isInteger(unites) || unites < 0) throw new ChimieEauErreur("Le nombre d'unités formulaires doit être un entier positif ou nul.");
  const a = { ...ASSEMBLAGE_VIDE };
  for (const [ion, nu] of Object.entries(STOECHIOMETRIE[sel]) as Array<[CleIon, number]>) a[ion] = nu * unites;
  return a;
}

/** Concentrations ioniques apportées par un sel totalement dissous de concentration apportée C. */
export function concentrationsIoniques(sel: SelModele, C: number): Partial<Record<CleIon, number>> {
  positif("La concentration apportée", C);
  const res: Partial<Record<CleIon, number>> = {};
  for (const [ion, nu] of Object.entries(STOECHIOMETRIE[sel]) as Array<[CleIon, number]>) res[ion] = nu * C;
  return res;
}

/** Relation d'électroneutralité Σ z·c (cations) = Σ |z|·c (anions) pour des concentrations données, eau comprise. */
export function electroneutraliteSolution(conc: Partial<Record<CleIon, number>>): { cations: number; anions: number; ecartRelatif: number; verifiee: boolean } {
  let cations = 0;
  let anions = 0;
  for (const ion of IONS) {
    const c = conc[ion] ?? 0;
    if (!Number.isFinite(c) || c < 0) throw new ChimieEauErreur(`La concentration de ${ESPECES[ion].formule} doit être positive ou nulle.`);
    const z = chargeIon(ion);
    if (z > 0) cations += z * c;
    else anions += -z * c;
  }
  const ecartRelatif = Math.abs(cations - anions) / Math.max(cations, anions, Number.MIN_VALUE);
  return { cations, anions, ecartRelatif, verifiee: ecartRelatif < 1e-9 };
}

/** Solution de sel dans l'eau à 25 °C : concentrations de tous les ions, eau comprise (pH neutre : [H₃O⁺] = [OH⁻] = 10⁻⁷). */
export function solutionSaline(sel: SelModele, C: number): Partial<Record<CleIon, number>> {
  const eau = concentrationEauPure(25);
  return { ...concentrationsIoniques(sel, C), H3O: eau, OH: eau };
}

// --- Dissolution : phases, conductivité qualitative ------------------------------------------------------------------

export type Soluté = "sel" | "sucre";
export const DUREE_DISSOLUTION = 10;
/** Début de chaque phase de l'animation (secondes). */
export const PHASES_DISSOLUTION = [
  { id: "cristal", debut: 0, titre: "Cristal solide" },
  { id: "approche", debut: 1.5, titre: "Les molécules d'eau s'approchent" },
  { id: "separation", debut: 3, titre: "Séparation" },
  { id: "hydratation", debut: 6, titre: "Hydratation" },
  { id: "dispersion", debut: 8, titre: "Solution homogène" },
] as const;
export function phaseDissolution(tps: number): (typeof PHASES_DISSOLUTION)[number]["id"] {
  let courante: (typeof PHASES_DISSOLUTION)[number]["id"] = "cristal";
  for (const p of PHASES_DISSOLUTION) if (tps >= p.debut) courante = p.id;
  return courante;
}

export type NiveauConductivite = "très faible" | "faible" | "moyenne" | "élevée";
export type Milieu = "eau" | "sel" | "sucre";
/** Niveau QUALITATIF (aucune valeur numérique de conductivité n'est donnée) selon les porteurs de charge présents. */
export function niveauConductivite(milieu: Milieu, C = 0): NiveauConductivite {
  if (milieu !== "sel") return "très faible";
  if (C < 0.01) return "faible";
  if (C < 0.1) return "moyenne";
  return "élevée";
}
export const porteursDeCharge = (milieu: Milieu): string =>
  milieu === "sel" ? "ions Na⁺ et Cl⁻ mobiles (en grand nombre)" : milieu === "sucre" ? "aucun ion apporté par le sucre : seulement les traces d'ions de l'eau" : "ions H₃O⁺ et OH⁻ de l'eau (en très faible quantité)";

// --- Écriture et lecture des nombres -------------------------------------------------------------------------------

export function fr(x: number, decimales = 2): string {
  if (!Number.isFinite(x)) return "—";
  const v = Number(x.toFixed(decimales));
  return (Object.is(v, -0) ? 0 : v).toString().replace(".", ",");
}

export function notationScientifique(x: number): { mantisse: number; exposant: number } {
  if (!Number.isFinite(x) || x === 0) return { mantisse: 0, exposant: 0 };
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = x / 10 ** e;
  if (Math.abs(m) >= 10 - 1e-9) {
    m /= 10;
    e += 1;
  }
  if (Math.abs(m) < 1 - 1e-9) {
    m *= 10;
    e -= 1;
  }
  return { mantisse: Number(m.toPrecision(12)), exposant: e };
}

/** TeX d'une concentration : 10^{-3} si la mantisse vaut 1, sinon 2{,}5\times10^{-4}. */
export function texNombre(x: number, chiffres = 3): string {
  if (x === 0) return "0";
  const { mantisse, exposant } = notationScientifique(x);
  if (exposant >= -2 && exposant <= 2) return fr(x, Math.max(0, chiffres - 1 - exposant)).replace(",", "{,}");
  const m = Number(mantisse.toPrecision(chiffres));
  if (m === 1) return `10^{${exposant}}`;
  return `${String(m).replace(".", "{,}")}\\times10^{${exposant}}`;
}
/** Texte brut d'une concentration, avec exposants Unicode (étiquettes SVG). */
export function sup(k: number): string {
  const map: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  return String(k).split("").map((c) => map[c] ?? c).join("");
}
export function texteNombre(x: number, chiffres = 3): string {
  if (x === 0) return "0";
  const { mantisse, exposant } = notationScientifique(x);
  if (exposant >= -2 && exposant <= 2) return fr(x, Math.max(0, chiffres - 1 - exposant));
  const m = Number(mantisse.toPrecision(chiffres));
  return m === 1 ? `10${sup(exposant)}` : `${String(m).replace(".", ",")} × 10${sup(exposant)}`;
}

/**
 * Lecture d'un nombre saisi : « 0.001 », « 0,001 », « 1e-3 », « 1E-3 », « 10^-3 », « 10^{-3} », « 2,5×10^-4 », « 2.5x10^-4 »,
 * « 2,5*10^-4 », « 2,5.10^-4 », « 10⁻³ ». Renvoie null si la saisie n'est pas un nombre. Le reste de la saisie (unité) est rendu à part.
 */
export function lireNombreChimie(saisie: string): { valeur: number; reste: string } | null {
  let s = saisie.trim().replace(/\s+/g, "").replace(/−/g, "-").replace(/,/g, ".");
  const exposants: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
  s = s.replace(/10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, e: string) => "10^" + e.split("").map((c) => exposants[c]).join(""));
  const NB = "[-+]?(?:\\d+\\.?\\d*|\\.\\d+)";
  const puissance = new RegExp(`^(${NB})?(?:[x×*·.]|\\\\times)?10\\^\\{?([-+]?\\d+)\\}?`, "i").exec(s);
  if (puissance && (puissance[1] !== undefined || s.startsWith("10^") || /^[-+]?10\^/.test(s))) {
    const m = puissance[1] === undefined ? 1 : Number(puissance[1]);
    const v = m * 10 ** Number(puissance[2]);
    if (Number.isFinite(v)) return { valeur: v, reste: s.slice(puissance[0].length) };
  }
  const simple = new RegExp(`^(${NB}(?:e[-+]?\\d+)?)`, "i").exec(s);
  if (!simple) return null;
  const v = Number(simple[1]);
  return Number.isFinite(v) ? { valeur: v, reste: s.slice(simple[1].length) } : null;
}

// --- pH-mètre virtuel -----------------------------------------------------------------------------------------------

export interface Tampon {
  id: string;
  /** Valeur nominale à 25 °C (elle dépend en réalité de la température et de la formulation du tampon). */
  ph: number;
}
export const TAMPONS: Tampon[] = [
  { id: "t4", ph: 4 },
  { id: "t7", ph: 7 },
  { id: "t10", ph: 10 },
];

export interface Echantillon {
  id: string;
  nom: string;
  /** pH nominal de l'échantillon FICTIF de la simulation (pas une valeur universelle d'un produit réel). */
  phNominal: number;
}
export const ECHANTILLONS: Echantillon[] = [
  { id: "A", nom: "Solution A", phNominal: 3 },
  { id: "B", nom: "Solution B", phNominal: 7 },
  { id: "C", nom: "Solution C", phNominal: 10 },
];
/** Scénario « Trois solutions mystérieuses ». */
export const ECHANTILLONS_MYSTERE: Echantillon[] = [
  { id: "A", nom: "Solution A", phNominal: 3 },
  { id: "B", nom: "Solution B", phNominal: 7 },
  { id: "C", nom: "Solution C", phNominal: 11 },
];

export const TEMPS_STABILISATION = 6; // s
const TAU = 0.8; // s, constante de montée pédagogique de l'affichage
/** Incertitude pédagogique de la mesure simulée : écart déterministe compris entre −0,02 et +0,02 unité de pH. */
export const INCERTITUDE_PEDAGOGIQUE = 0.02;
/** Biais pédagogique supplémentaire quand l'échantillon est hors de la plage d'étalonnage (extrapolation). */
export const BIAIS_HORS_PLAGE = 0.1;

/** Nombre pseudo-aléatoire reproductible dans [0,1[ (graine entière). */
export function aleatoireReproductible(graine: number): number {
  let x = (graine | 0) + 0x6d2b79f5;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
}

export function graineDe(id: string): number {
  let h = 17;
  for (const c of id) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
  return h;
}

/** Extrapolation tolérée au-delà du tampon extrême (en unités de pH) avant de déclarer l'échantillon hors de la plage d'étalonnage. */
export const MARGE_EXTRAPOLATION = 1;
export const horsPlageEtalonnage = (phNominal: number, points: number[]): boolean => {
  if (points.length < 2) return true;
  return phNominal < Math.min(...points) - MARGE_EXTRAPOLATION - 1e-9 || phNominal > Math.max(...points) + MARGE_EXTRAPOLATION + 1e-9;
};

/** Mesure simulée : valeur nominale + écart reproductible (± incertitude pédagogique) + biais éventuel hors plage. Résultat arrondi à 0,01. */
export function mesureSimulee(e: Echantillon, points: number[]): number {
  const ecart = (aleatoireReproductible(graineDe(e.id)) * 2 - 1) * INCERTITUDE_PEDAGOGIQUE;
  const biais = horsPlageEtalonnage(e.phNominal, points) ? BIAIS_HORS_PLAGE * (e.phNominal >= 7 ? -1 : 1) : 0;
  return Math.round((e.phNominal + ecart + biais) * 100) / 100;
}

export type Cible = { type: "tampon"; id: string } | { type: "echantillon"; id: string };

export interface EtatPhMetre {
  prepare: boolean;
  /** Électrode rincée depuis sa dernière immersion. */
  propre: boolean;
  immerge: Cible | null;
  /** Dernière valeur affichée (point de départ de l'affichage à la prochaine immersion). */
  dernier: number;
  /** pH nominaux des tampons validés. */
  points: number[];
  /** Mesures relevées, par identifiant d'échantillon. */
  releves: Record<string, number>;
  conservation: "bonne" | "mauvaise" | null;
  erreurs: number;
}
export const ETAT_PHMETRE_INITIAL: EtatPhMetre = { prepare: false, propre: true, immerge: null, dernier: 7, points: [], releves: {}, conservation: null, erreurs: 0 };

export type ActionPhMetre =
  | { type: "preparer" }
  | { type: "rincer" }
  | { type: "immerger"; cible: Cible }
  | { type: "retirer" }
  | { type: "valider-point"; t: number }
  | { type: "relever"; t: number }
  | { type: "ranger"; milieu: "solution-conservation" | "eau-distillee" | "air" };

export interface MessagePhMetre {
  ton: "erreur" | "info" | "ok";
  code: "pas-prepare" | "pas-etalonne" | "pas-rince" | "prematuree" | "pas-immerge" | "mauvais-tampons" | "mauvaise-conservation" | "deja-valide" | "mauvaise-cible" | "ok";
  texte: string;
}

export interface ResultatPhMetre {
  etat: EtatPhMetre;
  message: MessagePhMetre | null;
}

const refus = (etat: EtatPhMetre, code: MessagePhMetre["code"], texte: string): ResultatPhMetre => ({ etat: { ...etat, erreurs: etat.erreurs + 1 }, message: { ton: "erreur", code, texte } });

export const etalonne = (etat: EtatPhMetre): boolean => new Set(etat.points).size >= 2;
const phCible = (c: Cible, liste: Echantillon[]): number => {
  if (c.type === "tampon") return TAMPONS.find((x) => x.id === c.id)?.ph ?? NaN;
  return liste.find((x) => x.id === c.id)?.phNominal ?? NaN;
};

/** Valeur affichée par l'appareil t secondes après l'immersion (montée exponentielle pédagogique, valeur définitive après TEMPS_STABILISATION). */
export function valeurAffichee(depart: number, cible: number, tps: number): number {
  if (tps >= TEMPS_STABILISATION) return cible;
  return depart + (cible - depart) * (1 - Math.exp(-Math.max(0, tps) / TAU));
}
export const estStabilise = (tps: number): boolean => tps >= TEMPS_STABILISATION;

/** Transition du pH-mètre : applique l'action, refuse les gestes contraires à la procédure et explique pourquoi. */
export function actionPhMetre(etat: EtatPhMetre, action: ActionPhMetre, liste: Echantillon[] = ECHANTILLONS): ResultatPhMetre {
  switch (action.type) {
    case "preparer":
      return { etat: { ...etat, prepare: true }, message: { ton: "ok", code: "ok", texte: "Appareil allumé, électrode en bon état : tu peux étalonner." } };
    case "rincer":
      if (!etat.prepare) return refus(etat, "pas-prepare", "Prépare d'abord le pH-mètre.");
      return { etat: { ...etat, propre: true, immerge: null }, message: { ton: "ok", code: "ok", texte: "Électrode rincée à l'eau déminéralisée (sans la frotter) : elle ne contaminera pas la solution suivante." } };
    case "immerger": {
      if (!etat.prepare) return refus(etat, "pas-prepare", "Avant de mesurer le pH, il faut préparer le pH-mètre : appuie sur « Préparer ».");
      if (!etat.propre) return refus(etat, "pas-rince", "L'électrode risque de contaminer la solution suivante. Rince-la avant de poursuivre.");
      if (Number.isNaN(phCible(action.cible, liste))) return refus(etat, "mauvaise-cible", "Cette solution n'existe pas dans le scénario.");
      return { etat: { ...etat, immerge: action.cible, propre: false }, message: { ton: "info", code: "ok", texte: "Électrode immergée : attends que l'affichage se stabilise." } };
    }
    case "retirer":
      return { etat: { ...etat, immerge: null }, message: null };
    case "valider-point": {
      const c = etat.immerge;
      if (!etat.prepare) return refus(etat, "pas-prepare", "Prépare d'abord le pH-mètre.");
      if (!c || c.type !== "tampon") return refus(etat, "pas-immerge", "Pour étalonner, immerge l'électrode dans une solution tampon.");
      if (!estStabilise(action.t)) return refus(etat, "prematuree", "Attends que la mesure se stabilise avant de valider le point d'étalonnage.");
      const ph = phCible(c, liste);
      if (etat.points.includes(ph)) return refus(etat, "deja-valide", `Le point à pH ${fr(ph, 0)} est déjà validé : choisis un autre tampon.`);
      const points = [...etat.points, ph];
      const messageSup = points.length >= 2 ? " Étalonnage à deux points effectué." : " Valide maintenant un second tampon.";
      return { etat: { ...etat, points, dernier: ph }, message: { ton: "ok", code: "ok", texte: `Point d'étalonnage pH ${fr(ph, 0)} validé.${messageSup}` } };
    }
    case "relever": {
      const c = etat.immerge;
      if (!etat.prepare) return refus(etat, "pas-prepare", "Prépare d'abord le pH-mètre.");
      if (!c || c.type !== "echantillon") return refus(etat, "pas-immerge", "Immerge l'électrode dans une solution à mesurer.");
      if (!etalonne(etat)) return refus(etat, "pas-etalonne", "Le pH-mètre doit être étalonné avant la mesure (au moins deux tampons).");
      if (!estStabilise(action.t)) return refus(etat, "prematuree", "Attends que la mesure se stabilise avant de relever le pH.");
      const e = liste.find((x) => x.id === c.id)!;
      const valeur = mesureSimulee(e, etat.points);
      const hors = horsPlageEtalonnage(e.phNominal, etat.points);
      return {
        etat: { ...etat, releves: { ...etat.releves, [e.id]: valeur }, dernier: valeur },
        message: hors
          ? { ton: "erreur", code: "mauvais-tampons", texte: `Mesure relevée : pH = ${fr(valeur, 2)}. Attention : cette solution est hors de la plage d'étalonnage (tampons ${[...new Set(etat.points)].sort((a, b) => a - b).map((p) => fr(p, 0)).join(" et ")}) : les tampons doivent encadrer la valeur à mesurer. Le résultat est moins fiable.` }
          : { ton: "ok", code: "ok", texte: `Valeur stabilisée : pH = ${fr(valeur, 2)}.` },
      };
    }
    case "ranger":
      return action.milieu === "solution-conservation"
        ? { etat: { ...etat, conservation: "bonne", immerge: null }, message: { ton: "ok", code: "ok", texte: "Bien rangée : l'électrode doit être conservée dans la solution recommandée par le fabricant, jamais à sec." } }
        : {
            etat: { ...etat, conservation: "mauvaise", immerge: null, erreurs: etat.erreurs + 1 },
            message: { ton: "erreur", code: "mauvaise-conservation", texte: action.milieu === "air" ? "Une électrode ne doit pas sécher : conserve-la dans la solution de conservation recommandée par le fabricant." : "L'eau distillée ne convient pas en stockage prolongé : suis la recommandation du fabricant (généralement une solution de conservation adaptée)." },
          };
  }
}

/** Étape de la procédure conseillée selon l'état de l'appareil. */
export function etapeProcedure(etat: EtatPhMetre, nombreEchantillons: number): "preparer" | "etalonner" | "mesurer" | "interpreter" | "ranger" | "termine" {
  if (!etat.prepare) return "preparer";
  if (!etalonne(etat)) return "etalonner";
  const mesures = Object.keys(etat.releves).length;
  if (mesures === 0) return "mesurer";
  if (mesures < nombreEchantillons) return "interpreter";
  return etat.conservation === null ? "ranger" : "termine";
}

/** Ligne du tableau de résultats d'une solution à la température T (calculée par le moteur, jamais saisie à la main). */
export function ligneSolution(valeurPH: number, T = 25) {
  const e = etatDepuisPH(valeurPH, T);
  return { pH: e.pH, h3o: e.h3o, oh: e.oh, nature: e.nature };
}
