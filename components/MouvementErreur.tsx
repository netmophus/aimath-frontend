interface MouvementErreurProps {
  message: string;
}

/** Encadré discret affiché à la place d'une simulation de mouvement mal
 * formée — jamais de plantage du reste du rendu Markdown pour ça (voir
 * components/SimulationMouvementBloc.tsx). Même style que HorlogeErreur. */
export default function MouvementErreur({ message }: MouvementErreurProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-semibold text-amber-800">Simulation de mouvement non affichable</p>
      <p className="mt-1 text-amber-700">{message}</p>
    </div>
  );
}
