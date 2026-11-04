import { LIBELLE_INDICATEUR, type StatutIndicateur } from "@/lib/communications";

const STYLES: Record<StatutIndicateur, string> = {
  non_envoye: "bg-fh-sable text-fh-ardoise",
  en_attente: "bg-fh-accent text-fh-orange-fonce",
  envoye: "bg-green-100 text-green-700",
  echec: "bg-red-100 text-red-700",
  incertain: "bg-amber-100 text-amber-800",
};

/** Indicateur distinct du statut du compte : « compte actif » ne veut jamais dire « SMS envoyé ». */
export default function StatutSmsBadge({ statut }: { statut: StatutIndicateur }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[statut]}`}>{LIBELLE_INDICATEUR[statut]}</span>
  );
}
