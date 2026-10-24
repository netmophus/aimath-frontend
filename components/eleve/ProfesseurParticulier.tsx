"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconBulb, IconCircleCheck, IconHelpCircle, IconSend } from "@tabler/icons-react";

import RenduMath from "@/components/maths/RenduMath";
import SimulationExercice from "@/components/simulations/SimulationExercice";
import EtudeFonction from "@/components/maths/EtudeFonction";
import {
  demanderExplicationProfesseur,
  demanderIndiceProfesseur,
  demarrerSeanceProfesseur,
  envoyerReponseProfesseur,
  etapeSuivanteProfesseur,
  voirSolutionProfesseur,
  type AnalyseEnonce as Analyse,
  type MessageProfesseur,
  type SeanceProfesseur,
  type SeanceReponse,
  type TypeDemandeExplication,
  type VerificationMessage,
} from "@/lib/eleveApi";
import { ApiError } from "@/lib/api";
import { decrireErreurProfesseur, type ErreurProfesseur } from "@/lib/resoudre";

const LONGUEUR_MAX_SAISIE = 1500;

const BADGE: Record<VerificationMessage, { classes: string; texte: string }> = {
  verifiee: { classes: "bg-green-100 text-green-800", texte: "Calcul contrôlé" },
  non_verifiable: { classes: "bg-fh-sable text-fh-bleu", texte: "Non contrôlable automatiquement" },
  incertaine: { classes: "bg-amber-100 text-amber-900", texte: "Référence incertaine" },
  illisible: { classes: "bg-fh-sable text-fh-bleu", texte: "Réponse non comprise" },
};

const AIDES: { type: TypeDemandeExplication; libelle: string }[] = [
  { type: "autre_explication", libelle: "Explique autrement" },
  { type: "exemple", libelle: "Exemple plus simple" },
  { type: "pourquoi", libelle: "Pourquoi cette formule ?" },
];

interface ProfesseurParticulierProps {
  programmeId: number;
  /** Énoncé confirmé par l'élève : seule donnée envoyée pour démarrer (jamais les photos). */
  analyse: Analyse;
}

function Bulle({ message }: { message: MessageProfesseur }) {
  if (message.role === "eleve") {
    return (
      <li className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-fh-bleu px-4 py-2 text-sm text-white">
          {message.texte}
        </p>
      </li>
    );
  }
  const badge = message.verification ? BADGE[message.verification] : null;
  return (
    <li className="flex justify-start">
      <div className="max-w-[92%] min-w-0 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-fh-sable sm:max-w-[85%]">
        {message.type === "solution" && (
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-fh-orange-fonce">Solution de cette étape</p>
        )}
        {message.type === "indice" && message.niveau && (
          <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-fh-orange-fonce">
            <IconBulb size={14} aria-hidden="true" /> Indice {message.niveau}/3
          </p>
        )}
        <RenduMath contenu={message.texte} className="rendu-markdown overflow-x-auto break-words text-sm text-fh-bleu" />
        {badge && <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${badge.classes}`}>{badge.texte}</span>}
      </div>
    </li>
  );
}

/**
 * Conversation avec le Professeur particulier IA. Toute la séance vit côté serveur :
 * le navigateur n'envoie que sa réponse (ou son action) et le numéro de version
 * qu'il a vu ; il n'envoie ni historique ni réponse attendue, et ne reçoit jamais
 * le plan de correction. Un seul envoi à la fois (verrou anti double clic).
 */
export default function ProfesseurParticulier({ programmeId, analyse }: ProfesseurParticulierProps) {
  const [seance, setSeance] = useState<SeanceProfesseur | null>(null);
  const [erreur, setErreur] = useState<ErreurProfesseur | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [aideOuverte, setAideOuverte] = useState(false);
  const verrou = useRef(false);
  const demarre = useRef(false);
  const fin = useRef<HTMLDivElement>(null);
  const nbMessages = seance?.messages.length ?? 0;

  const executer = useCallback(async (appel: () => Promise<SeanceReponse>, apres?: () => void) => {
    if (verrou.current) return;
    verrou.current = true;
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await appel();
      setSeance(reponse.seance);
      apres?.();
    } catch (error) {
      // Version périmée : le serveur renvoie l'état à jour, on se resynchronise.
      const corps = error instanceof ApiError ? (error.body as { seance?: SeanceProfesseur } | null) : null;
      if (corps?.seance) setSeance(corps.seance);
      setErreur(decrireErreurProfesseur(error));
    } finally {
      verrou.current = false;
      setEnCours(false);
    }
  }, []);

  const demarrer = useCallback(() => {
    demarre.current = true;
    void executer(() => demarrerSeanceProfesseur(programmeId, analyse));
  }, [analyse, executer, programmeId]);

  useEffect(() => {
    if (!demarre.current) demarrer();
  }, [demarrer]);

  useEffect(() => {
    fin.current?.scrollIntoView?.({ block: "end", behavior: "smooth" });
  }, [nbMessages, enCours]);

  function envoyer() {
    const texte = saisie.trim();
    if (!seance || !texte || enCours) return;
    void executer(() => envoyerReponseProfesseur(seance.seance, seance.version, texte), () => setSaisie(""));
  }

  if (!seance) {
    return (
      <section aria-label="Professeur particulier" className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-fh-sable">
        {erreur ? (
          <div role="alert" className="flex flex-col items-center gap-3">
            <p className="text-sm text-red-700">{erreur.message}</p>
            <button
              type="button"
              onClick={demarrer}
              className="min-h-11 rounded-full bg-fh-orange px-6 text-sm font-semibold text-white hover:bg-fh-orange-fonce"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <p role="status" aria-busy="true" className="text-sm text-fh-ardoise">
            Le professeur prépare ta séance… (environ une minute)
          </p>
        )}
      </section>
    );
  }

  const { progression, actions, etape } = seance;
  const expiree = erreur?.seanceExpiree === true;
  const bloque = enCours || expiree;

  return (
    <section aria-label="Professeur particulier" className="flex flex-col gap-3">
      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-fh-sable">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-fh-bleu">
          <span>
            Question {progression.question}/{progression.nb_questions} · Étape {progression.etape}/{progression.nb_etapes_question}
          </span>
          <span>{progression.pourcentage} %</span>
        </div>
        <div
          role="progressbar"
          aria-label="Progression de l'exercice"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progression.pourcentage}
          className="mt-1 h-2 overflow-hidden rounded-full bg-fh-sable"
        >
          <div className="h-full rounded-full bg-fh-orange transition-all" style={{ width: `${progression.pourcentage}%` }} />
        </div>
      </div>

      <ol aria-live="polite" className="flex flex-col gap-3">
        {seance.messages.map((message) => (
          <Bulle key={message.id} message={message} />
        ))}
      </ol>

      {(seance.simulations ?? []).length > 0 && process.env.NODE_ENV === "development" && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-fh-sable">
          <p className="text-xs font-bold uppercase tracking-wide text-fh-ardoise">Pour visualiser les questions terminées</p>
          {(seance.simulations ?? []).map((item, index) => (
            <div key={`${item.question}-${index}`} className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-fh-bleu">Question {item.question}</p>
              <SimulationExercice simulation={item.simulation} />
            </div>
          ))}
        </div>
      )}

      {enCours && (
        <p role="status" aria-busy="true" className="text-sm text-fh-ardoise">
          Le professeur réfléchit…
        </p>
      )}

      {erreur && (
        <div role="alert" className="rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700">
          <p>{erreur.message}</p>
          {expiree && (
            <button type="button" onClick={() => { setSeance(null); setErreur(null); demarrer(); }} className="mt-2 font-semibold underline">
              Recommencer une séance
            </button>
          )}
        </div>
      )}

      {seance.termine ? (
        <>
          <p role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-800">
            <IconCircleCheck size={20} aria-hidden="true" /> Exercice terminé. Bravo pour ton travail !
          </p>
          {(seance.etudes ?? []).map((item, index) => (
            <div key={index} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-fh-sable">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-fh-ardoise">Pour retenir — question {item.question}</p>
              <EtudeFonction etude={item.etude} afficher="tout" />
            </div>
          ))}
        </>
      ) : seance.etape_terminee ? (
        <button
          type="button"
          disabled={bloque || !actions.suivante}
          onClick={() => void executer(() => etapeSuivanteProfesseur(seance.seance, seance.version))}
          className="min-h-12 rounded-full bg-fh-orange px-6 text-sm font-semibold text-white hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-50"
        >
          Étape suivante
        </button>
      ) : (
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-fh-sable">
          <label htmlFor="reponse-professeur" className="text-sm font-medium text-fh-bleu">
            Ta réponse
          </label>
          <textarea
            id="reponse-professeur"
            value={saisie}
            onChange={(event) => setSaisie(event.target.value.slice(0, LONGUEUR_MAX_SAISIE))}
            disabled={bloque}
            rows={3}
            placeholder="Écris ton calcul ou ta réponse, ex. : f'(x) = 3x² - 3"
            className="w-full rounded-xl border border-fh-bleu-vif/15 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={envoyer}
              disabled={bloque || !saisie.trim()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fh-orange px-5 text-sm font-semibold text-white hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconSend size={16} aria-hidden="true" /> Envoyer ma réponse
            </button>
            <button
              type="button"
              onClick={() => void executer(() => demanderIndiceProfesseur(seance.seance, seance.version))}
              disabled={bloque || !actions.indice}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fh-sable px-5 text-sm font-semibold text-fh-bleu hover:bg-fh-sable/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconBulb size={16} aria-hidden="true" /> Besoin d&apos;un indice ({etape.indices_donnes}/{etape.indices_max})
            </button>
            <button
              type="button"
              onClick={() => setAideOuverte((v) => !v)}
              disabled={bloque}
              aria-expanded={aideOuverte}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fh-sable px-5 text-sm font-semibold text-fh-bleu hover:bg-fh-sable/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconHelpCircle size={16} aria-hidden="true" /> Je n&apos;ai pas compris
            </button>
          </div>

          {aideOuverte && (
            <div className="flex flex-wrap gap-2">
              {AIDES.map((aide) => (
                <button
                  key={aide.type}
                  type="button"
                  disabled={bloque || !actions.explication}
                  onClick={() => void executer(() => demanderExplicationProfesseur(seance.seance, seance.version, aide.type), () => setAideOuverte(false))}
                  className="min-h-10 rounded-full border border-fh-bleu/20 px-4 text-sm text-fh-bleu hover:bg-fh-creme disabled:opacity-50"
                >
                  {aide.libelle}
                </button>
              ))}
              <button
                type="button"
                disabled={bloque || !actions.explication || !saisie.trim()}
                title="Écris ta question dans la zone de texte, puis clique ici"
                onClick={() =>
                  void executer(
                    () => demanderExplicationProfesseur(seance.seance, seance.version, "question", saisie.trim()),
                    () => { setSaisie(""); setAideOuverte(false); },
                  )
                }
                className="min-h-10 rounded-full border border-fh-bleu/20 px-4 text-sm text-fh-bleu hover:bg-fh-creme disabled:opacity-50"
              >
                Poser ma question (écrite ci-dessus)
              </button>
            </div>
          )}

          <div className="border-t border-fh-sable pt-2">
            <button
              type="button"
              onClick={() => void executer(() => voirSolutionProfesseur(seance.seance, seance.version))}
              disabled={bloque || !actions.solution}
              className="min-h-11 rounded-full border border-fh-orange px-5 text-sm font-semibold text-fh-orange-fonce hover:bg-fh-accent/40 disabled:cursor-not-allowed disabled:border-fh-sable disabled:text-fh-ardoise/60"
            >
              Voir la solution de cette étape
            </button>
            {!actions.solution && etape.conditions_solution && (
              <p className="mt-1 text-xs text-fh-ardoise">{etape.conditions_solution}</p>
            )}
          </div>
        </div>
      )}
      <div ref={fin} />
    </section>
  );
}
