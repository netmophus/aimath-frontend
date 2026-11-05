"use client";

import { useRef } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";

import { extraireCode, LONGUEUR_CODE } from "@/lib/motDePasse";

interface ChampCodeOtpProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  invalide?: boolean;
  idErreur?: string;
}

/**
 * Code à 6 chiffres : six cases accessibles. Le collage (« 123 456 ») remplit toutes les cases, la touche
 * Retour arrière recule, les flèches se déplacent, et autoComplete="one-time-code" laisse le clavier mobile
 * proposer le code reçu par SMS. Un groupe nommé pour les lecteurs d'écran ; chaque case a son libellé.
 */
export default function ChampCodeOtp({ value, onChange, disabled = false, invalide = false, idErreur }: ChampCodeOtpProps) {
  const cases = useRef<Array<HTMLInputElement | null>>([]);
  const chiffres = Array.from({ length: LONGUEUR_CODE }, (_, i) => value[i] ?? "");

  function aller(index: number) {
    cases.current[Math.min(Math.max(index, 0), LONGUEUR_CODE - 1)]?.focus();
  }

  function saisir(index: number, brut: string) {
    const nouveaux = extraireCode(brut);
    if (!nouveaux) return;
    const base = value.padEnd(LONGUEUR_CODE, " ").split("");
    for (let k = 0; k < nouveaux.length && index + k < LONGUEUR_CODE; k++) base[index + k] = nouveaux[k];
    onChange(base.join("").replace(/ /g, "").slice(0, LONGUEUR_CODE));
    aller(index + nouveaux.length);
  }

  function touche(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (chiffres[index]) onChange(value.slice(0, index) + value.slice(index + 1));
      else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        aller(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      aller(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      aller(index + 1);
    }
  }

  function coller(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const code = extraireCode(e.clipboardData.getData("text"));
    if (!code) return;
    onChange(code);
    aller(code.length >= LONGUEUR_CODE ? LONGUEUR_CODE - 1 : code.length);
  }

  return (
    <div role="group" aria-label="Code de vérification à 6 chiffres" className="flex w-full justify-between gap-2 sm:gap-3">
      {chiffres.map((chiffre, i) => (
        <input
          key={i}
          ref={(el) => {
            cases.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={LONGUEUR_CODE}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Chiffre ${i + 1} sur ${LONGUEUR_CODE}`}
          aria-invalid={invalide}
          aria-describedby={idErreur}
          disabled={disabled}
          value={chiffre}
          onChange={(e) => saisir(i, e.target.value)}
          onKeyDown={(e) => touche(i, e)}
          onPaste={coller}
          onFocus={(e) => e.target.select()}
          className={`h-14 min-w-0 flex-1 rounded-xl border bg-white text-center text-2xl font-bold text-[#102A66] outline-none transition-shadow focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 disabled:opacity-60 ${
            invalide ? "border-red-400" : "border-[#C7D2E5]"
          }`}
        />
      ))}
    </div>
  );
}
