"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

import RenduMarkdown from "@/components/RenduMarkdown";
import { useEnLigne } from "@/lib/useEnLigne";
import { COMMANDES_CUBIQUE, CUBIQUE, chargerGeogebra, formaterA, normaliserA, type GgbApi } from "@/lib/geogebra";

/**
 * PROTOTYPE PRIVÉ (8B.1) : simulation visuelle de f(x) = x³ − 3ax avec GeoGebra. Le curseur est celui de React ;
 * GeoGebra ne reçoit que `setValue("a", …)` : la courbe change dans le navigateur, sans requête au backend.
 * Ce composant n'est monté que par la page de laboratoire (développement local) : aucune leçon ne l'utilise.
 */

type Etat = "inactif" | "chargement" | "pret" | "erreur";

const CLASSE_CONTENEUR = "fh-ggb-conteneur"; // `scaleContainerClass` : GeoGebra s'adapte à la largeur de ce bloc

function hauteurPour(largeur: number): number {
  return Math.round(Math.min(420, Math.max(280, largeur * 0.85)));
}

function Tex({ children }: { children: string }) {
  return <RenduMarkdown contenu={`$${children}$`} className="rendu-markdown inline rendu-en-ligne" />;
}

export default function SimulationGeogebraCubique() {
  const idConteneur = `ggb-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const enLigne = useEnLigne();
  const zoneRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<GgbApi | null>(null);
  const aRef = useRef<number>(CUBIQUE.aInitial);
  const [etat, setEtat] = useState<Etat>("inactif");
  const [message, setMessage] = useState("");
  const [a, setA] = useState<number>(CUBIQUE.aInitial);
  const [hauteur, setHauteur] = useState(300);

  // Démontage : on libère l'applet GeoGebra et on vide le conteneur.
  useEffect(() => {
    const zone = zoneRef.current;
    return () => {
      try {
        apiRef.current?.remove();
      } catch {
        // l'applet n'existe déjà plus
      }
      apiRef.current = null;
      zone?.replaceChildren();
    };
  }, []);

  // Changement du curseur → GeoGebra (immédiat, côté navigateur).
  useEffect(() => {
    aRef.current = a;
    apiRef.current?.setValue("a", a);
  }, [a]);

  const lancer = useCallback(async () => {
    const zone = zoneRef.current;
    if (!zone) return;
    if (!navigator.onLine) {
      setMessage("Tu es hors connexion : la simulation a besoin d'Internet pour se charger. Le reste de la leçon reste disponible.");
      setEtat("erreur");
      return;
    }
    setEtat("chargement");
    setMessage("");
    try {
      await chargerGeogebra();
      const Applet = window.GGBApplet;
      if (!Applet || !zoneRef.current) throw new Error("indisponible");
      const largeur = Math.max(260, Math.floor(zoneRef.current.clientWidth));
      const haut = hauteurPour(largeur);
      setHauteur(haut);
      zoneRef.current.replaceChildren();
      const applet = new Applet(
        {
          appName: "graphing",
          id: idConteneur,
          width: largeur,
          height: haut,
          perspective: "G", // fenêtre graphique seule
          showToolBar: false,
          showAlgebraInput: false,
          showMenuBar: false,
          showZoomButtons: true,
          showFullscreenButton: false,
          enableRightClick: false,
          enableLabelDrags: false,
          errorDialogsActive: false,
          preventFocus: true,
          language: "fr",
          scaleContainerClass: CLASSE_CONTENEUR,
          autoHeight: false,
          appletOnLoad: (api: GgbApi) => {
            if (!zoneRef.current) {
              api.remove();
              return;
            }
            api.setPerspective("G"); // fenêtre graphique seule (le paramètre `perspective` n'est pas toujours respecté)
            COMMANDES_CUBIQUE.forEach((commande) => api.evalCommand(commande));
            api.setFixed("f", true, false);
            api.setValue("a", aRef.current);
            const w = CUBIQUE.fenetre;
            api.setCoordSystem(w.xmin, w.xmax, w.ymin, w.ymax);
            apiRef.current = api;
            setEtat("pret");
          },
        },
        true,
      );
      applet.inject(idConteneur);
    } catch {
      setMessage(
        navigator.onLine
          ? "GeoGebra n'a pas pu être chargé pour le moment. Réessaie dans un instant ; le reste de la leçon fonctionne normalement."
          : "Tu es hors connexion : la simulation a besoin d'Internet pour se charger. Le reste de la leçon reste disponible.",
      );
      setEtat("erreur");
    }
  }, [idConteneur]);

  function reinitialiser() {
    setA(CUBIQUE.aInitial);
    const api = apiRef.current;
    if (api) {
      api.setValue("a", CUBIQUE.aInitial);
      const w = CUBIQUE.fenetre;
      api.setCoordSystem(w.xmin, w.xmax, w.ymin, w.ymax);
    }
  }

  const actif = etat === "pret";

  return (
    <section aria-label="Simulation interactive — Étude de fonctions" className="flex flex-col gap-3 rounded-xl bg-fh-creme px-3 py-3 ring-1 ring-fh-sable">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-fh-bleu">Simulation interactive — Étude de fonctions</h2>
        <span className="rounded-full bg-fh-sable px-2 py-0.5 text-xs font-semibold text-fh-ardoise">Prototype privé</span>
      </header>

      <div className="text-sm text-fh-ardoise">
        <Tex>{"f(x) = x^3 - 3ax"}</Tex>, avec <Tex>{"a"}</Tex> entre <Tex>{"-3"}</Tex> et <Tex>{"3"}</Tex>.
      </div>

      <div
        className={`${CLASSE_CONTENEUR} relative w-full max-w-full overflow-hidden rounded-lg border border-fh-sable bg-white`}
        style={{ minHeight: hauteur }}
      >
        <div ref={zoneRef} id={idConteneur} aria-label="Graphique GeoGebra de f(x) = x³ − 3ax" role="img" className="w-full" />
        {etat !== "pret" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/95 px-4 text-center">
            {etat === "inactif" && (
              <>
                <p className="text-sm text-fh-ardoise">La simulation se charge à la demande (connexion Internet nécessaire).</p>
                <button
                  type="button"
                  onClick={lancer}
                  className="rounded-lg bg-fh-bleu px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fh-bleu-vif"
                >
                  Lancer la simulation
                </button>
                {!enLigne && <p className="text-xs text-amber-800">Tu es actuellement hors connexion.</p>}
              </>
            )}
            {etat === "chargement" && (
              <p role="status" className="text-sm text-fh-ardoise">
                Chargement de GeoGebra…
              </p>
            )}
            {etat === "erreur" && (
              <>
                <p role="alert" className="flex items-start gap-2 text-sm text-amber-900">
                  <IconAlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>{message}</span>
                </p>
                <button
                  type="button"
                  onClick={lancer}
                  className="rounded-lg border border-fh-bleu px-4 py-2 text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-creme"
                >
                  Réessayer
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={`${idConteneur}-a`} className="text-sm font-semibold text-fh-bleu">
            Paramètre a = <span data-testid="valeur-a">{formaterA(a)}</span>
          </label>
          <button
            type="button"
            onClick={reinitialiser}
            disabled={!actif}
            className="inline-flex items-center gap-1 rounded-lg border border-fh-bleu px-3 py-1.5 text-sm font-semibold text-fh-bleu transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconRefresh size={16} aria-hidden="true" /> Réinitialiser
          </button>
        </div>
        <input
          id={`${idConteneur}-a`}
          type="range"
          min={CUBIQUE.aMin}
          max={CUBIQUE.aMax}
          step={CUBIQUE.pas}
          value={a}
          disabled={!actif}
          onChange={(e) => setA(normaliserA(Number(e.target.value)))}
          aria-valuetext={`a égale ${formaterA(a)}`}
          className="h-8 w-full accent-fh-orange disabled:opacity-40"
        />
        <div className="flex justify-between text-xs text-fh-ardoise/70" aria-hidden="true">
          <span>−3</span>
          <span>0</span>
          <span>3</span>
        </div>
      </div>

      <p className="rounded-lg bg-white px-3 py-2 text-xs text-fh-ardoise ring-1 ring-fh-sable">
        Simulation visuelle pour observer l&apos;effet du paramètre : ce n&apos;est pas une vérification mathématique par SymPy. Les
        extrema et les variations vérifiés se trouvent dans la correction calculée par le moteur de vérification.{" "}
        <span className="text-fh-ardoise/60">
          Made with GeoGebra® — <a href="https://www.geogebra.org" target="_blank" rel="noopener noreferrer" className="underline">geogebra.org</a>
        </span>
      </p>
    </section>
  );
}
