"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Quatre animations de chimie (polarité de l'eau, hydratation de NaCl, ionisation de HCl, autoprotolyse).
 * Schémas SVG en 2D : l'animation est une transition CSS entre un état « avant » et un état « après »
 * (aucune bibliothèque, aucun timer d'image). Elle est coupée si l'élève demande moins d'animations.
 */

const COULEUR_NEGATIF = "#1f2ca2"; // fh-bleu-vif
const COULEUR_POSITIF = "#d14205"; // fh-orange
const COULEUR_PROTON = "#d14205";
const OXYGENE = "#ef4444";
const HYDROGENE = "#e2e8f0";
const GRIS = "#64748b";

/** Transition commune : positions, rotations, opacités. */
const T = "transition-all duration-[1600ms] ease-in-out motion-reduce:transition-none";
const pos = (x: number, y: number, rot = 0) => ({ transform: `translate(${x}px, ${y}px) rotate(${rot}deg)` });

/** Deux états (avant / après) ; `rejouer` revient à l'état initial puis relance l'animation. */
function useAnimation() {
  const [apres, setApres] = useState(false);
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (minuterie.current) clearTimeout(minuterie.current); }, []);

  const lancer = () => setApres(true);
  const inverser = () => setApres(false);
  const rejouer = () => {
    if (minuterie.current) clearTimeout(minuterie.current);
    setApres(false);
    minuterie.current = setTimeout(() => setApres(true), 450);
  };
  return { apres, lancer, inverser, rejouer };
}

function Bouton({ onClick, children, principal = false }: { onClick: () => void; children: ReactNode; principal?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
        principal ? "border-fh-orange bg-fh-orange text-white hover:bg-fh-orange-fonce" : "border-fh-sable bg-white text-fh-bleu hover:bg-fh-accent"
      }`}
    >
      {children}
    </button>
  );
}

function Cadre({ titre, children, boutons, equation, note }: { titre: string; children: ReactNode; boutons: ReactNode; equation: ReactNode; note?: ReactNode }) {
  return (
    <div className="my-3 flex flex-col gap-3 rounded-2xl border border-fh-sable bg-white p-4">
      <p className="text-sm font-semibold text-fh-bleu">{titre}</p>
      {children}
      <div className="flex flex-wrap gap-2">{boutons}</div>
      <p className="rounded-lg bg-fh-creme px-3 py-2 text-center text-sm font-semibold text-fh-bleu">{equation}</p>
      {note && <p className="rounded-lg bg-fh-accent px-3 py-2 text-sm text-fh-bleu">{note}</p>}
    </div>
  );
}

/** Texte de l'atome, redressé : il annule la rotation de la molécule pour rester lisible. */
function Etiquette({ rot, taille, couleur = "#0f172a", children }: { rot: number; taille: number; couleur?: string; children: ReactNode }) {
  return (
    <text textAnchor="middle" dominantBaseline="central" fontSize={taille} fontWeight={700} fill={couleur} className={T} style={{ transform: `rotate(${-rot}deg)` }}>
      {children}
    </text>
  );
}

const L = 38; // longueur de liaison O–H
const DEMI_ANGLE = (104.5 / 2) * (Math.PI / 180);
const HX = L * Math.cos(DEMI_ANGLE); // 23,2
const HY = L * Math.sin(DEMI_ANGLE); // 30,0

/** Molécule d'eau : O à l'origine, bissectrice dirigée vers +x avant rotation (H–O–H = 104,5°). */
function Eau({ x, y, rot = 0, opacite = 1, texteO = "O", texteH = "H" }: { x: number; y: number; rot?: number; opacite?: number; texteO?: string; texteH?: string }) {
  return (
    <g className={T} style={{ ...pos(x, y, rot), opacity: opacite }}>
      <line x1={0} y1={0} x2={HX} y2={HY} stroke={GRIS} strokeWidth={3} />
      <line x1={0} y1={0} x2={HX} y2={-HY} stroke={GRIS} strokeWidth={3} />
      <circle r={16} fill={OXYGENE} stroke="#b91c1c" strokeWidth={1.5} />
      <Etiquette rot={rot} taille={texteO.length > 1 ? 13 : 13} couleur="#fff">{texteO}</Etiquette>
      {[HY, -HY].map((hy) => (
        <g key={hy} transform={`translate(${HX} ${hy})`}>
          <circle r={13} fill={HYDROGENE} stroke={GRIS} strokeWidth={1.2} />
          <Etiquette rot={rot} taille={texteH.length > 1 ? 12 : 12} couleur={texteH.length > 1 ? COULEUR_POSITIF : "#0f172a"}>{texteH}</Etiquette>
        </g>
      ))}
    </g>
  );
}

function Ion({ x, y, r, signe, nom, fond, bord, opacite = 1 }: { x: number; y: number; r: number; signe: "+" | "−"; nom: string; fond: string; bord: string; opacite?: number }) {
  return (
    <g className={T} style={{ ...pos(x, y), opacity: opacite }}>
      <circle r={r} fill={fond} stroke={bord} strokeWidth={2} />
      <text textAnchor="middle" dominantBaseline="central" fontSize={r > 16 ? 13 : 12} fontWeight={700} fill={bord}>
        {nom}
        <tspan fontSize={9} dy={-5}>{signe}</tspan>
      </text>
    </g>
  );
}

/** Pastille de charge (+ ou −) qui apparaît avec une transition. */
function Charge({ x, y, signe, visible }: { x: number; y: number; signe: "+" | "−"; visible: boolean }) {
  const couleur = signe === "+" ? COULEUR_POSITIF : COULEUR_NEGATIF;
  return (
    <g className={T} style={{ ...pos(x, y), opacity: visible ? 1 : 0 }}>
      <circle r={9} fill="#fff" stroke={couleur} strokeWidth={2} />
      <text textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} fill={couleur}>{signe}</text>
    </g>
  );
}

function Legende({ items }: { items: Array<[string, string]> }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fh-ardoise">
      {items.map(([couleur, texte]) => (
        <li key={texte} className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border border-fh-ardoise/30" style={{ background: couleur }} aria-hidden />
          {texte}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------------------------------------ 1. polarité */

export function PolariteEau() {
  const { apres, lancer, rejouer } = useAnimation();
  const fond = { opacity: apres ? 1 : 0 };
  return (
    <Cadre
      titre="La molécule d'eau est polaire"
      boutons={apres ? <Bouton onClick={rejouer}>Rejouer</Bouton> : <Bouton principal onClick={lancer}>Afficher les charges partielles</Bouton>}
      equation={<>H–O–H : l&apos;oxygène attire davantage les électrons que l&apos;hydrogène</>}
      note={apres ? <>La molécule a un côté négatif (δ⁻, autour de O) et un côté positif (δ⁺, autour des deux H) : elle est <strong>polaire</strong>.</> : undefined}
    >
      <svg viewBox="0 0 480 220" className="h-auto w-full" role="img" aria-label="Molécule d'eau avec l'oxygène au centre et deux hydrogènes formant un angle de 104,5 degrés ; les charges partielles δ moins sur O et δ plus sur H apparaissent à la demande">
        <defs>
          <marker id="pointe-polarite" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill={GRIS} />
          </marker>
        </defs>
        <rect width={480} height={220} rx={12} className="fill-fh-creme" />
        {/* zones négative (haut) / positive (bas) */}
        <rect x={150} y={28} width={180} height={72} rx={36} className={T} fill={COULEUR_NEGATIF} style={{ opacity: apres ? 0.1 : 0 }} />
        <rect x={150} y={106} width={180} height={78} rx={36} className={T} fill={COULEUR_POSITIF} style={{ opacity: apres ? 0.1 : 0 }} />
        <Eau x={240} y={70} rot={90} texteO={apres ? "δ⁻" : "O"} texteH={apres ? "δ⁺" : "H"} />
        <text x={240} y={36} textAnchor="middle" fontSize={13} fontWeight={700} fill={COULEUR_NEGATIF} className={T} style={fond}>δ⁻</text>
        <text x={158} y={146} textAnchor="end" fontSize={13} fontWeight={700} fill={COULEUR_POSITIF} className={T} style={fond}>δ⁺</text>
        <text x={322} y={146} textAnchor="start" fontSize={13} fontWeight={700} fill={COULEUR_POSITIF} className={T} style={fond}>δ⁺</text>
        {/* flèche de polarité : de δ⁻ vers δ⁺ */}
        <g className={T} style={fond}>
          <line x1={240} y1={96} x2={240} y2={158} stroke={GRIS} strokeWidth={3} markerEnd="url(#pointe-polarite)" />
          <text x={252} y={170} fontSize={12} fill={GRIS}>sens de la polarité</text>
        </g>
        <g className={T} style={fond}>
          <text x={340} y={60} fontSize={13} fontWeight={700} fill={COULEUR_NEGATIF}>Côté négatif</text>
          <text x={340} y={77} fontSize={11} fill={COULEUR_NEGATIF}>(l&apos;atome d&apos;oxygène)</text>
          <text x={340} y={192} fontSize={13} fontWeight={700} fill={COULEUR_POSITIF}>Côté positif</text>
          <text x={340} y={209} fontSize={11} fill={COULEUR_POSITIF}>(les deux H)</text>
        </g>
      </svg>
      <Legende items={[[OXYGENE, "Oxygène"], [HYDROGENE, "Hydrogène"]]} />
    </Cadre>
  );
}

/* ------------------------------------------------------------------------------------------------ 2. hydratation */

const CENTRE = { x: 240, y: 130 };
const ECART = 46;
const DISPERSION = 2.4;
// 3 colonnes × 2 lignes en damier : Na⁺ / Cl⁻ en alternance
const RESEAU = [
  { c: 0, l: 0, na: true }, { c: 1, l: 0, na: false }, { c: 2, l: 0, na: true },
  { c: 0, l: 1, na: false }, { c: 1, l: 1, na: true }, { c: 2, l: 1, na: false },
].map(({ c, l, na }) => {
  const dx = (c - 1) * ECART;
  const dy = (l - 0.5) * ECART;
  const norme = Math.hypot(dx, dy) || 1;
  const ux = dx === 0 ? 0 : dx / norme;
  const uy = dx === 0 ? (dy < 0 ? -1 : 1) : dy / norme;
  const angle = (Math.atan2(uy, ux) * 180) / Math.PI; // direction « vers l'extérieur »
  return { na, ux, uy, angle, cristal: { x: CENTRE.x + dx, y: CENTRE.y + dy }, disperse: { x: CENTRE.x + dx * DISPERSION, y: CENTRE.y + dy * DISPERSION } };
});

export function HydratationNaCl() {
  const { apres, lancer, rejouer } = useAnimation();
  return (
    <Cadre
      titre="Dissolution du chlorure de sodium dans l'eau"
      boutons={apres ? <Bouton onClick={rejouer}>Rejouer</Bouton> : <Bouton principal onClick={lancer}>Dissoudre</Bouton>}
      equation={<>NaCl(s) → Na⁺(aq) + Cl⁻(aq)</>}
      note={apres ? <>Les molécules d&apos;eau entourent chaque ion : le côté <strong>δ⁻ (O)</strong> vers les ions Na⁺, le côté <strong>δ⁺ (H)</strong> vers les ions Cl⁻. L&apos;ion est <strong>hydraté</strong>, le cristal se disperse.</> : <>Le cristal de chlorure de sodium est formé d&apos;ions Na⁺ et Cl⁻ en alternance.</>}
    >
      <svg viewBox="0 0 480 260" className="h-auto w-full" role="img" aria-label="Cristal de chlorure de sodium qui se dissout : les ions Na plus et Cl moins se séparent et des molécules d'eau s'orientent autour d'eux">
        <rect width={480} height={260} rx={12} className="fill-fh-creme" />
        {RESEAU.map((ion, i) => {
          // O vers Na⁺ : la bissectrice (côté H) pointe à l'opposé de l'ion → angle vers l'extérieur.
          // H vers Cl⁻ : la bissectrice pointe vers l'ion → angle opposé.
          const distance = ion.na ? 37 : 52;
          const rot = ion.na ? ion.angle : ion.angle + 180;
          const sens = ion.na ? 1 : 1;
          const final = { x: ion.disperse.x + ion.ux * distance * sens, y: ion.disperse.y + ion.uy * distance * sens };
          const depart = { x: ion.disperse.x + ion.ux * (distance + 60), y: ion.disperse.y + ion.uy * (distance + 60) };
          const p = apres ? final : depart;
          return <Eau key={`e${i}`} x={p.x} y={p.y} rot={rot} opacite={apres ? 1 : 0} texteO="δ⁻" texteH="δ⁺" />;
        })}
        {RESEAU.map((ion, i) => {
          const p = apres ? ion.disperse : ion.cristal;
          return ion.na ? (
            <Ion key={`i${i}`} x={p.x} y={p.y} r={14} signe="+" nom="Na" fond="#fed7aa" bord={COULEUR_POSITIF} />
          ) : (
            <Ion key={`i${i}`} x={p.x} y={p.y} r={19} signe="−" nom="Cl" fond="#bfdbfe" bord={COULEUR_NEGATIF} />
          );
        })}
      </svg>
      <Legende items={[["#fed7aa", "Ion sodium Na⁺"], ["#bfdbfe", "Ion chlorure Cl⁻"], [OXYGENE, "O (δ⁻)"], [HYDROGENE, "H (δ⁺)"]]} />
    </Cadre>
  );
}

/* ------------------------------------------------------------------------------------------------ 3. ionisation de HCl */

export function IonisationHCl() {
  const { apres, lancer, rejouer } = useAnimation();
  const Y = 100;
  const CL = { x: 90, y: Y };
  const O = { x: 360, y: Y };
  const protonAvant = { x: 90 + 40, y: Y };
  const protonApres = { x: O.x - L, y: Y }; // 3ᵉ H de H₃O⁺, du côté du doublet de l'oxygène
  const p = apres ? protonApres : protonAvant;
  return (
    <Cadre
      titre="HCl dans l'eau : transfert d'un proton"
      boutons={apres ? <Bouton onClick={rejouer}>Rejouer</Bouton> : <Bouton principal onClick={lancer}>Transférer le proton</Bouton>}
      equation={<>HCl + H₂O → H₃O⁺ + Cl⁻</>}
      note={apres ? <>HCl a cédé son proton H⁺ à l&apos;eau : il se forme l&apos;ion oxonium <strong>H₃O⁺</strong> et l&apos;ion chlorure <strong>Cl⁻</strong>. HCl est un acide.</> : <>Une molécule de chlorure d&apos;hydrogène (HCl) et une molécule d&apos;eau.</>}
    >
      <svg viewBox="0 0 480 200" className="h-auto w-full" role="img" aria-label="Le proton H plus de la molécule HCl passe à la molécule d'eau : il se forme H3O plus et Cl moins">
        <rect width={480} height={200} rx={12} className="fill-fh-creme" />
        {/* liaison H–Cl qui se rompt, liaison O–H qui se forme */}
        <line x1={CL.x} y1={Y} x2={protonAvant.x} y2={Y} stroke={GRIS} strokeWidth={3} className={T} style={{ opacity: apres ? 0 : 1 }} />
        <line x1={O.x} y1={Y} x2={protonApres.x} y2={Y} stroke={GRIS} strokeWidth={3} className={T} style={{ opacity: apres ? 1 : 0 }} />
        {/* trajet du proton */}
        <path d={`M${protonAvant.x} ${Y - 14} Q ${(protonAvant.x + protonApres.x) / 2} ${Y - 62} ${protonApres.x} ${Y - 14}`} fill="none" stroke={COULEUR_PROTON} strokeWidth={2} strokeDasharray="6 5" className={T} style={{ opacity: apres ? 0.9 : 0.35 }} />
        <text x={(protonAvant.x + protonApres.x) / 2} y={Y - 56} textAnchor="middle" fontSize={12} fontWeight={700} fill={COULEUR_PROTON}>proton H⁺</text>
        {/* Cl */}
        <g transform={`translate(${CL.x} ${CL.y})`}>
          <circle r={22} fill={apres ? "#bfdbfe" : "#bbf7d0"} stroke={apres ? COULEUR_NEGATIF : "#15803d"} strokeWidth={2} className={T} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} fill="#0f172a">Cl</text>
        </g>
        <Charge x={CL.x - 24} y={CL.y - 24} signe="−" visible={apres} />
        {/* eau : O + 2 H (H en +x), avec le doublet libre du côté gauche */}
        <Eau x={O.x} y={O.y} rot={0} />
        <Charge x={O.x + 30} y={O.y - 56} signe="+" visible={apres} />
        {/* proton qui se déplace */}
        <g className={T} style={pos(p.x, p.y)}>
          <circle r={11} fill={HYDROGENE} stroke={COULEUR_PROTON} strokeWidth={3} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#0f172a">H</text>
        </g>
        {/* noms */}
        <g fontSize={13} fontWeight={700} textAnchor="middle">
          <text x={110} y={165} className={T} fill="#0f172a" style={{ opacity: apres ? 0 : 1 }}>HCl</text>
          <text x={110} y={165} className={T} fill={COULEUR_NEGATIF} style={{ opacity: apres ? 1 : 0 }}>Cl⁻</text>
          <text x={350} y={165} className={T} fill="#0f172a" style={{ opacity: apres ? 0 : 1 }}>H₂O</text>
          <text x={350} y={165} className={T} fill={COULEUR_POSITIF} style={{ opacity: apres ? 1 : 0 }}>H₃O⁺</text>
        </g>
      </svg>
      <Legende items={[[OXYGENE, "Oxygène"], [HYDROGENE, "Hydrogène"], ["#bbf7d0", "Chlore"]]} />
    </Cadre>
  );
}

/* ------------------------------------------------------------------------------------------------ 4. autoprotolyse */

export function AutoprotolyseEau() {
  const { apres, lancer, inverser, rejouer } = useAnimation();
  const Y = 105;
  const A = { x: 140, y: Y }; // donne un proton
  const B = { x: 340, y: Y }; // le reçoit
  const protonAvant = { x: A.x + HX, y: Y + HY };
  const protonApres = { x: B.x - L, y: Y };
  const p = apres ? protonApres : protonAvant;
  return (
    <Cadre
      titre="L'autoprotolyse de l'eau"
      boutons={
        <>
          {apres ? <Bouton onClick={rejouer}>Rejouer</Bouton> : <Bouton principal onClick={lancer}>Transférer le proton</Bouton>}
          {apres && <Bouton onClick={inverser}>Sens inverse ⇌</Bouton>}
        </>
      }
      equation={<>2 H₂O ⇌ H₃O⁺ + OH⁻</>}
      note={<>Dans l&apos;eau pure, il y a autant de H₃O⁺ que de OH⁻. {apres ? "La réaction est réversible : le proton peut repasser de H₃O⁺ à OH⁻ (bouton « Sens inverse »)." : "Deux molécules d'eau voisines : l'une peut céder un proton à l'autre."}</>}
    >
      <svg viewBox="0 0 480 210" className="h-auto w-full" role="img" aria-label="Deux molécules d'eau voisines : un proton passe de l'une à l'autre et forme H3O plus et OH moins ; la flèche double indique que la réaction est réversible">
        <rect width={480} height={210} rx={12} className="fill-fh-creme" />
        {/* liaison O–H de la molécule A qui se rompt, liaison O–H de B qui se forme */}
        <line x1={A.x} y1={A.y} x2={protonAvant.x} y2={protonAvant.y} stroke={GRIS} strokeWidth={3} className={T} style={{ opacity: apres ? 0 : 1 }} />
        <line x1={B.x} y1={B.y} x2={protonApres.x} y2={protonApres.y} stroke={GRIS} strokeWidth={3} className={T} style={{ opacity: apres ? 1 : 0 }} />
        {/* A : on masque son H du bas dans l'état final en le déplaçant (le vrai proton est dessiné à part) */}
        <g transform={`translate(${A.x} ${A.y})`}>
          <line x1={0} y1={0} x2={HX} y2={-HY} stroke={GRIS} strokeWidth={3} />
          <circle r={16} fill={OXYGENE} stroke="#b91c1c" strokeWidth={1.5} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill="#fff">O</text>
          <g transform={`translate(${HX} ${-HY})`}>
            <circle r={10} fill={HYDROGENE} stroke={GRIS} strokeWidth={1.2} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#0f172a">H</text>
          </g>
        </g>
        <Eau x={B.x} y={B.y} rot={0} />
        <Charge x={A.x - 26} y={A.y - 26} signe="−" visible={apres} />
        <Charge x={B.x + 30} y={B.y - 58} signe="+" visible={apres} />
        {/* proton qui se déplace */}
        <g className={T} style={pos(p.x, p.y)}>
          <circle r={11} fill={HYDROGENE} stroke={COULEUR_PROTON} strokeWidth={3} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#0f172a">H</text>
        </g>
        <path d={`M${protonAvant.x + 6} ${protonAvant.y + 16} Q ${(protonAvant.x + protonApres.x) / 2} ${Y + 78} ${protonApres.x - 4} ${protonApres.y + 18}`} fill="none" stroke={COULEUR_PROTON} strokeWidth={2} strokeDasharray="6 5" className={T} style={{ opacity: apres ? 0.9 : 0.35 }} />
        <text x={(protonAvant.x + protonApres.x) / 2} y={Y + 76} textAnchor="middle" fontSize={12} fontWeight={700} fill={COULEUR_PROTON}>proton H⁺</text>
        {/* flèche réversible */}
        <text x={240} y={36} textAnchor="middle" fontSize={26} fontWeight={700} fill={GRIS} aria-hidden>⇌</text>
        {/* noms */}
        <g fontSize={13} fontWeight={700} textAnchor="middle">
          <text x={A.x} y={190} className={T} fill="#0f172a" style={{ opacity: apres ? 0 : 1 }}>H₂O</text>
          <text x={A.x} y={190} className={T} fill={COULEUR_NEGATIF} style={{ opacity: apres ? 1 : 0 }}>OH⁻</text>
          <text x={B.x + 12} y={190} className={T} fill="#0f172a" style={{ opacity: apres ? 0 : 1 }}>H₂O</text>
          <text x={B.x + 12} y={190} className={T} fill={COULEUR_POSITIF} style={{ opacity: apres ? 1 : 0 }}>H₃O⁺</text>
        </g>
      </svg>
      <Legende items={[[OXYGENE, "Oxygène"], [HYDROGENE, "Hydrogène"]]} />
    </Cadre>
  );
}
