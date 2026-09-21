interface StatutBadgeProps<T extends string> {
  statut: T;
  styles: Record<T, string>;
  labels: Record<T, string>;
}

/**
 * Badge de statut générique — couleurs et libellés pilotés par les maps
 * fournies par l'appelant, pour rester utilisable avec n'importe quel
 * ensemble de statuts (comptes, leçons…) sans dupliquer le composant.
 */
export default function StatutBadge<T extends string>({ statut, styles, labels }: StatutBadgeProps<T>) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${styles[statut]}`}
    >
      {labels[statut]}
    </span>
  );
}
