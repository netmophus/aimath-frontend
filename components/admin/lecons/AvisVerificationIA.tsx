import RenduMarkdown from "@/components/RenduMarkdown";

interface AvisVerificationIAProps {
  avis: string;
}

/**
 * Affiche l'avis renvoyé par /api/admin/ia/verifier/. Toujours présenté
 * comme un second regard FAILLIBLE, jamais comme une validation — c'est
 * l'admin qui reste juge de ce qu'il insère ou corrige. Ne jamais renommer
 * ce libellé en "Validé ✓" ou équivalent.
 */
export default function AvisVerificationIA({ avis }: AvisVerificationIAProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
        ⚠️ Avis de vérification IA (indicatif — à confirmer par vos soins)
      </p>
      <RenduMarkdown contenu={avis} />
    </div>
  );
}
