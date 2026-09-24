import Link from "next/link";

/** Incitation discrète à créer un compte, affichée en bas des 3 niveaux de
 * /programme/college/... — volontairement sobre (contour, pas de couleur
 * pleine) pour ne pas concurrencer visuellement le contenu du programme. */
export default function CtaCreerCompte() {
  return (
    <div className="mt-10 flex justify-center">
      <Link
        href="/register"
        className="rounded-full border border-fh-orange px-5 py-2.5 text-sm font-medium text-fh-orange transition-colors hover:bg-fh-orange hover:text-white"
      >
        Créer un compte pour accéder aux cours
      </Link>
    </div>
  );
}
