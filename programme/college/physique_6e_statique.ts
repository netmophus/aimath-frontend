// DONNÉES STATIQUES — Physique 6e (matière "Physique" seule)
// Source : programme officiel nigérien (PDF premier cycle, pages 197-199).
// Partie PHYSIQUE des sciences physiques 6e : 17h.
// À intégrer dans lib/programmeCollegeStatique.ts, matière "Physique" du niveau 6e.

export const PHYSIQUE_6E = {
  matiere: "Physique",
  niveau: "6e",
  themes: [
    {
      titre: "Propriétés physiques de la matière",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Propriétés physiques des solides, liquides et gaz",
          description: "Propriétés physiques des solides, des liquides et des gaz (l'air). Mesures pratiques de volumes de solides et de liquides. L'élève apprend à distinguer les états à partir de leurs propriétés, à calculer le volume de solides géométriques simples (cube, parallélépipède, cylindre) et à mesurer des volumes à l'aide de récipients gradués.",
        },
        {
          titre: "États de la matière",
          description: "Les trois états de la matière (solide, liquide, gaz). Changements d'état (exemple de l'eau : solidification-fusion, vaporisation-condensation, sublimation). Tableau des changements d'état.",
        },
        {
          titre: "Masse d'un corps",
          description: "Notion de masse. Unité de masse : le kilogramme (kg), ses multiples et sous-multiples. Utilisation d'une balance (simple pesée d'un solide, d'un liquide). Différents types de balances.",
        },
      ],
    },
    {
      titre: "Température et chaleur",
      volumeHoraire: 3,
      chapitres: [
        {
          titre: "Température et chaleur",
          description: "Notion de température. Thermomètre à liquide : description et utilisation. Échelle Celsius. Notion de chaleur : corps chauds, corps froids. L'élève apprend à schématiser et utiliser un thermomètre, et à distinguer température et chaleur.",
        },
      ],
    },
    {
      titre: "Électricité",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Lampe électrique",
          description: "Fonctionnement d'une lampe électrique à partir d'une pile. Circuit électrique et courant électrique. Conducteurs et isolants. Interrupteur. L'élève identifie les bornes d'une pile, allume une ampoule, distingue isolant et conducteur, et schématise un circuit simple avec les symboles normalisés.",
        },
        {
          titre: "Montage de piles électriques en série",
          description: "Piles électriques en série. Respect de la tension d'utilisation. L'élève réalise et schématise des montages en série avec 2 puis 3 piles, en observant l'éclat de l'ampoule.",
        },
      ],
    },
  ],
};

// Récapitulatif : 3 thèmes, 6 chapitres (17h).
// Propriétés de la matière (3), Température et chaleur (1), Électricité (2).
