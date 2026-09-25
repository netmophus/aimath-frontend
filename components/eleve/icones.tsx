/**
 * Icônes SVG inline sobres pour l'espace élève (pas de lib d'icônes dans le
 * projet — aucune n'a été ajoutée pour rester léger). Chaque icône hérite sa
 * couleur de `currentColor` : on la colore via className sur le parent/elle.
 */

interface IconeProps {
  className?: string;
}

const BASE = "h-5 w-5";

export function IconeAccueil({ className = BASE }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
    </svg>
  );
}

export function IconeLivre({ className = BASE }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 0 4 23.5v-18Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 1 2.5 2.5v-18Z" />
    </svg>
  );
}

export function IconeAide({ className = BASE }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx={12} cy={12} r={9} />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.8.5-1.2 1-1.2 1.8" />
      <circle cx={12} cy={17} r={0.5} fill="currentColor" />
    </svg>
  );
}

export function IconeProfil({ className = BASE }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx={12} cy={8} r={3.5} />
      <path d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" />
    </svg>
  );
}

export function IconeTelecharger({ className = BASE }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3.5v11" />
      <path d="M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4.5 17v2A1.5 1.5 0 0 0 6 20.5h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
    </svg>
  );
}

export function IconeCorbeille({ className = BASE }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 7h14" />
      <path d="M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2" />
      <path d="M7 7v12a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 19V7" />
      <path d="M10.5 11v5" />
      <path d="M13.5 11v5" />
    </svg>
  );
}

export function IconeCadenas({ className = BASE }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x={5} y={11} width={14} height={9} rx={2} />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

export function IconeChevron({ className = BASE }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
