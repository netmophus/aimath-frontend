"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HERO_SLIDES, type HeroPanel } from "@/lib/heroSlides";

const AUTOPLAY_DELAY_MS = 4000;

/**
 * Couleur du panneau logo par diapositive. Classes littérales (pas de
 * concaténation de chaîne) pour que Tailwind les détecte à la compilation.
 */
const PANEL_BG: Record<HeroPanel, string> = {
  bleu: "bg-fh-bleu",
  orange: "bg-fh-orange",
  "orange-fonce": "bg-fh-orange-fonce",
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Hero "split" : colonne texte (blanche) à gauche, panneau logo dont la
 * couleur change à chaque diapositive à droite. Défilement automatique,
 * flèches et pagination pilotent les deux colonnes en même temps.
 */
export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();

    if (prefersReducedMotion()) {
      return;
    }

    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, AUTOPLAY_DELAY_MS);
  }, [clearTimer]);

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

  const activeSlide = HERO_SLIDES[index];

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row lg:items-stretch">
        {/* Colonne texte */}
        <div className="flex flex-1 flex-col justify-center gap-4 px-4 py-8 sm:px-6 sm:py-10 lg:w-[58%] lg:flex-none lg:py-14 lg:pr-12">
          <div className="relative min-h-[230px] sm:min-h-[190px] lg:min-h-[210px]">
            {HERO_SLIDES.map((slide, slideIndex) => (
              <div
                key={slide.title}
                aria-hidden={slideIndex !== index}
                className={`absolute inset-0 flex flex-col justify-center gap-4 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                  slideIndex === index
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <span className="w-fit rounded-full bg-fh-accent px-3 py-1 text-xs font-semibold text-fh-orange-fonce sm:text-sm">
                  {slide.badge}
                </span>
                <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-fh-bleu sm:text-4xl lg:text-5xl">
                  {slide.title}
                </h1>
                <p className="max-w-lg text-sm text-fh-ardoise sm:text-base">
                  {slide.subtitle}
                </p>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Link
                    href={slide.primaryHref}
                    className="rounded-full bg-fh-orange px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce sm:text-base"
                  >
                    {slide.primaryLabel}
                  </Link>
                  <Link
                    href={slide.secondaryHref}
                    className="rounded-full border border-fh-bleu px-6 py-3 text-center text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-bleu/5 sm:text-base"
                  >
                    {slide.secondaryLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>

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
        </div>

        {/* Colonne panneau logo, couleur selon la diapositive */}
        <div
          className={`relative flex h-36 shrink-0 items-center justify-center transition-colors duration-500 sm:h-48 lg:h-auto lg:w-[42%] ${PANEL_BG[activeSlide.panel]}`}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 p-3 sm:h-28 sm:w-28">
            <Image
              src="/fahimta.png"
              alt="FAHIMTA"
              width={160}
              height={160}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Diapositive précédente"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition-colors hover:bg-white/40 sm:left-5 sm:h-10 sm:w-10"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Diapositive suivante"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition-colors hover:bg-white/40 sm:right-5 sm:h-10 sm:w-10"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
