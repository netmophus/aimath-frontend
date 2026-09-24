/**
 * Données STATIQUES du programme du collège, en dur ici pour valider le
 * parcours de navigation (/programme/college/[niveau]/[matiere]) avant de
 * brancher ces pages sur la vraie API (mêmes routes /api/... que l'espace
 * élève, une fois un endpoint public équivalent créé côté backend).
 *
 * CE QUI EST RÉEL vs PLACEHOLDER : les 4 matières de 6e (Mathématiques,
 * Physique, Chimie, SVT) ont désormais leur vrai contenu. Seules les 4
 * matières de 5e/4e/3e restent PROGRAMME_PLACEHOLDER — un texte générique
 * "Programme bientôt disponible", juste pour que le parcours de navigation
 * reste cliquable partout sans lien mort.
 */

export type NiveauCollegeId = "6e" | "5e" | "4e" | "3e";
export type MatiereCollegeId = "mathematiques" | "physique" | "chimie" | "svt";

export interface NiveauCollege {
  id: NiveauCollegeId;
  nom: string;
}

export interface MatiereCollege {
  id: MatiereCollegeId;
  nom: string;
}

export interface ChapitreStatique {
  titre: string;
  description: string;
}

export interface ThemeStatique {
  titre: string;
  /** Volume horaire en heures. */
  volumeHoraire: number;
  chapitres: readonly ChapitreStatique[];
}

export interface ProgrammeMatiereStatique {
  /** false = contenu réel (seulement Maths 6e pour l'instant) ; true =
   * placeholder générique en attendant les vraies données. */
  estPlaceholder: boolean;
  themes: readonly ThemeStatique[];
}

export const NIVEAUX_COLLEGE: readonly NiveauCollege[] = [
  { id: "6e", nom: "6e" },
  { id: "5e", nom: "5e" },
  { id: "4e", nom: "4e" },
  { id: "3e", nom: "3e" },
];

export const MATIERES_COLLEGE: readonly MatiereCollege[] = [
  { id: "mathematiques", nom: "Mathématiques" },
  { id: "physique", nom: "Physique" },
  { id: "chimie", nom: "Chimie" },
  { id: "svt", nom: "SVT" },
];

/** RÉEL — fourni telle quelle par la personne à l'origine de cette tâche. */
const PROGRAMME_MATHS_6E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Configurations de l'espace",
      volumeHoraire: 11,
      chapitres: [
        {
          titre: "Cube et pavé droit",
          description:
            "Observation et description du solide, vocabulaire (sommets, arêtes, faces). Construction d'un patron et réalisation du solide. Calculs d'aires et de volumes : pour un cube d'arête a, aire 6a² et volume a³ ; pour un pavé de dimensions a, b, c, aire 2(ab+bc+ac) et volume abc.",
        },
        {
          titre: "Cylindre droit",
          description:
            "Reconnaître les objets de forme cylindrique. Dessiner un patron d'un cylindre droit et réaliser le solide. Calculer l'aire (2πr² + 2πrh) et le volume (πr²h) d'un cylindre de rayon r et de hauteur h.",
        },
      ],
    },
    {
      titre: "Configurations du plan",
      volumeHoraire: 55,
      chapitres: [
        {
          titre: "Droites dans le plan",
          description:
            "Droites, points alignés, demi-droites. Droites sécantes, perpendiculaires et parallèles. Représenter, nommer et tracer une droite ; vérifier l'alignement ; construire perpendiculaires et parallèles à la règle et l'équerre. Notations ∈, ∉, [AB).",
        },
        {
          titre: "Segments",
          description:
            "Segment, support, longueur et mesure. Milieu et médiatrice d'un segment. Comparer et mesurer des longueurs ; construire le milieu et la médiatrice (règle-équerre, règle-compas). Distinguer les notations [AB], [AB), (AB) et AB.",
        },
        {
          titre: "Angles",
          description:
            "Notion d'angle, sommet et côtés, vocabulaire. Mesure en degrés au rapporteur. Angles particuliers (nul, aigu, droit, obtus, plat), adjacents, complémentaires, supplémentaires. Tracer la bissectrice d'un angle.",
        },
        {
          titre: "Triangles",
          description:
            "Vocabulaire (côtés, sommets, angles). Triangles particuliers (isocèle, équilatéral, rectangle). Droites particulières : hauteurs, médiatrices, bissectrices, médianes. Construire un triangle connaissant côtés et/ou angles ; calculer périmètre et aire.",
        },
        {
          titre: "Cercles",
          description:
            "Centre, rayon, diamètre, corde, arc, secteur. Tracer un cercle (centre et rayon, centre et point, diamètre). Distinguer cercle et disque. Calculer le périmètre d'un cercle et l'aire d'un disque.",
        },
      ],
    },
    {
      titre: "Applications du plan",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Figures symétriques par rapport à une droite",
          description:
            "Reconnaître un axe de symétrie (par pliage). Construire le symétrique d'un point et de figures simples (droite, segment, angle) par rapport à une droite. Utiliser les axes de symétrie pour établir des propriétés (égalités de longueurs, d'angles, alignements).",
        },
        {
          titre: "Figures symétriques par rapport à un point",
          description:
            "Construire le symétrique par rapport à un point d'un point et de figures simples. Reconnaître un centre de symétrie. Utiliser les centres de symétrie pour établir des propriétés (égalités de longueurs, d'angles, alignement de 3 points).",
        },
      ],
    },
    {
      titre: "Outil vectoriel — Géométrie analytique",
      volumeHoraire: 3,
      chapitres: [
        {
          titre: "Repérage d'un point sur une droite",
          description:
            "Demi-droite et droite graduées : origine, unité, abscisse d'un point. Graduer une demi-droite et une droite, repérer un décimal (arithmétique puis relatif) par un point, déterminer l'abscisse d'un point. En liaison avec les nombres décimaux.",
        },
      ],
    },
    {
      titre: "Organisation de calculs — Calculs numériques",
      volumeHoraire: 86,
      chapitres: [
        {
          titre: "Les entiers naturels",
          description:
            "Ensemble ℕ, symboles ∈ et ∉. Addition et multiplication, comparaison (< et >), entiers consécutifs. Multiples et diviseurs. Caractères de divisibilité (par 10, 100, 1000 ; 2, 5, 4, 25 ; 3, 9). Reconnaître pair et impair.",
        },
        {
          titre: "Fractions",
          description:
            "Notion de fraction (numérateur, dénominateur), différentes écritures et simplification. Fraction décimale. Somme et différence de fractions de même dénominateur. Comparaison. Produit de deux fractions et inverse d'une fraction.",
        },
        {
          titre: "Nombres décimaux arithmétiques",
          description:
            "Écritures d'un décimal (dont fraction décimale). Addition, soustraction, multiplication, division de décimaux. Comparaison, encadrement par deux entiers, rangement. Estimation et ordre de grandeur d'un résultat.",
        },
        {
          titre: "Nombres décimaux relatifs",
          description:
            "Ensemble ℤ des entiers relatifs (somme, opposé, comparaison, rangement). Ensemble 𝔻 des décimaux relatifs ; ℕ et ℤ comme sous-ensembles de 𝔻. Somme, opposé d'un décimal relatif et opposé d'une somme. Situations concrètes de bilans (températures, dates).",
        },
      ],
    },
    {
      titre: "Organisation des calculs — Calcul littéral",
      volumeHoraire: 7,
      chapitres: [
        {
          titre: "Organisation des calculs",
          description:
            "Utilisation des propriétés de l'addition et de la multiplication. Règles de priorité des opérations et utilisation des parenthèses dans des calculs.",
        },
        {
          titre: "Initiation au calcul littéral",
          description:
            "Notion de variable et d'inconnue dans une formule. Reconnaître les lettres remplaçables (ex. L = 2 × 3,14 × R) et les remplacer par des valeurs numériques. Première approche de l'inconnue comme quantité cherchée.",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Situation de proportionnalité",
          description:
            "Tableau et coefficient de proportionnalité. Reconnaître deux suites proportionnelles, trouver un nombre manquant. Pourcentage et échelle (agrandissement et réduction). Résoudre des problèmes concrets de proportionnalité.",
        },
        {
          titre: "Statistiques",
          description:
            "Lecture graphique : lire et exploiter les informations d'une représentation graphique d'une série statistique (courbes de température, diagrammes à bandes, données de géographie ou d'économie).",
        },
      ],
    },
  ],
};

/** RÉEL — fourni telle quelle par la personne à l'origine de cette tâche. */
const PROGRAMME_PHYSIQUE_6E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Propriétés physiques de la matière",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Propriétés physiques des solides, liquides et gaz",
          description:
            "Propriétés physiques des solides, des liquides et des gaz (l'air). Mesures pratiques de volumes de solides et de liquides. L'élève apprend à distinguer les états à partir de leurs propriétés, à calculer le volume de solides géométriques simples (cube, parallélépipède, cylindre) et à mesurer des volumes à l'aide de récipients gradués.",
        },
        {
          titre: "États de la matière",
          description:
            "Les trois états de la matière (solide, liquide, gaz). Changements d'état (exemple de l'eau : solidification-fusion, vaporisation-condensation, sublimation). Tableau des changements d'état.",
        },
        {
          titre: "Masse d'un corps",
          description:
            "Notion de masse. Unité de masse : le kilogramme (kg), ses multiples et sous-multiples. Utilisation d'une balance (simple pesée d'un solide, d'un liquide). Différents types de balances.",
        },
      ],
    },
    {
      titre: "Température et chaleur",
      volumeHoraire: 3,
      chapitres: [
        {
          titre: "Température et chaleur",
          description:
            "Notion de température. Thermomètre à liquide : description et utilisation. Échelle Celsius. Notion de chaleur : corps chauds, corps froids. L'élève apprend à schématiser et utiliser un thermomètre, et à distinguer température et chaleur.",
        },
      ],
    },
    {
      titre: "Électricité",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Lampe électrique",
          description:
            "Fonctionnement d'une lampe électrique à partir d'une pile. Circuit électrique et courant électrique. Conducteurs et isolants. Interrupteur. L'élève identifie les bornes d'une pile, allume une ampoule, distingue isolant et conducteur, et schématise un circuit simple avec les symboles normalisés.",
        },
        {
          titre: "Montage de piles électriques en série",
          description:
            "Piles électriques en série. Respect de la tension d'utilisation. L'élève réalise et schématise des montages en série avec 2 puis 3 piles, en observant l'éclat de l'ampoule.",
        },
      ],
    },
  ],
};

/** RÉEL — fourni telle quelle par la personne à l'origine de cette tâche. */
const PROGRAMME_CHIMIE_6E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Combustions",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Combustions",
          description:
            "Combustion des solides (bois, charbon), des liquides (pétrole), des gaz (butane). Détection des produits de combustion (vapeur d'eau, dioxyde de carbone, noir de fumée). Les combustions comme sources de chaleur. Première notion de réaction chimique : les réactifs disparaissent, des corps nouveaux apparaissent.",
        },
        {
          titre: "Applications, dangers et préventions",
          description:
            "Quelques applications des combustions. Dangers des combustions et moyens de prévention contre ces dangers.",
        },
      ],
    },
    {
      titre: "Composition de l'air",
      volumeHoraire: 1,
      chapitres: [
        {
          titre: "Composition de l'air",
          description:
            "Composition de l'air en diazote et en dioxygène. L'élève réalise une expérience pour identifier les principaux constituants de l'air et donne sa composition en volume (dioxygène un cinquième, diazote quatre cinquièmes).",
        },
      ],
    },
  ],
};

/** RÉEL — fourni telle quelle par la personne à l'origine de cette tâche. */
const PROGRAMME_SVT_6E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Environnement",
      volumeHoraire: 14,
      chapitres: [
        {
          titre: "Les composantes de l'environnement",
          description:
            "Les composantes physiques (sol, réseau hydrographique, air, roches, relief) et vivantes (animaux, végétaux). Les actions utiles et néfastes de l'Homme sur l'environnement. Distinction entre monde vivant et monde minéral. Initiation au dessin d'observation lors d'une sortie écologique.",
        },
        {
          titre: "Classification des êtres vivants",
          description:
            "Initiation à l'utilisation de la loupe et du microscope. Observation d'organes animaux et végétaux, et d'organismes unicellulaires. Classification simple des êtres vivants (règne animal, règne végétal ; pluricellulaires, unicellulaires). Notion de biodiversité.",
        },
        {
          titre: "Les relations trophiques dans l'environnement",
          description:
            "Chaîne alimentaire, producteurs, consommateurs, décomposeurs, réseau trophique, équilibre naturel. Identifier les maillons d'une chaîne alimentaire, les conséquences de la disparition d'un maillon, et les causes de rupture des équilibres naturels.",
        },
      ],
    },
    {
      titre: "Reproduction chez les êtres vivants",
      volumeHoraire: 14,
      chapitres: [
        {
          titre: "La reproduction chez les vertébrés",
          description:
            "Oviparité et viviparité (exemples de la poule et de la vache). Appareil reproducteur, comportement sexuel, gestation, accouplement, fécondation, mise bas. Distinction mâle/femelle par les caractères sexuels. Notions de fécondation interne, développement interne, viviparité et oviparité.",
        },
        {
          titre: "La reproduction chez les plantes à fleurs",
          description:
            "Organisation d'une plante à fleurs (appareil végétatif et reproducteur). Reproduction sexuée : pollinisation, fécondation, fruit et graine, germination. Reproduction asexuée : bouturage, marcottage, greffage. Rôle des différentes parties de la fleur et facteurs de la germination.",
        },
      ],
    },
    {
      titre: "Production d'aliments chez les êtres vivants",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "La production de matières organiques par les végétaux chlorophylliens",
          description:
            "Constituants de la plante (eau, sels minéraux, matière organique). Nutrition des plantes vertes : absorption, transpiration. Photosynthèse : production de matière organique, régulation de l'atmosphère (absorption du CO₂, production d'oxygène). Notion d'autotrophie.",
        },
        {
          titre: "L'amélioration de la production animale et végétale",
          description:
            "Types d'élevage domestique au Niger. Notions de sélection, insémination artificielle, croisements, soins vétérinaires. Sélection des plantes, traitements phytosanitaires, engrais naturels et chimiques.",
        },
      ],
    },
    {
      titre: "Respiration chez les vertébrés",
      volumeHoraire: 8,
      chapitres: [
        {
          titre: "Modes de respiration",
          description:
            "Respiration aérienne (cas de l'Homme) et aquatique (cas du poisson). Notions de respiration, mouvement respiratoire, inspiration, expiration, rythme respiratoire, arc branchial, poumons, alvéole pulmonaire. Comparaison de l'air inspiré et expiré (teneurs en oxygène et dioxyde de carbone).",
        },
        {
          titre: "Adaptations aux milieux",
          description:
            "Adaptation des organes respiratoires au milieu aérien (Homme) et au milieu aquatique (poisson). Le poisson respire dans l'eau grâce à ses branchies (respiration branchiale).",
        },
      ],
    },
    {
      titre: "Introduction à la géologie",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "La géologie, domaines d'étude et importance",
          description:
            "Définition de la géologie et de son objet d'étude. Ses domaines variés (pétrographie, paléontologie, hydrogéologie). Applications dans la vie courante : matériaux de construction, ressources énergétiques et minières, alimentation en eau, prévention des risques naturels.",
        },
      ],
    },
  ],
};

/** PLACEHOLDER — même objet réutilisé partout où le vrai contenu manque
 * encore (jamais muté, lecture seule). */
const PROGRAMME_PLACEHOLDER: ProgrammeMatiereStatique = {
  estPlaceholder: true,
  themes: [],
};

const PROGRAMMES_PAR_NIVEAU: Record<
  NiveauCollegeId,
  Record<MatiereCollegeId, ProgrammeMatiereStatique>
> = {
  "6e": {
    mathematiques: PROGRAMME_MATHS_6E,
    physique: PROGRAMME_PHYSIQUE_6E,
    chimie: PROGRAMME_CHIMIE_6E,
    svt: PROGRAMME_SVT_6E,
  },
  "5e": {
    mathematiques: PROGRAMME_PLACEHOLDER,
    physique: PROGRAMME_PLACEHOLDER,
    chimie: PROGRAMME_PLACEHOLDER,
    svt: PROGRAMME_PLACEHOLDER,
  },
  "4e": {
    mathematiques: PROGRAMME_PLACEHOLDER,
    physique: PROGRAMME_PLACEHOLDER,
    chimie: PROGRAMME_PLACEHOLDER,
    svt: PROGRAMME_PLACEHOLDER,
  },
  "3e": {
    mathematiques: PROGRAMME_PLACEHOLDER,
    physique: PROGRAMME_PLACEHOLDER,
    chimie: PROGRAMME_PLACEHOLDER,
    svt: PROGRAMME_PLACEHOLDER,
  },
};

export function trouverNiveauCollege(id: string): NiveauCollege | undefined {
  return NIVEAUX_COLLEGE.find((niveau) => niveau.id === id);
}

export function trouverMatiereCollege(id: string): MatiereCollege | undefined {
  return MATIERES_COLLEGE.find((matiere) => matiere.id === id);
}

export function obtenirProgrammeCollege(
  niveauId: NiveauCollegeId,
  matiereId: MatiereCollegeId
): ProgrammeMatiereStatique {
  return PROGRAMMES_PAR_NIVEAU[niveauId][matiereId];
}
