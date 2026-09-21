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
