"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { HERO_BADGE, HERO_SLIDES } from "@/lib/heroSlides";

const AUTOPLAY_DELAY_MS = 5500;

interface HeroCarouselProps {
  /** Mosaïque de photos (components/MosaiquePhotosEleves.tsx) — un composant
   * SERVEUR, reçu tout construit en prop plutôt qu'importé ici : ce fichier
   * est "use client" (état du carrousel), et un composant qui lit le
   * système de fichiers (node:fs) ne doit jamais être importé dans un
   * fichier client (même convention que Logo.tsx/MarqueEleve.tsx, passés en
   * prop `logo` aux layouts admin/élève). */
  mosaique: ReactNode;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Hero de la page d'accueil : badge fixe, titre/sous-texte qui défilent (5
 * diapositives, lib/heroSlides.ts), boutons fixes, navigation (flèches +
 * points) et mosaïque de photos fixe sous le tout. Défilement automatique
 * toutes les 5,5 s, en pause au survol ou dès qu'un contrôle du carrousel a
 * le focus (onFocus/onBlur sur le conteneur — React les fait remonter
 * depuis n'importe quel bouton/lien enfant, pas besoin de les répéter sur
 * chacun). Navigation clavier : ← / → une fois le carrousel focus.
 */
export default function HeroCarousel({ mosaique }: HeroCarouselProps) {
  // Connecté → tableau de bord ; sinon → connexion. isAuthenticated vaut
  // false tant que la réhydratation de session n'est pas confirmée (voir
  // lib/auth.tsx), donc pas de flash : les boutons pointent prudemment vers
  // /login pendant ce court instant, jamais vers /eleve avant confirmation.
  const { isAuthenticated } = useAuth();
  const hrefCta = isAuthenticated ? "/eleve" : "/login";

  const [index, setIndex] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();

    if (prefersReducedMotion() || enPause) {
      return;
    }

    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, AUTOPLAY_DELAY_MS);
  }, [clearTimer, enPause]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  function goTo(nextIndex: number) {
    setIndex(nextIndex);
    startTimer();
  }

  function goToPrevious() {
    goTo((index - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }

  function goToNext() {
    goTo((index + 1) % HERO_SLIDES.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }
  }

  return (
    <section
      className="bg-fh-bleu/10"
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
      onFocus={() => setEnPause(true)}
      onBlur={() => setEnPause(false)}
    >
      <div
        role="region"
        aria-roledescription="carrousel"
        aria-label="Présentation de Fahimta"
        onKeyDown={handleKeyDown}
        className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 pt-8 pb-5 text-center sm:px-6 sm:pt-12 sm:pb-7"
      >
        <span className="mx-auto flex w-fit max-w-full flex-col overflow-hidden rounded-full text-center text-xs font-medium sm:flex-row sm:text-base">
          <span className="whitespace-nowrap bg-fh-orange px-3 py-1.5 text-white sm:px-[18px] sm:py-2.5">
            {HERO_BADGE.segment1}
          </span>
          <span className="whitespace-nowrap bg-fh-accent px-3 py-1.5 text-fh-orange-fonce sm:px-[18px] sm:py-2.5">
            {HERO_BADGE.segment2}
          </span>
        </span>

        <div className="relative min-h-[210px] w-full sm:min-h-[160px]">
          {HERO_SLIDES.map((slide, slideIndex) => (
            <div
              key={slide.title}
              aria-hidden={slideIndex !== index}
              className={`absolute inset-0 flex flex-col items-center gap-3 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                slideIndex === index
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <h1 className="max-w-2xl text-[32px] font-bold leading-tight tracking-tight text-fh-bleu sm:text-[38px]">
                {slide.title}
              </h1>
              <p className="max-w-xl text-base text-fh-ardoise">{slide.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href={hrefCta}
            className="rounded-full bg-fh-orange px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce sm:text-base"
          >
            Rejoins-les gratuitement
          </Link>
          <Link
            href={hrefCta}
            className="rounded-full border border-fh-bleu px-6 py-3 text-center text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-bleu/5 sm:text-base"
          >
            Voir une leçon
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Diapositive précédente"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fh-bleu/20 text-fh-bleu transition-colors hover:bg-fh-bleu/5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((slide, slideIndex) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`Aller à la diapositive ${slideIndex + 1}`}
                aria-current={slideIndex === index}
                className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                  slideIndex === index
                    ? "w-6 bg-fh-orange"
                    : "w-1.5 bg-fh-bleu/20 hover:bg-fh-bleu/40"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Diapositive suivante"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fh-bleu/20 text-fh-bleu transition-colors hover:bg-fh-bleu/5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-8 sm:px-6 sm:pb-12">{mosaique}</div>
    </section>
  );
}
