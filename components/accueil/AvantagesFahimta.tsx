import { IconAtom2, IconSchool, IconCertificate, IconHistory, IconTrendingUp, IconWifiOff, type TablerIcon } from "@tabler/icons-react";

import { AVANTAGES } from "@/lib/heroSlides";

const ICONES: readonly TablerIcon[] = [IconTrendingUp, IconWifiOff, IconAtom2, IconCertificate, IconSchool, IconHistory];

/** Les arguments de FAHIMTA (anciennes diapositives du bandeau), dont « Apprends même sans connexion ». */
export default function AvantagesFahimta() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-14">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#EFF6FF] px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
        {/* courbes décoratives discrètes : coin supérieur gauche et coin inférieur droit */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-[28px] border-[#BFDBFE]/70" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-24 h-72 w-72 rounded-full border-[32px] border-[#BFDBFE]/70" />

        <div className="relative">
          <h2 className="text-center text-3xl font-extrabold text-[#102A66] sm:text-4xl">Pourquoi FAHIMTA</h2>
          <span aria-hidden="true" className="mx-auto mb-10 mt-4 block h-1 w-16 rounded-full bg-[#0B5CFF]" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {AVANTAGES.map((a, i) => {
              const Icone = ICONES[i];
              return (
                <li
                  key={a.title}
                  className="relative flex h-full gap-4 overflow-hidden rounded-[20px] border border-[#BFDBFE] bg-white p-6 shadow-[0_6px_18px_-8px_rgba(37,99,235,0.25)]"
                >
                  {/* décoration courbe très claire, coin supérieur droit */}
                  <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#EFF6FF]" />
                  <span className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-[#102A66]">
                    <Icone size={28} stroke={1.75} color="white" aria-hidden="true" />
                  </span>
                  <div className="relative">
                    <h3 className="text-lg font-bold leading-snug text-[#102A66]">{a.title}</h3>
                    <span aria-hidden="true" className="mt-2 block h-0.5 w-10 rounded-full bg-[#2563EB]" />
                    <p className="mt-3 text-[15px] leading-relaxed text-fh-ardoise">{a.subtitle}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
