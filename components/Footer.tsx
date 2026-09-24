import Link from "next/link";
import {
  IconBrandFacebook,
  IconBrandTiktok,
  IconBrandWhatsapp,
  type TablerIcon,
} from "@tabler/icons-react";
import Logo from "./Logo";

interface ReseauSocial {
  label: string;
  href: string;
  icon: TablerIcon;
}

// href="#" pour les 3 : liens à confirmer, à remplacer une fois les comptes
// réseaux sociaux de Fahimta créés.
const RESEAUX_SOCIAUX: readonly ReseauSocial[] = [
  { label: "Facebook", href: "#", icon: IconBrandFacebook },
  { label: "WhatsApp", href: "#", icon: IconBrandWhatsapp },
  { label: "TikTok", href: "#", icon: IconBrandTiktok },
];

const TITRE_COLONNE_CLASSNAME =
  "text-[11px] font-semibold uppercase tracking-wider text-fh-orange-clair";

export default function Footer() {
  return (
    <footer className="bg-fh-bleu text-white/70">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        {/* Colonne 1 : marque */}
        <div className="flex flex-col gap-3">
          <Logo variant="light" />
          <p className="max-w-xs text-sm text-white/60">
            Le programme officiel du Niger, du collège au lycée. Cours,
            exercices et simulations.
          </p>
        </div>

        {/* Colonne 2 : navigation */}
        <div className="flex flex-col gap-3">
          <h2 className={TITRE_COLONNE_CLASSNAME}>Navigation</h2>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/" className="w-fit transition-colors hover:text-white">
              Accueil
            </Link>
            <Link href="/login" className="w-fit transition-colors hover:text-white">
              Se connecter
            </Link>
            <Link href="/register" className="w-fit transition-colors hover:text-white">
              Créer un compte
            </Link>
          </nav>
        </div>

        {/* Colonne 3 : réseaux sociaux */}
        <div className="flex flex-col gap-3">
          <h2 className={TITRE_COLONNE_CLASSNAME}>Suivez-nous</h2>
          <div className="flex gap-3">
            {RESEAUX_SOCIAUX.map((reseau) => {
              const Icone = reseau.icon;
              return (
                <a
                  key={reseau.label}
                  href={reseau.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={reseau.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 sm:h-12 sm:w-12"
                >
                  <Icone size={24} stroke={1.75} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 px-4 py-4 text-center text-xs text-white/60 sm:px-6">
        © {new Date().getFullYear()} Fahimta · Niamey, Niger · Tous droits
        réservés
      </div>
    </footer>
  );
}
