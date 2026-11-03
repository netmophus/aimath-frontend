"use client";

import { PAYS_PAR_DEFAUT, type PaysTelephone } from "@/lib/telephone";

/** Drapeau du Niger (orange, blanc, vert + disque orange) en SVG vectoriel. */
function DrapeauNiger() {
  return (
    <svg viewBox="0 0 30 20" className="h-5 w-[30px] shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(16,42,102,0.15)]" aria-hidden="true">
      <rect width="30" height="6.67" y="0" fill="#E05206" />
      <rect width="30" height="6.67" y="6.67" fill="#FFFFFF" />
      <rect width="30" height="6.67" y="13.33" fill="#0DB02B" />
      <circle cx="15" cy="10" r="2.6" fill="#E05206" />
    </svg>
  );
}

/** Drapeau d'un pays : seul le Niger est dessiné pour l'instant (autres pays = ouverture ultérieure). */
function Drapeau({ code }: { code: string }) {
  if (code === "NE") return <DrapeauNiger />;
  return <span className="h-5 w-[30px] shrink-0 rounded-[3px] bg-[#CBD5E1]" aria-hidden="true" />;
}

interface ChampTelephoneProps {
  id: string;
  value: string;
  onChange: (valeur: string) => void;
  /** Pays affiché (Niger par défaut). L'indicatif n'est pas modifiable par l'utilisateur. */
  pays?: PaysTelephone;
  autoComplete?: string;
  invalide?: boolean;
  /** id du message d'erreur associé, pour aria-describedby. */
  idErreur?: string;
}

/**
 * Champ téléphone en deux zones assemblées : indicatif fixe (drapeau + « +227 »,
 * fond bleu clair) et numéro national éditable. L'indicatif est volontairement
 * non modifiable : le backend n'accepte que le Niger pour l'instant (voir
 * lib/telephone.ts, PAYS_UEMOA). Le numéro complet se construit avec
 * construireTelephone() au moment de l'envoi.
 */
export default function ChampTelephone({
  id,
  value,
  onChange,
  pays = PAYS_PAR_DEFAUT,
  autoComplete = "tel-national",
  invalide = false,
  idErreur,
}: ChampTelephoneProps) {
  return (
    <div
      className={`flex w-full overflow-hidden rounded-xl border bg-white transition-shadow focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/20 ${
        invalide ? "border-red-400" : "border-[#C7D2E5]"
      }`}
    >
      <span
        className="flex shrink-0 items-center gap-2 border-r border-[#C7D2E5] bg-[#E8F0FE] px-3.5 text-base font-semibold text-[#102A66]"
        aria-label={`Indicatif ${pays.nom} ${pays.indicatif}`}
      >
        <Drapeau code={pays.code} />
        {pays.indicatif}
      </span>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        placeholder="90 00 00 00"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalide}
        aria-describedby={idErreur}
        className="min-h-[52px] min-w-0 flex-1 bg-transparent px-4 text-base text-[#102A66] outline-none placeholder:text-[#94A3B8]"
      />
    </div>
  );
}
