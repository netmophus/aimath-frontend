"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import Link from "next/link";
import { IconLock, IconUser, IconUserPlus } from "@tabler/icons-react";
import {
  ApiError,
  getClasses,
  inscrireEleve,
  type ClasseCycle,
  type ClasseNiveau,
} from "@/lib/api";
import ChampMotDePasse from "@/components/auth/ChampMotDePasse";
import ChampTelephone from "@/components/auth/ChampTelephone";
import {
  erreursDepuisApi,
  validerInscription,
  type ErreursInscription as FormErrors,
} from "@/lib/authFormulaires";
import { niveauNeedsSerie } from "@/lib/classes";
import { construireTelephone } from "@/lib/telephone";

interface Recap {
  cycleLabel: string;
  niveauLabel: string;
  serieLabel?: string;
  /** Message renvoyé par l'API (voir InscriptionEleveView), affiché tel quel
   * plutôt qu'un texte figé côté client. */
  message: string;
}

const LABEL = "mb-2 block text-base font-bold text-[#102A66]";
const CHAMP =
  "min-h-[52px] w-full rounded-xl border border-[#C7D2E5] bg-white px-4 text-base text-[#102A66] outline-none transition-shadow placeholder:text-[#94A3B8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#64748B]";
const ERREUR = "mt-1.5 text-sm font-medium text-[#B03A10]";
const AIDE = "mt-1.5 text-sm text-[#475A7A]";

/** Champ texte avec petite icône décorative à gauche (même look que les champs téléphone et mot de passe). */
function ChampTexte({
  id,
  valeur,
  onChange,
  autoComplete,
  placeholder,
  erreur,
  icone,
}: {
  id: string;
  valeur: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder: string;
  erreur?: string;
  icone: ReactNode;
}) {
  return (
    <div
      className={`flex w-full items-center overflow-hidden rounded-xl border bg-white transition-shadow focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/20 ${
        erreur ? "border-red-400" : "border-[#C7D2E5]"
      }`}
    >
      <span aria-hidden="true" className="flex shrink-0 items-center pl-4 text-[#64748B]">
        {icone}
      </span>
      <input
        id={id}
        type="text"
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={valeur}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(erreur)}
        aria-describedby={erreur ? `${id}-error` : undefined}
        className="min-h-[52px] min-w-0 flex-1 bg-transparent pl-3 pr-4 text-base text-[#102A66] outline-none placeholder:text-[#94A3B8]"
      />
    </div>
  );
}

export default function RegisterForm() {
  const [cycles, setCycles] = useState<ClasseCycle[]>([]);
  const [chargementClasses, setChargementClasses] = useState(true);
  const [erreurClasses, setErreurClasses] = useState<string | null>(null);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  // Numéro NATIONAL saisi ; l'indicatif +227 est affiché à part (fixe).
  const [telephone, setTelephone] = useState("");
  const [cycleId, setCycleId] = useState("");
  const [niveauId, setNiveauId] = useState("");
  const [serieId, setSerieId] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [recap, setRecap] = useState<Recap | null>(null);
  const verrou = useRef(false); // protection contre les doubles soumissions (avant même le re-rendu)

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargementClasses(true);
      setErreurClasses(null);
      try {
        const data = await getClasses();
        if (actif) setCycles(data);
      } catch (error) {
        if (actif) {
          setErreurClasses(
            error instanceof ApiError ? error.message : "Impossible de charger les classes."
          );
        }
      } finally {
        if (actif) setChargementClasses(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, []);

  const cycle = cycles.find((c) => String(c.id) === cycleId);
  const niveau: ClasseNiveau | undefined = cycle?.niveaux.find((n) => String(n.id) === niveauId);
  const needsSerie = niveauNeedsSerie(niveau);

  function handleCycleChange(event: ChangeEvent<HTMLSelectElement>) {
    setCycleId(event.target.value);
    setNiveauId("");
    setSerieId("");
  }

  function handleNiveauChange(event: ChangeEvent<HTMLSelectElement>) {
    setNiveauId(event.target.value);
    setSerieId("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const telephoneComplet = construireTelephone(telephone);
    const nextErrors = validerInscription({
      prenom,
      nom,
      telephone: telephoneComplet,
      cycleId,
      niveauId,
      serieId,
      needsSerie,
      motDePasse,
      confirmation,
    });

    setErrors(nextErrors);
    setErreurGenerale(null);

    if (Object.keys(nextErrors).length > 0 || !niveau) {
      return;
    }

    if (verrou.current) return;
    verrou.current = true;
    setEnvoiEnCours(true);
    try {
      const data = await inscrireEleve({
        prenom: prenom.trim(),
        nom: nom.trim(),
        telephone: telephoneComplet,
        password: motDePasse,
        password2: confirmation,
        niveau: niveau.id,
        ...(needsSerie ? { serie: Number(serieId) } : {}),
      });

      setRecap({
        cycleLabel: cycle?.nom ?? "",
        niveauLabel: niveau.nom,
        serieLabel: needsSerie
          ? niveau.series.find((s) => String(s.id) === serieId)?.nom
          : undefined,
        message: data.message,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const champsErreurs = erreursDepuisApi(error.body);
        if (Object.keys(champsErreurs).length > 0) {
          setErrors(champsErreurs);
        } else {
          setErreurGenerale(error.message);
        }
      } else {
        setErreurGenerale("Impossible de créer le compte. Réessaie plus tard.");
      }
    } finally {
      verrou.current = false;
      setEnvoiEnCours(false);
    }
  }

  if (recap) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fh-orange/15 text-2xl">
          ⏳
        </span>
        <h1 className="mb-2 text-2xl font-bold text-[#102A66]">Compte en cours de validation</h1>
        <p className="mb-6 text-sm text-[#475A7A]">{recap.message}</p>

        <dl className="mb-6 space-y-2 rounded-xl bg-[#F1F6FF] p-4 text-left text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#475A7A]">Cycle</dt>
            <dd className="font-medium text-[#102A66]">{recap.cycleLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#475A7A]">Niveau</dt>
            <dd className="font-medium text-[#102A66]">{recap.niveauLabel}</dd>
          </div>
          {recap.serieLabel && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#475A7A]">Série</dt>
              <dd className="font-medium text-[#102A66]">{recap.serieLabel}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 border-t border-[#1D4ED8]/10 pt-2">
            <dt className="text-[#475A7A]">Statut</dt>
            <dd className="font-semibold text-[#F4511E]">En attente</dd>
          </div>
        </dl>

        <Link
          href="/login"
          className="inline-flex min-h-[52px] items-center rounded-xl bg-gradient-to-r from-[#FB6A2B] to-[#F4511E] px-8 text-base font-bold text-white shadow-[0_8px_20px_rgba(244,81,30,0.3)] transition-opacity hover:opacity-90"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <h1 className="text-3xl font-extrabold text-[#102A66] sm:text-4xl">
        Créer un compte <span className="text-[#FF5A1F]">élève</span>
      </h1>
      <span aria-hidden="true" className="mt-3 block h-1.5 w-[70px] rounded-full bg-[#FF5A1F]" />
      <p className="mt-4 mb-6 text-base text-[#1E2F55] sm:text-lg">Rejoins Fahimta et accède à des ressources pour ta réussite.</p>

      {erreurGenerale && (
        <p role="alert" className="mb-4 rounded-xl bg-[#FFF1EC] px-4 py-3 text-sm font-medium text-[#B03A10]">
          {erreurGenerale}
        </p>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="prenom" className={LABEL}>
              Prénom
            </label>
            <ChampTexte
              id="prenom"
              valeur={prenom}
              onChange={setPrenom}
              autoComplete="given-name"
              placeholder="Ex. : Moussa"
              erreur={errors.prenom}
              icone={<IconUser size={20} />}
            />
            {errors.prenom && (
              <p id="prenom-error" className={ERREUR}>
                {errors.prenom}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="nom" className={LABEL}>
              Nom
            </label>
            <ChampTexte
              id="nom"
              valeur={nom}
              onChange={setNom}
              autoComplete="family-name"
              placeholder="Ex. : Hamani"
              erreur={errors.nom}
              icone={<IconUser size={20} />}
            />
            {errors.nom && (
              <p id="nom-error" className={ERREUR}>
                {errors.nom}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="telephone" className={LABEL}>
            Téléphone
          </label>
          <ChampTelephone
            id="telephone"
            value={telephone}
            onChange={setTelephone}
            invalide={Boolean(errors.telephone)}
            idErreur={errors.telephone ? "telephone-error" : undefined}
          />
          <p className={AIDE}>Format : +227 90 00 00 00</p>
          {errors.telephone && (
            <p id="telephone-error" className={ERREUR}>
              {errors.telephone}
            </p>
          )}
        </div>

        {chargementClasses ? (
          <p role="status" className="text-sm text-[#475A7A]">Chargement des classes…</p>
        ) : erreurClasses ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreurClasses}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="cycle" className={LABEL}>
                Cycle
              </label>
              <select
                id="cycle"
                value={cycleId}
                onChange={handleCycleChange}
                aria-invalid={Boolean(errors.cycle)}
                aria-describedby={errors.cycle ? "cycle-error" : undefined}
                className={CHAMP}
              >
                <option value="">Choisir un cycle</option>
                {cycles.map((cycleOption) => (
                  <option key={cycleOption.id} value={cycleOption.id}>
                    {cycleOption.nom}
                  </option>
                ))}
              </select>
              {errors.cycle && (
                <p id="cycle-error" className={ERREUR}>
                  {errors.cycle}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="niveau" className={LABEL}>
                Niveau
              </label>
              <select
                id="niveau"
                value={niveauId}
                onChange={handleNiveauChange}
                disabled={!cycle}
                aria-invalid={Boolean(errors.niveau)}
                aria-describedby={errors.niveau ? "niveau-error" : undefined}
                className={CHAMP}
              >
                <option value="">{cycle ? "Choisir un niveau" : "Choisis un cycle"}</option>
                {cycle?.niveaux.map((niveauOption) => (
                  <option key={niveauOption.id} value={niveauOption.id}>
                    {niveauOption.nom}
                  </option>
                ))}
              </select>
              {errors.niveau && (
                <p id="niveau-error" className={ERREUR}>
                  {errors.niveau}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="serie" className={LABEL}>
                Série
              </label>
              {needsSerie ? (
                <>
                  <select
                    id="serie"
                    value={serieId}
                    onChange={(event) => setSerieId(event.target.value)}
                    aria-invalid={Boolean(errors.serie)}
                    aria-describedby={errors.serie ? "serie-error" : undefined}
                    className={CHAMP}
                  >
                    <option value="">Choisir une série</option>
                    {niveau?.series.map((serieOption) => (
                      <option key={serieOption.id} value={serieOption.id}>
                        {serieOption.nom}
                      </option>
                    ))}
                  </select>
                  {errors.serie && (
                    <p id="serie-error" className={ERREUR}>
                      {errors.serie}
                    </p>
                  )}
                </>
              ) : (
                <select id="serie" disabled className={CHAMP}>
                  <option>{niveau ? "Pas de série" : "—"}</option>
                </select>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="motDePasse" className={LABEL}>
              Mot de passe
            </label>
            <ChampMotDePasse
              id="motDePasse"
              value={motDePasse}
              onChange={setMotDePasse}
              autoComplete="new-password"
              invalide={Boolean(errors.motDePasse)}
              idErreur={errors.motDePasse ? "motDePasse-error" : undefined}
              designation="le mot de passe"
              placeholder="Choisis un mot de passe"
              icone={<IconLock size={20} />}
            />
            <p className={AIDE}>8 caractères minimum, pas uniquement des chiffres, pas trop courant.</p>
            {errors.motDePasse && (
              <p id="motDePasse-error" className={ERREUR}>
                {errors.motDePasse}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmation" className={LABEL}>
              Confirmer le mot de passe
            </label>
            <ChampMotDePasse
              id="confirmation"
              value={confirmation}
              onChange={setConfirmation}
              autoComplete="new-password"
              invalide={Boolean(errors.confirmation)}
              idErreur={errors.confirmation ? "confirmation-error" : undefined}
              designation="la confirmation du mot de passe"
              placeholder="Répète ton mot de passe"
              icone={<IconLock size={20} />}
            />
            {errors.confirmation && (
              <p id="confirmation-error" className={ERREUR}>
                {errors.confirmation}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={envoiEnCours || chargementClasses}
          aria-busy={envoiEnCours}
          className="mt-1 inline-flex min-h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#FF8A1F] to-[#F4511E] px-6 py-3 text-lg font-bold text-white shadow-[0_8px_20px_rgba(244,81,30,0.25)] transition-opacity hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconUserPlus size={24} aria-hidden="true" />
          {envoiEnCours ? "Création en cours…" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-7 text-center text-base text-[#475A7A]">
        Tu as déjà un compte ?{" "}
        <Link href="/login" className="inline-flex min-h-11 items-center font-bold text-[#FF5A1F] underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          Se connecter
        </Link>
      </p>

      <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[#475A7A]">
        <IconLock size={18} aria-hidden="true" />
        Inscription sécurisée
      </p>
    </div>
  );
}
