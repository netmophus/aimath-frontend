"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { IconCircleCheck, IconX } from "@tabler/icons-react";

import ChampMotDePasse from "@/components/auth/ChampMotDePasse";
import { ApiError, modifierMotDePasse } from "@/lib/api";
import { messageErreurRecuperation, validerNouveauMotDePasse } from "@/lib/motDePasse";

const LABEL = "mb-1.5 block text-base font-extrabold text-[#102A66]";

interface Props {
  onFermer: () => void;
  /** Appelé après un changement réussi (message de confirmation à afficher sur la page). */
  onSucces: () => void;
}

/**
 * Changement volontaire du mot de passe. Monté seulement quand elle est ouverte : l'état repart de zéro à chaque ouverture. Formulaire et API distincts du profil. Le mot de passe actuel est
 * obligatoire et vérifié par le serveur ; rien n'est stocké ni journalisé ici, les champs sont vidés à la fermeture.
 */
export default function ModaleModifierMotDePasse({ onFermer, onSucces }: Props) {
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurActuel, setErreurActuel] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [termine, setTermine] = useState(false);
  const verrou = useRef(false);
  const boite = useRef<HTMLDivElement>(null);
  const declencheur = useRef<Element | null>(null);

  useEffect(() => {
    declencheur.current = document.activeElement;
    const t = setTimeout(() => boite.current?.querySelector<HTMLInputElement>("#mdp-actuel")?.focus(), 0);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      (declencheur.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  if (typeof document === "undefined") return null;

  function fermer() {
    if (enCours) return;
    onFermer();
  }

  function clavier(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      fermer();
      return;
    }
    if (e.key !== "Tab" || !boite.current) return;
    const focalisables = Array.from(
      boite.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), a[href]"),
    );
    if (focalisables.length === 0) return;
    const premier = focalisables[0];
    const dernier = focalisables[focalisables.length - 1];
    if (e.shiftKey && document.activeElement === premier) {
      e.preventDefault();
      dernier.focus();
    } else if (!e.shiftKey && document.activeElement === dernier) {
      e.preventDefault();
      premier.focus();
    }
  }

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    if (verrou.current) return;
    setErreur(null);
    setErreurActuel(null);
    if (!actuel) {
      setErreurActuel("Saisis ton mot de passe actuel.");
      return;
    }
    const probleme = validerNouveauMotDePasse(nouveau, confirmation);
    if (probleme) {
      setErreur(probleme);
      return;
    }
    verrou.current = true;
    setEnCours(true);
    try {
      await modifierMotDePasse({ motDePasseActuel: actuel, nouveauMotDePasse: nouveau, confirmation });
      setActuel("");
      setNouveau("");
      setConfirmation("");
      setTermine(true);
      onSucces();
    } catch (error) {
      const champActuel =
        error instanceof ApiError && error.body && typeof error.body === "object"
          ? (error.body as Record<string, unknown>).mot_de_passe_actuel
          : null;
      if (Array.isArray(champActuel) && typeof champActuel[0] === "string") setErreurActuel(champActuel[0]);
      else setErreur(messageErreurRecuperation(error));
    } finally {
      verrou.current = false;
      setEnCours(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102A66]/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && fermer()}>
      <div
        ref={boite}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-modale-mdp"
        onKeyDown={clavier}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-3xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="titre-modale-mdp" className="text-xl font-extrabold text-[#102A66]">
            Modifier mon mot de passe
          </h2>
          <button
            type="button"
            onClick={fermer}
            aria-label="Fermer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-[#102A66]"
          >
            <IconX size={24} aria-hidden="true" />
          </button>
        </div>

        {termine ? (
          <div className="text-center">
            <IconCircleCheck size={56} stroke={1.5} className="mx-auto text-[#16A34A]" aria-hidden="true" />
            <p role="status" className="mt-3 text-lg font-bold text-[#102A66]">
              Mot de passe modifié.
            </p>
            <p className="mt-1 text-sm text-slate-600">Tes autres appareils seront déconnectés.</p>
            <button
              type="button"
              onClick={onFermer}
              className="mt-5 min-h-12 w-full rounded-2xl bg-[#C2410C] px-6 text-base font-bold text-white hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={envoyer} className="flex flex-col gap-4">
            <div>
              <label htmlFor="mdp-actuel" className={LABEL}>
                Mot de passe actuel
              </label>
              <ChampMotDePasse
                id="mdp-actuel"
                value={actuel}
                onChange={setActuel}
                autoComplete="current-password"
                invalide={!!erreurActuel}
                idErreur={erreurActuel ? "erreur-actuel" : undefined}
                designation="le mot de passe actuel"
              />
              {erreurActuel && (
                <p id="erreur-actuel" role="alert" className="mt-1.5 text-sm font-semibold text-red-700">
                  {erreurActuel}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="mdp-nouveau" className={LABEL}>
                Nouveau mot de passe
              </label>
              <ChampMotDePasse id="mdp-nouveau" value={nouveau} onChange={setNouveau} autoComplete="new-password" designation="le nouveau mot de passe" />
              <p className="mt-1.5 text-sm text-slate-600">Au moins 8 caractères, pas trop courant, pas uniquement des chiffres.</p>
            </div>
            <div>
              <label htmlFor="mdp-confirmation" className={LABEL}>
                Confirmer le nouveau mot de passe
              </label>
              <ChampMotDePasse id="mdp-confirmation" value={confirmation} onChange={setConfirmation} autoComplete="new-password" designation="la confirmation" />
            </div>

            {erreur && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                {erreur}
              </p>
            )}

            <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fermer}
                disabled={enCours}
                className="min-h-12 rounded-2xl bg-slate-100 px-6 text-base font-bold text-[#102A66] hover:bg-slate-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={enCours}
                className="min-h-12 rounded-2xl bg-[#C2410C] px-6 text-base font-bold text-white hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enCours ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
