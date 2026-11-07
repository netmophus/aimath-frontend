"use client";

import { Component, useMemo, type ReactNode } from "react";

import { LaboMoivreSyntaxeError, parserBlocLaboMoivre } from "@/lib/laboMoivre";
import LaboMoivreEuler from "./LaboMoivreEuler";

/** Repli lisible : si un rendu du laboratoire échoue, la leçon reste affichable (le reste de la page n'est pas emporté). */
class Garde extends Component<{ children: ReactNode }, { erreur: boolean }> {
  state = { erreur: false };
  static getDerivedStateFromError() {
    return { erreur: true };
  }
  render() {
    if (this.state.erreur) {
      return (
        <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <p className="font-semibold text-amber-800">Le laboratoire Moivre-Euler n&apos;est pas disponible pour le moment</p>
          <p className="mt-1 text-amber-700">Recharge la page ; si le problème persiste, signale-le à l&apos;enseignant.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Pont Markdown vers le Laboratoire Moivre-Euler : même rôle que LaboComplexesBloc. */
export default function LaboMoivreBloc({ source }: { source: string }) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocLaboMoivre(source) };
    } catch (erreur) {
      return { ok: false as const, message: erreur instanceof LaboMoivreSyntaxeError ? erreur.message : "Syntaxe du laboratoire Moivre-Euler invalide." };
    }
  }, [source]);

  if (!resultat.ok) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        <p className="font-semibold text-amber-800">Laboratoire Moivre-Euler non affichable</p>
        <p className="mt-1 text-amber-700">{resultat.message}</p>
      </div>
    );
  }
  return (
    <Garde>
      <LaboMoivreEuler data={resultat.data} />
    </Garde>
  );
}
