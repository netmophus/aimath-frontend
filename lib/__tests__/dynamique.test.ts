import { describe, expect, it } from "vitest";

import {
  ANGLE_LIMITE_IDEAL,
  ATWOOD_DEFAUT,
  MONTE_DEFAUT,
  PENDULE_DEFAUT,
  PLAN_DEFAUT,
  SPHERE_DEFAUT,
  VIRAGE_DEFAUT,
  accelerationAtwood,
  accelerationCentripete,
  accelerationPlan,
  adherenceSuffisante,
  angleDetachement,
  cableTendu,
  compareTension,
  composanteParallele,
  composantePerpendiculaire,
  deg,
  descenteS1,
  dureeAtwood,
  dureeMonte,
  dureePlan,
  etatPendule,
  etatPlan,
  etatSphere,
  etatVirage,
  forceCentripete,
  frottementMax,
  lireNombre,
  longueursBrins,
  muMinimal,
  norme3,
  poidsPlan,
  premierInstantDeplacement,
  produitScalaire3,
  rad,
  reactionNormalePlan,
  reactionSphere,
  rotationPoulie,
  sensAtwood,
  simulerSphere,
  situationMonte,
  tempsArriveePlan,
  tensionAtwood,
  tensionCable,
  verifierNombre,
  vecteursPendule,
  virageRealisable,
  vitesse2Sphere,
  vitesseApresDeplacement,
  vitesseMaxAdherence,
  yMonte,
  vMonte,
  RAYON_POULIE,
} from "@/lib/dynamique";
import { evaluerReponse, questionsAtwood, questionsMonte, questionsPendule, questionsPlan, questionsSphere, questionsVirage, uniteAcceptee } from "@/lib/dynamiqueExercices";

const proche = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe("plan incliné sans frottement", () => {
  it("cas de validation : m = 2 kg, α = 30°, g = 10", () => {
    proche(poidsPlan(PLAN_DEFAUT), 20);
    proche(reactionNormalePlan(PLAN_DEFAUT), 10 * Math.sqrt(3));
    proche(accelerationPlan(PLAN_DEFAUT), 5);
    proche(vitesseApresDeplacement(PLAN_DEFAUT, 5), Math.sqrt(50));
    expect(vitesseApresDeplacement(PLAN_DEFAUT, 5)).toBeCloseTo(7.07, 2);
  });
  it("l'accélération ne dépend pas de la masse ; P et N sont multipliés par 4 quand m passe de 2 à 8 kg", () => {
    const a = { ...PLAN_DEFAUT, m: 8 };
    proche(accelerationPlan(a), accelerationPlan(PLAN_DEFAUT));
    proche(poidsPlan(a), 4 * poidsPlan(PLAN_DEFAUT));
    proche(reactionNormalePlan(a), 4 * reactionNormalePlan(PLAN_DEFAUT));
  });
  it("angle nul : a = 0, N = P, composante parallèle nulle", () => {
    const p = { ...PLAN_DEFAUT, alpha: 0 };
    proche(accelerationPlan(p), 0);
    proche(reactionNormalePlan(p), poidsPlan(p));
    proche(composanteParallele(p), 0);
    expect(tempsArriveePlan(p)).toBeNull();
    expect(dureePlan(p)).toBe(4);
  });
  it("angle nul avec vitesse initiale : mouvement uniforme jusqu'au bout du plan", () => {
    const p = { ...PLAN_DEFAUT, alpha: 0, v0: 2, distance: 6 };
    proche(tempsArriveePlan(p)!, 3);
  });
  it("l'accélération croît avec l'angle ; Px et Py recomposent le poids", () => {
    let prec = -1;
    for (const alpha of [0, 10, 20, 45, 75]) {
      const p = { ...PLAN_DEFAUT, alpha };
      expect(accelerationPlan(p)).toBeGreaterThan(prec);
      prec = accelerationPlan(p);
      proche(Math.hypot(composanteParallele(p), composantePerpendiculaire(p)), poidsPlan(p));
      proche(composantePerpendiculaire(p), -reactionNormalePlan(p));
    }
  });
  it("le solide s'arrête à l'extrémité du plan et ne la dépasse jamais", () => {
    const ta = tempsArriveePlan(PLAN_DEFAUT)!;
    proche(ta, Math.sqrt(2));
    proche(etatPlan(PLAN_DEFAUT, ta).d, 5);
    const apres = etatPlan(PLAN_DEFAUT, ta + 10);
    expect(apres.d).toBeLessThanOrEqual(5 + 1e-9);
    expect(apres.arrive).toBe(true);
    expect(etatPlan(PLAN_DEFAUT, 0.5).arrive).toBe(false);
  });
  it("v² = v0² + 2ad avec vitesse initiale, et g variable", () => {
    const p = { ...PLAN_DEFAUT, v0: 3, g: 5 };
    proche(vitesseApresDeplacement(p, 4), Math.sqrt(9 + 2 * accelerationPlan(p) * 4));
  });
});

describe("machine d'Atwood", () => {
  it("cas de référence : a = 2,45 m/s² et T = 3,675 N", () => {
    proche(accelerationAtwood(ATWOOD_DEFAUT), 2.45);
    proche(tensionAtwood(ATWOOD_DEFAUT), 3.675);
    expect(sensAtwood(ATWOOD_DEFAUT)).toBe("S1 descend");
  });
  it("masses égales : pas de mouvement, T = mg", () => {
    const p = { ...ATWOOD_DEFAUT, m1: 0.4, m2: 0.4 };
    proche(accelerationAtwood(p), 0);
    proche(tensionAtwood(p), 0.4 * 9.8);
    expect(sensAtwood(p)).toBe("equilibre");
    proche(descenteS1(p, 3), 0);
    expect(dureeAtwood(p)).toBe(3);
  });
  it("masses inversées : accélération algébrique opposée, même tension, S1 monte", () => {
    const q = { ...ATWOOD_DEFAUT, m1: 0.3, m2: 0.5 };
    proche(accelerationAtwood(q), -2.45);
    proche(tensionAtwood(q), tensionAtwood(ATWOOD_DEFAUT));
    expect(sensAtwood(q)).toBe("S1 monte");
    expect(descenteS1(q, 1)).toBeLessThan(0);
  });
  it("la tension est identique dans les deux branches (elle vérifie les deux équations de projection)", () => {
    const p = ATWOOD_DEFAUT;
    const a = accelerationAtwood(p);
    const T = tensionAtwood(p);
    proche(p.m1 * p.g - T, p.m1 * a);
    proche(T - p.m2 * p.g, p.m2 * a);
    expect(T).toBeLessThan(Math.max(p.m1, p.m2) * p.g);
    expect(T).toBeGreaterThan(Math.min(p.m1, p.m2) * p.g);
  });
  it("les brins restent de longueur totale constante ; 10 cm de descente = 10 cm de montée", () => {
    const L0 = 100;
    for (const t of [0, 0.2, 0.5]) {
      const { l1, l2 } = longueursBrins(ATWOOD_DEFAUT, t, L0);
      proche(l1 + l2, 2 * L0);
    }
    const t10 = Math.sqrt((2 * 0.1) / accelerationAtwood(ATWOOD_DEFAUT));
    proche(descenteS1(ATWOOD_DEFAUT, t10), 0.1);
    proche(longueursBrins(ATWOOD_DEFAUT, t10, 1).l1 - 1, 1 - longueursBrins(ATWOOD_DEFAUT, t10, 1).l2);
  });
  it("la poulie tourne de s/R sans glissement", () => {
    proche(rotationPoulie(ATWOOD_DEFAUT, 0.3) * RAYON_POULIE, descenteS1(ATWOOD_DEFAUT, 0.3));
    proche(rotationPoulie(ATWOOD_DEFAUT, 0.3, 0.05) * 0.05, descenteS1(ATWOOD_DEFAUT, 0.3));
  });
  it("durée : la course disponible est atteinte à t = √(2h/|a|)", () => {
    proche(dureeAtwood(ATWOOD_DEFAUT), Math.sqrt((2 * ATWOOD_DEFAUT.course) / 2.45));
  });
});

describe("pendule conique", () => {
  it("cas de référence : r = 0,25 m, ω ≈ 4,806 rad/s, v ≈ 1,201 m/s, T ≈ 1,155 N", () => {
    const e = etatPendule(PENDULE_DEFAUT);
    expect(e.valide).toBe(true);
    if (!e.valide) return;
    proche(e.r, 0.25);
    expect(e.omega).toBeCloseTo(4.806, 3);
    expect(e.v).toBeCloseTo(1.201, 3);
    expect(e.T).toBeCloseTo(1.155, 3);
  });
  it("les projections du théorème sont vérifiées : T cos θ = mg et T sin θ = m r ω²", () => {
    for (const theta of [10, 30, 45, 60, 80]) {
      const p = { ...PENDULE_DEFAUT, theta };
      const e = etatPendule(p);
      if (!e.valide) throw new Error("invalide");
      proche(e.T * Math.cos(rad(theta)), p.m * p.g, 1e-9);
      proche(e.T * Math.sin(rad(theta)), p.m * e.r * e.omega ** 2, 1e-9);
      proche(e.a, p.g * Math.tan(rad(theta)), 1e-9);
    }
  });
  it("mode ω : retrouve l'angle, et les deux modes sont cohérents", () => {
    const e = etatPendule(PENDULE_DEFAUT);
    if (!e.valide) throw new Error("invalide");
    const f = etatPendule({ ...PENDULE_DEFAUT, mode: "omega", omega: e.omega });
    if (!f.valide) throw new Error("invalide");
    proche(f.theta, 30, 1e-9);
    proche(f.T, e.T, 1e-9);
  });
  it("rejette les configurations incompatibles avec un message en français, sans NaN ni infini", () => {
    const sous = etatPendule({ ...PENDULE_DEFAUT, mode: "omega", omega: 3 });
    expect(sous.valide).toBe(false);
    if (!sous.valide) {
      expect(sous.raison).toMatch(/pas de configuration conique/);
      expect(sous.raison).toMatch(/4,47/);
    }
    expect(etatPendule({ ...PENDULE_DEFAUT, mode: "omega", omega: Math.sqrt(20) }).valide).toBe(false); // ℓω² = g exactement
    expect(etatPendule({ ...PENDULE_DEFAUT, theta: 90 }).valide).toBe(false);
    expect(etatPendule({ ...PENDULE_DEFAUT, theta: 0 }).valide).toBe(false);
    expect(etatPendule({ ...PENDULE_DEFAUT, mode: "omega", omega: -2 }).valide).toBe(false);
    expect(vecteursPendule({ ...PENDULE_DEFAUT, mode: "omega", omega: 3 }, 0)).toBeNull();
  });
  it("orientation des vecteurs : fil de longueur constante, v ⟂ a, a vers I, P + T = m a", () => {
    const p = PENDULE_DEFAUT;
    for (const t of [0, 0.13, 0.5, 0.97, 2.2]) {
      const v = vecteursPendule(p, t)!;
      proche(norme3(v.pos), p.l, 1e-9);
      proche(produitScalaire3(v.vitesse, v.acceleration), 0, 1e-9);
      const versI = { x: v.centre.x - v.pos.x, y: v.centre.y - v.pos.y, z: v.centre.z - v.pos.z };
      proche(produitScalaire3(versI, v.acceleration) / (norme3(versI) * norme3(v.acceleration)), 1, 1e-9); // même sens
      proche(v.acceleration.z, 0, 1e-12);
      proche(v.poids.x + v.tension.x, p.m * v.acceleration.x, 1e-9);
      proche(v.poids.y + v.tension.y, p.m * v.acceleration.y, 1e-9);
      proche(v.poids.z + v.tension.z, p.m * v.acceleration.z, 1e-9);
      // la tension suit le fil vers O (opposée au vecteur OG)
      proche(produitScalaire3(v.tension, v.pos) / (norme3(v.tension) * norme3(v.pos)), -1, 1e-9);
    }
  });
});

describe("monte-charge", () => {
  it("T = m(g + a) selon le signe de a", () => {
    proche(tensionCable(MONTE_DEFAUT), 5500);
    expect(compareTension(MONTE_DEFAUT)).toBe("T > P");
    const zero = { ...MONTE_DEFAUT, a: 0 };
    proche(tensionCable(zero), 5000);
    expect(compareTension(zero)).toBe("T = P");
    const bas = { ...MONTE_DEFAUT, a: -4 };
    proche(tensionCable(bas), 3000);
    expect(compareTension(bas)).toBe("T < P");
  });
  it("câble détendu : T ≤ 0 ⇔ a ≤ −g, signalé par cableTendu", () => {
    expect(cableTendu({ ...MONTE_DEFAUT, a: -9.9 })).toBe(true);
    expect(cableTendu({ ...MONTE_DEFAUT, a: -10 })).toBe(false);
    expect(cableTendu({ ...MONTE_DEFAUT, a: -12 })).toBe(false);
    expect(tensionCable({ ...MONTE_DEFAUT, a: -12 })).toBeLessThan(0);
  });
  it("le sens du mouvement et celui de l'accélération sont indépendants", () => {
    expect(situationMonte(3, 1)).toBe("montée accélérée");
    expect(situationMonte(3, -1)).toBe("montée ralentie");
    expect(situationMonte(-3, -1)).toBe("descente accélérée");
    expect(situationMonte(-3, 1)).toBe("descente ralentie");
    expect(situationMonte(2, 0)).toBe("vitesse constante");
    expect(situationMonte(0, 0)).toBe("immobile");
    expect(situationMonte(0, 2)).toMatch(/haut/);
    expect(situationMonte(0, -2)).toMatch(/bas/);
  });
  it("montée ralentie : monte puis s'arrête puis redescend ; T < P tout du long", () => {
    const p = { ...MONTE_DEFAUT, v0: 4, a: -2 };
    expect(vMonte(p, 1)).toBeGreaterThan(0);
    expect(vMonte(p, 3)).toBeLessThan(0);
    proche(yMonte(p, 2), p.hauteur / 2 + 4); // arrêt à t = 2 s : z = 10 + 4
    expect(tensionCable(p)).toBeLessThan(p.m * p.g);
  });
  it("durée : sortie de la gaine, ou 8 s si la cabine reste immobile", () => {
    expect(dureeMonte({ ...MONTE_DEFAUT, a: 0, v0: 0 })).toBe(8);
    const p = { ...MONTE_DEFAUT, a: 2, v0: 0 };
    proche(yMonte(p, dureeMonte(p)), p.hauteur, 1e-9);
    const q = { ...MONTE_DEFAUT, a: -2, v0: -2 };
    proche(yMonte(q, dureeMonte(q)), 0, 1e-9);
  });
  it("premierInstantDeplacement gère les cas dégénérés", () => {
    expect(premierInstantDeplacement(0, 0, 5)).toBeNull();
    proche(premierInstantDeplacement(0, 2, 6)!, 3);
    expect(premierInstantDeplacement(-1, 1, 10)).toBeNull();
  });
});

describe("véhicule dans un virage", () => {
  it("a = v²/R : dépendance quadratique en v et inverse en R", () => {
    const p = VIRAGE_DEFAUT;
    proche(accelerationCentripete(p), 4.5);
    proche(accelerationCentripete({ ...p, v: 2 * p.v }), 4 * accelerationCentripete(p));
    proche(accelerationCentripete({ ...p, R: 2 * p.R }), accelerationCentripete(p) / 2);
  });
  it("force centripète F = m v²/R, proportionnelle à la masse", () => {
    proche(forceCentripete(VIRAGE_DEFAUT), 4500);
    proche(forceCentripete({ ...VIRAGE_DEFAUT, m: 2000 }), 9000);
  });
  it("condition d'adhérence v ≤ √(μ g R), indépendante de la masse", () => {
    const p = { ...VIRAGE_DEFAUT, adherence: true };
    proche(vitesseMaxAdherence(p), Math.sqrt(0.7 * 10 * 50));
    expect(adherenceSuffisante(p)).toBe(true);
    expect(adherenceSuffisante({ ...p, m: 5000 })).toBe(true);
    expect(adherenceSuffisante({ ...p, v: vitesseMaxAdherence(p) * 1.01 })).toBe(false);
    expect(adherenceSuffisante({ ...p, v: vitesseMaxAdherence(p) * 0.99 })).toBe(true);
    proche(frottementMax(p), 0.7 * 1000 * 10);
    proche(muMinimal(p), 225 / 500);
  });
  it("vitesse trop élevée : le virage n'est plus réalisable (si l'adhérence est testée)", () => {
    const p = { ...VIRAGE_DEFAUT, adherence: true, v: 25, mu: 0.5 };
    expect(virageRealisable(p)).toBe(false);
    expect(virageRealisable({ ...p, adherence: false })).toBe(true);
  });
  it("vitesse de norme constante mais accélération non nulle, dirigée vers le centre et ⟂ v", () => {
    for (const t of [0, 1, 3.7, 10]) {
      const e = etatVirage(VIRAGE_DEFAUT, t);
      proche(Math.hypot(e.vitesse.x, e.vitesse.y), 15, 1e-9);
      proche(Math.hypot(e.acceleration.x, e.acceleration.y), 4.5, 1e-9);
      proche(e.vitesse.x * e.acceleration.x + e.vitesse.y * e.acceleration.y, 0, 1e-9);
      proche(e.acceleration.x * e.pos.x + e.acceleration.y * e.pos.y, -4.5 * 50, 1e-9); // a ∥ −OM
      proche(Math.hypot(e.pos.x, e.pos.y), 50, 1e-9);
    }
  });
});

describe("solide glissant sur une sphère", () => {
  const ideal = { ...SPHERE_DEFAUT, theta0: 0.001 };
  it("N = mg(3cosθ − 2) pour un départ du sommet sans vitesse", () => {
    const p = { ...SPHERE_DEFAUT, theta0: 0 };
    for (const th of [0, 10, 30, 48.19]) proche(reactionSphere(p, th), p.m * p.g * (3 * Math.cos(rad(th)) - 2), 1e-9);
    proche(reactionSphere(p, 0), p.m * p.g, 1e-9);
  });
  it("angle limite idéal : cos θ = 2/3, soit 48,19°", () => {
    proche(ANGLE_LIMITE_IDEAL, deg(Math.acos(2 / 3)), 1e-12);
    expect(ANGLE_LIMITE_IDEAL).toBeCloseTo(48.19, 2);
    expect(angleDetachement({ ...SPHERE_DEFAUT, theta0: 0 })!).toBeCloseTo(48.19, 2);
  });
  it("avec une perturbation θ0 > 0, l'angle de détachement diffère légèrement du cas idéal", () => {
    const d1 = angleDetachement(SPHERE_DEFAUT)!; // θ0 = 1°
    expect(d1).not.toBeCloseTo(ANGLE_LIMITE_IDEAL, 4);
    expect(Math.abs(d1 - ANGLE_LIMITE_IDEAL)).toBeLessThan(0.1);
    const d20 = angleDetachement({ ...SPHERE_DEFAUT, theta0: 20 })!;
    expect(d20).toBeGreaterThan(d1);
    expect(angleDetachement({ ...SPHERE_DEFAUT, theta0: 0, v0: 1 })!).toBeLessThan(ANGLE_LIMITE_IDEAL);
  });
  it("conservation de l'énergie mécanique en contact", () => {
    const p = { ...SPHERE_DEFAUT, theta0: 5, v0: 0.5 };
    const E = (th: number) => 0.5 * p.m * vitesse2Sphere(p, th) + p.m * p.g * p.R * Math.cos(rad(th));
    proche(E(5), E(20), 1e-9);
    proche(E(5), E(40), 1e-9);
  });
  it("l'intégration RK4 est cohérente avec l'énergie : R·dθ/dt = v", () => {
    const tr = simulerSphere(SPHERE_DEFAUT);
    const c = tr.contact;
    for (const i of [Math.floor(c.length * 0.3), Math.floor(c.length * 0.6), c.length - 3]) {
      const dtheta = rad(c[i + 1].theta - c[i - 1].theta) / (c[i + 1].t - c[i - 1].t);
      const v = Math.sqrt(vitesse2Sphere(SPHERE_DEFAUT, c[i].theta));
      expect(Math.abs(SPHERE_DEFAUT.R * dtheta - v) / v).toBeLessThan(0.01);
    }
  });
  it("N reste ≥ 0 tant que le contact dure, et s'annule au détachement ; ensuite N = 0", () => {
    const p = SPHERE_DEFAUT;
    const tr = simulerSphere(p);
    expect(tr.immediat).toBe(false);
    for (let k = 0; k <= 100; k++) {
      const e = etatSphere(p, tr, (tr.tD * k) / 100 - (k === 100 ? 1e-6 : 0));
      expect(e.N).toBeGreaterThanOrEqual(-1e-6);
    }
    proche(reactionSphere(p, tr.thetaD), 0, 1e-6);
    expect(etatSphere(p, tr, tr.tD + 0.1).N).toBe(0);
    expect(etatSphere(p, tr, tr.tD + 0.1).enContact).toBe(false);
  });
  it("transition continue en position et en vitesse au détachement", () => {
    const p = SPHERE_DEFAUT;
    const tr = simulerSphere(p);
    const e = 1e-4;
    const avant = etatSphere(p, tr, tr.tD - e);
    const apres = etatSphere(p, tr, tr.tD + e);
    expect(avant.enContact).toBe(true);
    expect(apres.enContact).toBe(false);
    proche(avant.pos.x, apres.pos.x, 1e-3);
    proche(avant.pos.y, apres.pos.y, 1e-3);
    proche(avant.vitesse.x, apres.vitesse.x, 2e-3);
    proche(avant.vitesse.y, apres.vitesse.y, 2e-3);
    proche(Math.hypot(tr.position.x, tr.position.y), p.R, 1e-9);
    proche(Math.hypot(tr.vitesse.x, tr.vitesse.y), tr.vD, 1e-9);
    // la vitesse au détachement est tangente : v ⟂ rayon
    proche(tr.vitesse.x * tr.position.x + tr.vitesse.y * tr.position.y, 0, 1e-9);
  });
  it("après le détachement : projectile (a = g), le solide ne traverse jamais la sphère et atteint le sol", () => {
    for (const p of [SPHERE_DEFAUT, { ...SPHERE_DEFAUT, theta0: 20 }, { ...SPHERE_DEFAUT, v0: 1.5 }, { ...SPHERE_DEFAUT, v0: 6, theta0: 10 }]) {
      const tr = simulerSphere(p);
      let minDist = Infinity;
      for (let k = 0; k <= 400; k++) {
        const e = etatSphere(p, tr, tr.tD + (tr.tVol * k) / 400);
        minDist = Math.min(minDist, Math.hypot(e.pos.x, e.pos.y));
      }
      expect(minDist).toBeGreaterThanOrEqual(p.R - 1e-6);
      const fin = etatSphere(p, tr, tr.duree + 1);
      proche(fin.pos.y, -p.R, 1e-6);
      expect(fin.au_sol).toBe(true);
    }
    const p = SPHERE_DEFAUT;
    const tr = simulerSphere(p);
    const a = etatSphere(p, tr, tr.tD + 0.2).vitesse.y - etatSphere(p, tr, tr.tD + 0.1).vitesse.y;
    proche(a / 0.1, -p.g, 1e-9);
    proche(etatSphere(p, tr, tr.tD + 0.2).vitesse.x, tr.vitesse.x, 1e-12);
  });
  it("vitesse initiale trop grande : le solide décolle dès le départ", () => {
    const p = { ...SPHERE_DEFAUT, theta0: 1, v0: 8 };
    expect(angleDetachement(p)).toBeNull();
    const tr = simulerSphere(p);
    expect(tr.immediat).toBe(true);
    expect(tr.tD).toBe(0);
    expect(etatSphere(p, tr, 0.2).enContact).toBe(false);
  });
  it("le détachement idéal est atteint pour θ0 → 0 (temps long mais fini)", () => {
    const tr = simulerSphere(ideal);
    expect(tr.thetaD).toBeCloseTo(ANGLE_LIMITE_IDEAL, 2);
    expect(tr.tD).toBeGreaterThan(2);
    expect(tr.tD).toBeLessThan(10);
  });
});

describe("réponses et exercices", () => {
  it("lecture de nombres : virgule, point, unité", () => {
    expect(lireNombre("5")).toBe(5);
    expect(lireNombre(" 2,45 m/s² ")).toBe(2.45);
    expect(lireNombre("-3.5")).toBe(-3.5);
    expect(lireNombre("abc")).toBeNull();
    expect(lireNombre("")).toBeNull();
  });
  it("tolérance relative explicite de 2 %", () => {
    expect(verifierNombre("5,05", 5).ok).toBe(true);
    expect(verifierNombre("5,2", 5).ok).toBe(false);
    expect(verifierNombre("0,003", 0).ok).toBe(true); // tolérance absolue près de zéro
    expect(verifierNombre("x", 5).ok).toBe(false);
  });
  it("unités acceptées ou refusées", () => {
    expect(uniteAcceptee("m/s2", "m/s²")).toBe(true);
    expect(uniteAcceptee("N", "N")).toBe(true);
    expect(uniteAcceptee("", "N")).toBe(true);
    expect(uniteAcceptee("kg", "N")).toBe(false);
  });
  it("les questions sont générées à partir des paramètres (aucune réponse figée)", () => {
    const a1 = questionsPlan(PLAN_DEFAUT);
    const a2 = questionsPlan({ ...PLAN_DEFAUT, alpha: 45, m: 5 });
    expect(a1).toHaveLength(3);
    if (a1[0].type === "nombre" && a2[0].type === "nombre") expect(a1[0].attendu).not.toBeCloseTo(a2[0].attendu, 3);
    for (const qs of [questionsAtwood(ATWOOD_DEFAUT), questionsPendule(PENDULE_DEFAUT), questionsMonte(MONTE_DEFAUT), questionsVirage(VIRAGE_DEFAUT), questionsSphere(SPHERE_DEFAUT)]) {
      expect(qs.length).toBeGreaterThanOrEqual(3);
    }
    expect(questionsPendule({ ...PENDULE_DEFAUT, mode: "omega", omega: 3 })).toEqual([]);
  });
  it("les bonnes réponses calculées par le moteur sont validées, les mauvaises refusées avec une explication", () => {
    const q = questionsPlan(PLAN_DEFAUT)[0];
    expect(evaluerReponse(q, "5").ok).toBe(true);
    expect(evaluerReponse(q, "5,0 m/s²").ok).toBe(true);
    expect(evaluerReponse(q, "5 N").ok).toBe(false);
    const faux = evaluerReponse(q, "8,66");
    expect(faux.ok).toBe(false);
    expect(faux.message).toMatch(/g sin α/);
    const choix = questionsPlan(PLAN_DEFAUT)[2];
    expect(evaluerReponse(choix, 1).ok).toBe(true);
    expect(evaluerReponse(choix, 0).ok).toBe(false);
    expect(evaluerReponse(choix, 9).ok).toBe(false);
    const qa = questionsAtwood(ATWOOD_DEFAUT);
    expect(evaluerReponse(qa[0], 0).ok).toBe(true);
    expect(evaluerReponse(qa[1], "2,45").ok).toBe(true);
    expect(evaluerReponse(qa[2], "3,675").ok).toBe(true);
    const qm = questionsMonte(MONTE_DEFAUT);
    expect(evaluerReponse(qm[0], 0).ok).toBe(true);
    expect(evaluerReponse(qm[1], "5500").ok).toBe(true);
    const qv = questionsVirage({ ...VIRAGE_DEFAUT, v: 25, mu: 0.5 });
    expect(evaluerReponse(qv[2], 1).ok).toBe(true); // "Non" : adhérence insuffisante
    const qs = questionsSphere(SPHERE_DEFAUT);
    expect(qs.some((x) => x.id === "sph-cond")).toBe(true);
  });
});
