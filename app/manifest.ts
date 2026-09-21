import type { MetadataRoute } from "next";

/**
 * Web App Manifest — convention Next.js App Router (fichier spécial
 * app/manifest.ts, servi automatiquement sur /manifest.webmanifest).
 * L'app installée démarre sur /eleve : c'est un produit orienté élève ; un
 * utilisateur non connecté y sera redirigé vers /login par la garde
 * existante (components/eleve/EleveLayoutClient.tsx), ce qui est acceptable.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "fahimtana — aide scolaire",
    short_name: "fahimtana",
    description: "Cours, exercices et leçons du programme du Niger.",
    start_url: "/eleve",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAFAF8",
    theme_color: "#1E2B6A",
    lang: "fr",
    dir: "ltr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
