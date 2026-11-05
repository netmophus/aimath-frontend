import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import MotifsSaheliens from "@/components/auth/MotifsSaheliens";

/**
 * Emplacement de la photographie de la colonne d'identité : déposer ici une photographie ORIGINALE haute résolution
 * (paysage, environ 1600 x 1350 px minimum, visages dans le tiers supérieur). Sans fichier, un bloc uni reste affiché
 * et la page continue de fonctionner.
 */
const PHOTO = "connexion/lyceens.jpg";

const MARINE = "text-[#102A66]";
const ORANGE = "text-[#FF5A1F]";

/** Logo réel du projet (public/fahimta.png) + nom et accroche. */
function Identite({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-blue-700">
      <Image
        src="/fahimta.png"
        alt=""
        width={64}
        height={64}
        priority
        className={`shrink-0 rounded-2xl bg-white p-1.5 shadow-[0_4px_14px_rgba(16,42,102,0.12)] ${compact ? "h-11 w-11" : "h-14 w-14"}`}
      />
      <span className="flex flex-col leading-tight">
        <span className={`font-extrabold ${MARINE} ${compact ? "text-xl" : "text-2xl"}`}>Fahimta</span>
        <span className={`text-[#475A7A] ${compact ? "text-xs" : "text-sm"}`}>Plateforme d&apos;apprentissage du Niger</span>
      </span>
    </Link>
  );
}

function Slogan({ className = "" }: { className?: string }) {
  return (
    <p className={`font-extrabold leading-[1.12] ${MARINE} ${className}`}>
      Apprends, révise et réussis avec <span className={ORANGE}>Fahimta.</span>
    </p>
  );
}

/**
 * Présentation de /login : deux colonnes plein écran (49 % identité crème / 51 % formulaire blanc) à partir de 1024 px ;
 * en dessous, une seule colonne : bandeau crème compact (logo + slogan) puis le formulaire, immédiatement accessible.
 * Composant serveur : le formulaire (composant client) est passé en `children`.
 */
interface ConnexionLayoutProps {
  children: ReactNode;
  /** Lien affiché en haut à droite du formulaire (défaut : retour à l'accueil). */
  lienRetour?: { href: string; libelle: string };
  /** "large" : formulaire plus large (inscription, nombreux champs). Défaut : "normal" (connexion). */
  largeur?: "normal" | "large";
  /** Slogan du bandeau compact sur très petit écran (< 640 px). Masqué pour les formulaires longs afin de les remonter. */
  sloganTresPetitEcran?: boolean;
}

export default function ConnexionLayout({
  children,
  lienRetour = { href: "/", libelle: "Retour à l'accueil" },
  largeur = "normal",
  sloganTresPetitEcran = true,
}: ConnexionLayoutProps) {
  const large = largeur === "large";
  const photoPresente = fs.existsSync(path.join(process.cwd(), "public", PHOTO));

  return (
    <main className="min-h-screen min-h-dvh w-full overflow-x-hidden bg-white lg:grid lg:grid-cols-[49fr_51fr]">
      {/* Bandeau compact (mobile et tablette) */}
      <header className="relative overflow-hidden bg-[#FFF7DE] px-5 py-4 sm:px-8 lg:hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#FFE2A8]/70" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Identite compact />
          <Slogan className={`text-sm sm:max-w-[16rem] sm:text-right sm:text-base ${sloganTresPetitEcran ? "" : "hidden sm:block"}`} />
        </div>
      </header>

      {/* Colonne d'identité (grand écran) */}
      <aside className="relative hidden flex-col overflow-hidden bg-[#FFF7DE] px-10 py-8 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:min-h-[600px] lg:self-start xl:px-16">
        <MotifsSaheliens />
        <div className="relative z-10">
          <Identite />
        </div>

        <div className="relative z-10 my-6 flex min-h-[260px] flex-1 items-stretch">
          <div className="relative mx-auto w-full max-w-[640px]">
            {/* Formes décalées derrière la photographie */}
            <span aria-hidden="true" className="absolute -bottom-4 -right-4 left-6 top-6 rounded-[30px] bg-[#FF8A00]" />
            <span aria-hidden="true" className="absolute -bottom-4 -left-6 h-[38%] w-[36%] rounded-[26px] bg-[#0B1F66]" />
            <div className="relative h-full overflow-hidden rounded-[28px] shadow-[0_14px_34px_rgba(16,42,102,0.18)]">
              {photoPresente ? (
                <Image
                  src={`/${PHOTO}`}
                  alt="Deux lycéens souriants en tenue scolaire, avec un sac à dos et une tablette"
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 0px"
                  className="object-cover object-[50%_28%]"
                />
              ) : (
                <div aria-hidden="true" className="h-full w-full bg-[#FFE2A8]" />
              )}
            </div>
          </div>
        </div>

        <Slogan className="relative z-10 pb-2 text-[clamp(1.6rem,2.5vw,2.75rem)]" />
      </aside>

      {/* Colonne du formulaire */}
      <section className={`flex flex-col px-5 pb-10 pt-5 sm:px-10 lg:py-8 ${large ? "lg:px-10 xl:px-12" : "lg:px-12 xl:px-20"}`}>
        <div className="flex justify-end">
          <Link
            href={lienRetour.href}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium ${MARINE} hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:text-base`}
          >
            <IconArrowLeft size={18} aria-hidden="true" />
            {lienRetour.libelle}
          </Link>
        </div>
        <div className={`mx-auto flex w-full flex-1 flex-col justify-start pt-4 sm:pt-8 lg:justify-center lg:pt-0 ${large ? "max-w-[640px]" : "max-w-[540px]"}`}>
          {children}
        </div>
      </section>
    </main>
  );
}
