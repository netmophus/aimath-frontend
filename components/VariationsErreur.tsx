interface VariationsErreurProps {
  message: string;
}

/** Encadré discret affiché à la place d'un tableau de variations mal formé
 * ou incohérent — jamais de plantage du reste du rendu Markdown pour ça
 * (voir components/TableauVariationsBloc.tsx). Même style que CourbeErreur. */
export default function VariationsErreur({ message }: VariationsErreurProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-semibold text-amber-800">Tableau de variations non affichable</p>
      <p className="mt-1 text-amber-700">{message}</p>
    </div>
  );
}
