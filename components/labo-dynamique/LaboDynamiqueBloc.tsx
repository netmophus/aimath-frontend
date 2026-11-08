"use client";

import { Component, useMemo, type ReactNode } from "react";

import { BLOCS_DYNAMIQUE, LaboDynamiqueSyntaxeError, estLangageDynamique, parserBlocDynamique, type DonneesDynamique } from "@/lib/laboDynamique";
import LaboDynamique, { LaboDynamiqueSimple, type InitialDynamique } from "./LaboDynamique";

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
          <p className="font-semibold text-amber-800">Le laboratoire de dynamique n&apos;est pas disponible pour le moment</p>
          <p className="mt-1 text-amber-700">Recharge la page ; si le problème persiste, signale-le à l&apos;enseignant.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function Rendu({ d }: { d: DonneesDynamique }) {
  if (d.kind === "labo") return <LaboDynamique onglet={d.onglet} />;
  const initial = { [d.kind]: d.params } as InitialDynamique;
  return <LaboDynamiqueSimple onglet={d.kind} initial={initial} />;
}

/**
 * Pont Markdown vers le Laboratoire de dynamique : `langage` est le nom du bloc (machine-atwood,
 * pendule-conique, monte-charge, vehicule-virage, solide-sphere, labo-dynamique), `source` son texte brut.
 */
export default function LaboDynamiqueBloc({ langage, source }: { langage: string; source: string }) {
  const resultat = useMemo(() => {
    if (!estLangageDynamique(langage)) return { ok: false as const, message: `Bloc inconnu : « ${langage} » (attendu : ${Object.keys(BLOCS_DYNAMIQUE).join(", ")}).` };
    try {
      return { ok: true as const, data: parserBlocDynamique(langage, source) };
    } catch (erreur) {
      return { ok: false as const, message: erreur instanceof LaboDynamiqueSyntaxeError ? erreur.message : "Syntaxe du laboratoire de dynamique invalide." };
    }
  }, [langage, source]);

  if (!resultat.ok) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        <p className="font-semibold text-amber-800">Simulation de dynamique non affichable</p>
        <p className="mt-1 text-amber-700">{resultat.message}</p>
      </div>
    );
  }
  return (
    <Garde>
      <Rendu d={resultat.data} />
    </Garde>
  );
}
