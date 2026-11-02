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

/** Illustration scolaire vectorielle sobre : chapeau de diplômé et pile de livres. */
function IllustrationScolaire() {
  return (
    <svg viewBox="0 0 220 150" aria-hidden="true" className="h-full w-full">
      {/* livres */}
      <rect x="40" y="112" width="140" height="18" rx="3" fill="#F97316" />
      <rect x="40" y="119" width="140" height="3" fill="#C2410C" />
      <rect x="52" y="94" width="120" height="18" rx="3" fill="#FFFFFF" />
      <rect x="52" y="101" width="120" height="3" fill="#BFDBFE" />
      <rect x="62" y="76" width="100" height="18" rx="3" fill="#7C3AED" />
      <rect x="62" y="83" width="100" height="3" fill="#5B21B6" />
      {/* chapeau de diplômé */}
      <path d="M110 18 L184 46 L110 74 L36 46 Z" fill="#0B1F4D" />
      <path d="M72 62 V80 C72 90 148 90 148 80 V62 L110 76 Z" fill="#1E3A8A" />
      <path d="M110 18 L184 46 L110 74 L36 46 Z" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinejoin="round" />
      <line x1="176" y1="49" x2="176" y2="86" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
      <circle cx="176" cy="90" r="5" fill="#F97316" />
    </svg>
  );
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
        <div className="hidden h-32 w-48 shrink-0 sm:block lg:h-36 lg:w-56">
          <IllustrationScolaire />
        </div>
      </div>
    </section>
  );
}
