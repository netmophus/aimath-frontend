import Link from "next/link";

interface PagePlaceholderProps {
  titre: string;
  emoji: string;
}

/**
 * Page minimale "Bientôt disponible" pour une cible de la grille d'accès
 * rapide / barre basse pas encore développée (exercices, vidéos, à réviser,
 * aide prof, ressources, profil). Évite tout lien mort depuis le dashboard.
 */
export default function PagePlaceholder({ titre, emoji }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/eleve" className="text-sm font-medium text-fh-bleu hover:underline">
        ← Retour
      </Link>

      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-16 text-center ring-1 ring-fh-sable">
        <span className="text-3xl" aria-hidden="true">
          {emoji}
        </span>
        <p className="font-semibold text-fh-bleu">{titre}</p>
        <p className="max-w-xs text-sm text-fh-ardoise">Bientôt disponible.</p>
      </div>
    </div>
  );
}
