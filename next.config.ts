import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TEST NGROK (réversible) : évite un aller-retour de redirection inutile
  // (même origine, donc sans casse) entre /api/xxx/ et /api/xxx avant que
  // app/api/[...chemin]/route.ts ne relaie vers Django. Ce relais construit
  // de toute façon lui-même l'URL cible avec son propre slash final — voir
  // ce fichier pour pourquoi un simple rewrites() ne suffisait pas.
  skipTrailingSlashRedirect: true,

  // sw.js ne doit JAMAIS être servi depuis le cache HTTP du navigateur :
  // sinon celui-ci peut continuer à voir l'ancienne version indéfiniment et
  // la mise à jour (voir components/PwaServiceWorker.tsx) ne se déclenche
  // jamais. Content-Type explicite car public/ le sert normalement en
  // text/javascript, mais mieux vaut ne pas en dépendre.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
