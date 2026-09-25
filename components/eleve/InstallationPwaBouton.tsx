"use client";

import { useState } from "react";

import InstallationIOSInstructions from "@/components/InstallationIOSInstructions";
import { useInstallationPwa } from "@/lib/useInstallationPwa";

/**
 * Encart "Installer l'application" du tableau de bord élève (voir
 * app/eleve/page.tsx, sous l'encart abonnement) — même hook et même modale
 * que la bannière landing (components/InstallationPwaBanniere.tsx), jamais
 * dupliqués. Présenté en encart discret plutôt qu'en bannière ici pour ne
 * pas rivaliser visuellement avec l'encart abonnement juste au-dessus.
 */
export default function InstallationPwaBouton() {
  const { peutInstallerDirectement, suggestionPertinente, installer, rejeter } = useInstallationPwa();
  const [modaleIOSOuverte, setModaleIOSOuverte] = useState(false);

  if (!suggestionPertinente) return null;

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-fh-bleu/5 px-3.5 py-2.5 text-sm">
        <span className="min-w-0 flex-1 text-fh-bleu">
          <span aria-hidden="true">📱</span> Installe l&apos;application pour un accès plus rapide
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={peutInstallerDirectement ? installer : () => setModaleIOSOuverte(true)}
            className="rounded-full bg-fh-orange px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
          >
            {peutInstallerDirectement ? "Installer" : "Comment faire ?"}
          </button>
          <button
            type="button"
            onClick={rejeter}
            aria-label="Fermer cette suggestion"
            className="rounded-full p-1 text-fh-ardoise/60 transition-colors hover:bg-fh-sable/60 hover:text-fh-ardoise"
          >
            ✕
          </button>
        </div>
      </div>

      {modaleIOSOuverte && <InstallationIOSInstructions onClose={() => setModaleIOSOuverte(false)} />}
    </>
  );
}
