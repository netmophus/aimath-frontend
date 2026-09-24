interface CercleTrigoErreurProps {
  message: string;
}

/** Encadré discret affiché à la place d'un cercle trigonométrique mal
 * formé — jamais de plantage du reste du rendu Markdown pour ça (voir
 * components/CercleTrigonometriqueBloc.tsx). Même style que HorlogeErreur. */
export default function CercleTrigoErreur({ message }: CercleTrigoErreurProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-semibold text-amber-800">Cercle trigonométrique non affichable</p>
      <p className="mt-1 text-amber-700">{message}</p>
    </div>
  );
}
