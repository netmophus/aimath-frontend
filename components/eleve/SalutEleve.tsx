interface SalutEleveProps {
  prenom: string;
  nom: string;
  classe: string | null;
  photoUrl: string | null;
}

function initiales(prenom: string, nom: string): string {
  const p = prenom.trim().charAt(0);
  const n = nom.trim().charAt(0);
  return `${p}${n}`.toUpperCase() || "?";
}

/**
 * Simple ligne de salut en haut du dashboard — plus de bandeau coloré ici
 * (ce rôle revient à CarteReprendre) ni d'icônes menu/cloche décoratives
 * (abandonnées avec l'ancienne version "grille de tuiles").
 */
export default function SalutEleve({ prenom, nom, classe, photoUrl }: SalutEleveProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-fh-ardoise">Bonjour,</p>
        <p className="truncate text-xl font-bold text-fh-bleu">
          <span className="sm:hidden">{prenom}</span>
          <span className="hidden sm:inline">
            {prenom} {nom}
          </span>
        </p>
        {classe && <p className="truncate text-xs font-medium text-fh-ardoise/70">{classe}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fh-orange text-sm font-bold text-white"
          aria-hidden="true"
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL Cloudinary externe (domaine variable), next/image n'apporte rien pour un avatar 44px.
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initiales(prenom, nom)
          )}
        </span>
      </div>
    </div>
  );
}
