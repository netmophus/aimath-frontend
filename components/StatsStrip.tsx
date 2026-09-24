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
    <section className="bg-fh-creme px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl rounded-2xl bg-gradient-to-br from-fh-orange to-fh-orange-fonce px-6 py-8 sm:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:flex sm:flex-nowrap sm:justify-around sm:gap-0">
          {STATS.map((stat, index) => (
            <div key={stat.label} className="flex items-center justify-center gap-6 sm:gap-8">
              {index !== 0 && (
                <span
                  aria-hidden="true"
                  className="hidden h-12 w-px shrink-0 bg-white/25 sm:block"
                />
              )}
              <div className="text-center">
                <p className="text-4xl font-medium text-white">{stat.value}</p>
                <p className="mt-1 text-[13px] text-fh-accent">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
