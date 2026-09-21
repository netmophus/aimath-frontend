"use client";

import { useEnLigne } from "@/lib/useEnLigne";

/**
 * Bandeau discret affiché sur toutes les pages élève quand le navigateur
 * signale une perte de connexion (navigator.onLine) — purement informatif :
 * les leçons déjà téléchargées restent lisibles normalement ; le reste
 * affiche son propre message ("pas disponible hors-ligne") le cas échéant.
 */
export default function BandeauHorsLigne() {
  const enLigne = useEnLigne();
  if (enLigne) return null;

  return (
    <div className="bg-fh-ardoise px-4 py-1.5 text-center text-xs font-medium text-white">
      📡 Mode hors-ligne — tu consultes les leçons déjà téléchargées.
    </div>
  );
}
