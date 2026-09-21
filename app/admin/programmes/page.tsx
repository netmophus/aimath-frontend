"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import { listerProgrammes, supprimerProgramme, type ProgrammeListe } from "@/lib/programmeApi";
import CreerProgrammeModal from "@/components/admin/programmes/CreerProgrammeModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Toast from "@/components/admin/Toast";

export default function ProgrammesPage() {
  const router = useRouter();

  const [programmes, setProgrammes] = useState<ProgrammeListe[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [refreshCle, setRefreshCle] = useState(0);

  const [modaleCreation, setModaleCreation] = useState(false);
  const [programmeASupprimer, setProgrammeASupprimer] = useState<ProgrammeListe | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const data = await listerProgrammes();
        if (actif) setProgrammes(data.results);
      } catch (error) {
        if (actif) {
          setErreur(error instanceof ApiError ? error.message : "Impossible de charger les programmes.");
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [refreshCle]);

  function handleCreated(programme: ProgrammeListe) {
    setModaleCreation(false);
    setToast({ message: "Programme créé.", tone: "succes" });
    router.push(`/admin/programmes/${programme.id}`);
  }

  async function confirmerSuppression() {
    if (!programmeASupprimer) return;
    await supprimerProgramme(programmeASupprimer.id);
    setProgrammeASupprimer(null);
    setToast({ message: "Programme supprimé.", tone: "succes" });
    setRefreshCle((c) => c + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-fh-bleu">Programmes</h2>
          <p className="text-sm text-fh-ardoise">
            Le programme officiel de chaque matière, organisé en thèmes, chapitres et notions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModaleCreation(true)}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          + Créer un programme
        </button>
      </div>

      {chargement ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Chargement des programmes"
        >
          {[0, 1, 2].map((cle) => (
            <div key={cle} className="h-32 animate-pulse rounded-2xl bg-fh-sable/50" />
          ))}
        </div>
      ) : erreur ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>
      ) : programmes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            📚
          </span>
          <p className="text-sm text-fh-ardoise">Aucun programme. Crée le premier programme.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programmes.map((programme) => (
            <div
              key={programme.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/admin/programmes/${programme.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter") router.push(`/admin/programmes/${programme.id}`);
              }}
              className="flex cursor-pointer flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-fh-sable transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-fh-bleu">{programme.libelle}</h3>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setProgrammeASupprimer(programme);
                  }}
                  aria-label={`Supprimer « ${programme.libelle} »`}
                  className="shrink-0 rounded-full p-1 text-fh-ardoise/60 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  🗑
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-fh-bleu">
                <span className="rounded-full bg-fh-accent/50 px-2 py-1">{programme.nb_themes} thème(s)</span>
                <span className="rounded-full bg-fh-accent/50 px-2 py-1">{programme.nb_chapitres} chapitre(s)</span>
                <span className="rounded-full bg-fh-accent/50 px-2 py-1">{programme.nb_notions} notion(s)</span>
                <span className="rounded-full bg-fh-sable/60 px-2 py-1">{programme.nb_lecons} leçon(s)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modaleCreation && (
        <CreerProgrammeModal onCreated={handleCreated} onClose={() => setModaleCreation(false)} />
      )}

      {programmeASupprimer && (
        <DeleteConfirmModal
          titre="Confirmer la suppression"
          question={`Supprimer « ${programmeASupprimer.libelle} » ? Cette action est irréversible.`}
          onConfirm={confirmerSuppression}
          onClose={() => setProgrammeASupprimer(null)}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
