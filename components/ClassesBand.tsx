import Image from "next/image";
import Link from "next/link";

type CycleAccueilId = "college" | "lycee";

interface ClassePastille {
  label: string;
  /** Route complète vers le programme de ce niveau/série (ex.
   * /programme/lycee/premiere/c) — pas de slug reconstruit, les routes
   * collège et lycée n'ont pas la même forme (niveau seul vs
   * niveau/série). */
  href: string;
}

interface CycleAccueil {
  id: CycleAccueilId;
  titre: string;
  description: string;
  /**
   * Photo de fond LOCALE (public/), jamais d'URL externe (fonctionnement
   * hors-ligne). Prévoir ici les fichiers réels avant mise en prod — voir
   * le commentaire au-dessus de CYCLES_ACCUEIL.
   */
  image: { src: string; alt: string };
  classes: readonly ClassePastille[];
}

/**
 * Photos attendues : public/cycles/college.jpg et public/cycles/lycee.jpg
 * (ces noms exacts) — déjà en place et servies en unoptimized (voir le
 * commentaire sur <Image> plus bas).
 */
const CYCLES_ACCUEIL: readonly CycleAccueil[] = [
  {
    id: "college",
    titre: "Collège",
    description: "De la 6e à la 3e",
    image: {
      src: "/cycles/college.jpg",
      alt: "Élèves du collège étudiant ensemble",
    },
    classes: [
      { label: "6e", href: "/programme/college/6e" },
      { label: "5e", href: "/programme/college/5e" },
      { label: "4e", href: "/programme/college/4e" },
      { label: "3e", href: "/programme/college/3e" },
    ],
  },
  {
    id: "lycee",
    titre: "Lycée",
    description: "2nde, 1re et Tle · séries C·D·A",
    image: {
      src: "/cycles/lycee.jpg",
      alt: "Élèves du lycée en pleine révision",
    },
    classes: [
      // Seconde n'a que 2 séries réelles (A et C — pas de D à ce niveau,
      // voir SERIES_PAR_NIVEAU dans lib/programmeLyceeStatique.ts) : une
      // pastille par série, comme pour 1re et Tle, plutôt qu'une pastille
      // "2nde" unique qui devrait choisir arbitrairement entre les deux.
      { label: "2nde A", href: "/programme/lycee/seconde/a" },
      { label: "2nde C", href: "/programme/lycee/seconde/c" },
      { label: "1re C", href: "/programme/lycee/premiere/c" },
      { label: "1re D", href: "/programme/lycee/premiere/d" },
      { label: "1re A", href: "/programme/lycee/premiere/a" },
      { label: "Tle C", href: "/programme/lycee/terminale/c" },
      { label: "Tle D", href: "/programme/lycee/terminale/d" },
      { label: "Tle A", href: "/programme/lycee/terminale/a" },
    ],
  },
];

/**
 * Classes littérales (pas de concaténation) pour que Tailwind les détecte.
 * Voile dégradé vertical calibré précisément : quasi opaque en bas (stop
 * from, ~92%) là où vit le texte pour un contraste large, et seulement
 * légèrement teinté en haut (stop to, ~18% — pas totalement transparent)
 * pour que la photo reste nettement identifiable tout en gardant une
 * teinte de marque cohérente sur toute la carte.
 */
const CYCLE_STYLES: Record<CycleAccueilId, { veil: string }> = {
  college: { veil: "from-fh-bleu/92 via-fh-bleu/45 via-45% to-fh-bleu/18" },
  lycee: { veil: "from-fh-orange/92 via-fh-orange/45 via-45% to-fh-orange/18" },
};

export default function ClassesBand() {
  return (
    <section className="bg-[#C2C6CA] px-4 py-10 sm:px-6 sm:py-14">
      {/* Fond gris clair (#C2C6CA) choisi pour rester lisible : le titre en
          fh-bleu et le sous-titre en fh-ardoise gardent tous deux un
          contraste confortable dessus, testé avant d'arrêter cette teinte
          précise. Posé sur toute la section, de bord à bord (pas seulement
          sur une carte interne) : c'est tout le bloc qui porte la couleur,
          pas un cadre à l'intérieur. */}
      <div className="mx-auto max-w-6xl py-10 sm:px-10 sm:py-14">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-fh-bleu sm:text-3xl">
            Tout le programme du Niger
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-fh-ardoise sm:text-base">
            Tout le programme officiel, de la{" "}
            <span className="font-semibold text-fh-bleu">6e à la Terminale</span>,
            dans toutes les séries. Des{" "}
            <span className="font-semibold text-fh-orange">cours</span>,{" "}
            <span className="font-semibold text-fh-orange">vidéos</span>,{" "}
            <span className="font-semibold text-fh-orange">exercices</span>,{" "}
            <span className="font-semibold text-fh-orange">examens types corrigés</span>{" "}
            et <span className="font-semibold text-fh-orange">simulations</span> pour
            vraiment comprendre les concepts.
          </p>
          <p className="mt-3 text-[17px] font-bold leading-relaxed">
            <span className="text-fh-bleu">Crée ton compte</span>{" "}
            <span className="text-fh-orange">→ tout est gratuit</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {CYCLES_ACCUEIL.map((cycle) => {
            const styles = CYCLE_STYLES[cycle.id];

            return (
              <article
                key={cycle.id}
                className="group relative isolate flex min-h-[320px] flex-col justify-end overflow-hidden rounded-3xl shadow-lg transition-[transform,box-shadow] duration-[250ms] ease-out hover:-translate-y-1.5 hover:shadow-2xl sm:min-h-[380px]"
              >
                {/* unoptimized : la ré-encodage WebP/AVIF automatique de
                    Next produit un fichier cassé (gris uni) pour ces deux
                    photos précises, alors que le JPEG d'origine est
                    correct — sert le JPEG tel quel, déjà allégé en amont. */}
                <Image
                  src={cycle.image.src}
                  alt={cycle.image.alt}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover saturate-[1.08] contrast-[1.03] transition-transform duration-[600ms] ease-out group-hover:scale-105"
                />

                <div
                  aria-hidden="true"
                  className={`absolute inset-0 bg-gradient-to-t ${styles.veil}`}
                />

                {/* Lien "étiré" (stretched link) : couvre toute la carte
                    sans imbriquer un <a> dans un autre — les pastilles
                    ci-dessous restent des liens indépendants, cliquables
                    par-dessus grâce à pointer-events-auto + z-index. */}
                <Link
                  href={`/programme/${cycle.id}`}
                  className="absolute inset-0 z-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                >
                  <span className="sr-only">
                    Découvrir le programme {cycle.titre} — {cycle.description}
                  </span>
                </Link>

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg text-white backdrop-blur-sm transition-transform duration-300 ease-out group-hover:translate-x-1"
                >
                  →
                </span>

                <div className="relative z-10 pointer-events-none p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-white sm:text-2xl">
                    {cycle.titre}
                  </h3>
                  <p className="mt-1 text-sm text-white/85">
                    {cycle.description}
                  </p>

                  <ul className="pointer-events-auto relative z-20 mt-6 flex flex-wrap gap-2">
                    {cycle.classes.map((classe) => (
                      <li key={classe.href}>
                        <Link
                          href={classe.href}
                          aria-label={`Programme ${classe.label}`}
                          className="inline-block rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:border-white/50 hover:bg-white/30"
                        >
                          {classe.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
