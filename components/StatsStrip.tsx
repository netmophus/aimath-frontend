import type { ReactNode } from "react";
import { IconBooks, IconClock, IconFileCheck, IconSchool, IconWorld } from "@tabler/icons-react";

interface Stat {
  value: string;
  label: string;
  icone: ReactNode;
}

const TAILLE = 72;

const STATS: readonly Stat[] = [
  { value: "7", label: "niveaux, du collège au lycée", icone: <IconSchool size={TAILLE} stroke={1.5} aria-hidden="true" /> },
  { value: "4", label: "matières scientifiques couvertes", icone: <IconBooks size={TAILLE} stroke={1.5} aria-hidden="true" /> },
  { value: "100%", label: "programme officiel du Niger", icone: <IconFileCheck size={TAILLE} stroke={1.5} aria-hidden="true" /> },
  {
    value: "24/7",
    label: "accès depuis n'importe où",
    // globe terrestre + petite horloge en médaillon
    icone: (
      <span className="relative inline-flex">
        <IconWorld size={TAILLE} stroke={1.5} aria-hidden="true" />
        <span className="absolute -bottom-1 -right-2 rounded-full bg-[#C94A08] p-0.5">
          <IconClock size={30} stroke={2} aria-hidden="true" />
        </span>
      </span>
    ),
  },
];

export default function StatsStrip() {
  return (
    <section className="bg-fh-creme px-4 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-14">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#F97316] to-[#C94A08] shadow-sm">
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <li
              key={stat.label}
              className={`flex flex-col items-center px-3 py-7 text-center text-white sm:px-6 sm:py-9 ${
                index % 2 === 1 ? "border-l border-white/25" : ""
              } ${index >= 2 ? "border-t border-white/25 lg:border-t-0" : ""} ${index === 2 ? "lg:border-l" : ""}`}
            >
              <span className="mb-3 flex h-[72px] items-center justify-center max-sm:scale-[.8] sm:mb-4">{stat.icone}</span>
              <p className="text-[42px] font-bold leading-none sm:text-5xl">{stat.value}</p>
              <p className="mt-2 max-w-[16rem] text-[15px] font-semibold leading-snug sm:text-base">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
