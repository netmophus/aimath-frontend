"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

const REQUETE = "(prefers-reduced-motion: reduce)";
const abonner = (rappel: () => void) => {
  const m = window.matchMedia(REQUETE);
  m.addEventListener("change", rappel);
  return () => m.removeEventListener("change", rappel);
};

/** « Réduire les animations » demandé par le système (faux côté serveur : même rendu initial qu'au navigateur). */
export const useReduit = (): boolean =>
  useSyncExternalStore(
    abonner,
    () => window.matchMedia(REQUETE).matches,
    () => false,
  );

/** L'élément est-il à l'écran ? Ne sert qu'à démarrer / arrêter une animation, jamais à masquer le composant. */
export function useVisible(ref: RefObject<Element | null>): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

/** Boucle requestAnimationFrame tant que `actif` ; `image(dt)` reçoit le temps écoulé en secondes (plafonné à 0,1 s). */
export function useBoucle(actif: boolean, image: (dt: number) => void): void {
  const rappel = useRef(image);
  useEffect(() => {
    rappel.current = image;
  });
  useEffect(() => {
    if (!actif) return;
    let id = 0;
    let dernier = performance.now();
    const boucle = (maintenant: number) => {
      const dt = Math.min((maintenant - dernier) / 1000, 0.1);
      dernier = maintenant;
      rappel.current(dt);
      id = requestAnimationFrame(boucle);
    };
    id = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(id);
  }, [actif]);
}

/** Animation active : visible à l'écran et pas de « réduire les animations ». */
export function useAnimation(ref: RefObject<Element | null>): boolean {
  const visible = useVisible(ref);
  const reduit = useReduit();
  return visible && !reduit;
}
