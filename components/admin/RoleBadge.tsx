import type { Role } from "@/lib/api";

const STYLES: Record<Role, string> = {
  eleve: "bg-fh-sable text-fh-ardoise",
  enseignant: "bg-fh-bleu/10 text-fh-bleu",
  admin: "bg-fh-orange/10 text-fh-orange-fonce",
  partenaire: "bg-fh-accent text-fh-orange-fonce",
  vendeur: "bg-green-100 text-green-700",
};

const LABELS: Record<Role, string> = {
  eleve: "Élève",
  enseignant: "Enseignant",
  admin: "Admin",
  partenaire: "Partenaire",
  vendeur: "Vendeur",
};

export default function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STYLES[role]}`}
    >
      {LABELS[role]}
    </span>
  );
}
