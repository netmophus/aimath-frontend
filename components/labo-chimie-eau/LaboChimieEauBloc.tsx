"use client";

import { Component, useMemo, type ReactNode } from "react";

import { LaboChimieEauSyntaxeError, parserLaboChimieEau } from "@/lib/laboChimieEau";
import LaboChimieEau from "./LaboChimieEau";

/** Repli lisible : si un rendu échoue, la leçon reste affichable. */
class Garde extends Component<{ children: ReactNode }, { erreur: boolean }> {
  state = { erreur: false };
  static getDerivedStateFromError() {
    return { erreur: true };
  }
  render() {
    if (this.state.erreur) {
      return (
        <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <p className="font-semibold text-amber-800">Le laboratoire de chimie de l&apos;eau n&apos;est pas disponible pour le moment</p>
          <p className="mt-1 text-amber-700">Recharge la page ; si le problème persiste, signale-le à l&apos;enseignant.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Pont Markdown vers le laboratoire de chimie de l'eau : `source` est le texte brut du bloc ```labo-chimie-eau. */
export default function LaboChimieEauBloc({ source }: { source: string }) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserLaboChimieEau(source) };
    } catch (erreur) {
      return { ok: false as const, message: erreur instanceof LaboChimieEauSyntaxeError ? erreur.message : "Syntaxe du laboratoire de chimie de l'eau invalide." };
    }
  }, [source]);
  if (!resultat.ok) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        <p className="font-semibold text-amber-800">Laboratoire de chimie de l&apos;eau non affichable</p>
        <p className="mt-1 text-amber-700">{resultat.message}</p>
      </div>
    );
  }
  return (
    <Garde>
      <LaboChimieEau onglet={resultat.data.onglet} temperature={resultat.data.temperature} />
    </Garde>
  );
}
