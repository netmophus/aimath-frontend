"use client";

import { useState } from "react";

import { Z0, Z1, bezout, lireEntier, type ResultatBezout } from "@/lib/arithmetique";
import { Bouton, ChampEntier, Commandes, Message, Tex, TroisQuestions, Zone, borner, entierOuNull, par } from "./ui";

const EXEMPLES: Array<[string, string]> = [
  ["35", "18"],
  ["240", "46"],
  ["-35", "18"],
  ["12", "18"],
  ["17", "5"],
  ["0", "7"],
];

const VERT = "\\textcolor{#0F7A3D}";

export default function SimBezout() {
  const [saisieA, setSaisieA] = useState("35");
  const [saisieB, setSaisieB] = useState("18");
  const [etape, setEtape] = useState(0);
  const [saisieU, setSaisieU] = useState("0");
  const [saisieV, setSaisieV] = useState("0");
  const [indexExemple, setIndexExemple] = useState(0);

  const lecA = lireEntier(saisieA);
  const lecB = lireEntier(saisieB);
  const aNul = lecA.ok && lecB.ok && lecA.valeur === Z0 && lecB.valeur === Z0;
  const a = lecA.ok ? lecA.valeur : Z0;
  const b = lecB.ok ? lecB.valeur : Z0;
  const r: ResultatBezout | null = lecA.ok && lecB.ok && !aNul ? bezout(a, b) : null;

  const n = r ? r.divisions.length : 0;
  const s = r ? r.remontee.length : 0;
  const total = n + s + 1;
  const e = borner(etape, total);

  function reinitialiser() {
    setEtape(0);
    setSaisieU("0");
    setSaisieV("0");
  }
  function changer(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      reinitialiser();
    };
  }
  function exemple() {
    const i = (indexExemple + 1) % EXEMPLES.length;
    setIndexExemple(i);
    setSaisieA(EXEMPLES[i][0]);
    setSaisieB(EXEMPLES[i][1]);
    reinitialiser();
  }

  const lecU = lireEntier(saisieU);
  const lecV = lireEntier(saisieV);
  const u = entierOuNull(saisieU);
  const v = entierOuNull(saisieV);
  const valeur = r && u !== null && v !== null ? a * u + b * v : null;

  function ajuster(setter: (t: string) => void, courant: bigint | null, delta: number) {
    setter(String((courant ?? Z0) + BigInt(delta)));
  }

  const R = r?.restes ?? [];
  const Q = r?.quotients ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <div className="flex flex-wrap gap-3">
          <ChampEntier etiquette="Entier a" valeur={saisieA} onChange={changer(setSaisieA)} lecture={lecA} />
          <ChampEntier etiquette="Entier b" valeur={saisieB} onChange={changer(setSaisieB)} lecture={lecB} />
        </div>
        <p className="text-xs text-fh-ardoise/70">Entiers relatifs, non tous deux nuls (15 chiffres au plus).</p>
        {aNul && <Message type="erreur">PGCD(0, 0) n&apos;est pas défini : Bézout demande au moins un entier non nul.</Message>}
        <Commandes etape={e} total={total} onPrecedent={() => setEtape(e - 1)} onSuivant={() => setEtape(e + 1)} onTout={() => setEtape(total)} onRecommencer={() => setEtape(0)} onExemple={exemple} />
      </Zone>

      {r && (
        <>
          <Zone titre="Simulation">
            {e === 0 && <p className="text-sm text-fh-ardoise">Étape 1 : l&apos;algorithme d&apos;Euclide. Ensuite, on remonte les divisions pour exprimer le PGCD.</p>}
            {n > 0 && e > 0 && (
              <ol className="flex flex-col" aria-label="Divisions euclidiennes">
                {r.divisions.slice(0, Math.min(e, n)).map((d, i) => (
                  <li key={i}>
                    <Tex expr={`${d.dividende} = ${d.diviseur} \\times ${d.quotient} + ${d.reste}`} />
                  </li>
                ))}
              </ol>
            )}
            {e >= n && e > 0 && <Tex bloc expr={`\\mathrm{PGCD}(${a}, ${b}) = ${VERT}{\\mathbf{${r.d}}}`} />}
            {e >= n && e > 0 && r.d === Z1 && <p className="text-sm font-semibold text-emerald-800">Le PGCD vaut 1 : a et b sont premiers entre eux.</p>}
            {e > n && s > 0 && (
              <div className="flex flex-col gap-1" aria-label="Remontée de l'algorithme">
                <p className="text-xs font-semibold text-fh-ardoise/70">Remontée :</p>
                {r.remontee.slice(0, Math.min(e - n, s)).map((st, j) => {
                  const m = R.length - 1;
                  const premiere = j === 0;
                  return (
                    <div key={j} className="flex flex-col">
                      {premiere ? (
                        <Tex expr={`${r.d} = ${R[m - 2]} - ${Q[m - 1]} \\times ${R[m - 1]}`} />
                      ) : (
                        <Tex className="text-fh-ardoise/80" expr={`\\text{or } ${R[st.k + 2]} = ${R[st.k]} - ${Q[st.k + 1]} \\times ${R[st.k + 1]}`} />
                      )}
                      <Tex expr={`${r.d} = ${par(st.alpha)} \\times ${R[st.k]} + ${par(st.beta)} \\times ${R[st.k + 1]}`} />
                    </div>
                  );
                })}
              </div>
            )}
            {e === total && <Tex bloc expr={`${par(a)} \\times ${par(r.u)} + ${par(b)} \\times ${par(r.v)} = ${a * r.u} + ${par(b * r.v)} = ${VERT}{\\mathbf{${r.d}}}`} />}
          </Zone>

          <Zone titre="Explications" ton="explication">
            {e === 0 && <p className="text-sm text-fh-ardoise">Chaque étape expliquera ce qu&apos;on fait, pourquoi, et ce qu&apos;on obtient.</p>}
            {e > 0 && e <= n && (
              <TroisQuestions
                quoi={<>On fait la division euclidienne numéro {e} : <Tex expr={`${r.divisions[e - 1].dividende} = ${r.divisions[e - 1].diviseur} \\times ${r.divisions[e - 1].quotient} + ${r.divisions[e - 1].reste}`} />.</>}
                pourquoi={<>Le PGCD ne change pas quand on remplace le couple (dividende, diviseur) par (diviseur, reste). On continue jusqu&apos;à un reste nul.</>}
                obtenu={r.divisions[e - 1].reste === Z0 ? <>Reste nul : le dernier reste non nul, <strong>{String(r.d)}</strong>, est le PGCD.</> : <>Le reste <Tex expr={`${r.divisions[e - 1].reste}`} /> sert de nouveau diviseur.</>}
              />
            )}
            {e > n && e < total && (
              <TroisQuestions
                quoi={
                  e - n === 1 ? (
                    <>On isole le PGCD dans l&apos;avant-dernière division : on l&apos;écrit comme une combinaison des deux restes qui la précèdent.</>
                  ) : (
                    <>On remplace le reste le plus récent par son écriture tirée de la division précédente, puis on regroupe les termes.</>
                  )
                }
                pourquoi={<>Chaque reste s&apos;écrit comme « reste précédent − quotient × reste d&apos;avant ». En remplaçant pas à pas, on finit par n&apos;avoir plus que a et b.</>}
                obtenu={<>Une écriture du PGCD en fonction de deux nombres de la suite, de plus en plus proches de a et b.</>}
              />
            )}
            {e === total && (
              <TroisQuestions
                quoi={<>On lit les coefficients devant a et devant b dans la dernière écriture{a < Z0 || b < Z0 ? " (en tenant compte du signe de a et de b)" : ""}.</>}
                pourquoi={<>L&apos;identité de Bézout dit qu&apos;il existe des entiers relatifs u et v tels que <Tex expr="au + bv = \mathrm{PGCD}(a,b)" />.</>}
                obtenu={<>Coefficients <Tex expr={`u = ${r.u}`} /> et <Tex expr={`v = ${r.v}`} />.</>}
              />
            )}
          </Zone>

          <Zone titre="À toi de jouer">
            <p className="text-sm text-fh-ardoise">
              Choisis des entiers <Tex expr="u" /> et <Tex expr="v" /> et observe la valeur de <Tex expr="au + bv" />.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <ChampEntier etiquette="u" valeur={saisieU} onChange={setSaisieU} lecture={lecU} />
              <ChampEntier etiquette="v" valeur={saisieV} onChange={setSaisieV} lecture={lecV} />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Ajuster u et v">
              <Bouton onClick={() => ajuster(setSaisieU, u, -1)}>u − 1</Bouton>
              <Bouton onClick={() => ajuster(setSaisieU, u, 1)}>u + 1</Bouton>
              <Bouton onClick={() => ajuster(setSaisieV, v, -1)}>v − 1</Bouton>
              <Bouton onClick={() => ajuster(setSaisieV, v, 1)}>v + 1</Bouton>
              <Bouton onClick={() => { setSaisieU(String(r.u)); setSaisieV(String(r.v)); }}>Afficher les coefficients trouvés</Bouton>
            </div>
            {valeur !== null && u !== null && v !== null && (
              <div aria-live="polite" className="flex flex-col gap-2">
                <Tex bloc expr={`${par(a)} \\times ${par(u)} + ${par(b)} \\times ${par(v)} = ${a * u} + ${par(b * v)} = ${valeur}`} />
                {valeur === r.d ? (
                  <Message type="ok">Bravo : au + bv = PGCD(a, b) = {String(r.d)}.</Message>
                ) : (
                  <Message>
                    Ici au + bv = {String(valeur)}, c&apos;est un multiple de {String(r.d)} (le PGCD) mais pas le PGCD lui-même. Ajuste u et v pour obtenir exactement {String(r.d)}.
                  </Message>
                )}
              </div>
            )}
          </Zone>

          <Zone titre="Résultat" ton="resultat">
            {e === total ? (
              <>
                <Tex bloc className="text-lg" expr={`${par(a)} \\times ${par(r.u)} + ${par(b)} \\times ${par(r.v)} = ${r.d} = \\mathrm{PGCD}(${a}, ${b})`} />
                {r.d === Z1 ? (
                  <p className="text-sm text-fh-ardoise">
                    <strong>Théorème de Bézout.</strong> Deux entiers sont premiers entre eux si et seulement s&apos;il existe deux entiers relatifs u et v tels que{" "}
                    <Tex expr="au + bv = 1" />. Ici a et b sont premiers entre eux.
                  </p>
                ) : (
                  <p className="text-sm text-fh-ardoise">
                    Ici le PGCD vaut {String(r.d)} : on a l&apos;identité générale <Tex expr="au + bv = \mathrm{PGCD}(a,b)" />. Comme {String(r.d)} est différent de 1, a et b ne sont pas premiers entre eux.
                  </p>
                )}
                <p className="text-sm text-fh-ardoise">
                  <strong>Ces coefficients ne sont pas uniques.</strong> Pour tout entier k, le couple{" "}
                  <Tex expr={`(u + k \\times ${par(b / r.d)},\\ v - k \\times ${par(a / r.d)})`} /> convient aussi. Par exemple, avec k = 1 :{" "}
                  <Tex expr={`u = ${r.u + b / r.d},\\ v = ${r.v - a / r.d}`} />.
                </p>
              </>
            ) : (
              <p className="text-sm text-fh-ardoise">Le couple (u, v) apparaîtra à la dernière étape.</p>
            )}
          </Zone>
        </>
      )}
    </div>
  );
}
