"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";

import { chemin, Curseur, Valeur } from "./commun";

/**
 * Dosage de 20 mL d'acide chlorhydrique (0,1 mol/L) par la soude (0,1 mol/L), indicateur coloré : bleu de bromothymol.
 * Entièrement local (React + SVG, aucun appel réseau). UN SEUL moteur de titrage dans le projet, deux présentations :
 *  - `TitrageDemo` (par défaut) : vitrine de la page d'accueil, auto-démo en boucle ;
 *  - `TitrageLabo` : onglet « Titrage » du laboratoire de chimie des cours (fence labochimie), versement à la demande.
 *
 * Le composant est TOUJOURS rendu (scène, courbe, commandes) : l'IntersectionObserver ne fait que démarrer / arrêter
 * la boucle d'animation. Avec « réduire les animations », rien ne se lance seul.
 */

/* ------------------------------------------------------------------------------------------------ modèle chimique */

const CA = 0.1; // mol/L, acide chlorhydrique
const VA = 20; // mL
const CB = 0.1; // mol/L, soude
const KW = 1e-14;
const V_EQ = 20; // mL
const V_MAX = 40; // mL

/** pH exact du mélange après versement de v mL de soude (bilan de charge avec l'autoprotolyse de l'eau). */
export function phTitrage(v: number): number {
  const d = (CA * VA - CB * v) / (VA + v); // [H₃O⁺] − [OH⁻] = excès d'acide (ou de base si < 0) en mol/L
  const s = Math.sqrt(d * d + 4 * KW);
  const h = d >= 0 ? (d + s) / 2 : (2 * KW) / (s - d); // forme stable pour d < 0 (évite l'annulation numérique)
  return -Math.log10(h);
}

const virgule = (x: number, d: number) => x.toFixed(d).replace(".", ",");

function nature(ph: number): "Acide" | "Neutre" | "Basique" {
  if (ph < 6.5) return "Acide";
  if (ph > 7.5) return "Basique";
  return "Neutre";
}
const COULEUR_NATURE = { Acide: "text-red-700", Neutre: "text-green-700", Basique: "text-blue-800" } as const;

/** Couleur du bleu de bromothymol : jaune (acide), vert (équivalence, pH 7), bleu (basique). */
const BBT: Array<[number, [number, number, number]]> = [
  [6.2, [250, 204, 21]], // jaune
  [7.0, [34, 197, 94]], // vert
  [7.8, [37, 99, 235]], // bleu
];
function couleurBBT(ph: number): string {
  if (ph <= BBT[0][0]) return `rgb(${BBT[0][1].join(",")})`;
  for (let k = 1; k < BBT.length; k++) {
    const [p1, c1] = BBT[k];
    if (ph <= p1) {
      const [p0, c0] = BBT[k - 1];
      const f = (ph - p0) / (p1 - p0);
      return `rgb(${c0.map((c, i) => Math.round(c + (c1[i] - c) * f)).join(",")})`;
    }
  }
  return `rgb(${BBT[BBT.length - 1][1].join(",")})`;
}

/** Points de la courbe pH = f(V), plus denses autour de l'équivalence pour dessiner le saut. */
const POINTS: Array<[number, number]> = (() => {
  const volumes: number[] = [];
  for (let i = 0; i < 76; i++) volumes.push(i * 0.25); // 0 → 18,75
  for (let i = 0; i <= 250; i++) volumes.push(18.75 + i * 0.005); // 18,75 → 20 (pas fin)
  for (let i = 1; i <= 250; i++) volumes.push(20 + i * 0.005); // 20 → 21,25
  for (let i = 1; i <= 75; i++) volumes.push(21.25 + i * 0.25); // 21,5 → 40
  return volumes.map((v) => [v, phTitrage(v)]);
})();

/* ------------------------------------------------------------------------------------------------ versement automatique */

const DEBUT = 800; // ms à V = 0
const VERSE = 13000; // ms de versement
const FIN = 3200; // ms de pause à V = 40 avant la remise à zéro (vitrine)
const CYCLE = DEBUT + VERSE + FIN;

/** Volume versé (mL) à l'instant t du cycle : rapide au début, très lent autour de V = 20 mL, puis rapide jusqu'à 40 mL. */
function volumeAuto(t: number): number {
  if (t < DEBUT) return 0;
  if (t >= DEBUT + VERSE) return V_MAX;
  const p = (t - DEBUT) / VERSE;
  if (p < 0.4) return 19 * (p / 0.4);
  if (p < 0.78) {
    const x = 2 * ((p - 0.4) / 0.38) - 1; // −1 → 1
    if (Math.abs(x) < 0.06) return V_EQ; // courte halte pile à l'équivalence : pH 7, indicateur vert
    return 20 + Math.sign(x) * Math.pow(Math.abs(x), 2.5); // 19 → 21, vitesse presque nulle en 20
  }
  return 21 + 19 * ((p - 0.78) / 0.22);
}

/** Instant du cycle où le volume atteint v (volumeAuto est croissante) : permet de reprendre le versement là où l'on en est. */
function tempsPourVolume(v: number): number {
  let bas = 0;
  let haut = DEBUT + VERSE;
  for (let k = 0; k < 40; k++) {
    const milieu = (bas + haut) / 2;
    if (volumeAuto(milieu) < v - 1e-9) bas = milieu;
    else haut = milieu;
  }
  return haut;
}

const REDUIT = "(prefers-reduced-motion: reduce)";
function abonnerReduit(rappel: () => void) {
  const m = window.matchMedia(REDUIT);
  m.addEventListener("change", rappel);
  return () => m.removeEventListener("change", rappel);
}
const lireReduit = () => window.matchMedia(REDUIT).matches;
const lireReduitServeur = () => false;

/* ------------------------------------------------------------------------------------------------ dessin */

const LC = 360; // courbe
const HC = 250;
const ML = 40;
const MR = 14;
const MT = 14;
const MB = 34;
const X = (v: number) => ML + (v / V_MAX) * (LC - ML - MR);
const Y = (p: number) => MT + ((14 - p) / 14) * (HC - MT - MB);
const COURBE_COMPLETE = chemin(POINTS.map(([v, p]) => [X(v), Y(p)]));

const Y_BURETTE = 30; // haut de la burette (0 mL)
const PX_PAR_ML = 5; // 40 mL = 200 px
const Y_BEC = 268; // bout de la pointe de la burette, d'où partent les gouttes

type Mode = "vitrine" | "labo";

function TitrageSimulation({ mode }: { mode: Mode }) {
  const vitrine = mode === "vitrine";
  const racine = useRef<HTMLDivElement>(null);
  const temps = useRef(0);
  const minuteurGoutte = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false); // même valeur côté serveur et navigateur ; sans IntersectionObserver, rien ne démarre seul
  const [auto, setAuto] = useState(vitrine);
  const [demandee, setDemandee] = useState(false); // bouton cliqué : lance le versement même en mode « réduire les animations »
  const [versant, setVersant] = useState(false); // des gouttes tombent
  const [volume, setVolume] = useState<number | null>(null);
  const reduit = useSyncExternalStore(abonnerReduit, lireReduit, lireReduitServeur);

  // Visible à l'écran ? Ne sert qu'à démarrer / arrêter l'animation, jamais à masquer le composant.
  useEffect(() => {
    const el = racine.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entree]) => setVisible(entree.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => () => { if (minuteurGoutte.current) clearTimeout(minuteurGoutte.current); }, []);

  // Boucle d'animation : seulement si visible, en versement automatique, et sans « réduire les animations » (sauf demande explicite).
  const animer = visible && auto && (!reduit || demandee);
  useEffect(() => {
    if (!animer) return;
    let image = 0;
    let dernier = performance.now();
    let precedent = volumeAuto(temps.current);
    const boucle = (maintenant: number) => {
      const dt = Math.min(maintenant - dernier, 100); // un onglet resté en arrière-plan ne fait pas sauter la démo
      dernier = maintenant;
      if (vitrine) {
        temps.current = (temps.current + dt) % CYCLE;
      } else {
        temps.current += dt;
        if (temps.current >= DEBUT + VERSE) { // fin du versement : on s'arrête à 40 mL
          setVolume(V_MAX);
          setVersant(false);
          setAuto(false);
          return;
        }
      }
      const v = volumeAuto(temps.current);
      setVersant(v > precedent + 1e-6 && v < V_MAX);
      precedent = v;
      setVolume(v);
      image = requestAnimationFrame(boucle);
    };
    image = requestAnimationFrame(boucle);
    return () => {
      cancelAnimationFrame(image);
      setVersant(false);
    };
  }, [animer, vitrine]);

  const v = volume ?? (vitrine && reduit ? V_EQ : 0);
  const ph = phTitrage(v);
  const nat = nature(ph);
  const etat = Math.abs(v - V_EQ) < 0.0005 ? "À l'équivalence" : v < V_EQ ? "Avant l'équivalence" : "Après l'équivalence";
  const eq = Math.max(0, Math.min(1, 1.6 - Math.abs(v - V_EQ) / 2.5)); // repères d'équivalence : visibles à moins de 4 mL, fondus au-delà
  const couleur = couleurBBT(ph);

  const manuel = (nouveau: number) => {
    setAuto(false);
    setVolume(nouveau);
    setVersant(nouveau < V_MAX);
    if (minuteurGoutte.current) clearTimeout(minuteurGoutte.current);
    minuteurGoutte.current = setTimeout(() => setVersant(false), 900); // des gouttes tombent un instant après chaque mouvement du curseur
  };
  const lancer = () => {
    // vitrine : rejoue depuis le début ; labo : reprend le versement là où l'on en est (ou depuis 0 si la burette est vide).
    temps.current = vitrine || v >= V_MAX ? 0 : tempsPourVolume(v);
    if (vitrine || v >= V_MAX) setVolume(0);
    setDemandee(true);
    setAuto(true);
  };
  const reinitialiser = () => {
    setAuto(false);
    setVersant(false);
    setVolume(0);
  };

  const niveauBurette = Y_BURETTE + PX_PAR_ML * v;
  const surfaceBecher = 322 - 0.4 * v;
  const chute = surfaceBecher - Y_BEC - 2;
  const trace = chemin([...POINTS.filter(([pv]) => pv < v).map(([pv, pp]): [number, number] => [X(pv), Y(pp)]), [X(v), Y(ph)]]);

  const statut = animer
    ? vitrine ? "Démo automatique en cours" : "Versement automatique en cours"
    : vitrine
      ? auto && !reduit ? "Démo en attente (hors de l'écran)" : "Mode manuel : la démo est en pause"
      : "Verse avec le curseur ou lance le versement automatique";

  return (
    <div ref={racine} className="rounded-2xl border border-fh-sable bg-fh-creme p-3 shadow-sm sm:p-6 lg:p-8">
      <div className="grid gap-6 min-[760px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-[760px]:items-start">
        {/* paillasse */}
        <div className="min-w-0 rounded-xl border border-fh-sable bg-white p-2 sm:p-3">
          <svg viewBox="0 0 240 400" className="mx-auto h-auto w-full max-w-[300px]" role="img" aria-label={`Dosage de l'acide chlorhydrique par la soude : ${virgule(v, 1)} millilitres versés, pH ${virgule(ph, 1)}, solution ${nat.toLowerCase()}`}>
            {/* potence */}
            <rect x={20} y={360} width={200} height={10} rx={3} fill="#475569" />
            <rect x={44} y={40} width={7} height={322} fill="#94a3b8" />
            <rect x={44} y={70} width={90} height={6} fill="#94a3b8" />
            <rect x={118} y={62} width={34} height={20} rx={4} fill="#64748b" />
            {/* burette : 0 mL en haut ; elle se vide, la surface descend quand on verse */}
            <rect x={120} y={Y_BURETTE} width={30} height={200} rx={3} fill="#fff" stroke="#0f172a" strokeWidth={2} />
            <rect x={121} y={niveauBurette} width={28} height={230 - niveauBurette} fill="#60a5fa" opacity={0.85} />
            {Array.from({ length: 9 }, (_, k) => k * 5).map((ml) => (
              <g key={ml}>
                <line x1={120} y1={Y_BURETTE + PX_PAR_ML * ml} x2={ml % 10 === 0 ? 132 : 127} y2={Y_BURETTE + PX_PAR_ML * ml} stroke="#0f172a" strokeWidth={1} />
                {ml % 10 === 0 && (
                  <text x={115} y={Y_BURETTE + PX_PAR_ML * ml + 3} textAnchor="end" fontSize={9} className="fill-fh-ardoise">
                    {ml}
                  </text>
                )}
              </g>
            ))}
            <text x={158} y={44} fontSize={10} fontWeight={700} className="fill-fh-bleu">
              NaOH
            </text>
            <text x={158} y={56} fontSize={9} className="fill-fh-ardoise">
              0,1 mol/L
            </text>
            {/* robinet et pointe */}
            <rect x={112} y={232} width={46} height={8} rx={3} className="fill-fh-orange" />
            <path d="M131 240 H139 L136 262 H134 Z" fill="#fff" stroke="#0f172a" strokeWidth={1.5} />
            {/* bécher */}
            <rect x={61} y={surfaceBecher} width={118} height={358 - surfaceBecher} fill={couleur} opacity={0.95} />
            <path d="M60 296 V355 a5 5 0 0 0 5 5 H175 a5 5 0 0 0 5 -5 V296" fill="none" stroke="#0f172a" strokeWidth={2.5} />
            {/* gouttes : elles TOMBENT de la pointe vers le liquide du bécher */}
            {versant &&
              [0, 0.37].map((retard) => (
                <circle key={retard} cx={135} cy={Y_BEC} r={3.4} fill="#3b82f6" stroke="#fff" strokeWidth={1} className="goutte" style={{ "--chute": `${chute}px`, animationDelay: `${retard}s` } as CSSProperties} />
              ))}
            <text x={120} y={390} textAnchor="middle" fontSize={10} className="fill-fh-ardoise">
              HCl 0,1 mol/L, 20 mL + BBT
            </text>
          </svg>
          <p className="px-2 pb-1 text-center text-xs text-fh-ardoise">HCl + NaOH → NaCl + H₂O</p>
        </div>

        {/* courbe + lectures */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-xl border border-fh-sable bg-white p-2 sm:p-3">
            <svg viewBox={`0 0 ${LC} ${HC}`} className="h-auto w-full" role="img" aria-label="Courbe du pH en fonction du volume de soude versé, avec un saut de pH à l'équivalence, pour 20 millilitres">
              <rect x={ML} y={MT} width={LC - ML - MR} height={HC - MT - MB} className="fill-white stroke-fh-sable" />
              {[0, 10, 20, 30, 40].map((g) => (
                <g key={g}>
                  <line x1={X(g)} y1={MT} x2={X(g)} y2={HC - MB} className="stroke-fh-sable/70" strokeWidth={0.7} />
                  <text x={X(g)} y={HC - MB + 13} textAnchor="middle" fontSize={9} className="fill-fh-ardoise">
                    {g}
                  </text>
                </g>
              ))}
              {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((g) => (
                <g key={g}>
                  <line x1={ML} y1={Y(g)} x2={LC - MR} y2={Y(g)} className="stroke-fh-sable/70" strokeWidth={0.7} />
                  <text x={ML - 5} y={Y(g) + 3} textAnchor="end" fontSize={9} className="fill-fh-ardoise">
                    {g}
                  </text>
                </g>
              ))}
              <text x={(ML + LC - MR) / 2} y={HC - 4} textAnchor="middle" fontSize={10} className="fill-fh-ardoise">
                Volume de soude versé (mL)
              </text>
              <text x={10} y={MT + 4} fontSize={10} className="fill-fh-ardoise">
                pH
              </text>
              {/* repères d'équivalence : V = 20 mL, pH = 7 */}
              <g style={{ opacity: eq, transition: "opacity 400ms" }} className="motion-reduce:transition-none">
                <line x1={X(V_EQ)} y1={MT} x2={X(V_EQ)} y2={HC - MB} className="stroke-fh-orange" strokeWidth={1.2} strokeDasharray="4 3" />
                <line x1={ML} y1={Y(7)} x2={LC - MR} y2={Y(7)} className="stroke-fh-orange" strokeWidth={1.2} strokeDasharray="4 3" />
                <text x={X(V_EQ) + 5} y={MT + 12} fontSize={10} fontWeight={700} className="fill-fh-orange-fonce">
                  V = 20 mL
                </text>
                <text x={LC - MR - 4} y={Y(7) + 13} textAnchor="end" fontSize={10} fontWeight={700} className="fill-fh-orange-fonce">
                  pH = 7
                </text>
              </g>
              <path d={COURBE_COMPLETE} fill="none" className="stroke-fh-bleu/25" strokeWidth={2} strokeLinejoin="round" />
              <path d={trace} fill="none" className="stroke-fh-bleu" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={X(v)} cy={Y(ph)} r={6} fill={couleur} className="stroke-fh-bleu" strokeWidth={2} />
            </svg>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-sm">
            <Valeur etiquette="Volume versé">{virgule(v, Math.abs(v - V_EQ) < 0.1 ? 3 : 2)} mL</Valeur>
            <Valeur etiquette="pH">
              <span className={COULEUR_NATURE[nat]}>{virgule(ph, 2)}</span>
            </Valeur>
            <Valeur etiquette="Nature de la solution">
              <span className={COULEUR_NATURE[nat]}>{nat}</span>
            </Valeur>
            <Valeur etiquette="Étape du dosage">{etat}</Valeur>
          </dl>

          <Curseur
            nom="Volume de soude versé"
            valeurTexte={`${virgule(v, 1)} mL`}
            min={0}
            max={V_MAX}
            pas={0.1}
            valeur={Math.round(v * 10) / 10}
            onChange={manuel}
            ariaLabel="Volume de soude versé en millilitres"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={lancer}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-fh-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce motion-reduce:transition-none"
            >
              {vitrine ? "Rejouer la démo" : "Verser automatiquement"}
            </button>
            <button
              type="button"
              onClick={reinitialiser}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-fh-bleu/40 px-5 text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-bleu/5 motion-reduce:transition-none"
            >
              {vitrine ? "Réinitialiser" : "Recommencer"}
            </button>
            <span className="text-xs text-fh-ardoise" aria-live="polite">
              {statut}
            </span>
          </div>

          <p className="rounded-xl bg-fh-accent/60 p-3 text-sm leading-relaxed text-fh-ardoise">
            {v < V_EQ - 0.0005
              ? "L'acide est en excès : le pH est bas et le bleu de bromothymol est jaune. Il monte lentement tant qu'on verse peu de soude."
              : v <= V_EQ + 0.0005
                ? "À l'équivalence, l'acide et la base sont en quantités égales : le pH vaut 7 et l'indicateur est vert. Quelques gouttes suffisent à faire basculer le pH."
                : "La soude est en excès : le pH est élevé et l'indicateur est bleu."}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Onglet « Titrage » du laboratoire de chimie : même moteur partout. Dans les cours, versement à la demande ;
 * sur la page d'accueil (`vitrine`), auto-démo en boucle.
 */
export function TitrageLabo({ vitrine = false }: { vitrine?: boolean }) {
  return <TitrageSimulation mode={vitrine ? "vitrine" : "labo"} />;
}
