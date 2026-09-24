interface PlanComplexeAxesProps {
  centre: { x: number; y: number };
  /** Distance du centre à la pointe de chaque flèche, en pixels SVG. */
  portee: number;
  couleur?: string;
}

/**
 * Axes Re/Im (repère orthonormé) avec flèches et libellés — fragment SVG
 * partagé entre CercleTrigonometrique.tsx et RacinesNiemes.tsx (les deux
 * seuls composants du plan complexe, d'où ce petit composant dédié plutôt
 * qu'une duplication du dessin des flèches dans chacun). Ne dessine QUE les
 * axes : cercle, points, etc. restent propres à chaque composant appelant.
 */
export default function PlanComplexeAxes({ centre, portee, couleur = "#1E2B6A" }: PlanComplexeAxesProps) {
  const tailleFleche = 6;
  return (
    <g stroke={couleur} strokeWidth={1.5} fill="none">
      {/* Axe des réels (Re), horizontal */}
      <line x1={centre.x - portee} y1={centre.y} x2={centre.x + portee} y2={centre.y} />
      <path
        d={`M ${centre.x + portee - tailleFleche} ${centre.y - tailleFleche / 1.4} L ${centre.x + portee} ${centre.y} L ${centre.x + portee - tailleFleche} ${centre.y + tailleFleche / 1.4}`}
      />
      {/* Décalage vertical volontairement généreux (pas -8) : sur la figure
          des racines, un sommet peut tomber pile sur l'axe Re (ex. k=0 avec
          argument=0) — son libellé "k=0" est alors à la même hauteur que
          l'axe, donc "Re" doit rester nettement au-dessus pour ne jamais s'y
          superposer (voir RacinesNiemes.tsx, RAYON_LABELS_INDICE). */}
      <text x={centre.x + portee - 4} y={centre.y - 14} fontSize={13} fontWeight={600} fill={couleur} stroke="none" textAnchor="end">
        Re
      </text>

      {/* Axe des imaginaires (Im), vertical — pointe vers le haut (y SVG décroissant) */}
      <line x1={centre.x} y1={centre.y + portee} x2={centre.x} y2={centre.y - portee} />
      <path
        d={`M ${centre.x - tailleFleche / 1.4} ${centre.y - portee + tailleFleche} L ${centre.x} ${centre.y - portee} L ${centre.x + tailleFleche / 1.4} ${centre.y - portee + tailleFleche}`}
      />
      {/* Même raisonnement que pour "Re" ci-dessus, côté horizontal cette
          fois (un sommet peut tomber pile sur l'axe Im). */}
      <text x={centre.x + 14} y={centre.y - portee + 12} fontSize={13} fontWeight={600} fill={couleur} stroke="none" textAnchor="start">
        Im
      </text>
    </g>
  );
}
