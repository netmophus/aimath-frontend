/**
 * Données STATIQUES du programme du collège, en dur ici pour valider le
 * parcours de navigation (/programme/college/[niveau]/[matiere]) avant de
 * brancher ces pages sur la vraie API (mêmes routes /api/... que l'espace
 * élève, une fois un endpoint public équivalent créé côté backend).
 *
 * CE QUI EST RÉEL vs PLACEHOLDER : les 4 matières des 4 niveaux du collège
 * (6e, 5e, 4e, 3e — Mathématiques, Physique, Chimie, SVT) ont désormais
 * leur vrai contenu. PROGRAMME_PLACEHOLDER (texte générique "Programme
 * bientôt disponible") ne sert donc plus qu'en repli, si un futur niveau
 * ou une future matière est ajouté(e) avant que son contenu soit prêt.
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

/** RÉEL — fourni telle quelle par la personne à l'origine de cette tâche. */
const PROGRAMME_MATHS_5E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Configurations de l'espace",
      volumeHoraire: 8,
      chapitres: [
        {
          titre: "Prisme droit",
          description:
            "Observation et description du solide, vocabulaire. Reconnaître un prisme droit et ses cas particuliers (cube, pavé droit). Construire un patron et réaliser le solide. Calculer l'aire (somme des aires des polygones qui le composent) et le volume (aire de base × hauteur, S×h).",
        },
      ],
    },
    {
      titre: "Configurations du plan",
      volumeHoraire: 38,
      chapitres: [
        {
          titre: "Distance de deux points",
          description:
            "Distance de deux points, inégalité triangulaire (AC ≤ AB + BC). Caractérisation du segment : M ∈ [AB] si et seulement si AB = AM + MB. Médiatrice d'un segment : ensemble des points équidistants des extrémités, régionnement du plan.",
        },
        {
          titre: "Angles",
          description:
            "Angles opposés par le sommet (et leur égalité). Angles formés par deux droites parallèles et une sécante : alternes-internes, alternes-externes, correspondants, et leurs égalités.",
        },
        {
          titre: "Triangle",
          description:
            "Somme des angles d'un triangle (constatée par pliage, puis justifiée). Caractérisation de triangles particuliers à partir des axes de symétrie. Médiatrices et centre du cercle circonscrit ; construction du cercle circonscrit.",
        },
        {
          titre: "Cercle",
          description:
            "Cercle circonscrit à un triangle rectangle : un triangle rectangle est inscrit dans un demi-cercle de diamètre l'hypoténuse (et réciproque). Régionnement du plan par un cercle (intérieur, extérieur) ; position d'un point par rapport à un cercle.",
        },
        {
          titre: "Polygone",
          description:
            "Définition d'un polygone. Parallélogrammes particuliers (losange, rectangle, carré) : propriétés de longueurs, d'angles, axes et centre de symétrie, cercle circonscrit. Trapèze et trapèzes particuliers (rectangle, isocèle) ; construction, codage et aire d'un trapèze.",
        },
        {
          titre: "Polygone régulier",
          description:
            "Définition d'un polygone régulier. Construction d'un hexagone régulier (à partir d'un triangle équilatéral) et d'un octogone régulier (à partir d'un carré).",
        },
      ],
    },
    {
      titre: "Applications du plan",
      volumeHoraire: 8,
      chapitres: [
        {
          titre: "Figures symétriques par rapport à une droite ou un point",
          description:
            "Symétrique du milieu d'un segment, de droites perpendiculaires, de droites parallèles. Utiliser les propriétés de conservation (alignement, distance, mesures d'angles) pour déduire la conservation du milieu, du parallélisme et de la perpendicularité par une symétrie (axiale ou centrale).",
        },
      ],
    },
    {
      titre: "Outil vectoriel — Géométrie analytique",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Repérage d'un point dans un plan",
          description:
            "Vocabulaire : nœud d'un quadrillage, notion de couple. Une origine étant donnée, lire le couple de coordonnées d'un nœud et placer un point dont on connaît les coordonnées. Différence entre le couple (a, b) et la paire {a, b}.",
        },
      ],
    },
    {
      titre: "Organisation de calculs — Calculs numériques",
      volumeHoraire: 33,
      chapitres: [
        {
          titre: "Nombres premiers, PPCM et PGCD",
          description:
            "Division euclidienne (a = b×q + r, r < b). Nombres premiers : définition, reconnaissance (nombres jusqu'à 3 chiffres), décomposition en produit de facteurs premiers (naturels < 1000). Détermination du PGCD et du PPCM de deux entiers naturels.",
        },
        {
          titre: "Fraction",
          description:
            "Simplification (fraction irréductible) à l'aide du PGCD. Addition, soustraction et division de fractions (en utilisant PGCD et/ou PPCM). Comparaison à l'unité, comparaison de deux fractions, encadrement par deux décimaux consécutifs de même ordre.",
        },
        {
          titre: "Nombres décimaux relatifs",
          description:
            "Addition, soustraction, multiplication de deux décimaux relatifs. Comparaison de deux décimaux relatifs (comparer deux négatifs revient à comparer leurs opposés).",
        },
        {
          titre: "Puissances",
          description:
            "Puissance à exposant entier naturel non nul d'un décimal relatif. Calcul de aⁿ. Transformer des écritures du type (aⁿ)(aᵖ), (aⁿ)ᵖ, (a·b)ⁿ et (a/b)ⁿ dans des cas simples.",
        },
      ],
    },
    {
      titre: "Organisation de calculs — Calcul littéral",
      volumeHoraire: 17,
      chapitres: [
        {
          titre: "Initiation au calcul littéral",
          description:
            "Suppression des parenthèses dans des sommes et différences de relatifs : –(a+b) = (–a)+(–b), –(a–b) = b–a. Développement d'expressions du type a(x+y). Factorisation d'expressions du type ax+bx (repérer un facteur commun).",
        },
        {
          titre: "Notions d'équations et d'inéquations",
          description:
            "Équations du type a + x = b et ax = b dans 𝔻. Inéquations du type a + x < 0 et a + x > 0 : identifier des décimaux solutions. Exemples d'équations ayant des solutions dans 𝔻 mais pas dans ℤ.",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Proportionnalité",
          description:
            "Représentation graphique point par point d'un tableau de proportionnalité. Représenter et exploiter la représentation graphique d'un phénomène de proportionnalité (exemples : vitesse, débit, masse volumique).",
        },
        {
          titre: "Statistique",
          description:
            "Collecte et classification des données. Vocabulaire : population, individu, caractère, modalité, effectif, fréquence (en pourcentage), mode, série statistique. Calcul des effectifs et fréquences. Représentation par un diagramme en bâtons et interprétation.",
        },
      ],
    },
  ],
};

/** RÉEL — fourni telle quelle par la personne à l'origine de cette tâche. */
const PROGRAMME_PHYSIQUE_5E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Propriétés physiques de la matière",
      volumeHoraire: 13,
      chapitres: [
        {
          titre: "Méthodes de séparation des constituants d'un mélange",
          description:
            "Méthodes de séparation : décantation, filtration, distillation. Mélange homogène et mélange hétérogène. L'élève décante, filtre et distille une eau trouble, distingue les deux types de mélanges et connaît les propriétés physiques de l'eau pure (eau distillée).",
        },
        {
          titre: "Masse volumique — densité",
          description:
            "Définition de la masse volumique d'un solide, d'un liquide (eau) et d'un gaz (air). Détermination à l'aide d'une balance et d'une éprouvette graduée. Densité d'un corps par rapport à l'eau (solide, liquide) ou à l'air (gaz). Notations ρ (masse volumique) et d (densité).",
        },
        {
          titre: "Dilatation",
          description:
            "Définition de la dilatation. Dilatation des solides, des liquides et des gaz (cas de l'air). Réaliser et comparer ces dilatations (approche qualitative : tige et boule métalliques, thermomètre à liquide, ballon de baudruche).",
        },
      ],
    },
    {
      titre: "Électromagnétisme",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Aimants et électroaimant",
          description:
            "Pôles d'un aimant, interaction entre aimants. Description et utilisation de la boussole. Aimantation d'une aiguille, d'un clou. Électroaimant : une bobine traversée par un courant se comporte comme un aimant (déviation d'une aiguille aimantée).",
        },
      ],
    },
  ],
};

/** RÉEL — fourni telle quelle par la personne à l'origine de cette tâche. */
const PROGRAMME_CHIMIE_5E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Réactions chimiques",
      volumeHoraire: 5,
      chapitres: [
        {
          titre: "Réactions chimiques",
          description:
            "Combustion du magnésium, du fer, du cuivre et du soufre dans l'air. Notions de réactifs et de produits. Définition d'une réaction chimique et distinction avec une transformation physique. Écriture d'une équation de réaction avec les noms des réactifs et des produits (sans les formules). Sécurité lors des manipulations.",
        },
      ],
    },
  ],
};

/** RÉEL — fourni telle quelle par la personne à l'origine de cette tâche. */
const PROGRAMME_SVT_5E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Dégradation de l'environnement",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Désertification",
          description:
            "Distinguer sécheresse et désertification. Causes principales (surpâturage, sécheresse, surexploitation des terres, déboisement), conséquences (ensablement, régression des surfaces cultivables, exode rural, réduction de la biodiversité) et techniques de lutte (récupération des sols : zaï, cordons pierreux, haies vives ; conservation de l'eau). Aires protégées du Niger.",
        },
        {
          titre: "Les pollutions et leurs conséquences",
          description:
            "Différentes formes de pollution (air, eaux, sol). Causes naturelles et artificielles, conséquences à court, moyen et long terme (réchauffement climatique, disparition de la faune et flore aquatiques). Moyens de lutte : traitement des eaux usées et ordures, réglementation, usage rationnel des pesticides et engrais.",
        },
      ],
    },
    {
      titre: "Adaptations aux régimes alimentaires",
      volumeHoraire: 8,
      chapitres: [
        {
          titre: "Adaptation aux régimes alimentaires des vertébrés",
          description:
            "Régimes et comportements alimentaires. Adaptation des vertébrés (exemples : vache phytophage, chat zoophage). Comparaison de l'appareil digestif et de la denture de l'Homme, des herbivores et des carnivores.",
        },
        {
          titre: "Adaptation aux régimes alimentaires des invertébrés",
          description:
            "Régimes et comportements alimentaires des invertébrés (criquet, moustique, papillon, mouche). Identification et comparaison des pièces buccales ; relation entre le type de pièces buccales et l'état physique de l'aliment (solide ou liquide).",
        },
      ],
    },
    {
      titre: "Reproduction, croissance et développement chez les êtres vivants",
      volumeHoraire: 8,
      chapitres: [
        {
          titre: "Reproduction, croissance et développement chez les insectes",
          description:
            "Cycles de développement du criquet, de la mouche et du moustique. Différencier croissance et développement, développement direct et indirect, métamorphose et mue. Tracer et interpréter la courbe de croissance du criquet (métamorphose incomplète).",
        },
        {
          titre: "Puberté et modifications pubertaires chez l'Homme",
          description:
            "Définir puberté et adolescence. Transformations physiques, physiologiques et comportementales. Caractères sexuels secondaires, développement des organes reproducteurs. Rôle des hormones (hypophyse, testicules, ovaires) : notion d'hormone.",
        },
      ],
    },
    {
      titre: "Nutrition et reproduction des plantes sans fleurs",
      volumeHoraire: 14,
      chapitres: [
        {
          titre: "Classification et description des plantes sans fleurs",
          description:
            "Ptéridophytes (fougères), Bryophytes (mousses), Thallophytes (champignons, algues). Classer les plantes sans fleurs selon leur appareil végétatif ; décrire et schématiser un thalle, un mycélium, une fronde. Absence de chlorophylle chez les champignons (hétérotrophie).",
        },
        {
          titre: "Reproduction chez les plantes sans fleurs",
          description:
            "Reproduction sexuée et asexuée (multiplication végétative) chez la moisissure, la spirogyre et la fougère. Organes reproducteurs (sporange, spores, prothalle). Multiplication par les spores et dissémination. Réaliser des cultures de moisissures.",
        },
        {
          titre: "Modes de nutrition chez les plantes sans fleurs",
          description:
            "Mode de nutrition de la moisissure (hétérotrophie), étudié à partir de cultures réalisées en classe.",
        },
      ],
    },
    {
      titre: "Roches sédimentaires",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Étude de quelques roches sédimentaires",
          description:
            "Caractères généraux (disposition en strates, présence de fossiles), propriétés physiques et chimiques. Définir roche, roche sédimentaire, sédiment, minerai, minéral. Classification (détritiques, chimiques, biologiques). Réactions vis-à-vis de l'eau et de l'acide.",
        },
        {
          titre: "Importance et gestion des roches sédimentaires",
          description:
            "Importance des roches sédimentaires : matériaux de construction (argile, calcaire, sable), ressources énergétiques (pétrole, charbon), minerais (or, cuivre, fer, uranium), sels. Notion de sédiment et de dépôt. Exploitation rationnelle des gisements.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/maths_4e_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_MATHS_4E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Configurations de l'espace",
      volumeHoraire: 16,
      chapitres: [
        {
          titre: "La sphère",
          description:
            "Observation et description du solide, vocabulaire lié à la sphère et à la boule. Analogie sphère/cercle et boule/disque (la boule est l'intérieur de la sphère). Calcul de l'aire d'une sphère et du volume d'une boule.",
        },
        {
          titre: "Plans et droites de l'espace",
          description:
            "Positions relatives de deux droites dans l'espace, d'une droite et d'un plan, de deux plans (parallèles, perpendiculaires), en s'appuyant sur les solides connus (arêtes et faces).",
        },
        {
          titre: "Perspective cavalière",
          description:
            "Règles élémentaires de la perspective cavalière. Propriétés conservées ou non (parallélisme, perpendicularité), arêtes cachées, inclinaison. Lire une configuration de l'espace et dessiner un cube ou un pavé droit en perspective.",
        },
      ],
    },
    {
      titre: "Configurations du plan",
      volumeHoraire: 25,
      chapitres: [
        {
          titre: "Distance d'un point à une droite",
          description:
            "Définir la distance d'un point à une droite (perpendiculaire passant par ce point). Construire une droite à une distance donnée d'un point, et un point à une distance donnée d'une droite.",
        },
        {
          titre: "Distance de deux droites",
          description:
            "Définir la distance de deux droites. Construire une droite à une distance donnée d'une droite donnée.",
        },
        {
          titre: "Caractérisation de la bissectrice d'un angle",
          description:
            "La bissectrice comme axe de symétrie de l'angle et comme ensemble des points équidistants des côtés. Utiliser ces propriétés pour justifier l'appartenance d'un point à la bissectrice ou une égalité de distances.",
        },
        {
          titre: "Triangle",
          description:
            "Droite des milieux (propriétés directe et réciproque). Droites particulières : médianes et centre de gravité, médiatrices et cercle circonscrit, hauteurs et orthocentre, bissectrices et cercle inscrit. Théorème de Pythagore (direct et réciproque) et relation métrique déduite de l'aire.",
        },
        {
          titre: "Cercle",
          description:
            "Positions relatives d'une droite et d'un cercle : sécante, extérieure, tangente. Construire une tangente à un cercle passant par un point du cercle ou extérieur, en lien avec la distance d'un point à une droite.",
        },
      ],
    },
    {
      titre: "Applications du plan",
      volumeHoraire: 19,
      chapitres: [
        {
          titre: "Symétrie orthogonale et symétrie centrale",
          description:
            "Notion d'application du plan. Définition des symétries orthogonale et centrale et leurs propriétés (invariance de l'axe ou du centre, symétrie égale à sa réciproque, image d'une droite). Reconnaître un axe ou un centre de symétrie d'une partie de figure.",
        },
        {
          titre: "Translation",
          description:
            "Définition d'une translation et propriétés (conservation de l'alignement, des distances, des mesures angulaires ; image d'une droite). Construire l'image d'un point ou d'une figure à l'aide des propriétés du parallélogramme.",
        },
      ],
    },
    {
      titre: "Outil vectoriel — Géométrie analytique",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Vecteur",
          description:
            "Notion de vecteur (direction, sens, longueur), égalité de vecteurs, représentant d'origine donnée. Addition de vecteurs : somme, relation de Chasles, vecteur nul, opposé. Caractérisation vectorielle du milieu d'un segment. Lien entre translation et vecteur.",
        },
        {
          titre: "Repérage",
          description:
            "Repère orthogonal et orthonormal. Couple de coordonnées d'un point (abscisse, ordonnée). Situer un point, trouver ses coordonnées, calculer les coordonnées du milieu d'un segment et d'un vecteur.",
        },
      ],
    },
    {
      titre: "Organisation de calculs — Calculs numériques",
      volumeHoraire: 28,
      chapitres: [
        {
          titre: "PGCD - PPCM",
          description:
            "Algorithme d'Euclide pour déterminer le PGCD de deux nombres. Utilisation du PGCD et du PPCM dans la résolution de problèmes (pavages, plantation d'arbres...).",
        },
        {
          titre: "Nombres décimaux (écriture a·10ⁿ)",
          description:
            "Calcul de 10^p (p entier relatif), relations 10^(–p) = 1/10^p. Écriture d'un décimal sous la forme a·10^p et notation scientifique. Ordre de grandeur, calculs, préfixes (kilo, milli, méga, micro...) et puissances de 10.",
        },
        {
          titre: "Nombres rationnels",
          description:
            "Ensemble ℚ des nombres rationnels. Simplification (forme irréductible), comparaison, opérations (opposé, inverse d'un rationnel non nul, quotient). Reconnaître un rationnel non décimal. Encadrement et approximation décimale d'un rationnel positif.",
        },
        {
          titre: "Puissances",
          description:
            "Puissances à exposant entier relatif d'un rationnel non nul. Transformer des écritures du type (aⁿ)(aᵖ), (aⁿ)ᵖ, (a·b)ⁿ, (a/b)ⁿ où a et b sont rationnels non nuls et n, p entiers relatifs.",
        },
      ],
    },
    {
      titre: "Organisation de calculs — Calcul littéral",
      volumeHoraire: 21,
      chapitres: [
        {
          titre: "Calcul sur les expressions algébriques",
          description:
            "Développement, réduction, factorisation. Produits remarquables : (a+b)², (a–b)², (a+b)(a–b). Calculer la valeur d'une expression, utiliser identités remarquables et distributivité pour développer ou factoriser, choisir la forme adaptée à un calcul rapide.",
        },
        {
          titre: "Équations, inéquations",
          description:
            "Équations se ramenant à ax + b = 0 dans ℚ. Inéquations du premier degré à une inconnue (ax + b ≥ 0, ax + b ≤ 0). Réinvestissement dans la résolution de problèmes de la vie quotidienne.",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 6,
      chapitres: [
        {
          titre: "Statistiques",
          description:
            "Moyenne et étendue d'une série statistique. Diagrammes à bandes et circulaires : représentation et interprétation. Utilisation de la calculatrice scientifique pour le calcul de la moyenne.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/physique_4e_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_PHYSIQUE_4E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Mécanique",
      volumeHoraire: 25,
      chapitres: [
        {
          titre: "La force et sa nature vectorielle",
          description:
            "Définition de la force à partir de ses effets (déformer, mettre en mouvement ou modifier le mouvement). Forces de contact et à distance. Caractéristiques d'une force (vecteur-force), représentation par un vecteur. Mesure de l'intensité au dynamomètre ; unité : le newton (N).",
        },
        {
          titre: "Interactions",
          description:
            "Interactions de contact et à distance. Simultanéité de l'action et de la réaction. Principe des interactions et sa généralité. Exemples : solide suspendu à un fil, bille sur un plan, interaction gravitationnelle. Tracer les vecteurs-force action/réaction.",
        },
        {
          titre: "Étude de la force poids",
          description:
            "Définition et caractéristiques du poids (force d'attraction de la Terre, force à distance). Mesure de l'intensité au dynamomètre. Détermination du centre de gravité. Représentation du vecteur-poids. Variation du poids avec le lieu.",
        },
        {
          titre: "Masse d'un corps",
          description:
            "Distinction poids/masse. Invariance de la masse avec le lieu. Proportionnalité entre poids et masse : relation P = m·g (g ≈ 10 N/kg à la surface de la Terre). Mesure d'une masse par double pesée (balance Roberval).",
        },
      ],
    },
    {
      titre: "Température et chaleur",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Thermomètre",
          description:
            "Principe du thermomètre à liquide, thermomètre de laboratoire, autres types. Étalonnage selon l'échelle Celsius. Autres grandeurs variables avec la température (résistance, couleur).",
        },
        {
          titre: "Chaleur",
          description:
            "Échanges de chaleur (conduction, convection, rayonnement). Relation Q = m·c·(tf − ti). Unité : le joule (J). Chaleur massique et capacité thermique. Calorimètre et méthode des mélanges. Pouvoir calorifique d'un combustible.",
        },
      ],
    },
    {
      titre: "Électricité",
      volumeHoraire: 16,
      chapitres: [
        {
          titre: "Électrostatique",
          description:
            "Électrisation par frottement et par contact. Forces électrostatiques, deux types de charges (positive/négative). Unité : le coulomb (C). Interprétation électronique (excès ou défaut d'électrons), charge élémentaire. Décharges électriques.",
        },
        {
          titre: "Électrocinétique",
          description:
            "Courant électrique et ses trois effets, sens conventionnel. Intensité du courant (débit de charges), ampèremètre, unité : l'ampère (A). Loi d'additivité des intensités. Expressions I = n·e/t et I = Q/t.",
        },
        {
          titre: "Tension électrique",
          description:
            "Mise en évidence et mesure d'une tension au voltmètre. Unité : le volt (V). Tension aux bornes d'une dérivation. Additivité des tensions le long d'un circuit. Compatibilité des appareils. Intérêt des montages série et dérivation.",
        },
      ],
    },
    {
      titre: "Optique",
      volumeHoraire: 9,
      chapitres: [
        {
          titre: "Propagation rectiligne de la lumière",
          description:
            "Sources primaires et secondaires, diffusion, récepteurs (œil, pellicule, photopile). Corps opaques, transparents, translucides. Propagation rectiligne de la lumière ; modélisation par le rayon lumineux.",
        },
        {
          titre: "Ombre et pénombre",
          description: "Ombre et pénombre. Phases de la Lune, éclipse de Soleil, éclipse de Lune. Chambre noire.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/chimie_4e_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_CHIMIE_4E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Solutions aqueuses",
      volumeHoraire: 3,
      chapitres: [
        {
          titre: "Dissolution des corps purs",
          description:
            "Réalisation d'une dissolution. Notions de solution, solvant, soluté. Concentration (unité g/L) et saturation. Distinction dissolution / fusion. Étude comparative de la dissolution dans l'eau (sucre, sel, chaux) ; effet de l'agitation.",
        },
      ],
    },
    {
      titre: "Structure de la matière",
      volumeHoraire: 18,
      chapitres: [
        {
          titre: "Molécules et atomes",
          description:
            "Structure moléculaire du corps pur. Molécule comme assemblage d'atomes. Corps pur simple et corps pur composé. Structure de l'atome : noyau et cortège électronique, électroneutralité. Ordre de grandeur du rayon atomique. Modèles moléculaires.",
        },
        {
          titre: "Notation chimique",
          description:
            "Symboles des atomes et formules des molécules. La mole et le nombre d'Avogadro (N = 6,023×10²³ mol⁻¹). Masse molaire et volume molaire (22,4 L/mol dans les conditions normales). Tableau des masses atomiques et tableau périodique.",
        },
        {
          titre: "Réaction chimique",
          description:
            "Réactifs et produits (étude expérimentale). Équation-bilan : représentation symbolique et signification, équilibrage. Bilan à l'échelle de l'atome et de la mole. Utilisation de l'équation-bilan pour des calculs de quantités de matière, masses et volumes.",
        },
        {
          titre: "Notion d'ion",
          description:
            "Définition d'un ion, ion monoatomique et polyatomique (exemples). Cations et anions. Distinction molécules/ions. Charge électrique d'un ion et d'une mole d'ions (introduite à partir d'étiquettes d'eau minérale).",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/svt_4e_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_SVT_4E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Environnement : gestion durable des ressources naturelles",
      volumeHoraire: 8,
      chapitres: [
        {
          titre: "La gestion de la faune et de la flore",
          description:
            "Aires protégées du Niger (parcs, réserves, forêts classées, créées dès 1940). Espèces animales et végétales protégées. Moyens de protection de la faune et de la flore ; causes de leur disparition. Rôle de l'éducation et de la sensibilisation.",
        },
        {
          titre: "Gestion des eaux",
          description:
            "Nappes libres et captives. Exploitation des eaux souterraines (sources, puits, forages). Cycle de l'eau, cours d'eau du Niger. Notions d'aquifère, source, pollution, eau potable. Traitement de l'eau, protection des puits et forages, gestion rationnelle.",
        },
      ],
    },
    {
      titre: "Alimentation chez l'Homme",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "La digestion des aliments",
          description:
            "Aliments simples et composés, rôles des aliments. Appareil digestif et coupe de dent, formule dentaire. Étapes de la digestion : transformations mécaniques et chimiques (enzymes, sucs digestifs). Digestion in vitro de l'amidon. Aboutissement aux nutriments.",
        },
        {
          titre: "Absorption intestinale et assimilation",
          description:
            "Paroi intestinale et villosité. Passage des nutriments dans le sang et la lymphe. Distribution aux cellules et assimilation. Rôle énergétique (glucose, acides gras) et plastique (acides aminés). Stockage sous forme de glycogène (foie, muscle).",
        },
      ],
    },
    {
      titre: "Reproduction chez l'Homme",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Les appareils génitaux et leurs rôles",
          description:
            "Organisation des appareils génitaux masculin et féminin. Rôles : production des hormones et des gamètes. Schémas des gamètes (spermatozoïde, ovule). Organes externes et internes.",
        },
        {
          titre: "Cycles menstruels",
          description: "Cycles utérin et ovarien et la relation entre les deux.",
        },
      ],
    },
    {
      titre: "Les agressions contre l'Homme",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Quelques agresseurs de l'Homme et maladies",
          description:
            "Diversité des micro-organismes. Groupes de microbes. Maladies : paludisme, méningite cérébro-spinale, bilharziose, amibiase. Symptômes, agent causal, modes de propagation et de prévention. Cycle de développement des agents causals.",
        },
        {
          titre: "Quelques IST fréquentes au Niger",
          description:
            "IST avec écoulements (gonococcie, chlamydiase, candidoses), avec ulcérations (chancre mou, syphilis), végétations, parasites. Symptômes, modes de contamination et de prévention. Relation IST/SIDA ; définition du VIH ; conduite à tenir.",
        },
      ],
    },
    {
      titre: "Sols",
      volumeHoraire: 6,
      chapitres: [
        {
          titre: "Étude du sol",
          description:
            "Profil pédologique de type A-B-C (horizons). Constituants d'un sol (organiques, minéraux, gaz, solution du sol). Propriétés physiques et chimiques : texture, porosité, perméabilité, capacité de rétention en eau. Facteurs de formation : roche mère, êtres vivants, climat.",
        },
        {
          titre: "Formation et évolution d'un sol",
          description:
            "Altération de la roche mère (désagrégation, altération chimique). Migration des éléments (lessivage). Humification et minéralisation de la matière organique. Différenciation des horizons. Caractéristiques d'un sol fertile ; types de sols au Niger.",
        },
      ],
    },
    {
      titre: "Formation des roches magmatiques et métamorphiques",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Le volcanisme",
          description:
            "Éruptions volcaniques de type effusif et explosif. Produits du volcanisme (solides, liquides, gazeux). Structure d'un volcan. Répartition des volcans à la surface du globe. Notions de volcan, volcanisme, magma, magmatisme.",
        },
        {
          titre: "La formation des roches magmatiques",
          description:
            "Formation des magmas. Roches volcaniques et plutoniques : formation et structure. Identification et classification simple des roches magmatiques (observation du basalte et du granite à l'œil nu et à la loupe).",
        },
        {
          titre: "Formation des roches métamorphiques",
          description:
            "Le métamorphisme et ses facteurs. Types de métamorphisme et leur localisation. Processus de formation et structure des roches métamorphiques ; caractères communs.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/maths_3e_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_MATHS_3E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Configurations de l'espace",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Pyramide",
          description:
            "Observation, description et vocabulaire. Pyramide régulière : représentation en perspective cavalière, patron, réalisation. Calcul de l'aire et du volume (V = S·h/3).",
        },
        {
          titre: "Cône de révolution",
          description:
            "Observation, description et vocabulaire. Représentation en perspective cavalière, patron, réalisation. Calcul de l'aire et du volume (la formule V = S·h/3 s'applique au cône comme à la pyramide).",
        },
      ],
    },
    {
      titre: "Configurations du plan",
      volumeHoraire: 24,
      chapitres: [
        {
          titre: "Angle inscrit dans un cercle",
          description:
            "Définition et vocabulaire. Propriétés : relation entre angle inscrit et angle au centre associés ; angle inscrit et arc intercepté. Comparer deux angles interceptant le même arc.",
        },
        {
          titre: "Application de la propriété de Pythagore",
          description:
            "Utiliser le théorème de Pythagore pour calculer une distance (hypoténuse, côté d'un triangle, diagonale d'un carré) et résoudre des problèmes de construction de triangles.",
        },
        {
          titre: "Trigonométrie",
          description:
            "Rapports trigonométriques d'un angle aigu (sinus, cosinus, tangente) dans le triangle rectangle. Relation sin²a + cos²a = 1. Lecture de table et calculatrice. Valeurs remarquables pour 0°, 30°, 45°, 60°, 90°.",
        },
        {
          titre: "Polygone régulier",
          description:
            "Triangle équilatéral et hexagone, carré et octogone, pentagone. Construction inscrite dans un cercle, symétries laissant le polygone invariant, aire. Somme des angles d'un polygone à n côtés : 180°(n−2).",
        },
        {
          titre: "Propriété de Thalès",
          description:
            "Théorème direct et réciproque (à partir du triangle). Reconnaître une configuration de Thalès, démontrer le parallélisme de droites, résoudre des problèmes (partage de segments). Triangles semblables : proportionnalité des côtés, égalité des angles.",
        },
      ],
    },
    {
      titre: "Applications du plan",
      volumeHoraire: 9,
      chapitres: [
        {
          titre: "Symétrie orthogonale",
          description:
            "Image de figures simples par la composée de deux symétries orthogonales d'axes parallèles (translation) ou perpendiculaires (symétrie centrale). Invariance du point d'intersection des axes, conservation des distances.",
        },
        {
          titre: "Symétrie centrale",
          description:
            "Image de figures simples par la composée de deux symétries centrales. Reconnaître la composée de deux symétries centrales.",
        },
        {
          titre: "Translation",
          description:
            "Propriétés de conservation (milieu, orthogonalité, parallélisme). Composée de deux translations (qui est une translation). Construire l'image de figures simples par la composée de deux translations.",
        },
      ],
    },
    {
      titre: "Outil vectoriel — Géométrie analytique",
      volumeHoraire: 18,
      chapitres: [
        {
          titre: "Multiplication d'un vecteur par un réel",
          description:
            "Produit d'un vecteur par un réel : définition et propriétés. Construire k·AB. Vecteurs colinéaires : définition, vecteur directeur d'une droite. Prouver l'alignement de 3 points ou le parallélisme de 2 droites.",
        },
        {
          titre: "Coordonnées d'un vecteur",
          description:
            "Coordonnées d'une somme, d'un produit par un réel. Égalité et condition de colinéarité de deux vecteurs. Dans un repère orthonormal : produit scalaire, condition d'orthogonalité, norme d'un vecteur, distance de deux points.",
        },
        {
          titre: "Équations de droite",
          description:
            "Coordonnées d'un vecteur directeur. Coefficient directeur ; conditions de parallélisme et d'orthogonalité de deux droites. Trouver l'équation cartésienne d'une droite, déterminer le point d'intersection de deux droites, tracer une droite.",
        },
      ],
    },
    {
      titre: "Organisation des calculs — Calculs numériques",
      volumeHoraire: 15,
      chapitres: [
        {
          titre: "Nombres réels",
          description:
            "Ensemble ℝ des nombres réels et opérations. Radicaux : définition, propriétés, comparaison, opérations ; rendre rationnel un dénominateur. Puissances à exposant entier relatif. Intervalles de ℝ, ordre et opérations, encadrements. Tables numériques et calculatrice.",
        },
      ],
    },
    {
      titre: "Organisation des calculs — Calcul littéral",
      volumeHoraire: 20,
      chapitres: [
        {
          titre: "Monômes et polynômes",
          description:
            "Monôme : degré, coefficient, partie littérale, monômes semblables, addition et multiplication. Polynôme : degré, addition, multiplication. Développer et factoriser à l'aide des identités remarquables et de la distributivité.",
        },
        {
          titre: "Équations, inéquations et systèmes",
          description:
            "Équations et inéquations du 1er degré à une inconnue dans ℝ (produit nul, intervalles). Systèmes de deux équations du 1er degré dans ℝ² (substitution, combinaison, résolution graphique). Mise en équation et résolution de problèmes.",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 19,
      chapitres: [
        {
          titre: "Fonction — Application — Bijection",
          description:
            "Reconnaître quand une fonction est une application, une bijection. Ensemble de définition. Image d'un élément. Fonctions définies par formule, courbe, tableau, diagramme sagittal.",
        },
        {
          titre: "Applications linéaires",
          description:
            "Définition et propriétés de linéarité. Sens de variation (signe de a). Représentation graphique et coefficient directeur. Lien avec les situations de proportionnalité (vitesse, débit).",
        },
        {
          titre: "Applications affines",
          description:
            "Définition, sens de variation (f(x) = ax + b). Lien entre les représentations graphiques d'une application affine et de son application linéaire associée. Représentation graphique et coefficient directeur.",
        },
        {
          titre: "Statistique",
          description:
            "Regroupement en classes d'égale amplitude, effectifs des classes. Diagramme à bandes. Moyenne et étendue d'une série statistique dans le cas d'un caractère continu.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/physique_3e_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_PHYSIQUE_3E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Mécanique",
      volumeHoraire: 35,
      chapitres: [
        {
          titre: "Équilibre d'un solide soumis à deux forces",
          description:
            "Étude expérimentale de l'équilibre sous deux forces opposées, condition d'équilibre. Exemples : solide suspendu à un fil, à un ressort, bille sur un plan. Courbe d'étalonnage et constante de raideur d'un ressort (unité N/m).",
        },
        {
          titre: "Équilibre d'un solide mobile autour d'un axe",
          description:
            "Équilibre sous l'action de deux forces orthogonales à l'axe. Théorème des moments et son application aux poulies, leviers, treuils et à la balance. Vérification expérimentale ; équilibrage d'un solide en rotation.",
        },
        {
          titre: "Travail d'une force dans un déplacement rectiligne",
          description:
            "Expression du travail d'une force constante. Unité : le joule (J). Travail moteur et travail résistant. Cas d'une force orthogonale au déplacement. Travail du poids d'un corps.",
        },
        {
          titre: "Notion de puissance mécanique",
          description:
            "Définition de la puissance mécanique (P = W/t). Unité : le watt (W). Ordres de grandeur de quelques puissances (le cheval-vapeur est cité mais non utilisé).",
        },
        {
          titre: "Machines simples",
          description:
            "Poulies, leviers, plan incliné. Conservation du travail dans une machine simple idéale. Rendement d'une machine réelle et généralisation de la notion de rendement mécanique.",
        },
        {
          titre: "Énergie",
          description:
            "Formes d'énergie (mécanique, thermique, électrique, chimique, rayonnante, atomique). Transferts d'énergie (chaleur, travail, rayonnement). Transformation travail ↔ chaleur. Fonctionnement schématique du moteur à quatre temps.",
        },
        {
          titre: "Poussée d'Archimède",
          description:
            "Étude expérimentale et théorème d'Archimède. La poussée comme résultante des forces de pression du fluide, égale au poids du liquide déplacé (P = ρ·g·V). Calcul pour un objet simple complètement immergé.",
        },
        {
          titre: "Pression atmosphérique",
          description:
            "Atmosphère terrestre. Existence et mesure de la pression atmosphérique (baromètre). Variation de la pression atmosphérique.",
        },
      ],
    },
    {
      titre: "Électricité",
      volumeHoraire: 20,
      chapitres: [
        {
          titre: "Conducteurs ohmiques à caractéristique linéaire",
          description:
            "Tracé de la caractéristique U = f(I). Définition du conducteur ohmique et de sa résistance. Loi d'Ohm (U = R·I), unité l'ohm (Ω). Code des couleurs. Conductance (siemens). Associations en série, parallèle et mixte ; résistance équivalente.",
        },
      ],
    },
    {
      titre: "Optique",
      volumeHoraire: 6,
      chapitres: [
        {
          titre: "Réflexion de la lumière",
          description:
            "Réflexion sur un miroir plan, lois de la réflexion (i = r). Image donnée par un miroir plan (image virtuelle, symétrique de l'objet) ; expérience des deux bougies. Construction de l'image d'un objet.",
        },
        {
          titre: "Réfraction de la lumière",
          description:
            "Réfraction d'un faisceau à la traversée d'un dioptre plan (air-eau). Observation de l'image d'un objet à travers un dioptre (expérience du bâton brisé).",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/chimie_3e_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_CHIMIE_3E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Chimie générale et minérale",
      volumeHoraire: 14,
      chapitres: [
        {
          titre: "Eau",
          description:
            "Formule et modèle angulaire de la molécule d'eau. Conservation de la molécule dans les solutions aqueuses et les différents états. Électrolyse et synthèse de l'eau (équations-bilan), réalisées avec un courant continu.",
        },
        {
          titre: "Solutions aqueuses ioniques",
          description:
            "Solutions acides, basiques et neutres (bleu de bromothymol, puis pH). Concentration molaire (mol/L). Ions H⁺ et OH⁻, dissociation ionique de l'eau. Échelle de pH, effet de la dilution, neutralisation (équation-bilan). Papier pH.",
        },
        {
          titre: "Caractérisation de quelques ions",
          description:
            "Caractérisation d'anions (Cl⁻, SO₄²⁻, CO₃²⁻) et de cations (Fe²⁺, Fe³⁺, Cu²⁺, Zn²⁺, Na⁺) par des réactions test. Équations-bilan. Neutralité électrique d'une solution ionique (anions et cations).",
        },
        {
          titre: "Oxydoréduction",
          description:
            "Définitions : oxydation, réduction, oxydoréduction, oxydant, réducteur. Réactions en solution aqueuse et par voie sèche, échanges électroniques. Oxydoréduction dans l'électrolyse (pile Daniell). Corrosion et moyens de protection.",
        },
      ],
    },
    {
      titre: "Chimie organique",
      volumeHoraire: 6,
      chapitres: [
        {
          titre: "Généralités",
          description:
            "Définition, importance et domaines de la chimie organique. Hydrocarbures et leurs familles : alcanes (méthane, éthane, propane, butane), alcènes (éthylène), alcynes (acétylène). Sources d'hydrocarbures. Formules brute, développée et semi-développée ; liaison saturée et insaturée.",
        },
        {
          titre: "Réactions chimiques",
          description:
            "Exemples de réactions simples : combustion du butane et de l'acétylène, substitution du dichlore sur le méthane, addition du dihydrogène et de l'eau sur l'éthylène. Écriture des équations-bilan.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/svt_3e_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_SVT_3E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Milieu intérieur",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Le sang et la lymphe",
          description:
            "Constituants du sang, leurs propriétés et rôles. Plasma et sérum. Frottis sanguin. Sédimentation et coagulation du sang. La lymphe : composition, formation et rôle ; lien entre circulation lymphatique et sanguine.",
        },
        {
          titre: "Transfusion sanguine et maladies du sang",
          description:
            "Groupes sanguins (système ABO et système rhésus). Possibilités et compatibilités de transfusion. Incompatibilité rhésus chez la femme enceinte. Maladies : anémie, drépanocytose, leucémie.",
        },
      ],
    },
    {
      titre: "Nutrition chez l'Homme",
      volumeHoraire: 16,
      chapitres: [
        {
          titre: "Besoins nutritionnels chez l'Homme",
          description:
            "Besoins en énergie et en matières. Ration alimentaire équilibrée selon l'âge, le sexe, l'activité. Valeur énergétique d'un repas. Conséquences d'une mauvaise alimentation : carence, malnutrition, sous-alimentation, suralimentation. Hygiène alimentaire.",
        },
        {
          titre: "La respiration et les échanges gazeux",
          description:
            "Appareil respiratoire, renouvellement de l'air dans les poumons (air inspiré/expiré). Transport des gaz respiratoires par le sang. Vésicule pulmonaire et échanges gazeux. Variation du rythme respiratoire à l'effort.",
        },
        {
          titre: "La circulation sanguine",
          description:
            "Pompe cardiaque : description, organisation, contraction. Circuits sanguins (circulation générale et pulmonaire), fonctionnement des vaisseaux. Rythme cardiaque et activité physique. Pression artérielle et maladies cardiovasculaires.",
        },
        {
          titre: "Le rôle du rein dans l'excrétion urinaire",
          description:
            "Appareil urinaire, constituants de l'urine, production par les tubes urinifères. Rôle épurateur du rein et régulation du milieu intérieur (homéostasie). Élimination de la sueur par la peau. Insuffisances rénales et dialyse.",
        },
      ],
    },
    {
      titre: "Fonction de relation",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Le fonctionnement du système nerveux",
          description:
            "Organisation du système nerveux et du neurone. Activité réflexe et volontaire, arc réflexe, trajet de l'influx nerveux. La synapse et son rôle. Hygiène du système nerveux : action nocive de l'alcool, des drogues et du tabac.",
        },
      ],
    },
    {
      titre: "Régulation des naissances",
      volumeHoraire: 6,
      chapitres: [
        {
          titre: "Régulation des naissances",
          description:
            "Définir la contraception. Méthodes naturelles, mécaniques et chimiques (pilules) et leurs modes d'action.",
        },
      ],
    },
    {
      titre: "Immunité et VIH/SIDA",
      volumeHoraire: 13,
      chapitres: [
        {
          titre: "Défenses en cas d'infection microbienne",
          description:
            "Voies de contamination et barrières naturelles (cas d'une plaie, du tétanos). Asepsie, antisepsie, lavage des mains. Réactions non spécifiques (inflammation, phagocytose) et spécifiques (anticorps, lymphocytes T, mémoire immunitaire).",
        },
        {
          titre: "Renforcement des défenses naturelles",
          description:
            "Vaccination (immunité active et durable, histoire de Jenner et Pasteur, vaccins obligatoires au Niger). Sérothérapie (immunité passive, sérum antitétanique). Antibiothérapie, antibiogramme, risques d'un usage abusif.",
        },
        {
          titre: "VIH/SIDA",
          description:
            "Le VIH provoque une immunodéficience en détruisant les lymphocytes T4. Phases de l'infection, séropositivité, distinction séropositif/SIDA. Nécessité et moyens de prévention.",
        },
      ],
    },
    {
      titre: "Environnement — Gestion des ressources non renouvelables",
      volumeHoraire: 13,
      chapitres: [
        {
          titre: "Impact de l'exploitation des ressources géologiques non renouvelables",
          description:
            "Ressources non renouvelables du Niger (uranium, charbon, pétrole). Énergies fossiles. Effet de serre, réchauffement et changement climatique. Gestion durable des ressources non renouvelables.",
        },
      ],
    },
    {
      titre: "Séismes",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Les séismes",
          description:
            "Manifestations des tremblements de terre, origine et caractéristiques. Distinction magnitude/intensité. Localisation des séismes dans le monde. Méthodes d'étude (sismographe) et de prévention.",
        },
      ],
    },
  ],
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
    mathematiques: PROGRAMME_MATHS_5E,
    physique: PROGRAMME_PHYSIQUE_5E,
    chimie: PROGRAMME_CHIMIE_5E,
    svt: PROGRAMME_SVT_5E,
  },
  "4e": {
    mathematiques: PROGRAMME_MATHS_4E,
    physique: PROGRAMME_PHYSIQUE_4E,
    chimie: PROGRAMME_CHIMIE_4E,
    svt: PROGRAMME_SVT_4E,
  },
  "3e": {
    mathematiques: PROGRAMME_MATHS_3E,
    physique: PROGRAMME_PHYSIQUE_3E,
    chimie: PROGRAMME_CHIMIE_3E,
    svt: PROGRAMME_SVT_3E,
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
