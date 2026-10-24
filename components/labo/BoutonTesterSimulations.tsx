import Link from "next/link";
import { IconAtom2 } from "@tabler/icons-react";

import { matiereResolvable } from "@/lib/resoudre";

interface BoutonTesterSimulationsProps {
  programmeId: number;
  matiereNom: string;
}

/**
 * Bouton PROVISOIRE vers le laboratoire GeoGebra (/eleve/labo-geogebra), réservé au développement local et aux
 * mathématiques. `process.env.NODE_ENV` est remplacé à la compilation : en production, ce composant ne rend rien
 * (et la route elle-même répond 404, voir proxy.ts). À retirer quand les simulations seront dans les leçons.
 */
export default function BoutonTesterSimulations({ programmeId, matiereNom }: BoutonTesterSimulationsProps) {
  if (process.env.NODE_ENV !== "development") return null;
  if (matiereResolvable(matiereNom) !== "maths") return null;

  return (
    <Link
      href={`/eleve/labo-geogebra?retour=${encodeURIComponent(`/eleve/programmes/${programmeId}`)}`}
      className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-fh-bleu/30 bg-fh-accent px-4 text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-sable/70"
    >
      <IconAtom2 size={18} stroke={1.75} aria-hidden="true" />
      Tester les simulations interactives
    </Link>
  );
}
