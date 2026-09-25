"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ApiError, type Role } from "@/lib/api";
import { useAuth } from "@/lib/auth";

// Record<Role, string> (pas Partial) : TypeScript force ainsi une entrée
// pour CHAQUE valeur du type Role — un rôle ajouté côté API sans être
// ajouté ici casse le build plutôt que de planter silencieusement en
// production (c'est exactement ce qui est arrivé pour "vendeur", ajouté à
// Role dans lib/api.ts après coup, sans que cette map suive).
const REDIRECTION_PAR_ROLE: Record<Role, string> = {
  admin: "/admin",
  enseignant: "/enseignant",
  eleve: "/eleve",
  partenaire: "/partenaire",
  // Pas encore d'espace vendeur (voir la tâche dédiée) — route réservée,
  // affichera un 404 en attendant plutôt qu'un plantage JS.
  vendeur: "/vendeur",
};

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur(null);

    if (!telephone.trim() || !motDePasse) {
      setErreur("Indique ton téléphone et ton mot de passe.");
      return;
    }

    setEnvoiEnCours(true);
    try {
      const data = await login(telephone.trim(), motDePasse);
      // Filet de sécurité même si REDIRECTION_PAR_ROLE est un Record complet
      // (donc déjà garanti par TypeScript) : une réponse API malformée ou un
      // rôle renvoyé sous une forme inattendue ne doit jamais planter la
      // redirection — "/" reste une destination sûre dans tous les cas.
      router.push(REDIRECTION_PAR_ROLE[data.role] ?? "/");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          // Compte en_attente / rejeté / suspendu : message déjà en français, renvoyé par l'API.
          setErreur(error.message);
        } else if (error.status === 401) {
          setErreur("Téléphone ou mot de passe incorrect.");
        } else {
          setErreur("Une erreur est survenue. Réessaie dans un instant.");
        }
      } else {
        setErreur("Impossible de contacter le serveur. Vérifie ta connexion.");
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="mb-8 text-xl font-bold text-fh-bleu sm:text-2xl">
        Se connecter
      </h1>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            autoComplete="tel"
            placeholder="+227 90 00 00 00"
            value={telephone}
            onChange={(event) => setTelephone(event.target.value)}
            className="w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
          />
        </div>

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
            autoComplete="current-password"
            value={motDePasse}
            onChange={(event) => setMotDePasse(event.target.value)}
            className="w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
          />
        </div>

        {erreur && (
          <p
            role="alert"
            className="rounded-lg bg-fh-orange/10 px-3 py-2 text-sm text-fh-orange-fonce"
          >
            {erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={envoiEnCours}
          className="mt-2 rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-fh-creme transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
        >
          {envoiEnCours ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-fh-ardoise">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-medium text-fh-orange hover:text-fh-orange-fonce"
        >
          Créer un compte élève
        </Link>
      </p>
    </div>
  );
}
