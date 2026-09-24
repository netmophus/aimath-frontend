import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

interface BoutonRetourProps {
  href: string;
  /** Décrit la destination précise pour les lecteurs d'écran (ex. "Retour
   * aux matières de 6e") — plus explicite que le simple libellé visible
   * "Retour", identique sur toutes les pages. */
  label: string;
}

/**
 * Bouton de retour explicite, affiché en haut de chaque niveau sauf le
 * premier (/programme/college) — complète le fil d'Ariane (FilAriane) pour
 * le retour au niveau immédiatement précédent du parcours.
 *
 * Style "pastille contour bleu" : la flèche glisse légèrement vers la
 * gauche au survol (group-hover sur le <Link>, translate-x sur l'icône) —
 * un seul élément cliquable porte le "group", pas besoin de dupliquer un
 * gestionnaire de survol sur l'icône séparément.
 */
export default function BoutonRetour({ href, label }: BoutonRetourProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group mb-4 inline-flex items-center gap-2 rounded-full border-[1.5px] border-fh-bleu px-[18px] py-[9px] text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-bleu/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fh-bleu focus-visible:ring-offset-2"
    >
      <IconArrowLeft
        size={16}
        stroke={2}
        aria-hidden="true"
        className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
      />
      Retour
    </Link>
  );
}
