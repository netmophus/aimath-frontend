"use client";

import { useState } from "react";
import { lireEntier } from "@/lib/arithmetique";
import { MODULES, analyserModulo, diviseursDeZero, estInversible, inverseModulaire, pgcdEntiers, reduire, resoudreCongruence, tableMultiplication } from "@/lib/premiers";
import { Bouton, ChampNombre, Commandes, Conclusion, Defi, Intro, Message, Onglets, Pastille, Tex, TroisQuestions, Zone, borner, par } from "./ui";

const cl = (a: number) => `\\overline{${a}}`;

function ChoixModule({ m, onChange, etiquette = "Module" }: { m: number; onChange: (m: number) => void; etiquette?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={etiquette}>
      <span className="text-xs font-semibold text-fh-ardoise/80">{etiquette} n :</span>
      {MODULES.map((x) => (
        <Pastille key={x} actif={x === m} onClick={() => onChange(x)}>
          {x}
        </Pastille>
      ))}
    </div>
  );
}

/** Mode 1 : construire la table de multiplication. */
function ModeTable() {
  const [m, setM] = useState(5);
  const [vues, setVues] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [entrainement, setEntrainement] = useState(false);
  const [reponse, setReponse] = useState("");
  const [retour, setRetour] = useState<{ type: "ok" | "erreur"; texte: string } | null>(null);
  const table = tableMultiplication(m);
  const cle = (i: number, j: number) => `${i},${j}`;
  const toutes = vues.size === m * m;

  function changer(x: number) {
    setM(x);
    setVues(new Set());
    setSel(null);
    setRetour(null);
    setReponse("");
  }
  function cliquer(i: number, j: number) {
    setSel([i, j]);
    setRetour(null);
    setReponse("");
    if (!entrainement) setVues((v) => new Set(v).add(cle(i, j)));
  }
  function verifier() {
    if (!sel) return;
    const l = lireEntier(reponse, 3);
    const attendu = table[sel[0]][sel[1]];
    if (!l.ok) return setRetour({ type: "erreur", texte: l.erreur });
    if (Number(l.valeur) === attendu) {
      setVues((v) => new Set(v).add(cle(sel[0], sel[1])));
      setRetour({ type: "ok", texte: `Exact : ${sel[0]} × ${sel[1]} ≡ ${attendu} (mod ${m}).` });
    } else {
      const prod = sel[0] * sel[1];
      setRetour({ type: "erreur", texte: `Pas tout à fait. ${sel[0]} × ${sel[1]} = ${prod}. Divise ${prod} par ${m} : le reste de la division euclidienne est la classe cherchée.` });
    }
  }
  const prod = sel ? sel[0] * sel[1] : 0;
  const r = sel ? table[sel[0]][sel[1]] : 0;

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <ChoixModule m={m} onChange={changer} />
        <div className="flex flex-wrap gap-2">
          <Pastille actif={entrainement} onClick={() => { setEntrainement(!entrainement); setSel(null); setRetour(null); }}>Mode entraînement</Pastille>
          <Bouton onClick={() => setVues(new Set(table.flatMap((l, i) => l.map((_, j) => cle(i, j)))))} disabled={toutes}>Révéler toute la table</Bouton>
          <Bouton onClick={() => { setVues(new Set()); setSel(null); setRetour(null); }} disabled={vues.size === 0}>Recommencer</Bouton>
        </div>
      </Zone>
      <Zone titre="Simulation">
        <p className="text-sm text-fh-ardoise">
          {entrainement ? "Clique sur une case, calcule le produit dans Z/" + m + "Z puis saisis ta réponse." : "Clique sur une case pour construire le produit pas à pas."}
        </p>
        <div className="max-w-full overflow-x-auto">
          <table className="border-separate border-spacing-1 text-center" aria-label={`Table de multiplication modulo ${m}`}>
            <thead>
              <tr>
                <th className="px-1 text-sm text-fh-ardoise" scope="col">×</th>
                {table.map((_, j) => (
                  <th key={j} scope="col" className="min-w-9 rounded bg-fh-accent px-1 text-sm font-bold text-fh-bleu">{j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((ligne, i) => (
                <tr key={i}>
                  <th scope="row" className="rounded bg-fh-accent px-1 text-sm font-bold text-fh-bleu">{i}</th>
                  {ligne.map((v, j) => {
                    const vue = vues.has(cle(i, j));
                    const zeroDiv = vue && v === 0 && i !== 0 && j !== 0;
                    const un = vue && v === 1;
                    const choisie = sel && sel[0] === i && sel[1] === j;
                    return (
                      <td key={j}>
                        <button
                          type="button"
                          onClick={() => cliquer(i, j)}
                          aria-label={`${i} fois ${j} modulo ${m} : ${vue ? v : "à calculer"}`}
                          className={`h-9 w-9 rounded-md border text-sm font-semibold ${choisie ? "border-fh-bleu-vif bg-fh-bleu-vif text-white" : zeroDiv ? "border-orange-400 bg-orange-100 text-orange-900" : un ? "border-emerald-500 bg-emerald-100 text-emerald-900" : vue ? "border-fh-sable bg-white text-fh-bleu" : "border-dashed border-slate-300 bg-slate-50 text-slate-400"}`}
                        >
                          {vue ? v : "?"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-fh-ardoise/70">Vert : produit égal à 1 (les deux classes sont inverses l&apos;une de l&apos;autre). Orange : produit nul de deux classes non nulles (diviseurs de zéro).</p>
      </Zone>
      <Zone titre="Explications" ton="explication">
        {sel ? (
          <>
            <TroisQuestions
              quoi={<>On multiplie les classes {sel[0]} et {sel[1]} : <Tex expr={`${sel[0]} \\times ${sel[1]} = ${prod}`} />, puis on cherche le reste dans la division par {m}.</>}
              pourquoi={<>Dans Z/{m}Z, une classe est identifiée à son reste dans la division euclidienne par {m}.</>}
              obtenu={
                !entrainement || vues.has(cle(sel[0], sel[1])) ? (
                  <>
                    <Tex expr={`${prod} = ${m} \\times ${(prod - r) / m} + ${r}`} />, donc <Tex expr={`${sel[0]} \\times ${sel[1]} \\equiv ${r} \\pmod{${m}}`} />. La case affiche la classe de {r}.
                  </>
                ) : (
                  <>À toi de trouver le reste de {prod} divisé par {m}.</>
                )
              }
            />
            {entrainement && !vues.has(cle(sel[0], sel[1])) && (
              <div className="flex flex-wrap items-end gap-2">
                <ChampNombre etiquette="Ta réponse (classe)" valeur={reponse} onChange={setReponse} erreur={null} />
                <Bouton variante="plein" onClick={verifier}>Vérifier</Bouton>
              </div>
            )}
            {retour && <Message type={retour.type}>{retour.texte}</Message>}
          </>
        ) : (
          <p className="text-sm text-fh-ardoise">Choisis une case de la table.</p>
        )}
      </Zone>
      <Conclusion>La table de <Tex expr={`\\mathbb{Z}/${m}\\mathbb{Z}`} /> se lit avec les restes des divisions par {m}. Les produits égaux à 1 donnent les inverses ; les produits nuls de classes non nulles signalent des diviseurs de zéro. Exemple : dans <Tex expr={"\\mathbb{Z}/6\\mathbb{Z}"} />, <Tex expr={"2\\times3 = 6\\equiv0\\pmod{6}"} /> (2 et 3 sont des diviseurs de zéro) et <Tex expr={"5\\times5 = 25\\equiv1\\pmod{6}"} /> (5 est son propre inverse).</Conclusion>
    </div>
  );
}

/** Mode 2 : rechercher un inverse. */
function ModeInverse() {
  const [m, setM] = useState(5);
  const [a, setA] = useState(3);
  const [saisie, setSaisie] = useState("");
  const [retour, setRetour] = useState<{ type: "ok" | "erreur" | "info"; texte: string } | null>(null);
  const [montre, setMontre] = useState(false);
  const [indice, setIndice] = useState(false);
  const inv = inverseModulaire(a, m);
  const d = pgcdEntiers(a, m);

  function reinit() {
    setSaisie("");
    setRetour(null);
    setMontre(false);
    setIndice(false);
  }
  function changerM(x: number) {
    setM(x);
    const na = a >= x ? 1 : a;
    setA(na);
    reinit();
  }
  function verifier() {
    const l = lireEntier(saisie, 3);
    if (!l.ok) return setRetour({ type: "erreur", texte: l.erreur });
    const b = reduire(Number(l.valeur), m);
    const prod = a * b;
    const r = prod % m;
    if (r === 1) setRetour({ type: "ok", texte: `${a} × ${b} = ${prod} = ${m} × ${(prod - r) / m} + 1, donc ${a} × ${b} ≡ 1 (mod ${m}) : la classe de ${b} est l'inverse de la classe de ${a}.` });
    else setRetour({ type: "erreur", texte: `${a} × ${b} = ${prod} = ${m} × ${(prod - r) / m} + ${r}. Le reste est ${r}, pas 1 : ${b} n'est pas l'inverse de ${a} modulo ${m}.` });
  }
  function aucun() {
    if (inv === null) setRetour({ type: "ok", texte: `Exact : PGCD(${a}, ${m}) = ${d} ≠ 1, donc ${a} n'a pas d'inverse modulo ${m}. Aucun produit ${a} × t ne donne un reste égal à 1.` });
    else setRetour({ type: "erreur", texte: `Il existe un inverse : ${a} × ${inv} = ${a * inv} ≡ 1 (mod ${m}). Cherche encore.` });
  }

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <ChoixModule m={m} onChange={changerM} />
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Classe choisie">
          <span className="text-xs font-semibold text-fh-ardoise/80">Classe non nulle :</span>
          {Array.from({ length: m - 1 }, (_, i) => i + 1).map((x) => (
            <Pastille key={x} actif={x === a} onClick={() => { setA(x); reinit(); }}>
              {x}
            </Pastille>
          ))}
        </div>
      </Zone>
      <Zone titre="Simulation">
        <p className="text-sm text-fh-ardoise">
          Cherche une classe <Tex expr="b" /> telle que <Tex expr={`${a} \\times b \\equiv 1 \\pmod{${m}}`} />.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <ChampNombre etiquette={`Ton inverse de ${a} modulo ${m}`} valeur={saisie} onChange={setSaisie} erreur={null} />
          <Bouton variante="plein" onClick={verifier} disabled={saisie.trim() === ""}>Vérifier</Bouton>
          <Bouton onClick={aucun}>Il n&apos;y a pas d&apos;inverse</Bouton>
          <Bouton onClick={() => setIndice(true)}>Indice</Bouton>
          <Bouton onClick={() => setMontre(true)}>Révéler</Bouton>
          <Bouton onClick={() => reinit()}>Recommencer</Bouton>
        </div>
        {retour && <Message type={retour.type}>{retour.texte}</Message>}
        {indice && <Message type="info">Indice : calcule {a} × 1, {a} × 2, {a} × 3, … et cherche le premier produit dont le reste dans la division par {m} vaut 1.</Message>}
      </Zone>
      <Zone titre="Explications" ton="explication">
        {montre ? (
          <>
            <ul className="grid gap-1 text-sm text-fh-ardoise sm:grid-cols-2">
              {Array.from({ length: m - 1 }, (_, i) => i + 1).map((t) => (
                <li key={t}>
                  <Tex expr={`${a} \\times ${t} = ${a * t} \\equiv ${(a * t) % m}`} /> {(a * t) % m === 1 ? "← inverse" : ""}
                </li>
              ))}
            </ul>
            <p className="text-sm text-fh-ardoise">
              {inv !== null ? <>L&apos;inverse de la classe de {a} est la classe de {inv}.</> : <>Aucun produit ne vaut 1 : PGCD({a}, {m}) = {d} ≠ 1, la classe de {a} n&apos;est pas inversible.</>}
            </p>
          </>
        ) : (
          <p className="text-sm text-fh-ardoise">Une classe a est inversible modulo {m} si PGCD(a, {m}) = 1. Teste, ou demande la révélation de tous les produits.</p>
        )}
      </Zone>
      <Defi>
        <p className="text-sm text-fh-ardoise">Parmi les classes de Z/{m}Z, lesquelles ont un inverse ? Teste plusieurs classes et compare avec PGCD(a, {m}).</p>
      </Defi>
      <Conclusion>L&apos;inverse de a modulo n existe exactement quand <Tex expr={"\\mathrm{PGCD}(a,n)=1"} /> ; on le lit alors dans la table, comme le produit congru à 1. Exemple : <Tex expr={"\\mathrm{PGCD}(5,6)=1"} /> et <Tex expr={"5\\times5\\equiv1\\pmod{6}"} />, donc 5 est inversible ; <Tex expr={"\\mathrm{PGCD}(2,6)=2"} />, donc 2 n&apos;a pas d&apos;inverse.</Conclusion>
    </div>
  );
}

/** Mode 3 : comparer deux modules. */
function ModeComparer() {
  const [m1, setM1] = useState(5);
  const [m2, setM2] = useState(6);
  const fiche = (m: number) => {
    const an = analyserModulo(m);
    const dz = diviseursDeZero(m);
    const exemple = (() => {
      for (let a = 2; a < m; a++) for (let b = a; b < m; b++) if ((a * b) % m === 0) return [a, b];
      return null;
    })();
    return (
      <div key={m} className={`flex min-w-0 flex-col gap-2 rounded-xl border-2 p-3 ${an.corps ? "border-emerald-500 bg-emerald-50" : "border-orange-400 bg-orange-50"}`}>
        <h5 className="text-base font-bold text-fh-bleu"><Tex expr={`\\mathbb{Z}/${m}\\mathbb{Z}`} /></h5>
        <p className="text-sm text-fh-ardoise">Classes inversibles : {an.inversibles.map((x) => `${x.a} (inverse ${x.inverse})`).join(", ") || "aucune"}.</p>
        <p className="text-sm text-fh-ardoise">Classes non nulles non inversibles : {Array.from({ length: m - 1 }, (_, i) => i + 1).filter((a) => !estInversible(a, m)).join(", ") || "aucune"}.</p>
        {dz.length > 0 && exemple ? (
          <>
            <p className="text-sm text-fh-ardoise">Diviseurs de zéro : {dz.join(", ")}.</p>
            <p className="text-sm font-semibold text-orange-900">
              <Tex expr={`${exemple[0]} \\times ${exemple[1]} \\equiv 0 \\pmod{${m}}`} /> bien que les classes de {exemple[0]} et de {exemple[1]} soient non nulles. Les classes {dz.join(", ")} sont des diviseurs de zéro : Z/{m}Z n&apos;est pas un corps.
            </p>
          </>
        ) : (
          <p className="text-sm font-semibold text-emerald-900">Toutes les classes non nulles sont inversibles : Z/{m}Z est un corps (m premier).</p>
        )}
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <ChoixModule m={m1} onChange={setM1} etiquette="Premier module" />
        <ChoixModule m={m2} onChange={setM2} etiquette="Deuxième module" />
      </Zone>
      <Zone titre="Simulation">
        <div className="grid min-w-0 gap-3 md:grid-cols-2">{[m1, m2].map(fiche)}</div>
        <p className="text-xs text-fh-ardoise/70">Résultat admis dans le cours : Z/pZ est un corps lorsque p est premier. Ces exemples l&apos;illustrent, ils ne le démontrent pas.</p>
      </Zone>
      <Conclusion>Modulo un nombre premier, toute classe non nulle est inversible. Modulo un nombre composé, certaines classes non nulles sont inversibles (celles premières avec le module), d&apos;autres sont des diviseurs de zéro.</Conclusion>
    </div>
  );
}

/** Mode 4 : résoudre une équation a x ≡ c (mod n). */
function ModeEquation() {
  const [m, setM] = useState(7);
  const [sa, setSa] = useState("3");
  const [sc, setSc] = useState("5");
  const [etape, setEtape] = useState(0);
  const la = lireEntier(sa, 4);
  const lc = lireEntier(sc, 4);
  const a = la.ok ? Number(la.valeur) : 0;
  const c = lc.ok ? Number(lc.valeur) : 0;
  const r = la.ok && lc.ok ? resoudreCongruence(a, c, m) : null;
  const total = r ? (r.cas === "aucune" ? 2 : 4) : 0;
  const e = borner(etape, total);
  const ar = reduire(a, m);
  const cr = reduire(c, m);

  function maj(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setEtape(0);
    };
  }
  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <ChoixModule m={m} onChange={(x) => { setM(x); setEtape(0); }} />
        <div className="flex flex-wrap gap-3">
          <ChampNombre etiquette="Coefficient a" valeur={sa} onChange={maj(setSa)} erreur={la.ok ? null : la.erreur} />
          <ChampNombre etiquette="Second membre c" valeur={sc} onChange={maj(setSc)} erreur={lc.ok ? null : lc.erreur} />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
          <Pastille onClick={() => { setM(7); setSa("3"); setSc("5"); setEtape(0); }}>3x ≡ 5 (mod 7)</Pastille>
          <Pastille onClick={() => { setM(6); setSa("4"); setSc("2"); setEtape(0); }}>4x ≡ 2 (mod 6)</Pastille>
          <Pastille onClick={() => { setM(6); setSa("2"); setSc("3"); setEtape(0); }}>2x ≡ 3 (mod 6)</Pastille>
          <Pastille onClick={() => { setM(8); setSa("5"); setSc("3"); setEtape(0); }}>5x ≡ 3 (mod 8)</Pastille>
        </div>
        {r && <Tex bloc className="text-lg" expr={`${a}x \\equiv ${c} \\pmod{${m}}`} />}
        <Commandes etape={e} total={total} onPrecedent={() => setEtape(e - 1)} onSuivant={() => setEtape(e + 1)} onTout={() => setEtape(total)} onRecommencer={() => setEtape(0)} />
      </Zone>

      {r && (
        <>
          <Zone titre="Simulation">
            {e === 0 && <p className="text-sm text-fh-ardoise">Clique sur « Étape suivante » : on vérifie d&apos;abord si le coefficient est inversible.</p>}
            {e >= 1 && <Tex bloc expr={`a \\equiv ${ar},\\quad c \\equiv ${cr} \\pmod{${m}}`} />}
            {e >= 2 && <Tex bloc expr={`d = \\mathrm{PGCD}(${ar === 0 ? `0, ${m}` : `${ar}, ${m}`}) = ${r.d},\\quad ${r.d} ${cr % r.d === 0 ? "\\mid" : "\\nmid"} ${cr}`} />}
            {e >= 3 && r.cas === "unique" && (
              <>
                <Tex bloc expr={`${ar} \\times ${r.inverse} = ${ar * r.inverse} \\equiv 1 \\pmod{${m}}`} />
                <p className="text-sm text-fh-ardoise">L&apos;inverse de la classe de {ar} est la classe de {r.inverse}.</p>
              </>
            )}
            {e >= 3 && r.cas === "plusieurs" && (
              <Tex bloc expr={`\\text{on divise par } ${r.d} : ${ar / r.d}x \\equiv ${cr / r.d} \\pmod{${r.m2}}`} />
            )}
            {e >= 4 && r.cas === "unique" && <Tex bloc expr={`x \\equiv ${r.inverse} \\times ${cr} = ${r.inverse * cr} \\equiv ${r.x} \\pmod{${m}}`} />}
            {e >= 4 && r.cas === "plusieurs" && (
              <>
                {r.m2 > 1 && <Tex bloc expr={`x \\equiv ${r.inverse} \\times ${cr / r.d} \\equiv ${r.x0} \\pmod{${r.m2}}`} />}
                <Tex bloc expr={`x \\equiv ${r.solutions.join(", ")} \\pmod{${m}}`} />
              </>
            )}
          </Zone>
          <Zone titre="Explications" ton="explication">
            <TroisQuestions
              quoi={<>On cherche les classes x de Z/{m}Z vérifiant <Tex expr={`${ar}x \\equiv ${cr}`} />.</>}
              pourquoi={<>On ne divise jamais par une classe sans avoir vérifié qu&apos;elle est inversible : cela se lit avec d = PGCD(a, {m}). Si d = 1, on multiplie par l&apos;inverse. Si d ≠ 1, il faut que d divise c.</>}
              obtenu={
                r.cas === "aucune" ? (
                  <>{r.d} ne divise pas {cr} : l&apos;équation n&apos;a <strong>aucune solution</strong>.</>
                ) : r.cas === "unique" ? (
                  <>Une seule classe solution : <Tex expr={`x \\equiv ${r.x} \\pmod{${m}}`} />.</>
                ) : (
                  <>{r.d} classes solutions modulo {m} : {r.solutions.join(", ")}.</>
                )
              }
            />
          </Zone>
          {e === total && (
            <Zone titre="Résultat" ton="resultat">
              {r.cas === "aucune" ? (
                <p className="text-base font-semibold text-red-800">Aucune solution.</p>
              ) : (
                <>
                  <Tex bloc className="text-lg" expr={r.cas === "unique" ? `x \\equiv ${r.x} \\pmod{${m}}` : `x \\in \\{${r.solutions.map(cl).join(", ")}\\} \\text{ dans } \\mathbb{Z}/${m}\\mathbb{Z}`} />
                  <p className="text-sm text-fh-ardoise">
                    Vérification : {(r.cas === "unique" ? [r.x] : r.solutions).map((x) => `${par(a)} × ${x} = ${a * x} ≡ ${reduire(a * x, m)}`).join(" ; ")} et c ≡ {cr}.
                  </p>
                </>
              )}
            </Zone>
          )}
        </>
      )}
      <Conclusion>
        <div className="flex flex-col gap-2">
          <p>L&apos;équation</p>
          <Tex bloc className="whitespace-nowrap" expr={"ax\\equiv c\\pmod{n}"} />
          <p>
            a 0 solution si <Tex className="whitespace-nowrap" expr={"\\mathrm{PGCD}(a,n)"} /> ne divise pas c, sinon <Tex className="whitespace-nowrap" expr={"\\mathrm{PGCD}(a,n)"} /> classes solutions modulo n (une seule quand a est inversible).
          </p>
          <p className="font-semibold">Exemples modulo 6 :</p>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>
              <Tex className="whitespace-nowrap" expr={"2x\\equiv1\\pmod{6}"} /> : aucune solution (2 ne divise pas 1).
            </li>
            <li>
              <Tex className="whitespace-nowrap" expr={"2x\\equiv4\\pmod{6}"} /> : 2 classes solutions, <Tex className="whitespace-nowrap" expr={"x\\equiv2"} /> et <Tex className="whitespace-nowrap" expr={"x\\equiv5\\pmod{6}"} />.
            </li>
            <li>
              <Tex className="whitespace-nowrap" expr={"5x\\equiv1\\pmod{6}"} /> : une seule solution, <Tex className="whitespace-nowrap" expr={"x\\equiv5\\pmod{6}"} />.
            </li>
          </ul>
        </div>
      </Conclusion>
    </div>
  );
}

const MODES = [
  { id: "table", libelle: "Table" },
  { id: "inverse", libelle: "Inverses" },
  { id: "comparer", libelle: "Comparer" },
  { id: "equation", libelle: "Équation" },
];

export default function SimModulo() {
  const [mode, setMode] = useState("table");
  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-teal-500 bg-teal-50">
        Dans Z/nZ, on calcule avec les restes des divisions par n. Tu vas construire une table de multiplication, chercher des inverses, comparer un module premier à un module composé, puis résoudre des équations.
      </Intro>
      <Onglets onglets={MODES} actif={mode} onChoisir={setMode} prefixe="mod" etiquette="Modes du laboratoire modulo" grille="grid-cols-2 md:grid-cols-4" />
      <div role="tabpanel" id={`mod-panneau-${mode}`} aria-labelledby={`mod-onglet-${mode}`} className="min-w-0">
        {mode === "table" && <ModeTable />}
        {mode === "inverse" && <ModeInverse />}
        {mode === "comparer" && <ModeComparer />}
        {mode === "equation" && <ModeEquation />}
      </div>
    </div>
  );
}
