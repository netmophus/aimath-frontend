"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

import { useAuth } from "@/lib/auth";
import { useAnimation, useBoucle } from "./animation";

interface HeroAccueilProps {
  /** Mosaïque de photos (components/MosaiquePhotosEleves.tsx) : composant SERVEUR (lit le système de fichiers),
   * reçu en prop plutôt qu'importé ici car ce fichier est "use client". */
  mosaique: ReactNode;
}

const DUREE = 4.5; // secondes par matière en lecture automatique
const REPRISE = 7; // secondes sans clic avant que la lecture automatique reprenne

interface Matiere {
  id: "maths" | "physique" | "chimie" | "svt";
  nom: string;
  court: string;
  couleur: string;
  soft: string;
  phrase: string;
}

const MATIERES: Matiere[] = [
  { id: "maths", nom: "Mathématiques", court: "Maths", couleur: "#2b5a8c", soft: "#eef4fb", phrase: "La courbe du sinus ondule : on règle les paramètres et l'effet sur la fonction se voit aussitôt." },
  { id: "physique", nom: "Physique", court: "Phys.", couleur: "#c0531f", soft: "#fcefe7", phrase: "Un pendule oscille : sa période ne dépend que de sa longueur, pas de l'amplitude du mouvement." },
  { id: "chimie", nom: "Chimie", court: "Chimie", couleur: "#0f8a8a", soft: "#e7f6f6", phrase: "Le pH d'une solution se lit à la couleur de l'indicateur : rouge en milieu acide, vert à pH 7, bleu en milieu basique." },
  { id: "svt", nom: "SVT", court: "SVT", couleur: "#2a9d4a", soft: "#eaf7ef", phrase: "À chaque inspiration, les poumons se gonflent de dioxygène ; à l'expiration, ils rejettent du dioxyde de carbone." },
];

/* ───────────── Symboles qui flottent en arrière-plan (position en %, délai et durée de dérive) ───────────── */
const SYMBOLES: Array<{ s: string; x: number; y: number; t: number; d: number; v: number }> = [
  { s: "∫", x: 4, y: 14, t: 34, d: 0, v: 9 },
  { s: "π", x: 15, y: 72, t: 28, d: 1.5, v: 11 },
  { s: "∞", x: 30, y: 8, t: 30, d: 3, v: 10 },
  { s: "H₂O", x: 40, y: 86, t: 22, d: 0.8, v: 12 },
  { s: "Δ", x: 52, y: 20, t: 30, d: 2.2, v: 9 },
  { s: "Ω", x: 63, y: 78, t: 32, d: 4, v: 13 },
  { s: "pH", x: 74, y: 6, t: 24, d: 1.2, v: 10 },
  { s: "√", x: 84, y: 60, t: 34, d: 3.4, v: 12 },
  { s: "λ", x: 92, y: 18, t: 30, d: 0.4, v: 11 },
  { s: "O₂", x: 96, y: 88, t: 24, d: 2.6, v: 9 },
  { s: "Σ", x: 24, y: 40, t: 26, d: 4.4, v: 13 },
  { s: "sin x", x: 8, y: 92, t: 20, d: 1.9, v: 10 },
];

/* ───────────── Scène « Mathématiques » : sinus qui ondule ───────────── */
const PERIODE_PX = 120;
const SIN_D = (() => {
  let d = "";
  for (let x = 40; x <= 40 + PERIODE_PX * 4; x += 4) d += `${d ? "L" : "M"}${x} ${(110 - 70 * Math.sin((2 * Math.PI * (x - 40)) / PERIODE_PX)).toFixed(1)} `;
  return d;
})();
const X_POINT = 190;
const ySin = (decalage: number) => 110 - 70 * Math.sin((2 * Math.PI * (X_POINT - 40 + decalage)) / PERIODE_PX);

/* ───────────── Scène « Chimie » : bécher à indicateur universel ───────────── */
const PALIER_PH: Array<[number, [number, number, number]]> = [
  [0, [215, 25, 28]],
  [2, [239, 106, 43]],
  [4, [242, 181, 44]],
  [6, [184, 214, 54]],
  [7, [53, 168, 83]],
  [8, [26, 166, 160]],
  [10, [43, 108, 208]],
  [12, [75, 63, 184]],
  [14, [106, 44, 145]],
];
function couleurPh(ph: number): string {
  const p = Math.max(0, Math.min(14, ph));
  let i = 0;
  while (i < PALIER_PH.length - 2 && p > PALIER_PH[i + 1][0]) i++;
  const [p0, c0] = PALIER_PH[i];
  const [p1, c1] = PALIER_PH[i + 1];
  const f = (p - p0) / (p1 - p0);
  return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * f)).join(",")})`;
}
const verdictPh = (ph: number) => (ph < 6.5 ? { texte: "ACIDE", couleur: "#b3261e" } : ph <= 7.5 ? { texte: "NEUTRE", couleur: "#1e7a3a" } : { texte: "BASIQUE", couleur: "#1f4fb0" });
const phTexte = (ph: number) => `pH ${ph.toFixed(1).replace(".", ",")}`;
const PH_STATIQUE = 3;
const phEnCours = (t: number) => {
  const x = Math.max(0, Math.min(1, t / 4.2));
  return 1.5 + 11 * (3 * x * x - 2 * x * x * x);
};
const X_ECHELLE = (ph: number) => 40 + (ph / 14) * 280;

const style = (v: Record<string, string | number>): CSSProperties => v as CSSProperties;

/**
 * Bandeau d'accueil animé : titre, badge, boutons, trois chiffres-clés teintés, puis à droite une carte « Simulation en
 * direct » dont la scène change de matière toutes les ~4,5 s (pastilles cliquables : la lecture automatique reprend
 * après ~7 s sans clic). Une seule boucle requestAnimationFrame, active uniquement quand le bandeau est visible à
 * l'écran ; avec « réduire les animations », la scène reste statique.
 * Même règle d'inscription que CtaBlock : connecté → tableau de bord ; sinon connexion.
 */
export default function HeroAccueil({ mosaique }: HeroAccueilProps) {
  const { isAuthenticated } = useAuth();
  const [actif, setActif] = useState(0);
  const racine = useRef<HTMLElement>(null);
  const anime = useAnimation(racine);
  const horloge = useRef(0);
  const debut = useRef(0);
  const reprise = useRef(0);

  // éléments des scènes (seule la scène active est montée ; les autres références restent nulles)
  const gSin = useRef<SVGGElement>(null);
  const ptSin = useRef<SVGCircleElement>(null);
  const guideSin = useRef<SVGLineElement>(null);
  const bras = useRef<SVGGElement>(null);
  const liquide = useRef<SVGRectElement>(null);
  const textePh = useRef<SVGTextElement>(null);
  const texteVerdict = useRef<SVGTextElement>(null);
  const marqueur = useRef<SVGPathElement>(null);
  const poumons = useRef<SVGGElement>(null);
  const diaphragme = useRef<SVGPathElement>(null);
  const mO2 = useRef<SVGGElement>(null);
  const mCO2 = useRef<SVGGElement>(null);

  const matiere = MATIERES[actif];

  function dessiner(i: number, t: number) {
    if (i === 0) {
      const s = (t * 42) % PERIODE_PX; // le sinus défile vers la gauche
      gSin.current?.setAttribute("transform", `translate(${(-s).toFixed(1)} 0)`);
      const y = ySin(s).toFixed(1);
      ptSin.current?.setAttribute("cy", y);
      guideSin.current?.setAttribute("y1", y);
    } else if (i === 1) {
      bras.current?.setAttribute("transform", `rotate(${(30 * Math.cos((2 * Math.PI * t) / 2)).toFixed(2)} 180 24)`);
    } else if (i === 2) {
      const ph = phEnCours(t);
      liquide.current?.setAttribute("fill", couleurPh(ph));
      if (textePh.current) textePh.current.textContent = phTexte(ph);
      const v = verdictPh(ph);
      if (texteVerdict.current) {
        texteVerdict.current.textContent = v.texte;
        texteVerdict.current.setAttribute("fill", v.couleur);
      }
      marqueur.current?.setAttribute("transform", `translate(${X_ECHELLE(ph).toFixed(1)} 0)`);
    } else {
      const u = (t / 3) % 1; // un cycle respiratoire de 3 s
      const a = (1 - Math.cos(2 * Math.PI * u)) / 2;
      poumons.current?.setAttribute("transform", `translate(180 140) scale(${(1 + 0.14 * a).toFixed(3)} ${(1 + 0.1 * a).toFixed(3)}) translate(-180 -140)`);
      diaphragme.current?.setAttribute("transform", `translate(0 ${(14 * a).toFixed(1)})`);
      const entre = u < 0.5;
      const f = entre ? u / 0.5 : (u - 0.5) / 0.5;
      const fondu = Math.min(1, f * 5, (1 - f) * 5).toFixed(2);
      mO2.current?.setAttribute("transform", `translate(180 ${(22 + f * 66).toFixed(1)})`);
      mO2.current?.setAttribute("opacity", entre ? fondu : "0");
      mCO2.current?.setAttribute("transform", `translate(180 ${(88 - f * 66).toFixed(1)})`);
      mCO2.current?.setAttribute("opacity", entre ? "0" : fondu);
    }
  }

  useBoucle(anime, (dt) => {
    horloge.current += dt;
    const t = horloge.current - debut.current;
    if (horloge.current >= reprise.current && t >= DUREE) {
      debut.current = horloge.current;
      setActif((a) => (a + 1) % MATIERES.length);
      return;
    }
    dessiner(actif, t);
  });

  function choisir(i: number) {
    setActif(i);
    debut.current = horloge.current;
    reprise.current = horloge.current + REPRISE;
  }

  const verdictInitial = verdictPh(PH_STATIQUE);

  return (
    <section ref={racine} className="relative overflow-hidden bg-gradient-to-b from-white via-[#f3f6fb] to-fh-bleu/10">
      {/* Fond discret : grille légère et symboles qui flottent (animation CSS suspendue hors écran) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={style({ backgroundImage: "linear-gradient(to right, rgba(30,43,106,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,43,106,0.06) 1px, transparent 1px)", backgroundSize: "38px 38px", maskImage: "linear-gradient(to bottom, black 55%, transparent)" })} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden select-none sm:block">
        {SYMBOLES.map((s) => (
          <span
            key={s.s}
            className="hero-symbole absolute font-semibold text-fh-bleu/15"
            style={style({ left: `${s.x}%`, top: `${s.y}%`, fontSize: `${s.t}px`, "--delai": `${s.d}s`, "--duree": `${s.v}s`, animationPlayState: anime ? "running" : "paused" })}
          >
            {s.s}
          </span>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pt-8 pb-8 sm:px-6 sm:pt-12 min-[880px]:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] min-[880px]:gap-10 min-[880px]:pb-12">
        {/* ───── Texte ───── */}
        <div className="flex min-w-0 flex-col items-start gap-4">
          <span className="inline-flex max-w-full items-center rounded-full bg-fh-accent px-3.5 py-1.5 text-xs font-semibold text-fh-orange-fonce sm:text-sm">100 % gratuit · Programme officiel du Niger</span>
          <h1 className="text-[34px] font-extrabold leading-[1.08] tracking-tight text-fh-bleu sm:text-[48px]">
            Tout le programme du Niger, <span className="bg-gradient-to-r from-fh-orange to-fh-orange-clair bg-clip-text text-transparent">enfin clair.</span>
          </h1>
          <p className="max-w-xl text-base text-fh-ardoise sm:text-lg">
            Le programme officiel expliqué pas à pas et rendu interactif. Maths, Physique, Chimie et SVT — de la 6<sup>e</sup> à la Terminale, avec la rigueur qu&apos;il faut pour réussir.
          </p>
          <div className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href="#laboratoire" className="rounded-full bg-fh-orange px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-fh-orange-fonce motion-reduce:transition-none sm:text-base">
              Explorer gratuitement
            </a>
            <Link href={isAuthenticated ? "/eleve" : "/login"} className="rounded-full border border-fh-bleu px-6 py-3 text-center text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-bleu/5 motion-reduce:transition-none sm:text-base">
              {isAuthenticated ? "Mon espace" : "Se connecter"}
            </Link>
          </div>
          <dl className="mt-2 grid w-full max-w-xl grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-[#eef4fb] px-2 py-3 text-center sm:px-3">
              <dt className="text-2xl font-extrabold text-[#2b5a8c] sm:text-3xl">4</dt>
              <dd className="text-xs font-semibold text-fh-ardoise sm:text-sm">matières</dd>
            </div>
            <div className="rounded-2xl bg-[#fcefe7] px-2 py-3 text-center sm:px-3">
              <dt className="text-xl font-extrabold text-[#c0531f] sm:text-2xl">
                6<sup>e</sup> → T<sup>le</sup>
              </dt>
              <dd className="text-xs font-semibold text-fh-ardoise sm:text-sm">7 niveaux</dd>
            </div>
            <div className="rounded-2xl bg-[#eaf7ef] px-2 py-3 text-center sm:px-3">
              <dt className="text-xl font-extrabold text-[#2a9d4a] sm:text-2xl">Rigueur</dt>
              <dd className="text-xs font-semibold text-fh-ardoise sm:text-sm">programme officiel</dd>
            </div>
          </dl>
        </div>

        {/* ───── Carte « Simulation en direct » ───── */}
        <div className="min-w-0 rounded-3xl border border-fh-sable bg-white p-3 shadow-lg sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-bold text-fh-bleu">
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${anime ? "animate-pulse" : ""}`} style={{ backgroundColor: matiere.couleur }} />
              Simulation en direct
            </p>
            <span className="rounded-full px-3 py-1 text-xs font-bold transition-colors duration-300 motion-reduce:transition-none" style={{ backgroundColor: matiere.soft, color: matiere.couleur }}>
              {matiere.nom}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl transition-colors duration-300 motion-reduce:transition-none" style={{ backgroundColor: matiere.soft }}>
            <svg viewBox="0 0 360 220" className="block h-auto w-full" role="img" aria-label={`Simulation en direct : ${matiere.nom}`}>
              {matiere.id === "maths" && (
                <g>
                  <defs>
                    <clipPath id="hero-clip-sin">
                      <rect x={40} y={20} width={300} height={180} />
                    </clipPath>
                  </defs>
                  <line x1={20} y1={110} x2={340} y2={110} stroke="#363032" strokeWidth={1.4} />
                  <line x1={40} y1={20} x2={40} y2={200} stroke="#363032" strokeWidth={1.4} />
                  <g clipPath="url(#hero-clip-sin)">
                    <g ref={gSin}>
                      <path d={SIN_D} fill="none" stroke={matiere.couleur} strokeWidth={3.5} strokeLinecap="round" />
                    </g>
                  </g>
                  <line ref={guideSin} x1={X_POINT} y1={ySin(0).toFixed(1)} x2={X_POINT} y2={110} stroke="#c0531f" strokeWidth={1.6} strokeDasharray="4 3" />
                  <circle ref={ptSin} cx={X_POINT} cy={ySin(0).toFixed(1)} r={6.5} fill="#c0531f" stroke="#fff" strokeWidth={2} />
                  <text x={50} y={38} fontSize={15} fontWeight={700} fill={matiere.couleur}>y = sin x</text>
                </g>
              )}
              {matiere.id === "physique" && (
                <g>
                  <rect x={120} y={10} width={120} height={9} rx={3} fill="#363032" />
                  <path d="M96 167 A150 150 0 0 0 264 167" fill="none" stroke="#f0d8bf" strokeWidth={2.5} strokeDasharray="6 5" transform="translate(0 -2)" />
                  <line x1={180} y1={24} x2={180} y2={190} stroke="#363032" strokeOpacity={0.3} strokeDasharray="3 4" />
                  <g ref={bras} transform="rotate(22 180 24)">
                    <line x1={180} y1={24} x2={180} y2={168} stroke="#363032" strokeWidth={2.5} />
                    <circle cx={180} cy={168} r={19} fill={matiere.couleur} stroke="#8a3a12" strokeWidth={2.5} />
                  </g>
                  <circle cx={180} cy={24} r={5} fill="#1e2b6a" />
                  <text x={20} y={34} fontSize={15} fontWeight={700} fill={matiere.couleur}>pendule simple</text>
                </g>
              )}
              {matiere.id === "chimie" && (
                <g>
                  <defs>
                    <linearGradient id="hero-echelle-ph" x1="0" x2="1" y1="0" y2="0">
                      {PALIER_PH.map(([p, c]) => (
                        <stop key={p} offset={`${(p / 14) * 100}%`} stopColor={`rgb(${c.join(",")})`} />
                      ))}
                    </linearGradient>
                    <clipPath id="hero-clip-becher">
                      <path d="M112 52 L112 160 Q112 172 124 172 L236 172 Q248 172 248 160 L248 52 Z" />
                    </clipPath>
                  </defs>
                  <text ref={textePh} x={24} y={36} fontSize={22} fontWeight={800} fill="#1e2b6a">{phTexte(PH_STATIQUE)}</text>
                  <text ref={texteVerdict} x={336} y={36} textAnchor="end" fontSize={20} fontWeight={800} fill={verdictInitial.couleur}>{verdictInitial.texte}</text>
                  <g clipPath="url(#hero-clip-becher)">
                    <rect ref={liquide} x={108} y={92} width={144} height={84} fill={couleurPh(PH_STATIQUE)} />
                    <rect x={108} y={92} width={144} height={5} fill="#fff" opacity={0.35} />
                  </g>
                  <path d="M112 52 L112 160 Q112 172 124 172 L236 172 Q248 172 248 160 L248 52" fill="none" stroke="#363032" strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round" />
                  <path d="M104 52 L112 52 M248 52 L256 52" stroke="#363032" strokeWidth={3.5} strokeLinecap="round" />
                  {[130, 150, 170].map((y) => (
                    <line key={y} x1={112} y1={y} x2={124} y2={y} stroke="#363032" strokeWidth={1.6} />
                  ))}
                  {/* échelle de couleurs du pH */}
                  <rect x={40} y={190} width={280} height={11} rx={5.5} fill="url(#hero-echelle-ph)" stroke="#363032" strokeOpacity={0.35} />
                  <path ref={marqueur} d="M0 187 L-6 178 L6 178 Z" fill="#1e2b6a" transform={`translate(${X_ECHELLE(PH_STATIQUE).toFixed(1)} 0)`} />
                  <text x={40} y={214} fontSize={11} fontWeight={700} fill="#363032">0</text>
                  <text x={180} y={214} textAnchor="middle" fontSize={11} fontWeight={700} fill="#363032">7</text>
                  <text x={320} y={214} textAnchor="end" fontSize={11} fontWeight={700} fill="#363032">14</text>
                </g>
              )}
              {matiere.id === "svt" && (
                <g>
                  <path d="M180 8 L180 92" stroke="#363032" strokeWidth={13} strokeLinecap="round" fill="none" />
                  <path d="M180 92 Q150 98 138 112 M180 92 Q210 98 222 112" stroke="#363032" strokeWidth={7} strokeLinecap="round" fill="none" />
                  <g ref={poumons} transform="translate(180 140) scale(1.07 1.05) translate(-180 -140)">
                    <ellipse cx={130} cy={146} rx={44} ry={56} fill="#fda4af" stroke="#e11d48" strokeWidth={3} />
                    <ellipse cx={230} cy={146} rx={44} ry={56} fill="#fda4af" stroke="#e11d48" strokeWidth={3} />
                  </g>
                  <path ref={diaphragme} d="M50 206 Q180 180 310 206 L310 212 Q180 188 50 212 Z" fill={matiere.couleur} transform="translate(0 7)" />
                  <g ref={mO2} transform="translate(180 55)" opacity={0.9}>
                    <circle r={11} fill="#1f2ca2" />
                    <text y={4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff">O₂</text>
                  </g>
                  <g ref={mCO2} transform="translate(180 55)" opacity={0}>
                    <circle r={12} fill="#363032" />
                    <text y={4} textAnchor="middle" fontSize={9} fontWeight={800} fill="#fff">CO₂</text>
                  </g>
                  <text x={20} y={34} fontSize={15} fontWeight={700} fill={matiere.couleur}>respiration</text>
                </g>
              )}
            </svg>
          </div>

          <p className="mt-3 min-h-[4.25rem] text-sm leading-relaxed text-fh-ardoise sm:min-h-[3.25rem]">{matiere.phrase}</p>

          <div role="group" aria-label="Choisir une matière" className="mt-2 grid grid-cols-4 gap-2">
            {MATIERES.map((m, i) => {
              const courant = i === actif;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={courant}
                  onClick={() => choisir(i)}
                  className="min-h-11 rounded-full border px-1 text-xs font-bold transition-colors motion-reduce:transition-none sm:text-sm"
                  style={courant ? { backgroundColor: m.couleur, borderColor: m.couleur, color: "#fff" } : { backgroundColor: "#fff", borderColor: m.couleur, color: m.couleur }}
                >
                  {m.court}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-8 sm:px-6 sm:pb-12">{mosaique}</div>
    </section>
  );
}
