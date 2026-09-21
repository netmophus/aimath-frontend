"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import {
  CYCLES,
  getCycle,
  getNiveau,
  niveauNeedsSerie,
  type CycleId,
} from "@/lib/classes";

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
}

export default function RegisterForm() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [cycleId, setCycleId] = useState<CycleId | "">("");
  const [niveauId, setNiveauId] = useState("");
  const [serieId, setSerieId] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [recap, setRecap] = useState<Recap | null>(null);

  const cycle = cycleId ? getCycle(cycleId) : undefined;
  const niveau = cycleId && niveauId ? getNiveau(cycleId, niveauId) : undefined;
  const needsSerie = niveauNeedsSerie(niveau);

  function handleCycleChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as CycleId | "";
    setCycleId(value);
    setNiveauId("");
    setSerieId("");
  }

  function handleNiveauChange(event: ChangeEvent<HTMLSelectElement>) {
    setNiveauId(event.target.value);
    setSerieId("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!prenom.trim()) nextErrors.prenom = "Indique ton prénom.";
    if (!nom.trim()) nextErrors.nom = "Indique ton nom.";
    if (!telephone.trim())
      nextErrors.telephone = "Indique ton numéro de téléphone.";
    if (!cycleId) nextErrors.cycle = "Choisis ton cycle.";
    if (cycleId && !niveauId) nextErrors.niveau = "Choisis ton niveau.";
    if (needsSerie && !serieId) nextErrors.serie = "Choisis ta série.";
    if (!motDePasse) {
      nextErrors.motDePasse = "Choisis un mot de passe.";
    } else if (motDePasse.length < 6) {
      nextErrors.motDePasse =
        "Le mot de passe doit contenir au moins 6 caractères.";
    }
    if (!confirmation) {
      nextErrors.confirmation = "Confirme ton mot de passe.";
    } else if (confirmation !== motDePasse) {
      nextErrors.confirmation = "Les mots de passe ne correspondent pas.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // Pas de backend branché pour l'instant : on ne fait aucun appel réseau,
    // on affiche simplement l'écran de validation en attente.
    setRecap({
      cycleLabel: cycle?.label ?? "",
      niveauLabel: niveau?.label ?? "",
      serieLabel: needsSerie ? serieId : undefined,
    });
  }

  if (recap) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-fh-sable p-6 text-center sm:p-8">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fh-orange/15 text-2xl">
          ⏳
        </span>
        <h1 className="mb-2 text-xl font-bold text-fh-bleu sm:text-2xl">
          Compte en cours de validation
        </h1>
        <p className="mb-6 text-sm text-fh-ardoise">
          Ton compte élève a bien été créé. Un administrateur doit le valider
          avant que tu puisses te connecter.
        </p>

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
    <>
      <h1 className="mb-8 text-center text-xl font-bold text-fh-bleu sm:text-2xl">
        Créer un compte élève
      </h1>

      <div className="w-full max-w-xl rounded-2xl bg-fh-sable p-6 sm:p-8">
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
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none focus:border-fh-orange"
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
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none focus:border-fh-orange"
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
              className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none focus:border-fh-orange"
            />
            {errors.telephone && (
              <p id="telephone-error" className="mt-1 text-sm text-fh-orange-fonce">
                {errors.telephone}
              </p>
            )}
          </div>

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
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none focus:border-fh-orange"
              >
                <option value="">Choisir un cycle</option>
                {CYCLES.map((cycleOption) => (
                  <option key={cycleOption.id} value={cycleOption.id}>
                    {cycleOption.label}
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
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none focus:border-fh-orange disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {cycle ? "Choisir un niveau" : "Choisis d'abord un cycle"}
                </option>
                {cycle?.niveaux.map((niveauOption) => (
                  <option key={niveauOption.id} value={niveauOption.id}>
                    {niveauOption.label}
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
                    className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none focus:border-fh-orange"
                  >
                    <option value="">Choisir une série</option>
                    {niveau?.series.map((serieOption) => (
                      <option key={serieOption} value={serieOption}>
                        {serieOption}
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
                  className="w-full cursor-not-allowed rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-4 py-2.5 text-fh-ardoise/50 opacity-50 outline-none"
                >
                  <option>
                    {niveau ? "Pas de série pour ce niveau" : "—"}
                  </option>
                </select>
              )}
            </div>
          </div>

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
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none focus:border-fh-orange"
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
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none focus:border-fh-orange"
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
            className="mt-2 rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-fh-creme transition-colors hover:bg-fh-orange-fonce sm:text-base"
          >
            Créer mon compte
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
    </>
  );
}
