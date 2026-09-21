"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import {
  depublierLecon,
  listerLecons,
  publierLecon,
  supprimerLecon,
  type LeconDetail,
  type LeconListe,
  type LeconStatut,
} from "@/lib/leconApi";
import { listerProgrammes, type ProgrammeListe } from "@/lib/programmeApi";
import CreerLeconModal from "@/components/admin/lecons/CreerLeconModal";
import LeconRow from "@/components/admin/lecons/LeconRow";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Toast from "@/components/admin/Toast";

const OPTIONS_STATUT: readonly { value: LeconStatut | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "brouillon", label: "Brouillon" },
  { value: "a_valider", label: "À valider" },
  { value: "publie", label: "Publié" },
];

interface ListePaginee {
  count: number;
  next: string | null;
  previous: string | null;
  results: LeconListe[];
}

export default function LeconsPage() {
  const router = useRouter();
  const [programmes, setProgrammes] = useState<ProgrammeListe[]>([]);
  const [statutFiltre, setStatutFiltre] = useState<LeconStatut | "">("");
  const [programmeFiltre, setProgrammeFiltre] = useState("");
  const [rechercheSaisie, setRechercheSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ListePaginee | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [refreshCle, setRefreshCle] = useState(0);
  const [idEnCours, setIdEnCours] = useState<number | null>(null);

  const [modaleCreation, setModaleCreation] = useState(false);
  const [leconASupprimer, setLeconASupprimer] = useState<LeconListe | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      try {
        const data = await listerProgrammes();
        if (actif) setProgrammes(data.results);
      } catch {
        // Filtre secondaire : une panne ici ne doit pas bloquer la liste des leçons.
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, []);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const resultat = await listerLecons({
          statut: statutFiltre || undefined,
          programme: programmeFiltre ? Number(programmeFiltre) : undefined,
          search: recherche || undefined,
          page,
        });
        if (actif) setData(resultat);
      } catch (error) {
        if (actif) {
          setErreur(error instanceof ApiError ? error.message : "Impossible de charger les leçons.");
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [statutFiltre, programmeFiltre, recherche, page, refreshCle]);

  function reinitialiserPage() {
    setPage(1);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reinitialiserPage();
    setRecherche(rechercheSaisie.trim());
  }

  function handleCreated(lecon: LeconDetail) {
    setModaleCreation(false);
    setToast({ message: "Leçon créée.", tone: "succes" });
    // Redirection plutôt que rafraîchissement sur place : on vient de créer
    // la leçon pour l'éditer tout de suite (éditeur complet en étape 2).
    router.push(`/admin/lecons/${lecon.id}`);
  }

  async function handlePublier(id: number) {
    setIdEnCours(id);
    try {
      await publierLecon(id);
      setToast({ message: "Leçon publiée.", tone: "succes" });
      setRefreshCle((c) => c + 1);
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : "Action impossible.", tone: "erreur" });
    } finally {
      setIdEnCours(null);
    }
  }

  async function handleDepublier(id: number) {
    setIdEnCours(id);
    try {
      await depublierLecon(id);
      setToast({ message: "Leçon repassée en brouillon.", tone: "succes" });
      setRefreshCle((c) => c + 1);
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : "Action impossible.", tone: "erreur" });
    } finally {
      setIdEnCours(null);
    }
  }

  async function confirmerSuppression() {
    if (!leconASupprimer) return;
    await supprimerLecon(leconASupprimer.id);
    setLeconASupprimer(null);
    setToast({ message: "Leçon supprimée.", tone: "succes" });
    setRefreshCle((c) => c + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-fh-bleu">Leçons</h2>
          <p className="text-sm text-fh-ardoise">Le contenu pédagogique rédigé pour chaque notion du programme.</p>
        </div>
        <button
          type="button"
          onClick={() => setModaleCreation(true)}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          + Créer une leçon
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={statutFiltre}
          onChange={(event) => {
            setStatutFiltre(event.target.value as LeconStatut | "");
            reinitialiserPage();
          }}
          className="rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        >
          {OPTIONS_STATUT.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={programmeFiltre}
          onChange={(event) => {
            setProgrammeFiltre(event.target.value);
            reinitialiserPage();
          }}
          className="rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        >
          <option value="">Tous les programmes</option>
          {programmes.map((programme) => (
            <option key={programme.id} value={programme.id}>
              {programme.libelle}
            </option>
          ))}
        </select>

        <form onSubmit={handleSearchSubmit} className="flex min-w-[220px] flex-1 gap-2">
          <input
            type="search"
            placeholder="Rechercher (titre)"
            value={rechercheSaisie}
            onChange={(event) => setRechercheSaisie(event.target.value)}
            className="w-full min-w-[180px] rounded-lg border border-fh-bleu-vif/20 bg-white px-4 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
          >
            Rechercher
          </button>
        </form>
      </div>

      {chargement ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des leçons">
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
          <p className="text-sm text-fh-ardoise">Aucune leçon. Créez-en une à partir d&apos;une notion du programme.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.results.map((lecon) => (
            <LeconRow
              key={lecon.id}
              lecon={lecon}
              enCours={idEnCours === lecon.id}
              onPublier={handlePublier}
              onDepublier={handleDepublier}
              onSupprimer={setLeconASupprimer}
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
          <span className="text-sm text-fh-ardoise">{data.count} leçon(s)</span>
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

      {modaleCreation && <CreerLeconModal onCreated={handleCreated} onClose={() => setModaleCreation(false)} />}

      {leconASupprimer && (
        <DeleteConfirmModal
          titre="Confirmer la suppression"
          question={`Supprimer la leçon « ${leconASupprimer.titre} » ? Cette action est irréversible.`}
          onConfirm={confirmerSuppression}
          onClose={() => setLeconASupprimer(null)}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
