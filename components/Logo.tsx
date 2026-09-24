import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

const LOGO_FILENAME = "fahimta.png";

interface LogoProps {
  /**
   * "dark" (défaut) : texte "Fahimta" en fh-bleu, pour un fond clair
   * (ex. Navbar crème). "light" : texte en blanc, pour un fond sombre
   * (ex. Footer) — le robot (noir avec accents rouges) reçoit alors un
   * léger fond clair arrondi pour rester visible sur fond très sombre.
   */
  variant?: "light" | "dark";
}

/**
 * Logo Fahimta : image du robot (public/fahimta.png — nom de fichier
 * technique inchangé) + texte affiché "Fahimta", cliquable vers l'accueil.
 * Si l'image n'est pas présente, affiche uniquement le repli textuel sans
 * jamais échouer.
 */
export default function Logo({ variant = "dark" }: LogoProps) {
  const logoPath = path.join(process.cwd(), "public", LOGO_FILENAME);
  const hasLogo = fs.existsSync(logoPath);

  return (
    <span className="inline-flex items-center gap-2">
      {hasLogo && (
        <Image
          src={`/${LOGO_FILENAME}`}
          alt="Fahimta"
          width={40}
          height={40}
          priority
          className={
            variant === "light"
              ? "h-8 w-8 shrink-0 rounded-xl bg-fh-creme p-1 sm:h-10 sm:w-10"
              : "h-8 w-8 shrink-0 sm:h-10 sm:w-10"
          }
        />
      )}
      <span
        className={`text-xl font-bold tracking-tight sm:text-2xl ${
          variant === "light" ? "text-white" : "text-fh-bleu"
        }`}
      >
        Fahimta
      </span>
    </span>
  );
}
