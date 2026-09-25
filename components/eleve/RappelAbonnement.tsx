/** "2026-10-25" → "25 octobre 2026" — `abonnement_actif_jusqu_au` est une
 * DATE seule (pas datetime) côté backend, le T00:00:00 évite un décalage de
 * fuseau qui ferait parfois afficher la veille. */
function formaterDateFr(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface RappelAbonnementProps {
  actif: boolean;
  echeance: string | null;
}

/**
 * Encart de rappel de l'abonnement en cours — LA vraie info de validité
 * (contrairement au statut d'une carte individuelle, qui ne dit rien de
 * l'échéance réelle si l'élève a déjà activé plusieurs cartes). Partagé
 * entre /eleve/abonnement (où il vivait à l'origine) et /eleve/mes-cartes,
 * jamais dupliqué.
 */
export default function RappelAbonnement({ actif, echeance }: RappelAbonnementProps) {
  if (actif && echeance) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
        <p className="text-sm font-semibold text-green-800">
          Ton abonnement est actif jusqu&apos;au {formaterDateFr(echeance)}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-fh-sable bg-fh-creme px-4 py-4">
      <p className="text-sm font-medium text-fh-ardoise">Tu n&apos;as pas d&apos;abonnement actif.</p>
    </div>
  );
}
