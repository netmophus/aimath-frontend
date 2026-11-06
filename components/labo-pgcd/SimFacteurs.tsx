"use client";

import { useState } from "react";

import {
  MAX_CHIFFRES_FACTEURS,
  Z0,
  lireEntier,
  pgcdPpcmParFacteurs,
  type Facteurs,
  type LigneFacteur,
} from "@/lib/arithmetique";
import { ChampEntier, Commandes, Tex, TroisQuestions, Zone, borner } from "./ui";

const TOTAL = 6;
const EXEMPLES: Array<[string, string]> = [
  ["60", "84"],
  ["18", "24"],
  ["36", "100"],
  ["17", "13"],
  ["120", "180"],
  ["1", "30"],
  ["2310", "490"],
];

/** Produit de facteurs en TeX : 2^{2} \times 3 \times 5 (ou 1 pour le produit vide). */
function texFacteurs(f: Facteurs): string {
  if (f.length === 0) return "1";
  return f.map(({ p, e }) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join(" \\times ");
}

function texLignes(lignes: LigneFacteur[], exposant: (l: LigneFacteur) => number): string {
  const parts = lignes.filter((l) => exposant(l) > 0).map((l) => (exposant(l) === 1 ? `${l.p}` : `${l.p}^{${exposant(l)}}`));
  return parts.length === 0 ? "1" : parts.join(" \\times ");
}

type Role = "commun" | "a" | "b";
const STYLE_JETON: Record<Role, string> = {
  commun: "border-emerald-600 bg-emerald-100 text-emerald-900",
  a: "border-blue-600 bg-blue-100 text-blue-900",
  b: "border-orange-600 bg-orange-100 text-orange-900",
};

function Jeton({ p, role }: { p: number; role: Role }) {
  return (
    <span className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border-2 px-2 text-sm font-bold ${STYLE_JETON[role]}`}>
      {p}
    </span>
  );
}

function Legende() {
  const item = (role: Role, texte: string) => (
    <span className="inline-flex items-center gap-1.5 text-xs text-fh-ardoise">
      <span aria-hidden="true" className={`inline-block h-3.5 w-3.5 rounded-full border-2 ${STYLE_JETON[role]}`} />
      {texte}
    </span>
  );
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {item("commun", "facteur commun")}
      {item("a", "seulement dans a")}
      {item("b", "seulement dans b")}
    </div>
  );
}

export default function SimFacteurs() {
  const [saisieA, setSaisieA] = useState("60");
  const [saisieB, setSaisieB] = useState("84");
  const [etape, setEtape] = useState(0);
  const [indexExemple, setIndexExemple] = useState(0);

  const lecA = lireEntier(saisieA, MAX_CHIFFRES_FACTEURS);
  const lecB = lireEntier(saisieB, MAX_CHIFFRES_FACTEURS);
  const positif = (l: ReturnType<typeof lireEntier>) => (l.ok && l.valeur <= Z0 ? { ok: false as const, erreur: "Entre un entier naturel strictement positif." } : l);
  const vA = positif(lecA);
  const vB = positif(lecB);
  const calcul = vA.ok && vB.ok ? pgcdPpcmParFacteurs(Number(vA.valeur), Number(vB.valeur)) : null;
  const e = borner(etape, TOTAL);

  function changer(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setEtape(0);
    };
  }
  function exemple() {
    const i = (indexExemple + 1) % EXEMPLES.length;
    setIndexExemple(i);
    setSaisieA(EXEMPLES[i][0]);
    setSaisieB(EXEMPLES[i][1]);
    setEtape(0);
  }

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <div className="flex flex-wrap gap-3">
          <ChampEntier etiquette="Entier a (≥ 1)" valeur={saisieA} onChange={changer(setSaisieA)} lecture={vA} />
          <ChampEntier etiquette="Entier b (≥ 1)" valeur={saisieB} onChange={changer(setSaisieB)} lecture={vB} />
        </div>
        <p className="text-xs text-fh-ardoise/70">Entiers naturels non nuls, {MAX_CHIFFRES_FACTEURS} chiffres au plus (la décomposition est calculée exactement).</p>
        <Commandes etape={e} total={TOTAL} onPrecedent={() => setEtape(e - 1)} onSuivant={() => setEtape(e + 1)} onTout={() => setEtape(TOTAL)} onRecommencer={() => setEtape(0)} onExemple={exemple} />
      </Zone>

      {calcul && (
        <>
          <Zone titre="Simulation">
            {e === 0 && <p className="text-sm text-fh-ardoise">Clique sur « Étape suivante » pour décomposer les deux nombres.</p>}
            {e >= 1 && (
              <Tex bloc expr={`${vA.ok ? vA.valeur : ""} = ${texFacteurs(calcul.fa)}`} />
            )}
            {e >= 2 && (
              <Tex bloc expr={`${vB.ok ? vB.valeur : ""} = ${texFacteurs(calcul.fb)}`} />
            )}
            {e >= 3 && (
              <>
                <Legende />
                <ul className="grid gap-2 sm:grid-cols-2" aria-label="Facteurs premiers comparés">
                  {calcul.lignes.map((l) => (
                    <li
                      key={l.p}
                      className="flex flex-col gap-1.5 rounded-lg border border-fh-sable bg-white px-3 py-2"
                      aria-label={`Facteur premier ${l.p} : exposant ${l.ea} dans a, ${l.eb} dans b`}
                    >
                      <span className="text-xs font-semibold text-fh-ardoise/70">Facteur premier {l.p}</span>
                      <div className="flex min-h-9 flex-wrap items-center gap-1.5">
                        <span className="w-4 text-xs font-bold text-fh-bleu">a</span>
                        {Array.from({ length: l.ea }, (_, i) => (
                          <Jeton key={i} p={l.p} role={i < l.min ? "commun" : "a"} />
                        ))}
                        {l.ea === 0 && <span className="text-xs text-fh-ardoise/60">aucun</span>}
                      </div>
                      <div className="flex min-h-9 flex-wrap items-center gap-1.5">
                        <span className="w-4 text-xs font-bold text-fh-bleu">b</span>
                        {Array.from({ length: l.eb }, (_, i) => (
                          <Jeton key={i} p={l.p} role={i < l.min ? "commun" : "b"} />
                        ))}
                        {l.eb === 0 && <span className="text-xs text-fh-ardoise/60">aucun</span>}
                      </div>
                    </li>
                  ))}
                  {calcul.lignes.length === 0 && <li className="text-sm text-fh-ardoise">Aucun facteur premier : a = b = 1.</li>}
                </ul>
              </>
            )}
            {e >= 4 && (
              <Tex
                bloc
                expr={`\\mathrm{PGCD}(${vA.ok ? vA.valeur : ""}, ${vB.ok ? vB.valeur : ""}) = ${texLignes(calcul.lignes, (l) => l.min)} = ${calcul.pgcd}`}
              />
            )}
            {e >= 5 && (
              <Tex
                bloc
                expr={`\\mathrm{PPCM}(${vA.ok ? vA.valeur : ""}, ${vB.ok ? vB.valeur : ""}) = ${texLignes(calcul.lignes, (l) => l.max)} = ${calcul.ppcm}`}
              />
            )}
          </Zone>

          <Zone titre="Explications" ton="explication">
            {e === 0 && <p className="text-sm text-fh-ardoise">Chaque étape expliquera ce qu&apos;on fait, pourquoi, et ce qu&apos;on obtient.</p>}
            {(e === 1 || e === 2) && (
              <TroisQuestions
                quoi={<>On décompose {e === 1 ? "a" : "b"} en produit de nombres premiers, en divisant par 2, puis 3, puis 5, etc., tant que c&apos;est possible.</>}
                pourquoi={<>Tout entier supérieur ou égal à 2 s&apos;écrit de façon unique comme produit de nombres premiers : c&apos;est ce qui permet de comparer les deux nombres facteur par facteur.</>}
                obtenu={<>La décomposition de {e === 1 ? "a" : "b"} : un exposant indique combien de fois le facteur est répété ; le nombre 1 n&apos;a aucun facteur premier (produit vide).</>}
              />
            )}
            {e === 3 && (
              <TroisQuestions
                quoi={<>On range chaque facteur premier dans un jeton et on place les jetons de a et de b l&apos;un sous l&apos;autre, facteur par facteur.</>}
                pourquoi={<>Pour voir ce que a et b ont <strong>en commun</strong> (jetons verts) et ce qui n&apos;appartient qu&apos;à l&apos;un d&apos;eux (bleu pour a, orange pour b).</>}
                obtenu={<>Pour chaque facteur premier p, le nombre de jetons verts est le plus petit des deux exposants.</>}
              />
            )}
            {e === 4 && (
              <TroisQuestions
                quoi={<>Pour le <strong>PGCD</strong>, on garde uniquement les facteurs communs, chacun avec son plus petit exposant.</>}
                pourquoi={<>Un diviseur commun de a et de b ne peut contenir que des facteurs présents dans les deux nombres, et pas plus de fois que dans le plus pauvre des deux.</>}
                obtenu={<>Le PGCD est le produit des jetons verts : <Tex expr={`${calcul.pgcd}`} />.</>}
              />
            )}
            {e >= 5 && (
              <TroisQuestions
                quoi={<>Pour le <strong>PPCM</strong>, on prend tous les facteurs présents dans a ou dans b, chacun avec son plus grand exposant.</>}
                pourquoi={<>Un multiple commun doit contenir tous les facteurs de a et tous ceux de b ; le plus petit n&apos;en contient pas plus que nécessaire.</>}
                obtenu={<>Le PPCM est le produit de tous les jetons (verts, bleus et orange) : <Tex expr={`${calcul.ppcm}`} />.</>}
              />
            )}
          </Zone>

          <Zone titre="Résultat" ton="resultat">
            {e >= 5 ? (
              <>
                <Tex bloc className="text-lg" expr={`\\mathrm{PGCD} = ${calcul.pgcd} \\qquad \\mathrm{PPCM} = ${calcul.ppcm}`} />
                {e >= 6 ? (
                  <>
                    <Tex bloc expr={`\\mathrm{PGCD} \\times \\mathrm{PPCM} = ${calcul.pgcd} \\times ${calcul.ppcm} = ${calcul.pgcd * calcul.ppcm}`} />
                    <Tex bloc expr={`a \\times b = ${vA.ok ? vA.valeur : ""} \\times ${vB.ok ? vB.valeur : ""} = ${calcul.produit}`} />
                    <p className="text-sm font-semibold text-emerald-800">
                      {calcul.pgcd * calcul.ppcm === calcul.produit ? "Les deux produits sont égaux : PGCD × PPCM = a × b." : "Les produits sont différents."}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-fh-ardoise">Étape suivante : vérifier la relation PGCD × PPCM = a × b.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-fh-ardoise">Le PGCD et le PPCM apparaîtront aux étapes 4 et 5.</p>
            )}
          </Zone>
        </>
      )}
    </div>
  );
}
