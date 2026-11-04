import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBulb,
  IconCircleCheck,
  IconClock,
  IconInbox,
  IconMessageQuestion,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

import { LIBELLE_STATUT, LIBELLE_TYPE, type StatutDemande, type TypeDemande } from "@/lib/aide";

/** Couleurs foncées : texte blanc lisible (contraste AA) sur chaque fond. */
export const COULEUR_TYPE: Record<TypeDemande, string> = {
  question: "#1D4ED8",
  erreur: "#C2410C",
  suggestion: "#7C3AED",
};

export const CARTE = "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-blue-100 sm:p-6";
export const LABEL = "block text-lg font-extrabold text-[#102A66]";
export const CHAMP =
  "min-h-12 w-full rounded-2xl border-2 border-blue-200 bg-white px-4 text-base text-[#102A66] outline-none transition-shadow placeholder:text-slate-500 focus:border-[#1D4ED8] focus:ring-4 focus:ring-[#1D4ED8]/15 disabled:opacity-60";
const BOUTON_BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-base font-bold shadow-sm transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] disabled:cursor-not-allowed disabled:opacity-60";
export const BOUTON_MARINE = `${BOUTON_BASE} bg-[#102A66] text-white hover:bg-[#1D4ED8]`;
export const BOUTON_ORANGE = `${BOUTON_BASE} bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white hover:from-[#C2410C] hover:to-[#9A3412]`;
export const BOUTON_CLAIR = `${BOUTON_BASE} bg-white text-[#102A66] ring-2 ring-blue-200 hover:bg-blue-50`;

export function IconeType({ type, taille = 32 }: { type: TypeDemande; taille?: number }) {
  const props = { size: taille, stroke: 2, "aria-hidden": true as const };
  if (type === "erreur") return <IconAlertTriangle {...props} />;
  if (type === "suggestion") return <IconBulb {...props} />;
  return <IconMessageQuestion {...props} />;
}

export function Pastille({ type, className = "h-14 w-14" }: { type: TypeDemande; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: COULEUR_TYPE[type] }}
      className={`flex shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${className}`}
    >
      <IconeType type={type} />
    </span>
  );
}

export function BoutonRetour({ href, children = "Retour" }: { href: string; children?: ReactNode }) {
  return (
    <Link href={href} className={`${BOUTON_MARINE} w-fit`}>
      <IconArrowLeft size={22} stroke={2.25} aria-hidden="true" />
      {children}
    </Link>
  );
}

const STYLE_STATUT: Record<StatutDemande, string> = {
  recue: "bg-slate-100 text-slate-800 ring-slate-300",
  en_cours: "bg-amber-100 text-amber-900 ring-amber-300",
  traitee: "bg-emerald-100 text-emerald-900 ring-emerald-300",
};

export function PastilleStatut({ statut }: { statut: StatutDemande }) {
  const Icone = statut === "traitee" ? IconCircleCheck : statut === "en_cours" ? IconClock : IconInbox;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ring-1 ${STYLE_STATUT[statut]}`}>
      <Icone size={16} stroke={2.25} aria-hidden="true" />
      {LIBELLE_STATUT[statut]}
    </span>
  );
}

export function EtiquetteType({ type }: { type: TypeDemande }) {
  return (
    <span style={{ backgroundColor: COULEUR_TYPE[type] }} className="inline-flex rounded-full px-3 py-1 text-sm font-bold text-white">
      {LIBELLE_TYPE[type]}
    </span>
  );
}

/** Illustration discrète : un élève devant son ordinateur (icônes locales, masquée sur mobile). */
export function IllustrationEleve() {
  return (
    <div aria-hidden="true" className="relative hidden h-24 w-32 shrink-0 sm:block">
      <svg viewBox="0 0 128 96" className="h-full w-full">
        <rect x="14" y="30" width="84" height="52" rx="8" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="3" />
        <rect x="24" y="40" width="64" height="32" rx="4" fill="#fff" />
        <rect x="6" y="82" width="100" height="6" rx="3" fill="#1D4ED8" />
        <circle cx="100" cy="30" r="13" fill="#FDBA74" stroke="#C2410C" strokeWidth="3" />
        <path d="M84 72c0-13 7-22 16-22s16 9 16 22" fill="#7C3AED" stroke="#5B21B6" strokeWidth="3" />
        <path d="M34 56h20M34 63h32" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Message({ ton, children }: { ton: "erreur" | "succes"; children: ReactNode }) {
  const style = ton === "erreur" ? "bg-red-50 text-red-900 ring-red-300" : "bg-emerald-50 text-emerald-900 ring-emerald-300";
  return (
    <p role={ton === "erreur" ? "alert" : "status"} className={`rounded-2xl p-4 text-base font-semibold ring-1 ${style}`}>
      {children}
    </p>
  );
}
