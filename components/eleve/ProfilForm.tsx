"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBooks,
  IconBuildingCommunity,
  IconCalendar,
  IconCamera,
  IconCertificate,
  IconCircleCheck,
  IconDeviceFloppy,
  IconGenderBigender,
  IconLock,
  IconMapPin,
  IconPhone,
  IconSchool,
} from "@tabler/icons-react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getProfilEleve, majProfilEleve, type GenreEleve, type ProfilEleve } from "@/lib/eleveApi";
import { aDesModifications, champsModifies, classeDe, initiales } from "@/lib/profil";

const LIBELLES_GENRE: Record<GenreEleve, string> = {
  F: "Féminin",
  M: "Masculin",
  autre: "Autre",
};

const CARTE = "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-blue-100 sm:p-6";
const LABEL = "block text-lg font-extrabold text-[#102A66]";
const CHAMP =
  "min-h-12 w-full rounded-2xl border-2 border-blue-200 bg-white px-4 text-base text-[#102A66] outline-none transition-shadow placeholder:text-slate-500 focus:border-[#1D4ED8] focus:ring-4 focus:ring-[#1D4ED8]/15";
const RETOUR =
  "inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-[#102A66] px-5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]";
const BOUTON_PHOTO =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#C2410C] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] sm:w-fit";

function Pastille({ couleur, children }: { couleur: string; children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: couleur }}
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
    >
      {children}
    </span>
  );
}

function BoutonRetour() {
  return (
    <Link href="/eleve" className={RETOUR}>
      <IconArrowLeft size={22} stroke={2.25} aria-hidden="true" />
      Retour
    </Link>
  );
}

function Entete() {
  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="text-3xl font-extrabold leading-tight text-[#102A66] sm:text-4xl">Mon profil</h1>
      {/* Illustration discrète : chapeau de diplômé et livres (masquée sur mobile). */}
      <div aria-hidden="true" className="hidden shrink-0 items-end gap-2 sm:flex">
        <IconSchool size={72} stroke={1.5} className="text-[#7C3AED]" />
        <IconBooks size={52} stroke={1.5} className="mb-1 text-[#1D4ED8]" />
      </div>
    </header>
  );
}

/**
 * Profil de l'élève. Champs réellement pris en charge par GET/PATCH /api/eleve/profil/ : date de naissance, genre, ville,
 * établissement (champ `ecole`), photo. Nom, téléphone et classe sont en lecture seule (inscription, administration).
 * Seuls les champs MODIFIÉS sont envoyés (voir lib/profil.ts) ; un seul enregistrement à la fois.
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

  // Aperçu local de la nouvelle photo avant envoi ; l'URL objet est libérée dès que le fichier change ou au démontage.
  const photoApercu = useMemo(() => (photoFichier ? URL.createObjectURL(photoFichier) : null), [photoFichier]);
  useEffect(() => {
    return () => {
      if (photoApercu) URL.revokeObjectURL(photoApercu);
    };
  }, [photoApercu]);

  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const verrou = useRef(false);
  const [erreurEnregistrement, setErreurEnregistrement] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  function appliquer(data: ProfilEleve) {
    setProfil(data);
    setDateNaissance(data.date_naissance ?? "");
    setEcole(data.ecole ?? "");
    setVille(data.ville ?? "");
    setGenre(data.genre ?? "");
  }

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreurChargement(null);
      try {
        const data = await getProfilEleve();
        if (actif) appliquer(data);
      } catch (error) {
        if (actif) {
          setErreurChargement(error instanceof ApiError ? error.message : "Impossible de charger ton profil.");
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
    setSucces(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (verrou.current || !profil) return;
    setErreurEnregistrement(null);
    setSucces(null);

    const modifs = champsModifies(profil, { dateNaissance, ecole, ville, genre }, photoFichier);
    if (!aDesModifications(modifs)) {
      setSucces("Rien à modifier.");
      return;
    }

    verrou.current = true;
    setEnregistrementEnCours(true);
    try {
      const data = await majProfilEleve(modifs);
      appliquer(data);
      setPhotoFichier(null);
      if (inputPhotoRef.current) inputPhotoRef.current.value = "";
      setSucces("Profil mis à jour.");
      // Reflète immédiatement la nouvelle photo dans l'avatar de l'en-tête, sans rechargement.
      updateUser({ photoUrl: data.photo_url });
    } catch (error) {
      setErreurEnregistrement(error instanceof ApiError ? error.message : "Impossible d'enregistrer ton profil.");
    } finally {
      verrou.current = false;
      setEnregistrementEnCours(false);
    }
  }

  if (chargement) {
    return (
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
        <BoutonRetour />
        <div className="h-12 w-48 animate-pulse rounded-xl bg-fh-sable/50" aria-hidden="true" />
        <div className="h-64 animate-pulse rounded-3xl bg-fh-sable/50" aria-busy="true" aria-label="Chargement" />
      </div>
    );
  }

  if (erreurChargement || !profil) {
    return (
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
        <BoutonRetour />
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-base text-red-700 ring-1 ring-red-200">
          {erreurChargement ?? "Impossible de charger ton profil."}
        </p>
      </div>
    );
  }

  const classe = classeDe(profil);
  const photoAffichee = photoApercu ?? profil.photo_url;
  const nomComplet = `${profil.prenom} ${profil.nom}`.trim();

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
      <BoutonRetour />
      <Entete />

      <div className="flex flex-col gap-4 rounded-[32px] bg-[#F8FAFF] p-3 ring-1 ring-blue-100 sm:p-5">
        {/* Carte d'identité : données réelles du compte */}
        <section
          aria-label="Identité"
          className="flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-blue-50 via-[#EEF2FF] to-violet-100 p-5 text-center ring-1 ring-blue-100 sm:flex-row sm:gap-8 sm:p-8 sm:text-left"
        >
          <div className="relative h-28 w-28 shrink-0 sm:h-36 sm:w-36">
            <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-[#C2410C] shadow-lg">
              {photoAffichee ? (
                // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) et URL Cloudinary externe, next/image n'apporte rien ici.
                <img src={photoAffichee} alt={`Photo de ${nomComplet}`} className="h-full w-full object-cover" />
              ) : (
                <span
                  role="img"
                  aria-label={`Avatar de ${nomComplet}`}
                  className="flex h-full w-full items-center justify-center text-4xl font-extrabold text-white sm:text-5xl"
                >
                  {initiales(profil.prenom, profil.nom)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => inputPhotoRef.current?.click()}
              aria-label="Choisir une photo"
              className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#C2410C] text-white shadow-md ring-4 ring-white transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
            >
              <IconCamera size={22} stroke={2} aria-hidden="true" />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-3 sm:items-start">
            <h2 className="max-w-full text-2xl font-extrabold leading-tight text-[#102A66] [overflow-wrap:anywhere] sm:text-3xl">
              {nomComplet}
            </h2>
            {profil.statut === "actif" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
                <IconCircleCheck size={18} aria-hidden="true" />
                Profil actif
              </span>
            )}
            <ul className="flex w-full min-w-0 flex-col gap-3">
              <li className="flex min-w-0 items-center justify-center gap-3 sm:justify-start">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1D4ED8] text-white">
                  <IconPhone size={24} stroke={1.9} />
                </span>
                <span className="min-w-0 text-lg font-bold text-[#102A66] [overflow-wrap:anywhere]">
                  <span className="sr-only">Téléphone : </span>
                  {profil.telephone}
                </span>
              </li>
              {classe && (
                <li className="flex min-w-0 items-center justify-center gap-3 sm:justify-start">
                  <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED] text-white">
                    <IconCertificate size={24} stroke={1.9} />
                  </span>
                  <span className="min-w-0 text-lg font-bold text-[#102A66] [overflow-wrap:anywhere]">
                    <span className="sr-only">Classe : </span>
                    {classe}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </section>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Photo de profil */}
            <section aria-labelledby="titre-photo" className={`${CARTE} flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center`}>
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Pastille couleur="#C2410C">
                  <IconCamera size={30} stroke={1.8} />
                </Pastille>
                <div className="min-w-0">
                  <h2 id="titre-photo" className="text-lg font-extrabold text-[#102A66]">
                    Photo de profil
                  </h2>
                  <p className="text-base text-slate-600">
                    {photoFichier ? "Photo prête. Enregistre pour l'appliquer." : "Personnalise ton profil."}
                  </p>
                </div>
              </div>
              <input
                id="photo"
                ref={inputPhotoRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                aria-label="Photo de profil"
                tabIndex={-1}
                className="sr-only"
              />
              <button type="button" onClick={() => inputPhotoRef.current?.click()} className={BOUTON_PHOTO}>
                <IconCamera size={22} aria-hidden="true" />
                Choisir une photo
              </button>
            </section>

            {/* Date de naissance */}
            <section className={CARTE}>
              <div className="mb-4 flex items-center gap-4">
                <Pastille couleur="#1D4ED8">
                  <IconCalendar size={30} stroke={1.8} />
                </Pastille>
                <label htmlFor="dateNaissance" className={LABEL}>
                  Date de naissance
                </label>
              </div>
              <input
                id="dateNaissance"
                type="date"
                lang="fr"
                value={dateNaissance}
                onChange={(event) => setDateNaissance(event.target.value)}
                className={CHAMP}
              />
            </section>

            {/* Genre */}
            <section className={CARTE}>
              <div className="mb-4 flex items-center gap-4">
                <Pastille couleur="#7C3AED">
                  <IconGenderBigender size={30} stroke={1.8} />
                </Pastille>
                <label htmlFor="genre" className={LABEL}>
                  Genre
                </label>
              </div>
              <select
                id="genre"
                value={genre}
                onChange={(event) => setGenre(event.target.value as GenreEleve | "")}
                className={CHAMP}
              >
                <option value="">Préfère ne pas dire</option>
                {(Object.keys(LIBELLES_GENRE) as GenreEleve[]).map((valeur) => (
                  <option key={valeur} value={valeur}>
                    {LIBELLES_GENRE[valeur]}
                  </option>
                ))}
              </select>
            </section>

            {/* Ville */}
            <section className={CARTE}>
              <div className="mb-4 flex items-center gap-4">
                <Pastille couleur="#047857">
                  <IconMapPin size={30} stroke={1.8} />
                </Pastille>
                <label htmlFor="ville" className={LABEL}>
                  Ville
                </label>
              </div>
              <input
                id="ville"
                type="text"
                value={ville}
                onChange={(event) => setVille(event.target.value)}
                placeholder="Ex. Niamey"
                autoComplete="address-level2"
                className={CHAMP}
              />
            </section>

            {/* Établissement (champ `ecole` du backend) */}
            <section className={CARTE}>
              <div className="mb-4 flex items-center gap-4">
                <Pastille couleur="#C2410C">
                  <IconBuildingCommunity size={30} stroke={1.8} />
                </Pastille>
                <label htmlFor="ecole" className={LABEL}>
                  Établissement
                </label>
              </div>
              <input
                id="ecole"
                type="text"
                value={ecole}
                onChange={(event) => setEcole(event.target.value)}
                placeholder="Ex. Lycée Kassaï"
                className={CHAMP}
              />
            </section>
          </div>

          {/* Mot de passe : bouton inactif. Le changement volontaire exige d'abord, côté backend, la saisie de l'ancien mot de passe. */}
          <section aria-labelledby="titre-mdp" className={`${CARTE} flex flex-col gap-4 sm:flex-row sm:items-center`}>
            <Pastille couleur="#102A66">
              <IconLock size={30} stroke={1.8} />
            </Pastille>
            <div className="min-w-0 flex-1">
              <h2 id="titre-mdp" className="text-lg font-extrabold text-[#102A66]">
                Mot de passe
              </h2>
              <p className="text-base text-slate-700">Bientôt disponible.</p>
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-slate-200 px-6 text-base font-bold text-slate-600 sm:w-fit"
            >
              Modifier
            </button>
          </section>

          {succes && (
            <p role="status" className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-base font-semibold text-green-800 ring-1 ring-green-200">
              <IconCircleCheck size={22} aria-hidden="true" className="shrink-0" />
              {succes}
            </p>
          )}
          {erreurEnregistrement && (
            <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700 ring-1 ring-red-200">
              {erreurEnregistrement}
            </p>
          )}

          <button
            type="submit"
            disabled={enregistrementEnCours}
            aria-busy={enregistrementEnCours}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#C2410C] px-8 text-xl font-extrabold text-white shadow-lg transition-[filter,box-shadow] hover:brightness-110 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            <IconDeviceFloppy size={26} aria-hidden="true" />
            {enregistrementEnCours ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
