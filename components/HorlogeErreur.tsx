interface HorlogeErreurProps {
  message: string;
}

/** Encadré discret affiché à la place d'une horloge modulaire mal formée —
 * jamais de plantage du reste du rendu Markdown pour ça (voir
 * components/HorlogeModulaireBloc.tsx). Même style que VariationsErreur. */
export default function HorlogeErreur({ message }: HorlogeErreurProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-semibold text-amber-800">Horloge modulaire non affichable</p>
      <p className="mt-1 text-amber-700">{message}</p>
    </div>
  );
}
