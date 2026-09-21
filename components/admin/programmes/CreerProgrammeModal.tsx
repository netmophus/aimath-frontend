"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { listerMatieres, listerNiveaux, listerSeries, type Matiere, type Niveau, type Serie } from "@/lib/structureApi";
import { creerProgramme, type ProgrammeListe } from "@/lib/programmeApi";
import Modal from "@/components/admin/Modal";

interface CreerProgrammeModalProps {
  onCreated: (programme: ProgrammeListe) => void;
  onClose: () => void;
}

/**
 * Modale de création dédiée (pas EntityFormModal) : le select "série" dépend
 * du niveau choisi DANS le formulaire, ce que le formulaire générique ne
 * gère pas (ses options sont figées à l'ouverture par le parent).
 */
export default function CreerProgrammeModal({ onCreated, onClose }: CreerProgrammeModalProps) {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [chargementReferentiel, setChargementReferentiel] = useState(true);
  const [erreurReferentiel, setErreurReferentiel] = useState<string | null>(null);

  const [matiereId, setMatiereId] = useState("");
  const [niveauId, setNiveauId] = useState("");
  const [serieId, setSerieId] = useState("");

  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargementReferentiel(true);
      setErreurReferentiel(null);
      try {
        const [dataMatieres, dataNiveaux, dataSeries] = await Promise.all([
          listerMatieres(),
          listerNiveaux(),
          listerSeries(),
        ]);
        if (actif) {
          setMatieres(dataMatieres.results);
          setNiveaux(dataNiveaux.results);
          setSeries(dataSeries.results);
        }
      } catch (error) {
        if (actif) {
          setErreurReferentiel(
            error instanceof ApiError ? error.message : "Impossible de charger matières/niveaux/séries."
          );
        }
      } finally {
        if (actif) setChargementReferentiel(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, []);

  const seriesDuNiveau = series.filter((s) => String(s.niveau.id) === niveauId);

  function handleChangerNiveau(valeur: string) {
    setNiveauId(valeur);
    setSerieId(""); // la série choisie peut ne plus appartenir au nouveau niveau
  }

  async function handleSubmit() {
    if (!matiereId || !niveauId) return;
    setErreur(null);
    setEnvoiEnCours(true);
    try {
      const programme = await creerProgramme({
        matiere: Number(matiereId),
        niveau: Number(niveauId),
        serie: serieId ? Number(serieId) : null,
      });
      onCreated(programme);
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Impossible de créer ce programme.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Modal titre="Créer un programme" onClose={onClose}>
      {chargementReferentiel ? (
        <p className="text-sm text-fh-ardoise">Chargement…</p>
      ) : erreurReferentiel ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreurReferentiel}</p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="matiere" className="mb-1 block text-sm font-medium text-fh-ardoise">
              Matière
            </label>
            <select
              id="matiere"
              required
              value={matiereId}
              onChange={(event) => setMatiereId(event.target.value)}
              className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            >
              <option value="" disabled>
                Choisir…
              </option>
              {matieres.map((matiere) => (
                <option key={matiere.id} value={matiere.id}>
                  {matiere.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="niveau" className="mb-1 block text-sm font-medium text-fh-ardoise">
              Niveau
            </label>
            <select
              id="niveau"
              required
              value={niveauId}
              onChange={(event) => handleChangerNiveau(event.target.value)}
              className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            >
              <option value="" disabled>
                Choisir…
              </option>
              {niveaux.map((niveau) => (
                <option key={niveau.id} value={niveau.id}>
                  {niveau.nom}
                </option>
              ))}
            </select>
          </div>

          {niveauId && seriesDuNiveau.length > 0 && (
            <div>
              <label htmlFor="serie" className="mb-1 block text-sm font-medium text-fh-ardoise">
                Série (optionnel)
              </label>
              <select
                id="serie"
                value={serieId}
                onChange={(event) => setSerieId(event.target.value)}
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              >
                <option value="">Toutes séries (commun)</option>
                {seriesDuNiveau.map((serie) => (
                  <option key={serie.id} value={serie.id}>
                    {serie.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {erreur && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={envoiEnCours || !matiereId || !niveauId}
              className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
            >
              {envoiEnCours ? "Création…" : "Créer"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
