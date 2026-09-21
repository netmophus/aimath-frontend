"use client";

import { useEffect, useRef, useState } from "react";
import functionPlot, { type Chart, type FunctionPlotOptions } from "function-plot";

import { normaliserExpressionPourFunctionPlot, type CourbeAsymptote, type CourbeData } from "@/lib/courbe";
import CourbeErreur from "./CourbeErreur";

/**
 * Rendu interactif d'une courbe (function-plot). Fichier chargé UNIQUEMENT
 * côté client, via next/dynamic({ ssr: false }) dans CourbeFonctionBloc.tsx —
 * l'import statique de function-plot ci-dessous ne s'exécute donc jamais
 * pendant un rendu serveur (voir ce fichier pour le pourquoi).
 *
 * Interactivité retenue :
 * - Survol : intégré à function-plot (`tip: { xLine, yLine }`) — affiche les
 *   coordonnées du point survolé, y compris sur des courbes multiples.
 * - Zoom molette : réservé à Ctrl/Cmd+molette (voir `filtrerEvenementZoom`) —
 *   un simple survol + défilement de PAGE ne doit jamais être capté par le
 *   graphique. Le pincement tactile (mobile) et le glisser-déposer (pan)
 *   restent actifs sans modificateur. Boutons +/− et "Réinitialiser" en
 *   complément pour un zoom explicite sans molette ni tactile.
 */

// function-plot type son zoomBehavior en `any` (voir chart.d.ts) — on ne
// documente ici QUE ce dont on a besoin, pour ne jamais propager cet `any`.
interface ZoomBehaviorAvecFiltre {
  filter(predicate: (event: Event) => boolean): unknown;
}

const COULEUR_POINT = "#363032"; // fh-ardoise
const LARGEUR_MIN = 260;
const FACTEUR_ZOOM = 0.7;

function filtrerEvenementZoom(event: Event): boolean {
  if (event.type === "wheel") {
    const wheel = event as WheelEvent;
    return wheel.ctrlKey || wheel.metaKey;
  }
  // Glisser (pan) à la souris : autorisé (comportement par défaut de
  // d3-zoom, hors clic autre que le bouton principal).
  return !(event as MouseEvent).button;
}

function construireDonnees(data: CourbeData): NonNullable<FunctionPlotOptions["data"]> {
  const items: NonNullable<FunctionPlotOptions["data"]> = [];

  data.fonctions.forEach((fonction) => {
    items.push({
      fn: normaliserExpressionPourFunctionPlot(fonction.expr),
      color: fonction.couleur,
    });
  });

  data.points.forEach((point) => {
    items.push({
      fnType: "points",
      graphType: "scatter",
      points: [[point.x, point.y]],
      color: COULEUR_POINT,
      attr: { r: 4 },
    });
    if (point.etiquette) {
      items.push({
        graphType: "text",
        location: [point.x, point.y],
        text: point.etiquette,
        color: COULEUR_POINT,
        attr: { dx: 8, dy: -8, "font-size": "12px" },
      });
    }
  });

  return items;
}

function construireAnnotations(asymptotes: CourbeAsymptote[]): FunctionPlotOptions["annotations"] {
  return asymptotes.map((asymptote) =>
    asymptote.type === "verticale"
      ? { x: asymptote.valeur, text: `x = ${asymptote.valeur}` }
      : { y: asymptote.valeur, text: `y = ${asymptote.valeur}` }
  );
}

function hauteurPour(largeur: number): number {
  return Math.round(Math.min(320, Math.max(220, largeur * 0.65)));
}

interface CourbeFonctionProps {
  data: CourbeData;
}

export default function CourbeFonction({ data }: CourbeFonctionProps) {
  const conteneurRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<FunctionPlotOptions | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const [largeur, setLargeur] = useState(LARGEUR_MIN);
  const [erreurRendu, setErreurRendu] = useState<string | null>(null);

  // Mesure la largeur réelle du conteneur, une fois posé puis à chaque
  // redimensionnement (rotation d'écran, panneau admin qui s'ouvre/ferme…).
  useEffect(() => {
    const conteneur = conteneurRef.current;
    if (!conteneur) return;

    const observeur = new ResizeObserver((entrees) => {
      const mesure = entrees[0]?.contentRect.width;
      if (!mesure) return;
      const nouvelleLargeur = Math.max(LARGEUR_MIN, Math.floor(mesure));
      setLargeur((precedente) => (precedente === nouvelleLargeur ? precedente : nouvelleLargeur));
    });
    observeur.observe(conteneur);
    return () => observeur.disconnect();
  }, []);

  // (Re)construit le graphique quand le contenu du bloc change (nouvelle
  // fonction/domaine/points — CourbeFonctionBloc ne recrée `data` que si le
  // texte source a réellement changé, voir son useMemo) ou que la largeur
  // mesurée change. Reconstruction complète à chaque fois : plus simple et
  // toujours correct, au prix de perdre un zoom en cours lors d'un simple
  // redimensionnement — compromis raisonnable pour cette première itération.
  useEffect(() => {
    const conteneur = conteneurRef.current;
    if (!conteneur) return;

    // La construction du graphique (effet DOM voulu) reste synchrone ici ;
    // seule la mise à jour de l'état d'erreur est différée dans un callback
    // (`queueMicrotask`, résolu avant la prochaine peinture) pour ne jamais
    // appeler setState en cascade directement dans le corps de l'effet.
    let messageErreur: string | null = null;
    try {
      optionsRef.current = {
        target: conteneur,
        width: largeur,
        height: hauteurPour(largeur),
        grid: true,
        tip: { xLine: true, yLine: true },
        xDomain: [...data.domaineX],
        yDomain: data.domaineY ? [...data.domaineY] : undefined,
        data: construireDonnees(data),
        annotations: construireAnnotations(data.asymptotes),
      };
      const chart = functionPlot(optionsRef.current);
      chartRef.current = chart;

      const zoom = chart.meta.zoomBehavior as ZoomBehaviorAvecFiltre | undefined;
      zoom?.filter(filtrerEvenementZoom);
    } catch {
      // Une expression validée à un point de contrôle (lib/courbe.ts) peut
      // malgré tout dérouter le moteur de tracé ailleurs sur le domaine —
      // filet de sécurité pour ne jamais planter tout le rendu Markdown.
      messageErreur = "Impossible d'afficher cette courbe (expression non calculable sur ce domaine).";
    }
    queueMicrotask(() => setErreurRendu(messageErreur));
  }, [data, largeur]);

  function reconstruire(xDomain: [number, number], yDomain: [number, number] | undefined) {
    const options = optionsRef.current;
    if (!options) return;
    options.xDomain = xDomain;
    options.yDomain = yDomain;
    functionPlot(options); // même objet `options` → même instance de Chart (voir doc function-plot)
  }

  function zoomer(facteur: number) {
    const options = optionsRef.current;
    if (!options?.xDomain) return;
    const [xMin, xMax] = options.xDomain;
    const centreX = (xMin + xMax) / 2;
    const demiX = ((xMax - xMin) / 2) * facteur;
    const nouveauX: [number, number] = [centreX - demiX, centreX + demiX];

    let nouveauY: [number, number] | undefined;
    if (options.yDomain) {
      const [yMin, yMax] = options.yDomain;
      const centreY = (yMin + yMax) / 2;
      const demiY = ((yMax - yMin) / 2) * facteur;
      nouveauY = [centreY - demiY, centreY + demiY];
    }
    reconstruire(nouveauX, nouveauY);
  }

  function reinitialiser() {
    reconstruire([...data.domaineX], data.domaineY ? [...data.domaineY] : undefined);
  }

  const legende = data.fonctions.filter((f) => f.nom);

  return (
    <div className="w-full max-w-full">
      <div
        ref={conteneurRef}
        role="img"
        aria-label={`Graphique de ${data.fonctions.map((f) => f.nom ?? f.expr).join(", ")}`}
        className="w-full overflow-hidden rounded-lg border border-fh-sable bg-white"
      />

      {erreurRendu && (
        <div className="mt-2">
          <CourbeErreur message={erreurRendu} />
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-fh-ardoise/70">
        {legende.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {legende.map((fonction) => (
              <li key={fonction.expr} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: fonction.couleur }}
                />
                {fonction.nom}
              </li>
            ))}
          </ul>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1">
          <span className="hidden sm:inline">Ctrl + molette ou pincez pour zoomer</span>
          <button
            type="button"
            onClick={() => zoomer(FACTEUR_ZOOM)}
            aria-label="Zoomer"
            title="Zoomer"
            className="rounded border border-fh-sable px-2 py-0.5 font-semibold text-fh-bleu transition-colors hover:bg-fh-creme"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomer(1 / FACTEUR_ZOOM)}
            aria-label="Dézoomer"
            title="Dézoomer"
            className="rounded border border-fh-sable px-2 py-0.5 font-semibold text-fh-bleu transition-colors hover:bg-fh-creme"
          >
            −
          </button>
          <button
            type="button"
            onClick={reinitialiser}
            className="rounded border border-fh-sable px-2 py-0.5 text-fh-bleu transition-colors hover:bg-fh-creme"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
