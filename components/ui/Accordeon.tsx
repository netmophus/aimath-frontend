"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";

export interface ItemAccordeon {
  /** Titre du panneau (toujours visible). */
  titre: ReactNode;
  /** Contenu du panneau (visible seulement quand il est ouvert). */
  contenu: ReactNode;
  /** Petite étiquette à droite du titre (ex. « étape en cours »). */
  badge?: ReactNode;
}

interface AccordeonProps {
  /** Titre de la section, au-dessus des panneaux (optionnel). */
  titre?: ReactNode;
  items: ItemAccordeon[];
  /** Un seul panneau ouvert à la fois (défaut : oui). */
  ouvertUnSeul?: boolean;
  /** Numérote les panneaux dans une pastille de la couleur d'accent (défaut : non). */
  numerote?: boolean;
  /** Couleur d'accent. Défaut : celle de l'onglet en cours (variable CSS --couleur-onglet posée par LaboOnglets), sinon fh-orange. */
  couleur?: string;
  /** Indices des panneaux ouverts au départ (défaut : tous repliés). */
  ouvertsAuDepart?: number[];
}

/**
 * Accordéon réutilisable : titres repliés au départ, un clic ouvre ou ferme le panneau (indicateur + / −).
 * Boutons natifs avec aria-expanded ; le contenu replié est retiré de l'arbre d'accessibilité (inert + visibility).
 */
export default function Accordeon({ titre, items, ouvertUnSeul = true, numerote = false, couleur, ouvertsAuDepart = [] }: AccordeonProps) {
  const [ouverts, setOuverts] = useState<number[]>(ouvertUnSeul ? ouvertsAuDepart.slice(0, 1) : ouvertsAuDepart);
  const id = useId();
  const style = { "--accent": couleur ?? "var(--couleur-onglet, var(--color-fh-orange))" } as CSSProperties;

  const bascule = (i: number) =>
    setOuverts((o) => (o.includes(i) ? o.filter((k) => k !== i) : ouvertUnSeul ? [i] : [...o, i]));

  return (
    <div className="rounded-xl border border-fh-sable bg-white/70 p-3 sm:p-4" style={style}>
      {titre && <p className="mb-2 text-base font-bold text-fh-bleu">{titre}</p>}
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => {
          const ouvert = ouverts.includes(i);
          return (
            <li key={i} className="overflow-hidden rounded-lg border border-fh-sable bg-white">
              <h4>
                <button
                  type="button"
                  onClick={() => bascule(i)}
                  aria-expanded={ouvert}
                  aria-controls={`${id}-${i}`}
                  className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-semibold text-fh-bleu transition-colors hover:bg-fh-accent/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--accent) motion-reduce:transition-none"
                >
                  {numerote && (
                    <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--accent) text-sm text-white">
                      {i + 1}
                    </span>
                  )}
                  <span className="flex-1">{item.titre}</span>
                  {item.badge && <span className="rounded-full bg-fh-accent px-2 py-0.5 text-xs font-bold text-fh-orange-fonce">{item.badge}</span>}
                  <span aria-hidden="true" className="w-5 shrink-0 text-center text-xl font-bold leading-none text-(--accent)">
                    {ouvert ? "−" : "+"}
                  </span>
                </button>
              </h4>
              <div
                id={`${id}-${i}`}
                role="region"
                inert={!ouvert}
                className={`grid transition-[grid-template-rows,visibility] duration-200 motion-reduce:transition-none ${ouvert ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="px-3 pb-3 pt-1 leading-8 text-fh-ardoise">{item.contenu}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
