"use client";

import { useState } from "react";

import { MAX_NOMBRE_CARRE, facteursPremiers, fusionnerExposants, lireNaturel, multiplicateurMinimal, produitFacteurs, racinePuissance } from "@/lib/premiers";
import { Bouton, ChampNombre, Conclusion, Defi, Intro, Message, Pastille, Stepper, Tex, Zone, texFacteurs, texNombre } from "./ui";

const EXEMPLES = [60, 72, 180, 360, 2520];
const MAX_AJOUT = 6;

export default function SimCarre() {
  const [saisie, setSaisie] = useState("2520");
  const [m, setM] = useState<2 | 3>(2);
  const [ajouts, setAjouts] = useState<Record<number, number>>({});
  const [valide, setValide] = useState(false);
  const [indice, setIndice] = useState(false);

  const lecture = lireNaturel(saisie, 1, MAX_NOMBRE_CARRE);
  const n = lecture.ok ? lecture.valeur : 2520;
  const f = facteursPremiers(n);
  const nom = m === 2 ? "carré parfait" : "cube parfait";
  const puissance = m === 2 ? "carré" : "cube";

  const fk = f.filter(({ p }) => (ajouts[p] ?? 0) > 0).map(({ p }) => ({ p, e: ajouts[p] }));
  const k = produitFacteurs(fk);
  const fnk = fusionnerExposants(f, ajouts);
  const nk = produitFacteurs(fnk);
  const racine = racinePuissance(fnk, m);
  const estPuissance = racine !== null;
  const min = multiplicateurMinimal(n, m);
  const impairs = min.ajouts.length;
  const estMinimal = k === min.k;

  function reinit() {
    setAjouts({});
    setValide(false);
    setIndice(false);
  }
  function changer(v: string) {
    setSaisie(v);
    reinit();
  }
  function regler(p: number, v: number) {
    setAjouts((a) => ({ ...a, [p]: v }));
    setValide(false);
  }

  const exposantsMin = min.ajouts.map((x) => x.p);
  const preuve = (
    <>
      Tout multiplicateur convenable doit rendre {m === 2 ? "pairs" : "multiples de 3"} les exposants de n qui ne le sont pas.
      {impairs > 0 ? (
        <>
          {" "}Il doit donc être divisible par <Tex expr={`${min.ajouts.map(({ p, ajout }) => (ajout === 1 ? `${p}` : `${p}^{${ajout}}`)).join(" \\times ")} = ${texNombre(min.k)}`} />. Puisque {texteNombre(min.k)} convient, c&apos;est le plus petit.
        </>
      ) : (
        <> Ici tous les exposants conviennent déjà : le plus petit multiplicateur est 1.</>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-orange-500 bg-orange-50">
        <span className="mb-1 inline-block rounded-full bg-orange-200 px-2 py-0.5 text-xs font-bold text-orange-900">Complément</span>{" "}
        <span className="block text-xs italic text-fh-ardoise/80">Cette simulation illustre l&apos;intérêt des exposants dans la décomposition en facteurs premiers. Ce n&apos;est pas une notion exigée du programme de Terminale C.</span>
        Un entier strictement positif est un carré parfait si et seulement si <strong>tous les exposants</strong> de sa décomposition en facteurs premiers sont pairs. Tu vas fabriquer un multiplicateur k pour que n × k devienne un carré parfait.
      </Intro>

      <Zone titre="Paramètres">
        <div className="flex flex-wrap items-end gap-3">
          <ChampNombre etiquette={`Entier n (1 à ${MAX_NOMBRE_CARRE.toLocaleString("fr-FR")})`} valeur={saisie} onChange={changer} erreur={lecture.ok ? null : lecture.erreur} />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
            {EXEMPLES.map((x) => (
              <Pastille key={x} actif={lecture.ok && lecture.valeur === x} onClick={() => changer(String(x))}>
                {x.toLocaleString("fr-FR")}
              </Pastille>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Puissance visée">
          <span className="text-xs font-semibold text-fh-ardoise/80">Objectif :</span>
          <Pastille actif={m === 2} onClick={() => { setM(2); reinit(); }}>Carré parfait</Pastille>
          <Pastille actif={m === 3} onClick={() => { setM(3); reinit(); }}>Cube parfait (extension facultative)</Pastille>
        </div>
      </Zone>

      {lecture.ok && (
        <>
          <Zone titre="Simulation">
            <Tex bloc className="text-lg" expr={`${texNombre(n)} = ${texFacteurs(f)}`} />
            <p className="text-sm text-fh-ardoise">
              Pour un {puissance}, chaque exposant doit être un {m === 2 ? "nombre pair" : "multiple de 3"}. Vert : exposant convenable. Orange : exposant à corriger. Bleu : exposant ajouté par toi.
            </p>
            {n === 1 ? (
              <Message type="ok">1 = 1² = 1³ : c&apos;est déjà un {nom} (aucun facteur premier).</Message>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2" aria-label="Facteurs premiers de n">
                {f.map(({ p, e }) => {
                  const ajout = ajouts[p] ?? 0;
                  const total = e + ajout;
                  const bon = total % m === 0;
                  return (
                    <li key={p} className={`flex flex-col gap-2 rounded-xl border-2 p-3 ${bon ? "border-emerald-500 bg-emerald-50" : "border-orange-400 bg-orange-50"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Tex className="text-lg" expr={`${p}^{${e}}`} />
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${bon ? "bg-emerald-200 text-emerald-900" : "bg-orange-200 text-orange-900"}`}>
                          exposant {e} {e % m === 0 ? (m === 2 ? "pair" : "multiple de 3") : m === 2 ? "impair" : "non multiple de 3"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-fh-ardoise/80">Exposant ajouté dans k</span>
                        <Stepper etiquette={`Exposant de ${p} dans k`} valeur={ajout} min={0} max={MAX_AJOUT} onChange={(v) => regler(p, v)} />
                      </div>
                      <p className="text-sm text-fh-ardoise">
                        Exposant dans n × k : <span className={`rounded px-1.5 font-bold ${ajout > 0 ? "bg-fh-bleu-vif text-white" : ""}`}>{total}</span> : {bon ? "convient" : "ne convient pas encore"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <Bouton onClick={reinit} disabled={Object.values(ajouts).every((v) => v === 0) && !valide}>Recommencer</Bouton>
            </div>
          </Zone>

          <Zone titre="Explications" ton="explication">
            <div className="flex flex-col gap-1 text-sm text-fh-ardoise">
              <Tex bloc expr={`k = ${fk.length > 0 ? texFacteurs(fk) : "1"} = ${texNombre(k)}`} />
              <Tex bloc expr={`n \\times k = ${texFacteurs(fnk)} = ${texNombre(nk)}`} />
            </div>
            <p className={`rounded-lg border px-3 py-2 text-sm font-semibold ${estPuissance ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-orange-300 bg-orange-50 text-orange-900"}`} aria-live="polite">
              {estPuissance ? (
                <>
                  {m === 2 ? "Carré parfait" : "Cube parfait"} : <Tex expr={`${texNombre(nk)} = ${texNombre(racine as bigint)}^{${m}}`} />
                </>
              ) : (
                <>Pas encore un {puissance}</>
              )}
            </p>
          </Zone>

          <Defi titre={`Défi : trouve le plus petit k pour obtenir un ${puissance}`}>
            <p className="text-sm text-fh-ardoise">Règle les exposants de k, puis valide. Le plus petit k ne sera démontré qu&apos;après ta validation.</p>
            <div className="flex flex-wrap gap-2">
              <Bouton variante="plein" onClick={() => setValide(true)}>Valider mon k</Bouton>
              <Bouton onClick={() => setIndice(true)}>Indice</Bouton>
              <Bouton onClick={() => { setAjouts(Object.fromEntries(min.ajouts.map((x) => [x.p, x.ajout]))); setValide(true); }}>Révéler</Bouton>
            </div>
            {indice && <Message type="info">Indice : {impairs === 0 ? `tous les exposants de n conviennent déjà pour un ${puissance}.` : `${impairs} exposant${impairs > 1 ? "s" : ""} de n ${impairs > 1 ? "ne conviennent" : "ne convient"} pas pour un ${puissance}. Complète chacun jusqu'au prochain ${m === 2 ? "nombre pair" : "multiple de 3"}.`}</Message>}
            {valide &&
              (estPuissance && estMinimal ? (
                <>
                  <Message type="ok">Bravo : k = {texteNombre(k)} convient et c&apos;est le plus petit.</Message>
                  <p className="text-sm text-fh-ardoise">{preuve}</p>
                </>
              ) : estPuissance ? (
                <Message type="info">
                  k = {texteNombre(k)} convient, mais ce n&apos;est pas le plus petit : il contient des facteurs inutiles. Cherche les exposants qui sont déjà bons dans n.
                </Message>
              ) : (
                <Message type="erreur">
                  n × k n&apos;est pas encore un {puissance}. Les exposants à corriger concernent {exposantsMin.length > 0 ? `${exposantsMin.length} facteur${exposantsMin.length > 1 ? "s" : ""} premier${exposantsMin.length > 1 ? "s" : ""}` : "aucun facteur"} : regarde les cartes orange.
                </Message>
              ))}
          </Defi>

          <Conclusion>
            n × k est un {nom} lorsque tous les exposants de sa décomposition sont {m === 2 ? "pairs" : "multiples de 3"}. Le plus petit k s&apos;obtient en complétant seulement les exposants qui ne conviennent pas. Un nombre déjà {puissance === "carré" ? "carré" : "cube"} a pour plus petit multiplicateur 1.
          </Conclusion>
        </>
      )}
    </div>
  );
}

function texteNombre(n: bigint): string {
  return n.toLocaleString("fr-FR");
}
