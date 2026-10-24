import { NextResponse, type NextRequest } from "next/server";

/**
 * Laboratoire GeoGebra (prototype privé, 8B.1) : hors développement local, la route répond par une VRAIE réponse
 * HTTP 404 avant tout rendu. Le contrôle `notFound()` de la page ne suffit pas : la page est diffusée en streaming
 * (statut 200 déjà envoyé quand `notFound()` s'exécute, voir la doc Next.js « not-found »). La page garde son
 * propre contrôle en seconde barrière.
 *
 * Ce proxy est limité à cette seule route (`matcher`) : aucune autre page n'est touchée.
 */
export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "development") return NextResponse.next();
  // Réécriture vers une URL qui n'existe pas : le site affiche sa page « introuvable » habituelle, statut 404.
  return NextResponse.rewrite(new URL("/introuvable-labo", request.url), { status: 404 });
}

export const config = {
  matcher: ["/eleve/labo-geogebra", "/eleve/labo-geogebra/:path*"],
};
