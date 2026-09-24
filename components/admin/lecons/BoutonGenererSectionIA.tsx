"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api";
import { genererSection, type SectionTexteIA } from "@/lib/iaApi";
import Toast from "@/components/admin/Toast";
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

  async function lancerGeneration() {
    setEnCours(true);
    try {
      const { contenu, tronque: reponseTronquee } = await genererSection(notionId, section);
      setContenuGenere(contenu);
      setTronque(!!reponseTronquee);
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "La génération a échoué.");
    } finally {
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
