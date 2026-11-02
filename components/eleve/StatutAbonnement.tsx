import { IconCalendarEvent, IconCircleCheck, IconInfoCircle } from "@tabler/icons-react";

import { formaterDateFr } from "./RappelAbonnement";

interface StatutAbonnementProps {
  actif: boolean;
  /** Date ISO (abonnement_actif_jusqu_au) — vient toujours des données réelles de l'utilisateur. */
  echeance: string | null;
}

/**
 * Statut d'abonnement de la page /eleve/abonnement (présentation riche).
 * Mêmes conditions et mêmes textes que RappelAbonnement (conservé tel quel
 * pour /eleve/mes-cartes) : actif ET échéance connue → carte verte, sinon
 * « Tu n'as pas d'abonnement actif. ». Aucun autre état n'existe côté données.
 */
export default function StatutAbonnement({ actif, echeance }: StatutAbonnementProps) {
  if (actif && echeance) {
    return (
      <div
        role="status"
        className="flex items-center gap-4 rounded-3xl border-2 border-[#86EFAC] bg-[#F0FDF4] px-4 py-4 sm:px-6 sm:py-5"
      >
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#15803D] text-white sm:h-16 sm:w-16"
        >
          <IconCircleCheck size={38} stroke={1.9} />
        </span>
        <p className="min-w-0 flex-1 text-base font-bold text-[#14532D] sm:text-xl">
          Ton abonnement est actif jusqu&apos;au {formaterDateFr(echeance)}.
        </p>
        <IconCalendarEvent size={44} stroke={1.5} aria-hidden="true" className="hidden shrink-0 text-[#15803D]/60 sm:block" />
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex items-center gap-4 rounded-3xl border-2 border-[#CBD5E1] bg-white px-4 py-4 sm:px-6 sm:py-5"
    >
      <span
        aria-hidden="true"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-600 sm:h-16 sm:w-16"
      >
        <IconInfoCircle size={34} stroke={1.9} />
      </span>
      <p className="min-w-0 flex-1 text-base font-bold text-slate-700 sm:text-xl">Tu n&apos;as pas d&apos;abonnement actif.</p>
    </div>
  );
}
