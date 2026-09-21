"use client";

import { useState, type FormEvent } from "react";

import type { Statut } from "@/lib/api";
import { useGestionComptes } from "@/lib/useGestionComptes";
import CompteRow from "@/components/admin/CompteRow";
import RejeterModal from "@/components/admin/RejeterModal";
import Toast from "@/components/admin/Toast";

interface Onglet {
  value: Statut;
  label: string;
}

const ONGLETS: readonly Onglet[] = [
  { value: "en_attente", label: "En attente" },
  { value: "actif", label: "Actifs" },
  { value: "rejete", label: "Rejetés" },
  { value: "suspendu", label: "Suspendus" },
];

const MESSAGES_VIDE: Record<Statut, string> = {
  en_attente: "Aucun compte en attente.",
  actif: "Aucun compte actif pour l'instant.",
  rejete: "Aucun compte rejeté.",
  suspendu: "Aucun compte suspendu.",
};

export default function ValidationsPage() {
  const [statutFiltre, setStatutFiltre] = useState<Statut>("en_attente");
  const [rechercheSaisie, setRechercheSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);

  const {
    data,
    chargement,
    erreur,
    idEnCours,
    compteARejeter,
    demanderRejet,
    annulerRejet,
    toast,
    fermerToast,
    approuver,
    confirmerRejet,
    suspendre,
  } = useGestionComptes({ statut: statutFiltre, search: recherche || undefined }, page);

  function changerOnglet(statut: Statut) {
    setStatutFiltre(statut);
    setPage(1);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setRecherche(rechercheSaisie.trim());
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-fh-bleu">Comptes à valider</h2>
        <p className="text-sm text-fh-ardoise">
          Approuve, rejette ou suspends les comptes selon leur statut.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ONGLETS.map((onglet) => (
          <button
            key={onglet.value}
            type="button"
            onClick={() => changerOnglet(onglet.value)}
            aria-pressed={statutFiltre === onglet.value}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              statutFiltre === onglet.value
                ? "bg-fh-orange text-white"
                : "bg-white text-fh-ardoise ring-1 ring-fh-sable hover:bg-fh-sable/40"
            }`}
          >
            {onglet.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Rechercher (nom, prénom, téléphone)"
          value={rechercheSaisie}
          onChange={(event) => setRechercheSaisie(event.target.value)}
          className="w-full max-w-sm rounded-lg border border-fh-bleu-vif/20 bg-white px-4 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        />
        <button
          type="submit"
          className="rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          Rechercher
        </button>
      </form>

      {chargement ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des comptes">
          {[0, 1, 2].map((cle) => (
            <div key={cle} className="h-20 animate-pulse rounded-2xl bg-fh-sable/50" />
          ))}
        </div>
      ) : erreur ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>
      ) : !data || data.results.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            📭
          </span>
          <p className="text-sm text-fh-ardoise">{MESSAGES_VIDE[statutFiltre]}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.results.map((compte) => (
            <CompteRow
              key={compte.id}
              compte={compte}
              enCours={idEnCours === compte.id}
              onApprouver={approuver}
              onDemanderRejet={demanderRejet}
              onSuspendre={suspendre}
            />
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
          <span className="text-sm text-fh-ardoise">{data.count} compte(s)</span>
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

      {compteARejeter && (
        <RejeterModal
          compte={compteARejeter}
          enCours={idEnCours === compteARejeter.id}
          onConfirm={confirmerRejet}
          onClose={annulerRejet}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={fermerToast} />}
    </div>
  );
}
