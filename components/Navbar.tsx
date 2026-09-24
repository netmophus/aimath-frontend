import Link from "next/link";
import Logo from "./Logo";
import NavbarMenu from "./NavbarMenu";

/**
 * Barre de navigation de la page d'accueil : détachée du hero, fond bleu
 * vif fixe (pas de comportement au scroll), sticky en haut de page. Les
 * actions (à droite) passent en menu hamburger sur petits écrans, géré par
 * NavbarMenu (composant client) pour que Logo (qui lit le système de
 * fichiers) ne soit jamais embarqué dans le bundle client.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-fh-bleu-vif">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0 text-white">
          <Logo variant="light" />
        </Link>
        <NavbarMenu />
      </nav>
    </header>
  );
}
