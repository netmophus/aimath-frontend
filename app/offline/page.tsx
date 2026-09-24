import type { Metadata } from "next";

import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Hors ligne — Fahimta",
};

/**
 * Page de repli hors-ligne (COUCHE 1 du PWA) : précachée par le service
 * worker (public/sw.js) et servie quand l'élève navigue, sans réseau, vers
 * une page que le SW n'a pas déjà en cache. Volontairement statique — pas de
 * données, pas d'appel API — pour pouvoir s'afficher sans connexion.
 */
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-fh-creme px-6 text-center">
      <Logo variant="dark" />
      <span className="text-4xl" aria-hidden="true">
        📡
      </span>
      <h1 className="text-lg font-bold text-fh-bleu">Tu es hors ligne</h1>
      <p className="max-w-sm text-sm text-fh-ardoise">
        Reconnecte-toi pour accéder à cette page. Les pages déjà visitées restent parfois disponibles ; celle-ci ne
        l&apos;est pas encore.
      </p>
    </div>
  );
}
