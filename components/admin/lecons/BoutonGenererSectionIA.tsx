"use client";

import { useRef, useState } from "react";

import { ApiError } from "@/lib/api";
import { estSectionEnFlux, genererSection, type SectionTexteIA } from "@/lib/iaApi";
import Modal from "@/components/admin/Modal";
import Toast from "@/components/admin/Toast";
import RenduMarkdown from "@/components/RenduMarkdown";
import ModaleApercuIA from "./ModaleApercuIA";

interface BoutonGenererSectionIAProps {
  section: SectionTexteIA;
  notionId: number;
  /** Contenu actuel du champ — sert à choisir "Générer"/"Régénérer" et à
   * décider si l'insertion devra demander confirmation (voir ModaleApercuIA). */
  valeurActuelle: string;
  /** Un prompt personnalisé (voir ChampPromptPerso) est-il actif pour cette
   * notion × section ? Purement indicatif — n'affecte pas la requête envoyée
   * (le backend décide déjà seul du prompt à utiliser). */
  promptPersoActif?: boolean;
  onInsere: (contenu: string) => void;
}

/**
 * Bouton "Générer avec l'IA" (ou "Régénérer…" si le champ est déjà rempli)
 * pour une section texte de la leçon. Un clic = UN appel IA facturé, jamais
 * automatique : chargement affiché ICI (sur le bouton, avant toute modale),
 * puis ouverture de ModaleApercuIA au succès pour la suite (aperçu, vérifier,
 * régénérer, insérer).
 */
export default function BoutonGenererSectionIA({
  section,
  notionId,
  valeurActuelle,
  promptPersoActif,
  onInsere,
}: BoutonGenererSectionIAProps) {
  const [enCours, setEnCours] = useState(false);
  const [contenuGenere, setContenuGenere] = useState<string | null>(null);
  const [tronque, setTronque] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  // Aperçu progressif (sections lues en flux, ex. sujet type examen) : texte reçu jusqu'ici.
  const [texteLive, setTexteLive] = useState<string | null>(null);
  // Échec d'un flux : message RÉEL de l'erreur + texte reçu jusqu'ici, affichés dans une fenêtre qui reste ouverte
  // (un toast s'efface et l'avalait : on veut voir la cause et jusqu'où le flux est allé).
  const [echecFlux, setEchecFlux] = useState<{ message: string; texteRecu: string } | null>(null);
  const dernierTexte = useRef("");
  const annulation = useRef<AbortController | null>(null);
  const enFlux = estSectionEnFlux(section);

  function annulerGeneration() {
    annulation.current?.abort();
  }

  async function lancerGeneration() {
    setEnCours(true);
    const controleur = new AbortController();
    annulation.current = controleur;
    dernierTexte.current = "";
    if (enFlux) setTexteLive("");
    try {
      const { contenu, tronque: reponseTronquee } = await genererSection(notionId, section, {
        surTexte: enFlux
          ? (texte) => {
              dernierTexte.current = texte;
              setTexteLive(texte);
            }
          : undefined,
        signal: controleur.signal,
      });
      setContenuGenere(contenu);
      setTronque(!!reponseTronquee);
    } catch (error) {
      if (!controleur.signal.aborted) {
        const message =
          error instanceof ApiError
            ? error.message
            : `La génération a échoué : ${error instanceof Error ? error.message : "erreur inconnue"}`;
        if (enFlux) setEchecFlux({ message, texteRecu: dernierTexte.current });
        else setErreur(message);
      }
    } finally {
      annulation.current = null;
      setTexteLive(null);
      setEnCours(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={enCours}
        onClick={lancerGeneration}
        title={
          promptPersoActif
            ? "Génère un premier jet avec l'IA — utilise le prompt personnalisé de cette section"
            : "Génère un premier jet avec l'IA — peut prendre quelques secondes"
        }
        className="inline-flex items-center gap-1.5 rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enCours ? (
          <>
            <span
              aria-hidden
              className="h-3 w-3 animate-spin rounded-full border-2 border-fh-bleu-vif/30 border-t-fh-bleu-vif"
            />
            Génération en cours…
          </>
        ) : (
          <>✨ {valeurActuelle.trim() ? "Régénérer avec l'IA" : "Générer avec l'IA"}</>
        )}
      </button>

      {texteLive !== null && (
        <Modal titre="Génération en cours…" onClose={annulerGeneration} taille="lg" fermetureParCroixSeulement>
          <div className="flex flex-col gap-3">
            <p className="text-xs text-fh-ardoise/70">
              Le texte s&apos;affiche au fur et à mesure. Fermer cette fenêtre annule la génération.
            </p>
            {texteLive ? (
              <RenduMarkdown contenu={texteLive} />
            ) : (
              <p className="text-sm text-fh-ardoise/70">En attente des premiers mots…</p>
            )}
          </div>
        </Modal>
      )}

      {echecFlux && (
        <Modal titre="La génération s'est interrompue" onClose={() => setEchecFlux(null)} taille="lg" fermetureParCroixSeulement>
          <div className="flex flex-col gap-3">
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
              {echecFlux.message}
            </p>
            {echecFlux.texteRecu ? (
              <>
                <p className="text-xs text-fh-ardoise/70">
                  Texte reçu avant l&apos;interruption ({echecFlux.texteRecu.length} caractères) — non inséré dans le champ :
                </p>
                <RenduMarkdown contenu={echecFlux.texteRecu} />
              </>
            ) : (
              <p className="text-xs text-fh-ardoise/70">Aucun texte n&apos;a été reçu avant l&apos;interruption.</p>
            )}
          </div>
        </Modal>
      )}

      {contenuGenere !== null && (
        <ModaleApercuIA
          section={section}
          notionId={notionId}
          contenu={contenuGenere}
          valeurActuelle={valeurActuelle}
          tronque={tronque}
          onRegenerer={() =>
            genererSection(notionId, section).then((reponse) => ({
              contenu: reponse.contenu,
              tronque: reponse.tronque,
            }))
          }
          onInsere={(contenu) => {
            onInsere(contenu);
            setContenuGenere(null);
          }}
          onClose={() => setContenuGenere(null)}
        />
      )}

      {erreur && <Toast message={erreur} tone="erreur" onClose={() => setErreur(null)} />}
    </>
  );
}
