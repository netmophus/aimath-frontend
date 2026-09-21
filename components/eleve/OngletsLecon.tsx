"use client";

export interface CouleurOnglet {
  fond: string;
  texte: string;
  bordure: string;
}

export interface Onglet<T extends string> {
  id: T;
  label: string;
  /** Couleur douce au repos (fond/texte/bordure) — l'onglet ACTIF passe
   * toujours en fh-orange plein + texte blanc, quelle que soit cette valeur
   * (cohérence avec le reste de l'app). Sans elle, l'onglet garde le style
   * neutre par défaut (fond blanc, texte fh-ardoise). Ce sont des teintes
   * bespoke (pas des tokens fh-*), donc passées en style inline plutôt qu'en
   * classes Tailwind arbitraires générées dynamiquement (non détectables par
   * le scanner Tailwind). */
  couleur?: CouleurOnglet;
}

interface OngletsLeconProps<T extends string> {
  onglets: Onglet<T>[];
  actif: T;
  onChange: (id: T) => void;
}

/**
 * Barre d'onglets générique. Le nombre d'onglets varie selon le contenu de
 * la leçon (1 à 4 — voir app/eleve/lecons/[id]/page.tsx) : sur mobile, une
 * grille 2 colonnes évite tout débordement/troncature de libellé ; à partir
 * de sm:, l'espace suffit pour repasser tout sur une seule ligne. Avec un
 * nombre impair d'onglets (1 ou 3), le dernier étend sa cellule sur les deux
 * colonnes plutôt que de rester orphelin à moitié de largeur — sans effet
 * dès que sm: bascule en flex.
 *
 * Le contenu de l'onglet actif est affiché par la page via un simple rendu
 * conditionnel après montage — pas de display:none à gérer ici, ce
 * composant ne rend que la barre.
 */
export default function OngletsLecon<T extends string>({ onglets, actif, onChange }: OngletsLeconProps<T>) {
  const impair = onglets.length % 2 === 1;

  return (
    <div role="tablist" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {onglets.map((onglet, index) => {
        const estActif = onglet.id === actif;
        const dernierOrphelin = impair && index === onglets.length - 1;

        return (
          <button
            key={onglet.id}
            type="button"
            role="tab"
            aria-selected={estActif}
            onClick={() => onChange(onglet.id)}
            style={
              !estActif && onglet.couleur
                ? {
                    backgroundColor: onglet.couleur.fond,
                    color: onglet.couleur.texte,
                    borderColor: onglet.couleur.bordure,
                  }
                : undefined
            }
            className={`min-h-11 rounded-xl border px-3 py-2 text-center text-sm transition-colors sm:flex-1 ${
              dernierOrphelin ? "col-span-2" : ""
            } ${
              estActif
                ? "border-fh-orange bg-fh-orange font-semibold text-white"
                : onglet.couleur
                  ? "hover:brightness-95"
                  : "border-fh-sable bg-white text-fh-ardoise hover:bg-fh-sable/40"
            }`}
          >
            {onglet.label}
          </button>
        );
      })}
    </div>
  );
}
