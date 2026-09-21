interface Feature {
  title: string;
  description: string;
  icon: string;
}

const FEATURES: readonly Feature[] = [
  {
    title: "Cours complets",
    description:
      "Toutes les leçons rédigées, alignées sur le programme officiel du Niger.",
    icon: "📘",
  },
  {
    title: "Démonstrations",
    description:
      "Des raisonnements détaillés, étape par étape, pour vraiment comprendre.",
    icon: "🧮",
  },
  {
    title: "Exercices corrigés",
    description:
      "Des exercices variés avec des corrections complètes pour s'entraîner.",
    icon: "✏️",
  },
  {
    title: "Aide enseignant",
    description:
      "Des ressources pensées pour accompagner aussi le travail des enseignants.",
    icon: "🧑‍🏫",
  },
];

export default function Features() {
  return (
    <section className="bg-fh-creme">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="mb-8 max-w-xl text-2xl font-bold text-fh-bleu sm:text-3xl">
          Tout ce qu&apos;il faut pour progresser
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl bg-fh-sable p-6">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fh-orange/10 text-2xl">
                {feature.icon}
              </span>
              <h3 className="mb-2 text-lg font-semibold text-fh-bleu">
                {feature.title}
              </h3>
              <p className="text-sm text-fh-ardoise">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
