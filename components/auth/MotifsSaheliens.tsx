/**
 * Décor de la colonne d'identité de /login : losanges et croix très discrets (inspiration des motifs sahéliens
 * tissés) et rayons orange clair derrière la photographie. SVG local, purement décoratif (aria-hidden), sans image
 * externe ni script ; il ne reçoit aucun clic.
 */
export default function MotifsSaheliens() {
  const rayons = Array.from({ length: 13 }, (_, i) => {
    const angle = -100 + i * 14;   // éventail ouvert vers le haut et la droite
    const longueur = 250 + ((i * 53) % 130);
    return { angle, longueur, debut: 130 + ((i * 29) % 50) };
  });

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 600 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="losanges-sahel" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M32 6 58 32 32 58 6 32Z" fill="none" stroke="#F4B66A" strokeWidth="1.2" opacity="0.32" />
          <path d="M32 20 44 32 32 44 20 32Z" fill="none" stroke="#F4B66A" strokeWidth="1" opacity="0.28" />
          <path d="M0 0v8M0 0h8M64 0v8M64 0h-8M0 64v-8M0 64h8M64 64v-8M64 64h-8" stroke="#F4B66A" strokeWidth="1.2" opacity="0.3" />
        </pattern>
        <linearGradient id="fondu-sahel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF7DE" stopOpacity="1" />
          <stop offset="0.45" stopColor="#FFF7DE" stopOpacity="0.15" />
          <stop offset="1" stopColor="#FFF7DE" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="600" height="900" fill="url(#losanges-sahel)" />
      <rect width="600" height="900" fill="url(#fondu-sahel)" />

      {/* Soleil pâle et rayons derrière la photographie */}
      <circle cx="505" cy="540" r="175" fill="#FFE2A8" opacity="0.55" />
      <g transform="translate(505 540)" stroke="#FFC37A" strokeLinecap="round" opacity="0.55">
        {rayons.map((r) => (
          <line
            key={r.angle}
            x1={r.debut}
            y1="0"
            x2={r.debut + r.longueur}
            y2="0"
            strokeWidth="13"
            transform={`rotate(${r.angle})`}
          />
        ))}
      </g>
      <circle cx="470" cy="610" r="14" fill="#FFB347" opacity="0.9" />
    </svg>
  );
}
