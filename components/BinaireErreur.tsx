interface BinaireErreurProps {
  message: string;
}

/** Encadré discret affiché à la place d'un convertisseur binaire mal formé —
 * jamais de plantage du reste du rendu Markdown pour ça (voir
 * components/ConvertisseurBinaireBloc.tsx). Même style que VariationsErreur. */
export default function BinaireErreur({ message }: BinaireErreurProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-semibold text-amber-800">Convertisseur binaire non affichable</p>
      <p className="mt-1 text-amber-700">{message}</p>
    </div>
  );
}
