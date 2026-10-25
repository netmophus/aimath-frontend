"use client";

import { useState } from "react";
import Link from "next/link";

import Accordeon from "@/components/ui/Accordeon";
import { Tx } from "./commun";
import { EXERCICES_IA } from "./exercicesIAMaths";

type Mode = "correction" | "professeur";

const MODES: { id: Mode; titre: string; texte: string; couleur: string; carteActive: string; pastille: string }[] = [
  {
    id: "correction",
    titre: "Correction complète",
    texte: "La résolution rédigée de l'exercice, étape par étape.",
    couleur: "var(--color-fh-orange)",
    carteActive: "border-fh-orange bg-fh-accent",
    pastille: "border-fh-orange bg-fh-orange",
  },
  {
    id: "professeur",
    titre: "Professeur particulier IA",
    texte: "Un accompagnement pour comprendre et trouver la solution par toi-même.",
    couleur: "var(--color-fh-bleu)",
    carteActive: "border-fh-bleu bg-fh-bleu/10",
    pastille: "border-fh-bleu bg-fh-bleu",
  },
];

/** Section d'accueil « Assistant IA — Mathématiques » : choix du mode et de l'exercice, fenêtre de démonstration, réponse en accordéon. */
export default function SectionIAMaths() {
  const [mode, setMode] = useState<Mode>("correction");
  const [indice, setIndice] = useState(0);
  const [soumis, setSoumis] = useState(false);
  const exercice = EXERCICES_IA[indice];
  const m = MODES.find((x) => x.id === mode) ?? MODES[0];
  const items = (mode === "correction" ? exercice.correction : exercice.guidage).map((it) => ({
    ...it,
    titre: typeof it.titre === "string" ? <Tx>{it.titre}</Tx> : it.titre,
  }));

  return (
    <section aria-labelledby="titre-ia-maths" className="bg-fh-creme px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-fh-orange-fonce">Assistant IA FAHIMTA — Mathématiques</p>
          <h2 id="titre-ia-maths" className="mt-2 text-2xl font-bold text-fh-bleu sm:text-3xl">
            Un exercice de maths te bloque ? L&apos;IA le résout avec toi
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-fh-ardoise sm:text-base">
            Prends ton exercice en photo, importe un PDF ou recopie l&apos;énoncé. Choisis ensuite comment être aidé : une correction complète rédigée, ou un professeur particulier qui te guide pour trouver la solution toi-même. Pensé pour les sujets du programme du Niger, même les plus exigeants.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-stretch">
          {/* Colonne gauche : mode, exercice, appel à l'action */}
          <div className="flex min-w-0 flex-col gap-6">
            <div>
              <p id="ia-mode" className="text-base font-bold text-fh-bleu">Comment veux-tu être aidé ?</p>
              <div role="radiogroup" aria-labelledby="ia-mode" className="mt-3 flex flex-col gap-3">
                {MODES.map((x) => {
                  const actif = x.id === mode;
                  return (
                    <button
                      key={x.id}
                      type="button"
                      role="radio"
                      aria-checked={actif}
                      onClick={() => setMode(x.id)}
                      className={`flex min-h-11 items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors motion-reduce:transition-none sm:p-4 ${actif ? x.carteActive : "border-fh-sable bg-white hover:border-fh-ardoise/40"}`}
                    >
                      <span aria-hidden="true" className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${actif ? x.pastille : "border-fh-sable bg-white"}`}>
                        {actif && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span>
                        <span className="block font-bold text-fh-bleu">{x.titre}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-fh-ardoise">{x.texte}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p id="ia-exos" className="text-base font-bold text-fh-bleu">Essaie un exercice (Terminale C)</p>
              <div role="radiogroup" aria-labelledby="ia-exos" className="mt-3 flex flex-col gap-2">
                {EXERCICES_IA.map((e, i) => {
                  const actif = i === indice;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      role="radio"
                      aria-checked={actif}
                      onClick={() => {
                        setIndice(i);
                        setSoumis(false);
                      }}
                      className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors motion-reduce:transition-none ${actif ? "border-fh-bleu bg-white text-fh-bleu shadow-sm" : "border-fh-sable bg-white/60 text-fh-ardoise hover:bg-white"}`}
                    >
                      <span aria-hidden="true" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${actif ? "bg-fh-bleu text-white" : "bg-fh-sable text-fh-ardoise"}`}>
                        {i + 1}
                      </span>
                      {e.titre}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto flex flex-col items-center gap-1.5">
              <Link
                href="/login"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-fh-orange px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-fh-orange-fonce motion-reduce:transition-none"
              >
                Essayer l&apos;assistant IA
              </Link>
              <p className="text-xs text-fh-ardoise">Connecte-toi pour soumettre ton exercice</p>
            </div>
          </div>

          {/* Colonne droite : fenêtre « Résoudre mon exercice » (démonstration) */}
          <div className="min-w-0 rounded-2xl border border-fh-sable bg-white p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-bold text-fh-bleu">Résoudre mon exercice</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex min-h-11 cursor-default items-center rounded-full border border-fh-bleu/40 px-5 text-sm font-semibold text-fh-bleu">Prendre une photo</span>
              <span className="inline-flex min-h-11 cursor-default items-center rounded-full border border-fh-bleu/40 px-5 text-sm font-semibold text-fh-bleu">Importer images ou PDF</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-fh-ardoise">
              Photographie-le, importe un fichier, ou tape l&apos;énoncé. Images : JPG, PNG ou WebP, 6 maximum. PDF : un seul. 10 Mo maximum par fichier.
            </p>

            <p className="mt-4 text-sm font-semibold text-fh-bleu">Ou saisis l&apos;énoncé</p>
            <div className="mt-1.5 rounded-xl border border-fh-sable bg-fh-creme p-3 leading-8 text-fh-ardoise" aria-label="Énoncé de l'exercice sélectionné">
              <Tx>{exercice.enonce}</Tx>
            </div>
            <p className="mt-1 text-right text-xs text-fh-ardoise">{exercice.enoncePlain.length} caractères</p>

            <button
              type="button"
              onClick={() => setSoumis(true)}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition-colors hover:opacity-90 motion-reduce:transition-none"
              style={{ backgroundColor: m.couleur }}
            >
              Soumettre mon exercice
            </button>

            {soumis && (
              <div className="mt-4">
                <Accordeon key={`${exercice.id}-${mode}`} titre={m.titre} items={items} numerote couleur={m.couleur} />
                <p className="mt-2 text-xs text-fh-ardoise">Aperçu de démonstration : connecte-toi pour soumettre ton propre exercice.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
