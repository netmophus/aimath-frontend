"use client";

import { useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { listerTermes, supprimerTerme, type TermeGlossaire } from "@/lib/glossaireApi";
import TermeRow from "@/components/admin/glossaire/TermeRow";
import TermeFormModal from "@/components/admin/glossaire/TermeFormModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Toast from "@/components/admin/Toast";

interface ListePaginee {
  count: number;
  next: string | null;
  previous: string | null;
  results: TermeGlossaire[];
}

export default function GlossairePage() {
  const [rechercheSaisie, setRechercheSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ListePaginee | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [refreshCle, setRefreshCle] = useState(0);

  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [termeAModifier, setTermeAModifier] = useState<TermeGlossaire | null>(null);
  const [termeASupprimer, setTermeASupprimer] = useState<TermeGlossaire | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const resultat = await listerTermes({ search: recherche || undefined, page });
        if (actif) setData(resultat);
      } catch (error) {
        if (actif) {
          setErreur(error instanceof ApiError ? error.message : "Impossible de charger le glossaire.");
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [recherche, page, refreshCle]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setRecherche(rechercheSaisie.trim());
  }

  function ouvrirCreation() {
    setTermeAModifier(null);
    setModaleOuverte(true);
  }

  function ouvrirEdition(terme: TermeGlossaire) {
    setTermeAModifier(terme);
    setModaleOuverte(true);
  }

  function handleSaved() {
    setModaleOuverte(false);
    setToast({ message: termeAModifier ? "Terme modifié." : "Terme créé.", tone: "succes" });
    setRefreshCle((c) => c + 1);
  }

  async function confirmerSuppression() {
    if (!termeASupprimer) return;
    await supprimerTerme(termeASupprimer.id);
    setTermeASupprimer(null);
    setToast({ message: "Terme supprimé.", tone: "succes" });
    setRefreshCle((c) => c + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-fh-bleu">Glossaire</h2>
          <p className="text-sm text-fh-ardoise">Termes réutilisables affichables dans les cours.</p>
        </div>
        <button
          type="button"
          onClick={ouvrirCreation}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          + Ajouter un terme
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex max-w-md gap-2">
        <input
          type="search"
          placeholder="Rechercher un terme"
          value={rechercheSaisie}
          onChange={(event) => setRechercheSaisie(event.target.value)}
          className="w-full rounded-lg border border-fh-bleu-vif/20 bg-white px-4 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          Rechercher
        </button>
      </form>

      {chargement ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement du glossaire">
          {[0, 1, 2].map((cle) => (
            <div key={cle} className="h-20 animate-pulse rounded-2xl bg-fh-sable/50" />
          ))}
        </div>
      ) : erreur ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>
      ) : !data || data.results.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            📖
          </span>
          <p className="text-sm text-fh-ardoise">Aucun terme. Ajoutez-en un.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.results.map((terme) => (
            <TermeRow key={terme.id} terme={terme} onModifier={ouvrirEdition} onSupprimer={setTermeASupprimer} />
          ))}
        </div>
      )}

      {data && (data.next || data.previous) && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={!data.previous}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu disabled:cursor-not-allowed disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-sm text-fh-ardoise">{data.count} terme(s)</span>
          <button
            type="button"
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

      {modaleOuverte && (
        <TermeFormModal terme={termeAModifier} onSaved={handleSaved} onClose={() => setModaleOuverte(false)} />
      )}

      {termeASupprimer && (
        <DeleteConfirmModal
          titre="Confirmer la suppression"
          question={`Supprimer le terme « ${termeASupprimer.terme} » ? Les [[${termeASupprimer.slug}]] déjà écrits dans des cours ne seront plus cliquables (l'élève verra un texte simple). Cette action est irréversible.`}
          onConfirm={confirmerSuppression}
          onClose={() => setTermeASupprimer(null)}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
