"use client";

import { useEffect, useMemo, useState } from "react";
import { IconPlayerPause, IconPlayerPlay, IconRefresh } from "@tabler/icons-react";

import { angleEgalMod2Pi, argument, cx, depuisPolaire, enDegres, enRadians, modC, normaliserAngle, puissanceEntiere, type Cx } from "@/lib/complexes";
import { brut } from "@/lib/complexesAffichage";
import { lireAngle, lireComplexe, lireReel, reponseEgale, texAngle, texComplexe, texReel } from "@/lib/complexesTex";
import { puissanceMoivre, suitePuissances } from "@/lib/moivreEuler";
import { Bouton, Carte, COULEURS, Commandes, Conclusion, Curseur, DefiBloc, EtapeFormule, Intro, Message, Pastille, PlanSvg, QuestionChoix, QuestionTexte, Stepper, Tex, Valeur, Zone, borneNette, sup, Arc, Fleche, type PointPlan } from "./ui";

const BORNE_Z = 3.5;
const EXEMPLE = { r: Math.SQRT2, thetaDeg: 45, n: 8 };


/** Réel affiché de façon exacte lorsqu'il est reconnu (√2, 16…), sinon approché avec «≈». */
function texValeur(x: number): { tex: string; approx: boolean } {
  const t = texReel(x);
  return { tex: t, approx: t.includes("{,}") };
}

const INSTANCES: Array<{ re: number; im: number; n: number }> = [
  { re: 1, im: 1, n: 4 },
  { re: Math.sqrt(3), im: 1, n: 6 },
  { re: 1, im: -1, n: -2 },
];

/** Spirale d'angle cumulé : le rayon croît légèrement à chaque tour pour distinguer 2π de 4π. */
function Spirale({ o, total, couleur, base }: { o: { X: (x: number) => number; Y: (y: number) => number; u: number }; total: number; couleur: string; base: number }) {
  if (Math.abs(total) < 1e-9) return null;
  const pas = 0.08;
  const nb = Math.min(2500, Math.max(4, Math.ceil(Math.abs(total) / pas)));
  const pts: string[] = [];
  for (let i = 0; i <= nb; i++) {
    const t = (total * i) / nb;
    const rayon = base + (base * 0.15 * Math.abs(t)) / (2 * Math.PI);
    pts.push(`${o.X(rayon * Math.cos(t))},${o.Y(rayon * Math.sin(t))}`);
  }
  return <polyline points={pts.join(" ")} fill="none" stroke={couleur} strokeWidth={2} strokeLinecap="round" strokeDasharray="1 0" />;
}

export default function Moivre() {
  const [r, setR] = useState(EXEMPLE.r);
  const [thetaDeg, setThetaDeg] = useState(EXEMPLE.thetaDeg);
  const [n, setN] = useState(EXEMPLE.n);
  const [kAnim, setKAnim] = useState(0);
  const [anim, setAnim] = useState(false);
  const [etape, setEtape] = useState(0);

  const theta = enRadians(thetaDeg);
  const res = useMemo(() => puissanceMoivre(r, theta, n), [r, theta, n]);
  const total = Math.abs(n);

  useEffect(() => {
    if (!anim) return;
    if (kAnim >= total) {
      const t = setTimeout(() => setAnim(false), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setKAnim((k) => k + 1), 850);
    return () => clearTimeout(t);
  }, [anim, kAnim, total]);

  const kMontre = anim ? Math.min(kAnim, total) : total;
  const suite = useMemo(() => (res.ok ? suitePuissances(r, theta, n) : []), [res.ok, r, theta, n]);
  const montres = suite.slice(0, kMontre + 1).filter((z) => Number.isFinite(z.re) && Number.isFinite(z.im));

  function deplacer(z: Cx) {
    if (z.re === 0 && z.im === 0) {
      setR(0);
      return;
    }
    setR(modC(z));
    setThetaDeg(enDegres(argument(z) ?? 0));
    setAnim(false);
  }
  function reinit() {
    setR(EXEMPLE.r);
    setThetaDeg(EXEMPLE.thetaDeg);
    setN(EXEMPLE.n);
    setAnim(false);
    setKAnim(0);
    setEtape(0);
  }
  function lancer() {
    setKAnim(0);
    setAnim(true);
  }

  const z = depuisPolaire(r, theta);
  const ptsZ: PointPlan[] = [{ id: "z", z, couleur: COULEURS.z, etiquette: "z", deplacable: true }];

  // Cadre du plan de z^n : adapté aux puissances tracées, plafonné pour rester lisible.
  const maxMod = montres.reduce((m, p) => Math.max(m, modC(p)), 1);
  const horsCadre = maxMod > 200;
  const B = borneNette(Math.min(maxMod, 200));
  const kAff = Math.min(kMontre, total);
  const ptsN: PointPlan[] = montres.map((p, i) => {
    const k = (n < 0 ? -1 : 1) * i;
    const dernier = i === montres.length - 1;
    return { id: `p${i}`, z: p, couleur: dernier ? COULEURS.resultat : COULEURS.gris, etiquette: i === 0 ? "1" : `z${sup(k)}` };
  });
  const angleCumule = res.ok ? (n < 0 ? -1 : 1) * kAff * theta : 0; // k·θ (signe de n)

  const rVal = texValeur(r);
  const thetaTex = texAngle(theta);
  const algebriqueN = res.ok ? texComplexe(res.zn) : "";
  const moduleN = res.ok ? texValeur(res.moduleN) : { tex: "", approx: false };

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-sky-500 bg-sky-50">
        Élever un nombre complexe à la puissance <em>n</em>, c&apos;est <strong>élever son module à la puissance n</strong> et{" "}
        <strong>multiplier son argument par n</strong>. Déplace le point z, change n, puis lance l&apos;animation : à chaque multiplication par z, l&apos;angle augmente de θ.
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="flex flex-wrap items-end gap-3">
          <Curseur etiquette="Module r" valeur={r} min={0} max={3} pas={0.05} decimales={3} onChange={(v) => { setR(v); setAnim(false); }} />
          <Curseur etiquette="Angle θ" valeur={thetaDeg} min={-720} max={720} pas={1} decimales={2} unite="degrés" onChange={(v) => { setThetaDeg(v); setAnim(false); }} />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-fh-ardoise/80">Puissance n</span>
            <Stepper etiquette="Puissance n" valeur={n} min={-8} max={8} onChange={(v) => { setN(v); setAnim(false); setKAnim(0); }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pastille actif={Math.abs(r - Math.SQRT2) < 1e-9 && thetaDeg === 45 && n === 8} onClick={() => { setR(EXEMPLE.r); setThetaDeg(45); setN(8); setAnim(false); }}>
            Exemple guidé : z = 1 + i, n = 8
          </Pastille>
          <Bouton variante="plein" onClick={anim ? () => setAnim(false) : lancer} disabled={!res.ok || n === 0}>
            {anim ? <IconPlayerPause size={18} aria-hidden="true" /> : <IconPlayerPlay size={18} aria-hidden="true" />}
            {anim ? "Arrêter l'animation" : "Animer la puissance"}
          </Bouton>
          <Bouton onClick={reinit}>
            <IconRefresh size={18} aria-hidden="true" />
            Réinitialiser
          </Bouton>
        </div>

        {!res.ok && <Message type="erreur">{res.erreur}</Message>}

        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          <figure className="flex min-w-0 flex-col gap-1">
            <figcaption className="text-xs font-bold uppercase tracking-wide text-fh-ardoise/70">Le nombre z (déplace-le)</figcaption>
            <PlanSvg
              bornes={{ xmin: -BORNE_Z, xmax: BORNE_Z, ymin: -BORNE_Z, ymax: BORNE_Z }}
              unite={228 / BORNE_Z}
              points={ptsZ}
              onDeplacer={(_, p) => deplacer(p)}
              aimant={0.05}
              etiquette="Plan complexe : le nombre z, déplaçable"
              dessous={(o) => (
                <>
                  <circle cx={o.X(0)} cy={o.Y(0)} r={o.u} fill="none" stroke="#94a3b8" strokeDasharray="5 4" />
                  {r > 0 && <circle cx={o.X(0)} cy={o.Y(0)} r={o.L(r)} fill="none" stroke={COULEURS.z} strokeOpacity={0.35} strokeWidth={1.5} />}
                  <Fleche o={o} de={cx(0, 0)} vers={z} couleur={COULEURS.z} />
                  {r > 0.05 && <Arc o={o} centre={cx(0, 0)} rayon={Math.min(0.6, r * 0.6)} a1={0} a2={normaliserAngle(theta)} couleur={COULEURS.z} />}
                </>
              )}
              dessus={(o) => <text x={o.X(Math.min(0.75, r * 0.7) * Math.cos(normaliserAngle(theta) / 2))} y={o.Y(Math.min(0.75, r * 0.7) * Math.sin(normaliserAngle(theta) / 2))} fontSize={13} fontWeight={700} fill={COULEURS.z}>{r > 0.2 ? "θ" : ""}</text>}
            />
          </figure>
          <figure className="flex min-w-0 flex-col gap-1">
            <figcaption className="text-xs font-bold uppercase tracking-wide text-fh-ardoise/70">
              {res.ok ? <>Les puissances z<sup>k</sup>, jusqu&apos;à z<sup>{n}</sup></> : "Les puissances de z"}
            </figcaption>
            <PlanSvg
              bornes={{ xmin: -B, xmax: B, ymin: -B, ymax: B }}
              unite={228 / B}
              points={ptsN}
              etiquette="Plan complexe : les puissances successives de z et l'angle cumulé"
              aimant={0}
              dessous={(o) => (
                <>
                  <circle cx={o.X(0)} cy={o.Y(0)} r={o.u} fill="none" stroke="#94a3b8" strokeDasharray="5 4" />
                  {res.ok && <Spirale o={o} total={angleCumule} couleur={COULEURS.resultat} base={Math.max(0.45, B * 0.08)} />}
                  {res.ok && montres.length > 0 && <Fleche o={o} de={cx(0, 0)} vers={montres[montres.length - 1]} couleur={COULEURS.resultat} />}
                </>
              )}
            />
            {horsCadre && <p className="text-xs text-amber-800">Certaines puissances sortent du cadre (module &gt; 200) : le cadre est limité pour rester lisible.</p>}
          </figure>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fh-ardoise" aria-label="Légende">
          <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: COULEURS.z }} />z : point à déplacer, arc = θ</li>
          <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: COULEURS.resultat }} />z<sup>n</sup> : résultat, spirale = angle cumulé nθ</li>
          <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: COULEURS.gris }} />puissances intermédiaires</li>
          <li>cercle en pointillé : cercle unité</li>
        </ul>

        {anim && res.ok && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" aria-live="polite">
            Multiplication {kAff} sur {total} : angle <strong>cumulé</strong> = {kAff} × {brut(thetaDeg, 2)}° = <strong>{brut(kAff * thetaDeg * (n < 0 ? -1 : 1), 2)}°</strong>
            {Math.abs(kAff * thetaDeg) > 360 ? " (plus d'un tour : l'angle total n'est pas ramené modulo 360°)" : ""}.
          </p>
        )}

        {res.ok && (
          <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
            <Valeur etiquette="Forme algébrique de z (approchée si ≈)">
              <Tex expr={`z ${r === 0 ? "=" : "\\approx"} ${texComplexe(z)}`} />
            </Valeur>
            <Valeur etiquette="Forme trigonométrique">
              {r === 0 ? <Tex expr="z = 0" /> : <Tex expr={`z = ${rVal.tex}\\left(\\cos ${thetaTex} + i\\sin ${thetaTex}\\right)`} />}
            </Valeur>
            <Valeur etiquette="Forme exponentielle">
              {r === 0 ? <>z = 0 : argument indéfini</> : <Tex expr={`z = ${rVal.tex}\\,e^{i${thetaTex.includes("\\") ? `\\left(${thetaTex}\\right)` : `\\,${thetaTex}`}}`} />}
            </Valeur>
            <Valeur etiquette={<>Module de z<sup>n</sup></>}>
              <Tex expr={`|z^{${n}}| = r^{${n}} ${moduleN.approx ? "\\approx" : "="} ${moduleN.tex}`} />
            </Valeur>
            <Valeur etiquette={<>Argument de z<sup>n</sup></>}>
              {res.argPrincipal === null ? (
                <>indéfini (z<sup>n</sup> = 0)</>
              ) : (
                <Tex expr={`n\\theta = ${n}\\times ${thetaTex} = ${texAngle(res.angleTotal)}\\ ;\\ \\arg(z^{${n}}) \\equiv ${texAngle(res.argPrincipal)}\\ [2\\pi]`} />
              )}
            </Valeur>
            <Valeur etiquette={<>Forme algébrique de z<sup>n</sup></>}>
              <Tex expr={`z^{${n}} ${r === 0 || algebriqueN.includes("{,}") ? "\\approx" : "="} ${algebriqueN}`} />
            </Valeur>
          </div>
        )}
        {res.ok && res.argPrincipal !== null && Math.abs(res.tours) >= 1 && (
          <Message type="info">
            L&apos;angle total nθ = {brut(enDegres(res.angleTotal), 2)}° dépasse un tour : on le distingue de l&apos;argument <em>principal</em> ({brut(enDegres(res.argPrincipal), 2)}°), qui n&apos;en diffère que de {res.tours} tour{Math.abs(res.tours) > 1 ? "s" : ""} complet{Math.abs(res.tours) > 1 ? "s" : ""}.
          </Message>
        )}
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <Commandes etape={etape} total={4} onPrecedent={() => setEtape((e) => Math.max(0, e - 1))} onSuivant={() => setEtape((e) => Math.min(4, e + 1))} onTout={() => setEtape(4)} onRecommencer={() => setEtape(0)} />
        {etape === 0 && <p className="text-sm text-fh-ardoise">Clique sur « Étape suivante » : le calcul de z<sup>n</sup> se construit pas à pas pour les valeurs choisies ci-dessus.</p>}
        {res.ok && (
          <ol className="flex flex-col gap-2">
            {etape >= 1 && (
              <EtapeFormule
                numero={1}
                titre="Écrire z sous forme trigonométrique et exponentielle"
                expr={r === 0 ? "z = 0" : `z = ${rVal.tex}\\,e^{i\\,${thetaTex}}`}
                texte="Le module r mesure la distance OM ; l'argument θ est l'angle de l'axe réel vers OM."
              />
            )}
            {etape >= 2 && (
              <EtapeFormule
                numero={2}
                titre="Appliquer la formule de Moivre"
                expr={`z^{${n}} = \\left(r\\,e^{i\\theta}\\right)^{${n}} = r^{${n}}\\,e^{i\\,${n}\\theta}`}
                texte="Les puissances de e^{iθ} s'additionnent : (e^{iθ})ⁿ = e^{inθ}. Le module est élevé à la puissance n, l'angle est multiplié par n."
              />
            )}
            {etape >= 3 && (
              <EtapeFormule
                numero={3}
                titre="Calculer le module et l'angle total"
                expr={`r^{${n}} = \\left(${rVal.tex}\\right)^{${n}} ${moduleN.approx ? "\\approx" : "="} ${moduleN.tex} \\qquad n\\theta = ${n}\\times ${thetaTex} = ${texAngle(res.angleTotal)}`}
                texte={res.argPrincipal !== null && Math.abs(res.tours) >= 1 ? <>L&apos;angle total vaut {brut(enDegres(res.angleTotal), 2)}° : on le ramène ensuite dans ]−180°, 180°] en retirant {Math.abs(res.tours)} tour(s).</> : "L'angle est déjà dans ]-π, π] : aucune réduction nécessaire."}
              />
            )}
            {etape >= 4 && (
              <EtapeFormule
                numero={4}
                titre="Revenir à la forme algébrique"
                expr={`z^{${n}} = ${moduleN.tex}\\left(\\cos ${texAngle(res.angleTotal)} + i\\sin ${texAngle(res.angleTotal)}\\right) ${algebriqueN.includes("{,}") ? "\\approx" : "="} ${algebriqueN}`}
                texte={moduleN.approx ? "Valeur approchée : le module n'a pas d'écriture exacte simple." : "Valeur exacte."}
              />
            )}
          </ol>
        )}
        {!res.ok && <Message type="erreur">{res.erreur}</Message>}
        <Carte titre="Exemple guidé : z = 1 + i">
          <Tex bloc expr={"|1+i|=\\sqrt2,\\quad \\arg(1+i)=\\dfrac{\\pi}{4}\\ \\Longrightarrow\\ (1+i)^8=\\left(\\sqrt2\\right)^8e^{i\\,8\\frac{\\pi}{4}}=16\\,e^{2i\\pi}=16"} />
          <p>Le module devient 16 et l&apos;argument devient 2π : un tour complet, le point retombe sur l&apos;axe réel positif.</p>
        </Carte>
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc
          nombre={INSTANCES.length}
          rendu={(i) => {
            const { re, im, n: nn } = INSTANCES[i];
            const z0 = cx(re, im);
            const rr = modC(z0);
            const th = argument(z0)!;
            const attendu = puissanceEntiere(z0, nn)!;
            const modAttendu = Math.pow(rr, nn);
            const argAttendu = normaliserAngle(nn * th);
            return (
              <>
                <p className="text-sm text-fh-ardoise">
                  On étudie <Tex expr={`z = ${texComplexe(z0)}`} /> et <Tex expr={`n = ${nn}`} />.
                </p>
                <QuestionTexte
                  numero={1}
                  enonce={<>Quel est le module de <Tex expr={`z^{${nn}}`} /> ?</>}
                  placeholder="par exemple 4 ou 1/2"
                  verifier={(t) => {
                    const l = lireReel(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    if (reponseEgale(l.valeur, modAttendu)) return { ok: true, message: <>Exact : <Tex expr={`|z^{${nn}}| = |z|^{${nn}} = ${texReel(modAttendu)}`} />.</> };
                    if (nn < 0 && reponseEgale(l.valeur, Math.pow(rr, -nn))) return { ok: false, message: "Attention au signe de n : avec n négatif, le module est r puissance n, c'est-à-dire l'inverse de r puissance |n|." };
                    return { ok: false, message: <>Le module de z<sup>n</sup> est r<sup>n</sup>, avec r = |z| = <Tex expr={texReel(rr)} />.</> };
                  }}
                  indices={[<>Le module d&apos;une puissance est la puissance du module : <Tex expr={"|z^n| = |z|^n"} />.</>, <>Calcule d&apos;abord <Tex expr={`|z| = ${texReel(rr)}`} />.</>]}
                  correction={<><Tex expr={`|z| = ${texReel(rr)}`} />, donc <Tex expr={`|z^{${nn}}| = \\left(${texReel(rr)}\\right)^{${nn}} = ${texReel(modAttendu)}`} />.</>}
                />
                <QuestionTexte
                  numero={2}
                  enonce={<>Quel est l&apos;argument <em>principal</em> de <Tex expr={`z^{${nn}}`} /> (dans ]−π, π]) ?</>}
                  placeholder="par exemple π/2, -2π/3 ou π"
                  verifier={(t) => {
                    const l = lireAngle(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    if (angleEgalMod2Pi(l.valeur, argAttendu, 5e-3)) {
                      return { ok: true, message: <>Exact : <Tex expr={`n\\theta = ${nn}\\times ${texAngle(th)} = ${texAngle(nn * th)}`} />, puis réduction : <Tex expr={texAngle(argAttendu)} />.</> };
                    }
                    if (angleEgalMod2Pi(l.valeur, th, 5e-3)) return { ok: false, message: "Tu as donné l'argument de z, pas celui de z^n : il faut multiplier par n." };
                    return { ok: false, message: <>Multiplie l&apos;argument de z par n : <Tex expr={`n\\theta = ${nn}\\times ${texAngle(th)} = ${texAngle(nn * th)}`} />, puis ramène l&apos;angle dans ]−π, π].</> };
                  }}
                  indices={[<>L&apos;argument de z<sup>n</sup> est n fois celui de z, à un multiple de 2π près.</>, <>Ici <Tex expr={`\\arg z = ${texAngle(th)}`} />.</>]}
                  correction={<><Tex expr={`\\arg z = ${texAngle(th)}`} />, donc <Tex expr={`n\\arg z = ${texAngle(nn * th)}`} />, soit modulo 2π : <Tex expr={texAngle(argAttendu)} />.</>}
                />
                <QuestionTexte
                  numero={3}
                  enonce={<>Donne <Tex expr={`z^{${nn}}`} /> sous forme algébrique.</>}
                  placeholder="par exemple -4 ou 1/2 i"
                  verifier={(t) => {
                    const l = lireComplexe(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    if (reponseEgale(l.valeur.re, attendu.re) && reponseEgale(l.valeur.im, attendu.im)) return { ok: true, message: <>Exact : <Tex expr={`z^{${nn}} = ${texComplexe(attendu)}`} />.</> };
                    return { ok: false, message: <>Passe par la forme polaire : <Tex expr={`z^{${nn}} = ${texReel(modAttendu)}\\left(\\cos ${texAngle(nn * th)} + i\\sin ${texAngle(nn * th)}\\right)`} />.</> };
                  }}
                  indices={[<>Écris z<sup>n</sup> = r<sup>n</sup>(cos nθ + i sin nθ).</>, <>Utilise les valeurs exactes de cos et sin de l&apos;angle obtenu.</>]}
                  correction={<><Tex expr={`z^{${nn}} = ${texReel(modAttendu)}\\left(\\cos ${texAngle(nn * th)} + i\\sin ${texAngle(nn * th)}\\right) = ${texComplexe(attendu)}`} />.</>}
                />
                <QuestionChoix
                  numero={4}
                  enonce="Quelle égalité exprime la formule de Moivre ?"
                  options={[
                    { id: "a", libelle: <Tex expr={"(\\cos\\theta+i\\sin\\theta)^n=\\cos n\\theta+i\\sin n\\theta"} /> },
                    { id: "b", libelle: <Tex expr={"(\\cos\\theta+i\\sin\\theta)^n=\\cos^n\\theta+i\\sin^n\\theta"} /> },
                    { id: "c", libelle: <Tex expr={"(\\cos\\theta+i\\sin\\theta)^n=n\\cos\\theta+in\\sin\\theta"} /> },
                  ]}
                  bonne="a"
                  explications={{
                    a: "C'est la formule de Moivre : e^{iθ} élevé à n donne e^{inθ}.",
                    b: "Les puissances ne se distribuent pas sur cos et sin : (cos θ + i sin θ)ⁿ n'est pas cosⁿθ + i sinⁿθ. C'est l'angle qui est multiplié par n.",
                    c: "Multiplier cos θ par n est faux : c'est l'angle θ qui devient nθ à l'intérieur de cos et de sin.",
                  }}
                  indices={[<>Pense à <Tex expr={"(e^{i\\theta})^n=e^{in\\theta}"} />.</>]}
                  correction={<>La bonne égalité est <Tex expr={"(\\cos\\theta+i\\sin\\theta)^n=\\cos n\\theta+i\\sin n\\theta"} /> : seul l&apos;angle est multiplié par n.</>}
                />
              </>
            );
          }}
        />
      </Zone>

      <Conclusion>
        <Tex expr={"z=re^{i\\theta}\\ \\Longrightarrow\\ z^n=r^ne^{in\\theta}"} /> pour tout entier n (z ≠ 0 si n ≤ 0). Le module est élevé à la puissance n ; l&apos;angle est multiplié par n et peut dépasser un tour.
      </Conclusion>
    </div>
  );
}
