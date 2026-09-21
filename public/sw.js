/**
 * Service worker — coquille hors-ligne + installabilité (COUCHE 1), et
 * coquilles de l'espace élève pour la lecture hors-ligne (COUCHE 2, voir
 * PRECACHE_URLS plus bas). Enregistré uniquement en production par
 * components/PwaServiceWorker.tsx.
 *
 * Ce qu'il fait :
 *   - précache un petit socle d'assets statiques + la page de repli /offline,
 *     ET les deux coquilles élève qui ne dépendent d'aucun id dynamique
 *     (/eleve — le tableau de bord, aussi start_url du manifest, voir
 *     app/manifest.ts — et /eleve/telechargees) : garanties disponibles
 *     hors-ligne dès l'installation, sans dépendre d'une visite préalable ;
 *   - pour la navigation (chargement de page) : réseau d'abord, puis cache
 *     d'une visite précédente pour CETTE URL exacte (une leçon /eleve/lecons/
 *     {id} : forcément déjà visitée en ligne pour avoir pu être téléchargée,
 *     voir lib/offlineStore.ts — le HTML ne sert que de coquille, les
 *     données viennent d'IndexedDB une fois l'app montée), et enfin /offline
 *     en tout dernier recours ;
 *   - pour les assets Next hashés (/_next/static/...) et les autres fichiers
 *     statiques : cache d'abord (ils sont immuables), réseau en repli ;
 *   - laisse TOUJOURS passer les requêtes /api/... (même origine ou non) et
 *     tout ce qui n'est pas GET : les DONNÉES des leçons sont gérées par
 *     IndexedDB (lib/offlineStore.ts), jamais par ce cache.
 *
 * Volontairement PAS de repli "coquille générique" pour une URL de leçon
 * jamais visitée (id inconnu) : testé et abandonné — servir le HTML d'une
 * AUTRE leçon sous cette URL fait hydrater React avec les mauvais
 * paramètres (le payload flight embarqué décrit l'ancienne route, pas
 * l'URL réellement demandée), ce qui a pu, en pratique, déclencher une
 * redirection erronée vers /login. Un id jamais visité en ligne n'a de
 * toute façon aucune donnée locale à afficher : retomber sur /offline (site
 * hors périmètre, mais honnête) est préférable à une coquille trompeuse.
 *
 * Ce qu'il ne fait PAS : mettre en cache la moindre réponse d'API, ni
 * précharger lui-même le CONTENU des leçons — entièrement porté par
 * offlineStore côté page.
 */

const VERSION = "v3";
const PRECACHE = `fahimtana-precache-${VERSION}`;
const RUNTIME = `fahimtana-runtime-${VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/eleve",
  "/eleve/telechargees",
  "/manifest.webmanifest",
  "/fahimta.png",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      // Le nouveau SW attend par défaut que les onglets sur l'ancien se
      // ferment avant de prendre la main (voir components/PwaServiceWorker.tsx
      // pour l'invite "nouvelle version disponible" côté page) — pas de
      // self.skipWaiting() automatique ici, seulement sur message explicite.
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const noms = await caches.keys();
      await Promise.all(
        noms.filter((nom) => nom !== PRECACHE && nom !== RUNTIME).map((nom) => caches.delete(nom))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Jamais de cache pour autre chose que GET (POST/PATCH/DELETE... laissés
  // intacts, ex. connexion, sauvegarde admin).
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API (même origine un jour, ou cross-origin vers :8000 aujourd'hui) :
  // jamais interceptée, jamais mise en cache — données toujours fraîches.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(reseauPuisCachePuisRepli(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.origin === self.location.origin) {
    event.respondWith(cachePuisReseau(request));
  }
});

async function reseauPuisCachePuisRepli(request) {
  try {
    const reponse = await fetch(request);
    const cache = await caches.open(RUNTIME);
    cache.put(request, reponse.clone());
    return reponse;
  } catch {
    const enCache = await caches.match(request);
    if (enCache) return enCache;
    const repli = await caches.match(OFFLINE_URL);
    return repli || Response.error();
  }
}

async function cachePuisReseau(request) {
  const enCache = await caches.match(request);
  if (enCache) return enCache;
  try {
    const reponse = await fetch(request);
    if (reponse.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, reponse.clone());
    }
    return reponse;
  } catch {
    return Response.error();
  }
}
