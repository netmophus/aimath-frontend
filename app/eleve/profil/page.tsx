import PagePlaceholder from "@/components/eleve/PagePlaceholder";

/**
 * Placeholder — la déconnexion reste accessible via la barre du layout élève
 * sur cette page (non masquée ici, contrairement au dashboard qui a son
 * propre en-tête sans cette action : voir EleveLayoutClient). Pas besoin de
 * la dupliquer ici.
 */
export default function ProfilPage() {
  return <PagePlaceholder titre="Profil" emoji="🙂" />;
}
