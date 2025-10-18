/* eslint-disable no-restricted-globals */

// Service Worker pour Fahimta PWA
const CACHE_NAME = 'fahimta-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('⚠️ Erreur de cache (normal en dev):', err);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie: Network First, puis Cache (seulement pour GET)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ❌ Ignore tout ce qui n'est pas http/https (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // ❌ Ignore les requêtes non-GET (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') {
    return;
  }

  // ❌ Ignore les requêtes vers l'API backend
  if (url.pathname.includes('/api/')) {
    return;
  }

  // ❌ Ignore les extensions de navigateur
  if (url.origin.includes('chrome-extension') || url.origin.includes('moz-extension')) {
    return;
  }

  // ✅ Cache uniquement les ressources du même domaine ou ressources statiques
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone la réponse et la met en cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, utilise le cache
        return caches.match(request);
      })
  );
});

