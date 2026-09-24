interface PlanInclineErreurProps {
  message: string;
}

/** Encadré discret affiché à la place d'une simulation de plan incliné mal
 * formée — jamais de plantage du reste du rendu Markdown pour ça (voir
 * components/SimulationPlanInclineBloc.tsx). Même style que MouvementErreur/
 * CirculaireErreur. */
export default function PlanInclineErreur({ message }: PlanInclineErreurProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-semibold text-amber-800">Simulation de plan incliné non affichable</p>
      <p className="mt-1 text-amber-700">{message}</p>
    </div>
  );
}
