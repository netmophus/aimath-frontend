import type { ReactNode } from "react";
import Link from "next/link";
import { IconBooks, IconSchool } from "@tabler/icons-react";
import Logo from "@/components/Logo";

interface AuthLayoutProps {
  /** Accroche du panneau de marque (ex. "Bon retour !"). */
  title: string;
  /** Sous-texte du panneau de marque. */
  subtitle: string;
  /**
   * Contenu propre à chaque page (liste d'atouts pour login, chiffres clés
   * pour register), affiché sous l'accroche UNIQUEMENT sur le panneau riche
   * (à partir de md:) — masqué dans l'en-tête mobile compact.
   */
  panneauRiche?: ReactNode;
  children: ReactNode;
}

/**
 * Mise en page à deux colonnes partagée par /login, /register et
 * /changer-mot-de-passe : grande carte arrondie, panneau de marque en
 * dégradé bleu royal → bleu marine → violet à gauche (logo existant,
 * illustration vectorielle livres + chapeau de diplômé), formulaire à droite.
 * En dessous de md (~768px) le panneau se réduit à un en-tête compact
 * (logo + accroche) au-dessus du formulaire : le formulaire reste prioritaire.
 */
export default function AuthLayout({ title, subtitle, panneauRiche, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F6FF] px-3 py-4 sm:px-6 sm:py-10">
      <div className="w-full max-w-[1400px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(16,42,102,0.15)] ring-1 ring-[#1D4ED8]/10 sm:rounded-[32px] md:flex">
        <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(150deg,#1D4ED8_0%,#102A66_58%,#6D28D9_130%)] px-6 py-6 md:w-[44%] md:shrink-0 md:px-10 md:py-12">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#6D28D9]/40 blur-3xl md:-bottom-24 md:right-auto md:-left-16 md:top-auto md:h-80 md:w-80"
          />
          {/* Illustration éducative : décorative, masquée sur mobile. */}
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 -right-6 hidden text-white/15 md:block">
            <IconSchool size={190} stroke={1.25} className="absolute -top-48 right-2" />
            <IconBooks size={230} stroke={1.25} />
          </div>

          <Link href="/" className="relative z-10 w-fit text-white">
            <Logo variant="light" />
          </Link>

          <div className="relative z-10 mt-5 md:mt-14">
            <h2 className="text-2xl font-bold text-white md:text-4xl">{title}</h2>
            <p className="mt-2 text-sm text-white/85 md:text-lg md:leading-relaxed">{subtitle}</p>

            {panneauRiche && <div className="mt-10 hidden md:block">{panneauRiche}</div>}
          </div>

          <p className="relative z-10 mt-10 hidden text-sm font-medium text-white/80 md:block">
            Programme officiel du Niger
          </p>
        </div>

        <div className="flex flex-1 items-center px-5 py-7 sm:px-10 sm:py-12 lg:px-16">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </main>
  );
}
