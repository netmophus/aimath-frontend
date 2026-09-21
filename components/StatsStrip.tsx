interface Stat {
  value: string;
  label: string;
}

const STATS: readonly Stat[] = [
  { value: "7", label: "niveaux, du collège au lycée" },
  { value: "Toutes", label: "les matières couvertes" },
  { value: "100%", label: "programme officiel du Niger" },
  { value: "24/7", label: "accès depuis n'importe où" },
];

export default function StatsStrip() {
  return (
    <section className="bg-fh-bleu-charbon text-fh-creme">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center lg:text-left">
            <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
            <p className="mt-1 text-sm text-fh-creme/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
