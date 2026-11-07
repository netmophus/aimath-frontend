"use client";

import { type ReactNode } from "react";

/** Éléments d'interface du Laboratoire Moivre-Euler : on réutilise ceux du Laboratoire des nombres complexes (plan SVG
 * orthonormé interactif, curseurs, mode défi, onglets…), eux-mêmes bâtis sur ceux des laboratoires PGCD et nombres premiers. */
export * from "@/components/labo-complexes/ui";
export { Commandes } from "@/components/labo-pgcd/ui";

import { Tex } from "@/components/labo-pgcd/ui";

/** Exposant en caractères Unicode : sup(-2) = « ⁻² » (étiquettes SVG, qui n'acceptent pas le TeX). */
export function sup(k: number): string {
  const map: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  return String(k).split("").map((c) => map[c] ?? c).join("");
}

/** Plus petit « beau » rayon de cadre ≥ x (1, 2, 3, 5, 8, 12, 20, 30, 50, 80, 120, 200…). */
export function borneNette(x: number): number {
  const base = [1, 1.5, 2, 3, 4, 5, 8, 12, 20, 30, 50, 80, 120, 200];
  const v = Math.max(1, x) * 1.2;
  return base.find((b) => b >= v) ?? Math.ceil(v);
}

/** Un bloc de formule (environnement aligned compris) dans une carte lisible. */
export function Carte({ titre, children, couleur = "border-fh-sable bg-white" }: { titre?: ReactNode; children: ReactNode; couleur?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 rounded-lg border px-3 py-2 ${couleur}`}>
      {titre && <span className="text-[0.7rem] font-bold uppercase tracking-wide text-fh-ardoise/60">{titre}</span>}
      <div className="min-w-0 text-sm leading-relaxed text-fh-ardoise">{children}</div>
    </div>
  );
}

/** Étape numérotée d'une démonstration, avec sa formule. */
export function EtapeFormule({ numero, titre, expr, texte }: { numero: number; titre: ReactNode; expr?: string; texte?: ReactNode }) {
  return (
    <li className="flex min-w-0 gap-3 rounded-lg border border-fh-sable bg-white px-3 py-2">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fh-bleu-vif text-xs font-bold text-white">{numero}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-semibold text-fh-bleu">{titre}</p>
        {texte && <div className="text-sm leading-relaxed text-fh-ardoise">{texte}</div>}
        {expr && <Tex expr={expr} bloc />}
      </div>
    </li>
  );
}

// --- Graphique de fonctions (comparaison de courbes) -----------------------------------------------------------------

export interface CourbeDef {
  id: string;
  libelle: string;
  f: (x: number) => number;
  couleur: string;
  epaisseur: number;
  pointille?: boolean;
  visible: boolean;
}

function etiquettePi(k: number, d: number): string {
  if (k === 0) return "0";
  const signe = k < 0 ? "−" : "";
  const a = Math.abs(k);
  const num = a === 1 ? "π" : `${a}π`;
  return d === 1 ? `${signe}${num}` : `${signe}${num}/${d}`;
}

/**
 * Courbes y = f(x) sur [xmin, xmax] (radians), repère NON orthonormé (échelles propres à chaque axe), axe des abscisses
 * gradué en multiples de π/2 ou π. L'ordonnée s'adapte aux courbes échantillonnées (symétrique autour de 0).
 */
export function Courbes({ courbes, xmin, xmax, etiquette }: { courbes: CourbeDef[]; xmin: number; xmax: number; etiquette: string }) {
  const W = 640;
  const H = 300;
  const ML = 44;
  const MR = 12;
  const MT = 14;
  const MB = 28;
  const N = 480;
  const echantillons = courbes.map((c) => {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= N; i++) {
      const x = xmin + ((xmax - xmin) * i) / N;
      const y = c.f(x);
      pts.push([x, Number.isFinite(y) ? y : 0]);
    }
    return pts;
  });
  let amp = 1;
  for (const pts of echantillons) for (const [, y] of pts) amp = Math.max(amp, Math.abs(y));
  const ymax = Math.ceil(amp * 4) / 4 + 0.1;
  const ymin = -ymax;
  const X = (x: number) => ML + ((x - xmin) / (xmax - xmin)) * (W - ML - MR);
  const Y = (y: number) => MT + ((ymax - y) / (ymax - ymin)) * (H - MT - MB);
  const longueur = (xmax - xmin) / Math.PI;
  const d = longueur > 4.01 ? 1 : 2;
  const pasX = Math.PI / d;
  const ticksX: number[] = [];
  for (let k = Math.ceil(xmin / pasX - 1e-9); k * pasX <= xmax + 1e-9; k++) ticksX.push(k);
  const ticksY: number[] = [];
  const pasY = ymax > 2.5 ? 1 : 0.5;
  for (let y = -Math.floor(ymax / pasY) * pasY; y <= ymax + 1e-9; y += pasY) ticksY.push(Number(y.toFixed(3)));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={etiquette} className="block h-auto w-full rounded-xl border border-fh-sable bg-white select-none">
      {ticksX.map((k) => (
        <g key={`x${k}`}>
          <line x1={X(k * pasX)} y1={MT} x2={X(k * pasX)} y2={H - MB} stroke="#e8edf5" strokeWidth={1} />
          <text x={X(k * pasX)} y={H - 9} textAnchor="middle" fontSize={11} fill="#64748b">
            {etiquettePi(k, d)}
          </text>
        </g>
      ))}
      {ticksY.map((y) => (
        <g key={`y${y}`}>
          <line x1={ML} y1={Y(y)} x2={W - MR} y2={Y(y)} stroke="#e8edf5" strokeWidth={1} />
          <text x={ML - 6} y={Y(y) + 4} textAnchor="end" fontSize={11} fill="#64748b">
            {String(y).replace(".", ",")}
          </text>
        </g>
      ))}
      <line x1={ML} y1={Y(0)} x2={W - MR} y2={Y(0)} stroke="#334155" strokeWidth={1.4} />
      {xmin < 0 && xmax > 0 && <line x1={X(0)} y1={MT} x2={X(0)} y2={H - MB} stroke="#334155" strokeWidth={1.4} />}
      {courbes.map((c, i) =>
        c.visible ? (
          <polyline
            key={c.id}
            points={echantillons[i].map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(" ")}
            fill="none"
            stroke={c.couleur}
            strokeWidth={c.epaisseur}
            strokeDasharray={c.pointille ? "7 5" : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null,
      )}
    </svg>
  );
}
