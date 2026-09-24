interface RacinesErreurProps {
  message: string;
}

/** Encadré discret affiché à la place d'une figure de racines n-ièmes mal
 * formée — jamais de plantage du reste du rendu Markdown pour ça (voir
 * components/RacinesNiemesBloc.tsx). Même style que HorlogeErreur. */
export default function RacinesErreur({ message }: RacinesErreurProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-semibold text-amber-800">Racines n-ièmes non affichables</p>
      <p className="mt-1 text-amber-700">{message}</p>
    </div>
  );
}
