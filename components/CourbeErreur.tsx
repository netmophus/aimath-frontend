interface CourbeErreurProps {
  message: string;
}

/** Encadré discret affiché à la place d'une courbe mal formée ou non
 * calculable — jamais de plantage du reste du rendu Markdown pour ça (voir
 * components/CourbeFonctionBloc.tsx et components/CourbeFonction.tsx). */
export default function CourbeErreur({ message }: CourbeErreurProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-semibold text-amber-800">Courbe non affichable</p>
      <p className="mt-1 text-amber-700">{message}</p>
    </div>
  );
}
