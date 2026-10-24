"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

import { chargerGeogebra, type GgbApi } from "@/lib/geogebra";
import type { Fenetre } from "@/lib/simulations/commun";
import { useEnLigne } from "@/lib/useEnLigne";

/**
 * Cadre GeoGebra commun aux modèles de l'étape 9.3. Monté seulement après le clic de l'élève (SimulationExercice) :
 * GeoGebra n'est donc chargé qu'à la demande. Les commandes viennent des modèles (constantes + nombres validés), jamais
 * de l'IA ; si GeoGebra est indisponible, la correction reste visible et un bouton « Réessayer » est proposé.
 */

type Etat = "chargement" | "pret" | "erreur";

const CLASSE_CONTENEUR = "fh-ggb-conteneur";

const hauteurPour = (largeur: number) => Math.round(Math.min(380, Math.max(260, largeur * 0.8)));

export interface CadreGeogebraProps {
  titre: string;
  /** Commandes GeoGebra exécutées dans l'ordre. */
  commandes: string[];
  /** Objets verrouillés (non déplaçables). */
  fixes: string[];
  /** Objets créés mais masqués (points d'appui). */
  invisibles?: string[];
  /** Fenêtre de départ pour la taille réelle du cadre. */
  fenetre: (largeur: number, hauteur: number) => Fenetre;
  descriptionAccessible: string;
  /** Éléments `<li>` de la légende sous la figure (valeurs en clair, pour les lecteurs d'écran et le téléphone). */
  legende: ReactNode;
}

export default function CadreGeogebra({ titre, commandes, fixes, invisibles = [], fenetre, descriptionAccessible, legende }: CadreGeogebraProps) {
  const idConteneur = `ggb-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const enLigne = useEnLigne();
  const zoneRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<GgbApi | null>(null);
  const tailleRef = useRef({ largeur: 320, hauteur: 300 });
  const [etat, setEtat] = useState<Etat>("chargement");
  const [hauteur, setHauteur] = useState(300);

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

  const recentrer = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    const { largeur, hauteur: h } = tailleRef.current;
    const w = fenetre(largeur, h);
    api.setCoordSystem(w.xmin, w.xmax, w.ymin, w.ymax);
  }, [fenetre]);

  const lancer = useCallback(async () => {
    setEtat("chargement");
    if (!navigator.onLine) {
      setEtat("erreur");
      return;
    }
    try {
      await chargerGeogebra();
      const Applet = window.GGBApplet;
      const zone = zoneRef.current;
      if (!Applet || !zone) throw new Error("indisponible");
      const largeur = Math.max(260, Math.floor(zone.clientWidth));
      const haut = hauteurPour(largeur);
      tailleRef.current = { largeur, hauteur: haut };
      setHauteur(haut);
      zone.replaceChildren();
      const applet = new Applet(
        {
          appName: "graphing",
          id: idConteneur,
          width: largeur,
          height: haut,
          perspective: "G",
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
            api.setPerspective("G");
            commandes.forEach((commande) => api.evalCommand(commande));
            fixes.forEach((objet) => api.setFixed(objet, true, false));
            invisibles.forEach((objet) => api.setVisible(objet, false));
            const w = fenetre(largeur, haut);
            api.setCoordSystem(w.xmin, w.xmax, w.ymin, w.ymax);
            apiRef.current = api;
            setEtat("pret");
          },
        },
        true,
      );
      applet.inject(idConteneur);
    } catch {
      setEtat("erreur");
    }
  }, [idConteneur, commandes, fixes, invisibles, fenetre]);

  // Lancement unique à l'affichage du composant (c'est-à-dire après le clic « Explorer avec GeoGebra »).
  const lanceRef = useRef(false);
  useEffect(() => {
    if (lanceRef.current) return;
    lanceRef.current = true;
    void lancer();
  }, [lancer]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-fh-bleu">{titre}</p>
      <div
        className={`${CLASSE_CONTENEUR} relative w-full max-w-full overflow-hidden rounded-lg border border-fh-sable bg-white`}
        style={{ minHeight: hauteur }}
      >
        <div ref={zoneRef} id={idConteneur} role="img" aria-label={descriptionAccessible} className="w-full" />
        {etat !== "pret" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/95 px-4 text-center">
            {etat === "chargement" && (
              <p role="status" className="text-sm text-fh-ardoise">
                Chargement de GeoGebra…
              </p>
            )}
            {etat === "erreur" && (
              <>
                <p role="alert" className="flex items-start gap-2 text-sm text-amber-900">
                  <IconAlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>
                    {enLigne
                      ? "GeoGebra n'a pas pu être chargé pour le moment. Les explications restent disponibles ci-dessus."
                      : "Tu es hors connexion : la simulation a besoin d'Internet. Les explications restent disponibles ci-dessus."}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => void lancer()}
                  className="min-h-11 rounded-lg border border-fh-bleu px-4 py-2 text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-creme"
                >
                  Réessayer
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={recentrer}
          disabled={etat !== "pret"}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-fh-bleu px-3 text-sm font-semibold text-fh-bleu transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconRefresh size={16} aria-hidden="true" /> Recentrer
        </button>
      </div>

      <ul className="grid gap-1 rounded-lg bg-white px-3 py-2 text-sm text-fh-ardoise ring-1 ring-fh-sable sm:grid-cols-3">{legende}</ul>
    </div>
  );
}
