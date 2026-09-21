import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-fh-bleu-charbon text-fh-creme/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2">
          <Logo variant="light" />
          <p className="text-sm text-fh-creme/60">fahimta · Niamey, Niger</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/login" className="transition-colors hover:text-fh-creme">
            Se connecter
          </Link>
          <Link
            href="/register"
            className="transition-colors hover:text-fh-creme"
          >
            Créer un compte
          </Link>
          <Link href="/demo" className="transition-colors hover:text-fh-creme">
            Voir une leçon
          </Link>
        </nav>
      </div>
      <div className="border-t border-fh-creme/10 px-4 py-4 text-center text-xs text-fh-creme/50 sm:px-6">
        © {new Date().getFullYear()} fahimta. Tous droits réservés.
      </div>
    </footer>
  );
}
