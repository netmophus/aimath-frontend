"use client";

import { useCallback, useEffect, useState } from "react";

import { estTelechargee, supprimerLeconLocale, telechargerLecon } from "@/lib/offlineStore";
import { useEnLigne } from "@/lib/useEnLigne";
import Toast from "@/components/admin/Toast";
import { IconeCorbeille, IconeTelecharger } from "./icones";

interface BoutonTelechargerProps {
  leconId: number;
  /** Prévenu à chaque changement d'état téléchargée/non-téléchargée — la page
   * de lecture s'en sert pour garder à jour l'ensemble des leçons
   * disponibles hors-ligne (utile au bouton "Voir la leçon" du glossaire).
   * Optionnel, ignoré si absent. */
  onChange?: (telechargee: boolean) => void;
}

type Etat = "verification" | "absente" | "en_cours" | "presente" | "suppression";

/**
 * Bouton "Télécharger pour hors-ligne" de la page de lecture élève. Gère lui-
 * même son propre toast de retour (succès/erreur) : un seul exemplaire par
 * page, pas de risque d'empiler plusieurs notifications.
 */
export default function BoutonTelecharger({ leconId, onChange }: BoutonTelechargerProps) {
  const enLigne = useEnLigne();
  const [etat, setEtat] = useState<Etat>("verification");
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  useEffect(() => {
    let actif = true;
    // queueMicrotask : réinitialise l'affichage si leconId change sans que
    // le composant soit démonté, sans setState synchrone direct dans le
    // corps de l'effet (règle react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      if (actif) setEtat("verification");
    });
    estTelechargee(leconId).then((presente) => {
      if (actif) setEtat(presente ? "presente" : "absente");
    });
    return () => {
      actif = false;
    };
  }, [leconId]);

  const declencherTelechargement = useCallback(async () => {
    setEtat("en_cours");
    try {
      await telechargerLecon(leconId);
      setEtat("presente");
      onChange?.(true);
      setToast({ message: "Leçon disponible hors-ligne.", tone: "succes" });
    } catch (error) {
      setEtat("absente");
      setToast({
        message: error instanceof Error ? error.message : "Téléchargement impossible. Vérifie ta connexion.",
        tone: "erreur",
      });
    }
  }, [leconId, onChange]);

  const declencherSuppression = useCallback(async () => {
    setEtat("suppression");
    try {
      await supprimerLeconLocale(leconId);
      setEtat("absente");
      onChange?.(false);
      setToast({ message: "Téléchargement supprimé.", tone: "succes" });
    } catch (error) {
      setEtat("presente");
      setToast({ message: error instanceof Error ? error.message : "Suppression impossible.", tone: "erreur" });
    }
  }, [leconId, onChange]);

  if (etat === "verification") {
    return <div className="h-9 w-40 animate-pulse rounded-full bg-fh-sable/50" aria-hidden="true" />;
  }

  if (etat === "presente" || etat === "suppression") {
    return (
      <>
        <div className="flex items-center gap-2">
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-fh-accent px-3 py-1.5 text-xs font-semibold text-fh-orange-fonce">
            ✓ Disponible hors-ligne
          </span>
          <button
            type="button"
            onClick={declencherSuppression}
            disabled={etat === "suppression"}
            aria-label="Supprimer le téléchargement"
            title="Supprimer le téléchargement"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fh-ardoise/50 transition-colors hover:bg-fh-sable/60 hover:text-fh-ardoise disabled:opacity-50"
          >
            <IconeCorbeille className="h-4 w-4" />
          </button>
        </div>
        {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
      </>
    );
  }

  // Absente et hors-ligne : télécharger exige le réseau, on l'indique
  // clairement plutôt que de laisser cliquer pour échouer.
  if (!enLigne) {
    return (
      <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-fh-sable/60 px-3 py-1.5 text-xs font-medium text-fh-ardoise/70">
        Connecte-toi pour télécharger
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={declencherTelechargement}
        disabled={etat === "en_cours"}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-fh-orange px-3 py-1.5 text-xs font-semibold text-fh-orange transition-colors hover:bg-fh-orange hover:text-white disabled:opacity-60"
      >
        <IconeTelecharger className="h-4 w-4" />
        {etat === "en_cours" ? "Téléchargement…" : "Télécharger"}
      </button>
      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </>
  );
}
