import { describe, expect, it } from "vitest";

import {
  EXEMPLES_FRENET,
  EXEMPLES_HODOGRAPHE,
  EXEMPLES_MCU,
  EXEMPLES_MRUV,
  EXEMPLES_REFERENTIELS,
  accelerationTroisPoints,
  accelerationVitessesCentrees,
  bornesMRUV,
  deplacementMRUV,
  difference,
  distanceParcourueMRUV,
  distancesSuccessives,
  ecartVecteurs,
  etatFrenet,
  etatMCU,
  etatReferentiels,
  fr,
  instantArret,
  mesuresTrace,
  mouvementChrono,
  mouvementHodographe,
  mouvementMCU,
  mouvementMRU,
  mouvementMRUV,
  natureHodographe,
  natureMRUV,
  norme,
  periodeEtFrequence,
  pointsHodographe,
  positionMRUV,
  positionsChrono,
  rayonHodographeMCU,
  vitesseCentree,
  vitesseMRUV,
  vitesseMoyenneIntervalle,
  type ParamsFrenet,
  type ParamsHodographe,
  type TypeChrono,
} from "../cinematique";

const proche = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe("MRU / MRUV", () => {
  it("MRU x0=4 v0=3 a=0 à t=4", () => {
    const p = { x0: 4, v0: 3, a: 0 };
    expect(positionMRUV(p, 4)).toBe(16);
    expect(vitesseMRUV(p, 4)).toBe(3);
    expect(instantArret(p)).toBeNull();
    expect(natureMRUV(p, 4)).toBe("uniforme");
  });

  it("freinage x0=0 v0=15 a=-3", () => {
    const p = { x0: 0, v0: 15, a: -3 };
    expect(instantArret(p)).toBe(5);
    expect(positionMRUV(p, 5)).toBe(37.5);
    expect(distanceParcourueMRUV(p, 5)).toBe(37.5);
    expect(positionMRUV(p, 1)).toBe(13.5);
    expect(positionMRUV(p, 2)).toBe(24);
    expect(positionMRUV(p, 3)).toBe(31.5);
    expect(distancesSuccessives(p, 3)).toEqual([13.5, 10.5, 7.5]);
    const d = distancesSuccessives(p, 5);
    for (let i = 1; i < 5; i++) proche(d[i] - d[i - 1], -3);
    expect(natureMRUV(p, 1)).toBe("retarde");
  });

  it("changement de sens x0=0 v0=2 a=-1 : distance ≠ déplacement", () => {
    const p = { x0: 0, v0: 2, a: -1 };
    expect(instantArret(p)).toBe(2);
    expect(positionMRUV(p, 2)).toBe(2);
    expect(positionMRUV(p, 4)).toBe(0);
    expect(deplacementMRUV(p, 4)).toBe(0);
    expect(distanceParcourueMRUV(p, 4)).toBe(4);
    expect(vitesseMRUV(p, 3)).toBe(-1);
    expect(natureMRUV(p, 3)).toBe("accelere");
    expect(natureMRUV(p, 1)).toBe("retarde");
  });

  it("distance sur un intervalle quelconque et à bornes inversées", () => {
    const p = { x0: 0, v0: 2, a: -1 };
    proche(distanceParcourueMRUV(p, 3, 1), 0.5 + 0.5); // 1→2 : 0,5 ; 2→3 : 0,5
    expect(distanceParcourueMRUV(p, 1, 3)).toBeCloseTo(1, 12);
    expect(distanceParcourueMRUV({ x0: 0, v0: -2, a: 1 }, 4)).toBe(4);
  });

  it("l'accélération non nulle sans arrêt futur ne donne pas d'instant d'arrêt", () => {
    expect(instantArret({ x0: 0, v0: 0, a: 2 })).toBeNull();
    expect(instantArret({ x0: 0, v0: 3, a: 1 })).toBeNull();
    expect(instantArret({ x0: 0, v0: -3, a: 1 })).toBe(3);
  });

  it("bornes : l'origine reste incluse et les positions négatives restent négatives", () => {
    const b = bornesMRUV({ x0: -10, v0: -2, a: 0 }, 5);
    expect(b.min).toBe(-20);
    expect(b.max).toBe(0);
    const b2 = bornesMRUV({ x0: 0, v0: 2, a: -1 }, 6);
    expect(b2.min).toBe(-6 + 0); // x(6) = 12 − 18 = −6
    expect(b2.max).toBe(2);
  });

  it("les exemples prédéfinis sont ceux du cahier des charges", () => {
    const [mru, acc, frein, sens] = EXEMPLES_MRUV;
    expect([mru.x0, mru.v0, mru.a]).toEqual([4, 3, 0]);
    expect([acc.x0, acc.v0, acc.a]).toEqual([0, 0, 2]);
    expect([frein.x0, frein.v0, frein.a]).toEqual([0, 15, -3]);
    expect([sens.x0, sens.v0, sens.a]).toEqual([0, 2, -1]);
  });
});

describe("Mouvement circulaire uniforme", () => {
  it("R=0,5 ω=2 : v=1, a=2", () => {
    const e = etatMCU({ R: 0.5, omega: 2, theta0: 0 }, 1.234);
    proche(e.v, 1);
    proche(e.a, 2);
    proche(norme(e.vitesse), 1);
    proche(norme(e.acceleration), 2);
  });

  it("R=0,5 ω=4 : v=2, a=8 ; ω doublé ⇒ v ×2 et a ×4", () => {
    const e1 = etatMCU({ R: 0.5, omega: 2, theta0: 0 }, 0);
    const e2 = etatMCU({ R: 0.5, omega: 4, theta0: 0 }, 0);
    proche(e2.v, 2);
    proche(e2.a, 8);
    proche(e2.v / e1.v, 2);
    proche(e2.a / e1.a, 4);
  });

  it("ω négatif : sens indirect, v positive, vitesse algébrique négative", () => {
    const p = { R: 2, omega: -3, theta0: 0 };
    const e = etatMCU(p, 0);
    expect(e.v).toBe(6);
    expect(e.vitesseAlgebrique).toBe(-6);
    expect(e.vitesse.y).toBeCloseTo(-6, 12); // en θ=0, e_θ = (0,1), v⃗ = Rω e_θ pointe vers le bas
    const e1 = etatMCU(p, 0.1);
    expect(e1.theta).toBeLessThan(0);
  });

  it("ω = 0 : mobile immobile, période non définie", () => {
    const p = { R: 1, omega: 0, theta0: 0.7 };
    const e = etatMCU(p, 5);
    expect(e.v).toBe(0);
    expect(e.a).toBe(0);
    expect(e.position.x).toBeCloseTo(Math.cos(0.7), 12);
    expect(periodeEtFrequence(0)).toBeNull();
  });

  it("angle initial non nul", () => {
    const e = etatMCU({ R: 2, omega: 1, theta0: Math.PI / 2 }, 0);
    expect(e.position.x).toBeCloseTo(0, 12);
    expect(e.position.y).toBeCloseTo(2, 12);
    expect(e.vitesse.x).toBeCloseTo(-2, 12);
    expect(e.acceleration.y).toBeCloseTo(-2, 12);
  });

  it("période et fréquence", () => {
    const r = periodeEtFrequence(2);
    expect(r).not.toBeNull();
    proche(r!.T, Math.PI);
    proche(r!.f, 1 / Math.PI);
    proche(periodeEtFrequence(-2)!.T, Math.PI);
  });

  it("vitesse ⟂ rayon, accélération opposée au rayon, a = dv/dt (dérivation numérique)", () => {
    const p = { R: 1.7, omega: -2.3, theta0: 0.4 };
    const e = etatMCU(p, 0.9);
    proche(e.vitesse.x * e.position.x + e.vitesse.y * e.position.y, 0, 1e-12);
    proche(e.acceleration.x, -p.omega * p.omega * e.position.x, 1e-12);
    const h = 1e-6;
    const a = etatMCU(p, 0.9 + h).vitesse;
    const b = etatMCU(p, 0.9 - h).vitesse;
    proche((a.x - b.x) / (2 * h), e.acceleration.x, 1e-5);
    proche((a.y - b.y) / (2 * h), e.acceleration.y, 1e-5);
  });

  it("exemples prédéfinis", () => {
    expect(EXEMPLES_MCU[0].R).toBe(0.5);
    expect(EXEMPLES_MCU[0].omega).toBe(2);
    expect(EXEMPLES_MCU[1].omega).toBe(4);
  });
});

describe("Repère de Frenet", () => {
  const base: ParamsFrenet = { mode: "normale", Rc: 4, v0: 2, aT: 5, s0: 0 };

  it("MCU : aT = 0 (même si aT réglé), aN = v²/R", () => {
    const e = etatFrenet(base, 1.3);
    expect(e.aT).toBe(0);
    proche(e.aN, 4 / 4);
    proche(norme(e.acceleration), e.aN);
    proche(e.v, 2);
  });

  it("la normale est orientée vers le centre de courbure", () => {
    const e = etatFrenet({ ...base, mode: "composee", aT: 0.7 }, 2.1);
    expect(e.N).not.toBeNull();
    expect(e.centre).not.toBeNull();
    const versCentre = difference(e.centre!, e.position);
    proche(e.N!.x, versCentre.x / norme(versCentre), 1e-12);
    proche(e.N!.y, versCentre.y / norme(versCentre), 1e-12);
    proche(e.T.x * e.N!.x + e.T.y * e.N!.y, 0, 1e-12);
  });

  it("cohérence cartésien / Frenet : a⃗ = dv⃗/dt, a⃗·T = aT, a⃗·N = aN", () => {
    const p: ParamsFrenet = { mode: "composee", Rc: 3, v0: 1, aT: 0.8, s0: 0.5 };
    const t = 1.7;
    const e = etatFrenet(p, t);
    const h = 1e-6;
    const vp = etatFrenet(p, t + h).vitesse;
    const vm = etatFrenet(p, t - h).vitesse;
    proche((vp.x - vm.x) / (2 * h), e.acceleration.x, 1e-5);
    proche((vp.y - vm.y) / (2 * h), e.acceleration.y, 1e-5);
    proche(e.acceleration.x * e.T.x + e.acceleration.y * e.T.y, e.aT, 1e-12);
    proche(e.acceleration.x * e.N!.x + e.acceleration.y * e.N!.y, e.aN, 1e-12);
    // la vitesse cartésienne est bien celle de la position : v⃗ = dr/dt
    const rp = etatFrenet(p, t + h).position;
    const rm = etatFrenet(p, t - h).position;
    proche((rp.x - rm.x) / (2 * h), e.vitesse.x, 1e-5);
    proche((rp.y - rm.y) / (2 * h), e.vitesse.y, 1e-5);
  });

  it("tangentielle seule : trajectoire rectiligne, aN = 0, pas de normale", () => {
    const e = etatFrenet({ mode: "tangentielle", Rc: 4, v0: 1, aT: 2, s0: 0 }, 3);
    expect(e.N).toBeNull();
    expect(e.centre).toBeNull();
    expect(e.aN).toBe(0);
    expect(e.v).toBe(7);
    expect(e.position.x).toBe(1 * 3 + 0.5 * 2 * 9);
    expect(e.position.y).toBe(0);
  });

  it("vitesse nulle : vecteur vitesse nul, aN = 0, T reste défini par la trajectoire", () => {
    const e = etatFrenet({ mode: "composee", Rc: 2, v0: 0, aT: 1, s0: 0 }, 0);
    expect(norme(e.vitesse)).toBe(0);
    expect(e.aN).toBe(0);
    expect(norme(e.T)).toBeCloseTo(1, 12);
  });

  it("vitesse algébrique négative : v⃗ = v·T opposé à T, aN reste positive", () => {
    const e = etatFrenet({ mode: "composee", Rc: 2, v0: 3, aT: -2, s0: 0 }, 2);
    expect(e.v).toBe(-1);
    expect(e.aN).toBeCloseTo(0.5, 12);
    expect(e.vitesse.x * e.T.x + e.vitesse.y * e.T.y).toBeCloseTo(-1, 12);
  });

  it("exemples prédéfinis cohérents avec leur mode", () => {
    const [t, n, c] = EXEMPLES_FRENET;
    expect(t.mode).toBe("tangentielle");
    expect(etatFrenet(n, 1).aT).toBe(0);
    expect(etatFrenet(c, 1).aT).toBeGreaterThan(0);
    expect(etatFrenet(c, 1).aN).toBeGreaterThan(0);
  });
});

describe("Hodographe", () => {
  const exemple = (id: string): ParamsHodographe => EXEMPLES_HODOGRAPHE.find((e) => e.id === id)!;

  it("MRU : l'hodographe est un point fixe", () => {
    const p = exemple("mru");
    expect(natureHodographe(p, 6)).toBe("point");
    const pts = pointsHodographe(mouvementHodographe(p), 6, 50);
    for (const q of pts) {
      proche(q.x, pts[0].x, 1e-12);
      proche(q.y, pts[0].y, 1e-12);
    }
  });

  it("MRUV non uniforme : segment de droite, parallèle à l'accélération", () => {
    const p = exemple("mruv");
    expect(natureHodographe(p, 6)).toBe("segment");
    const pts = pointsHodographe(mouvementHodographe(p), 6, 50);
    const dir = { x: Math.cos(p.angleA), y: Math.sin(p.angleA) };
    for (const q of pts) {
      const d = difference(q, pts[0]);
      proche(d.x * dir.y - d.y * dir.x, 0, 1e-9); // colinéaires
    }
    expect(natureHodographe({ ...p, a: 0 }, 6)).toBe("point");
  });

  it("MCU : cercle de rayon R|ω| pour une rotation complète, arc sinon", () => {
    const p = exemple("mcu");
    expect(natureHodographe(p, 2 * Math.PI)).toBe("cercle");
    expect(natureHodographe(p, 1)).toBe("arc");
    const m = mouvementHodographe(p);
    for (const q of pointsHodographe(m, 2 * Math.PI, 100)) proche(norme(q), rayonHodographeMCU(p), 1e-9);
    expect(rayonHodographeMCU({ ...p, R: 0.5, omega: -4 })).toBe(2);
  });

  it("synchronisation : le point de l'hodographe est exactement le vecteur vitesse du mobile", () => {
    for (const e of EXEMPLES_HODOGRAPHE) {
      const m = mouvementHodographe(e);
      for (const t of [0, 0.7, 1.9, 3.3]) {
        const v = m.vitesse(t);
        const h = 1e-6;
        const dr = difference(m.position(t + h), m.position(t - h));
        proche(dr.x / (2 * h), v.x, 1e-5);
        proche(dr.y / (2 * h), v.y, 1e-5);
      }
    }
  });

  it("l'accélération est tangente à l'hodographe : a = dv/dt", () => {
    for (const e of EXEMPLES_HODOGRAPHE) {
      const m = mouvementHodographe(e);
      const t = 1.1;
      const h = 1e-6;
      const dv = difference(m.vitesse(t + h), m.vitesse(t - h));
      const a = m.acceleration(t);
      proche(dv.x / (2 * h), a.x, 1e-5);
      proche(dv.y / (2 * h), a.y, 1e-5);
    }
  });
});

describe("Chronophotographie", () => {
  const tau = 0.5;
  const n = 9;
  const types: TypeChrono[] = ["mru", "accelere", "retarde", "mcu"];

  it("MRUV : l'accélération à trois positions exactes est exacte, à l'arrondi près", () => {
    for (const t of ["accelere", "retarde"] as TypeChrono[]) {
      const m = mouvementChrono(t);
      const P = positionsChrono(m, tau, n);
      for (let i = 1; i < n - 1; i++) {
        const a = accelerationTroisPoints(P, i, tau)!;
        const th = m.acceleration(i * tau);
        proche(a.x, th.x, 1e-9);
        proche(a.y, th.y, 1e-9);
      }
    }
  });

  it("MRUV : vitesse centrée exacte (différence centrée d'une parabole)", () => {
    const m = mouvementChrono("accelere");
    const P = positionsChrono(m, tau, n);
    const v = vitesseCentree(P, 4, tau)!;
    const th = m.vitesse(4 * tau);
    proche(v.x, th.x, 1e-9);
    proche(v.y, th.y, 1e-9);
  });

  it("MRU : vitesse exacte et accélération nulle", () => {
    const m = mouvementChrono("mru");
    const P = positionsChrono(m, tau, n);
    const v = vitesseCentree(P, 3, tau)!;
    proche(v.x, m.vitesse(0).x, 1e-12);
    const a = accelerationTroisPoints(P, 3, tau)!;
    proche(norme(a), 0, 1e-9);
  });

  it("bords de l'enregistrement : estimations indisponibles", () => {
    const P = positionsChrono(mouvementChrono("mru"), tau, n);
    expect(vitesseCentree(P, 0, tau)).toBeNull();
    expect(vitesseCentree(P, n - 1, tau)).toBeNull();
    expect(accelerationTroisPoints(P, 0, tau)).toBeNull();
    expect(accelerationTroisPoints(P, n - 1, tau)).toBeNull();
    expect(vitesseMoyenneIntervalle(P, n - 1, tau)).toBeNull();
    expect(vitesseMoyenneIntervalle(P, -1, tau)).toBeNull();
    expect(accelerationVitessesCentrees(P, 1, tau)).toBeNull();
    expect(accelerationVitessesCentrees(P, 2, tau)).not.toBeNull();
    expect(accelerationVitessesCentrees(P, n - 3, tau)).not.toBeNull();
    expect(accelerationVitessesCentrees(P, n - 2, tau)).toBeNull();
  });

  it("accélération par vitesses centrées : exacte en MRUV, instant t_i", () => {
    const m = mouvementChrono("retarde");
    const P = positionsChrono(m, tau, n);
    const a = accelerationVitessesCentrees(P, 4, tau)!;
    proche(a.x, m.acceleration(0).x, 1e-9);
    proche(a.y, m.acceleration(0).y, 1e-9);
  });

  it("vitesse moyenne d'un intervalle = vitesse instantanée au milieu (MRUV)", () => {
    const m = mouvementChrono("accelere");
    const P = positionsChrono(m, tau, n);
    const v = vitesseMoyenneIntervalle(P, 2, tau)!;
    const th = m.vitesse(2.5 * tau);
    proche(v.x, th.x, 1e-9);
    proche(v.y, th.y, 1e-9);
  });

  it("MCU : l'estimation est approchée, l'erreur croît avec τ", () => {
    const m = mouvementChrono("mcu");
    const erreur = (t: number) => {
      const P = positionsChrono(m, t, 7);
      const e = ecartVecteurs(accelerationTroisPoints(P, 3, t)!, m.acceleration(3 * t));
      return e.absolu;
    };
    const e1 = erreur(0.05);
    const e2 = erreur(0.2);
    const e3 = erreur(0.8);
    expect(e1).toBeGreaterThan(0);
    expect(e1).toBeLessThan(e2);
    expect(e2).toBeLessThan(e3);
    // vitesse : même tendance
    const ev = (t: number) => {
      const P = positionsChrono(m, t, 7);
      return ecartVecteurs(vitesseCentree(P, 3, t)!, m.vitesse(3 * t)).absolu;
    };
    expect(ev(0.05)).toBeLessThan(ev(0.8));
    // τ → 0 : l'estimation converge vers la valeur théorique
    expect(e1).toBeLessThan(0.01);
  });

  it("écart relatif non défini quand la valeur théorique est nulle", () => {
    const e = ecartVecteurs({ x: 1e-3, y: 0 }, { x: 0, y: 0 });
    expect(e.relatif).toBeNull();
    expect(e.absolu).toBeCloseTo(1e-3, 12);
    expect(ecartVecteurs({ x: 3, y: 0 }, { x: 4, y: 0 }).relatif).toBeCloseTo(0.25, 12);
  });

  it("déplacement vectoriel, distance directe et longueur de la trace sont distincts (MCU)", () => {
    const P = positionsChrono(mouvementChrono("mcu"), 1, 8);
    const m = mesuresTrace(P, 0, 4);
    expect(m.longueurTrace).toBeGreaterThan(m.distanceDirecte);
    expect(norme(m.deplacement)).toBeCloseTo(m.distanceDirecte, 12);
    const r = mesuresTrace(P, 4, 0);
    expect(r.deplacement.x).toBeCloseTo(-m.deplacement.x, 12);
    expect(r.longueurTrace).toBeCloseTo(m.longueurTrace, 12);
  });

  it("types : les quatre mouvements sont définis et la première position est M0 = P(0)", () => {
    for (const t of types) {
      const m = mouvementChrono(t);
      const P = positionsChrono(m, tau, 3);
      expect(P).toHaveLength(3);
      expect(P[0]).toEqual(m.position(0));
    }
    const ret = mouvementChrono("retarde");
    // retardé : la vitesse diminue en norme
    expect(norme(ret.vitesse(2))).toBeLessThan(norme(ret.vitesse(0)));
    expect(norme(mouvementChrono("accelere").vitesse(2))).toBeGreaterThan(norme(mouvementChrono("accelere").vitesse(0)));
  });
});

describe("Référentiels", () => {
  it("composition des positions et des vitesses (passager assis)", () => {
    const p = EXEMPLES_REFERENTIELS[0];
    const e = etatReferentiels(p, 2);
    expect(e.terre.vehicule).toBe(-20 + 20);
    proche(e.terre.passager, e.terre.vehicule + e.vehicule.passager);
    expect(e.vitesseTerre.passager).toBe(p.vv + p.up);
    expect(e.vehicule.passager).toBe(p.xp);
    expect(e.vitesseVehicule.passager).toBe(0);
  });

  it("dans le référentiel du véhicule, l'observateur recule à −v", () => {
    const p = EXEMPLES_REFERENTIELS[0];
    const e0 = etatReferentiels(p, 0);
    const e1 = etatReferentiels(p, 1);
    expect(e1.vehicule.observateur - e0.vehicule.observateur).toBe(-p.vv);
    expect(e1.vitesseVehicule.observateur).toBe(-p.vv);
    expect(e1.vitesseTerre.observateur).toBe(0);
    expect(e1.terre.observateur).toBe(p.xo);
  });

  it("passager qui marche : v_P/T = v_V/T + v_P/V", () => {
    const p = EXEMPLES_REFERENTIELS[1];
    const e = etatReferentiels(p, 3);
    expect(e.vitesseTerre.passager).toBe(11.5);
    proche(e.terre.passager, p.xv0 + p.vv * 3 + p.xp + p.up * 3);
    const arriere = etatReferentiels(EXEMPLES_REFERENTIELS[2], 0);
    expect(arriere.vitesseTerre.passager).toBe(8.5);
  });
});

describe("Mouvements plans génériques et utilitaires", () => {
  it("mouvementMRU / MRUV / MCU : cohérence position-vitesse", () => {
    const ms = [
      mouvementMRU({ x: 1, y: 2 }, { x: 3, y: -1 }),
      mouvementMRUV({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0.5, y: -2 }),
      mouvementMCU({ R: 2, omega: 1.5, theta0: 0.3 }),
    ];
    for (const m of ms) {
      const t = 0.8;
      const h = 1e-6;
      const d = difference(m.position(t + h), m.position(t - h));
      proche(d.x / (2 * h), m.vitesse(t).x, 1e-5);
      proche(d.y / (2 * h), m.vitesse(t).y, 1e-5);
    }
  });

  it("fr : format français sans -0 ni NaN", () => {
    expect(fr(37.5)).toBe("37,5");
    expect(fr(-0.0001)).toBe("0");
    expect(fr(Number.NaN)).toBe("—");
    expect(fr(3.14159, 3)).toBe("3,142");
  });
});
