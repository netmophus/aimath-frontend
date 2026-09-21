export interface AdminNavItem {
  href: string;
  label: string;
}

/** Source unique pour les liens de la sidebar et le titre de page du topbar. */
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/validations", label: "Comptes à valider" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/structure", label: "Structure scolaire" },
  { href: "/admin/programmes", label: "Programmes" },
  { href: "/admin/lecons", label: "Leçons" },
  { href: "/admin/glossaire", label: "Glossaire" },
];

/** "/admin" ne doit matcher que la page exacte ; les autres, leur préfixe. */
export function isAdminNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageTitle(pathname: string): string {
  const item = [...ADMIN_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((candidate) => isAdminNavItemActive(pathname, candidate.href));
  return item?.label ?? "Administration";
}
