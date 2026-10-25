"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { nombreFr } from "@/lib/accueil/mathsLabo";
import { useAnimation, useBoucle } from "./animation";
import { BoutonReinitialiser, CadreSimulation, Curseur, Tx, Valeur } from "./commun";
import { EncartConcept } from "./GrapheMaths";

const T_MAX = 12; // durée de la simulation, en jours
const VITESSE = 1.1; // jours simulés par seconde pendant « Faire pousser »
const VERT = "#2a9d4a";

// Géométrie du dessin (viewBox 440 x 320) : sol à partir de y = SURFACE, nappe d'eau à partir de y = EAU.
const SURFACE = 125;
const EAU = 288;
const GRAINE = { x: 220, y: 192 };
const LONGUEUR_RADICULE = 86;
const HAUTEUR_TIGE = 108;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

interface Etape {
  titre: string;
  /** Texte « Ce dont la plante a besoin à cette étape » (formules chimiques en KaTeX via Tx). */
  besoins: string;
  eau: boolean;
  temperature: boolean;
  lumiere: boolean;
  sels: boolean;
  air: boolean;
  reserves: string;
}

const ETAPES: Etape[] = [
  {
    titre: "La graine au repos",
    besoins: "La graine est au repos : elle contient l'embryon et ses réserves nourricières. Elle ne germe que si les facteurs externes sont réunis : l'eau, une température convenable et la lumière.",
    eau: true,
    temperature: true,
    lumiere: true,
    sels: false,
    air: false,
    reserves: "intactes",
  },
  {
    titre: "La graine gonfle, la radicule sort",
    besoins: "La graine absorbe l'eau et gonfle. La radicule, future racine, perce l'enveloppe et descend vers l'eau du sol. Pour cela il faut de l'eau, une bonne température, de l'air (le dioxygène $\\mathrm{O_2}$ sert à respirer) et les sels minéraux que la radicule commence à puiser.",
    eau: true,
    temperature: true,
    lumiere: false,
    sels: true,
    air: true,
    reserves: "utilisées",
  },
  {
    titre: "La tige monte",
    besoins: "La tige s'élève vers la surface, encore dans l'obscurité du sol. Elle vit grâce aux réserves de la graine et à ce que ses racines absorbent : de l'eau, des sels minéraux et de l'air.",
    eau: true,
    temperature: false,
    lumiere: false,
    sels: true,
    air: true,
    reserves: "utilisées",
  },
  {
    titre: "Les feuilles apparaissent",
    besoins: "Les premières feuilles se déploient à l'air libre. Pour la première fois la lumière est indispensable : avec l'eau, les sels minéraux et l'air, elle permet à la plante de commencer à fabriquer sa propre nourriture.",
    eau: true,
    temperature: false,
    lumiere: true,
    sels: true,
    air: true,
    reserves: "presque épuisées",
  },
  {
    titre: "La jeune plante (autonome)",
    besoins: "La jeune plante a des racines, une tige et des feuilles : elle fabrique elle-même sa nourriture et n'a plus besoin des réserves de la graine. Il lui faut de l'eau, de la lumière, des sels minéraux et de l'air (du dioxygène $\\mathrm{O_2}$ pour respirer, du dioxyde de carbone $\\mathrm{CO_2}$ pour fabriquer sa matière).",
    eau: true,
    temperature: false,
    lumiere: true,
    sels: true,
    air: true,
    reserves: "épuisées",
  },
];

/** Numéro de l'étape (0 à 4) selon le temps écoulé en jours. */
function indiceEtape(t: number): number {
  if (t < 1) return 0;
  if (t < 3.5) return 1;
  if (t < 6.5) return 2;
  if (t < 9) return 3;
  return 4;
}

/** Tout ce qui dépend du temps : taille de la graine, longueur de la radicule, hauteur de la tige, taille des feuilles. */
function morphologie(t: number) {
  const gonflement = clamp01((t - 1) / 1.5);
  const ry = 8 + 4 * gonflement;
  const radicule = clamp01((t - 1.8) / 3.5) * LONGUEUR_RADICULE;
  const tige = clamp01((t - 3.5) / 3) * HAUTEUR_TIGE + clamp01((t - 9) / 3) * 12;
  const feuilles = clamp01((t - 6.5) / 2.5);
  const bourgeon = clamp01((t - 9) / 3);
  const racinesLaterales = clamp01((t - 9) / 2);
  return {
    gonflement,
    rx: 11 + 5 * gonflement,
    ry,
    radicule,
    pointeRadicule: GRAINE.y + ry + radicule,
    sommetTige: GRAINE.y - ry - tige,
    feuilles,
    bourgeon,
    racinesLaterales,
    reserves: 1 - 0.65 * clamp01((t - 6.5) / 5),
  };
}

const GOUTTES = [128, 176, 266, 314, 220];

/** Explication détaillée de chaque étape (accordéon « Les étapes en détail »). */
const DETAILS: string[] = [
  "La graine est protégée par son enveloppe. À l'intérieur se trouvent l'embryon, une plante miniature avec sa future radicule, sa future tige et ses premières feuilles, et les réserves nourricières. Elle est vivante, mais sa vie est ralentie. Elle ne germe que si les facteurs externes (l'eau, la température, la lumière) sont réunis et si les facteurs internes sont favorables : une graine abîmée ou trop vieille ne germe pas.",
  "La graine absorbe l'eau et gonfle. Son enveloppe s'ouvre et la radicule, la future racine, sort la première : elle s'enfonce dans le sol, vers l'eau. Elle fixe la plante et absorbe l'eau et les sels minéraux. La graine respire : elle a besoin d'air ($\\mathrm{O_2}$), et ses réserves nourrissent l'embryon.",
  "La tige s'allonge et s'élève vers la surface du sol, en direction de la lumière. Elle vit encore sur les réserves de la graine, qui diminuent, et sur l'eau et les sels minéraux absorbés par la radicule.",
  "En sortant du sol, la tige déploie ses premières feuilles. Elles sont d'abord petites, puis elles verdissent et s'élargissent. Exposées à la lumière, elles commencent à fabriquer de la matière organique : la plante n'a presque plus besoin des réserves de la graine.",
  "La jeune plante possède des racines, une tige et des feuilles. Les réserves de la graine sont épuisées : elle est autonome et fabrique elle-même sa nourriture, à partir de l'eau, des sels minéraux, du dioxyde de carbone ($\\mathrm{CO_2}$) de l'air et de la lumière. Elle respire grâce au dioxygène ($\\mathrm{O_2}$) de l'air.",
];

/** Accordéon « Les étapes en détail » : 5 titres repliés au départ, un seul ouvert à la fois (indicateur + / −). */
function EtapesEnDetail({ courante }: { courante: number }) {
  const [ouvert, setOuvert] = useState<number | null>(null);
  const id = useId();
  return (
    <div className="rounded-xl border border-fh-sable bg-white/70 p-3 sm:p-4">
      <p className="text-base font-bold text-fh-bleu">Les étapes en détail</p>
      <ul className="mt-2 flex flex-col gap-2">
        {ETAPES.map((e, i) => {
          const ouverte = ouvert === i;
          return (
            <li key={e.titre} className="overflow-hidden rounded-lg border border-fh-sable bg-white">
              <h4>
                <button
                  type="button"
                  onClick={() => setOuvert(ouverte ? null : i)}
                  aria-expanded={ouverte}
                  aria-controls={`${id}-${i}`}
                  className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-semibold text-fh-bleu transition-colors hover:bg-fh-accent/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fh-orange motion-reduce:transition-none"
                >
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm text-white" style={{ backgroundColor: VERT }}>
                    {i + 1}
                  </span>
                  <span className="sr-only">Étape {i + 1} : </span>
                  <span className="flex-1">{e.titre}</span>
                  {i === courante && <span className="rounded-full bg-fh-accent px-2 py-0.5 text-xs font-bold text-fh-orange-fonce">étape en cours</span>}
                  <span aria-hidden="true" className="w-5 shrink-0 text-center text-xl font-bold leading-none text-fh-orange">
                    {ouverte ? "−" : "+"}
                  </span>
                </button>
              </h4>
              {ouverte && (
                <p id={`${id}-${i}`} className="px-3 pb-3 pt-1 leading-8 text-fh-ardoise sm:pl-13">
                  <Tx>{DETAILS[i]}</Tx>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Pastille de besoin : allumée (colorée) ou éteinte (grisée) selon l'étape. */
function Pastille({ libelle, allumee, couleur }: { libelle: ReactNode; allumee: boolean; couleur: string }) {
  return (
    <li
      className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors motion-reduce:transition-none ${allumee ? "text-white" : "border-fh-sable bg-white text-fh-ardoise/60"}`}
      style={allumee ? { backgroundColor: couleur, borderColor: couleur } : undefined}
    >
      {libelle}
      <span className="sr-only">{allumee ? " : nécessaire à cette étape" : " : pas nécessaire à cette étape"}</span>
    </li>
  );
}

/** Germination d'une graine : une coupe de sol et de ciel, un curseur de temps (0 à 12 jours) et 5 étapes qui s'enchaînent. */
export default function SimulationGermination() {
  const [t, setT] = useState(0);
  const [lecture, setLecture] = useState(false);
  const racine = useRef<HTMLDivElement>(null);
  const tRef = useRef(0);
  const gouttes = useRef<(SVGCircleElement | null)[]>([]);
  const cible = useRef({ x: GRAINE.x, y: GRAINE.y });
  const phaseGouttes = useRef(0);
  const anime = useAnimation(racine);

  const m = morphologie(t);
  const indice = indiceEtape(t);
  const etape = ETAPES[indice];
  const germe = t >= 1;

  // La pointe de la radicule (cible des gouttes) est lue par la boucle d'animation, jamais pendant le rendu.
  useEffect(() => {
    cible.current = { x: GRAINE.x, y: m.pointeRadicule };
    if (!germe) gouttes.current.forEach((g) => g?.setAttribute("opacity", "0"));
  }, [m.pointeRadicule, germe]);

  const posGoutte = (i: number, ph: number, yCible: number) => {
    const p = (ph + i / GOUTTES.length) % 1;
    const q = p * p;
    return { x: GOUTTES[i] + (GRAINE.x - GOUTTES[i]) * q, y: SURFACE + 4 + (yCible - SURFACE - 4) * p, o: Math.min(1, p * 6, (1 - p) * 4) };
  };

  // Les gouttes descendent vers la radicule dès que la graine a germé.
  useBoucle(anime && germe, (dt) => {
    phaseGouttes.current = (phaseGouttes.current + dt * 0.35) % 1;
    gouttes.current.forEach((g, i) => {
      if (!g) return;
      const { x, y, o } = posGoutte(i, phaseGouttes.current, cible.current.y);
      g.setAttribute("cx", x.toFixed(1));
      g.setAttribute("cy", y.toFixed(1));
      g.setAttribute("opacity", (0.85 * o).toFixed(2));
    });
  });

  // « Faire pousser » : le temps avance tout seul jusqu'à 12 jours.
  useBoucle(lecture, (dt) => {
    tRef.current = Math.min(T_MAX, tRef.current + dt * VITESSE);
    setT(tRef.current);
    if (tRef.current >= T_MAX) setLecture(false);
  });

  const changerTemps = (v: number) => {
    tRef.current = v;
    setT(v);
    setLecture(false);
  };
  const faireCrotre = () => {
    if (lecture) return setLecture(false);
    if (tRef.current >= T_MAX - 0.001) changerTemps(0);
    setLecture(true);
  };
  const recommencer = () => changerTemps(0);

  const libelleBouton = lecture ? "Pause" : t > 0 && t < T_MAX ? "Reprendre" : "Faire pousser";
  const nbJours = nombreFr(t, 1);
  const lumiereSoleil = 0.4 + 0.6 * m.feuilles;

  return (
    <div ref={racine} className="flex flex-col gap-5">
      <EncartConcept
        concept="Une graine contient une plante miniature (l'embryon) et des réserves nourricières. Sa germination dépend de facteurs externes — l'eau, la température et la lumière — et de facteurs internes — l'état et l'âge de la graine. Quand les conditions sont réunies, la graine gonfle (elle absorbe l'eau), puis la radicule (la future racine) apparaît et s'enfonce dans le sol, la tige s'élève vers la surface, et enfin les premières feuilles se déploient. Dès qu'elle a des feuilles et de la lumière, la jeune plante fabrique elle-même sa nourriture et n'a plus besoin des réserves de la graine."
        observer="clique sur « Faire pousser » ou déplace le curseur du temps : regarde les gouttes d'eau descendre vers la radicule, puis le soleil s'intensifier quand les feuilles apparaissent."
      />
      <CadreSimulation
        titre="La germination d'une graine"
        description="Fais passer les jours et observe les 5 étapes, de la graine au repos à la jeune plante autonome."
        formule={<span className="text-base font-semibold">Gonflement de la graine, radicule, tige, feuilles</span>}
        graphique={
          <svg
            viewBox="0 0 440 320"
            className="mx-auto h-auto w-full max-w-[480px]"
            role="img"
            aria-label={`Coupe du sol et du ciel au jour ${nbJours} : étape ${indice + 1} sur 5, ${etape.titre.toLowerCase()}`}
          >
            <rect x={0} y={0} width={440} height={SURFACE} rx={10} className="fill-sky-50" />
            <rect x={0} y={SURFACE} width={440} height={320 - SURFACE} className="fill-[#e6d2b8]" />
            <rect x={0} y={250} width={440} height={70} className="fill-[#d2b48c]" opacity={0.55} />
            <rect x={0} y={EAU} width={440} height={32} className="fill-sky-300" opacity={0.75} />
            <path d={`M0 ${EAU} Q55 ${EAU - 5} 110 ${EAU} T220 ${EAU} T330 ${EAU} T440 ${EAU}`} fill="none" className="stroke-sky-500" strokeWidth={1.5} />
            <rect x={0} y={SURFACE - 3} width={440} height={6} className="fill-[#8a5a2b]" />
            <rect x={0} y={SURFACE - 6} width={440} height={4} className="fill-green-600" opacity={0.7} />

            {/* soleil : de plus en plus intense à partir de l'apparition des feuilles */}
            <g opacity={lumiereSoleil.toFixed(3)}>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * 2 * Math.PI;
                const r2 = 36 + 14 * m.feuilles;
                return (
                  <line
                    key={i}
                    x1={(66 + 30 * Math.cos(a)).toFixed(1)}
                    y1={(52 + 30 * Math.sin(a)).toFixed(1)}
                    x2={(66 + r2 * Math.cos(a)).toFixed(1)}
                    y2={(52 + r2 * Math.sin(a)).toFixed(1)}
                    className="stroke-amber-400"
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                );
              })}
              <circle cx={66} cy={52} r={23} className="fill-amber-300" />
            </g>
            {/* faisceau de lumière vers les feuilles */}
            <path d={`M92 68 L${(210).toFixed(1)} ${(m.sommetTige - 14).toFixed(1)} L${(232).toFixed(1)} ${(m.sommetTige - 4).toFixed(1)} L100 88 Z`} className="fill-amber-300" opacity={(0.5 * m.feuilles).toFixed(3)} />

            {/* radicule */}
            {m.radicule > 0 && (
              <g fill="none" className="stroke-[#f3ead9]" strokeLinecap="round">
                <path d={`M${GRAINE.x} ${GRAINE.y + m.ry - 2} Q${GRAINE.x - 5} ${GRAINE.y + m.ry + m.radicule / 2} ${GRAINE.x + 2} ${GRAINE.y + m.ry + m.radicule}`} strokeWidth={4.5} />
                {m.racinesLaterales > 0 &&
                  [0.35, 0.6, 0.82].map((s, i) => {
                    const y0 = GRAINE.y + m.ry + m.radicule * s;
                    const sens = i % 2 === 0 ? -1 : 1;
                    return <line key={s} x1={GRAINE.x} y1={y0} x2={GRAINE.x + sens * 24 * m.racinesLaterales} y2={y0 + 12 * m.racinesLaterales} strokeWidth={2.5} />;
                  })}
              </g>
            )}

            {/* graine (réserves qui s'épuisent) */}
            <ellipse cx={GRAINE.x} cy={GRAINE.y} rx={m.rx} ry={m.ry} className="fill-amber-700" opacity={m.reserves.toFixed(2)} />
            <ellipse cx={GRAINE.x - 3} cy={GRAINE.y - 2} rx={m.rx * 0.45} ry={m.ry * 0.4} className="fill-amber-400" opacity={(0.5 * m.reserves).toFixed(2)} />

            {/* tige, feuilles */}
            {m.sommetTige < GRAINE.y - m.ry - 0.5 && (
              <path d={`M${GRAINE.x} ${GRAINE.y - m.ry + 2} L${GRAINE.x} ${m.sommetTige.toFixed(1)}`} fill="none" className="stroke-green-600" strokeWidth={4} strokeLinecap="round" />
            )}
            {m.feuilles > 0 && (
              <g transform={`translate(${GRAINE.x} ${m.sommetTige.toFixed(1)})`}>
                <g transform={`scale(${(0.25 + 0.75 * m.feuilles).toFixed(3)})`}>
                  <ellipse cx={-24} cy={-6} rx={25} ry={10} transform="rotate(-25 -24 -6)" className="fill-green-500 stroke-green-800" strokeWidth={2} />
                  <ellipse cx={24} cy={-6} rx={25} ry={10} transform="rotate(25 24 -6)" className="fill-green-500 stroke-green-800" strokeWidth={2} />
                </g>
                {m.bourgeon > 0 && (
                  <ellipse cx={0} cy={-8 - 12 * m.bourgeon} rx={7 * m.bourgeon} ry={14 * m.bourgeon} className="fill-green-400 stroke-green-800" strokeWidth={1.5} />
                )}
              </g>
            )}

            {/* gouttes d'eau vers la radicule */}
            {GOUTTES.map((_, i) => {
              const { x, y, o } = posGoutte(i, 0, m.pointeRadicule);
              return <circle key={i} ref={(el) => { gouttes.current[i] = el; }} cx={x.toFixed(1)} cy={y.toFixed(1)} r={3.5} className="fill-sky-500" opacity={germe ? (0.85 * o).toFixed(2) : 0} />;
            })}

            {/* légendes */}
            <text x={430} y={20} textAnchor="end" className="fill-sky-800 text-[11px] font-semibold">Air et lumière</text>
            <text x={430} y={SURFACE + 22} textAnchor="end" className="fill-[#6b4a22] text-[11px] font-semibold">Sol</text>
            <text x={430} y={EAU + 20} textAnchor="end" className="fill-sky-900 text-[11px] font-semibold">Eau du sol</text>
            <text x={GRAINE.x + 24} y={GRAINE.y + 4} className="fill-[#6b4a22] text-[11px] font-semibold">graine</text>
            {m.radicule > 20 && <text x={GRAINE.x + 12} y={GRAINE.y + m.ry + m.radicule * 0.5} className="fill-[#6b4a22] text-[11px] font-semibold">radicule</text>}
            {m.sommetTige < SURFACE && m.feuilles === 0 && <text x={GRAINE.x + 10} y={Math.min(m.sommetTige + 14, GRAINE.y - 30)} className="fill-green-800 text-[11px] font-semibold">tige</text>}
            {m.feuilles > 0.6 && <text x={GRAINE.x + 56} y={m.sommetTige - 6} className="fill-green-800 text-[11px] font-semibold">feuilles</text>}
          </svg>
        }
        commandes={
          <>
            <Curseur nom="Temps (jours)" valeurTexte={`${nbJours} j`} min={0} max={T_MAX} pas={0.1} valeur={t} onChange={changerTemps} ariaLabel="Temps écoulé en jours, de 0 à 12" />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={faireCrotre}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-fh-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce motion-reduce:transition-none"
              >
                {libelleBouton}
              </button>
              <BoutonReinitialiser onClick={recommencer} label="Recommencer" />
            </div>
            <ol className="flex flex-col gap-1.5" aria-label="Les 5 étapes de la germination">
              {ETAPES.map((e, i) => (
                <li
                  key={e.titre}
                  aria-current={i === indice ? "step" : undefined}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors motion-reduce:transition-none ${i === indice ? "bg-white font-bold text-fh-bleu shadow-sm" : "text-fh-ardoise/70"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === indice ? "text-white" : "bg-fh-sable text-fh-ardoise"}`}
                    style={i === indice ? { backgroundColor: VERT } : undefined}
                  >
                    {i + 1}
                  </span>
                  {e.titre}
                </li>
              ))}
            </ol>
          </>
        }
        valeurs={
          <>
            <Valeur etiquette="Temps">{nbJours} jours</Valeur>
            <Valeur etiquette="Étape">{indice + 1} sur 5</Valeur>
            <Valeur etiquette="Réserves de la graine" large>
              {etape.reserves}
            </Valeur>
          </>
        }
        commentaire={<span className="font-semibold text-fh-bleu">{`Étape ${indice + 1} : ${etape.titre.charAt(0).toLowerCase()}${etape.titre.slice(1)}.`}</span>}
        bas={
          <>
            <p className="text-base font-bold" style={{ color: "#1f7a38" }}>Ce dont la plante a besoin à cette étape</p>
            <p className="mt-1 leading-8">
              <Tx>{etape.besoins}</Tx>
            </p>
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="Besoins de la plante à cette étape">
              <Pastille libelle="Eau" allumee={etape.eau} couleur="#2b6cb0" />
              <Pastille libelle="Température" allumee={etape.temperature} couleur="#d14205" />
              <Pastille libelle="Lumière" allumee={etape.lumiere} couleur="#b7791f" />
              <Pastille libelle="Sels minéraux" allumee={etape.sels} couleur="#8a5a2b" />
              <Pastille libelle={<Tx>{"Air ($\\mathrm{O_2}$)"}</Tx>} allumee={etape.air} couleur="#0e7490" />
            </ul>
          </>
        }
      />

      <EtapesEnDetail courante={indice} />

      <div className="rounded-xl border-l-4 bg-white/70 p-4 text-sm leading-relaxed text-fh-ardoise sm:p-5 sm:text-base" style={{ borderColor: VERT }}>
        <p className="font-bold text-fh-bleu">À retenir</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            <span className="font-semibold text-fh-bleu">Facteurs externes de la germination : </span>l&apos;eau, la lumière, la température.
          </li>
          <li>
            <span className="font-semibold text-fh-bleu">Facteurs internes : </span>l&apos;état et l&apos;âge de la graine.
          </li>
          <li>
            <span className="font-semibold text-fh-bleu">Étapes : </span>gonflement de la graine, apparition de la radicule, tige, feuilles.
          </li>
        </ul>
      </div>
    </div>
  );
}
