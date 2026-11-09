import { useId, type ReactNode } from "react";

import { CC } from "./ui";

/**
 * Primitives SVG des particules. Chaque ion porte son signe (+ ou −) DANS le disque et sa formule en légende : l'information
 * ne repose jamais sur la seule couleur. Convention de couleurs : O rouge, H blanc, Na⁺ violet, Cl⁻ vert (convention graphique).
 */

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Molécule d'eau. Repère local : l'axe +y va de l'oxygène vers le milieu des deux hydrogènes (côté δ+). rot en degrés. */
export function Eau({ x, y, rot = 0, s = 1, o = 1, delta = false }: { x: number; y: number; rot?: number; s?: number; o?: number; delta?: boolean }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})`} opacity={o} aria-hidden="true">
      <line x1={0} y1={0} x2={-9.9} y2={7.7} stroke="#94A3B8" strokeWidth={2.2} />
      <line x1={0} y1={0} x2={9.9} y2={7.7} stroke="#94A3B8" strokeWidth={2.2} />
      <circle cx={-9.9} cy={7.7} r={4.8} fill={CC.hydrogene} stroke={CC.hydrogeneBord} strokeWidth={1.2} />
      <circle cx={9.9} cy={7.7} r={4.8} fill={CC.hydrogene} stroke={CC.hydrogeneBord} strokeWidth={1.2} />
      <circle cx={0} cy={0} r={8} fill={CC.oxygene} stroke="#7F1D1D" strokeWidth={1} />
      {delta && (
        <g fontSize={8} fontWeight={700}>
          <text x={0} y={-11} textAnchor="middle" fill={CC.oxygene}>
            δ−
          </text>
          <text x={-15} y={22} textAnchor="middle" fill="#475569">
            δ+
          </text>
          <text x={15} y={22} textAnchor="middle" fill="#475569">
            δ+
          </text>
        </g>
      )}
    </g>
  );
}

/** Ion monoatomique : disque coloré avec son signe de charge, formule facultative en dessous. */
export function IonDisque({ x, y, r, fill, charge, formule, o = 1, texteFonce = false }: { x: number; y: number; r: number; fill: string; charge: string; formule?: string; o?: number; texteFonce?: boolean }) {
  return (
    <g opacity={o} aria-hidden="true">
      <circle cx={x} cy={y} r={r} fill={fill} stroke="#fff" strokeWidth={1.4} />
      <text x={x} y={y + r * 0.42} textAnchor="middle" fontSize={r * 1.25} fontWeight={800} fill={texteFonce ? "#1E293B" : "#fff"}>
        {charge}
      </text>
      {formule && (
        <text x={x} y={y + r + 11} textAnchor="middle" fontSize={10} fontWeight={700} fill={CC.encre}>
          {formule}
        </text>
      )}
    </g>
  );
}

export const Sodium = (p: { x: number; y: number; formule?: string; o?: number; r?: number }) => <IonDisque x={p.x} y={p.y} r={p.r ?? 8.5} fill={CC.sodium} charge="+" formule={p.formule} o={p.o} />;
export const Chlorure = (p: { x: number; y: number; formule?: string; o?: number; r?: number }) => <IonDisque x={p.x} y={p.y} r={p.r ?? 11.5} fill={CC.chlorure} charge="−" formule={p.formule} o={p.o} />;
export const Calcium = (p: { x: number; y: number; formule?: string; o?: number }) => <IonDisque x={p.x} y={p.y} r={10.5} fill={CC.calcium} charge="2+" formule={p.formule} o={p.o} />;
export const Sulfate = (p: { x: number; y: number; formule?: string; o?: number }) => <IonDisque x={p.x} y={p.y} r={13} fill={CC.sulfate} charge="2−" formule={p.formule} o={p.o} />;

/** Ion oxonium H₃O⁺ : un oxygène, trois hydrogènes (jamais un proton libre) et un badge +. */
export function Oxonium({ x, y, rot = 0, s = 1, o = 1, formule }: { x: number; y: number; rot?: number; s?: number; o?: number; formule?: string }) {
  const hs = [30, 150, 270].map((a) => ({ cx: 12 * Math.cos(rad(a)), cy: 12 * Math.sin(rad(a)) }));
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})`} opacity={o} aria-hidden="true">
      {hs.map((h, i) => (
        <g key={i}>
          <line x1={0} y1={0} x2={h.cx} y2={h.cy} stroke="#94A3B8" strokeWidth={2.2} />
          <circle cx={h.cx} cy={h.cy} r={4.6} fill={CC.hydrogene} stroke={CC.hydrogeneBord} strokeWidth={1.2} />
        </g>
      ))}
      <circle cx={0} cy={0} r={8.5} fill={CC.oxygene} stroke="#7F1D1D" strokeWidth={1} />
      <circle cx={10} cy={-12} r={6} fill="#fff" stroke={CC.plus} strokeWidth={1.4} />
      <text x={10} y={-8.2} textAnchor="middle" fontSize={10} fontWeight={800} fill={CC.plus}>
        +
      </text>
      {formule && (
        <text x={0} y={27} textAnchor="middle" fontSize={10} fontWeight={700} fill={CC.encre} transform={`rotate(${-rot})`}>
          {formule}
        </text>
      )}
    </g>
  );
}

/** Ion hydroxyde OH⁻ : un oxygène, un hydrogène et un badge −. */
export function Hydroxyde({ x, y, rot = 0, s = 1, o = 1, formule }: { x: number; y: number; rot?: number; s?: number; o?: number; formule?: string }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})`} opacity={o} aria-hidden="true">
      <line x1={0} y1={0} x2={9} y2={8} stroke="#94A3B8" strokeWidth={2.2} />
      <circle cx={9} cy={8} r={4.6} fill={CC.hydrogene} stroke={CC.hydrogeneBord} strokeWidth={1.2} />
      <circle cx={0} cy={0} r={8.5} fill={CC.oxygene} stroke="#7F1D1D" strokeWidth={1} />
      <circle cx={-10} cy={-11} r={6} fill="#fff" stroke={CC.moins} strokeWidth={1.4} />
      <text x={-10} y={-7.2} textAnchor="middle" fontSize={11} fontWeight={800} fill={CC.moins}>
        −
      </text>
      {formule && (
        <text x={0} y={26} textAnchor="middle" fontSize={10} fontWeight={700} fill={CC.encre} transform={`rotate(${-rot})`}>
          {formule}
        </text>
      )}
    </g>
  );
}

/** Molécule de saccharose (schéma très simplifié : cycle + groupes −OH). Électriquement neutre : aucun signe de charge. */
export function Saccharose({ x, y, s = 1, o = 1, formule }: { x: number; y: number; s?: number; o?: number; formule?: string }) {
  const pts = Array.from({ length: 6 }, (_, i) => `${(13 * Math.cos(rad(60 * i))).toFixed(1)},${(13 * Math.sin(rad(60 * i))).toFixed(1)}`).join(" ");
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`} opacity={o} aria-hidden="true">
      <polygon points={pts} fill={CC.sucre} stroke={CC.sucreBord} strokeWidth={1.6} />
      {[0, 120, 240].map((a) => (
        <g key={a}>
          <circle cx={19 * Math.cos(rad(a + 30))} cy={19 * Math.sin(rad(a + 30))} r={3.6} fill={CC.oxygene} />
          <circle cx={24 * Math.cos(rad(a + 60))} cy={24 * Math.sin(rad(a + 60))} r={2.4} fill={CC.hydrogene} stroke={CC.hydrogeneBord} strokeWidth={0.8} />
        </g>
      ))}
      {formule && (
        <text x={0} y={34} textAnchor="middle" fontSize={9} fontWeight={700} fill={CC.encre}>
          {formule}
        </text>
      )}
    </g>
  );
}

/** Bécher en verre contenant de l'eau jusqu'à yEau ; les enfants sont dessinés dans le bécher (rognés à ses parois). */
export function Becher({ x, y, w, h, yEau, children, teinte = "#BAE6FD", opaciteEau = 0.4, etiquette }: { x: number; y: number; w: number; h: number; yEau: number; children?: ReactNode; teinte?: string; opaciteEau?: number; etiquette?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <g>
      <clipPath id={`bec-${id}`}>
        <rect x={x + 2} y={y} width={w - 4} height={h - 2} rx={10} />
      </clipPath>
      <rect x={x} y={yEau} width={w} height={y + h - yEau} fill={teinte} opacity={opaciteEau} clipPath={`url(#bec-${id})`} />
      <g clipPath={`url(#bec-${id})`}>{children}</g>
      <path d={`M ${x} ${y} L ${x} ${y + h - 10} Q ${x} ${y + h} ${x + 10} ${y + h} L ${x + w - 10} ${y + h} Q ${x + w} ${y + h} ${x + w} ${y + h - 10} L ${x + w} ${y}`} fill="none" stroke="#475569" strokeWidth={3} strokeLinecap="round" />
      <line x1={x - 6} y1={y} x2={x + 10} y2={y} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
      <line x1={x + w - 10} y1={y} x2={x + w + 6} y2={y} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
      <line x1={x + 3} y1={yEau} x2={x + w - 3} y2={yEau} stroke="#38BDF8" strokeWidth={2} strokeDasharray="6 4" />
      {etiquette && (
        <text x={x + w / 2} y={y + h + 18} textAnchor="middle" fontSize={12} fontWeight={700} fill={CC.encre}>
          {etiquette}
        </text>
      )}
    </g>
  );
}

/** Fonctions d'animation communes. */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const douceur = (x: number) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};
export const melange = (a: number, b: number, u: number) => a + (b - a) * u;
