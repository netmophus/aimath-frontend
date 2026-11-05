"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconLock, IconLogin2 } from "@tabler/icons-react";

import ChampMotDePasse from "@/components/auth/ChampMotDePasse";
import ChampTelephone from "@/components/auth/ChampTelephone";
import { redirectionApresConnexion, messageErreurConnexion } from "@/lib/authFormulaires";
import { useAuth } from "@/lib/auth";
import { construireTelephone } from "@/lib/telephone";

const LABEL = "mb-2 block text-base font-bold text-[#102A66]";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  // Numéro NATIONAL saisi (l'indicatif +227 est affiché à part, fixe) ; le numéro
  // complet est reconstruit à l'envoi au format déjà attendu par le backend.
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur(null);

    const telephoneComplet = construireTelephone(telephone);
    if (!telephoneComplet || !motDePasse) {
      setErreur("Indique ton téléphone et ton mot de passe.");
      return;
    }

    setEnvoiEnCours(true);
    try {
      const data = await login(telephoneComplet, motDePasse);
      router.push(redirectionApresConnexion(data));
    } catch (error) {
      setErreur(messageErreurConnexion(error));
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-4xl font-extrabold text-[#102A66] sm:text-5xl">
        Se <span className="text-[#FF5A1F]">connecter</span>
      </h1>
      <span aria-hidden="true" className="mt-3 block h-1.5 w-[70px] rounded-full bg-[#FF5A1F]" />
      <p className="mt-5 mb-7 text-lg text-[#1E2F55]">Accède à ton compte Fahimta.</p>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="telephone" className={LABEL}>
            Téléphone
          </label>
          <ChampTelephone id="telephone" value={telephone} onChange={setTelephone} autoComplete="tel-national" />
        </div>

        <div>
          <label htmlFor="motDePasse" className={LABEL}>
            Mot de passe
          </label>
          <ChampMotDePasse
            id="motDePasse"
            value={motDePasse}
            onChange={setMotDePasse}
            autoComplete="current-password"
            placeholder="Ton mot de passe"
          />
          <div className="mt-1 text-right">
            <Link href="/mot-de-passe-oublie" className="inline-flex min-h-11 items-center text-sm font-bold text-[#FF5A1F] underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:text-base">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {erreur && (
          <p role="alert" className="rounded-xl bg-[#FFF1EC] px-4 py-3 text-sm font-medium text-[#B03A10]">
            {erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={envoiEnCours}
          aria-busy={envoiEnCours}
          className="mt-1 inline-flex min-h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#FF8A1F] to-[#F4511E] px-6 py-3 text-lg font-bold text-white shadow-[0_8px_20px_rgba(244,81,30,0.25)] transition-opacity hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconLogin2 size={24} aria-hidden="true" />
          {envoiEnCours ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-7 text-center text-base text-[#475A7A]">
        Pas encore de compte ?{" "}
        <Link href="/register" className="inline-flex min-h-11 items-center font-bold text-[#FF5A1F] underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          Créer un compte élève
        </Link>
      </p>

      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-[#475A7A]">
        <IconLock size={18} aria-hidden="true" />
        Connexion sécurisée
      </p>
    </div>
  );
}
