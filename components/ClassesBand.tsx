import Link from "next/link";

type CycleAccueilId = "college" | "lycee";

interface ClassePastille {
  label: string;
  /** Slug simple utilisé dans l'URL (ex. /programme/1re-c). */
  slug: string;
}

interface CycleAccueil {
  id: CycleAccueilId;
  titre: string;
  description: string;
  /** Emoji sobre, pas de dépendance d'icônes pour un seul usage. */
  icon: string;
  classes: readonly ClassePastille[];
}

/**
 * Classes affichées par cycle sur la page d'accueil. Structure dédiée
 * (plutôt que lib/classes.ts, pensé pour les select du formulaire
 * d'inscription) : ici chaque série a sa propre pastille à plat.
 */
const CYCLES_ACCUEIL: readonly CycleAccueil[] = [
  {
    id: "college",
    titre: "Collège",
    description: "De la 6e à la 3e",
    icon: "🎒",
    classes: [
      { label: "6e", slug: "6e" },
      { label: "5e", slug: "5e" },
      { label: "4e", slug: "4e" },
      { label: "3e", slug: "3e" },
    ],
  },
  {
    id: "lycee",
    titre: "Lycée",
    description: "2nde, 1re et Tle · séries C·D·E·A·G",
    icon: "🎓",
    classes: [
      { label: "2nde", slug: "2nde" },
      { label: "1re C", slug: "1re-c" },
      { label: "1re D", slug: "1re-d" },
      { label: "1re E", slug: "1re-e" },
      { label: "1re A", slug: "1re-a" },
      { label: "1re G", slug: "1re-g" },
      { label: "Tle C", slug: "tle-c" },
      { label: "Tle D", slug: "tle-d" },
      { label: "Tle E", slug: "tle-e" },
      { label: "Tle A", slug: "tle-a" },
      { label: "Tle G", slug: "tle-g" },
    ],
  },
];

/** Classes littérales (pas de concaténation) pour que Tailwind les détecte. */
const CYCLE_STYLES: Record<
  CycleAccueilId,
  { gradient: string; hoverText: string }
> = {
  college: {
    gradient: "bg-gradient-to-br from-fh-bleu to-fh-bleu-vif",
    hoverText: "hover:text-fh-bleu",
  },
  lycee: {
    gradient: "bg-gradient-to-br from-fh-orange to-fh-orange-fonce",
    hoverText: "hover:text-fh-orange",
  },
};

export default function ClassesBand() {
  return (
    <section className="bg-fh-creme">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-8 max-w-xl">
          <h2 className="text-2xl font-bold text-fh-bleu sm:text-3xl">
            Tout le programme du Niger
          </h2>
          <p className="mt-2 text-sm text-fh-ardoise sm:text-base">
            De la 6e à la Terminale, dans toutes les séries
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {CYCLES_ACCUEIL.map((cycle) => {
            const styles = CYCLE_STYLES[cycle.id];

            return (
              <div
                key={cycle.id}
                className={`rounded-3xl p-6 sm:p-8 ${styles.gradient}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {cycle.icon}
                  </span>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">
                    {cycle.titre}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-white/70">
                  {cycle.description}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {cycle.classes.map((classe) => (
                    <li key={classe.slug}>
                      <Link
                        href={`/programme/${classe.slug}`}
                        className={`inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white ${styles.hoverText}`}
                      >
                        {classe.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
