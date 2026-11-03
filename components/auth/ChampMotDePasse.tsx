"use client";

import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

interface ChampMotDePasseProps {
  id: string;
  value: string;
  onChange: (valeur: string) => void;
  autoComplete: "current-password" | "new-password";
  invalide?: boolean;
  idErreur?: string;
  /** Nom du champ pour le libellé du bouton (ex. « le mot de passe », « la confirmation »). */
  designation?: string;
}

/**
 * Champ mot de passe avec bouton œil : masqué par défaut, bascule affichage /
 * masquage sans toucher à la valeur ni quitter le champ (le bouton n'est pas
 * dans l'ordre de saisie des erreurs et type="button" n'envoie jamais le
 * formulaire). Chaque instance a sa propre visibilité.
 */
export default function ChampMotDePasse({
  id,
  value,
  onChange,
  autoComplete,
  invalide = false,
  idErreur,
  designation = "le mot de passe",
}: ChampMotDePasseProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`flex w-full items-center overflow-hidden rounded-xl border bg-white transition-shadow focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/20 ${
        invalide ? "border-red-400" : "border-[#C7D2E5]"
      }`}
    >
      <input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalide}
        aria-describedby={idErreur}
        className="min-h-[52px] min-w-0 flex-1 bg-transparent px-4 text-base text-[#102A66] outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? `Masquer ${designation}` : `Afficher ${designation}`}
        aria-pressed={visible}
        className="flex h-[52px] w-12 shrink-0 items-center justify-center text-[#64748B] transition-colors hover:text-[#1D4ED8] focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-blue-700"
      >
        {visible ? <IconEyeOff size={22} aria-hidden="true" /> : <IconEye size={22} aria-hidden="true" />}
      </button>
    </div>
  );
}
