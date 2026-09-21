"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { getTermeGlossaire, type TermeGlossaireEleve } from "@/lib/eleveApi";
import Modal from "@/components/admin/Modal";
import RenduMarkdown from "@/components/RenduMarkdown";

interface ModaleTermeProps {
  /** Slug du terme à afficher ; la modale est fermée quand null. */
  slug: string | null;
  onClose: () => void;
  /** Fourni quand la leçon en cours de lecture vient du stockage hors-ligne
   * (voir app/eleve/lecons/[id]/page.tsx) : la modale résout alors le terme
   * depuis ce dictionnaire (stocké avec la leçon), jamais par appel réseau.
   * Absent → comportement normal en ligne (appel API + cache local). */
  termesLocaux?: Record<string, TermeGlossaireEleve>;
  /** En mode hors-ligne (termesLocaux fourni) : ensemble des identifiants de
   * leçons elles-mêmes téléchargées — le bouton "Voir la leçon" ne s'affiche
   * que si la leçon liée en fait partie (y aller hors-ligne sans ça mènerait
   * à une leçon indisponible). Ignoré en ligne, où le lien est toujours
   * proposé si l'API l'expose. */
  leconsDisponibles?: Set<number>;
}

type EtatTerme =
  | { statut: "chargement" }
  | { statut: "succes"; terme: TermeGlossaireEleve }
  | { statut: "erreur" };

/**
 * Modale ouverte depuis un [[slug]] cliqué dans une leçon (voir
 * RenduMarkdown et app/eleve/lecons/[id]/page.tsx). Met en cache les termes
 * déjà chargés (mode en ligne) dans une ref (survit aux ouvertures/
 * fermetures tant que la page de lecture reste montée) : cliquer deux fois
 * sur [[primitive]] ne refait pas l'appel réseau la seconde fois.
 *
 * La définition/l'exemple sont rendus SANS onTermeClick : pas de terme
 * cliquable imbriqué dans une modale, pour éviter une cascade de modales.
 */
export default function ModaleTerme({ slug, onClose, termesLocaux, leconsDisponibles }: ModaleTermeProps) {
  const cache = useRef<Map<string, TermeGlossaireEleve | null>>(new Map());
  const [etat, setEtat] = useState<EtatTerme | null>(null);

  useEffect(() => {
    // Rien à faire quand la modale est fermée (slug null) : le rendu
    // s'arrête déjà sur `!slug` plus bas, `etat` n'a pas besoin d'être
    // réinitialisé pour ça.
    if (!slug) return;

    if (termesLocaux) {
      // Lecture hors-ligne : résolution instantanée depuis le dictionnaire
      // stocké avec la leçon, jamais d'appel réseau (voir lib/offlineStore.ts).
      // queueMicrotask plutôt qu'un setState synchrone direct ici (règle
      // react-hooks/set-state-in-effect).
      const terme = termesLocaux[slug];
      let actif = true;
      queueMicrotask(() => {
        if (actif) setEtat(terme ? { statut: "succes", terme } : { statut: "erreur" });
      });
      return () => {
        actif = false;
      };
    }

    const enCache = cache.current.get(slug);
    if (enCache !== undefined) {
      setEtat(enCache ? { statut: "succes", terme: enCache } : { statut: "erreur" });
      return;
    }

    let actif = true;
    setEtat({ statut: "chargement" });

    getTermeGlossaire(slug)
      .then((terme) => {
        cache.current.set(slug, terme);
        if (actif) setEtat({ statut: "succes", terme });
      })
      .catch(() => {
        // 404 (terme supprimé) ou erreur réseau : même message court dans
        // les deux cas, on ne distingue pas — un [[slug]] cassé reste rare
        // et ne doit surtout pas faire planter la lecture de la leçon.
        cache.current.set(slug, null);
        if (actif) setEtat({ statut: "erreur" });
      });

    return () => {
      actif = false;
    };
  }, [slug, termesLocaux]);

  if (!slug || !etat) return null;

  const titre = etat.statut === "succes" ? etat.terme.terme : "Définition";

  return (
    <Modal titre={titre} onClose={onClose}>
      <div className="max-h-[60vh] overflow-y-auto">
        {etat.statut === "chargement" && (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="Chargement de la définition">
            <div className="h-4 w-3/4 animate-pulse rounded bg-fh-sable/50" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-fh-sable/50" />
          </div>
        )}

        {etat.statut === "erreur" && <p className="text-sm text-fh-ardoise">Définition indisponible.</p>}

        {etat.statut === "succes" && (
          <div className="flex flex-col gap-4">
            <RenduMarkdown contenu={etat.terme.definition} />

            {etat.terme.exemple && (
              <div className="rounded-xl bg-fh-creme px-3 py-3">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-fh-ardoise/60">Exemple</p>
                <RenduMarkdown contenu={etat.terme.exemple} />
              </div>
            )}

            {etat.terme.lecon_liee &&
              (!termesLocaux || leconsDisponibles?.has(etat.terme.lecon_liee.id)) && (
                <Link
                  href={`/eleve/lecons/${etat.terme.lecon_liee.id}`}
                  onClick={onClose}
                  className="inline-flex w-fit min-h-11 items-center justify-center rounded-full bg-fh-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
                >
                  Voir la leçon
                </Link>
              )}
          </div>
        )}
      </div>
    </Modal>
  );
}
