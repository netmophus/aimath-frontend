/**
 * Questions du mode « S'exercer » : générées à partir des paramètres COURANTS de la simulation (aucune réponse codée en dur),
 * et vérifiées par les fonctions du moteur physique. Tolérance relative explicite (2 %, ou 0,005 en valeur absolue près de 0).
 */
import { fr } from "@/lib/cinematique";
import {
  TOLERANCE_RELATIVE,
  accelerationAtwood,
  accelerationCentripete,
  accelerationPlan,
  adherenceSuffisante,
  angleDetachement,
  etatPendule,
  forceCentripete,
  frottementMax,
  lireNombre,
  muMinimal,
  poidsMonte,
  reactionNormalePlan,
  reactionSphere,
  sensAtwood,
  situationMonte,
  tensionAtwood,
  tensionCable,
  vitesse2Sphere,
  vitesseMaxAdherence,
  type ParamsAtwood,
  type ParamsMonteCharge,
  type ParamsPendule,
  type ParamsPlan,
  type ParamsSphere,
  type ParamsVirage,
  type SituationMonte,
} from "@/lib/dynamique";

export type Question =
  | { id: string; type: "nombre"; enonce: string; unite: string; attendu: number; tol: number; explication: string }
  | { id: string; type: "choix"; enonce: string; options: string[]; attendu: number; explication: string };

export interface Verdict {
  ok: boolean;
  message: string;
}

const nombre = (id: string, enonce: string, unite: string, attendu: number, explication: string, tol = TOLERANCE_RELATIVE): Question => ({ id, type: "nombre", enonce, unite, attendu, tol, explication });
const choix = (id: string, enonce: string, options: string[], attendu: number, explication: string): Question => ({ id, type: "choix", enonce, options, attendu, explication });

/** Écritures acceptées pour chaque unité (comparaison sans espaces ni casse). */
const UNITES: Record<string, string[]> = {
  "m/s²": ["m/s²", "m/s2", "m/s^2", "m.s-2", "m·s-2", "m.s^-2", "m·s⁻²", "m.s⁻²", "ms-2"],
  "m/s": ["m/s", "m.s-1", "m·s-1", "m.s^-1", "m·s⁻¹", "m.s⁻¹", "ms-1"],
  N: ["n", "newton", "newtons"],
  m: ["m", "metre", "mètre", "metres", "mètres"],
  "rad/s": ["rad/s", "rad.s-1", "rad·s-1", "rad.s^-1", "rad·s⁻¹", "rad.s⁻¹"],
};
export function uniteAcceptee(reste: string, unite: string): boolean {
  const r = reste.replace(/\s+/g, "").toLowerCase();
  if (r === "") return true;
  const liste = (UNITES[unite] ?? [unite]).map((u) => u.toLowerCase());
  return liste.includes(r);
}

export function evaluerReponse(q: Question, saisie: string | number): Verdict {
  if (q.type === "choix") {
    const i = typeof saisie === "number" ? saisie : Number(saisie);
    if (!Number.isInteger(i) || i < 0 || i >= q.options.length) return { ok: false, message: "Choisis une des réponses proposées." };
    return i === q.attendu ? { ok: true, message: `Correct. ${q.explication}` } : { ok: false, message: `Pas tout à fait. ${q.explication}` };
  }
  const texte = String(saisie);
  const lu = lireNombre(texte);
  if (lu === null) return { ok: false, message: "Écris un nombre (la virgule ou le point décimal sont acceptés)." };
  const reste = texte.trim().replace(/\s+/g, "").replace(",", ".").replace(/^[-+−]?\d*\.?\d+(?:e[-+]?\d+)?/i, "");
  if (!uniteAcceptee(reste, q.unite)) return { ok: false, message: `L'unité attendue est ${q.unite}.` };
  const ecart = Math.abs(lu - q.attendu);
  if (ecart <= Math.max(q.tol * Math.abs(q.attendu), 0.005)) {
    return { ok: true, message: `Correct : ${fr(q.attendu, 3)} ${q.unite} (tolérance ${Math.round(q.tol * 100)} %). ${q.explication}` };
  }
  return { ok: false, message: `Pas tout à fait : ta valeur (${fr(lu, 3)} ${q.unite}) s'écarte trop du résultat attendu (tolérance ${Math.round(q.tol * 100)} %). ${q.explication}` };
}

// --- Plan incliné -----------------------------------------------------------------------------------------------

export function questionsPlan(p: ParamsPlan): Question[] {
  const a = accelerationPlan(p);
  const N = reactionNormalePlan(p);
  return [
    nombre("plan-a", `Un solide de masse ${fr(p.m, 3)} kg glisse sans frottement sur un plan incliné de ${fr(p.alpha, 1)}° (g = ${fr(p.g, 2)} m/s²). Calcule son accélération a le long de la pente.`, "m/s²", a, `a = g sin α = ${fr(p.g, 2)} × sin ${fr(p.alpha, 1)}° = ${fr(a, 3)} m/s².`),
    nombre("plan-N", "Calcule la réaction normale N du plan sur le solide.", "N", N, `Perpendiculairement au plan, N − mg cos α = 0, donc N = mg cos α = ${fr(p.m, 3)} × ${fr(p.g, 2)} × cos ${fr(p.alpha, 1)}° = ${fr(N, 3)} N.`),
    choix("plan-masse", "On multiplie la masse par 4 sans changer l'angle. L'accélération du solide…", ["est multipliée par 4", "reste la même", "est divisée par 4", "est multipliée par 2"], 1, "La masse se simplifie dans m a = m g sin α : a = g sin α ne dépend que de l'angle et de g. Seuls le poids et la réaction normale sont multipliés par 4."),
  ];
}

// --- Machine d'Atwood -------------------------------------------------------------------------------------------

export function questionsAtwood(p: ParamsAtwood): Question[] {
  const s = sensAtwood(p);
  const a = accelerationAtwood(p);
  const T = tensionAtwood(p);
  return [
    choix(
      "atw-sens",
      `Avec m₁ = ${fr(p.m1, 3)} kg et m₂ = ${fr(p.m2, 3)} kg, quel est le mouvement du système, initialement au repos ?`,
      ["S₁ descend et S₂ monte", "S₁ monte et S₂ descend", "Les deux masses restent immobiles"],
      s === "S1 descend" ? 0 : s === "S1 monte" ? 1 : 2,
      "Le sens est donné par le signe de m₁ − m₂ : la masse la plus lourde descend ; si les masses sont égales, la résultante motrice est nulle.",
    ),
    nombre("atw-a", `Calcule l'accélération algébrique a de S₁ (positive quand S₁ descend), g = ${fr(p.g, 2)} m/s².`, "m/s²", a, `En additionnant m₁g − T = m₁a et T − m₂g = m₂a : a = (m₁ − m₂) g / (m₁ + m₂) = ${fr(a, 3)} m/s².`),
    nombre("atw-T", "Calcule la tension T du fil.", "N", T, `T = 2 m₁ m₂ g / (m₁ + m₂) = ${fr(T, 3)} N. Elle est la même des deux côtés (fil léger, poulie idéale).`),
  ];
}

// --- Pendule conique --------------------------------------------------------------------------------------------

export function questionsPendule(p: ParamsPendule): Question[] {
  const e = etatPendule(p);
  if (!e.valide) return [];
  return [
    nombre("pen-r", `Pendule conique : ℓ = ${fr(p.l, 3)} m, θ = ${fr(e.theta, 1)}°. Calcule le rayon r du cercle décrit.`, "m", e.r, `r = ℓ sin θ = ${fr(p.l, 3)} × sin ${fr(e.theta, 1)}° = ${fr(e.r, 3)} m.`),
    nombre("pen-w", `Calcule la vitesse angulaire ω (g = ${fr(p.g, 2)} m/s²).`, "rad/s", e.omega, `Verticalement T cos θ = mg ; horizontalement T sin θ = m r ω² ; d'où cos θ = g / (ℓ ω²) et ω = ${fr(e.omega, 3)} rad/s.`),
    nombre("pen-T", `Calcule la tension T du fil (m = ${fr(p.m, 3)} kg).`, "N", e.T, `T cos θ = mg donc T = mg / cos θ = ${fr(e.T, 3)} N.`),
  ];
}

// --- Monte-charge -----------------------------------------------------------------------------------------------

const SITUATIONS: SituationMonte[] = ["immobile", "vitesse constante", "montée accélérée", "montée ralentie", "descente accélérée", "descente ralentie", "arrêt instantané, repart vers le haut", "arrêt instantané, repart vers le bas"];

export function questionsMonte(p: ParamsMonteCharge): Question[] {
  const T = tensionCable(p);
  const sens = Math.abs(p.a) < 1e-9 ? 2 : p.a > 0 ? 0 : 1;
  const sit = situationMonte(p.v0, p.a);
  return [
    choix("mon-sens", `Un monte-charge de ${fr(p.m, 3)} kg a une accélération a = ${fr(p.a, 2)} m/s² (axe vers le haut). Le vecteur accélération est dirigé…`, ["vers le haut", "vers le bas", "il est nul"], sens, "Le sens de l'accélération est donné par le signe de a sur l'axe vertical orienté vers le haut, pas par le sens du mouvement."),
    nombre("mon-T", `Calcule la tension T du câble (g = ${fr(p.g, 2)} m/s²).`, "N", T, `T − mg = ma donc T = m (g + a) = ${fr(p.m, 3)} × (${fr(p.g, 2)} + ${fr(p.a, 2)}) = ${fr(T, 3)} N. Pour comparer : mg = ${fr(poidsMonte(p), 3)} N.`),
    choix("mon-situation", `À t = 0, la vitesse algébrique est v₀ = ${fr(p.v0, 2)} m/s et l'accélération a = ${fr(p.a, 2)} m/s². Le mouvement est…`, SITUATIONS, SITUATIONS.indexOf(sit), "Montée accélérée : v et a positives. Montée ralentie : v > 0 et a < 0. Descente accélérée : v et a négatives. Descente ralentie : v < 0 et a > 0."),
  ];
}

// --- Virage -----------------------------------------------------------------------------------------------------

export function questionsVirage(p: ParamsVirage): Question[] {
  const ac = accelerationCentripete(p);
  const F = forceCentripete(p);
  const ok = adherenceSuffisante(p);
  return [
    nombre("vir-a", `Un véhicule roule à v = ${fr(p.v, 2)} m/s sur un virage de rayon R = ${fr(p.R, 2)} m. Calcule son accélération centripète.`, "m/s²", ac, `a = v² / R = ${fr(p.v, 2)}² / ${fr(p.R, 2)} = ${fr(ac, 3)} m/s², dirigée vers le centre du virage.`),
    nombre("vir-F", `Sa masse est ${fr(p.m, 3)} kg. Calcule la force horizontale nécessaire pour suivre le virage.`, "N", F, `F = m v² / R = ${fr(p.m, 3)} × ${fr(ac, 3)} = ${fr(F, 3)} N. Ce n'est pas une force de plus : c'est la résultante, fournie ici par le frottement de la route.`),
    choix("vir-adh", `Le coefficient d'adhérence est μₛ = ${fr(p.mu, 2)} (g = ${fr(p.g, 2)} m/s²). L'adhérence est-elle suffisante ?`, ["Oui", "Non"], ok ? 0 : 1, `Condition : v ≤ √(μₛ g R) = ${fr(vitesseMaxAdherence(p), 2)} m/s. Ici v = ${fr(p.v, 2)} m/s, et la force maximale vaut μₛ m g = ${fr(frottementMax(p), 1)} N pour ${fr(F, 1)} N nécessaires (μₛ minimal : ${fr(muMinimal(p), 2)}).`),
  ];
}

// --- Sphère -----------------------------------------------------------------------------------------------------

/** Angle (degrés) auquel les questions sont posées : à mi-chemin entre le départ et le détachement. */
export function angleQuestionSphere(p: ParamsSphere): number | null {
  const d = angleDetachement(p);
  if (d === null || d - p.theta0 < 4) return null;
  return Math.round((p.theta0 + d) / 2);
}
export function questionsSphere(p: ParamsSphere): Question[] {
  const tq = angleQuestionSphere(p);
  const qs: Question[] = [];
  if (tq !== null) {
    const v = Math.sqrt(vitesse2Sphere(p, tq));
    const N = reactionSphere(p, tq);
    qs.push(
      nombre("sph-v", `Un solide glisse sans frottement sur une sphère de rayon R = ${fr(p.R, 2)} m (g = ${fr(p.g, 2)} m/s²), parti de θ₀ = ${fr(p.theta0, 1)}° avec v₀ = ${fr(p.v0, 2)} m/s. Calcule sa vitesse quand θ = ${tq}°.`, "m/s", v, `Énergie mécanique conservée : v² = v₀² + 2gR (cos θ₀ − cos θ), donc v = ${fr(v, 3)} m/s.`),
      nombre("sph-N", `Calcule la réaction normale N pour θ = ${tq}° (m = ${fr(p.m, 3)} kg).`, "N", N, `N = mg cos θ − m v² / R = ${fr(N, 3)} N (inférieure à mg = ${fr(p.m * p.g, 3)} N).`),
    );
  }
  qs.push(choix("sph-cond", "Le solide quitte la sphère lorsque…", ["la réaction normale s'annule (N = 0)", "sa vitesse s'annule", "la réaction normale est égale au poids", "il atteint θ = 90°"], 0, "Tant que N > 0, le support pousse le solide. Quand N = 0, le support ne peut plus le retenir : le contact est perdu."));
  const d = angleDetachement(p);
  if (d !== null) qs.push(nombre("sph-d", "Calcule l'angle de détachement θd en degrés.", "°", d, `N = 0 ⇒ cos θd = (2 cos θ₀ + v₀²/(gR)) / 3, soit θd = ${fr(d, 2)}°. Pour θ₀ → 0 et v₀ = 0, on retrouve cos θd = 2/3 (48,2°).`));
  return qs;
}
