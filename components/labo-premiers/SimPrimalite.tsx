"use client";

import { useMemo, useState } from "react";

import { candidatsPremiers, lireNaturel, racineEntiere, testerDiviseur } from "@/lib/premiers";
import { Bouton, ChampNombre, Conclusion, Defi, Intro, Message, Pastille, Tex, TroisQuestions, Zone } from "./ui";

const MAX_PRIMALITE = 100000;
const EXEMPLES = [37, 91, 97, 143, 197, 221];

type Prediction = "premier" | "compose" | null;

export default function SimPrimalite() {
  const [saisie, setSaisie] = useState("97");
  const [testes, setTestes] = useState<number[]>([]);
  const [selection, setSelection] = useState<number | null>(null);
  const [valide, setValide] = useState(false);
  const [indice, setIndice] = useState(false);
  const [prediction, setPrediction] = useState<Prediction>(null);

  const lecture = lireNaturel(saisie, 2, MAX_PRIMALITE);
  const n = lecture.ok ? lecture.valeur : 97;
  const candidats = useMemo(() => candidatsPremiers(n), [n]);
  const racine = racineEntiere(n);

  const resultats = testes.map((p) => testerDiviseur(n, p));
  const trouve = resultats.find((r) => r.divise) ?? null;
  const tousTestes = candidats.every((p) => testes.includes(p));
  const termine = trouve !== null || (tousTestes && (candidats.length > 0 || valide));
  const dernier = resultats.length > 0 ? resultats[resultats.length - 1] : null;
  const premier = termine && trouve === null;

  function reinit(garderNombre = true) {
    setTestes([]);
    setSelection(null);
    setValide(false);
    setIndice(false);
    if (!garderNombre) setPrediction(null);
  }
  function changer(v: string) {
    setSaisie(v);
    reinit(false);
  }
  function tester() {
    if (termine) return;
    const cible = selection !== null && !testes.includes(selection) ? selection : candidats.find((p) => !testes.includes(p));
    if (cible === undefined) {
      setValide(true);
      return;
    }
    setTestes((t) => [...t, cible]);
    setSelection(null);
  }
  function reveler() {
    // Teste tous les candidats jusqu'au premier diviseur (inclus), pas au-delà.
    const t: number[] = [];
    for (const p of candidats) {
      t.push(p);
      if (n % p === 0) break;
    }
    setTestes(t);
    setValide(true);
    setSelection(null);
  }
  function nouveau() {
    const autres = EXEMPLES.filter((x) => String(x) !== saisie);
    changer(String(autres[Math.floor(Math.random() * autres.length)]));
  }

  const indiceTexte = (() => {
    if (n % 2 === 0) return `Regarde le dernier chiffre de ${n} : il est pair. Quel nombre premier est alors un diviseur évident ?`;
    if ([...String(n)].reduce((s, c) => s + Number(c), 0) % 3 === 0) return `La somme des chiffres de ${n} est un multiple de 3 : essaie 3.`;
    if (n % 10 === 5) return `${n} finit par 5 : essaie 5.`;
    return `Aucun critère simple ne s'applique : teste les candidats dans l'ordre croissant. Si l'un divise ${n}, tu peux t'arrêter.`;
  })();

  function etatCandidat(p: number): { classe: string; libelle: string } {
    const r = resultats.find((x) => x.p === p);
    if (!r) return { classe: selection === p ? "border-fh-bleu-vif bg-fh-accent text-fh-bleu" : "border-fh-sable bg-white text-fh-bleu", libelle: "À tester" };
    return r.divise
      ? { classe: "border-red-500 bg-red-100 text-red-900", libelle: "Divise" }
      : { classe: "border-emerald-500 bg-emerald-100 text-emerald-900", libelle: "Ne divise pas" };
  }

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-violet-500 bg-violet-50">
        Pour savoir si un nombre est premier, il n&apos;est pas nécessaire de le diviser par tous les nombres plus petits : il suffit de tester les <strong>nombres premiers p tels que p² ≤ n</strong>.
      </Intro>

      <Zone titre="Paramètres">
        <div className="flex flex-wrap items-end gap-3">
          <ChampNombre etiquette={`Nombre étudié (2 à ${MAX_PRIMALITE.toLocaleString("fr-FR")})`} valeur={saisie} onChange={changer} erreur={lecture.ok ? null : lecture.erreur} />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Valeurs suggérées">
            {EXEMPLES.map((x) => (
              <Pastille key={x} actif={lecture.ok && lecture.valeur === x} onClick={() => changer(String(x))}>
                {x}
              </Pastille>
            ))}
            <Pastille onClick={() => changer("49")}>49</Pastille>
          </div>
        </div>
      </Zone>

      {lecture.ok && (
        <>
          <Zone titre="Simulation">
            <p className="text-sm text-fh-ardoise">
              Nombre étudié : <strong>{n}</strong>. Racine carrée approximative : <Tex expr={`\\sqrt{${n}} \\approx ${Math.sqrt(n).toFixed(2).replace(".", "{,}")}`} />. Exactement, {racine}² = {racine * racine} ≤ {n} &lt; {(racine + 1) ** 2} = {racine + 1}².
            </p>
            <p className="text-sm text-fh-ardoise">
              {candidats.length > 0 ? (
                <>Il suffit de tester les nombres premiers de 2 à {racine} : <strong>{candidats.join(", ")}</strong>.</>
              ) : (
                <>Aucun nombre premier p ne vérifie p² ≤ {n}.</>
              )}
            </p>

            <Defi titre="Avant de tester : ta prédiction">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Prédiction">
                <Pastille actif={prediction === "premier"} onClick={() => setPrediction("premier")}>Je pense qu&apos;il est premier</Pastille>
                <Pastille actif={prediction === "compose"} onClick={() => setPrediction("compose")}>Je pense qu&apos;il est composé</Pastille>
              </div>
              {termine && prediction && (
                <Message type={(prediction === "premier") === premier ? "ok" : "erreur"}>
                  {(prediction === "premier") === premier ? "Ta prédiction était juste." : `Ta prédiction était fausse : ${n} est ${premier ? "premier" : "composé"}.`}
                </Message>
              )}
            </Defi>

            <div>
              <p className="mb-1 text-xs font-semibold text-fh-ardoise/80">Candidats : clique sur un nombre premier, puis « Tester »</p>
              <ol className="flex flex-wrap items-center gap-1.5" aria-label="Progression des candidats">
                {candidats.map((p, i) => {
                  const s = etatCandidat(p);
                  return (
                    <li key={p} className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelection(p)}
                        disabled={termine || testes.includes(p)}
                        aria-label={`${p} : ${s.libelle}`}
                        aria-pressed={selection === p}
                        className={`flex min-h-11 min-w-11 flex-col items-center justify-center rounded-lg border-2 px-2 text-sm font-bold transition-colors disabled:cursor-default ${s.classe}`}
                      >
                        {p}
                        <span className="text-[10px] font-medium leading-none">{s.libelle}</span>
                      </button>
                      {i < candidats.length - 1 && <span aria-hidden="true" className="text-fh-ardoise/60">→</span>}
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="flex flex-wrap gap-2">
              <Bouton variante="plein" onClick={tester} disabled={termine}>Tester</Bouton>
              <Bouton onClick={() => setIndice(true)} disabled={termine}>Indice</Bouton>
              <Bouton onClick={reveler} disabled={termine}>Révéler</Bouton>
              <Bouton onClick={nouveau}>Nouveau nombre</Bouton>
              <Bouton onClick={() => reinit()} disabled={testes.length === 0 && !valide}>Recommencer</Bouton>
            </div>
            {indice && !termine && <Message type="info">Indice : {indiceTexte}</Message>}
          </Zone>

          <Zone titre="Explications" ton="explication">
            {dernier ? (
              <TroisQuestions
                quoi={<>On divise {n} par {dernier.p} (division euclidienne exacte) : <Tex expr={`${n} = ${dernier.p} \\times ${dernier.quotient} + ${dernier.reste}`} />.</>}
                pourquoi={<>{dernier.p} est un candidat : s&apos;il divisait {n}, {n} ne serait pas premier.</>}
                obtenu={
                  dernier.divise ? (
                    <>Le reste est 0. Donc {n} est composé : <Tex expr={`${n} = ${dernier.p} \\times ${dernier.quotient}`} />.</>
                  ) : (
                    <>Le reste est {dernier.reste}. Donc {dernier.p} ne divise pas {n}.</>
                  )
                }
              />
            ) : (
              <p className="text-sm text-fh-ardoise">Choisis un candidat et clique sur « Tester » : la division exacte apparaîtra ici, sans annoncer le verdict avant la fin.</p>
            )}
            {testes.length > 1 && (
              <ul className="list-disc pl-5 text-sm text-fh-ardoise">
                {resultats.map((r) => (
                  <li key={r.p}>
                    <Tex expr={`${n} = ${r.p} \\times ${r.quotient} + ${r.reste}`} /> : {r.divise ? "reste 0, divise" : `reste ${r.reste}, ne divise pas`}
                  </li>
                ))}
              </ul>
            )}
            {termine && (
              <Message type={premier ? "ok" : "erreur"}>
                {premier
                  ? candidats.length === 0
                    ? `Aucun diviseur premier possible n'a été trouvé (il n'y a même aucun candidat). Le nombre ${n} est premier.`
                    : "Aucun diviseur premier possible n'a été trouvé. Le nombre est premier."
                  : `Le reste est 0. Donc ${n} est composé.`}
              </Message>
            )}
            <details className="rounded-lg border border-fh-sable bg-white px-3 py-2 text-sm text-fh-ardoise">
              <summary className="cursor-pointer font-semibold text-fh-bleu">Pourquoi s&apos;arrêter à √n ?</summary>
              <p className="mt-2">Si n est composé, il possède un diviseur premier p avec p² ≤ n. Donc inutile de tester les nombres premiers plus grands que √n.</p>
            </details>
            <details className="rounded-lg border border-fh-sable bg-white px-3 py-2 text-sm text-fh-ardoise">
              <summary className="cursor-pointer font-semibold text-fh-bleu">Voir la justification</summary>
              <p className="mt-2">
                Écrivons n = ab avec 2 ≤ a ≤ b. Alors a² ≤ ab = n, donc a ≤ √n. Or a ≥ 2 possède un diviseur premier q, et q ≤ a ≤ √n. Ce q divise a, donc il divise n : on aurait trouvé un diviseur premier inférieur ou égal à √n.
              </p>
            </details>
          </Zone>

          <Conclusion>
            Un entier n ≥ 2 est premier si et seulement si aucun nombre premier p avec p² ≤ n ne le divise. Les carrés de nombres premiers (49 = 7², 121 = 11², 169 = 13²) sont composés : le candidat p = √n doit bien être testé.
          </Conclusion>
        </>
      )}
    </div>
  );
}
