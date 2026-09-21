"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { listerLeconsTelechargees, supprimerLeconLocale, type LeconLocale } from "@/lib/offlineStore";
import CarteLeconTelechargee from "@/components/eleve/CarteLeconTelechargee";
import Toast from "@/components/admin/Toast";

/**
 * Espace "Mes leçons téléchargées" : lit uniquement IndexedDB, jamais l'API —
 * c'est la seule page élève qui fonctionne intégralement sans réseau, y
 * compris pour lister son propre contenu.
 */
export default function LeconsTelechargeesPage() {
  const [lecons, setLecons] = useState<LeconLocale[] | null>(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  useEffect(() => {
    let actif = true;
    listerLeconsTelechargees().then((liste) => {
      if (actif) setLecons(liste);
    });
    return () => {
      actif = false;
    };
  }, []);

  async function handleSupprimer(id: number) {
    setSuppressionEnCours(id);
    try {
      await supprimerLeconLocale(id);
      setLecons((precedent) => precedent?.filter((lecon) => lecon.id !== id) ?? null);
      setToast({ message: "Téléchargement supprimé.", tone: "succes" });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Suppression impossible.", tone: "erreur" });
    } finally {
      setSuppressionEnCours(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/eleve" className="text-sm font-medium text-fh-bleu hover:underline">
        ← Retour
      </Link>

      <div>
        <h1 className="text-lg font-bold text-fh-bleu">Mes leçons téléchargées</h1>
        <p className="text-sm text-fh-ardoise">Disponibles hors connexion, à tout moment.</p>
      </div>

      {lecons === null ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement">
          <div className="h-20 animate-pulse rounded-2xl bg-fh-sable/50" />
          <div className="h-20 animate-pulse rounded-2xl bg-fh-sable/50" />
        </div>
      ) : lecons.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-16 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            📥
          </span>
          <p className="max-w-xs text-sm text-fh-ardoise">
            Aucune leçon téléchargée. Ouvre une leçon et appuie sur Télécharger pour la lire hors connexion.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {lecons.map((lecon) => (
            <CarteLeconTelechargee
              key={lecon.id}
              lecon={lecon}
              onSupprimer={handleSupprimer}
              suppressionEnCours={suppressionEnCours === lecon.id}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
