"use client";

import { IconBook2, IconBulb, IconChevronRight, IconCompass, IconPuzzle, type TablerIcon } from "@tabler/icons-react";

import type { ThemeEleve } from "@/lib/eleveApi";
import NotionRow, { type TeinteNotion } from "./NotionRow";

interface ThemeAccordionProps {
  theme: ThemeEleve;
  /** Position du thème dans la liste (1-based) — repli du badge numéro quand
   * le titre ne commence pas par "Thème N —" (voir analyserTitreTheme), et
   * clé de la couleur du chapitre (palette de quatre, réutilisée au-delà). */
  position: number;
  expanded: boolean;
  onToggle: () => void;
  /** Identifiants des leçons déjà téléchargées pour le hors-ligne — pour le
   * badge sur chaque notion (voir NotionRow). */
  idsTelecharges: Set<number>;
  /** Transmis tel quel à NotionRow — voir sa documentation. */
  abonnementActif: boolean;
}

interface Teinte extends TeinteNotion {
  /** carte : fond très clair + bordure claire, visibles au repos */
  carte: string;
  /** carré du numéro */
  numero: string;
  /** icône du chapitre */
  iconeChapitre: TablerIcon;
  /** petit trait coloré devant le titre d'un regroupement */
  trait: string;
}

/** Quatre couleurs franches, visibles en permanence (orange, bleu, violet, vert) ; la couleur n'est jamais le seul
 * repère : le numéro et le titre restent affichés. */
const TEINTES: readonly Teinte[] = [
  { carte: "border-orange-200 bg-orange-50", numero: "bg-[#EA580C]", iconeChapitre: IconBook2, trait: "bg-[#F97316]", fond: "bg-orange-50 hover:bg-orange-100", pastille: "bg-[#EA580C]" },
  { carte: "border-sky-200 bg-sky-50", numero: "bg-[#0284C7]", iconeChapitre: IconBulb, trait: "bg-[#0284C7]", fond: "bg-sky-50 hover:bg-sky-100", pastille: "bg-[#0284C7]" },
  { carte: "border-violet-200 bg-violet-50", numero: "bg-[#7C3AED]", iconeChapitre: IconPuzzle, trait: "bg-[#7C3AED]", fond: "bg-violet-50 hover:bg-violet-100", pastille: "bg-[#7C3AED]" },
  { carte: "border-emerald-200 bg-emerald-50", numero: "bg-[#059669]", iconeChapitre: IconCompass, trait: "bg-[#10B981]", fond: "bg-emerald-50 hover:bg-emerald-100", pastille: "bg-[#059669]" },
];

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

function pluriel(n: number, mot: string): string {
  return `${n} ${mot}${n > 1 ? "s" : ""}`;
}

/**
 * Un thème (« chapitre » pour l'élève), repliable (accordéon) — replié par défaut pour ne pas dérouler tout le
 * programme d'un coup sur mobile. Une fois ouvert, montre ses regroupements (chapitres du backend) et leurs notions
 * directement (pas de second niveau d'accordéon), sur deux colonnes à partir de lg quand il y a plusieurs
 * regroupements. Les chiffres (leçons disponibles, notions) viennent des données.
 */
export default function ThemeAccordion({
  theme,
  position,
  expanded,
  onToggle,
  idsTelecharges,
  abonnementActif,
}: ThemeAccordionProps) {
  const nbNotions = theme.chapitres.reduce((total, chapitre) => total + chapitre.notions.length, 0);
  const nbDisponibles = theme.chapitres.reduce(
    (total, chapitre) => total + chapitre.notions.filter((n) => n.a_lecon_publiee).length,
    0
  );
  const aDisponible = nbDisponibles > 0;
  const { numero, titreAffiche } = analyserTitreTheme(theme.titre, position);
  const t = TEINTES[(position - 1) % TEINTES.length];
  const Icone = t.iconeChapitre;
  const idPanneau = `theme-panneau-${theme.id}`;

  return (
    <div className={`overflow-hidden rounded-3xl border-2 shadow-sm ${t.carte}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={idPanneau}
        className="flex w-full items-center gap-4 px-4 py-4 text-left focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-[#102A66] sm:px-6 sm:py-5"
      >
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-sm sm:h-16 sm:w-16 ${t.numero}`}
          aria-hidden="true"
        >
          {numero}
        </span>

        <div className="min-w-0 flex-1">
          <p className="break-words text-lg font-extrabold leading-snug text-[#102A66] sm:text-xl">{titreAffiche}</p>
          <span
            className={`mt-1.5 inline-flex max-w-full items-center rounded-full px-3 py-1 text-xs font-bold sm:text-sm ${
              aDisponible ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-700 ring-1 ring-slate-300"
            }`}
          >
            {aDisponible
              ? `${nbDisponibles}/${nbNotions} leçon${nbDisponibles > 1 ? "s" : ""} disponible${nbDisponibles > 1 ? "s" : ""}`
              : `${pluriel(nbNotions, "notion")} à venir`}
          </span>
        </div>

        <Icone size={40} stroke={1.5} className="hidden shrink-0 text-[#102A66]/35 sm:block" aria-hidden="true" />

        <IconChevronRight
          size={26}
          stroke={2.25}
          className={`shrink-0 text-[#102A66] transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-90" : ""}`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div id={idPanneau} className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div
            className={`grid gap-x-8 gap-y-5 rounded-2xl bg-white p-4 sm:p-5 ${
              theme.chapitres.length > 1 ? "lg:grid-cols-2" : ""
            }`}
          >
            {theme.chapitres.map((chapitre) => (
              <div key={chapitre.id} className="flex min-w-0 flex-col gap-2">
                <p className="flex items-center gap-2 text-base font-extrabold text-[#102A66]">
                  <span className={`h-5 w-1.5 shrink-0 rounded-full ${t.trait}`} aria-hidden="true" />
                  <span className="min-w-0 break-words">{chapitre.titre}</span>
                </p>
                <div className="flex flex-col gap-2">
                  {chapitre.notions.map((notion) => (
                    <NotionRow
                      key={notion.id}
                      notion={notion}
                      telechargee={notion.lecon_id !== null && idsTelecharges.has(notion.lecon_id)}
                      abonnementActif={abonnementActif}
                      teinte={t}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
