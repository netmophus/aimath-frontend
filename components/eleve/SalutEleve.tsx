import { IconSchool } from "@tabler/icons-react";

interface SalutEleveProps {
  prenom: string;
  nom: string;
  classe: string | null;
  photoUrl: string | null;
}

function initiales(prenom: string, nom: string): string {
  const p = prenom.trim().charAt(0);
  const n = nom.trim().charAt(0);
  return `${p}${n}`.toUpperCase() || "?";
}

/**
 * Grand bandeau de bienvenue du dashboard (/eleve) : prénom, nom et classe
 * viennent de l'utilisateur connecté, rien n'est écrit en dur.
 */
export default function SalutEleve({ prenom, nom, classe, photoUrl }: SalutEleveProps) {
  return (
    <section
      aria-label="Bienvenue"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D4ED8] to-[#102A66] px-5 py-6 text-white shadow-md sm:px-8 sm:py-8"
    >
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-[#F97316] text-lg font-bold text-white sm:h-16 sm:w-16"
            aria-hidden="true"
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL Cloudinary externe (domaine variable), next/image n'apporte rien pour un avatar.
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initiales(prenom, nom)
            )}
          </span>
          <div className="min-w-0">
            <p className="text-base text-white/85 sm:text-lg">Bonjour,</p>
            <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">
              <span className="sm:hidden">{prenom}</span>
              <span className="hidden truncate sm:inline">
                {prenom} {nom}
              </span>
            </h1>
            {classe && (
              <p className="mt-1.5 inline-block rounded-full bg-white/15 px-3 py-0.5 text-sm font-semibold sm:text-base">
                {classe}
              </p>
            )}
          </div>
        </div>
        {/* Chapeau de diplômé : grande icône blanche, centrée verticalement à droite ; masquée sur petit écran. */}
        <IconSchool size={140} stroke={1.75} aria-hidden="true" className="hidden shrink-0 text-white sm:block" />
      </div>
    </section>
  );
}
