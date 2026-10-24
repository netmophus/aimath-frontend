"use client";

import { useRef, useState } from "react";
import { IconAlertTriangle, IconEye } from "@tabler/icons-react";

import CorrectionComplete from "@/components/eleve/CorrectionComplete";
import ProfesseurParticulier from "@/components/eleve/ProfesseurParticulier";
import RenduMath from "@/components/maths/RenduMath";
import {
  demanderCorrection,
  type AnalyseEnonce as Analyse,
  type ConfianceLecture,
  type CorrectionComplete as Correction,
  type MatiereLue,
} from "@/lib/eleveApi";
import { LONGUEUR_MAX_CORRECTION, decrireErreurDepot, type ErreurDepot } from "@/lib/resoudre";

const LIBELLE_MATIERE: Record<MatiereLue, string> = {
  mathematiques: "Mathématiques",
  physique: "Physique",
  chimie: "Chimie",
  svt: "SVT",
  autre: "Autre matière",
  indeterminee: "Matière non identifiée",
};

const LIBELLE_CONFIANCE: Record<ConfianceLecture, string> = {
  haute: "lecture sûre",
  moyenne: "lecture probable",
  faible: "lecture incertaine",
};

interface AnalyseEnonceProps {
  analyse: Analyse;
  matiereProgramme: string;
  /** Programme de l'exercice (pour demander la correction). */
  programmeId: number;
  /** Le serveur propose la correction complète (maths, fonction activée). */
  correctionDisponible: boolean;
  /** Le serveur propose le Professeur particulier IA (maths, fonction activée). */
  professeurDisponible?: boolean;
  /** Mode choisi au dépôt : met le bouton correspondant en avant. */
  modeChoisi?: "correction" | "professeur";
  nbPages: number;
  /** Une nouvelle lecture est en cours (après « Signaler une erreur »). */
  enCours: boolean;
  erreur: ErreurDepot | null;
  onModifier: () => void;
  onDemanderCorrection: (remarque: string) => void;
  onConfirmer: () => void;
  confirmee: boolean;
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable sm:p-5">
      <h3 className="text-sm font-bold text-fh-bleu">{titre}</h3>
      <div className="mt-2 text-sm text-fh-ardoise">{children}</div>
    </section>
  );
}

/**
 * Relecture de l'énoncé reconnu par l'IA, AVANT toute résolution. Rien n'est
 * résolu ni enregistré ici : l'élève vérifie la lecture, peut signaler une
 * erreur (nouvelle lecture avec sa remarque) ou modifier son exercice.
 */
export default function AnalyseEnonce({
  analyse,
  matiereProgramme,
  programmeId,
  correctionDisponible,
  professeurDisponible = false,
  modeChoisi = "correction",
  nbPages,
  enCours,
  erreur,
  onModifier,
  onDemanderCorrection,
  onConfirmer,
  confirmee,
}: AnalyseEnonceProps) {
  const [signalement, setSignalement] = useState(false);
  const [remarque, setRemarque] = useState("");
  // La correction est liée à l'énoncé confirmé : si la lecture change, elle disparaît.
  const [correction, setCorrection] = useState<{ pour: Analyse; contenu: Correction } | null>(null);
  const [correctionEnCours, setCorrectionEnCours] = useState(false);
  const [erreurCorrection, setErreurCorrection] = useState<ErreurDepot | null>(null);
  const [professeurOuvert, setProfesseurOuvert] = useState<Analyse | null>(null);
  const verrouCorrection = useRef(false); // deux clics rapprochés = un seul appel payant

  async function voirCorrection() {
    if (verrouCorrection.current) return;
    verrouCorrection.current = true;
    setCorrectionEnCours(true);
    setErreurCorrection(null);
    try {
      const reponse = await demanderCorrection(programmeId, analyse);
      setCorrection({ pour: analyse, contenu: reponse.correction });
    } catch (error) {
      setErreurCorrection(decrireErreurDepot(error));
    } finally {
      verrouCorrection.current = false;
      setCorrectionEnCours(false);
    }
  }

  const professeurAffiche = professeurOuvert === analyse;
  const correctionAffichee = correction && correction.pour === analyse ? correction.contenu : null;

  const incertitudes = analyse.parties_incertaines;
  const questionsIncertaines = analyse.questions.filter((q) => q.incertain);
  const aDesDoutes = !analyse.lisible || incertitudes.length > 0 || questionsIncertaines.length > 0;
  const matiereDifferente = analyse.concordance_programme === "differente";
  const page = (numero: number | null) => (numero && nbPages > 1 ? ` (page ${numero})` : "");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-2xl bg-fh-accent/60 p-4 ring-1 ring-fh-orange/20">
        <IconEye size={24} className="mt-0.5 shrink-0 text-fh-orange-fonce" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-fh-bleu">Relis ton énoncé</h2>
          <p className="mt-0.5 text-sm text-fh-ardoise">
            Voici ce que nous avons lu. Vérifie-le attentivement : la résolution n&apos;a pas commencé, et une
            erreur de lecture fausserait toute la suite.
          </p>
        </div>
      </div>

      {!analyse.lisible && (
        <div role="alert" className="rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700">
          <p className="font-semibold">Nous n&apos;avons pas réussi à lire cet exercice.</p>
          <p className="mt-1">Reprends une photo plus nette, bien cadrée et éclairée, ou saisis l&apos;énoncé à la main.</p>
        </div>
      )}

      {analyse.lisible && aDesDoutes && (
        <div role="status" className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-900">
          <IconAlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>Certains passages sont difficiles à lire. Ils sont signalés ci-dessous : vérifie-les avant de continuer.</p>
        </div>
      )}

      {matiereDifferente && (
        <div role="status" className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-900">
          <IconAlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            Cet exercice ressemble à un exercice de <strong>{LIBELLE_MATIERE[analyse.matiere.valeur]}</strong>, alors que
            tu es dans {matiereProgramme}. Vérifie que tu es au bon endroit.
          </p>
        </div>
      )}

      <Section titre="Ce que nous avons reconnu">
        <ul className="flex flex-wrap gap-2">
          <li className="rounded-full bg-fh-creme px-3 py-1 text-xs font-semibold text-fh-bleu ring-1 ring-fh-sable">
            {LIBELLE_MATIERE[analyse.matiere.valeur]} · {LIBELLE_CONFIANCE[analyse.matiere.confiance]}
          </li>
          {analyse.niveau.valeur && (
            <li className="rounded-full bg-fh-creme px-3 py-1 text-xs font-semibold text-fh-bleu ring-1 ring-fh-sable">
              {analyse.niveau.valeur} · {LIBELLE_CONFIANCE[analyse.niveau.confiance]}
            </li>
          )}
        </ul>
      </Section>

      {analyse.enonce && (
        <Section titre="Énoncé">
          <RenduMath contenu={analyse.enonce.replace(/\n/g, "  \n")} className="rendu-markdown text-fh-bleu" />
        </Section>
      )}

      {analyse.questions.length > 0 && (
        <Section titre="Questions">
          <ol className="flex flex-col gap-2">
            {analyse.questions.map((question, index) => (
              <li
                key={`${question.numero}-${index}`}
                className={`rounded-xl px-3 py-2 ${question.incertain ? "bg-amber-50 ring-1 ring-amber-300" : "bg-fh-creme"}`}
              >
                <span className="font-semibold text-fh-bleu">{question.numero ? `${question.numero}. ` : ""}</span>
                <RenduMath contenu={question.texte} className="rendu-markdown inline rendu-en-ligne text-fh-bleu" />
                {question.incertain && (
                  <p className="mt-1 text-xs font-semibold text-amber-900">À vérifier : lecture incertaine.</p>
                )}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {analyse.donnees.length > 0 && (
        <Section titre="Données">
          <ul className="list-disc pl-5">
            {analyse.donnees.map((donnee, index) => (
              <li key={index}>
                <RenduMath contenu={donnee.libelle} className="rendu-markdown inline rendu-en-ligne font-semibold text-fh-bleu" />
                {donnee.valeur && (
                  <>
                    {" : "}
                    <RenduMath contenu={donnee.valeur} className="rendu-markdown inline rendu-en-ligne" />
                  </>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {analyse.formules.length > 0 && (
        <Section titre="Formules">
          <ul className="flex flex-col gap-1">
            {analyse.formules.map((formule, index) => (
              <li key={index}>
                <RenduMath contenu={formule} bloc className="rendu-markdown text-fh-bleu" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(analyse.figures.length > 0 || analyse.tableaux.length > 0) && (
        <Section titre="Figures et tableaux">
          <ul className="list-disc pl-5">
            {analyse.figures.map((figure, index) => (
              <li key={`f${index}`}>
                Figure{page(figure.page)} : {figure.description}
                {!figure.exploitable && <strong className="text-amber-900"> — peu exploitable</strong>}
              </li>
            ))}
            {analyse.tableaux.map((tableau, index) => (
              <li key={`t${index}`}>
                Tableau{page(tableau.page)} : {tableau.description}
                {tableau.contenu && <RenduMath contenu={tableau.contenu} className="rendu-markdown mt-1 text-fh-bleu" />}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(incertitudes.length > 0 || analyse.remarques.length > 0) && (
        <section className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-300 sm:p-5">
          <h3 className="text-sm font-bold text-amber-900">À vérifier</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-amber-900">
            {incertitudes.map((partie, index) => (
              <li key={`i${index}`}>
                <RenduMath contenu={partie.probleme} className="rendu-markdown inline rendu-en-ligne" />
                {page(partie.page)}
                {partie.extrait && <em> — « {partie.extrait} »</em>}
              </li>
            ))}
            {analyse.remarques.map((texte, index) => (
              <li key={`r${index}`}>
                <RenduMath contenu={texte} className="rendu-markdown inline rendu-en-ligne" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {confirmee && (
        <p role="status" className="rounded-xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-800">
          {correctionDisponible || professeurDisponible
            ? "Énoncé confirmé. Rien n'a encore été enregistré."
            : "Énoncé confirmé. La résolution sera disponible prochainement : rien n'a encore été enregistré."}
        </p>
      )}

      {confirmee && professeurDisponible && !professeurAffiche && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setProfesseurOuvert(analyse)}
            className={
              modeChoisi === "professeur" || !correctionDisponible
                ? "min-h-12 rounded-full bg-fh-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce sm:text-base"
                : "min-h-12 rounded-full border border-fh-orange px-6 text-sm font-semibold text-fh-orange-fonce transition-colors hover:bg-fh-accent/40 sm:text-base"
            }
          >
            Travailler avec le Professeur particulier IA
          </button>
        </div>
      )}

      {professeurAffiche && <ProfesseurParticulier programmeId={programmeId} analyse={analyse} />}

      {confirmee && correctionDisponible && !correctionAffichee && !professeurAffiche && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void voirCorrection()}
            disabled={correctionEnCours}
            aria-busy={correctionEnCours}
            className="min-h-12 rounded-full bg-fh-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
          >
            {correctionEnCours ? "Correction en préparation…" : "Voir la correction complète"}
          </button>
          {correctionEnCours && (
            <p className="text-center text-xs text-fh-ardoise">La rédaction et le contrôle des calculs prennent environ une minute.</p>
          )}
          {erreurCorrection && (
            <div role="alert" className="rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700">
              {erreurCorrection.messages.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {correctionAffichee && <CorrectionComplete correction={correctionAffichee} />}

      {signalement && !confirmee && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable sm:p-5">
          <label htmlFor="remarque-lecture" className="block text-sm font-medium text-fh-bleu">
            Qu&apos;est-ce qui est faux ou manquant ?
          </label>
          <textarea
            id="remarque-lecture"
            value={remarque}
            onChange={(event) => setRemarque(event.target.value.slice(0, LONGUEUR_MAX_CORRECTION))}
            disabled={enCours}
            rows={3}
            placeholder="Ex. : à la question 2, c'est x³ et non x²."
            className="mt-1 w-full rounded-xl border border-fh-bleu-vif/15 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
          />
          <p className="mt-1 text-right text-xs text-fh-ardoise/70">
            {remarque.length} / {LONGUEUR_MAX_CORRECTION}
          </p>
          <button
            type="button"
            onClick={() => onDemanderCorrection(remarque.trim())}
            disabled={enCours || remarque.trim().length === 0}
            aria-busy={enCours}
            className="mt-2 min-h-11 rounded-full bg-fh-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enCours ? "Nouvelle lecture en cours…" : "Relire avec ma remarque"}
          </button>
        </div>
      )}

      {erreur && (
        <div role="alert" className="rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700">
          {erreur.messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}

      {!confirmee && (
        <div className="flex flex-col gap-2">
          {analyse.lisible && (
            <button
              type="button"
              onClick={onConfirmer}
              disabled={enCours}
              className="min-h-12 rounded-full bg-fh-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            >
              C&apos;est bien mon énoncé
            </button>
          )}
          {analyse.lisible && (
            <button
              type="button"
              onClick={() => setSignalement((ouvert) => !ouvert)}
              disabled={enCours}
              aria-expanded={signalement}
              className="min-h-11 rounded-full border border-fh-bleu/20 bg-white px-5 text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-accent disabled:opacity-50"
            >
              Signaler une erreur de lecture
            </button>
          )}
          <button
            type="button"
            onClick={onModifier}
            disabled={enCours}
            className="min-h-11 rounded-full px-5 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60 disabled:opacity-50"
          >
            Modifier mon exercice
          </button>
        </div>
      )}
    </div>
  );
}
