"use client";

import Link from "next/link";
import { IconRocket } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth";

export default function CtaBlock() {
  // Même règle que le hero (voir HeroCarousel.tsx) : connecté → /eleve ;
  // sinon, "Découvrir une leçon" → /login mais "Créer un compte" → /register
  // (seule exception à la règle générale). isAuthenticated vaut false tant
  // que la session n'est pas confirmée (lib/auth.tsx) : pas de flash vers
  // /eleve avant que ce soit sûr.
  const { isAuthenticated } = useAuth();
  const hrefLecon = isAuthenticated ? "/eleve" : "/login";
  const hrefCompte = isAuthenticated ? "/eleve" : "/register";

  return (
    <section className="bg-fh-creme px-4 py-10 sm:px-6 sm:py-14">
      <div className="relative mx-auto max-w-[800px] overflow-hidden rounded-[20px] bg-gradient-to-br from-fh-bleu to-fh-bleu-charbon px-6 py-12 text-center sm:px-10 sm:py-14">
        {/* Halos décoratifs : débordent légèrement des coins (overflow-hidden
            du parent les coupe), z-index bas pour rester derrière le contenu. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 z-0 h-64 w-64 rounded-full bg-fh-orange/30 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -bottom-20 z-0 h-72 w-72 rounded-full bg-fh-bleu-vif/50 blur-3xl"
        />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <span className="rounded-full bg-white/12 px-4 py-1.5 text-xs font-semibold text-fh-orange-clair">
            C&apos;est gratuit
          </span>

          <h2 className="text-[26px] font-medium text-white sm:text-[30px]">
            Prêt à progresser dès aujourd&apos;hui ?
          </h2>

          <p className="max-w-md text-[15px] text-[#c9cede]">
            Crée ton compte et retrouve tous les cours de ta classe en
            quelques secondes.
          </p>

          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={hrefCompte}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce sm:text-base"
            >
              <IconRocket size={18} stroke={1.75} aria-hidden="true" />
              Créer un compte
            </Link>
            <Link
              href={hrefLecon}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:text-base"
            >
              Découvrir une leçon
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
