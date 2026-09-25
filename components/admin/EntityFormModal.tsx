"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { ApiError } from "@/lib/api";
import Modal from "@/components/admin/Modal";

export interface ChampFormulaire {
  nom: string;
  label: string;
  type: "text" | "number" | "password" | "select" | "textarea";
  requis?: boolean;
  /** Requis si type === "select". */
  options?: readonly { value: number; label: string }[];
  /** Utilisé seulement si type === "textarea" (défaut : 3). */
  lignes?: number;
  /** Uniquement significatif si `disposition="grille"` (voir plus bas) :
   * ce champ occupe les deux colonnes au lieu d'une seule. Sans effet en
   * disposition "colonne" (défaut). */
  pleineLargeur?: boolean;
}

interface EntityFormModalProps {
  titre: string;
  /** Bandeau d'information optionnel affiché au-dessus des champs. */
  description?: ReactNode;
  champs: readonly ChampFormulaire[];
  valeursInitiales: Record<string, string>;
  onSubmit: (valeurs: Record<string, string>) => Promise<void>;
  onClose: () => void;
  libelleSoumettre?: string;
  /** "colonne" (défaut) : un champ par ligne, comportement historique
   * inchangé pour tous les formulaires existants. "grille" : deux colonnes
   * à partir de sm: (une seule sur mobile), pour un formulaire avec
   * beaucoup de champs courts — voir ChampFormulaire.pleineLargeur pour
   * qu'un champ précis (ex. un mot de passe) occupe toute la largeur même
   * en grille. Opt-in explicite : ne change rien pour les appelants
   * existants qui ne passent pas cette prop. */
  disposition?: "colonne" | "grille";
  /** Passthrough vers Modal (voir components/admin/Modal.tsx) — "lg" utile
   * pour laisser respirer une disposition "grille" à deux colonnes. */
  taille?: "md" | "lg";
}

/**
 * Formulaire de création/édition générique, piloté par une liste de champs.
 * Partagé entre la structure scolaire et la gestion des utilisateurs —
 * `onSubmit` peut lever une ApiError (message backend affiché tel quel) ou
 * une Error ordinaire (ex. validation locale comme "mots de passe différents").
 */
export default function EntityFormModal({
  titre,
  description,
  champs,
  valeursInitiales,
  onSubmit,
  onClose,
  libelleSoumettre = "Enregistrer",
  disposition = "colonne",
  taille,
}: EntityFormModalProps) {
  const [valeurs, setValeurs] = useState<Record<string, string>>(valeursInitiales);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  function setChamp(nom: string, valeur: string) {
    setValeurs((courant) => ({ ...courant, [nom]: valeur }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur(null);
    setEnvoiEnCours(true);
    try {
      await onSubmit(valeurs);
    } catch (error) {
      if (error instanceof ApiError || error instanceof Error) {
        setErreur(error.message);
      } else {
        setErreur("Une erreur est survenue. Réessaie.");
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Modal titre={titre} onClose={onClose} taille={taille}>
      {description && (
        <p className="mb-4 rounded-lg bg-fh-accent/40 px-3 py-2 text-sm text-fh-ardoise">
          {description}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className={
          disposition === "grille" ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "flex flex-col gap-4"
        }
      >
        {champs.map((champ) => (
          <div key={champ.nom} className={champ.pleineLargeur ? "sm:col-span-2" : undefined}>
            <label htmlFor={champ.nom} className="mb-1 block text-sm font-medium text-fh-ardoise">
              {champ.label}
            </label>
            {champ.type === "select" ? (
              <select
                id={champ.nom}
                required={champ.requis}
                value={valeurs[champ.nom] ?? ""}
                onChange={(event) => setChamp(champ.nom, event.target.value)}
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              >
                <option value="" disabled>
                  Choisir…
                </option>
                {champ.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : champ.type === "textarea" ? (
              <textarea
                id={champ.nom}
                required={champ.requis}
                rows={champ.lignes ?? 3}
                value={valeurs[champ.nom] ?? ""}
                onChange={(event) => setChamp(champ.nom, event.target.value)}
                className="w-full resize-y rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              />
            ) : (
              <input
                id={champ.nom}
                type={champ.type}
                required={champ.requis}
                value={valeurs[champ.nom] ?? ""}
                onChange={(event) => setChamp(champ.nom, event.target.value)}
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              />
            )}
          </div>
        ))}

        {erreur && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{erreur}</p>
        )}

        <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={envoiEnCours}
            className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
          >
            {envoiEnCours ? "Enregistrement…" : libelleSoumettre}
          </button>
        </div>
      </form>
    </Modal>
  );
}
