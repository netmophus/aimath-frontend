"use client";

import { useState } from "react";

import {
  MAX_NOMBRE_CARRE,
  arbreTermine,
  creerArbre,
  decomposerNoeud,
  estPremier,
  facteursDeFeuilles,
  lireNaturel,
  memesFacteurs,
  pasGuide,
  trouverNoeud,
  type Noeud,
} from "@/lib/premiers";
import { Bouton, ChampNombre, Conclusion, Defi, Intro, Message, Pastille, Tex, Zone, texFacteurs } from "./ui";

const EXEMPLES = [60, 84, 180, 360, 2520];

interface Chemin {
  arbre: Noeud;
  historique: Noeud[];
  selection: string | null;
  fa: string;
  fb: string;
  message: { type: "erreur" | "ok" | "info"; texte: string } | null;
}

function nouveauChemin(n: number): Chemin {
  return { arbre: creerArbre(n), historique: [], selection: null, fa: "", fb: "", message: null };
}

/** Signature de la forme d'un arbre (pour savoir si deux chemins sont réellement différents). */
function signature(n: Noeud): string {
  if (!n.enfants) return String(n.valeur);
  const [a, b] = n.enfants.map(signature).sort();
  return `${n.valeur}(${a},${b})`;
}

function Boite({ n, selection, onChoisir }: { n: Noeud; selection: string | null; onChoisir: (id: string) => void }) {
  const premier = estPremier(n.valeur);
  const feuille = !n.enfants;
  let classe = "border-fh-sable bg-white text-fh-bleu";
  let libelle = "décomposé";
  if (feuille && premier) {
    classe = "border-emerald-600 bg-emerald-100 text-emerald-900";
    libelle = "premier";
  } else if (feuille) {
    classe = "border-orange-500 bg-orange-100 text-orange-900 hover:ring-2 hover:ring-orange-300";
    libelle = "composé, à décomposer";
  }
  if (selection === n.id) {
    classe = "border-fh-bleu-vif bg-fh-bleu-vif text-white ring-2 ring-fh-bleu-vif/40";
    libelle = "sélectionné";
  }
  const cliquable = feuille && !premier;
  return (
    <button
      type="button"
      disabled={!cliquable}
      onClick={() => onChoisir(n.id)}
      aria-label={`${n.valeur} : ${libelle}`}
      aria-pressed={cliquable ? selection === n.id : undefined}
      className={`min-h-11 min-w-11 rounded-full border-2 px-3 text-base font-bold transition-colors disabled:cursor-default ${classe}`}
    >
      {n.valeur}
    </button>
  );
}

function Branche({ n, selection, onChoisir }: { n: Noeud; selection: string | null; onChoisir: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center">
      <Boite n={n} selection={selection} onChoisir={onChoisir} />
      {n.enfants && (
        <>
          <div className="h-3 w-px bg-slate-400" aria-hidden="true" />
          <div className="flex items-start">
            {n.enfants.map((c, i) => (
              <div key={c.id} className="relative flex flex-col items-center px-1 pt-3 sm:px-2">
                {/* Connecteurs : demi-barre horizontale vers l'autre enfant, puis tige verticale jusqu'au nœud. */}
                {i > 0 && <span className="absolute left-0 top-0 w-1/2 border-t-2 border-slate-400" aria-hidden="true" />}
                {i < n.enfants!.length - 1 && <span className="absolute right-0 top-0 w-1/2 border-t-2 border-slate-400" aria-hidden="true" />}
                <span className="absolute left-1/2 top-0 h-3 w-px bg-slate-400" aria-hidden="true" />
                <Branche n={c} selection={selection} onChoisir={onChoisir} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PanneauChemin({ numero, n, ch, maj }: { numero: number; n: number; ch: Chemin; maj: (f: (c: Chemin) => Chemin) => void }) {
  const termine = arbreTermine(ch.arbre);
  const noeud = ch.selection ? trouverNoeud(ch.arbre, ch.selection) : null;
  const a = lireNaturel(ch.fa, 0, 1e9);
  const b = lireNaturel(ch.fb, 0, 1e9);
  const produit = a.ok && b.ok ? a.valeur * b.valeur : null;
  const f = termine ? facteursDeFeuilles(ch.arbre) : null;

  function decomposer() {
    if (!noeud) return maj((c) => ({ ...c, message: { type: "erreur", texte: "Sélectionne d'abord un nombre orange de l'arbre." } }));
    if (!a.ok || !b.ok) return maj((c) => ({ ...c, message: { type: "erreur", texte: "Saisis deux entiers positifs." } }));
    const r = decomposerNoeud(ch.arbre, noeud.id, a.valeur, b.valeur);
    if (!r.ok) return maj((c) => ({ ...c, message: { type: "erreur", texte: r.erreur } }));
    maj((c) => ({
      ...c,
      arbre: r.arbre,
      historique: [...c.historique, c.arbre],
      selection: null,
      fa: "",
      fb: "",
      message: { type: "ok", texte: `${noeud.valeur} = ${a.valeur} × ${b.valeur} : produit vérifié.` },
    }));
  }
  function guide() {
    const pas = pasGuide(ch.arbre);
    if (!pas) return;
    const r = decomposerNoeud(ch.arbre, pas.id, pas.a, pas.b);
    if (!r.ok) return;
    const v = pas.a * pas.b;
    maj((c) => ({
      ...c,
      arbre: r.arbre,
      historique: [...c.historique, c.arbre],
      selection: null,
      message: { type: "info", texte: `Pas guidé : ${v} = ${pas.a} × ${pas.b}, avec ${pas.a} le plus petit facteur premier de ${v}.` },
    }));
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-fh-sable bg-white p-3">
      <h5 className="text-sm font-bold text-fh-bleu">Chemin {numero}</h5>
      <div className="max-w-full overflow-x-auto pb-2" role="group" aria-label={`Arbre du chemin ${numero}`}>
        <div className="mx-auto flex w-max min-w-full justify-center">
          <Branche n={ch.arbre} selection={ch.selection} onChoisir={(id) => maj((c) => ({ ...c, selection: id, message: null }))} />
        </div>
      </div>
      {!termine && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-fh-ardoise">
            {noeud ? <>Nombre sélectionné : <strong>{noeud.valeur}</strong>. Choisis deux facteurs dont le produit est {noeud.valeur}.</> : "Clique sur un nombre orange pour le décomposer."}
          </p>
          <div className="flex flex-wrap items-start gap-2">
            <ChampNombre etiquette="Premier facteur" valeur={ch.fa} onChange={(v) => maj((c) => ({ ...c, fa: v, message: null }))} erreur={ch.fa === "" || a.ok ? null : a.erreur} />
            <ChampNombre etiquette="Deuxième facteur" valeur={ch.fb} onChange={(v) => maj((c) => ({ ...c, fb: v, message: null }))} erreur={ch.fb === "" || b.ok ? null : b.erreur} />
          </div>
          {produit !== null && noeud && (
            <p className="text-sm text-fh-ardoise" aria-live="polite">
              Produit : <Tex expr={`${a.ok ? a.valeur : ""} \\times ${b.ok ? b.valeur : ""} = ${produit}`} /> {produit === noeud.valeur ? "(égal à " + noeud.valeur + ")" : "(différent de " + noeud.valeur + ")"}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Bouton variante="plein" onClick={decomposer} disabled={!noeud}>Décomposer</Bouton>
            <Bouton onClick={guide}>Pas guidé</Bouton>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Bouton onClick={() => maj((c) => ({ ...c, arbre: c.historique[c.historique.length - 1], historique: c.historique.slice(0, -1), selection: null, message: null }))} disabled={ch.historique.length === 0}>Étape précédente</Bouton>
        <Bouton onClick={() => maj(() => nouveauChemin(n))} disabled={ch.historique.length === 0}>Recommencer</Bouton>
      </div>
      {ch.message && <Message type={ch.message.type === "ok" ? "ok" : ch.message.type === "erreur" ? "erreur" : "info"}>{ch.message.texte}</Message>}
      {termine && f && (
        <Message type="ok">
          Toutes les feuilles sont premières : <Tex expr={`${n} = ${texFacteurs(f)}`} />
        </Message>
      )}
    </div>
  );
}

export default function SimFacteurs() {
  const [saisie, setSaisie] = useState("180");
  const lecture = lireNaturel(saisie, 2, MAX_NOMBRE_CARRE);
  const n = lecture.ok ? lecture.valeur : 180;
  const [chemins, setChemins] = useState<[Chemin, Chemin]>([nouveauChemin(180), nouveauChemin(180)]);

  function choisir(v: string) {
    setSaisie(v);
    const l = lireNaturel(v, 2, MAX_NOMBRE_CARRE);
    if (l.ok) setChemins([nouveauChemin(l.valeur), nouveauChemin(l.valeur)]);
  }
  function maj(i: 0 | 1) {
    return (f: (c: Chemin) => Chemin) => setChemins((cs) => (i === 0 ? [f(cs[0]), cs[1]] : [cs[0], f(cs[1])]));
  }

  const t0 = arbreTermine(chemins[0].arbre);
  const t1 = arbreTermine(chemins[1].arbre);
  const deux = t0 && t1;
  const identiques = deux && memesFacteurs(facteursDeFeuilles(chemins[0].arbre), facteursDeFeuilles(chemins[1].arbre));
  const differents = deux && signature(chemins[0].arbre) !== signature(chemins[1].arbre);

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-emerald-500 bg-emerald-50">
        Tout entier supérieur ou égal à 2 se décompose en produit de nombres premiers, et cette décomposition est <strong>unique</strong> à l&apos;ordre des facteurs près. Tu vas le constater en décomposant le même nombre de deux façons.
      </Intro>

      <Zone titre="Paramètres">
        <div className="flex flex-wrap items-end gap-3">
          <ChampNombre etiquette={`Nombre à décomposer (2 à ${MAX_NOMBRE_CARRE.toLocaleString("fr-FR")})`} valeur={saisie} onChange={choisir} erreur={lecture.ok ? null : lecture.erreur} />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
            {EXEMPLES.map((x) => (
              <Pastille key={x} actif={lecture.ok && lecture.valeur === x} onClick={() => choisir(String(x))}>
                {x.toLocaleString("fr-FR")}
              </Pastille>
            ))}
          </div>
        </div>
        <p className="text-xs text-fh-ardoise/70">
          Orange : facteur composé. Vert : facteur premier. Bleu : nombre sélectionné. Rouge : opération invalide, avec explication.
        </p>
      </Zone>

      {lecture.ok && (
        <>
          <Zone titre="Simulation">
            <div className="grid min-w-0 gap-3 md:grid-cols-2">
              <PanneauChemin numero={1} n={n} ch={chemins[0]} maj={maj(0)} />
              <PanneauChemin numero={2} n={n} ch={chemins[1]} maj={maj(1)} />
            </div>
          </Zone>

          <Zone titre="Explications" ton="explication">
            {!deux ? (
              <p className="text-sm text-fh-ardoise">
                Décompose {n.toLocaleString("fr-FR")} dans chaque chemin jusqu&apos;à ce que toutes les feuilles soient des nombres premiers. Un facteur ne peut pas être 1 : multiplier par 1 ne change rien. Essaie de choisir des premiers facteurs différents dans les deux chemins{n === 180 ? " (par exemple 18 × 10, puis 12 × 15)" : ""}.
              </p>
            ) : identiques && differents ? (
              <p className="text-sm font-semibold text-emerald-800">
                Les chemins sont différents, mais les facteurs premiers sont les mêmes. C&apos;est l&apos;unicité de la décomposition.
              </p>
            ) : identiques ? (
              <p className="text-sm text-fh-ardoise">
                Tu as fait exactement les mêmes choix dans les deux chemins. Recommence l&apos;un d&apos;eux avec un autre premier découpage pour observer l&apos;unicité.
              </p>
            ) : (
              <p className="text-sm text-red-800">Les décompositions diffèrent : vérifie les produits, une erreur s&apos;est glissée.</p>
            )}
          </Zone>

          <Defi>
            <p className="text-sm text-fh-ardoise">
              Décompose <strong>180</strong> par deux chemins différents, par exemple 180 = 18 × 10 puis 180 = 12 × 15. Que remarques-tu sur les feuilles ?
            </p>
          </Defi>

          {deux && identiques && (
            <Zone titre="Résultat" ton="resultat">
              <Tex bloc className="text-lg" expr={`${n} = ${texFacteurs(facteursDeFeuilles(chemins[0].arbre))}`} />
            </Zone>
          )}

          <Conclusion>
            Quelle que soit la façon de découper, on obtient les mêmes facteurs premiers avec les mêmes exposants. Une feuille 1 n&apos;est jamais acceptée, et un facteur composé n&apos;est jamais traité comme premier.
          </Conclusion>
        </>
      )}
    </div>
  );
}
