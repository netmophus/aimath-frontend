import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

const LOGO_FILENAME = "fahimta.png";

/**
 * Marque de l'entête élève (fond fh-bleu) : robot sur pastille claire +
 * wordmark "Fahimta" blanc, dernières lettres accentuées en orange.
 * Composant serveur dédié (comme components/Logo.tsx, qui lit le système de
 * fichiers et ne doit jamais être importé depuis un fichier "use client" —
 * voir app/eleve/layout.tsx) : pas de réutilisation directe de Logo.tsx ici,
 * son texte n'est pas personnalisable en deux teintes sans changer un
 * composant partagé par d'autres pages (admin, public).
 */
export default function MarqueEleve() {
  const logoPath = path.join(process.cwd(), "public", LOGO_FILENAME);
  const aLeLogo = fs.existsSync(logoPath);

  return (
    <span className="inline-flex items-center gap-2">
      {aLeLogo && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 p-1">
          <Image
            src={`/${LOGO_FILENAME}`}
            alt="Fahimta"
            width={32}
            height={32}
            priority
            className="h-full w-full object-contain"
          />
        </span>
      )}
      <span className="text-xl font-bold tracking-tight text-white">
        Fahim<span className="text-fh-orange">ta</span>
      </span>
    </span>
  );
}
