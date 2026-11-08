"use client";

import { useRef, useState, type ReactNode } from "react";

import RenduMarkdown from "@/components/RenduMarkdown";
import Toast from "@/components/admin/Toast";
import SelecteurTermeModal from "./SelecteurTermeModal";
import { SQUELETTE_LABO_COMPLEXES, contientLaboComplexes } from "@/lib/laboComplexes";
import { SQUELETTE_LABO_MOIVRE, contientLaboMoivre } from "@/lib/laboMoivre";
import { SQUELETTE_LABO_EQUATIONS, contientLaboEquations } from "@/lib/laboEquations";

interface ChampMarkdownProps {
  /** Omis quand le champ vit déjà sous un titre de section porteur du même sens. */
  label?: string;
  valeur: string;
  onChange: (valeur: string) => void;
  placeholder?: string;
  /** Hauteur des deux colonnes, en pixels (défaut 180). */
  hauteur?: number;
  /** Affiche "+ Insérer un terme" au-dessus du champ : ouvre le glossaire et
   * insère [[slug|texte]] à la position du curseur (voir insererMarqueur). */
  avecInsertionTerme?: boolean;
  /** Affiche "+ Insérer une courbe" : insère un squelette de bloc ```courbe
   * pré-rempli à la position du curseur (voir docs/syntaxe-courbe.md pour la
   * syntaxe). Pas de modale ici — contrairement au glossaire, il n'y a rien
   * à choisir, juste un gabarit à adapter sur place. */
  avecInsertionCourbe?: boolean;
  /** Affiche "+ Insérer un tableau de variations" : insère un squelette de
   * bloc ```variations pré-rempli (voir docs/syntaxe-variations.md). Même
   * mécanique que "+ Insérer une courbe" — un exemple concret à adapter. */
  avecInsertionVariations?: boolean;
  /** Affiche "+ Insérer une horloge modulaire" : insère un squelette de bloc
   * ```horloge pré-rempli (voir docs/syntaxe-horloge.md). */
  avecInsertionHorloge?: boolean;
  /** Affiche "+ Insérer un calculateur de congruence" : insère un bloc ```congruence (voir docs/syntaxe-congruence.md). */
  avecInsertionCongruence?: boolean;
  /** Affiche "+ Insérer le laboratoire PGCD & PPCM" : insère un bloc ```pgcd (voir docs/syntaxe-pgcd.md). */
  avecInsertionLaboPgcd?: boolean;
  /** Affiche "+ Insérer le labo Nombres premiers" : insère un bloc ```premiers (voir docs/syntaxe-premiers.md), sans doublon. */
  avecInsertionLaboPremiers?: boolean;
  /** Affiche "+ Insérer le labo Nombres complexes" : insère un bloc ```complexes (voir docs/syntaxe-complexes.md), sans doublon. */
  avecInsertionLaboComplexes?: boolean;
  /** Affiche "+ Insérer le labo Moivre" : insère un bloc ```labo-moivre (Moivre, Euler, racines n-ièmes ; voir docs/syntaxe-labo-moivre.md). */
  avecInsertionLaboMoivre?: boolean;
  /** Affiche "+ Insérer le labo Équations complexes" : insère un bloc ```labo-equations-complexes (voir docs/syntaxe-labo-equations-complexes.md). */
  avecInsertionLaboEquations?: boolean;
  /** Affiche "+ Insérer un convertisseur binaire" : insère un squelette de
   * bloc ```binaire pré-rempli (voir docs/syntaxe-binaire.md). */
  avecInsertionBinaire?: boolean;
  /** Affiche "+ Insérer un cercle trigonométrique" : insère un squelette de
   * bloc ```cercletrigo pré-rempli (voir docs/syntaxe-cercletrigo.md). */
  avecInsertionCercleTrigo?: boolean;
  /** Affiche "+ Insérer des racines n-ièmes" : insère un squelette de bloc
   * ```racines pré-rempli (voir docs/syntaxe-racines.md). */
  avecInsertionRacines?: boolean;
  /** Affiche "+ Insérer une simulation de mouvement" : insère un squelette de
   * bloc ```mouvement pré-rempli (voir docs/syntaxe-mouvement.md). */
  avecInsertionMouvement?: boolean;
  /** Affiche "+ Insérer une simulation de mouvement circulaire" : insère un
   * squelette de bloc ```circulaire pré-rempli (voir docs/syntaxe-circulaire.md). */
  avecInsertionCirculaire?: boolean;
  /** Affiche "+ Insérer un plan incliné" : insère un squelette de bloc
   * ```plan-incline pré-rempli (voir docs/syntaxe-plan-incline.md). */
  avecInsertionPlanIncline?: boolean;
  /** Point d'extension générique pour une action supplémentaire affichée dans
   * la même barre que "+ Insérer un terme" (ex. BoutonGenererSectionIA) —
   * ChampMarkdown reste agnostique de ce qu'il rend là. */
  actionsSupplementaires?: ReactNode;
}

/** Gabarit inséré par "+ Insérer une courbe" — un exemple complet plutôt
 * qu'un squelette vide : l'admin voit tout de suite la syntaxe à l'œuvre et
 * n'a qu'à remplacer les valeurs. Voir docs/syntaxe-courbe.md. */
const SQUELETTE_COURBE = `

\`\`\`courbe
fonction: ln(x)
couleur: orange
nom: y = ln(x)
domaine: 0.1, 5
point: 1, 0
point: e, 1, (e ; 1)
asymptote-verticale: 0
\`\`\`

`;

/** Gabarit inséré par "+ Insérer un tableau de variations" — l'exemple
 * croissante-décroissante-croissante de la doc (voir docs/syntaxe-variations.md). */
const SQUELETTE_VARIATIONS = `

\`\`\`variations
fonction: f
x: -inf, 1, 3, +inf
signe: +, -, +
f: -inf, 3, -1, +inf
\`\`\`

`;

/** Gabarit inséré par "+ Insérer une horloge modulaire" — voir docs/syntaxe-horloge.md. */
const SQUELETTE_HORLOGE = `

\`\`\`horloge
modulo: 12
\`\`\`

`;

/** Gabarit inséré par "+ Insérer un calculateur de congruence" — voir docs/syntaxe-congruence.md. */
const SQUELETTE_CONGRUENCE = `

\`\`\`congruence
a: 17
b: 3
n: 5
\`\`\`

`;

/** Gabarit inséré par "+ Insérer le laboratoire PGCD & PPCM" — voir docs/syntaxe-pgcd.md. */
const SQUELETTE_LABO_PGCD = `

\`\`\`pgcd
onglet: euclide
\`\`\`

`;

/** Gabarit inséré par "+ Insérer le labo Nombres premiers" — voir docs/syntaxe-premiers.md. */
const SQUELETTE_LABO_PREMIERS = `

\`\`\`premiers
onglet: crible
\`\`\`

`;

/** Gabarit inséré par "+ Insérer un convertisseur binaire" — voir docs/syntaxe-binaire.md. */
const SQUELETTE_BINAIRE = `

\`\`\`binaire
valeur: 13
max: 255
\`\`\`

`;

/** Gabarit inséré par "+ Insérer un cercle trigonométrique" — voir docs/syntaxe-cercletrigo.md. */
const SQUELETTE_CERCLETRIGO = `

\`\`\`cercletrigo
angle: 60
montrer_projections: true
label: z
\`\`\`

`;

/** Gabarit inséré par "+ Insérer des racines n-ièmes" — voir docs/syntaxe-racines.md. */
const SQUELETTE_RACINES = `

\`\`\`racines
n: 5
module: 1
argument: 0
\`\`\`

`;

/** Gabarit inséré par "+ Insérer une simulation de mouvement" — voir docs/syntaxe-mouvement.md. */
const SQUELETTE_MOUVEMENT = `

\`\`\`mouvement
x0: 0
v0: 2
a: 1
duree: 10
\`\`\`

`;

/** Gabarit inséré par "+ Insérer une simulation de mouvement circulaire" — voir docs/syntaxe-circulaire.md. */
const SQUELETTE_CIRCULAIRE = `

\`\`\`circulaire
rayon: 1
omega: 2
duree: 10
\`\`\`

`;

/** Gabarit inséré par "+ Insérer un plan incliné" — voir docs/syntaxe-plan-incline.md. */
const SQUELETTE_PLAN_INCLINE = `

\`\`\`plan-incline
angle: 30
masse: 2
\`\`\`

`;

/**
 * Éditeur Markdown+LaTeX côte à côte : saisie à gauche, aperçu KaTeX en
 * direct à droite (RenduMarkdown). Empilé sur mobile (édition au-dessus).
 *
 * Insertion de terme : le champ garde une ref sur son <textarea> et calcule
 * lui-même l'insertion (selectionStart/selectionEnd du DOM, pas d'état React
 * pour la position du curseur — elle n'a besoin d'exister qu'au moment du
 * clic sur "Insérer"). Volontairement PAS de useImperativeHandle/ref exposée
 * au parent : la modale de sélection est ouverte et fermée ICI, dans le même
 * composant qui possède déjà le curseur et `valeur`/`onChange` — inutile de
 * faire remonter cet état à app/admin/lecons/[id]/page.tsx, qui n'a besoin de
 * rien savoir de tout ça. Ça marche aussi tel quel pour une liste dynamique
 * de champs (les énoncés/corrigés d'exercices) sans plomberie de refs par
 * élément de liste.
 */
export default function ChampMarkdown({
  label,
  valeur,
  onChange,
  placeholder,
  hauteur = 180,
  avecInsertionTerme = false,
  avecInsertionCourbe = false,
  avecInsertionVariations = false,
  avecInsertionHorloge = false,
  avecInsertionCongruence = false,
  avecInsertionLaboPgcd = false,
  avecInsertionLaboPremiers = false,
  avecInsertionLaboComplexes = false,
  avecInsertionLaboMoivre = false,
  avecInsertionLaboEquations = false,
  avecInsertionBinaire = false,
  avecInsertionCercleTrigo = false,
  avecInsertionRacines = false,
  avecInsertionMouvement = false,
  avecInsertionCirculaire = false,
  avecInsertionPlanIncline = false,
  actionsSupplementaires,
}: ChampMarkdownProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selecteurOuvert, setSelecteurOuvert] = useState(false);
  const [messageToast, setMessageToast] = useState<string | null>(null);

  function insererMarqueur(marqueur: string, message: string) {
    const el = textareaRef.current;
    const debut = el?.selectionStart ?? valeur.length;
    const fin = el?.selectionEnd ?? valeur.length;

    onChange(valeur.slice(0, debut) + marqueur + valeur.slice(fin));
    setSelecteurOuvert(false);
    setMessageToast(message);

    // Le textarea n'a pas encore la nouvelle valeur (onChange vient de
    // déclencher un re-render asynchrone) : on replace le curseur juste
    // après, une fois le DOM à jour.
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const position = debut + marqueur.length;
      el.setSelectionRange(position, position);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {(label ||
        avecInsertionTerme ||
        avecInsertionCourbe ||
        avecInsertionVariations ||
        avecInsertionHorloge ||
        avecInsertionCongruence ||
        avecInsertionLaboPgcd ||
        avecInsertionLaboPremiers ||
        avecInsertionLaboComplexes ||
        avecInsertionLaboMoivre ||
        avecInsertionLaboEquations ||
        avecInsertionBinaire ||
        avecInsertionCercleTrigo ||
        avecInsertionRacines ||
        avecInsertionMouvement ||
        avecInsertionCirculaire ||
        avecInsertionPlanIncline ||
        actionsSupplementaires) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-fh-bleu">{label}</span>
          <div className="flex flex-wrap items-center gap-2">
            {actionsSupplementaires}
            {avecInsertionCourbe && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_COURBE, "Bloc courbe inséré — adapte les valeurs.")}
                title="Insère un exemple de bloc courbe à adapter"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer une courbe
              </button>
            )}
            {avecInsertionVariations && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_VARIATIONS, "Bloc tableau de variations inséré — adapte les valeurs.")}
                title="Insère un exemple de tableau de variations à adapter"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer un tableau de variations
              </button>
            )}
            {avecInsertionHorloge && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_HORLOGE, "Bloc horloge modulaire inséré — adapte le modulo.")}
                title="Insère une horloge modulaire à adapter"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer une horloge modulaire
              </button>
            )}
            {avecInsertionCongruence && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_CONGRUENCE, "Bloc calculateur de congruence inséré — adapte a, b et n.")}
                title="Insère un calculateur de congruence à adapter"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer un calculateur de congruence
              </button>
            )}
            {avecInsertionLaboPgcd && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_LABO_PGCD, "Laboratoire PGCD & PPCM inséré — choisis l'onglet affiché à l'ouverture.")}
                title="Insère le laboratoire interactif PGCD & PPCM (six simulations)"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer le laboratoire PGCD &amp; PPCM
              </button>
            )}
            {avecInsertionLaboPremiers && (
              <button
                type="button"
                onClick={() => {
                  if (/^\s*```premiers\b/m.test(valeur)) {
                    setMessageToast("Le laboratoire Nombres premiers est déjà présent dans cette rubrique : aucune insertion en double.");
                    return;
                  }
                  insererMarqueur(SQUELETTE_LABO_PREMIERS, "Laboratoire Nombres premiers inséré — choisis l'onglet affiché à l'ouverture.");
                }}
                title="Insère le laboratoire interactif des nombres premiers (six simulations)"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer le labo Nombres premiers
              </button>
            )}
            {avecInsertionLaboComplexes && (
              <button
                type="button"
                onClick={() => {
                  if (contientLaboComplexes(valeur)) {
                    setMessageToast("Le laboratoire Nombres complexes est déjà présent dans cette rubrique : aucune insertion en double.");
                    return;
                  }
                  insererMarqueur(SQUELETTE_LABO_COMPLEXES, "Laboratoire Nombres complexes inséré — choisis l'onglet affiché à l'ouverture.");
                }}
                title="Insère le laboratoire interactif des nombres complexes (six simulations)"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer le labo Nombres complexes
              </button>
            )}
            {avecInsertionLaboMoivre && (
              <button
                type="button"
                onClick={() => {
                  if (contientLaboMoivre(valeur)) {
                    setMessageToast("Le laboratoire Moivre est déjà présent dans cette rubrique : aucune insertion en double.");
                    return;
                  }
                  insererMarqueur(SQUELETTE_LABO_MOIVRE, "Laboratoire Moivre inséré — choisis l'onglet affiché à l'ouverture.");
                }}
                title="Insère le laboratoire interactif Moivre, Euler et racines n-ièmes (six simulations)"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer le labo Moivre
              </button>
            )}
            {avecInsertionLaboEquations && (
              <button
                type="button"
                onClick={() => {
                  if (contientLaboEquations(valeur)) {
                    setMessageToast("Le laboratoire Équations complexes est déjà présent dans cette rubrique : aucune insertion en double.");
                    return;
                  }
                  insererMarqueur(SQUELETTE_LABO_EQUATIONS, "Laboratoire Équations complexes inséré — choisis l'onglet affiché à l'ouverture.");
                }}
                title="Insère le laboratoire interactif Équations complexes (cinq simulations)"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer le labo Équations complexes
              </button>
            )}
            {avecInsertionBinaire && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_BINAIRE, "Bloc convertisseur binaire inséré — adapte les valeurs.")}
                title="Insère un convertisseur binaire à adapter"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer un convertisseur binaire
              </button>
            )}
            {avecInsertionCercleTrigo && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_CERCLETRIGO, "Bloc cercle trigonométrique inséré — adapte l'angle.")}
                title="Insère un cercle trigonométrique à adapter"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer un cercle trigonométrique
              </button>
            )}
            {avecInsertionRacines && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_RACINES, "Bloc racines n-ièmes inséré — adapte les valeurs.")}
                title="Insère une figure de racines n-ièmes à adapter"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer des racines n-ièmes
              </button>
            )}
            {avecInsertionMouvement && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_MOUVEMENT, "Bloc simulation de mouvement inséré — adapte les valeurs.")}
                title="Insère une simulation de mouvement rectiligne à adapter"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer une simulation de mouvement
              </button>
            )}
            {avecInsertionCirculaire && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_CIRCULAIRE, "Bloc simulation de mouvement circulaire inséré — adapte les valeurs.")}
                title="Insère une simulation de mouvement circulaire uniforme à adapter"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer une simulation de mouvement circulaire
              </button>
            )}
            {avecInsertionPlanIncline && (
              <button
                type="button"
                onClick={() => insererMarqueur(SQUELETTE_PLAN_INCLINE, "Bloc plan incliné inséré — adapte les valeurs.")}
                title="Insère un plan incliné à adapter"
                className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
              >
                + Insérer un plan incliné
              </button>
            )}
            {avecInsertionTerme && (
              <button
                type="button"
                onClick={() => setSelecteurOuvert(true)}
                className="rounded-full border border-fh-orange/40 px-3 py-1 text-xs font-medium text-fh-orange-fonce transition-colors hover:bg-fh-accent/40"
              >
                + Insérer un terme
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3 lg:flex-row">
        <textarea
          ref={textareaRef}
          value={valeur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{ height: hauteur }}
          className="w-full flex-1 resize-y rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 font-mono text-sm text-fh-bleu outline-none focus:border-fh-orange"
        />
        <div
          style={{ minHeight: hauteur, maxHeight: hauteur * 2 }}
          className="w-full flex-1 overflow-auto rounded-lg border border-fh-sable bg-white px-3 py-2"
        >
          <RenduMarkdown contenu={valeur} />
        </div>
      </div>
      <p className="text-xs text-fh-ardoise/60">
        Maths : $formule$ en ligne. Pour une formule centrée, mets $$, la formule et $$ chacun sur
        leur propre ligne.
      </p>

      {selecteurOuvert && (
        <SelecteurTermeModal
          onInsert={(marqueur) => insererMarqueur(marqueur, "Terme inséré.")}
          onClose={() => setSelecteurOuvert(false)}
        />
      )}
      {messageToast && <Toast message={messageToast} onClose={() => setMessageToast(null)} />}
    </div>
  );
}
