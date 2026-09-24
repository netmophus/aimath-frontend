// DONNÉES STATIQUES — Chimie 6e (matière "Chimie" seule)
// Source : programme officiel nigérien (PDF premier cycle, pages 199-200).
// Partie CHIMIE des sciences physiques 6e : 5h.
// À intégrer dans lib/programmeCollegeStatique.ts, matière "Chimie" du niveau 6e.

export const CHIMIE_6E = {
  matiere: "Chimie",
  niveau: "6e",
  themes: [
    {
      titre: "Combustions",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Combustions",
          description: "Combustion des solides (bois, charbon), des liquides (pétrole), des gaz (butane). Détection des produits de combustion (vapeur d'eau, dioxyde de carbone, noir de fumée). Les combustions comme sources de chaleur. Première notion de réaction chimique : les réactifs disparaissent, des corps nouveaux apparaissent.",
        },
        {
          titre: "Applications, dangers et préventions",
          description: "Quelques applications des combustions. Dangers des combustions et moyens de prévention contre ces dangers.",
        },
      ],
    },
    {
      titre: "Composition de l'air",
      volumeHoraire: 1,
      chapitres: [
        {
          titre: "Composition de l'air",
          description: "Composition de l'air en diazote et en dioxygène. L'élève réalise une expérience pour identifier les principaux constituants de l'air et donne sa composition en volume (dioxygène un cinquième, diazote quatre cinquièmes).",
        },
      ],
    },
  ],
};

// Récapitulatif : 2 thèmes, 3 chapitres (5h).
// Combustions (2), Composition de l'air (1).
