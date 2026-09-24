"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { type Role, type Statut } from "@/lib/api";
import { useAuth, type AuthUser } from "@/lib/auth";
import BandeauHorsLigne from "./BandeauHorsLigne";
import BarreNavBasse from "./BarreNavBasse";

interface EleveLayoutClientProps {
  children: ReactNode;
  /** Logo pré-rendu par un composant serveur — voir app/eleve/layout.tsx. */
  logo: ReactNode;
}

const REDIRECTION_AUTRE_ROLE: Partial<Record<Role, string>> = {
  admin: "/admin",
  enseignant: "/enseignant",
  partenaire: "/partenaire",
};

function classeLabel(user: Pick<AuthUser, "niveau" | "serie">): string | null {
  if (!user.niveau) return null;
  return user.serie ? `${user.niveau} ${user.serie}` : user.niveau;
}

function initiales(prenom: string, nom: string): string {
  const p = prenom.trim().charAt(0);
  const n = nom.trim().charAt(0);
  return `${p}${n}`.toUpperCase() || "?";
}

const MESSAGES_STATUT: Record<string, { titre: string; texte: string }> = {
  en_attente: {
    titre: "Compte en cours de validation",
    texte:
      "Ton compte est en cours de validation. Tu recevras un accès dès qu'un administrateur l'aura validé.",
  },
  suspendu: {
    titre: "Compte suspendu",
    texte: "Ton compte a été suspendu. Contacte un administrateur pour plus d'informations.",
  },
  rejete: {
    titre: "Inscription non validée",
    texte: "Ta demande d'inscription n'a pas été validée. Contacte un administrateur pour plus d'informations.",
  },
};

function EcranAttente({
  statut,
  classe,
  onLogout,
}: {
  statut: Statut;
  classe: string | null;
  onLogout: () => void;
}) {
  const info = MESSAGES_STATUT[statut] ?? {
    titre: "Accès indisponible",
    texte: "Ton compte n'est pas actif pour le moment.",
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-fh-creme px-6 text-center">
      <span className="text-4xl" aria-hidden="true">
        ⏳
      </span>
      <h1 className="text-lg font-bold text-fh-bleu">{info.titre}</h1>
      <p className="max-w-sm text-sm text-fh-ardoise">{info.texte}</p>
      {classe && <p className="text-xs text-fh-ardoise/70">Classe : {classe}</p>}
      <button
        type="button"
        onClick={onLogout}
        className="mt-2 rounded-full border border-fh-bleu/20 px-5 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
      >
        Déconnexion
      </button>
    </div>
  );
}

/**
 * Garde d'accès élève + barre supérieure simple (pas de sidebar : l'élève
 * est surtout sur téléphone). Le vrai rempart reste l'API (JWT +
 * IsEleveActif) — cette garde n'est qu'un confort d'UI.
 */
export default function EleveLayoutClient({ children, logo }: EleveLayoutClientProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Le dashboard (/eleve) a sa propre ligne de salut + carte vedette (voir
  // components/eleve/SalutEleve.tsx et CarteReprendre.tsx) : afficher la
  // barre du layout par-dessus ferait doublon. Sur toutes les autres pages
  // élève (programme, leçon, placeholders), cette barre reste la seule chrome
  // disponible (logo, nom, classe, déconnexion) — on ne la retire donc que
  // sur cette route précise.
  const estDashboard = pathname === "/eleve";

  const estEleve = isAuthenticated && user?.role === "eleve";

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && user.role !== "eleve") {
      router.replace(REDIRECTION_AUTRE_ROLE[user.role] ?? "/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (isLoading || !estEleve || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fh-creme">
        <p className="text-sm text-fh-ardoise">Chargement…</p>
      </div>
    );
  }

  const classe = classeLabel(user);

  // Double sécurité : le login refuse déjà d'émettre un jeton pour un
  // compte non actif, mais on ne fait jamais reposer une garde uniquement
  // sur ce qui se passe ailleurs (et l'écran est utile juste après inscription,
  // par ex. si un onglet reste ouvert avec un jeton devenu obsolète).
  if (user.statut !== "actif") {
    return <EcranAttente statut={user.statut} classe={classe} onLogout={handleLogout} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-fh-creme">
      <BandeauHorsLigne />
      {!estDashboard && (
        <header className="bg-fh-bleu px-4 py-4 text-white sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Ligne 1 (mobile) : marque + déconnexion. À partir de md:, la
                déconnexion rejoint le bloc utilisateur à droite (2e <div>
                ci-dessous) — dupliquée avec un show/hide responsive plutôt
                qu'un réordonnancement flex, pour un contrôle simple et sûr
                de "avec qui" elle s'aligne à chaque taille. */}
            <div className="flex items-center justify-between gap-3 md:justify-start">
              {logo}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Déconnexion"
                className="min-h-11 shrink-0 rounded-full border border-white/40 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 md:hidden"
              >
                Déconnexion
              </button>
            </div>

            {/* Ligne 2 (mobile) / bloc droite (desktop) : avatar + nom + classe. */}
            <div className="flex items-center justify-between gap-3 md:justify-end md:gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fh-orange text-sm font-bold text-white"
                  aria-hidden="true"
                >
                  {user.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL Cloudinary externe (domaine variable), next/image n'apporte rien pour un avatar 44px.
                    <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initiales(user.prenom, user.nom)
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.prenom} {user.nom}
                  </p>
                  {classe && <p className="text-xs text-white/80">{classe}</p>}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Déconnexion"
                className="hidden min-h-11 shrink-0 rounded-full border border-white/40 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 md:inline-flex md:items-center"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>
      )}
      <main className={estDashboard ? "flex-1" : "flex-1 px-4 pt-5 pb-24 sm:px-6"}>{children}</main>
      <BarreNavBasse />
    </div>
  );
}
