"use client";

import { useEffect, useState } from "react";

/**
 * Enregistre public/sw.js — UNIQUEMENT en production (npm run build &&
 * npm run start). En dev, un service worker actif peut servir des assets
 * périmés et entrer en conflit avec le rechargement à chaud de Next ; on
 * désenregistre activement tout SW qui traînerait d'une session de build
 * précédente sur le même port, pour repartir propre.
 *
 * Mise à jour : le nouveau SW s'installe en arrière-plan puis ATTEND (pas de
 * skipWaiting automatique) — sinon un onglet resterait actif avec des assets
 * mélangés ancien/nouveau. On affiche une invite légère "Nouvelle version
 * disponible" ; le clic déclenche skipWaiting côté SW, puis un rechargement
 * une fois qu'il a pris la main (`controllerchange`).
 */
export default function PwaServiceWorker() {
  const [enregistrement, setEnregistrement] = useState<ServiceWorkerRegistration | null>(null);
  const [miseAJourDisponible, setMiseAJourDisponible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      return;
    }

    let annule = false;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        if (annule) return;
        setEnregistrement(reg);

        // Un SW en attente au moment de l'enregistrement (ex. onglet rouvert
        // après une mise à jour manquée) : proposer le rechargement tout de suite.
        if (reg.waiting && navigator.serviceWorker.controller) {
          setMiseAJourDisponible(true);
        }

        reg.addEventListener("updatefound", () => {
          const installation = reg.installing;
          if (!installation) return;
          installation.addEventListener("statechange", () => {
            if (installation.state === "installed" && navigator.serviceWorker.controller) {
              setMiseAJourDisponible(true);
            }
          });
        });
      })
      .catch(() => {
        // L'installabilité n'est jamais critique : une erreur ici ne doit
        // pas empêcher le reste de l'app de fonctionner.
      });

    let rechargeDeclenchee = false;
    function surChangementControleur() {
      if (rechargeDeclenchee) return;
      rechargeDeclenchee = true;
      window.location.reload();
    }
    navigator.serviceWorker.addEventListener("controllerchange", surChangementControleur);

    return () => {
      annule = true;
      navigator.serviceWorker.removeEventListener("controllerchange", surChangementControleur);
    };
  }, []);

  if (!miseAJourDisponible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl bg-fh-bleu px-4 py-3 text-sm text-white shadow-lg sm:inset-x-auto sm:right-4">
      <span>Nouvelle version disponible.</span>
      <button
        type="button"
        onClick={() => enregistrement?.waiting?.postMessage("SKIP_WAITING")}
        className="shrink-0 rounded-full bg-fh-orange px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
      >
        Recharger
      </button>
    </div>
  );
}
