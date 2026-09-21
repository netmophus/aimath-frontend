"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { creerLecon, type LeconDetail } from "@/lib/leconApi";
import { getProgramme, listerProgrammes, type ProgrammeDetail, type ProgrammeListe } from "@/lib/programmeApi";
import Modal from "@/components/admin/Modal";

interface CreerLeconModalProps {
  onCreated: (lecon: LeconDetail) => void;
  onClose: () => void;
}

/**
 * Modale de création dédiée (pas EntityFormModal) : le choix de la notion se
 * fait par une cascade programme → thème → chapitre → notion, chaque niveau
 * dépendant du précédent — au-delà de ce que le formulaire générique gère.
 */
export default function CreerLeconModal({ onCreated, onClose }: CreerLeconModalProps) {
  const [programmes, setProgrammes] = useState<ProgrammeListe[]>([]);
  const [chargementProgrammes, setChargementProgrammes] = useState(true);
  const [erreurProgrammes, setErreurProgrammes] = useState<string | null>(null);

  const [programmeId, setProgrammeId] = useState("");
  const [programmeDetail, setProgrammeDetail] = useState<ProgrammeDetail | null>(null);
  const [chargementDetail, setChargementDetail] = useState(false);
  const [erreurDetail, setErreurDetail] = useState<string | null>(null);

  const [themeId, setThemeId] = useState("");
  const [chapitreId, setChapitreId] = useState("");
  const [notionId, setNotionId] = useState("");
  const [titre, setTitre] = useState("");

  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargementProgrammes(true);
      setErreurProgrammes(null);
      try {
        const data = await listerProgrammes();
        if (actif) setProgrammes(data.results);
      } catch (error) {
        if (actif) {
          setErreurProgrammes(error instanceof ApiError ? error.message : "Impossible de charger les programmes.");
        }
      } finally {
        if (actif) setChargementProgrammes(false);
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
      if (!programmeId) {
        setProgrammeDetail(null);
        return;
      }
      setChargementDetail(true);
      setErreurDetail(null);
      try {
        const data = await getProgramme(Number(programmeId));
        if (actif) setProgrammeDetail(data);
      } catch (error) {
        if (actif) {
          setErreurDetail(error instanceof ApiError ? error.message : "Impossible de charger ce programme.");
        }
      } finally {
        if (actif) setChargementDetail(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [programmeId]);

  function handleChangerProgramme(valeur: string) {
    setProgrammeId(valeur);
    setThemeId("");
    setChapitreId("");
    setNotionId("");
    setTitre("");
  }

  function handleChangerTheme(valeur: string) {
    setThemeId(valeur);
    setChapitreId("");
    setNotionId("");
    setTitre("");
  }

  function handleChangerChapitre(valeur: string) {
    setChapitreId(valeur);
    setNotionId("");
    setTitre("");
  }

  function handleChangerNotion(valeur: string) {
    setNotionId(valeur);
    const notion = chapitreChoisi?.notions.find((n) => String(n.id) === valeur);
    setTitre(notion ? notion.titre : "");
  }

  const themeChoisi = programmeDetail?.themes.find((t) => String(t.id) === themeId) ?? null;
  const chapitreChoisi = themeChoisi?.chapitres.find((c) => String(c.id) === chapitreId) ?? null;

  async function handleSubmit() {
    if (!notionId || !titre.trim()) return;
    setErreur(null);
    setEnvoiEnCours(true);
    try {
      const lecon = await creerLecon({ notion: Number(notionId), titre: titre.trim() });
      onCreated(lecon);
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Impossible de créer cette leçon.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Modal titre="Créer une leçon" onClose={onClose}>
      {chargementProgrammes ? (
        <p className="text-sm text-fh-ardoise">Chargement…</p>
      ) : erreurProgrammes ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreurProgrammes}</p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="programme" className="mb-1 block text-sm font-medium text-fh-ardoise">
              Programme
            </label>
            <select
              id="programme"
              required
              value={programmeId}
              onChange={(event) => handleChangerProgramme(event.target.value)}
              className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            >
              <option value="" disabled>
                Choisir…
              </option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.libelle}
                </option>
              ))}
            </select>
          </div>

          {chargementDetail && <p className="text-sm text-fh-ardoise">Chargement du programme…</p>}
          {erreurDetail && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreurDetail}</p>}

          {programmeDetail && (
            <div>
              <label htmlFor="theme" className="mb-1 block text-sm font-medium text-fh-ardoise">
                Thème
              </label>
              <select
                id="theme"
                required
                value={themeId}
                onChange={(event) => handleChangerTheme(event.target.value)}
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              >
                <option value="" disabled>
                  Choisir…
                </option>
                {programmeDetail.themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.titre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {themeChoisi && (
            <div>
              <label htmlFor="chapitre" className="mb-1 block text-sm font-medium text-fh-ardoise">
                Chapitre
              </label>
              <select
                id="chapitre"
                required
                value={chapitreId}
                onChange={(event) => handleChangerChapitre(event.target.value)}
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              >
                <option value="" disabled>
                  Choisir…
                </option>
                {themeChoisi.chapitres.map((chapitre) => (
                  <option key={chapitre.id} value={chapitre.id}>
                    {chapitre.titre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {chapitreChoisi && (
            <div>
              <label htmlFor="notion" className="mb-1 block text-sm font-medium text-fh-ardoise">
                Notion
              </label>
              <select
                id="notion"
                required
                value={notionId}
                onChange={(event) => handleChangerNotion(event.target.value)}
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              >
                <option value="" disabled>
                  Choisir…
                </option>
                {chapitreChoisi.notions.map((notion) => (
                  <option key={notion.id} value={notion.id} disabled={notion.a_lecon}>
                    {notion.titre}
                    {notion.a_lecon ? " (a déjà une leçon)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {notionId && (
            <div>
              <label htmlFor="titre" className="mb-1 block text-sm font-medium text-fh-ardoise">
                Titre de la leçon
              </label>
              <input
                id="titre"
                type="text"
                required
                value={titre}
                onChange={(event) => setTitre(event.target.value)}
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              />
            </div>
          )}

          {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

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
              disabled={envoiEnCours || !notionId || !titre.trim()}
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
