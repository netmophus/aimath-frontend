"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ApiError, changerMotDePasse, type Role } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const REDIRECTION_PAR_ROLE: Record<Role, string> = {
  admin: "/admin",
  enseignant: "/enseignant",
  eleve: "/eleve",
  partenaire: "/partenaire",
  vendeur: "/vendeur",
};

/**
 * Formulaire de changement de mot de passe OBLIGATOIRE après une réinitialisation par un
 * admin (voir AuthUser.doitChangerMdp). Les layouts élève/admin/vendeur
 * renvoient ici tant que le drapeau est levé ; une fois changé, on rend
 * l'accès à l'espace du rôle. Pas d'ancien mot de passe demandé : celui reçu
 * par SMS vient de servir à se connecter.
 *
 * Composant client ; la page (serveur) l'entoure de AuthLayout, car Logo.tsx lit le disque (node:fs) et ne peut
 * pas être importé depuis un fichier "use client".
 */
export default function FormulaireChangerMotDePasse() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, updateUser, logout } = useAuth();

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user && !user.doitChangerMdp && !envoiEnCours) {
      // Rien à changer (accès direct à l'URL) : retour à son espace.
      router.replace(REDIRECTION_PAR_ROLE[user.role] ?? "/");
    }
  }, [isLoading, isAuthenticated, user, envoiEnCours, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur(null);

    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setEnvoiEnCours(true);
    try {
      await changerMotDePasse(motDePasse);
      updateUser({ doitChangerMdp: false });
      router.replace(user ? (REDIRECTION_PAR_ROLE[user.role] ?? "/") : "/");
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Impossible de changer le mot de passe.");
      setEnvoiEnCours(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fh-creme">
        <p className="text-sm text-fh-ardoise">Chargement…</p>
      </div>
    );
  }

  const classesChamp =
    "w-full rounded-lg border border-fh-bleu-vif/15 bg-fh-creme px-4 py-2.5 text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20";

  return (
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-2 text-xl font-bold text-fh-bleu sm:text-2xl">Nouveau mot de passe</h1>
        <p className="mb-6 text-sm text-fh-ardoise">
          Au moins 8 caractères, pas trop courant, pas uniquement des chiffres.
        </p>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="nouveau" className="mb-1 block text-sm font-medium text-fh-ardoise">
              Nouveau mot de passe
            </label>
            <input
              id="nouveau"
              type="password"
              autoComplete="new-password"
              value={motDePasse}
              onChange={(event) => setMotDePasse(event.target.value)}
              className={classesChamp}
            />
          </div>

          <div>
            <label htmlFor="confirmation" className="mb-1 block text-sm font-medium text-fh-ardoise">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmation"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className={classesChamp}
            />
          </div>

          {erreur && (
            <p role="alert" className="rounded-lg bg-fh-orange/10 px-3 py-2 text-sm text-fh-orange-fonce">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={envoiEnCours || !motDePasse || !confirmation}
            className="mt-2 rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-fh-creme transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {envoiEnCours ? "Enregistrement…" : "Enregistrer et continuer"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full text-center text-sm text-fh-ardoise hover:text-fh-bleu"
        >
          Se déconnecter
        </button>
      </div>
  );
}
