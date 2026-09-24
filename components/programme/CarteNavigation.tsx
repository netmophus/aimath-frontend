import Link from "next/link";

interface CarteNavigationProps {
  href: string;
  titre: string;
  sousTitre?: string;
}

/** Carte cliquable générique pour les niveaux 1 et 2 (choix d'un niveau puis
 * d'une matière) — même style que les cartes de la landing (fh-sable, coins
 * arrondis, légère élévation au survol). */
export default function CarteNavigation({ href, titre, sousTitre }: CarteNavigationProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-fh-sable px-4 py-8 text-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <span className="text-lg font-bold text-fh-bleu">{titre}</span>
      {sousTitre && <span className="text-xs text-fh-ardoise/70">{sousTitre}</span>}
    </Link>
  );
}
