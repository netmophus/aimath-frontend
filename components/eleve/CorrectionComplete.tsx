"use client";

import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconHelpCircle } from "@tabler/icons-react";

import RenduMath from "@/components/maths/RenduMath";
import EtudeFonction from "@/components/maths/EtudeFonction";
import SimulationExercice from "@/components/simulations/SimulationExercice";
import type {
  ConcordanceCorrection,
  ControleCorrection,
  CorrectionComplete as Correction,
  QuestionCorrection,
  StatutConcordance,
  StatutControle,
  StatutQuestion,
  StatutVerification,
} from "@/lib/eleveApi";

const BANDEAU: Record<StatutVerification, { classes: string; titre: string }> = {
  contradiction: { classes: "bg-red-50 text-red-800 ring-red-300", titre: "Contradiction détectée" },
  calculs_verifies: { classes: "bg-green-50 text-green-900 ring-green-300", titre: "Calculs contrôlés" },
  partiellement_verifiee: { classes: "bg-amber-50 text-amber-900 ring-amber-300", titre: "Vérification partielle" },
  non_verifiee: { classes: "bg-fh-sable/50 text-fh-bleu ring-fh-sable", titre: "Correction non vérifiée" },
};

const PASTILLE_QUESTION: Record<StatutQuestion, { classes: string; texte: string }> = {
  verifiee: { classes: "bg-green-100 text-green-800", texte: "Calculs contrôlés" },
  partiellement_verifiee: { classes: "bg-amber-100 text-amber-900", texte: "Partiellement contrôlée" },
  non_verifiee: { classes: "bg-fh-sable text-fh-bleu", texte: "Non contrôlée" },
  contradiction: { classes: "bg-red-100 text-red-800", texte: "Contradiction" },
};

function IconeControle({ statut }: { statut: StatutControle }) {
  if (statut === "verifie") return <IconCircleCheck size={18} className="shrink-0 text-green-700" aria-hidden="true" />;
  if (statut === "contradiction") return <IconCircleX size={18} className="shrink-0 text-red-700" aria-hidden="true" />;
  return <IconHelpCircle size={18} className="shrink-0 text-fh-ardoise" aria-hidden="true" />;
}

const LIBELLE_CONTROLE: Record<StatutControle, string> = {
  verifie: "Vérifié",
  contradiction: "Contradiction",
  non_verifie: "Non vérifié",
};

const LIBELLE_METHODE: Record<string, string> = {
  ok: "confirme",
  contradiction: "contredit",
  indisponible: "n'a pas pu contrôler",
};

function Controle({ controle }: { controle: ControleCorrection }) {
  const fond =
    controle.statut === "contradiction" ? "bg-red-50 ring-red-200" : controle.statut === "verifie" ? "bg-green-50/60 ring-green-200" : "bg-fh-creme ring-fh-sable";
  return (
    <li className={`rounded-xl px-3 py-2 text-sm ring-1 ${fond}`}>
      <div className="flex items-start gap-2">
        <IconeControle statut={controle.statut} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-fh-bleu">
            {LIBELLE_CONTROLE[controle.statut]} <span className="font-normal text-fh-ardoise">·</span>{" "}
            <RenduMath contenu={controle.description || controle.type} className="rendu-markdown inline rendu-en-ligne" />
          </div>
          <ul className="mt-1 flex flex-col gap-0.5 text-xs text-fh-ardoise">
            {controle.methodes.map((methode) => (
              <li key={methode.nom}>
                <strong className="text-fh-bleu">{methode.nom}</strong> {LIBELLE_METHODE[methode.statut] ?? methode.statut}
                {methode.detail ? ` — ${methode.detail}` : ""}
              </li>
            ))}
          </ul>
          {controle.desaccord_methodes && (
            <p className="mt-1 text-xs font-semibold text-red-700">Les deux méthodes ne sont pas d&apos;accord : ne te fie à aucune sans vérifier.</p>
          )}
        </div>
      </div>
    </li>
  );
}

type CleCalcul = "verifie" | "partiel" | "contradiction" | "non_verifie";

function cleCalcul(controles: ControleCorrection[]): CleCalcul {
  if (controles.some((c) => c.statut === "contradiction")) return "contradiction";
  if (controles.length > 0 && controles.every((c) => c.statut === "verifie")) return "verifie";
  if (controles.some((c) => c.statut === "verifie")) return "partiel";
  return "non_verifie";
}

/** Libellés EXACTS et distincts : « calcul » (les opérations recalculées) et « concordance » (la réponse rédigée
 * comparée au résultat calculé). Une simulation GeoGebra n'intervient jamais dans ces statuts. */
const LIGNE_CALCUL: Record<CleCalcul, { titre: string; aide: string; icone: "ok" | "erreur" | "inconnu"; classes: string }> = {
  verifie: {
    titre: "Calcul vérifié",
    aide: "Les opérations déclarées ont été recalculées par le moteur mathématique (SymPy / Wolfram Alpha).",
    icone: "ok",
    classes: "bg-green-50 ring-green-200",
  },
  partiel: {
    titre: "Calcul partiellement vérifié",
    aide: "Une partie seulement des opérations a pu être recalculée.",
    icone: "inconnu",
    classes: "bg-amber-50 ring-amber-200",
  },
  contradiction: {
    titre: "Contradiction détectée",
    aide: "Le moteur mathématique contredit un calcul de la correction.",
    icone: "erreur",
    classes: "bg-red-50 ring-red-200",
  },
  non_verifie: {
    titre: "Calcul non vérifié",
    aide: "Aucune opération de cette question n'a pu être recalculée automatiquement.",
    icone: "inconnu",
    classes: "bg-fh-sable/50 ring-fh-sable",
  },
};

const LIGNE_CONCORDANCE: Record<StatutConcordance, { titre: string; icone: "ok" | "erreur" | "inconnu"; classes: string }> = {
  verifiee: { titre: "Concordance vérifiée", icone: "ok", classes: "bg-green-50 ring-green-200" },
  non_verifiee: { titre: "Concordance non vérifiée", icone: "inconnu", classes: "bg-amber-50 ring-amber-200" },
  contradiction: { titre: "Contradiction détectée", icone: "erreur", classes: "bg-red-50 ring-red-200" },
};

function IconeLigne({ type }: { type: "ok" | "erreur" | "inconnu" }) {
  if (type === "ok") return <IconCircleCheck size={20} className="mt-0.5 shrink-0 text-green-700" aria-hidden="true" />;
  if (type === "erreur") return <IconCircleX size={20} className="mt-0.5 shrink-0 text-red-700" aria-hidden="true" />;
  return <IconHelpCircle size={20} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />;
}

function Concordance({ concordance }: { concordance: ConcordanceCorrection }) {
  const ligne = LIGNE_CONCORDANCE[concordance.statut];
  return (
    <li
      data-testid="concordance"
      data-statut={concordance.statut}
      role={concordance.statut === "contradiction" ? "alert" : undefined}
      className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ring-1 ${ligne.classes}`}
    >
      <IconeLigne type={ligne.icone} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-fh-bleu">{ligne.titre}</p>
        <p className="mt-0.5 text-xs text-fh-ardoise">
          <span className="font-semibold text-fh-bleu">{concordance.grandeur}</span> — {concordance.detail}
        </p>
        {(concordance.annonce || concordance.attendu) && (
          <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs text-fh-ardoise">
            <dt>Réponse rédigée</dt>
            <dd className="font-semibold text-fh-bleu">{concordance.annonce ?? "non interprétable"}</dd>
            <dt>Résultat calculé</dt>
            <dd className="font-semibold text-fh-bleu">{concordance.attendu ?? "non calculé"}</dd>
          </dl>
        )}
      </div>
    </li>
  );
}

/** « Vérification de la réponse » : seulement pour les questions dont la réponse peut être comparée au résultat
 * calculé. Deux lignes séparées : le calcul d'une part, la concordance de la réponse rédigée d'autre part. */
function VerificationsReponse({ question, concordance }: { question: QuestionCorrection; concordance: ConcordanceCorrection }) {
  const calcul = LIGNE_CALCUL[cleCalcul(question.controles)];
  return (
    <div className="mt-3" aria-label="Vérification de la réponse">
      <h4 className="text-xs font-bold uppercase tracking-wide text-fh-ardoise">Vérification de la réponse</h4>
      <ul className="mt-1 flex flex-col gap-2">
        <li data-testid="calcul" className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ring-1 ${calcul.classes}`}>
          <IconeLigne type={calcul.icone} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-fh-bleu">{calcul.titre}</p>
            <p className="mt-0.5 text-xs text-fh-ardoise">{calcul.aide}</p>
          </div>
        </li>
        <Concordance concordance={concordance} />
      </ul>
      <p className="mt-1 text-xs text-fh-ardoise/80">
        « Calcul » : les opérations recalculées. « Concordance » : la réponse rédigée comparée au résultat calculé à partir de
        l&apos;énoncé. Une simulation ne change aucun de ces statuts.
      </p>
    </div>
  );
}

/**
 * Correction complète affichée sous l'énoncé confirmé. Chaque question montre
 * ses étapes puis ses « contrôles automatiques » : ce qui a été recalculé
 * (SymPy, Wolfram Alpha), ce qui est contredit et ce qui n'a pas pu l'être.
 * Jamais de « démonstration vérifiée » : seuls des calculs le sont.
 */
export default function CorrectionComplete({ correction }: { correction: Correction }) {
  const bandeau = BANDEAU[correction.statut];
  const r = correction.resume_verification;

  return (
    <section aria-label="Correction complète" className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-fh-bleu">Correction complète</h2>

      <div role={correction.statut === "contradiction" ? "alert" : "status"} className={`rounded-2xl p-4 ring-1 ${bandeau.classes}`}>
        <p className="flex items-center gap-2 text-sm font-bold">
          <IconAlertTriangle size={20} aria-hidden="true" />
          {bandeau.titre}
        </p>
        <p className="mt-1 text-sm">{correction.libelle_statut}</p>
        <p className="mt-1 text-xs">
          {r.verifies} calcul{r.verifies > 1 ? "s" : ""} confirmé{r.verifies > 1 ? "s" : ""} · {r.contradictions} contradiction
          {r.contradictions > 1 ? "s" : ""} · {r.non_verifies} non vérifié{r.non_verifies > 1 ? "s" : ""} (sur {r.controles})
        </p>
      </div>

      {correction.donnees.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable">
          <h3 className="text-sm font-bold text-fh-bleu">Données</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-fh-ardoise">
            {correction.donnees.map((donnee, index) => (
              <li key={index}>
                <span className="font-semibold text-fh-bleu">{donnee.libelle}</span>
                {donnee.valeur && (
                  <>
                    {" : "}
                    <RenduMath contenu={donnee.valeur} className="rendu-markdown inline rendu-en-ligne" />
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {correction.formules.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable">
          <h3 className="text-sm font-bold text-fh-bleu">Formules utilisées</h3>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-fh-bleu">
            {correction.formules.map((formule, index) => (
              <li key={index}>
                <RenduMath contenu={formule} bloc className="rendu-markdown" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {correction.questions.map((question, index) => {
        const pastille = PASTILLE_QUESTION[question.statut];
        return (
          <article key={`${question.numero}-${index}`} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable sm:p-5">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-fh-bleu">Question {question.numero || index + 1}</h3>
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${pastille.classes}`}>{pastille.texte}</span>
            </header>
            {question.enonce && <RenduMath contenu={question.enonce} className="rendu-markdown mt-1 text-sm text-fh-ardoise" />}

            <ol className="mt-3 flex flex-col gap-3">
              {question.etapes.map((etape, i) => (
                <li key={i} className="rounded-xl bg-fh-creme px-3 py-2">
                  <div className="text-sm font-semibold text-fh-bleu">
                    Étape {i + 1} — <RenduMath contenu={etape.titre} className="rendu-markdown inline rendu-en-ligne" />
                  </div>
                  {etape.explication && <RenduMath contenu={etape.explication} className="rendu-markdown mt-1 text-sm text-fh-ardoise" />}
                  {etape.calcul && <RenduMath contenu={etape.calcul} bloc className="rendu-markdown rendu-calcul mt-1 overflow-x-auto text-fh-bleu" />}
                </li>
              ))}
            </ol>

            {question.resultat && (
              <div className="mt-3 rounded-xl bg-fh-accent/60 px-3 py-2 ring-1 ring-fh-orange/20">
                <p className="text-xs font-bold uppercase tracking-wide text-fh-orange-fonce">Résultat</p>
                <RenduMath contenu={question.resultat} bloc className="rendu-markdown rendu-calcul text-fh-bleu" />
              </div>
            )}

            {question.concordance && <VerificationsReponse question={question} concordance={question.concordance} />}

            {question.etude_fonction && (
              <div className="mt-3">
                <EtudeFonction etude={question.etude_fonction} />
              </div>
            )}

            {(question.simulations ?? []).map((simulation, i) => (
              <div key={`${simulation.modele}-${i}`} className="mt-3">
                <SimulationExercice simulation={simulation} />
              </div>
            ))}

            {question.incertitudes.length > 0 && (
              <ul className="mt-3 list-disc rounded-xl bg-amber-50 py-2 pl-7 pr-3 text-sm text-amber-900 ring-1 ring-amber-300">
                {question.incertitudes.map((texte, i) => (
                  <li key={i}>
                    <RenduMath contenu={texte} className="rendu-markdown inline rendu-en-ligne" />
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-fh-ardoise">Contrôles automatiques</h4>
              {question.controles.length > 0 ? (
                <ul className="mt-1 flex flex-col gap-2">
                  {question.controles.map((controle) => (
                    <Controle key={controle.id} controle={controle} />
                  ))}
                </ul>
              ) : (
                <p className="mt-1 rounded-xl bg-fh-sable/50 px-3 py-2 text-sm text-fh-bleu">
                  Aucun calcul de cette question n&apos;a pu être contrôlé automatiquement.
                </p>
              )}
            </div>
          </article>
        );
      })}

      {correction.conclusion && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable">
          <h3 className="text-sm font-bold text-fh-bleu">Conclusion</h3>
          <RenduMath contenu={correction.conclusion} className="rendu-markdown mt-1 text-sm text-fh-ardoise" />
        </div>
      )}

      {correction.avertissements.length > 0 && (
        <ul className="list-disc rounded-2xl bg-amber-50 py-3 pl-8 pr-4 text-sm text-amber-900 ring-1 ring-amber-300">
          {correction.avertissements.map((texte, i) => (
            <li key={i}>
                    <RenduMath contenu={texte} className="rendu-markdown inline rendu-en-ligne" />
                  </li>
          ))}
        </ul>
      )}
    </section>
  );
}
