import Link from "next/link";

export interface MaillonFilAriane {
  label: string;
  /** Absent pour le dernier maillon (page courante, non cliquable). */
  href?: string;
}

interface FilArianeProps {
  maillons: readonly MaillonFilAriane[];
}

/** Fil d'Ariane simple, réutilisé aux 3 niveaux de /programme/college/... */
export default function FilAriane({ maillons }: FilArianeProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-sm text-fh-ardoise">
      <ol className="flex flex-wrap items-center gap-1.5">
        {maillons.map((maillon, index) => (
          <li key={maillon.label} className="flex items-center gap-1.5">
            {index > 0 && (
              <span aria-hidden="true" className="text-fh-ardoise/40">
                /
              </span>
            )}
            {maillon.href ? (
              <Link href={maillon.href} className="transition-colors hover:text-fh-bleu hover:underline">
                {maillon.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-fh-bleu">
                {maillon.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
