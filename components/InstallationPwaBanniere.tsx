"use client";

import { useState } from "react";

import InstallationIOSInstructions from "@/components/InstallationIOSInstructions";
import { useInstallationPwa } from "@/lib/useInstallationPwa";

/**
 * Bannière fine tout en haut de la landing publique, rendue AVANT <Navbar />
 * dans app/page.tsx — flux normal du document (pas de position fixed/
 * sticky ici), donc elle pousse simplement le reste de la page vers le bas
 * et défile normalement ; Navbar (lui, sticky top-0) prend ensuite le
 * relais une fois la bannière scrollée hors champ.
 *
 * N'apparaît que sur mobile (peu pertinent sur desktop, voir `sm:hidden`)
 * et seulement quand useInstallationPwa() juge la suggestion pertinente
 * (pas déjà installée, pas récemment fermée, prompt natif OU iOS Safari).
 */
export default function InstallationPwaBanniere() {
  const { peutInstallerDirectement, suggestionPertinente, installer, rejeter } = useInstallationPwa();
  const [modaleIOSOuverte, setModaleIOSOuverte] = useState(false);

  if (!suggestionPertinente) return null;

  return (
    <>
      <div className="flex items-center justify-between gap-3 bg-fh-orange px-4 py-2 text-sm text-white sm:hidden">
        <p className="min-w-0 flex-1 truncate">
          <span aria-hidden="true">📱</span>{" "}
          {peutInstallerDirectement
            ? "Installe l'application Fahimta sur ton téléphone"
            : "Ajoute Fahimta à ton écran d'accueil"}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={peutInstallerDirectement ? installer : () => setModaleIOSOuverte(true)}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-fh-orange-fonce transition-colors hover:bg-white/90"
          >
            {peutInstallerDirectement ? "Installer" : "Comment faire ?"}
          </button>
          <button
            type="button"
            onClick={rejeter}
            aria-label="Fermer cette suggestion"
            className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {modaleIOSOuverte && <InstallationIOSInstructions onClose={() => setModaleIOSOuverte(false)} />}
    </>
  );
}
