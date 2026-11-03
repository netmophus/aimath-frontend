"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ChampMotDePasse from "@/components/auth/ChampMotDePasse";
import ChampTelephone from "@/components/auth/ChampTelephone";
import { redirectionApresConnexion, messageErreurConnexion } from "@/lib/authFormulaires";
import { useAuth } from "@/lib/auth";
import { construireTelephone } from "@/lib/telephone";

const LABEL = "mb-1.5 block text-sm font-semibold text-[#102A66]";

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
      <h1 className="text-3xl font-bold text-[#102A66]">Se connecter</h1>
      <span aria-hidden="true" className="mt-3 mb-8 block h-1 w-12 rounded-full bg-[#F4511E]" />

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
          />
        </div>

        {erreur && (
          <p role="alert" className="rounded-xl bg-[#FFF1EC] px-4 py-3 text-sm font-medium text-[#B03A10]">
            {erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={envoiEnCours}
          className="mt-1 min-h-[52px] w-full rounded-xl bg-gradient-to-r from-[#FB6A2B] to-[#F4511E] px-6 py-3 text-base font-bold text-white shadow-[0_8px_20px_rgba(244,81,30,0.3)] transition-opacity hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {envoiEnCours ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#475A7A]">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-bold text-[#F4511E] underline-offset-2 hover:underline">
          Créer un compte élève
        </Link>
      </p>
    </div>
  );
}
