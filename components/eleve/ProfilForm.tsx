"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  getProfilEleve,
  majProfilEleve,
  type GenreEleve,
  type ProfilEleve,
} from "@/lib/eleveApi";

const LIBELLES_GENRE: Record<GenreEleve, string> = {
  F: "Féminin",
  M: "Masculin",
  autre: "Autre",
};

function initiales(prenom: string, nom: string): string {
  const p = prenom.trim().charAt(0);
  const n = nom.trim().charAt(0);
  return `${p}${n}`.toUpperCase() || "?";
}

const CHAMP_CLASSNAME =
  "w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20";
const LABEL_CLASSNAME = "mb-1 block text-sm font-medium text-fh-ardoise";

/**
 * Formulaire de profil élève : champs personnels modifiables (date de
 * naissance, école, ville, genre, photo) au-dessus des infos en lecture
 * seule (nom, téléphone, classe — gérées ailleurs : inscription, admin).
 * Charge le profil complet via GET /api/eleve/profil/ au montage plutôt que
 * de se fier au cache de useAuth() (qui ne connaît pas ces nouveaux champs).
 */
export default function ProfilForm() {
  const { updateUser } = useAuth();
  const [profil, setProfil] = useState<ProfilEleve | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);

  const [dateNaissance, setDateNaissance] = useState("");
  const [ecole, setEcole] = useState("");
  const [ville, setVille] = useState("");
  const [genre, setGenre] = useState<GenreEleve | "">("");

  const [photoFichier, setPhotoFichier] = useState<File | null>(null);
  const inputPhotoRef = useRef<HTMLInputElement>(null);

  // Aperçu local de la nouvelle photo avant envoi (dérivé, pas un state
  // synchronisé par effet) — l'URL objet créée est libérée dès que le
  // fichier change ou que le composant se démonte.
  const photoApercu = useMemo(
    () => (photoFichier ? URL.createObjectURL(photoFichier) : null),
    [photoFichier]
  );
  useEffect(() => {
    return () => {
      if (photoApercu) URL.revokeObjectURL(photoApercu);
    };
  }, [photoApercu]);

  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [erreurEnregistrement, setErreurEnregistrement] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreurChargement(null);
      try {
        const data = await getProfilEleve();
        if (!actif) return;
        setProfil(data);
        setDateNaissance(data.date_naissance ?? "");
        setEcole(data.ecole ?? "");
        setVille(data.ville ?? "");
        setGenre(data.genre ?? "");
      } catch (error) {
        if (actif) {
          setErreurChargement(
            error instanceof ApiError ? error.message : "Impossible de charger ton profil."
          );
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, []);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setPhotoFichier(event.target.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreurEnregistrement(null);
    setSucces(false);
    setEnregistrementEnCours(true);

    try {
      const data = await majProfilEleve({
        date_naissance: dateNaissance,
        ecole,
        ville,
        genre,
        photo: photoFichier ?? undefined,
      });
      setProfil(data);
      setPhotoFichier(null);
      if (inputPhotoRef.current) inputPhotoRef.current.value = "";
      setSucces(true);
      // Reflète immédiatement la nouvelle photo dans l'avatar de l'en-tête
      // (useAuth()), sans attendre un rechargement de page.
      updateUser({ photoUrl: data.photo_url });
    } catch (error) {
      setErreurEnregistrement(
        error instanceof ApiError ? error.message : "Impossible d'enregistrer ton profil."
      );
    } finally {
      setEnregistrementEnCours(false);
    }
  }

  if (chargement) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/eleve" className="text-sm font-medium text-fh-bleu hover:underline">
          ← Retour
        </Link>
        <div className="h-64 animate-pulse rounded-2xl bg-fh-sable/50" aria-busy="true" aria-label="Chargement" />
      </div>
    );
  }

  if (erreurChargement || !profil) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/eleve" className="text-sm font-medium text-fh-bleu hover:underline">
          ← Retour
        </Link>
        <p role="alert" className="rounded-lg bg-fh-orange/10 px-3 py-2 text-sm text-fh-orange-fonce">
          {erreurChargement ?? "Impossible de charger ton profil."}
        </p>
      </div>
    );
  }

  const classe = profil.serie ? `${profil.niveau} ${profil.serie}` : profil.niveau;
  const photoAffichee = photoApercu ?? profil.photo_url;

  return (
    <div className="flex flex-col gap-4">
      <Link href="/eleve" className="text-sm font-medium text-fh-bleu hover:underline">
        ← Retour
      </Link>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-fh-sable sm:p-6">
        <h1 className="mb-5 text-lg font-bold text-fh-bleu">Mon profil</h1>

        {/* Infos en lecture seule */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-fh-orange">
            {photoAffichee ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) et URL Cloudinary externe, next/image n'apporte rien ici.
              <img src={photoAffichee} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                {initiales(profil.prenom, profil.nom)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-fh-bleu">
              {profil.prenom} {profil.nom}
            </p>
            <p className="truncate text-sm text-fh-ardoise">{profil.telephone}</p>
            {classe && <p className="truncate text-sm text-fh-ardoise/70">{classe}</p>}
          </div>
        </div>

        {succes && (
          <p role="status" className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Profil mis à jour.
          </p>
        )}
        {erreurEnregistrement && (
          <p role="alert" className="mb-4 rounded-lg bg-fh-orange/10 px-3 py-2 text-sm text-fh-orange-fonce">
            {erreurEnregistrement}
          </p>
        )}

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="photo" className={LABEL_CLASSNAME}>
              Photo de profil
            </label>
            <input
              id="photo"
              ref={inputPhotoRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-fh-ardoise file:mr-3 file:rounded-full file:border-0 file:bg-fh-orange file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-fh-orange-fonce"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dateNaissance" className={LABEL_CLASSNAME}>
                Date de naissance
              </label>
              <input
                id="dateNaissance"
                type="date"
                value={dateNaissance}
                onChange={(event) => setDateNaissance(event.target.value)}
                className={CHAMP_CLASSNAME}
              />
            </div>

            <div>
              <label htmlFor="genre" className={LABEL_CLASSNAME}>
                Genre
              </label>
              <select
                id="genre"
                value={genre}
                onChange={(event) => setGenre(event.target.value as GenreEleve | "")}
                className={CHAMP_CLASSNAME}
              >
                <option value="">Préfère ne pas dire</option>
                {(Object.keys(LIBELLES_GENRE) as GenreEleve[]).map((valeur) => (
                  <option key={valeur} value={valeur}>
                    {LIBELLES_GENRE[valeur]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ecole" className={LABEL_CLASSNAME}>
              Établissement scolaire
            </label>
            <input
              id="ecole"
              type="text"
              value={ecole}
              onChange={(event) => setEcole(event.target.value)}
              placeholder="Ex. Lycée Kassaï"
              className={CHAMP_CLASSNAME}
            />
          </div>

          <div>
            <label htmlFor="ville" className={LABEL_CLASSNAME}>
              Ville
            </label>
            <input
              id="ville"
              type="text"
              value={ville}
              onChange={(event) => setVille(event.target.value)}
              placeholder="Ex. Niamey"
              className={CHAMP_CLASSNAME}
            />
          </div>

          <button
            type="submit"
            disabled={enregistrementEnCours}
            className="mt-2 rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enregistrementEnCours ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
