"use client";

import { useMemo, useState } from "react";

import { MAX_CRIBLE, cribleEratosthene, elimines, lireNaturel, racineEntiere } from "@/lib/premiers";
import { Bouton, ChampNombre, Commandes, Conclusion, Defi, Intro, Message, Pastille, Tex, TroisQuestions, Zone, borner } from "./ui";

const LIMITES = [30, 50, 100, 200];

export default function SimCrible() {
  const [saisie, setSaisie] = useState("50");
  const [etape, setEtape] = useState(0);
  const [choix, setChoix] = useState<number[]>([]);
  const [verifie, setVerifie] = useState(false);
  const [revele, setRevele] = useState(false);

  const lecture = lireNaturel(saisie, 2, MAX_CRIBLE);
  const limite = lecture.ok ? lecture.valeur : 50;
  const crible = useMemo(() => cribleEratosthene(limite), [limite]);
  const total = crible.etapes.length;
  const e = borner(etape, total);
  const fini = e === total;
  const courante = e > 0 ? crible.etapes[e - 1] : null;
  const barres = useMemo(() => elimines(crible, e), [crible, e]);
  const nouveauxCourants = new Set(courante?.nouveaux ?? []);
  const premiersChoisis = crible.etapes.slice(0, e).map((s) => s.p);
  const premiersSet = new Set(crible.premiers);

  function changerLimite(v: string) {
    setSaisie(v);
    reinit();
  }
  function reinit() {
    setEtape(0);
    setChoix([]);
    setVerifie(false);
    setRevele(false);
  }
  function basculer(k: number) {
    if (!fini || revele || k < 2 || barres.has(k)) return;
    setVerifie(false);
    setChoix((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));
  }

  const manquants = crible.premiers.filter((p) => !choix.includes(p));
  const intrus = choix.filter((k) => !premiersSet.has(k));
  const toutJuste = manquants.length === 0 && intrus.length === 0;

  function etat(k: number): { classe: string; libelle: string } {
    if (k === 1) return { classe: "border-slate-300 bg-slate-100 text-slate-500", libelle: "n'est pas premier" };
    if (courante && k === courante.p) return { classe: "border-fh-bleu-vif bg-fh-bleu-vif text-white shadow-md", libelle: "premier en cours" };
    if (nouveauxCourants.has(k)) return { classe: "border-red-400 bg-red-100 text-red-800 line-through", libelle: "éliminé à cette étape" };
    if (barres.has(k)) return { classe: "border-slate-200 bg-slate-100 text-slate-400 line-through", libelle: "éliminé" };
    if (fini && revele) return { classe: "border-emerald-500 bg-emerald-100 text-emerald-900 font-bold", libelle: "premier" };
    if (fini && verifie && choix.includes(k)) return premiersSet.has(k) ? { classe: "border-emerald-500 bg-emerald-100 text-emerald-900 font-bold", libelle: "choisi, juste" } : { classe: "border-red-500 bg-red-50 text-red-800", libelle: "choisi, faux" };
    if (fini && choix.includes(k)) return { classe: "border-fh-bleu-vif bg-fh-accent text-fh-bleu font-bold", libelle: "choisi" };
    if (premiersChoisis.includes(k)) return { classe: "border-emerald-400 bg-emerald-50 text-emerald-900 font-bold", libelle: "premier conservé" };
    return { classe: "border-fh-sable bg-white text-fh-bleu", libelle: "à examiner" };
  }

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-sky-500 bg-sky-50">
        Comment trouver <strong>tous</strong> les nombres premiers jusqu&apos;à une limite, sans en oublier et sans se tromper : on garde un nombre premier, on barre tous ses multiples, puis on recommence avec le premier nombre non barré.
      </Intro>

      <Zone titre="Paramètres">
        <div className="flex flex-wrap items-end gap-3">
          <ChampNombre etiquette={`Limite (de 2 à ${MAX_CRIBLE})`} valeur={saisie} onChange={changerLimite} erreur={lecture.ok ? null : lecture.erreur} />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Limites proposées">
            {LIMITES.map((l) => (
              <Pastille key={l} actif={lecture.ok && lecture.valeur === l} onClick={() => changerLimite(String(l))}>
                {l}
              </Pastille>
            ))}
          </div>
        </div>
        {lecture.ok && <Commandes etape={e} total={total} onPrecedent={() => { setEtape(e - 1); setChoix([]); setVerifie(false); }} onSuivant={() => setEtape(e + 1)} onTout={() => setEtape(total)} onRecommencer={reinit} />}
      </Zone>

      {lecture.ok && (
        <>
          <Zone titre="Simulation">
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5" role="group" aria-label={`Grille des nombres de 1 à ${limite}`}>
              {Array.from({ length: limite }, (_, i) => i + 1).map((k) => {
                const s = etat(k);
                const cliquable = fini && !revele && k >= 2 && !barres.has(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => basculer(k)}
                    disabled={!cliquable}
                    aria-label={`${k} : ${s.libelle}`}
                    aria-pressed={cliquable ? choix.includes(k) : undefined}
                    className={`flex aspect-square min-h-8 items-center justify-center rounded-md border text-[11px] transition-colors duration-500 disabled:cursor-default sm:text-sm ${s.classe} ${cliquable ? "cursor-pointer hover:ring-2 hover:ring-fh-bleu-vif/40" : ""}`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fh-ardoise" aria-label="Légende">
              <li><span className="mr-1 inline-block h-3 w-3 rounded border border-fh-bleu-vif bg-fh-bleu-vif align-middle" />premier en cours</li>
              <li><span className="mr-1 inline-block h-3 w-3 rounded border border-red-400 bg-red-100 align-middle" />éliminés à cette étape</li>
              <li><span className="mr-1 inline-block h-3 w-3 rounded border border-slate-200 bg-slate-100 align-middle" />déjà éliminés</li>
              <li><span className="mr-1 inline-block h-3 w-3 rounded border border-emerald-400 bg-emerald-50 align-middle" />premiers conservés</li>
            </ul>
          </Zone>

          <Zone titre="Explications" ton="explication">
            {e === 0 ? (
              <TroisQuestions
                quoi={<>On part de tous les entiers de 1 à {limite}. <strong>1 n&apos;est pas premier</strong> : il n&apos;a qu&apos;un seul diviseur positif, alors qu&apos;un nombre premier en a exactement deux.</>}
                pourquoi={<>Un nombre composé a un diviseur premier p avec p² ≤ n. Il suffit donc d&apos;utiliser les nombres premiers p tels que p² ≤ {limite}, c&apos;est-à-dire p ≤ {racineEntiere(limite)}.</>}
                obtenu={<>Il y aura {total} étape{total > 1 ? "s" : ""} : {crible.etapes.map((s) => s.p).join(", ")}. Clique sur « Étape suivante ».</>}
              />
            ) : (
              courante && (
                <TroisQuestions
                  quoi={
                    <>
                      {courante.p === 2 ? "2 est premier. Conservons-le" : `${courante.p} est le prochain nombre non éliminé. Il est premier. Conservons-le`} et éliminons ses multiples strictement supérieurs à {courante.p}.
                    </>
                  }
                  pourquoi={<>Un multiple de {courante.p} autre que {courante.p} lui-même a au moins trois diviseurs (1, {courante.p} et lui-même) : il n&apos;est pas premier.</>}
                  obtenu={
                    <>
                      Multiples examinés : {courante.examines.join(", ")}.{" "}
                      {courante.nouveaux.length > 0 ? <>Nouvelles éliminations ({courante.nouveaux.length}) : {courante.nouveaux.join(", ")}. </> : <>Aucune nouvelle élimination. </>}
                      {courante.dejaElimines.length > 0 && <>Déjà éliminés avant (non recomptés) : {courante.dejaElimines.join(", ")}.</>}
                    </>
                  }
                />
              )
            )}
            <p className="text-sm text-fh-ardoise" aria-live="polite">
              Premiers sélectionnés comme étapes : <strong>{premiersChoisis.length > 0 ? premiersChoisis.join(", ") : "aucun pour l'instant"}</strong>.
              {" "}Éliminés : {barres.size}. Restent à examiner ou conservés (hors 1) : {limite - 1 - barres.size}.
            </p>
            {fini && total > 0 && (
              <p className="text-sm text-fh-ardoise">
                Le nombre premier suivant {crible.etapes[total - 1].p} a un carré supérieur à {limite} : on s&apos;arrête. Les nombres non éliminés sont tous premiers, <strong>même ceux qui n&apos;ont pas été sélectionnés comme étapes</strong>.
              </p>
            )}
          </Zone>

          {fini && (
            <Defi titre="Défi : lesquels sont premiers ?">
              <p className="text-sm text-fh-ardoise">Parmi les nombres restants, lesquels sont premiers ? Clique sur les nombres de la grille que tu penses premiers, puis vérifie.</p>
              <p className="text-sm text-fh-ardoise" aria-live="polite">Nombres choisis : {choix.length > 0 ? [...choix].sort((a, b) => a - b).join(", ") : "aucun"}.</p>
              <div className="flex flex-wrap gap-2">
                <Bouton variante="plein" onClick={() => setVerifie(true)} disabled={choix.length === 0 || revele}>Vérifier mon choix</Bouton>
                <Bouton onClick={() => { setRevele(true); setVerifie(false); }} disabled={revele}>Révéler la correction</Bouton>
                <Bouton onClick={() => { setChoix([]); setVerifie(false); setRevele(false); }} disabled={choix.length === 0 && !revele}>Effacer mes choix</Bouton>
              </div>
              {verifie && !revele && (
                toutJuste ? (
                  <Message type="ok">Bravo : tu as trouvé les {crible.premiers.length} nombres premiers, sans intrus.</Message>
                ) : (
                  <Message type="erreur">
                    {intrus.length > 0 && <>Ces nombres ne sont pas premiers (ils sont multiples d&apos;un nombre premier plus petit) : {intrus.join(", ")}. </>}
                    {manquants.length > 0 && <>Il t&apos;en manque {manquants.length}. Rappel : un nombre non éliminé est premier.</>}
                  </Message>
                )
              )}
              {revele && <Message type="ok">Correction : les {crible.premiers.length} nombres premiers sont en vert dans la grille.</Message>}
            </Defi>
          )}

          {fini && (
            <Zone titre="Résultat" ton="resultat">
              {(verifie && toutJuste) || revele ? (
                <p className="text-sm text-fh-ardoise">
                  Nombres premiers jusqu&apos;à {limite} ({crible.premiers.length}) : <strong>{crible.premiers.join(", ")}</strong>.
                </p>
              ) : (
                <p className="text-sm text-fh-ardoise">La liste complète apparaîtra quand tu auras trouvé les nombres premiers ou demandé la correction.</p>
              )}
            </Zone>
          )}

          <Conclusion>
            Le crible fournit <strong>exactement</strong> la liste des nombres premiers. Il s&apos;arrête dès que <Tex expr={"p^2"} /> dépasse la limite, car tout nombre composé <Tex expr={`\\leq ${limite}`} /> possède un diviseur premier p avec <Tex expr={`p^2\\leq ${limite}`} />. Le nombre 1 n&apos;est jamais premier et 2 est toujours conservé. Exemple : pour la limite 30, on barre les multiples de 2, 3 et 5, puis on s&apos;arrête car <Tex className="whitespace-nowrap" expr={"7^2 = 49 > 30"} />.
          </Conclusion>
        </>
      )}
    </div>
  );
}
