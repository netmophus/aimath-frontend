"use client";

import Link from "next/link";
import { IconRocket } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth";

/** Illustration éducative sobre : ordinateur portable, livres scolaires, pot à crayons (SVG pur, sans dépendance). */
function IllustrationEtude() {
  return (
    <svg viewBox="0 0 360 260" role="img" aria-label="Ordinateur portable, livres et pot à crayons" className="h-auto w-full max-w-[380px]">
      {/* plan de travail */}
      <rect x="10" y="226" width="340" height="8" rx="4" fill="#0B2A55" />
      {/* ordinateur portable */}
      <rect x="70" y="58" width="190" height="124" rx="10" fill="#E8EEF7" />
      <rect x="80" y="68" width="170" height="104" rx="5" fill="#103B73" />
      <rect x="92" y="82" width="70" height="8" rx="4" fill="#F97316" />
      <rect x="92" y="100" width="130" height="6" rx="3" fill="#8FB3E3" />
      <rect x="92" y="114" width="110" height="6" rx="3" fill="#8FB3E3" />
      <rect x="92" y="128" width="120" height="6" rx="3" fill="#8FB3E3" />
      <rect x="92" y="146" width="44" height="14" rx="7" fill="#1559A6" />
      <path d="M50 182h230l-14 28a8 8 0 0 1-7 4H71a8 8 0 0 1-7-4z" fill="#C9D6EA" />
      <rect x="140" y="188" width="50" height="6" rx="3" fill="#9DB1D1" />
      <rect x="40" y="210" width="290" height="16" rx="6" fill="#DCE5F2" />
      {/* livres */}
      <rect x="262" y="196" width="84" height="30" rx="4" fill="#F97316" />
      <rect x="262" y="206" width="84" height="4" fill="#C94A08" />
      <rect x="270" y="166" width="72" height="30" rx="4" fill="#1559A6" />
      <rect x="270" y="176" width="72" height="4" fill="#0B2A55" />
      <rect x="276" y="138" width="62" height="28" rx="4" fill="#FFFFFF" />
      <rect x="276" y="147" width="62" height="4" fill="#C9D6EA" />
      {/* pot à crayons */}
      <rect x="14" y="170" width="46" height="56" rx="7" fill="#FFFFFF" />
      <rect x="14" y="190" width="46" height="8" fill="#F97316" />
      <rect x="22" y="128" width="7" height="46" rx="2" fill="#F97316" transform="rotate(-10 25 174)" />
      <rect x="32" y="122" width="7" height="52" rx="2" fill="#8FB3E3" />
      <rect x="43" y="130" width="7" height="44" rx="2" fill="#C94A08" transform="rotate(9 46 174)" />
    </svg>
  );
}

export default function CtaBlock() {
  // Même règle que le hero (voir components/accueil/HeroAccueil.tsx) : connecté → /eleve ;
  // sinon, "Découvrir une leçon" → /login mais "Créer un compte" → /register
  // (seule exception à la règle générale). isAuthenticated vaut false tant
  // que la session n'est pas confirmée (lib/auth.tsx) : pas de flash vers
  // /eleve avant que ce soit sûr.
  const { isAuthenticated } = useAuth();
  const hrefLecon = isAuthenticated ? "/eleve" : "/login";
  const hrefCompte = isAuthenticated ? "/eleve" : "/register";

  return (
    <section className="bg-fh-creme px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
      <div className="mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#103B73] to-[#1559A6] px-6 py-10 sm:px-12 sm:py-12 md:grid-cols-[3fr_2fr]">
        <div className="flex flex-col items-start gap-4 text-left">
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white">
            C&apos;est gratuit
          </span>

          <h2 className="text-[28px] font-bold leading-tight text-white sm:text-4xl">
            Prêt à progresser dès aujourd&apos;hui ?
          </h2>

          <p className="max-w-xl text-base text-white/90 sm:text-lg">
            Crée ton compte et retrouve tous les cours de ta classe en
            quelques secondes.
          </p>

          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={hrefCompte}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#F97316] bg-[#F97316] px-7 text-base font-bold text-white transition-colors hover:border-[#C94A08] hover:bg-[#C94A08] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <IconRocket size={18} stroke={1.75} aria-hidden="true" />
              Créer un compte
            </Link>
            <Link
              href={hrefLecon}
              className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-white px-7 text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Découvrir une leçon
            </Link>
          </div>
        </div>

        <div aria-hidden="false" className="hidden justify-center md:flex md:justify-end">
          <IllustrationEtude />
        </div>
      </div>
    </section>
  );
}
