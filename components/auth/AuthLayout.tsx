import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface AuthLayoutProps {
  /** Accroche du panneau de marque (ex. "Bon retour !"). */
  title: string;
  /** Sous-texte du panneau de marque. */
  subtitle: string;
  /**
   * Contenu propre à chaque page (liste d'atouts pour login, chiffres clés
   * pour register), affiché sous l'accroche UNIQUEMENT sur le panneau riche
   * (à partir de md:) — masqué dans l'en-tête mobile compact pour l'alléger.
   */
  panneauRiche?: ReactNode;
  children: ReactNode;
}

/**
 * Mise en page à deux panneaux partagée par /login et /register : un
 * panneau de marque (dégradé fh-bleu → fh-bleu-charbon) à gauche, le
 * formulaire (fourni en children) dans un panneau blanc à droite. En
 * dessous de md (~768px), le panneau de marque se réduit à un simple
 * en-tête compact au-dessus du formulaire — logo + accroche courte
 * seulement, `panneauRiche` masqué — plutôt qu'un panneau plein écran qui
 * pousserait le formulaire hors de l'écran (empilement naturel des deux
 * <div>, pas de flex tant que "md:flex" n'est pas actif).
 */
export default function AuthLayout({
  title,
  subtitle,
  panneauRiche,
  children,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-fh-creme px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-lg md:flex">
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-fh-bleu to-fh-bleu-charbon px-6 py-6 md:w-[44%] md:shrink-0 md:px-8 md:py-10">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fh-orange/35 blur-3xl md:-bottom-24 md:-right-20 md:top-auto md:h-80 md:w-80"
          />

          <Link href="/" className="relative z-10 w-fit text-white">
            <Logo variant="light" />
          </Link>

          <div className="relative z-10 mt-6 md:mt-10">
            <h2 className="text-xl font-medium text-white md:text-[22px]">{title}</h2>
            <p className="mt-1.5 text-[13px] text-fh-accent">{subtitle}</p>

            {panneauRiche && <div className="mt-8 hidden md:block">{panneauRiche}</div>}
          </div>

          <p className="relative z-10 mt-6 hidden text-[13px] text-fh-accent/70 md:block">
            Programme officiel du Niger
          </p>
        </div>

        <div className="flex-1 px-6 py-8 sm:px-10 sm:py-12">{children}</div>
      </div>
    </main>
  );
}
