/**
 * Questions du mode « S'exercer » du Laboratoire de chimie de l'eau. Elles sont générées à partir des paramètres COURANTS de
 * chaque simulation et vérifiées par le moteur (lib/chimieEau.ts) : aucune réponse numérique n'est écrite en dur.
 * Les textes peuvent contenir de la formule entre `$...$` (rendue en KaTeX par l'interface).
 */
import {
  ASSEMBLAGE_VIDE,
  C_MAX_ACIDE_FORT,
  ECHANTILLONS_MYSTERE,
  MASSE_MOLAIRE,
  PKE,
  bilanCharges,
  concentrationEauPure,
  concentrationH3O,
  concentrationMolaire,
  concentrationOH,
  etatDepuisPH,
  facteurH3O,
  fr,
  Ke,
  lireNombreChimie,
  natureSolution,
  pHAcideFort,
  pHNeutre,
  pKe,
  quantiteDepuisMasse,
  texNombre,
  validiteAcideFort,
  type Assemblage,
  type Echantillon,
  type Nature,
  type SelModele,
  type Soluté,
  type Temperature,
} from "@/lib/chimieEau";

export type Question =
  | { id: string; niveau: 1 | 2 | 3; type: "nombre"; enonce: string; unite: string; attendu: number; echelle: "relative" | "absolue"; tol: number; indice: string; explication: string }
  | { id: string; niveau: 1 | 2 | 3; type: "choix"; enonce: string; options: string[]; attendu: number; indice: string; explication: string };

export interface Verdict {
  ok: boolean;
  message: string;
}

export const TOL_RELATIVE = 0.02;
/** Tolérance absolue sur un pH ou un pOH (deux décimales demandées au plus). */
export const TOL_PH = 0.05;

// --- Paramètres des simulations (valeurs par défaut = exemples du cours) -----------------------------------------------

export interface ParamsDissolution {
  soluté: Soluté;
  masse: number; // g
  volume: number; // L
}
export const DISSOLUTION_DEFAUT: ParamsDissolution = { soluté: "sel", masse: 5.844, volume: 0.5 };

export interface ParamsIonisation {
  n: number; // mol de HCl
  V: number; // L
}
export const IONISATION_DEFAUT: ParamsIonisation = { n: 0.01, V: 1 };

export interface ParamsCharges {
  mode: SelModele | "libre";
  C: number; // mol/L de sel apporté
  libre: Assemblage;
}
export const CHARGES_DEFAUT: ParamsCharges = { mode: "CaCl2", C: 0.02, libre: { ...ASSEMBLAGE_VIDE, Na: 3, Cl: 1 } };

export interface ParamsAutoprotolyse {
  T: Temperature;
}
export const AUTOPROTOLYSE_DEFAUT: ParamsAutoprotolyse = { T: 25 };

export interface ParamsPH {
  pH: number;
  T: Temperature;
}
export const PH_DEFAUT: ParamsPH = { pH: 3, T: 25 };

// --- Fabriques --------------------------------------------------------------------------------------------------------

const nombre = (id: string, niveau: 1 | 2 | 3, enonce: string, unite: string, attendu: number, indice: string, explication: string, echelle: "relative" | "absolue" = "relative", tol = echelle === "relative" ? TOL_RELATIVE : TOL_PH): Question => ({ id, niveau, type: "nombre", enonce, unite, attendu, echelle, tol, indice, explication });
const choix = (id: string, niveau: 1 | 2 | 3, enonce: string, options: string[], attendu: number, indice: string, explication: string): Question => ({ id, niveau, type: "choix", enonce, options, attendu, indice, explication });

const tex = (e: string) => `$${e}$`;

// --- Évaluation -------------------------------------------------------------------------------------------------------

const UNITES: Record<string, string[]> = {
  "mol/L": ["mol/l", "mol.l-1", "mol·l-1", "mol.l^-1", "mol·l⁻¹", "mol.l⁻¹", "m", "molar", "mol/litre", "moll-1"],
  mol: ["mol", "moles"],
  "": [""],
  e: ["e", "charge", "charges", "charge(s)"],
  "g/mol": ["g/mol", "g.mol-1", "g·mol-1", "g.mol^-1", "g·mol⁻¹"],
  g: ["g", "gramme", "grammes"],
};
export function uniteAcceptee(reste: string, unite: string): boolean {
  const r = reste.replace(/\s+/g, "").toLowerCase();
  if (r === "") return true;
  return (UNITES[unite] ?? [unite]).map((u) => u.toLowerCase()).includes(r);
}

export function evaluerReponse(q: Question, saisie: string | number): Verdict {
  if (q.type === "choix") {
    const i = typeof saisie === "number" ? saisie : Number(saisie);
    if (!Number.isInteger(i) || i < 0 || i >= q.options.length) return { ok: false, message: "Choisis une des réponses proposées." };
    return i === q.attendu ? { ok: true, message: "Correct." } : { ok: false, message: "Pas tout à fait : relis l'indice, puis choisis une autre réponse." };
  }
  const lu = lireNombreChimie(String(saisie));
  if (!lu) return { ok: false, message: "Écris un nombre (virgule ou point décimal ; notation scientifique acceptée : 1e-3, 10^-3 ou 2,5×10^-4)." };
  if (q.unite !== "" && !uniteAcceptee(lu.reste, q.unite)) return { ok: false, message: `L'unité attendue est ${q.unite === "e" ? "e (charges élémentaires)" : q.unite}.` };
  if (q.unite === "" && lu.reste.replace(/\s+/g, "") !== "") return { ok: false, message: "Ici, la grandeur n'a pas d'unité : écris seulement le nombre." };
  const ecart = Math.abs(lu.valeur - q.attendu);
  const seuil = q.echelle === "relative" ? q.tol * Math.abs(q.attendu) : q.tol;
  const attenduTxt = q.echelle === "relative" ? texteCourt(q.attendu) : fr(q.attendu, 2);
  if (ecart <= seuil + 1e-15) return { ok: true, message: `Correct : ${attenduTxt}${q.unite ? " " + q.unite : ""}.` };
  return { ok: false, message: `Pas tout à fait : ta valeur (${texteCourt(lu.valeur)}) s'écarte du résultat attendu${q.echelle === "relative" ? ` de plus de ${Math.round(q.tol * 100)} %` : ` de plus de ${fr(q.tol, 2)}`}. Relis l'indice, puis recommence.` };
}

function texteCourt(x: number): string {
  const a = Math.abs(x);
  if (a !== 0 && (a < 0.01 || a >= 1000)) return x.toExponential(2).replace("e", " × 10^").replace(".", ",").replace("+", "");
  return fr(x, 4);
}

// --- Dissolution ------------------------------------------------------------------------------------------------------

export function questionsDissolution(p: ParamsDissolution): Question[] {
  const M = p.soluté === "sel" ? MASSE_MOLAIRE.NaCl : MASSE_MOLAIRE.saccharose;
  const n = quantiteDepuisMasse(p.masse, M);
  const C = concentrationMolaire(n, p.volume);
  const nom = p.soluté === "sel" ? "chlorure de sodium" : "saccharose";
  const q: Question[] = [
    choix("diss-ions", 1, "Quand on dissout NaCl dans l'eau, les ions sont-ils créés par l'eau ?", ["Oui, l'eau crée les ions Na⁺ et Cl⁻", "Non, les ions sont déjà présents dans le cristal et l'eau les sépare", "Non, il n'y a pas d'ions dans le cristal de sel"], 1, "Regarde l'étape 1 : le cristal est un réseau d'ions.", "Le cristal de NaCl est constitué d'ions Na⁺ et Cl⁻ déjà présents. L'eau les sépare (dissociation), les entoure (hydratation) et les disperse."),
    choix("diss-orient", 1, "Quelle partie de la molécule d'eau s'oriente vers un ion Na⁺ ?", ["Le côté hydrogène, partiellement positif", "Le côté oxygène, partiellement négatif", "Les deux côtés indifféremment"], 1, "Une charge positive attire la partie négative.", "L'oxygène porte une charge partielle négative δ− : il est attiré par Na⁺. Les hydrogènes (δ+) se tournent vers les ions Cl⁻."),
    choix("diss-cond", 1, "Pourquoi une solution de NaCl conduit-elle le courant ?", ["Parce qu'elle contient des ions mobiles", "Parce qu'elle contient des molécules de NaCl", "Parce que l'eau devient métallique"], 0, "Qu'est-ce qui transporte la charge dans une solution ?", "Le courant est porté par les ions Na⁺ et Cl⁻, qui se déplacent vers les électrodes de signes opposés."),
    choix("diss-sucre", 2, "Pourquoi une solution de saccharose ne conduit-elle pas comme une solution de sel ?", ["Le saccharose se disperse en molécules neutres : aucun ion n'est apporté", "Le saccharose forme des ions C₁₂H₂₂O₁₁⁺", "Le sucre ne se dissout pas dans l'eau"], 0, "Regarde l'équation du saccharose : y a-t-il des ions à droite ?", "Le saccharose se dissout sans former d'ions : C₁₂H₂₂O₁₁(s) → C₁₂H₂₂O₁₁(aq). Les molécules restent électriquement neutres."),
    nombre("diss-C", 2, `On dissout ${fr(p.masse, 3)} g de ${nom} (M = ${fr(M, 2)} g/mol) dans ${fr(p.volume, 3)} L de solution. Calcule la concentration apportée C.`, "mol/L", C, "n = m / M puis C = n / V.", `n = m/M = ${fr(p.masse, 3)} / ${fr(M, 2)} = ${fr(n, 5)} mol ; C = n/V = ${fr(n, 5)} / ${fr(p.volume, 3)} = ${fr(C, 4)} mol/L.`),
  ];
  q.push(
    p.soluté === "sel"
      ? nombre("diss-ions-tot", 3, `Pour cette solution de NaCl (C = ${fr(C, 4)} mol/L), calcule la concentration totale en ions (Na⁺ et Cl⁻ ensemble).`, "mol/L", 2 * C, "Chaque unité NaCl libère deux ions.", `[Na⁺] = [Cl⁻] = C = ${fr(C, 4)} mol/L, donc la concentration totale en ions est 2C = ${fr(2 * C, 4)} mol/L.`)
      : nombre("diss-molec", 3, `Pour cette solution de saccharose, quelle est la concentration en ions apportés par le sucre ? (donne un nombre)`, "mol/L", 0, "Les molécules restent neutres.", "Aucun ion n'est formé par la dissolution du saccharose : la concentration en ions apportés est 0 mol/L (les ions de l'eau mis à part).", "absolue", 1e-9),
  );
  return q;
}

// --- Ionisation -------------------------------------------------------------------------------------------------------

export function questionsIonisation(p: ParamsIonisation): Question[] {
  const C = concentrationMolaire(p.n, p.V);
  const v = validiteAcideFort(C);
  const q: Question[] = [
    choix("ion-diff", 1, "Pourquoi la dissolution de HCl est-elle différente de celle de NaCl ?", ["HCl est un cristal d'ions comme NaCl", "HCl est une molécule neutre qui réagit avec l'eau pour former des ions", "HCl ne se dissout pas dans l'eau"], 1, "Le chlorure de sodium contenait déjà des ions. Et HCl ?", "NaCl : les ions préexistent. HCl : une réaction avec l'eau transforme des molécules neutres en ions hydratés."),
    choix("ion-oxonium", 1, "Quel ion se forme lorsqu'une molécule d'eau reçoit un proton ?", ["OH⁻", "H₃O⁺", "H₂⁺", "Cl⁻"], 1, "H₂O + H⁺ → ?", "H₂O + H⁺ → H₃O⁺ : l'ion oxonium contient trois hydrogènes et un oxygène."),
    choix("ion-equation", 2, "Complète : HCl + H₂O → … + …", ["H₃O⁺ + Cl⁻", "H₂ + Cl₂O", "OH⁻ + HCl", "H₃O⁺ + Cl"], 0, "Compte les atomes et les charges des deux côtés.", "HCl + H₂O → H₃O⁺ + Cl⁻ : H (3 = 3), O (1 = 1), Cl (1 = 1) et charge (0 = +1 − 1)."),
    nombre("ion-3", 2, `Une solution diluée de HCl a ${tex(String.raw`[\mathrm{H_3O^+}] \approx 10^{-3}\ \mathrm{mol/L}`)}. Calcule son pH.`, "", 3, "pH = −log [H₃O⁺].", "pH = −log(10⁻³) = 3.", "absolue"),
  ];
  if (v === "ok") {
    const ph = pHAcideFort(C)!;
    q.push(nombre("ion-ph", 3, `On dissout ${fr(p.n, 4)} mol de HCl pour obtenir ${fr(p.V, 3)} L de solution (réaction totale avec l'eau). Calcule la concentration apportée puis le pH.`, "", ph, "C = n / V, puis [H₃O⁺] = C et pH = −log C.", `C = ${fr(p.n, 4)} / ${fr(p.V, 3)} = ${fr(C, 4)} mol/L = [H₃O⁺] ; pH = −log(${fr(C, 4)}) = ${fr(ph, 2)}.`, "absolue"));
  } else {
    q.push(choix("ion-valid", 3, `Ici C = ${fr(C, 4)} mol/L. Peut-on utiliser pH = −log C avec ce modèle ?`, ["Oui, toujours", "Non : la concentration sort du domaine dilué du modèle simplifié"], 1, `Le modèle est utilisé pour 10⁻⁶ ≤ C ≤ ${fr(C_MAX_ACIDE_FORT, 1)} mol/L.`, `Hors du domaine 10⁻⁶ à ${fr(C_MAX_ACIDE_FORT, 1)} mol/L, le calcul simplifié n'est plus assez fiable (trop dilué : l'autoprotolyse compte ; trop concentré : activités ≠ concentrations).`));
  }
  return q;
}

// --- Électroneutralité ------------------------------------------------------------------------------------------------

export function questionsCharges(p: ParamsCharges): Question[] {
  const b = bilanCharges(p.libre);
  return [
    choix("ch-ca", 1, "Un ion Ca²⁺ possède combien de charges positives élémentaires ?", ["1", "2", "0", "4"], 1, "L'exposant 2+ donne la charge.", "Ca²⁺ porte deux charges élémentaires positives (+2e)."),
    choix("ch-cl", 1, "Combien d'ions Cl⁻ faut-il pour compenser un ion Ca²⁺ ?", ["1", "2", "3"], 1, "(+2) + n × (−1) = 0.", "(+2) + 2 × (−1) = 0 : il faut deux ions chlorure."),
    choix("ch-eq", 2, "Complète : CaCl₂(s) → Ca²⁺(aq) + …", ["Cl⁻(aq)", "2 Cl⁻(aq)", "Cl₂(aq)"], 1, "Les atomes et les charges doivent être conservés.", "CaCl₂(s) → Ca²⁺(aq) + 2 Cl⁻(aq) : 1 Ca et 2 Cl de chaque côté ; charge 0 = +2 − 2."),
    nombre("ch-conc", 2, `Une solution de chlorure de calcium totalement dissous (sans autre soluté ionique) a ${tex(String.raw`[\mathrm{Ca^{2+}}] = ${texNombre(p.C)}\ \mathrm{mol/L}`)}. Détermine ${tex(String.raw`[\mathrm{Cl^-}]`)}.`, "mol/L", 2 * p.C, "[Cl⁻] = 2 × [Ca²⁺].", `Électroneutralité : 2[Ca²⁺] = [Cl⁻], donc [Cl⁻] = 2 × ${fr(p.C, 4)} = ${fr(2 * p.C, 4)} mol/L.`),
    nombre("ch-net", 3, `Dans l'assemblage de l'onglet (Na⁺ : ${p.libre.Na}, Cl⁻ : ${p.libre.Cl}, Ca²⁺ : ${p.libre.Ca}, SO₄²⁻ : ${p.libre.SO4}, H₃O⁺ : ${p.libre.H3O}, OH⁻ : ${p.libre.OH}), quelle est la charge nette (en charges élémentaires, positive ou négative) ?`, "e", b.net, "Compte les charges positives, puis les négatives, et fais la différence.", `Positives : ${b.positives} ; négatives : ${b.negatives} ; charge nette = ${b.net >= 0 ? "+" : ""}${b.net}${b.net === 0 ? " : assemblage neutre" : " : assemblage non équilibré"}.`, "absolue", 1e-9),
    nombre("ch-cl-mix", 3, `Une solution contient ${tex(String.raw`[\mathrm{Na^+}] = 0{,}10\ \mathrm{mol/L}`)} et ${tex(String.raw`[\mathrm{Ca^{2+}}] = ${texNombre(p.C)}\ \mathrm{mol/L}`)}, avec pour seul anion ${tex(String.raw`\mathrm{Cl^-}`)}. Calcule [Cl⁻] (ions de l'eau négligés).`, "mol/L", 0.1 + 2 * p.C, "[Na⁺] + 2[Ca²⁺] = [Cl⁻].", `[Cl⁻] = 0,10 + 2 × ${fr(p.C, 4)} = ${fr(0.1 + 2 * p.C, 4)} mol/L.`),
  ];
}

// --- Autoprotolyse ----------------------------------------------------------------------------------------------------

export function questionsAutoprotolyse(p: ParamsAutoprotolyse): Question[] {
  const h = concentrationEauPure(p.T);
  return [
    choix("ap-eq", 1, "Quelle est l'équation d'autoprotolyse de l'eau ?", ["2 H₂O ⇌ H₃O⁺ + OH⁻", "H₂O → H₂ + O", "H₂O + H₂O → H₄O₂"], 0, "Une molécule d'eau cède un proton à une autre.", "2 H₂O ⇌ H₃O⁺ + OH⁻ : une molécule cède H⁺ (elle devient OH⁻), l'autre le capte (elle devient H₃O⁺)."),
    choix("ap-fleche", 1, "Pourquoi utilise-t-on une double flèche ⇌ ?", ["La réaction est très rapide", "La réaction est limitée : elle se produit dans les deux sens et atteint un équilibre", "L'eau produit deux ions identiques"], 1, "Les ions formés peuvent se recombiner.", "La réaction inverse (H₃O⁺ + OH⁻ → 2 H₂O) a lieu aussi : on atteint un équilibre dynamique."),
    nombre("ap-h", 2, `À ${p.T} °C, ${tex(String.raw`pK_e = ${fr(pKe(p.T), 2).replace(",", "{,}")}`)}. Calcule la concentration en ions oxonium de l'eau pure.`, "mol/L", h, "Dans l'eau pure [H₃O⁺] = [OH⁻], donc [H₃O⁺]² = Ke.", `[H₃O⁺] = √Ke = √(10^−${fr(pKe(p.T), 2)}) = 10^−${fr(pKe(p.T) / 2, 3)} = ${texteCourt(h)} mol/L.`),
    nombre("ap-neutre", 2, `À ${p.T} °C, quel est le pH de l'eau pure (pH de neutralité) ?`, "", pHNeutre(p.T), "pH neutre = pKe / 2.", `pH = pKe/2 = ${fr(pKe(p.T), 2)} / 2 = ${fr(pHNeutre(p.T), 3)}.`, "absolue"),
    choix("ap-60", 3, "À 60 °C, le pH de l'eau pure est voisin de 6,51. L'eau pure est-elle acide ?", ["Oui, car son pH est inférieur à 7", "Non : elle est neutre, car [H₃O⁺] = [OH⁻] (le pH de neutralité vaut pKe/2)", "Non : elle est basique"], 1, "Compare [H₃O⁺] et [OH⁻], pas seulement le pH à 7.", "À 60 °C, pKe = 13,02 ; l'eau pure est neutre quand pH = pKe/2 ≈ 6,51, car [H₃O⁺] = [OH⁻]. Le seuil 7 ne vaut qu'à 25 °C."),
    nombre("ap-Ke", 3, `À une température donnée, ${tex(String.raw`pK_e = ${fr(PKE[60], 2).replace(",", "{,}")}`)}. Calcule ${tex("K_e")}.`, "", Ke(60), "Ke = 10^(−pKe).", `Ke = 10^−${fr(PKE[60], 2)} = ${texteCourt(Ke(60))}.`),
  ];
}

// --- pH et concentrations ---------------------------------------------------------------------------------------------

export function questionsPH(p: ParamsPH): Question[] {
  const e = etatDepuisPH(p.pH, p.T);
  const pk = fr(pKe(p.T), 2);
  return [
    nombre("ph-1", 1, `Une solution a ${tex(String.raw`[\mathrm{H_3O^+}] = 10^{-4}\ \mathrm{mol/L}`)}. Calcule son pH.`, "", 4, "pH = −log [H₃O⁺].", "pH = −log(10⁻⁴) = 4.", "absolue"),
    nombre("ph-2a", 2, `Une solution a pH = 9 (à 25 °C). Calcule ${tex(String.raw`[\mathrm{H_3O^+}]`)}.`, "mol/L", concentrationH3O(9), "[H₃O⁺] = 10^(−pH).", "[H₃O⁺] = 10⁻⁹ mol/L."),
    nombre("ph-2b", 2, `Pour la même solution (pH = 9 à 25 °C), calcule ${tex(String.raw`[\mathrm{OH^-}]`)}.`, "mol/L", concentrationOH(9, 25), "[OH⁻] = Ke / [H₃O⁺] = 10⁻¹⁴ / 10⁻⁹.", "[OH⁻] = 10⁻¹⁴ / 10⁻⁹ = 10⁻⁵ mol/L."),
    nombre("ph-3", 2, `Une solution a ${tex(String.raw`[\mathrm{OH^-}] = 10^{-2}\ \mathrm{mol/L}`)} à 25 °C. Calcule son pH.`, "", 12, "pOH = −log [OH⁻], puis pH = 14 − pOH.", "pOH = 2, donc pH = 14 − 2 = 12.", "absolue"),
    nombre("ph-4", 3, "Deux solutions ont pHA = 2 et pHB = 5. Combien de fois la concentration en ions oxonium est-elle plus grande dans A que dans B ?", "", facteurH3O(2, 5), "10^(pHB − pHA).", "10^(5 − 2) = 10³ = 1000 : trois unités de pH, un facteur 1000."),
    nombre("ph-5", 3, `À une température donnée, ${tex(String.raw`pK_e = ${fr(PKE[60], 2).replace(",", "{,}")}`)}. Calcule le pH de neutralité.`, "", pHNeutre(60), "pH neutre = pKe / 2.", "pH = 13,02 / 2 = 6,51.", "absolue"),
    nombre("ph-cour", 2, `Avec le pH affiché (${fr(p.pH, 2)}) à ${p.T} °C, calcule ${tex(String.raw`[\mathrm{H_3O^+}]`)}.`, "mol/L", e.h3o, "[H₃O⁺] = 10^(−pH).", `[H₃O⁺] = 10^−${fr(p.pH, 2)} = ${texteCourt(e.h3o)} mol/L.`),
    nombre("ph-cour-poh", 3, `Avec ce même pH (${fr(p.pH, 2)}) à ${p.T} °C (pKe = ${pk}), calcule le pOH.`, "", e.pOH, "pH + pOH = pKe.", `pOH = pKe − pH = ${pk} − ${fr(p.pH, 2)} = ${fr(e.pOH, 2)}.`, "absolue"),
  ];
}

// --- pH-mètre ---------------------------------------------------------------------------------------------------------

export interface ParamsPhMetreExo {
  /** Échantillon sélectionné et, s'il existe, sa mesure relevée. */
  echantillon: Echantillon;
  releve: number | null;
}

const NATURES: Nature[] = ["acide", "neutre", "basique"];

export function questionsPhMetre(p: ParamsPhMetreExo): Question[] {
  const valeur = p.releve ?? p.echantillon.phNominal;
  const source = p.releve !== null ? `La valeur relevée pour la ${p.echantillon.nom.toLowerCase()} est pH = ${fr(valeur, 2)}.` : `On considère la ${p.echantillon.nom.toLowerCase()} de pH nominal ${fr(valeur, 2)}.`;
  const e = etatDepuisPH(valeur, 25);
  const bons = p.echantillon.phNominal <= 4 ? "pH 4 et pH 7" : p.echantillon.phNominal >= 7 ? "pH 7 et pH 10" : "pH 4 et pH 7";
  return [
    choix("pm-etal", 1, "Pourquoi étalonne-t-on le pH-mètre avant de mesurer ?", ["Pour que l'appareil relie correctement la tension de l'électrode au pH, grâce à des solutions de pH connu", "Pour chauffer la solution", "Pour nettoyer l'électrode"], 0, "On utilise des solutions de référence.", "Les tampons de pH connu permettent de régler la correspondance entre la tension mesurée et le pH."),
    choix("pm-rincage", 1, "Pourquoi rince-t-on l'électrode entre deux solutions ?", ["Pour la sécher", "Pour éviter de contaminer la nouvelle solution avec la précédente", "Pour changer sa couleur"], 1, "Pense aux restes de la solution précédente.", "Le rinçage (sans frotter la membrane) évite de transporter la solution précédente dans la suivante."),
    nombre("pm-h", 2, `${source} Calcule ${tex(String.raw`[\mathrm{H_3O^+}]`)} (à 25 °C).`, "mol/L", e.h3o, "[H₃O⁺] = 10^(−pH).", `[H₃O⁺] = 10^−${fr(valeur, 2)} = ${texteCourt(e.h3o)} mol/L.`),
    choix("pm-nature", 2, `${source} À 25 °C, la solution est…`, NATURES.map((n) => n), NATURES.indexOf(natureSolution(valeur, 25)), "Compare le pH à 7 (neutralité à 25 °C).", `pH ${valeur < 7 ? "<" : valeur > 7 ? ">" : "="} 7 : la solution est ${natureSolution(valeur, 25)}.`),
    choix("pm-tampons", 3, `Tu veux mesurer une solution de pH voisin de ${fr(p.echantillon.phNominal, 0)}. Quels tampons choisis-tu pour l'étalonnage ?`, ["pH 4 et pH 7", "pH 7 et pH 10", "pH 4 et pH 10"], bons === "pH 4 et pH 7" ? 0 : 1, "Les tampons doivent encadrer la valeur à mesurer.", `Il faut encadrer la valeur à mesurer : pour un pH voisin de ${fr(p.echantillon.phNominal, 0)}, on choisit ${bons}${p.echantillon.phNominal > 10 ? " (et on reste prudent : au-delà de 10, on extrapole)" : ""}.`),
    nombre("pm-poh", 3, `${source} Calcule la concentration en ions hydroxyde ${tex(String.raw`[\mathrm{OH^-}]`)} (à 25 °C).`, "mol/L", e.oh, "[OH⁻] = 10⁻¹⁴ / [H₃O⁺].", `[OH⁻] = 10⁻¹⁴ / ${texteCourt(e.h3o)} = ${texteCourt(e.oh)} mol/L.`),
  ];
}

/** Questions du scénario « Trois solutions mystérieuses » à partir des mesures relevées (valeurs affichées par l'appareil). */
export function questionsMystere(releves: Record<string, number>): Question[] {
  const q: Question[] = [];
  for (const s of ECHANTILLONS_MYSTERE) {
    const v = releves[s.id];
    if (v === undefined) continue;
    const e = etatDepuisPH(v, 25);
    q.push(choix(`my-nature-${s.id}`, 2, `${s.nom} : pH relevé = ${fr(v, 2)}. À 25 °C, elle est…`, NATURES.map((n) => n), NATURES.indexOf(e.nature), "Compare au pH de neutralité (7 à 25 °C).", `pH = ${fr(v, 2)} : solution ${e.nature}.`));
    q.push(nombre(`my-h-${s.id}`, 3, `${s.nom} (pH = ${fr(v, 2)}) : calcule ${tex(String.raw`[\mathrm{H_3O^+}]`)}, puis vérifie ${tex(String.raw`[\mathrm{OH^-}]`)} = ${tex(String.raw`10^{-14}/[\mathrm{H_3O^+}]`)}.`, "mol/L", e.h3o, "[H₃O⁺] = 10^(−pH).", `[H₃O⁺] = ${texteCourt(e.h3o)} mol/L ; [OH⁻] = 10⁻¹⁴ / ${texteCourt(e.h3o)} = ${texteCourt(e.oh)} mol/L ; vérification : produit = ${texteCourt(e.produit)} ≈ 10⁻¹⁴.`));
  }
  return q;
}
