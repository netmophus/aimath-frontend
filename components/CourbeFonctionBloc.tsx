"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

import { CourbeSyntaxeError, parserBlocCourbe } from "@/lib/courbe";
import CourbeErreur from "./CourbeErreur";

/**
 * function-plot touche le DOM dès sa construction (d3-selection sur le
 * conteneur) : chargement dynamique SANS rendu serveur pour écarter tout
 * risque d'erreur SSR, et pour ne charger la lib (voir CourbeFonction.tsx)
 * que sur les leçons qui affichent effectivement une courbe.
 */
const CourbeFonction = dynamic(() => import("./CourbeFonction"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] w-full items-center justify-center rounded-lg border border-fh-sable bg-fh-creme text-sm text-fh-ardoise/60">
      Chargement du graphique…
    </div>
  ),
});

interface CourbeFonctionBlocProps {
  /** Texte brut du bloc ```courbe (voir docs/syntaxe-courbe.md), transporté
   * tel quel depuis lib/remarkCourbe.ts. */
  source: string;
}

/**
 * Pont entre le Markdown et le rendu interactif : parse le texte du bloc
 * (isomorphe, voir lib/courbe.ts) puis délègue au composant client. Toute
 * erreur de syntaxe s'affiche en encadré au lieu de faire planter le reste
 * de la leçon (histoire, cours, exercices…) — voir CourbeErreur.
 *
 * `useMemo` sur `source` : RenduMarkdown se re-rend à chaque frappe dans
 * l'éditeur admin (ChampMarkdown), y compris pour du texte sans rapport avec
 * ce bloc — sans ce memo, CourbeFonction recevrait un nouvel objet `data` à
 * chaque frappe et perdrait son état de zoom/pan pour rien.
 */
export default function CourbeFonctionBloc({ source }: CourbeFonctionBlocProps) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocCourbe(source) };
    } catch (erreur) {
      const message = erreur instanceof CourbeSyntaxeError ? erreur.message : "Syntaxe de courbe invalide.";
      return { ok: false as const, message };
    }
  }, [source]);

  if (!resultat.ok) {
    return <CourbeErreur message={resultat.message} />;
  }
  return <CourbeFonction data={resultat.data} />;
}
