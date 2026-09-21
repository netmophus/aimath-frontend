"use client";

import Link from "next/link";

import type { LeconLocale } from "@/lib/offlineStore";
import { IconeCorbeille } from "./icones";

interface CarteLeconTelechargeeProps {
  lecon: LeconLocale;
  onSupprimer: (id: number) => void;
  suppressionEnCours: boolean;
}

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/** Une leçon téléchargée, dans l'espace "Mes leçons téléchargées" — ouvre la
 * lecture (locale, sans réseau nécessaire) ou retire le téléchargement. */
export default function CarteLeconTelechargee({ lecon, onSupprimer, suppressionEnCours }: CarteLeconTelechargeeProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable">
      <Link href={`/eleve/lecons/${lecon.id}`} className="min-w-0 flex-1">
        <p className="truncate font-semibold text-fh-bleu">{lecon.titreLecon}</p>
        <p className="truncate text-xs text-fh-ardoise">
          {lecon.contexte.matiere} · {lecon.contexte.theme} · {lecon.contexte.chapitre}
        </p>
        <p className="mt-1 text-[11px] text-fh-ardoise/60">Téléchargée le {formaterDate(lecon.telechargeLe)}</p>
      </Link>
      <button
        type="button"
        onClick={() => onSupprimer(lecon.id)}
        disabled={suppressionEnCours}
        aria-label={`Supprimer le téléchargement de ${lecon.titreLecon}`}
        title="Supprimer le téléchargement"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-fh-ardoise/50 transition-colors hover:bg-fh-sable/60 hover:text-fh-ardoise disabled:opacity-50"
      >
        <IconeCorbeille className="h-5 w-5" />
      </button>
    </div>
  );
}
