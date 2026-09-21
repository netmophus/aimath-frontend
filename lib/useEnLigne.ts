"use client";

import { useEffect, useState } from "react";

/**
 * Reflète navigator.onLine, mis à jour en direct via les évènements
 * online/offline du navigateur. Signal purement indicatif — une connexion
 * Wi-Fi active ne garantit pas que le backend réponde — utilisé pour
 * l'affichage (bandeau "Mode hors-ligne", état du bouton Télécharger). Les
 * appels réseau qui comptent vraiment (la lecture d'une leçon) gèrent
 * toujours leur propre échec par try/catch plutôt que de se fier uniquement
 * à cette valeur — voir app/eleve/lecons/[id]/page.tsx.
 *
 * `true` par défaut avant le premier effet (rendu initial identique
 * client/serveur) : on ne suppose jamais le hors-ligne tant qu'on n'en a pas
 * la preuve, pour éviter qu'un bandeau clignote au premier rendu.
 */
export function useEnLigne(): boolean {
  const [enLigne, setEnLigne] = useState(true);

  useEffect(() => {
    // queueMicrotask plutôt qu'un appel synchrone direct : évite le rendu en
    // cascade que déclencherait un setState exécuté au tout premier tour de
    // l'effet (règle react-hooks/set-state-in-effect).
    queueMicrotask(() => setEnLigne(navigator.onLine));

    function surEnLigne() {
      setEnLigne(true);
    }
    function surHorsLigne() {
      setEnLigne(false);
    }

    window.addEventListener("online", surEnLigne);
    window.addEventListener("offline", surHorsLigne);
    return () => {
      window.removeEventListener("online", surEnLigne);
      window.removeEventListener("offline", surHorsLigne);
    };
  }, []);

  return enLigne;
}
