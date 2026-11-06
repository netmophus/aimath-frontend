"use client";

import { useId, useState } from "react";

import { Z0, Z1, equationZ2, lireEntier, solutionZ2 } from "@/lib/arithmetique";
import { ChampEntier, Commandes, Message, Tex, TroisQuestions, Zone, borner, entierOuNull, par } from "./ui";

const EXEMPLES: Array<[string, string, string]> = [
  ["6", "4", "2"],
  ["34", "-21", "5"],
  ["35", "18", "7"],
  ["6", "4", "3"],
  ["0", "5", "10"],
  ["7", "0", "21"],
  ["-6", "-4", "2"],
];

/** c0 + pas × k, écrit en TeX proprement (sans « + 0k », sans coefficient 1). */
function lin(c0: bigint, pas: bigint): string {
  if (pas === Z0) return `${c0}`;
  const p = pas < Z0 ? -pas : pas;
  const coef = p === Z1 ? "" : `${p}`;
  if (c0 === Z0) return `${pas < Z0 ? "-" : ""}${coef}k`;
  return `${c0} ${pas < Z0 ? "-" : "+"} ${coef}k`;
}

function equationTex(a: bigint, b: bigint, c: bigint): string {
  const terme = (coef: bigint, v: string, premier: boolean) => {
    if (coef === Z0) return "";
    const p = coef < Z0 ? -coef : coef;
    const nombre = p === Z1 ? "" : `${p}`;
    const signe = coef < Z0 ? "-" : premier ? "" : "+";
    return `${premier ? signe : ` ${signe} `}${nombre}${v}`;
  };
  const ta = terme(a, "x", true);
  const tb = terme(b, "y", ta === "");
  return `${ta}${tb} = ${c}`;
}

export default function SimEquations() {
  const idCurseur = useId();
  const [sa, setSa] = useState("6");
  const [sb, setSb] = useState("4");
  const [sc, setSc] = useState("2");
  const [etape, setEtape] = useState(0);
  const [sk, setSk] = useState("0");
  const [indexExemple, setIndexExemple] = useState(0);

  const la = lireEntier(sa);
  const lb = lireEntier(sb);
  const lc = lireEntier(sc);
  const lk = lireEntier(sk);
  const a = la.ok ? la.valeur : Z0;
  const b = lb.ok ? lb.valeur : Z0;
  const c = lc.ok ? lc.valeur : Z0;
  const ok = la.ok && lb.ok && lc.ok;
  const aEtBNuls = ok && a === Z0 && b === Z0;
  const r = ok && !aEtBNuls ? equationZ2(a, b, c) : null;
  const total = r ? (r.solvable ? 3 : 1) : 0;
  const e = borner(etape, total);

  function changer(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setEtape(0);
      setSk("0");
    };
  }
  function exemple() {
    const i = (indexExemple + 1) % EXEMPLES.length;
    setIndexExemple(i);
    setSa(EXEMPLES[i][0]);
    setSb(EXEMPLES[i][1]);
    setSc(EXEMPLES[i][2]);
    setEtape(0);
    setSk("0");
  }

  const k = entierOuNull(sk);
  const sol = r && r.solvable && k !== null ? solutionZ2(r, k) : null;
  const curseur = k === null ? 0 : k < BigInt(-10) ? -10 : k > BigInt(10) ? 10 : Number(k);

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <p className="text-sm text-fh-ardoise">
          On cherche les entiers relatifs <Tex expr="x" /> et <Tex expr="y" /> tels que <Tex expr="ax + by = c" />.
        </p>
        <div className="flex flex-wrap gap-3">
          <ChampEntier etiquette="Entier a" valeur={sa} onChange={changer(setSa)} lecture={la} />
          <ChampEntier etiquette="Entier b" valeur={sb} onChange={changer(setSb)} lecture={lb} />
          <ChampEntier etiquette="Entier c" valeur={sc} onChange={changer(setSc)} lecture={lc} />
        </div>
        <p className="text-xs text-fh-ardoise/70">Entiers relatifs, 15 chiffres au plus.</p>
        {aEtBNuls && (
          <Message type="erreur">
            a et b ne peuvent pas être tous les deux nuls : l&apos;équation deviendrait 0 = c, sans aucune inconnue, et le PGCD(0, 0) n&apos;est pas défini.
          </Message>
        )}
        {ok && !aEtBNuls && <Tex bloc className="text-lg" expr={equationTex(a, b, c)} />}
        <Commandes etape={e} total={total} onPrecedent={() => setEtape(e - 1)} onSuivant={() => setEtape(e + 1)} onTout={() => setEtape(total)} onRecommencer={() => setEtape(0)} onExemple={exemple} />
      </Zone>

      {r && (
        <>
          <Zone titre="Simulation">
            {e === 0 && <p className="text-sm text-fh-ardoise">Clique sur « Étape suivante » : on commence par vérifier si l&apos;équation a des solutions.</p>}
            {e >= 1 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-fh-ardoise/70">1. Existence</p>
                <Tex bloc expr={`d = \\mathrm{PGCD}(${a}, ${b}) = ${r.d}`} />
                <Tex bloc expr={r.solvable ? `${r.d} \\mid ${par(c)} \\text{ : oui}` : `${r.d} \\nmid ${par(c)} \\text{ : non}`} />
              </div>
            )}
            {r.solvable && e >= 2 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-fh-ardoise/70">2. Solution particulière (Bézout)</p>
                <Tex bloc expr={`${par(a)} \\times ${par(r.u)} + ${par(b)} \\times ${par(r.v)} = ${r.d}`} />
                {r.facteur !== Z1 && <Tex bloc expr={`\\text{on multiplie par } \\tfrac{c}{d} = ${r.facteur}`} />}
                <Tex bloc expr={`x_0 = ${r.x0}, \\quad y_0 = ${r.y0}`} />
              </div>
            )}
            {r.solvable && e >= 3 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-fh-ardoise/70">3. Toutes les solutions</p>
                <Tex bloc expr={`x = x_0 + \\tfrac{b}{d}k, \\quad y = y_0 - \\tfrac{a}{d}k \\quad (k \\in \\mathbb{Z})`} />
                <Tex bloc expr={`x = ${lin(r.x0, r.pasX)}, \\quad y = ${lin(r.y0, -r.pasY)}`} />
              </div>
            )}
            {r.solvable && e >= 3 && (
              <div className="flex flex-col gap-3 rounded-lg border border-fh-sable bg-white p-3">
                <p className="text-sm font-semibold text-fh-bleu">Fais varier k et vérifie l&apos;égalité</p>
                <div className="flex flex-col gap-1">
                  <label htmlFor={idCurseur} className="text-xs text-fh-ardoise/70">
                    Curseur : k de −10 à 10
                  </label>
                  <input id={idCurseur} type="range" min={-10} max={10} step={1} value={curseur} onChange={(ev) => setSk(ev.target.value)} className="h-11 w-full accent-fh-bleu-vif" />
                </div>
                <div className="max-w-xs">
                  <ChampEntier etiquette="Ou saisis directement k (entier relatif)" valeur={sk} onChange={setSk} lecture={lk} />
                </div>
                {sol && k !== null && (
                  <div aria-live="polite" className="flex flex-col gap-1">
                    <Tex bloc expr={`k = ${k} \\;\\Rightarrow\\; x = ${sol.x}, \\; y = ${sol.y}`} />
                    <Tex bloc expr={`${par(a)} \\times ${par(sol.x)} + ${par(b)} \\times ${par(sol.y)} = ${a * sol.x} + ${par(b * sol.y)} = ${a * sol.x + b * sol.y}`} />
                    <Message type="ok">L&apos;égalité ax + by = {String(c)} est bien vérifiée.</Message>
                  </div>
                )}
              </div>
            )}
          </Zone>

          <Zone titre="Explications" ton="explication">
            {e === 0 && <p className="text-sm text-fh-ardoise">Chaque étape expliquera ce qu&apos;on fait, pourquoi, et ce qu&apos;on obtient.</p>}
            {e === 1 && (
              <TroisQuestions
                quoi={<>On calcule <Tex expr="d = \mathrm{PGCD}(a, b)" /> et on regarde si d divise c.</>}
                pourquoi={<>Comme d divise a et b, il divise toute expression <Tex expr="ax + by" /> avec x et y entiers. Si d ne divise pas c, aucun couple d&apos;entiers ne convient.</>}
                obtenu={r.solvable ? <>d = {String(r.d)} divise {String(c)} : l&apos;équation possède des solutions entières.</> : <>d = {String(r.d)} ne divise pas {String(c)} : l&apos;équation n&apos;a <strong>aucune</strong> solution entière.</>}
              />
            )}
            {r.solvable && e === 2 && (
              <TroisQuestions
                quoi={<>On écrit l&apos;identité de Bézout <Tex expr="au + bv = d" />, puis on multiplie par <Tex expr="c/d" />.</>}
                pourquoi={<>En multipliant les deux membres par l&apos;entier <Tex expr={`c/d = ${r.facteur}`} />, on obtient <Tex expr="a(u \tfrac{c}{d}) + b(v \tfrac{c}{d}) = c" /> : on a une solution de l&apos;équation.</>}
                obtenu={<>Une solution particulière <Tex expr={`(x_0, y_0) = (${r.x0}, ${r.y0})`} />.</>}
              />
            )}
            {r.solvable && e === 3 && (
              <TroisQuestions
                quoi={<>On soustrait deux solutions : si <Tex expr="(x, y)" /> en est une, alors <Tex expr="a(x - x_0) = -b(y - y_0)" />.</>}
                pourquoi={<>En divisant par d, <Tex expr="\tfrac{a}{d}(x - x_0) = -\tfrac{b}{d}(y - y_0)" /> avec <Tex expr="\tfrac{a}{d}" /> et <Tex expr="\tfrac{b}{d}" /> premiers entre eux. Le théorème de Gauss donne alors que <Tex expr="\tfrac{b}{d}" /> divise <Tex expr="x - x_0" />.</>}
                obtenu={<>Toutes les solutions sont <Tex expr="x = x_0 + \tfrac{b}{d}k" />, <Tex expr="y = y_0 - \tfrac{a}{d}k" />, avec k entier.{(a === Z0 || b === Z0) && <> Ici un coefficient est nul : l&apos;une des deux inconnues reste libre (le pas vaut 0 pour l&apos;autre), sans aucune division par 0.</>}</>}
              />
            )}
          </Zone>

          <Zone titre="Résultat" ton="resultat">
            {!r.solvable && e >= 1 ? (
              <p className="text-base font-semibold text-red-800">Cette équation n&apos;a aucune solution dans ℤ².</p>
            ) : r.solvable && e >= 3 ? (
              <>
                <Tex bloc className="text-lg" expr={`\\mathcal{S} = \\{ (${lin(r.x0, r.pasX)},\\; ${lin(r.y0, -r.pasY)}) \\;;\\; k \\in \\mathbb{Z} \\}`} />
                <p className="text-sm text-fh-ardoise">Vérifie avec le curseur : pour chaque entier k, ax + by = c.</p>
              </>
            ) : (
              <p className="text-sm text-fh-ardoise">L&apos;ensemble des solutions apparaîtra à la fin.</p>
            )}
          </Zone>
        </>
      )}
    </div>
  );
}
