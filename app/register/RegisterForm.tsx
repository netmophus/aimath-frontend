"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import {
  ApiError,
  getClasses,
  inscrireEleve,
  type ClasseCycle,
  type ClasseNiveau,
} from "@/lib/api";
import { niveauNeedsSerie } from "@/lib/classes";

interface FormErrors {
  prenom?: string;
  nom?: string;
  telephone?: string;
  cycle?: string;
  niveau?: string;
  serie?: string;
  motDePasse?: string;
  confirmation?: string;
}

interface Recap {
  cycleLabel: string;
  niveauLabel: string;
  serieLabel?: string;
  /** Message renvoyé par l'API (voir InscriptionEleveView), affiché tel quel
   * plutôt qu'un texte figé côté client. */
  message: string;
}

const TELEPHONE_RE = /^\+227\d{8}$/;

/**
 * Traduit le corps d'erreur 400 de l'API (voir comptes/serializers.py,
 * InscriptionEleveSerializer) en erreurs par champ du formulaire — une clé
 * DRF (ex. "telephone", "password2") peut porter une simple chaîne ou une
 * liste de messages, d'où `premierMessage`.
 */
function erreursDepuisApi(body: unknown): FormErrors {
  if (!body || typeof body !== "object") return {};
  const record = body as Record<string, unknown>;

  function premierMessage(valeur: unknown): string | undefined {
    if (typeof valeur === "string") return valeur;
    if (Array.isArray(valeur) && typeof valeur[0] === "string") return valeur[0];
    return undefined;
  }

  const resultat: FormErrors = {};
  const prenom = premierMessage(record.prenom);
  if (prenom) resultat.prenom = prenom;
  const nom = premierMessage(record.nom);
  if (nom) resultat.nom = nom;
  const telephone = premierMessage(record.telephone);
  if (telephone) resultat.telephone = telephone;
  const motDePasse = premierMessage(record.password);
  if (motDePasse) resultat.motDePasse = motDePasse;
  const confirmation = premierMessage(record.password2);
  if (confirmation) resultat.confirmation = confirmation;
  const niveau = premierMessage(record.niveau);
  if (niveau) resultat.niveau = niveau;
  const serie = premierMessage(record.serie);
  if (serie) resultat.serie = serie;
  return resultat;
}

export default function RegisterForm() {
  const [cycles, setCycles] = useState<ClasseCycle[]>([]);
  const [chargementClasses, setChargementClasses] = useState(true);
  const [erreurClasses, setErreurClasses] = useState<string | null>(null);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
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

    const telephoneNettoye = telephone.trim().replace(/\s+/g, "");
    const nextErrors: FormErrors = {};

    if (!prenom.trim()) nextErrors.prenom = "Indique ton prénom.";
    if (!nom.trim()) nextErrors.nom = "Indique ton nom.";
    if (!telephoneNettoye) {
      nextErrors.telephone = "Indique ton numéro de téléphone.";
    } else if (!TELEPHONE_RE.test(telephoneNettoye)) {
      nextErrors.telephone =
        "Le numéro doit être au format +227 suivi de 8 chiffres (ex. +22790000000).";
    }
    if (!cycleId) nextErrors.cycle = "Choisis ton cycle.";
    if (cycleId && !niveauId) nextErrors.niveau = "Choisis ton niveau.";
    if (needsSerie && !serieId) nextErrors.serie = "Choisis ta série.";
    if (!motDePasse) {
      nextErrors.motDePasse = "Choisis un mot de passe.";
    } else if (motDePasse.length < 8) {
      nextErrors.motDePasse = "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (!confirmation) {
      nextErrors.confirmation = "Confirme ton mot de passe.";
    } else if (confirmation !== motDePasse) {
      nextErrors.confirmation = "Les mots de passe ne correspondent pas.";
    }

    setErrors(nextErrors);
    setErreurGenerale(null);

    if (Object.keys(nextErrors).length > 0 || !niveau) {
      return;
    }

    setEnvoiEnCours(true);
    try {
      const data = await inscrireEleve({
        prenom: prenom.trim(),
        nom: nom.trim(),
        telephone: telephoneNettoye,
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
      setEnvoiEnCours(false);
    }
  }

  if (recap) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fh-orange/15 text-2xl">
          ⏳
        </span>
        <h1 className="mb-2 text-xl font-bold text-fh-bleu sm:text-2xl">
          Compte en cours de validation
        </h1>
        <p className="mb-6 text-sm text-fh-ardoise">{recap.message}</p>

        <dl className="mb-6 space-y-2 rounded-lg bg-fh-creme p-4 text-left text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-fh-ardoise">Cycle</dt>
            <dd className="font-medium text-fh-bleu">{recap.cycleLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-fh-ardoise">Niveau</dt>
            <dd className="font-medium text-fh-bleu">{recap.niveauLabel}</dd>
          </div>
          {recap.serieLabel && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-fh-ardoise">Série</dt>
              <dd className="font-medium text-fh-bleu">{recap.serieLabel}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 border-t border-fh-bleu-vif/10 pt-2">
            <dt className="text-fh-ardoise">Statut</dt>
            <dd className="font-semibold text-fh-orange">En attente</dd>
          </div>
        </dl>

        <Link
          href="/login"
          className="inline-block rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-fh-creme transition-colors hover:bg-fh-orange-fonce"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-8 text-xl font-bold text-fh-bleu sm:text-2xl">
        Créer un compte élève
      </h1>

      {erreurGenerale && (
        <p role="alert" className="mb-4 rounded-lg bg-fh-orange/10 px-3 py-2 text-sm text-fh-orange-fonce">
          {erreurGenerale}
        </p>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="prenom"
              className="mb-1 block text-sm font-medium text-fh-ardoise"
            >
              Prénom
            </label>
            <input
              id="prenom"
              type="text"
              value={prenom}
              onChange={(event) => setPrenom(event.target.value)}
              aria-invalid={Boolean(errors.prenom)}
              aria-describedby={errors.prenom ? "prenom-error" : undefined}
              className="w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
            />
            {errors.prenom && (
              <p id="prenom-error" className="mt-1 text-sm text-fh-orange-fonce">
                {errors.prenom}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="nom"
              className="mb-1 block text-sm font-medium text-fh-ardoise"
            >
              Nom
            </label>
            <input
              id="nom"
              type="text"
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              aria-invalid={Boolean(errors.nom)}
              aria-describedby={errors.nom ? "nom-error" : undefined}
              className="w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
            />
            {errors.nom && (
              <p id="nom-error" className="mt-1 text-sm text-fh-orange-fonce">
                {errors.nom}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="telephone"
            className="mb-1 block text-sm font-medium text-fh-ardoise"
          >
            Téléphone
          </label>
          <input
            id="telephone"
            type="tel"
            placeholder="+227 90 00 00 00"
            value={telephone}
            onChange={(event) => setTelephone(event.target.value)}
            aria-invalid={Boolean(errors.telephone)}
            aria-describedby={errors.telephone ? "telephone-error" : undefined}
            className="w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
          />
          {errors.telephone && (
            <p id="telephone-error" className="mt-1 text-sm text-fh-orange-fonce">
              {errors.telephone}
            </p>
          )}
        </div>

        {chargementClasses ? (
          <p className="text-sm text-fh-ardoise">Chargement des classes…</p>
        ) : erreurClasses ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreurClasses}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="cycle"
                className="mb-1 block text-sm font-medium text-fh-ardoise"
              >
                Cycle
              </label>
              <select
                id="cycle"
                value={cycleId}
                onChange={handleCycleChange}
                aria-invalid={Boolean(errors.cycle)}
                aria-describedby={errors.cycle ? "cycle-error" : undefined}
                className="w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
              >
                <option value="">Choisir un cycle</option>
                {cycles.map((cycleOption) => (
                  <option key={cycleOption.id} value={cycleOption.id}>
                    {cycleOption.nom}
                  </option>
                ))}
              </select>
              {errors.cycle && (
                <p id="cycle-error" className="mt-1 text-sm text-fh-orange-fonce">
                  {errors.cycle}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="niveau"
                className="mb-1 block text-sm font-medium text-fh-ardoise"
              >
                Niveau
              </label>
              <select
                id="niveau"
                value={niveauId}
                onChange={handleNiveauChange}
                disabled={!cycle}
                aria-invalid={Boolean(errors.niveau)}
                aria-describedby={errors.niveau ? "niveau-error" : undefined}
                className="w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {cycle ? "Choisir un niveau" : "Choisis d'abord un cycle"}
                </option>
                {cycle?.niveaux.map((niveauOption) => (
                  <option key={niveauOption.id} value={niveauOption.id}>
                    {niveauOption.nom}
                  </option>
                ))}
              </select>
              {errors.niveau && (
                <p id="niveau-error" className="mt-1 text-sm text-fh-orange-fonce">
                  {errors.niveau}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="serie"
                className="mb-1 block text-sm font-medium text-fh-ardoise"
              >
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
                    className="w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
                  >
                    <option value="">Choisir une série</option>
                    {niveau?.series.map((serieOption) => (
                      <option key={serieOption.id} value={serieOption.id}>
                        {serieOption.nom}
                      </option>
                    ))}
                  </select>
                  {errors.serie && (
                    <p id="serie-error" className="mt-1 text-sm text-fh-orange-fonce">
                      {errors.serie}
                    </p>
                  )}
                </>
              ) : (
                <select
                  id="serie"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-ardoise/50 opacity-50 outline-none"
                >
                  <option>
                    {niveau ? "Pas de série pour ce niveau" : "—"}
                  </option>
                </select>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="motDePasse"
              className="mb-1 block text-sm font-medium text-fh-ardoise"
            >
              Mot de passe
            </label>
            <input
              id="motDePasse"
              type="password"
              value={motDePasse}
              onChange={(event) => setMotDePasse(event.target.value)}
              aria-invalid={Boolean(errors.motDePasse)}
              aria-describedby={
                errors.motDePasse ? "motDePasse-error" : undefined
              }
              className="w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
            />
            {errors.motDePasse && (
              <p
                id="motDePasse-error"
                className="mt-1 text-sm text-fh-orange-fonce"
              >
                {errors.motDePasse}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmation"
              className="mb-1 block text-sm font-medium text-fh-ardoise"
            >
              Confirmation du mot de passe
            </label>
            <input
              id="confirmation"
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              aria-invalid={Boolean(errors.confirmation)}
              aria-describedby={
                errors.confirmation ? "confirmation-error" : undefined
              }
              className="w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
            />
            {errors.confirmation && (
              <p
                id="confirmation-error"
                className="mt-1 text-sm text-fh-orange-fonce"
              >
                {errors.confirmation}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={envoiEnCours || chargementClasses}
          className="mt-2 rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-fh-creme transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
        >
          {envoiEnCours ? "Création en cours…" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-fh-ardoise">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-medium text-fh-orange hover:text-fh-orange-fonce"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
