/**
 * Blocs Markdown du Laboratoire de dynamique : plan-incline (raccordé), machine-atwood, pendule-conique, monte-charge,
 * vehicule-virage, solide-sphere et labo-dynamique (six onglets). Une directive par ligne « clé: valeur », valeurs
 * numériques en unités SI SANS unité écrite, valeurs par défaut valides, validation stricte avec messages en français.
 */
import {
  ATWOOD_DEFAUT,
  MONTE_DEFAUT,
  PENDULE_DEFAUT,
  PLAN_DEFAUT,
  SPHERE_DEFAUT,
  VIRAGE_DEFAUT,
  type ParamsAtwood,
  type ParamsMonteCharge,
  type ParamsPendule,
  type ParamsPlan,
  type ParamsSphere,
  type ParamsVirage,
} from "@/lib/dynamique";

export class LaboDynamiqueSyntaxeError extends Error {}

export const ONGLETS_DYNAMIQUE = ["plan", "atwood", "pendule", "monte-charge", "virage", "sphere"] as const;
export type OngletDynamique = (typeof ONGLETS_DYNAMIQUE)[number];

/** Langages de blocs gérés (le premier de chaque paire est le nom du bloc Markdown). */
export const BLOCS_DYNAMIQUE = {
  "plan-incline": "plan",
  "machine-atwood": "atwood",
  "pendule-conique": "pendule",
  "monte-charge": "monte-charge",
  "vehicule-virage": "virage",
  "solide-sphere": "sphere",
  "labo-dynamique": "labo",
} as const;
export type LangageDynamique = keyof typeof BLOCS_DYNAMIQUE;
export const estLangageDynamique = (l: string | null | undefined): l is LangageDynamique => !!l && Object.prototype.hasOwnProperty.call(BLOCS_DYNAMIQUE, l);

export type DonneesDynamique =
  | { kind: "plan"; params: ParamsPlan }
  | { kind: "atwood"; params: ParamsAtwood }
  | { kind: "pendule"; params: ParamsPendule }
  | { kind: "monte-charge"; params: ParamsMonteCharge }
  | { kind: "virage"; params: ParamsVirage }
  | { kind: "sphere"; params: ParamsSphere }
  | { kind: "labo"; onglet: OngletDynamique };

interface Spec {
  champ: string;
  unite: string;
  min: number;
  max: number;
  /** borne basse exclue (valeurs strictement positives) */
  strictMin?: boolean;
}
type Table = Record<string, Spec>;

const NOMBRE = /^[-+]?(\d+([.,]\d+)?|[.,]\d+)(e[-+]?\d+)?$/i;

function lireNombre(cle: string, brut: string, s: Spec): number {
  const texte = brut.trim();
  if (!NOMBRE.test(texte)) {
    throw new LaboDynamiqueSyntaxeError(`"${cle}:" doit être un nombre en ${s.unite}, sans unité écrite (reçu « ${brut} »). Toutes les valeurs sont en unités SI.`);
  }
  const n = Number(texte.replace(",", "."));
  const horsBornes = n < s.min || n > s.max || (s.strictMin && n <= s.min);
  if (!Number.isFinite(n) || horsBornes) {
    throw new LaboDynamiqueSyntaxeError(`"${cle}:" doit être ${s.strictMin ? "strictement supérieur à" : "compris entre"} ${s.min}${s.strictMin ? `` : ` et ${s.max}`} ${s.unite}${s.strictMin ? ` (et au plus ${s.max})` : ""} (reçu ${n}).`);
  }
  return n;
}

function lireDirectives(source: string, table: Table): Record<string, number> {
  const res: Record<string, number> = {};
  const index: Record<string, string> = {};
  for (const cle of Object.keys(table)) index[cle.toLowerCase()] = cle;
  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;
    const i = ligne.indexOf(":");
    if (i === -1) throw new LaboDynamiqueSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    const cleBrute = ligne.slice(0, i).trim();
    const cle = index[cleBrute.toLowerCase()];
    if (!cle) throw new LaboDynamiqueSyntaxeError(`Directive inconnue : « ${cleBrute} » (attendu : ${Object.keys(table).join(", ")}).`);
    if (cle in res) throw new LaboDynamiqueSyntaxeError(`Directive répétée : « ${cle} ».`);
    res[cle] = lireNombre(cle, ligne.slice(i + 1), table[cle]);
  }
  return res;
}

const G: Spec = { champ: "g", unite: "m/s²", min: 1, max: 20 };

const T_PLAN: Table = {
  angle: { champ: "alpha", unite: "degrés", min: 0, max: 75 },
  masse: { champ: "m", unite: "kg", min: 0, max: 1000, strictMin: true },
  gravite: G,
  vitesse: { champ: "v0", unite: "m/s", min: 0, max: 10 },
  distance: { champ: "distance", unite: "m", min: 1, max: 20 },
};
const T_ATWOOD: Table = {
  masse1: { champ: "m1", unite: "kg", min: 0, max: 1000, strictMin: true },
  masse2: { champ: "m2", unite: "kg", min: 0, max: 1000, strictMin: true },
  gravite: G,
  course: { champ: "course", unite: "m", min: 0.2, max: 5 },
};
const T_PENDULE: Table = {
  masse: { champ: "m", unite: "kg", min: 0, max: 100, strictMin: true },
  longueur: { champ: "l", unite: "m", min: 0.1, max: 5 },
  angle: { champ: "theta", unite: "degrés", min: 1, max: 85 },
  omega: { champ: "omega", unite: "rad/s", min: 0, max: 50, strictMin: true },
  gravite: G,
};
const T_MONTE: Table = {
  masse: { champ: "m", unite: "kg", min: 0, max: 100000, strictMin: true },
  gravite: G,
  acceleration: { champ: "a", unite: "m/s²", min: -20, max: 20 },
  vitesse: { champ: "v0", unite: "m/s", min: -20, max: 20 },
  hauteur: { champ: "hauteur", unite: "m", min: 5, max: 200 },
};
const T_VIRAGE: Table = {
  masse: { champ: "m", unite: "kg", min: 0, max: 100000, strictMin: true },
  vitesse: { champ: "v", unite: "m/s", min: 0, max: 100, strictMin: true },
  rayon: { champ: "R", unite: "m", min: 1, max: 1000 },
  gravite: G,
  mu: { champ: "mu", unite: "(sans unité)", min: 0, max: 2, strictMin: true },
};
const T_SPHERE: Table = {
  masse: { champ: "m", unite: "kg", min: 0, max: 1000, strictMin: true },
  rayon: { champ: "R", unite: "m", min: 0.2, max: 50 },
  gravite: G,
  angleInitial: { champ: "theta0", unite: "degrés", min: 0.1, max: 60 },
  vitesse: { champ: "v0", unite: "m/s", min: 0, max: 30 },
};

function appliquer<T extends object>(defaut: T, table: Table, lues: Record<string, number>): T {
  const r = { ...defaut } as Record<string, unknown>;
  for (const [cle, valeur] of Object.entries(lues)) r[table[cle].champ] = valeur;
  return r as T;
}

export function parserBlocDynamique(langage: LangageDynamique, source: string): DonneesDynamique {
  switch (langage) {
    case "plan-incline":
      return { kind: "plan", params: appliquer(PLAN_DEFAUT, T_PLAN, lireDirectives(source, T_PLAN)) };
    case "machine-atwood":
      return { kind: "atwood", params: appliquer(ATWOOD_DEFAUT, T_ATWOOD, lireDirectives(source, T_ATWOOD)) };
    case "pendule-conique": {
      const l = lireDirectives(source, T_PENDULE);
      if ("angle" in l && "omega" in l) {
        throw new LaboDynamiqueSyntaxeError('Choisis "angle:" OU "omega:" : un pendule conique ne peut pas fixer indépendamment θ et ω (ils sont liés par cos θ = g / (ℓω²)).');
      }
      const params = appliquer(PENDULE_DEFAUT, T_PENDULE, l);
      params.mode = "omega" in l ? "omega" : "angle";
      return { kind: "pendule", params };
    }
    case "monte-charge": {
      const params = appliquer(MONTE_DEFAUT, T_MONTE, lireDirectives(source, T_MONTE));
      if (params.a <= -params.g) {
        throw new LaboDynamiqueSyntaxeError(`"acceleration:" doit être supérieure à −g = ${-params.g} m/s² : sinon la tension du câble serait nulle ou négative (câble détendu, le modèle du câble tendu ne s'applique plus).`);
      }
      return { kind: "monte-charge", params };
    }
    case "vehicule-virage": {
      const l = lireDirectives(source, T_VIRAGE);
      const params = appliquer(VIRAGE_DEFAUT, T_VIRAGE, l);
      params.adherence = "mu" in l;
      return { kind: "virage", params };
    }
    case "solide-sphere":
      return { kind: "sphere", params: appliquer(SPHERE_DEFAUT, T_SPHERE, lireDirectives(source, T_SPHERE)) };
    case "labo-dynamique": {
      let onglet: OngletDynamique = "plan";
      for (const ligneBrute of source.split("\n")) {
        const ligne = ligneBrute.trim();
        if (!ligne || ligne.startsWith("#")) continue;
        const i = ligne.indexOf(":");
        if (i === -1) throw new LaboDynamiqueSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
        const cle = ligne.slice(0, i).trim().toLowerCase();
        const valeur = ligne.slice(i + 1).trim().toLowerCase();
        if (cle !== "onglet") throw new LaboDynamiqueSyntaxeError(`Directive inconnue : « ${cle} » (attendu : onglet).`);
        if (!(ONGLETS_DYNAMIQUE as readonly string[]).includes(valeur)) {
          throw new LaboDynamiqueSyntaxeError(`Onglet inconnu : « ${valeur} » (attendu : ${ONGLETS_DYNAMIQUE.join(", ")}).`);
        }
        onglet = valeur as OngletDynamique;
      }
      return { kind: "labo", onglet };
    }
  }
}

/** Gabarit d'un bloc complet (documentation, tests). */
export const SQUELETTE_LABO_DYNAMIQUE = "\n\n```labo-dynamique\nonglet: plan\n```\n\n";
