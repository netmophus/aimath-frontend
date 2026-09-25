import type { LeconStatut } from "@/lib/leconApi";

export const LECON_STATUT_STYLES: Record<LeconStatut, string> = {
  brouillon: "bg-fh-sable text-fh-ardoise",
  a_valider: "bg-fh-accent text-fh-orange-fonce",
  publie: "bg-green-100 text-green-700",
};

export const LECON_STATUT_LABELS: Record<LeconStatut, string> = {
  brouillon: "Brouillon",
  a_valider: "À valider",
  publie: "Publié",
};

/** Badge d'accès (gratuit/premium) — indépendant du statut de publication,
 * même style de pill que LECON_STATUT_STYLES pour rester cohérent visuellement. */
export type AccesLecon = "gratuit" | "premium";

export const ACCES_LECON_STYLES: Record<AccesLecon, string> = {
  gratuit: "bg-green-100 text-green-700",
  premium: "bg-fh-accent text-fh-orange-fonce",
};

export const ACCES_LECON_LABELS: Record<AccesLecon, string> = {
  gratuit: "Gratuit",
  premium: "Premium",
};

export function accesLecon(estGratuit: boolean): AccesLecon {
  return estGratuit ? "gratuit" : "premium";
}
