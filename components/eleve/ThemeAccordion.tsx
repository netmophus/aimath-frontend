"use client";

import type { ThemeEleve } from "@/lib/eleveApi";
import NotionRow from "./NotionRow";
import { IconeChevron } from "./icones";

interface ThemeAccordionProps {
  theme: ThemeEleve;
  /** Position du thème dans la liste (1-based) — repli du badge numéro quand
   * le titre ne commence pas par "Thème N —" (voir analyserTitreTheme). */
  position: number;
  expanded: boolean;
  onToggle: () => void;
  /** Identifiants des leçons déjà téléchargées pour le hors-ligne — pour le
   * badge sur chaque notion (voir NotionRow). */
  idsTelecharges: Set<number>;
}

/** "Thème 1 — Organisation des calculs" → numéro "1" + titre nettoyé
 * "Organisation des calculs" (le préfixe redondant est déjà porté par le
 * badge). Un titre qui ne suit pas cette convention est gardé tel quel, avec
 * le numéro de repli (position dans la liste). */
const MOTIF_THEME_NUMERO = /^Thème\s+(\d+)\s*[—–-]\s*(.+)$/i;

function analyserTitreTheme(titre: string, position: number): { numero: string; titreAffiche: string } {
  const correspondance = titre.match(MOTIF_THEME_NUMERO);
  if (correspondance) {
    return { numero: correspondance[1], titreAffiche: correspondance[2].trim() };
  }
  return { numero: String(position), titreAffiche: titre };
}

/**
 * Un thème, repliable (accordéon) — replié par défaut pour ne pas dérouler
 * tout le programme d'un coup sur mobile. Une fois ouvert, montre ses
 * chapitres et leurs notions directement (pas de second niveau d'accordéon,
 * pour rester simple à parcourir au pouce).
 */
export default function ThemeAccordion({ theme, position, expanded, onToggle, idsTelecharges }: ThemeAccordionProps) {
  const nbNotions = theme.chapitres.reduce((total, chapitre) => total + chapitre.notions.length, 0);
  const nbDisponibles = theme.chapitres.reduce(
    (total, chapitre) => total + chapitre.notions.filter((n) => n.a_lecon_publiee).length,
    0
  );
  const aDisponible = nbDisponibles > 0;
  const { numero, titreAffiche } = analyserTitreTheme(theme.titre, position);

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${
        aDisponible ? "ring-fh-orange/40" : "ring-fh-sable"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white ${
            aDisponible ? "bg-fh-orange" : "bg-fh-bleu"
          }`}
          aria-hidden="true"
        >
          {numero}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-fh-bleu">{titreAffiche}</p>
          <span
            className={`mt-1.5 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              aDisponible
                ? "bg-[#EAF5EF] text-[#1F7A55]"
                : "border border-fh-sable bg-fh-creme text-fh-ardoise/60"
            }`}
          >
            {aDisponible ? `${nbDisponibles}/${nbNotions} leçon(s) disponible(s)` : `${nbNotions} notion(s) · à venir`}
          </span>
        </div>

        <IconeChevron
          className={`h-5 w-5 shrink-0 text-fh-bleu transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-fh-sable px-5 py-5 sm:px-6">
          {theme.chapitres.map((chapitre) => (
            <div key={chapitre.id} className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-fh-ardoise">{chapitre.titre}</p>
              <div className="flex flex-col gap-1.5">
                {chapitre.notions.map((notion) => (
                  <NotionRow
                    key={notion.id}
                    notion={notion}
                    telechargee={notion.lecon_id !== null && idsTelecharges.has(notion.lecon_id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
