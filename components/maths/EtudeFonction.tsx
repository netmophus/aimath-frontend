"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { IconAlertTriangle, IconShieldCheck } from "@tabler/icons-react";

import RenduMarkdown from "@/components/RenduMarkdown";
import TableauVariations from "@/components/TableauVariations";
import { versCourbeData, versVariationsData, type EtudeFonction as Etude, type EtudeVerifiee } from "@/lib/etudeFonction";

// function-plot touche le DOM : chargement dynamique, côté client uniquement (comme CourbeFonctionBloc).
const CourbeFonction = dynamic(() => import("@/components/CourbeFonction"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] w-full items-center justify-center rounded-lg border border-fh-sable bg-fh-creme text-sm text-fh-ardoise/60">
      Chargement du graphique…
    </div>
  ),
});

function Tex({ children }: { children: string }) {
  return <RenduMarkdown contenu={`$${children}$`} className="rendu-markdown inline rendu-en-ligne" />;
}

function Resume({ etude }: { etude: EtudeVerifiee }) {
  return (
    <ul className="flex flex-col gap-1 text-sm text-fh-ardoise">
      <li>
        Dérivée : <Tex>{`f'(x) = ${etude.derivee.latex}`}</Tex>
      </li>
      {etude.points_critiques.length > 0 && (
        <li>
          f&apos;(x) = 0 pour{" "}
          {etude.points_critiques.map((p, i) => (
            <span key={i}>
              {i > 0 && " et "}
              <Tex>{`x = ${p.x_latex}`}</Tex>
            </span>
          ))}
          .
        </li>
      )}
      {etude.intervalles.map((i, index) => (
        <li key={index}>
          f est <strong className="text-fh-bleu">{i.sens}</strong> sur <Tex>{i.intervalle_latex}</Tex>
        </li>
      ))}
      {etude.extrema.map((e, index) => (
        <li key={`e${index}`}>
          <strong className="text-fh-bleu">{e.nature === "maximum local" ? "Maximum local" : "Minimum local"}</strong> :{" "}
          <Tex>{`f(${e.x_latex}) = ${e.y_latex}`}</Tex>
        </li>
      ))}
      {etude.sans_extremum.map((e, index) => (
        <li key={`s${index}`}>
          <Tex>{`f'(${e.x_latex}) = 0`}</Tex> mais f&apos; ne change pas de signe : ce n&apos;est pas un extremum.
        </li>
      ))}
      {etude.courbe.zeros.length > 0 && (
        <li>
          Zéros exacts de f :{" "}
          {etude.courbe.zeros.map((z, i) => (
            <span key={i}>
              {i > 0 && " ; "}
              <Tex>{`x = ${z.x_latex}`}</Tex>
            </span>
          ))}
          . Ordonnée à l&apos;origine : <Tex>{`f(0) = ${etude.courbe.ordonnee_origine_latex}`}</Tex>.
        </li>
      )}
      {!etude.constante && (
        <li>
          Limites : <Tex>{`\\lim_{x \\to -\\infty} f(x) = ${etude.limites.moins_infini}`}</Tex>,{" "}
          <Tex>{`\\lim_{x \\to +\\infty} f(x) = ${etude.limites.plus_infini}`}</Tex>
        </li>
      )}
    </ul>
  );
}

interface EtudeFonctionProps {
  etude: Etude;
  /** Par défaut, ce que la question traite (`etude.demande`) ; « tout » force le tableau ET la courbe. */
  afficher?: "demande" | "tout";
}

/**
 * Courbe et tableau de variations d'une fonction polynomiale, issus d'un calcul VÉRIFIÉ par le serveur.
 * Si la fonction n'est pas prise en charge, aucune figure n'est tracée : seule une explication s'affiche.
 */
export default function EtudeFonction({ etude, afficher = "demande" }: EtudeFonctionProps) {
  const verifiee = etude.statut === "verifie" ? etude : null;
  const courbe = useMemo(() => (verifiee ? versCourbeData(verifiee) : null), [verifiee]);
  const tableau = useMemo(() => (verifiee ? versVariationsData(verifiee) : null), [verifiee]);

  if (etude.statut !== "verifie" || !verifiee) {
    return (
      <section aria-label="Étude de la fonction" className="rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-900 ring-1 ring-amber-300">
        <p className="flex items-center gap-2 font-semibold">
          <IconAlertTriangle size={18} aria-hidden="true" /> Tableau et courbe non construits automatiquement
        </p>
        <p className="mt-1">{etude.statut === "non_pris_en_charge" ? etude.raison : ""}</p>
        <p className="mt-1 text-xs">Pour ne pas t&apos;induire en erreur, aucun graphique approximatif n&apos;est affiché.</p>
      </section>
    );
  }

  const demande = etude.demande ?? [];
  const veutTableau = afficher === "tout" || demande.length === 0 || demande.includes("variations");
  const veutCourbe = afficher === "tout" || demande.length === 0 || demande.includes("extrema");

  return (
    <section aria-label="Étude de la fonction" className="flex flex-col gap-3 rounded-xl bg-fh-creme px-3 py-3 ring-1 ring-fh-sable">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-fh-bleu">
          Étude de <Tex>{`f(x) = ${verifiee.fonction.latex}`}</Tex>
        </h4>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
          <IconShieldCheck size={14} aria-hidden="true" /> Calculé et contrôlé (SymPy)
        </span>
      </header>

      {verifiee.contredit_par_la_correction && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          Ce tableau est calculé par le moteur de vérification et diffère de la correction rédigée pour cette question : relis les deux avec attention.
        </p>
      )}

      {veutTableau && (
        <div>
          <h5 className="mb-1 text-xs font-bold uppercase tracking-wide text-fh-ardoise">Tableau de variations</h5>
          {tableau ? <TableauVariations data={tableau} /> : <p className="text-sm text-fh-ardoise">Tableau indisponible pour cette fonction.</p>}
        </div>
      )}

      {veutCourbe && (
        <div>
          <h5 className="mb-1 text-xs font-bold uppercase tracking-wide text-fh-ardoise">Courbe représentative</h5>
          {courbe ? <CourbeFonction data={courbe} /> : <p className="text-sm text-fh-ardoise">Courbe indisponible pour cette fonction.</p>}
        </div>
      )}

      <Resume etude={verifiee} />
    </section>
  );
}
