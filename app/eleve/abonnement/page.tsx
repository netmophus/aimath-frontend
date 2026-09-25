import Link from "next/link";

/**
 * Destination du bouton "Débloquer avec une carte Fahimta" (voir
 * components/eleve/MurDeblocage.tsx). L'activation par carte NITA n'est pas
 * encore développée (étape suivante) — cette page reste volontairement
 * minimale en attendant, plutôt qu'un lien mort ou une erreur 404.
 */
export default function AbonnementPage() {
  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-3 py-16 text-center">
      <span className="text-4xl" aria-hidden="true">
        💳
      </span>
      <h1 className="text-xl font-bold text-fh-bleu">Carte Fahimta</h1>
      <p className="max-w-sm text-sm text-fh-ardoise">
        L&apos;activation par carte Fahimta arrive bientôt. Reviens très vite pour débloquer l&apos;ensemble des
        cours.
      </p>
      <Link
        href="/eleve"
        className="mt-2 min-h-11 rounded-full border border-fh-bleu/20 px-5 py-2.5 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
      >
        ← Retour à mon espace
      </Link>
    </div>
  );
}
