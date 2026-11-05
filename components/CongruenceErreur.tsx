interface CongruenceErreurProps {
  message: string;
}

/** Encadré discret affiché à la place d'un calculateur de congruence mal formé (même style que HorlogeErreur). */
export default function CongruenceErreur({ message }: CongruenceErreurProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-semibold text-amber-800">Calculateur de congruence non affichable</p>
      <p className="mt-1 text-amber-700">{message}</p>
    </div>
  );
}
