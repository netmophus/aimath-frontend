import Link from "next/link";

/**
 * Affiché à la place de la suite du cours quand la leçon est verrouillée
 * (voir lecon.verrouille, app/eleve/lecons/[id]/page.tsx). Pédagogique et
 * invitant plutôt que frustrant : on explique la valeur du contenu masqué,
 * pas juste "accès refusé". Le paiement (carte Fahimta) n'existe pas encore
 * — /eleve/abonnement affiche pour l'instant un message "bientôt disponible".
 */
export default function MurDeblocage() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-fh-orange/30 bg-fh-accent/40 px-5 py-8 text-center sm:px-8">
      <span className="text-3xl" aria-hidden="true">
        🔒
      </span>
      <p className="text-base font-bold text-fh-bleu">Ce cours fait partie de l&apos;offre Fahimta</p>
      <p className="max-w-sm text-sm text-fh-ardoise">
        Débloque la suite du cours — démonstrations, exercices corrigés, sujet type examen et vidéos — avec une
        carte Fahimta.
      </p>
      <Link
        href="/eleve/abonnement"
        className="mt-1 min-h-11 rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
      >
        Débloquer avec une carte Fahimta
      </Link>
    </div>
  );
}
