"use client";

import { useEffect, useState, type ReactNode } from "react";

import { natureSolution } from "@/lib/chimiePh";

/**
 * Quatre expériences virtuelles de chimie : conductivité de 3 tubes, électroneutralité, papier pH, pH-mètre.
 * Schémas en 2D (SVG / HTML), transitions CSS, aucune bibliothèque. Valeurs de pH indicatives, à 25 °C.
 */

const BLEU = "#1f2ca2"; // fh-bleu-vif
const ORANGE = "#d14205"; // fh-orange
const GRIS = "#64748b";
const T = "transition-all duration-[1200ms] ease-in-out motion-reduce:transition-none";

const virgule = (x: number, d = 1) => x.toFixed(d).replace(".", ",");

function Cadre({ titre, children, note }: { titre: string; children: ReactNode; note?: ReactNode }) {
  return (
    <div className="my-3 flex flex-col gap-3 rounded-2xl border border-fh-sable bg-white p-4">
      <p className="text-sm font-semibold text-fh-bleu">{titre}</p>
      {children}
      {note && <p className="rounded-lg bg-fh-accent px-3 py-2 text-sm text-fh-bleu">{note}</p>}
    </div>
  );
}

/** Boutons exclusifs (radiogroup) : même rendu que les choix de TemperatureEau. */
function Choix<K extends string | number>({ nom, options, valeur, onChoisir }: { nom: string; options: Array<{ cle: K; libelle: string }>; valeur: K | null; onChoisir: (k: K) => void }) {
  return (
    <div role="radiogroup" aria-label={nom} className="grid grid-cols-3 gap-2">
      {options.map((o) => (
        <button
          key={o.cle}
          type="button"
          role="radio"
          aria-checked={o.cle === valeur}
          onClick={() => onChoisir(o.cle)}
          className={`rounded-lg border px-2 py-2 text-sm font-semibold transition-colors ${
            o.cle === valeur ? "border-fh-orange bg-fh-orange text-white" : "border-fh-sable bg-white text-fh-bleu hover:bg-fh-accent"
          }`}
        >
          {o.libelle}
        </button>
      ))}
    </div>
  );
}

function Resultat({ etiquette, children, couleur = "text-fh-bleu" }: { etiquette: string; children: ReactNode; couleur?: string }) {
  return (
    <div className="rounded-lg bg-fh-creme px-3 py-2 text-sm">
      <div className="text-xs text-fh-ardoise">{etiquette}</div>
      <div className={`font-semibold ${couleur}`}>{children}</div>
    </div>
  );
}

const couleurNature = (n: string) => (n === "Acide" ? "text-red-700" : n === "Basique" ? "text-violet-700" : "text-green-700");

/* -------------------------------------------------------------------------------------------- 1. tubes */

type CleTube = "A" | "B" | "C";
const TUBES: Record<CleTube, { libelle: string; contenu: string; intensite: number; courant: string; texte: string }> = {
  A: { libelle: "Tube A · eau", contenu: "eau", intensite: 0.03, courant: "quasi nulle", texte: "Eau quasi pure : très peu d'ions, la conductivité est très faible." },
  B: { libelle: "Tube B · eau + sel", contenu: "eau + sel", intensite: 1, courant: "forte", texte: "Contient des ions Na⁺ et Cl⁻ → la solution conduit le courant." },
  C: { libelle: "Tube C · eau + sucre", contenu: "eau + sucre", intensite: 0.06, courant: "très faible", texte: "Reste moléculaire (saccharose, aucun ion) → ne conduit pas le courant." },
};
const PARTICULES: Array<[number, number]> = [[198, 130], [232, 146], [262, 128], [214, 160], [248, 164], [284, 150], [188, 152], [272, 112]];

export function TubesConductivite() {
  const [cle, setCle] = useState<CleTube | null>(null);
  const t = cle ? TUBES[cle] : null;
  const i = t?.intensite ?? 0;
  const fil = (allume: boolean) => ({ stroke: allume ? ORANGE : GRIS, strokeWidth: 3, fill: "none" as const });
  return (
    <Cadre titre="Conductivité de trois solutions" note={t ? t.texte : "Choisis un tube pour brancher le circuit sur la solution."}>
      <Choix<CleTube> nom="Tube" valeur={cle} onChoisir={setCle} options={(Object.keys(TUBES) as CleTube[]).map((k) => ({ cle: k, libelle: TUBES[k].libelle }))} />
      <svg viewBox="0 0 480 220" className="h-auto w-full" role="img" aria-label={t ? `Circuit électrique avec le ${t.libelle} : conductivité ${t.courant}` : "Circuit électrique avec un tube à choisir"}>
        <rect width={480} height={220} rx={12} className="fill-fh-creme" />
        {/* circuit : pile → électrode → solution → électrode → lampe → pile */}
        <path d="M40 98 V30 H200 V168" {...fil(i > 0.5)} className={T} />
        <path d="M280 168 V30 H440 V84" {...fil(i > 0.5)} className={T} />
        <path d="M440 136 V196 H40 V122" {...fil(i > 0.5)} className={T} />
        {/* pile */}
        <line x1={28} y1={98} x2={52} y2={98} stroke="#0f172a" strokeWidth={4} />
        <line x1={34} y1={110} x2={46} y2={110} stroke="#0f172a" strokeWidth={4} />
        <line x1={28} y1={122} x2={52} y2={122} stroke="#0f172a" strokeWidth={4} />
        <text x={58} y={104} fontSize={12} fill={GRIS}>+</text>
        {/* lampe */}
        <circle cx={440} cy={110} r={26} fill="#fde047" className={T} style={{ opacity: 0.12 + 0.88 * i }} />
        <circle cx={440} cy={110} r={44} fill="#fde047" className={T} style={{ opacity: 0.35 * i }} />
        <circle cx={440} cy={110} r={26} fill="none" stroke="#0f172a" strokeWidth={2.5} />
        <path d="M428 122 L440 104 L452 122" fill="none" stroke="#0f172a" strokeWidth={2} />
        {/* bécher */}
        <path d="M170 92 V176 a10 10 0 0 0 10 10 H300 a10 10 0 0 0 10 -10 V92" fill="none" stroke="#0f172a" strokeWidth={3} />
        <rect x={173} y={106} width={134} height={77} rx={6} className={T} fill={cle === "B" ? "#dbeafe" : "#e0f2fe"} />
        <line x1={200} y1={168} x2={200} y2={175} stroke="#0f172a" strokeWidth={6} />
        <line x1={280} y1={168} x2={280} y2={175} stroke="#0f172a" strokeWidth={6} />
        {/* ce que contient le tube */}
        {cle === "B" && PARTICULES.map(([x, y], k) => (
          <g key={k} transform={`translate(${x} ${y})`}>
            <circle r={8} fill={k % 2 ? "#bfdbfe" : "#fed7aa"} stroke={k % 2 ? BLEU : ORANGE} strokeWidth={1.5} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill={k % 2 ? BLEU : ORANGE}>{k % 2 ? "−" : "+"}</text>
          </g>
        ))}
        {cle === "C" && PARTICULES.slice(0, 5).map(([x, y], k) => (
          <g key={k} transform={`translate(${x} ${y})`}>
            <circle r={8} fill="#e2e8f0" stroke={GRIS} strokeWidth={1.5} />
            <circle cx={5} cy={-5} r={4} fill="#e2e8f0" stroke={GRIS} strokeWidth={1.2} />
          </g>
        ))}
        {cle === "A" && PARTICULES.slice(0, 4).map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r={4} fill="#93c5fd" />
        ))}
        <text x={240} y={212} textAnchor="middle" fontSize={12} fontWeight={700} fill={cle ? "#0f172a" : GRIS}>{t ? t.contenu : "Aucun tube choisi"}</text>
      </svg>
      <div className="grid gap-2 sm:grid-cols-2">
        <Resultat etiquette="Lampe">{t ? (i > 0.5 ? "très lumineuse" : i > 0.04 ? "à peine visible" : "éteinte") : "—"}</Resultat>
        <Resultat etiquette="Conductivité">{t ? t.courant : "—"}</Resultat>
      </div>
    </Cadre>
  );
}

/* -------------------------------------------------------------------------------------------- 2. électroneutralité */

type Sel = "NaCl" | "CaCl2";
const SELS: Record<Sel, { libelle: string; equation: string; cation: string; zCation: number; nCation: number; anion: string; nAnion: number; relation: string }> = {
  NaCl: { libelle: "NaCl", equation: "NaCl → Na⁺ + Cl⁻", cation: "Na⁺", zCation: 1, nCation: 1, anion: "Cl⁻", nAnion: 1, relation: "[Na⁺] = [Cl⁻]" },
  CaCl2: { libelle: "CaCl₂", equation: "CaCl₂ → Ca²⁺ + 2 Cl⁻", cation: "Ca²⁺", zCation: 2, nCation: 1, anion: "Cl⁻", nAnion: 2, relation: "2[Ca²⁺] = [Cl⁻]" },
};

export function Electroneutralite() {
  const [cle, setCle] = useState<Sel>("NaCl");
  const [c, setC] = useState(10); // centièmes de mol/L
  const s = SELS[cle];
  const conc = c / 100;
  const cCation = s.nCation * conc;
  const cAnion = s.nAnion * conc;
  const chargePlus = s.zCation * cCation;
  const chargeMoins = cAnion;
  const ions = [
    ...Array.from({ length: s.nCation }, (_, k) => ({ k: `c${k}`, nom: s.cation, positif: true })),
    ...Array.from({ length: s.nAnion }, (_, k) => ({ k: `a${k}`, nom: s.anion, positif: false })),
  ];
  const max = 2 * 0.5; // plus grande charge possible (CaCl₂, 0,50 mol/L)
  return (
    <Cadre titre="Électroneutralité d'une solution ionique" note={<>Somme des charges = 0 : la solution est <strong>neutre</strong>, même si elle contient des ions.</>}>
      <Choix<Sel> nom="Composé dissous" valeur={cle} onChoisir={setCle} options={(Object.keys(SELS) as Sel[]).map((k) => ({ cle: k, libelle: SELS[k].libelle }))} />
      <label className="flex flex-col gap-1 text-sm text-fh-ardoise">
        <span>
          Concentration apportée c = <strong className="text-fh-bleu">{virgule(conc, 2)} mol/L</strong>
        </span>
        <input type="range" min={5} max={50} step={5} value={c} onChange={(e) => setC(Number(e.target.value))} className="w-full accent-fh-orange" aria-label="Concentration en soluté apporté" />
      </label>

      <div className="rounded-lg bg-fh-creme px-3 py-3 text-center">
        <div className="text-sm font-semibold text-fh-bleu">{s.equation}</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2" aria-label={`Pour une formule : ${s.equation}`}>
          {ions.map((ion) => (
            <span
              key={ion.k}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-xs font-bold"
              style={ion.positif ? { borderColor: ORANGE, background: "#fed7aa", color: ORANGE } : { borderColor: BLEU, background: "#bfdbfe", color: BLEU }}
            >
              {ion.nom}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div>
          <div className="mb-1 flex justify-between text-xs text-fh-ardoise">
            <span>Charges positives : {s.zCation} × [{s.cation}] = {s.zCation > 1 ? `${s.zCation} × ` : ""}{virgule(cCation, 2)}</span>
            <strong style={{ color: ORANGE }}>+{virgule(chargePlus, 2)} mol/L</strong>
          </div>
          <div className="h-4 rounded bg-fh-creme"><div className={`h-4 rounded ${T}`} style={{ width: `${(chargePlus / max) * 100}%`, background: ORANGE }} /></div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-fh-ardoise">
            <span>Charges négatives : 1 × [{s.anion}] = {virgule(cAnion, 2)}</span>
            <strong style={{ color: BLEU }}>−{virgule(chargeMoins, 2)} mol/L</strong>
          </div>
          <div className="h-4 rounded bg-fh-creme"><div className={`h-4 rounded ${T}`} style={{ width: `${(chargeMoins / max) * 100}%`, background: BLEU }} /></div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Resultat etiquette="Relation entre les concentrations">{s.relation}</Resultat>
        <Resultat etiquette="Bilan des charges" couleur="text-green-700">
          {s.nCation > 1 || s.zCation > 1 ? `(+${s.zCation}) + ${s.nAnion} × (−1)` : "(+1) + (−1)"} = 0
        </Resultat>
      </div>
      <p className="text-center text-sm font-semibold text-fh-bleu">Somme des charges = 0, solution neutre</p>
    </Cadre>
  );
}

/* -------------------------------------------------------------------------------------------- pH → couleur (papier pH) */

const ECHELLE: Array<[number, string]> = [
  [0, "#dc2626"], [2, "#e5381d"], [3, "#ea580c"], [4, "#f97316"], [5, "#facc15"], [6, "#a3e635"],
  [7, "#22c55e"], [8, "#14b8a6"], [9, "#3b82f6"], [10, "#4f46e5"], [12, "#7c3aed"], [14, "#581c87"],
];
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Couleur du papier pH, interpolée entre les repères de l'échelle. */
export function couleurPapier(ph: number): string {
  for (let k = 1; k < ECHELLE.length; k++) {
    const [p1, c1] = ECHELLE[k];
    if (ph <= p1) {
      const [p0, c0] = ECHELLE[k - 1];
      const f = (ph - p0) / (p1 - p0);
      const a = rgb(c0);
      const b = rgb(c1);
      return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(",")})`;
    }
  }
  return ECHELLE[ECHELLE.length - 1][1];
}

type Solution = "eau" | "citron" | "bicarbonate";
const SOLUTIONS: Record<Solution, { libelle: string; court: string; ph: number; liquide: string }> = {
  eau: { libelle: "Eau", court: "A · eau", ph: 7, liquide: "#bae6fd" },
  citron: { libelle: "Jus de citron", court: "B · citron", ph: 2.5, liquide: "#fef08a" },
  bicarbonate: { libelle: "Bicarbonate", court: "C · bicarbonate", ph: 8.5, liquide: "#e2e8f0" },
};
const CLES_SOL = Object.keys(SOLUTIONS) as Solution[];
const natureDe = (ph: number) => natureSolution(Math.round(ph * 10));

/* -------------------------------------------------------------------------------------------- 3. papier pH */

const X_TUBE: Record<Solution, number> = { eau: 110, citron: 240, bicarbonate: 370 };

export function PapierPh() {
  const [cle, setCle] = useState<Solution | null>(null);
  const s = cle ? SOLUTIONS[cle] : null;
  const x = cle ? X_TUBE[cle] : 240;
  const nature = s ? natureDe(s.ph) : null;
  return (
    <Cadre titre="Le papier pH" note="Valeurs indicatives : le papier pH donne un ordre de grandeur, pas une mesure précise.">
      <Choix<Solution> nom="Tube à tester" valeur={cle} onChoisir={setCle} options={CLES_SOL.map((k) => ({ cle: k, libelle: SOLUTIONS[k].court }))} />
      <svg viewBox="0 0 480 250" className="h-auto w-full" role="img" aria-label={s ? `Papier pH plongé dans ${s.libelle} : couleur correspondant à un pH d'environ ${virgule(s.ph)}` : "Trois tubes et un papier pH sec"}>
        <rect width={480} height={250} rx={12} className="fill-fh-creme" />
        {CLES_SOL.map((k) => (
          <g key={k}>
            <path d={`M${X_TUBE[k] - 28} 90 V190 a28 28 0 0 0 56 0 V90`} fill="none" stroke="#0f172a" strokeWidth={3} />
            <path d={`M${X_TUBE[k] - 26} 120 V190 a26 26 0 0 0 52 0 V120 Z`} fill={SOLUTIONS[k].liquide} />
            <text x={X_TUBE[k]} y={240} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">{SOLUTIONS[k].court}</text>
          </g>
        ))}
        {/* bandelette : sèche au départ, plongée dans le tube choisi, puis la couleur apparaît */}
        <g className={T} style={{ transform: `translate(${x}px, ${cle ? 52 : 0}px)` }}>
          <rect x={-8} y={6} width={16} height={104} rx={2} fill="#fff" stroke={GRIS} strokeWidth={1.5} />
          <rect x={-7} y={66} width={14} height={43} className="transition-[fill] duration-[1600ms] delay-[900ms] motion-reduce:transition-none" style={{ fill: s ? couleurPapier(s.ph) : "#f5e9d3" }} />
        </g>
      </svg>

      <div>
        <div className="relative mt-4 h-5 w-full rounded" style={{ background: `linear-gradient(to right, ${ECHELLE.map(([p, c]) => `${c} ${(p / 14) * 100}%`).join(", ")})` }} aria-hidden>
          {s && <div className={`absolute -top-3.5 -translate-x-1/2 text-xs font-bold text-fh-bleu ${T}`} style={{ left: `${(s.ph / 14) * 100}%` }}>▼</div>}
        </div>
        <div className="relative mt-1 h-3 text-[10px] text-fh-ardoise" aria-hidden>
          {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((p) => (
            <span key={p} className="absolute -translate-x-1/2" style={{ left: `${(p / 14) * 100}%` }}>{p}</span>
          ))}
        </div>
        <p className="mt-1 text-xs text-fh-ardoise/70">Échelle de couleurs du papier pH</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Resultat etiquette="Solution">{s ? s.libelle : "—"}</Resultat>
        <Resultat etiquette="pH indicatif">{s ? `≈ ${virgule(s.ph)}` : "—"}</Resultat>
        <Resultat etiquette="Nature" couleur={nature ? couleurNature(nature) : undefined}>{nature ?? "—"}</Resultat>
      </div>
    </Cadre>
  );
}

/* -------------------------------------------------------------------------------------------- 4. pH-mètre */

const ETAPES = ["Choisis une solution, puis étalonne le pH-mètre.", "Étalonnage fait : rince la sonde.", "Sonde rincée : plonge-la dans la solution.", "La valeur se stabilise…"];

export function PhMetreVirtuel() {
  const [cle, setCle] = useState<Solution>("eau");
  const [etape, setEtape] = useState(0); // 0 rien, 1 étalonné, 2 rincé, 3 plongé
  const [lecture, setLecture] = useState<number | null>(null);
  const [stable, setStable] = useState(false);
  const s = SOLUTIONS[cle];

  useEffect(() => {
    if (etape !== 3) return;
    const cible = SOLUTIONS[cle].ph;
    const debut = Date.now();
    const id = setInterval(() => {
      const t = (Date.now() - debut) / 1000;
      if (t >= 2.6) {
        setLecture(cible);
        setStable(true);
        clearInterval(id);
      } else {
        // oscillation amortie autour de la valeur finale
        setLecture(cible + 2.2 * Math.exp(-t * 1.2) * Math.cos(t * 8));
      }
    }, 80);
    return () => clearInterval(id);
  }, [etape, cle]);

  const choisir = (k: Solution) => {
    setCle(k);
    setLecture(null);
    setStable(false);
    // On change de solution : la sonde sort ; l'étalonnage reste fait, mais il faut rincer à nouveau.
    setEtape((e) => Math.min(e, 1));
  };
  const recommencer = () => {
    setEtape(0);
    setLecture(null);
    setStable(false);
  };
  const nature = stable ? natureDe(s.ph) : null;
  const plongee = etape === 3;
  const ecran = lecture === null ? "--,-" : virgule(Math.min(14, Math.max(0, lecture)));

  return (
    <Cadre titre="pH-mètre virtuel" note="Pour une mesure fiable : on étalonne l'appareil, on rince la sonde entre deux solutions, puis on la plonge dans la solution à mesurer.">
      <Choix<Solution> nom="Solution à mesurer" valeur={cle} onChoisir={choisir} options={CLES_SOL.map((k) => ({ cle: k, libelle: SOLUTIONS[k].libelle }))} />

      <svg viewBox="0 0 480 240" className="h-auto w-full" role="img" aria-label={`pH-mètre : ${etape === 3 ? `sonde plongée dans ${s.libelle}, affichage ${ecran}` : "sonde hors de la solution"}`}>
        <rect width={480} height={240} rx={12} className="fill-fh-creme" />
        {/* appareil */}
        <rect x={30} y={40} width={170} height={150} rx={14} fill="#1e2b6a" />
        <rect x={46} y={56} width={138} height={64} rx={8} fill="#d9f2d0" />
        <text x={176} y={103} textAnchor="end" fontSize={38} fontWeight={700} fill="#14532d" fontFamily="monospace">{ecran}</text>
        <text x={54} y={72} fontSize={11} fontWeight={700} fill="#14532d">pH</text>
        <text x={54} y={112} fontSize={10} fill="#14532d">{etape >= 1 ? "étalonné ✓" : "non étalonné"}</text>
        <circle cx={62} cy={156} r={8} className={T} fill={etape >= 1 ? "#22c55e" : "#475569"} />
        <circle cx={96} cy={156} r={8} className={T} fill={etape >= 2 ? "#22c55e" : "#475569"} />
        <circle cx={130} cy={156} r={8} className={T} fill={etape >= 3 ? (stable ? "#22c55e" : "#facc15") : "#475569"} />
        <text x={62} y={178} textAnchor="middle" fontSize={9} fill="#cbd5e1">étalon.</text>
        <text x={96} y={178} textAnchor="middle" fontSize={9} fill="#cbd5e1">rinçage</text>
        <text x={130} y={178} textAnchor="middle" fontSize={9} fill="#cbd5e1">mesure</text>
        {/* câble + sonde */}
        <path className={T} d={`M200 90 C 260 40, 300 ${plongee ? 90 : 40}, 340 ${plongee ? 102 : 50}`} fill="none" stroke="#0f172a" strokeWidth={4} />
        <g className={T} style={{ transform: `translate(0px, ${plongee ? 52 : 0}px)` }}>
          <rect x={332} y={50} width={16} height={92} rx={4} fill="#e2e8f0" stroke="#0f172a" strokeWidth={2} />
          <ellipse cx={340} cy={146} rx={9} ry={11} fill="#a5b4fc" stroke="#0f172a" strokeWidth={2} />
        </g>
        {/* bécher */}
        <path d="M280 120 V205 a10 10 0 0 0 10 10 H390 a10 10 0 0 0 10 -10 V120" fill="none" stroke="#0f172a" strokeWidth={3} />
        <rect x={283} y={150} width={114} height={62} rx={6} fill={s.liquide} />
        <text x={340} y={234} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">{s.libelle}</text>
        {/* gouttes de rinçage */}
        <g className={T} style={{ opacity: etape === 2 ? 1 : 0 }} fill="#38bdf8">
          <circle cx={430} cy={70} r={4} />
          <circle cx={440} cy={92} r={4} />
          <circle cx={424} cy={104} r={4} />
          <text x={410} y={52} fontSize={12} fontWeight={700} fill="#0369a1">rincée</text>
        </g>
      </svg>

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={etape !== 0} onClick={() => setEtape(1)} className="rounded-lg border border-fh-orange bg-fh-orange px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:border-fh-sable disabled:bg-fh-creme disabled:text-fh-ardoise/50">
          1. Étalonner
        </button>
        <button type="button" disabled={etape !== 1} onClick={() => setEtape(2)} className="rounded-lg border border-fh-orange bg-fh-orange px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:border-fh-sable disabled:bg-fh-creme disabled:text-fh-ardoise/50">
          2. Rincer la sonde
        </button>
        <button type="button" disabled={etape !== 2} onClick={() => setEtape(3)} className="rounded-lg border border-fh-orange bg-fh-orange px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:border-fh-sable disabled:bg-fh-creme disabled:text-fh-ardoise/50">
          3. Plonger la sonde
        </button>
        <button type="button" onClick={recommencer} className="rounded-lg border border-fh-sable bg-white px-3 py-2 text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-accent">
          Recommencer
        </button>
      </div>

      <p className="text-sm text-fh-ardoise" aria-live="polite">{stable ? "Valeur stable." : ETAPES[etape]}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Resultat etiquette="Solution">{s.libelle}</Resultat>
        <Resultat etiquette="pH mesuré">{stable ? `≈ ${virgule(s.ph)}` : "—"}</Resultat>
        <Resultat etiquette="Nature" couleur={nature ? couleurNature(nature) : undefined}>{nature ?? "—"}</Resultat>
      </div>
    </Cadre>
  );
}
