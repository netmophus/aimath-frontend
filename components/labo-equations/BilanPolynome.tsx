"use client";

import { bilanRacine, type Poly } from "@/lib/equationsComplexes";
import { texComplexe, texScientifique, texValeurPolynome } from "@/lib/equationsComplexesAffichage";
import type { Cx } from "@/lib/complexes";
import { Tex } from "./ui";

/**
 * Évalue P(z) et dit honnêtement ce qu'on sait : égalité EXACTE (entiers), nullité à la TOLÉRANCE près (flottants), ou non-nullité.
 * Une valeur simplement proche de zéro n'est jamais présentée comme une égalité exacte.
 */
export default function BilanPolynome({ p, z, nomZ = "z" }: { p: Poly; z: Cx; nomZ?: string }) {
  const b = bilanRacine(p, z);
  const valeur = b.exact ? `P(${nomZ}) = ${texComplexe(b.valeur)}` : `P(${nomZ}) \\approx ${texValeurPolynome(b.valeur)}`;
  return (
    <div className="flex min-w-0 flex-col gap-1 text-sm text-fh-ardoise">
      <Tex expr={valeur} bloc />
      {b.estRacine ? (
        b.exact ? (
          <p>
            <strong className="text-emerald-700">P({nomZ}) = 0 exactement</strong> : tous les nombres sont entiers, le calcul est exact.
          </p>
        ) : (
          <p>
            <strong className="text-emerald-700">P({nomZ}) ≈ 0 à la tolérance près</strong> : <Tex expr={`|P(${nomZ})| = ${texScientifique(b.module)}`} /> est inférieur au seuil{" "}
            <Tex expr={`${texScientifique(b.seuil)}`} /> (= 10⁻⁹ × échelle des termes). Résultat numérique approché, pas une égalité exacte.
          </p>
        )
      ) : (
        <p>
          <strong className="text-rose-700">P({nomZ}) ≠ 0</strong> : <Tex expr={`|P(${nomZ})| = ${texScientifique(b.module)}`} /> dépasse le seuil <Tex expr={texScientifique(b.seuil)} />.
        </p>
      )}
    </div>
  );
}
