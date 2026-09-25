"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Installation de la PWA — capture beforeinstallprompt (Android/Chrome/
 * Edge), détecte iOS/iPadOS Safari (pas de prompt natif, instructions
 * manuelles à la place), détecte "déjà installé" (display-mode standalone
 * OU navigator.standalone iOS), et retient un rejet côté élève pendant
 * quelques jours pour ne jamais harceler.
 *
 * Réutilisé à l'identique par la bannière landing (components/InstallationPwaBanniere.tsx)
 * et le bouton du tableau de bord élève (components/eleve/InstallationPwaBouton.tsx) —
 * toute la logique de détection/état vit ICI, jamais dupliquée.
 */

const CLE_REJET = "fahimta_pwa_rejetee_le";
const JOURS_AVANT_RE_PROPOSITION = 7;

/** L'événement `beforeinstallprompt` n'est pas dans le lib.dom TypeScript
 * standard (propriétaire Chromium) — interface minimale pour ce qu'on utilise. */
interface EvenementBeforeInstallPrompt extends Event {
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

function estDejaInstalle(): boolean {
  const modeAffichageStandalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  // navigator.standalone : API iOS Safari non standard, absente du lib.dom
  // TypeScript — accès via un cast local plutôt qu'un `any`.
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return modeAffichageStandalone || iosStandalone;
}

function estIOSSafari(): boolean {
  const ua = window.navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  // iPadOS 13+ se présente en desktop Safari (UA "Macintosh") mais reste
  // tactile — maxTouchPoints > 1 le distingue d'un vrai Mac à souris/trackpad.
  return /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
}

function rejeteRecemment(): boolean {
  try {
    const brut = window.localStorage.getItem(CLE_REJET);
    if (!brut) return false;
    const joursEcoules = (Date.now() - Number(brut)) / (1000 * 60 * 60 * 24);
    return joursEcoules < JOURS_AVANT_RE_PROPOSITION;
  } catch {
    // Stockage indisponible (navigation privée, quota…) : on ne bloque
    // jamais l'affichage pour ça, juste pas de mémoire du dernier rejet.
    return false;
  }
}

function ecrireRejet(): void {
  try {
    window.localStorage.setItem(CLE_REJET, String(Date.now()));
  } catch {
    // Idem : rien de bloquant si l'écriture échoue, la suggestion
    // réapparaîtra juste un peu plus tôt que prévu au pire.
  }
}

export interface InstallationPwa {
  /** true si l'appli tourne déjà en mode installé — tout doit rester masqué. */
  estInstalle: boolean;
  /** true si un prompt natif (Android/Chrome/Edge) est disponible MAINTENANT. */
  peutInstallerDirectement: boolean;
  /** true sur iOS/iPadOS Safari : pas de prompt natif, affiche des
   * instructions manuelles ("Partager" → "Sur l'écran d'accueil") à la place. */
  estIOS: boolean;
  /** Combine tout : n'afficher une bannière/bouton que si true. */
  suggestionPertinente: boolean;
  /** Déclenche le prompt natif — sans effet si aucun n'est disponible. */
  installer: () => Promise<void>;
  /** L'élève ferme la suggestion : ne plus la proposer avant ~7 jours. */
  rejeter: () => void;
}

export function useInstallationPwa(): InstallationPwa {
  const [evenementDiffere, setEvenementDiffere] = useState<EvenementBeforeInstallPrompt | null>(null);
  const [estInstalle, setEstInstalle] = useState(false);
  const [estIOS, setEstIOS] = useState(false);
  const [rejete, setRejete] = useState(false);

  useEffect(() => {
    // queueMicrotask : évite un setState synchrone dans le corps de l'effet
    // (règle react-hooks/set-state-in-effect), même pattern que useEnLigne.ts.
    queueMicrotask(() => {
      setEstInstalle(estDejaInstalle());
      setEstIOS(estIOSSafari());
      setRejete(rejeteRecemment());
    });

    function surBeforeInstallPrompt(event: Event) {
      // Empêche le mini-infobar natif de Chrome : on gère nous-mêmes
      // l'invitation (bannière/bouton), l'événement est juste conservé pour
      // être rejoué plus tard via prompt().
      event.preventDefault();
      setEvenementDiffere(event as EvenementBeforeInstallPrompt);
    }

    function surAppInstalled() {
      setEstInstalle(true);
      setEvenementDiffere(null);
    }

    window.addEventListener("beforeinstallprompt", surBeforeInstallPrompt);
    window.addEventListener("appinstalled", surAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", surBeforeInstallPrompt);
      window.removeEventListener("appinstalled", surAppInstalled);
    };
  }, []);

  const installer = useCallback(async () => {
    if (!evenementDiffere) return;
    await evenementDiffere.prompt();
    const choix = await evenementDiffere.userChoice;
    if (choix.outcome === "accepted") {
      setEstInstalle(true);
    }
    // Un event beforeinstallprompt ne se rejoue qu'une fois (prompt() jette
    // sinon) : on l'oublie qu'il ait été accepté ou refusé.
    setEvenementDiffere(null);
  }, [evenementDiffere]);

  const rejeter = useCallback(() => {
    ecrireRejet();
    setRejete(true);
  }, []);

  const peutInstallerDirectement = evenementDiffere !== null;
  const suggestionPertinente = !estInstalle && !rejete && (peutInstallerDirectement || estIOS);

  return { estInstalle, peutInstallerDirectement, estIOS, suggestionPertinente, installer, rejeter };
}
