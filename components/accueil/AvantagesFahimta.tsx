import { IconAtom2, IconSchool, IconCertificate, IconTrendingUp, IconWifiOff, type TablerIcon } from "@tabler/icons-react";

import { AVANTAGES } from "@/lib/heroSlides";

const ICONES: readonly TablerIcon[] = [IconTrendingUp, IconWifiOff, IconAtom2, IconCertificate, IconSchool];

/** Les autres arguments de FAHIMTA (anciennes diapositives du bandeau), dont « Apprends même sans connexion ». */
export default function AvantagesFahimta() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-fh-bleu sm:text-3xl">Pourquoi FAHIMTA</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AVANTAGES.map((a, i) => {
            const Icone = ICONES[i];
            return (
              <li key={a.title} className="flex gap-4 rounded-xl border border-fh-sable bg-fh-creme p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fh-bleu">
                  <Icone size={20} stroke={1.75} color="white" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-fh-bleu">{a.title}</h3>
                  <p className="mt-1 text-sm text-fh-ardoise">{a.subtitle}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
