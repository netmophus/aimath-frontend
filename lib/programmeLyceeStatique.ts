/**
 * Données STATIQUES du programme du lycée — miroir de
 * lib/programmeCollegeStatique.ts, avec un niveau de navigation
 * supplémentaire (la SÉRIE) : niveau → série → matière → thèmes/chapitres.
 *
 * CE QUI EST RÉEL vs PLACEHOLDER : Seconde × Série C (Mathématiques,
 * Physique, Chimie, SVT) est désormais RÉEL. Tout le reste (Seconde A,
 * Première et Terminale toutes séries) est encore PROGRAMME_PLACEHOLDER —
 * le vrai contenu sera intégré dans un second temps, niveau par
 * niveau/série par série, comme cela a été fait pour le collège.
 *
 * Séries par niveau (programme nigérien réel, à respecter strictement) :
 * Seconde → A, C uniquement (PAS de D) ; Première et Terminale → A, C, D.
 * Aucune série E ni G.
 */

export type NiveauLyceeId = "seconde" | "premiere" | "terminale";
export type SerieLyceeId = "a" | "c" | "d";
export type MatiereLyceeId = "mathematiques" | "physique" | "chimie" | "svt";

export interface NiveauLycee {
  id: NiveauLyceeId;
  nom: string;
}

export interface SerieLycee {
  id: SerieLyceeId;
  nom: string;
}

export interface MatiereLycee {
  id: MatiereLyceeId;
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
  /** false = contenu réel ; true = placeholder générique en attendant les
   * vraies données (le cas de toutes les combinaisons niveau/série/matière
   * du lycée pour l'instant). */
  estPlaceholder: boolean;
  themes: readonly ThemeStatique[];
}

export const NIVEAUX_LYCEE: readonly NiveauLycee[] = [
  { id: "seconde", nom: "Seconde" },
  { id: "premiere", nom: "Première" },
  { id: "terminale", nom: "Terminale" },
];

/** Séries disponibles PAR NIVEAU — pas une liste plate : la Seconde n'a que
 * A et C, contrairement à Première/Terminale qui ont aussi D. */
export const SERIES_PAR_NIVEAU: Record<NiveauLyceeId, readonly SerieLycee[]> = {
  seconde: [
    { id: "a", nom: "A" },
    { id: "c", nom: "C" },
  ],
  premiere: [
    { id: "a", nom: "A" },
    { id: "c", nom: "C" },
    { id: "d", nom: "D" },
  ],
  terminale: [
    { id: "a", nom: "A" },
    { id: "c", nom: "C" },
    { id: "d", nom: "D" },
  ],
};

export const MATIERES_LYCEE: readonly MatiereLycee[] = [
  { id: "mathematiques", nom: "Mathématiques" },
  { id: "physique", nom: "Physique" },
  { id: "chimie", nom: "Chimie" },
  { id: "svt", nom: "SVT" },
];

/** RÉEL — repris de lib/maths_2ndeC_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_MATHS_2NDE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Géométrie dans l'espace",
      volumeHoraire: 15,
      chapitres: [
        {
          titre: "Positions de droites et plans de l'espace",
          description:
            "Positions relatives de deux droites, d'une droite et d'un plan, de deux plans (parallèles, perpendiculaires, sécants). Génération d'un plan. Propriétés conservées ou non en perspective cavalière. Vision intuitive de l'espace et représentations planes.",
        },
        {
          titre: "Section d'un solide par un plan",
          description:
            "Section d'un cube, d'une pyramide, d'un tétraèdre, d'un cône par un plan. Tronc de cône et de pyramide. Calculs d'aires et de volumes. Utilisation des propriétés d'incidence et de parallélisme pour des problèmes de construction.",
        },
      ],
    },
    {
      titre: "Outil vectoriel — Géométrie analytique",
      volumeHoraire: 25,
      chapitres: [
        {
          titre: "Vecteurs du plan",
          description:
            "Combinaisons linéaires : écrire un vecteur comme combinaison de deux vecteurs, décomposition selon deux directions. Barycentre de 2, 3, 4 points : définition, barycentres partiels, constructions (Thalès, parallélogramme, parallèles), coordonnées dans un repère.",
        },
        {
          titre: "Produit scalaire",
          description:
            "Définition et propriétés (symétrie, bilinéarité, carré scalaire), expression analytique en repère orthonormé. Applications : relations métriques dans un triangle, théorème d'Al-Kashi, théorème de la médiane. Équations normale d'une droite, cartésienne d'un cercle et de sa tangente.",
        },
      ],
    },
    {
      titre: "Configurations du plan",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Angles orientés — Trigonométrie",
          description:
            "Cercle orienté et cercle trigonométrique, arcs orientés. Angle orienté de deux demi-droites de même origine, angle orienté de deux vecteurs, mesure principale. Lignes trigonométriques d'un angle orienté et des angles associés (opposés, complémentaires, supplémentaires).",
        },
      ],
    },
    {
      titre: "Applications du plan",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Transformations du plan",
          description:
            "Homothétie : définition, propriétés, images de figures usuelles, composée avec une translation, propriété caractéristique des homothéties-translations. Rotation : définition, propriétés, images de figures. Utilisation des transformations dans des activités géométriques.",
        },
      ],
    },
    {
      titre: "Organisation des calculs — Calculs numériques",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Calculs dans ℝ",
          description:
            "Propriétés des opérations (commutativité, associativité, distributivité). Valeur absolue d'un réel, mesure algébrique, distance sur la droite réelle. Majorant, minorant, maximum, minimum d'un sous-ensemble de ℝ. Calcul approché : approximation décimale d'ordre n, encadrement.",
        },
      ],
    },
    {
      titre: "Organisation des calculs — Calcul littéral",
      volumeHoraire: 23,
      chapitres: [
        {
          titre: "Équations, inéquations et systèmes",
          description:
            "Équations et inéquations du premier et du second degré (avec paramètre au premier degré, discriminant au second degré). Systèmes d'équations affines dans ℝ² (déterminant) et ℝ³. Systèmes d'inéquations affines dans ℝ² (régionnement du plan). Résolutions algébrique et graphique.",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 35,
      chapitres: [
        {
          titre: "Fonctions numériques d'une variable réelle",
          description:
            "Fonctions usuelles (affines par intervalles, valeur absolue, x², √x, 1/x, x³). Fonctions polynômes du second degré (zéros, factorisation, forme canonique, signe). Fonctions rationnelles/homographiques. Propriétés : parité, extremums, sens de variation, opérations sur les fonctions.",
        },
        {
          titre: "Statistique descriptive",
          description:
            "Séries statistiques à une variable : effectifs et fréquences cumulés. Caractéristiques de position (mode, moyenne, médiane) et de dispersion (variance, écart-type, écart moyen, étendue). Représentations graphiques (bâtons, secteurs, bandes, courbes cumulatives). Cas discret, exemples nigériens.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/physique_2ndeC_statique.ts (fourni par la personne
 * à l'origine de cette tâche). */
const PROGRAMME_PHYSIQUE_2NDE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Mécanique",
      volumeHoraire: 21,
      chapitres: [
        {
          titre: "La force",
          description:
            "Forces de contact et frottements ; représentation de la réaction d'un support avec frottements. Forces réparties et forces localisées (l'effet d'une force répartie équivaut à celui d'une force unique).",
        },
        {
          titre: "Équilibre d'un solide soumis à trois forces non parallèles",
          description:
            "Étude expérimentale (dynamomètres, masses marquées). Vérification graphique par le triangle des forces. Énoncé de la condition d'équilibre. Méthode : système, inventaire des forces, schéma, conditions d'équilibre.",
        },
        {
          titre: "Équilibre d'un solide en rotation autour d'un axe fixe",
          description:
            "Étude expérimentale d'un solide en rotation soumis à plusieurs forces (2 à 4). Théorème des moments et méthode analytique. Applications : treuil, levier, plan incliné, association de poulies.",
        },
        {
          titre: "Statique des fluides",
          description:
            "Relation fondamentale de l'hydrostatique (pression selon profondeur et masse volumique). Applications : presse hydraulique, frein, cric, vérin ; deux liquides non miscibles ; gaz. Poussée d'Archimède et condition de flottaison.",
        },
      ],
    },
    {
      titre: "Électricité",
      volumeHoraire: 33,
      chapitres: [
        {
          titre: "Tension continue",
          description:
            "Mesure des tensions continues à l'oscilloscope. Différence de potentiel entre deux points, caractère algébrique de la tension. Notion de masse électrique et circuits avec masse (voiture, moto, vélo).",
        },
        {
          titre: "Tensions variables",
          description:
            "Mise en évidence à l'oscilloscope, définition et exemples. Tension du secteur : tension maximale et efficace, relation entre les deux. Mesure d'une tension alternative sinusoïdale au voltmètre.",
        },
        {
          titre: "Dipôles",
          description:
            "Dipôles passifs et actifs, symétriques ; conventions récepteur et générateur. Caractéristique U = f(I) d'un dipôle passif non linéaire. Associations de générateurs, point de fonctionnement d'un circuit, loi de Pouillet.",
        },
      ],
    },
    {
      titre: "Électronique",
      volumeHoraire: 32,
      chapitres: [
        {
          titre: "Dipôles non linéaires",
          description:
            "Diode à jonction et diode Zener (sens passant/bloqué, caractéristiques idéalisées). Montages redresseurs mono et bi-alternance, alimentation stabilisée. Autres dipôles : thermistance, photorésistance, diode électroluminescente (DEL).",
        },
        {
          titre: "Transistor",
          description:
            "Description et symbole (NPN). Caractéristiques d'entrée IB = f(UBE) et de transfert IC = f(IB). Trois modes de fonctionnement (bloqué, linéaire, saturé). Applications : détecteur de niveau, commande avec capteur, montage en commutation.",
        },
        {
          titre: "Amplificateur opérationnel",
          description:
            "Description, symbole, branchement. Propriétés de l'AO idéal (I⁺ = I⁻ = 0). Modes comparateur et linéaire. Application des lois de l'électricité. Montages simples et étages d'une chaîne électronique dans des appareils courants.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/chimie_2ndeC_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_CHIMIE_2NDE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Structure de la matière",
      volumeHoraire: 22,
      chapitres: [
        {
          titre: "Structure de l'atome",
          description:
            "Élément chimique, constituants de l'atome (noyau, électrons). Charge et masse d'un noyau. Numéro atomique Z et nombre de masse A. Représentation d'un nucléide (AZX), isotopes. Structure électronique et représentation de Lewis d'un atome.",
        },
        {
          titre: "Classification périodique",
          description:
            "Principe de classification des éléments (Z ≤ 18). Tableau périodique : colonnes/groupes, lignes/périodes, familles (alcalins, halogènes, gaz rares). Liaison covalente et nombre de liaisons selon la position dans le tableau.",
        },
        {
          titre: "Liaison covalente dans une molécule",
          description:
            "Liaisons simple, double, triple. Représentation de molécules simples (H₂, Cl₂, O₂, HCl, H₂O, NH₃, CH₄, CO₂…) avec les modèles moléculaires. Règle de l'octet.",
        },
        {
          titre: "Ions monoatomiques et polyatomiques",
          description:
            "Distinction ions monoatomiques et polyatomiques. Formule globale d'un composé ionique à partir des ions. Ions usuels : Na⁺, Ag⁺, Fe²⁺, Fe³⁺, Cu²⁺, Zn²⁺, H₃O⁺, NH₄⁺, Cl⁻, OH⁻, NO₃⁻, SO₄²⁻, CO₃²⁻, PO₄³⁻.",
        },
      ],
    },
    {
      titre: "Réactions chimiques",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Loi de Lavoisier",
          description:
            "Étude expérimentale (réactions de combustion), énoncé de la loi de Lavoisier (conservation de la masse) et son utilisation pour résoudre des problèmes de chimie.",
        },
      ],
    },
    {
      titre: "Solutions aqueuses ioniques",
      volumeHoraire: 28,
      chapitres: [
        {
          titre: "Chlorure de sodium",
          description:
            "Corps pur ionique cristallisé, à l'état liquide, dissolution dans l'eau. Réseau cristallin. Électrolyse du chlorure de sodium fondu et en solution aqueuse : produits, interprétation, calcul des quantités. Importance industrielle.",
        },
        {
          titre: "Rôle du solvant lors de la dissolution",
          description:
            "Étapes de la dissolution d'un composé ionique : destruction du réseau cristallin, hydratation des ions. Conséquences : effets thermiques (exo/endothermique), changement de couleur. Concentrations, équations-bilan, conduction du courant.",
        },
        {
          titre: "Solutions acides et basiques",
          description:
            "Solution d'acide chlorhydrique : ions H₃O⁺ et Cl⁻, propriétés (indicateurs, action sur métaux, sur Ag⁺). Solution d'hydroxyde de sodium : ions OH⁻ et Na⁺ (test à la flamme), précipitations. Définition du pH, autoprotolyse de l'eau, échelle de pH. Dosage acide-base et bilan à l'équivalence.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/svt_2ndeC_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_SVT_2NDE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "L'Homme et son environnement",
      volumeHoraire: 27,
      chapitres: [
        {
          titre: "Constituants de l'environnement",
          description:
            "Affleurements rocheux, sols, végétation, animaux. Facteurs écologiques (climatiques, biologiques, édaphiques). Conditions biotiques et abiotiques d'un milieu, croquis de paysage, herbier. Biocénose, distribution de la végétation, adaptations au milieu aride, profil topographique.",
        },
        {
          titre: "Dégradations de l'environnement",
          description:
            "Types de dégradation : déforestation, désertification, érosion et lessivage, pollutions (sols, eaux, air). Causes naturelles (sécheresse, érosion hydrique et éolienne) et anthropiques (exploitation abusive, surpâturage, feux de brousse). Aridité climatique et désertification.",
        },
        {
          titre: "Gestion de l'environnement",
          description:
            "Lutte contre la désertification (reboisement, fixation de dunes, récupération des terres). Concept de développement durable et domaines qui y participent (gestion des terres, faune, flore, eaux, lutte contre les pollutions).",
        },
      ],
    },
    {
      titre: "Les végétaux dans l'écosystème",
      volumeHoraire: 18,
      chapitres: [
        {
          titre: "Relations trophiques",
          description:
            "Structure trophique d'un écosystème : niveaux trophiques, chaînes et réseaux alimentaires. Classer les êtres vivants (producteurs, consommateurs, décomposeurs). Pyramides écologiques (biomasses, nombres, énergies).",
        },
        {
          titre: "Production primaire et productivité de l'écosystème",
          description:
            "Principe d'évaluation de la production et de la productivité primaires. Conditions et facteurs (eau, température, CO₂, lumière, sels minéraux). Notion de facteur limitant. Définition de la photosynthèse. Distinction PPN / biomasse.",
        },
        {
          titre: "Rôles des végétaux dans l'écosystème",
          description:
            "Rôle des végétaux verts : production de matière organique (photosynthèse), rôle trophique, régulation de la composition de l'atmosphère, protection des sols. Notion d'équilibre du milieu ; conséquences de la destruction du couvert végétal.",
        },
      ],
    },
    {
      titre: "Les sols",
      volumeHoraire: 21,
      chapitres: [
        {
          titre: "Formation, évolution et propriétés d'un sol",
          description:
            "Profil pédologique (type A-B-C), constituants du sol. Mécanismes de formation : altération des roches, humification, différenciation des horizons. Propriétés physiques et chimiques (texture, porosité, perméabilité, rétention). Types de sols au Niger et usages culturaux.",
        },
        {
          titre: "La gestion des sols",
          description:
            "Facteurs de dégradation naturels (érosion, lessivage) et humains (surexploitation, surpâturage). Facteurs améliorants (humus, techniques culturales, assolement, jachère). Protection et récupération des sols (zaï, cordons pierreux, demi-lunes, haies vives).",
        },
      ],
    },
    {
      titre: "Formation et exploitation de ressources géologiques au Niger",
      volumeHoraire: 9,
      chapitres: [
        {
          titre: "Énergie fossile : le charbon d'Anou-Araren",
          description:
            "Ressources énergétiques exploitées au Niger. Processus de formation et d'exploitation du charbon (à ciel ouvert).",
        },
        {
          titre: "Uranium d'Arlit",
          description:
            "Processus de formation d'un gisement d'uranium et modes d'exploitation (à ciel ouvert ou en galeries souterraines).",
        },
        {
          titre: "Calcaire et gypse",
          description: "Formation du gypse et du calcaire. Processus de fabrication du ciment.",
        },
      ],
    },
  ],
};

/** PLACEHOLDER — même objet réutilisé partout (jamais muté, lecture
 * seule), en attendant le vrai contenu de chaque combinaison. */
const PROGRAMME_PLACEHOLDER: ProgrammeMatiereStatique = {
  estPlaceholder: true,
  themes: [],
};

function programmesPlaceholderPourMatieres(): Record<MatiereLyceeId, ProgrammeMatiereStatique> {
  return {
    mathematiques: PROGRAMME_PLACEHOLDER,
    physique: PROGRAMME_PLACEHOLDER,
    chimie: PROGRAMME_PLACEHOLDER,
    svt: PROGRAMME_PLACEHOLDER,
  };
}

/**
 * Pour chaque série de chaque niveau, un jeu de 4 matières placeholder —
 * y compris pour les séries D de Seconde (qui n'existent pas et ne sont
 * jamais liées depuis l'UI, voir SERIES_PAR_NIVEAU) : Record<SerieLyceeId, ...>
 * exige TOUTES les clés en TypeScript, cette entrée reste donc simplement
 * inaccessible depuis la navigation (trouverSerieLycee la rejette).
 */
const PROGRAMMES_PAR_NIVEAU: Record<
  NiveauLyceeId,
  Record<SerieLyceeId, Record<MatiereLyceeId, ProgrammeMatiereStatique>>
> = {
  seconde: {
    a: programmesPlaceholderPourMatieres(),
    c: {
      mathematiques: PROGRAMME_MATHS_2NDE_C,
      physique: PROGRAMME_PHYSIQUE_2NDE_C,
      chimie: PROGRAMME_CHIMIE_2NDE_C,
      svt: PROGRAMME_SVT_2NDE_C,
    },
    d: programmesPlaceholderPourMatieres(),
  },
  premiere: {
    a: programmesPlaceholderPourMatieres(),
    c: programmesPlaceholderPourMatieres(),
    d: programmesPlaceholderPourMatieres(),
  },
  terminale: {
    a: programmesPlaceholderPourMatieres(),
    c: programmesPlaceholderPourMatieres(),
    d: programmesPlaceholderPourMatieres(),
  },
};

export function trouverNiveauLycee(id: string): NiveauLycee | undefined {
  return NIVEAUX_LYCEE.find((niveau) => niveau.id === id);
}

/** La série doit exister ET appartenir au niveau donné (ex. "d" n'est
 * jamais valide pour "seconde") — d'où niveauId en paramètre plutôt qu'une
 * recherche dans une liste plate de séries. */
export function trouverSerieLycee(niveauId: NiveauLyceeId, serieId: string): SerieLycee | undefined {
  return SERIES_PAR_NIVEAU[niveauId].find((serie) => serie.id === serieId);
}

export function trouverMatiereLycee(id: string): MatiereLycee | undefined {
  return MATIERES_LYCEE.find((matiere) => matiere.id === id);
}

export function obtenirProgrammeLycee(
  niveauId: NiveauLyceeId,
  serieId: SerieLyceeId,
  matiereId: MatiereLyceeId
): ProgrammeMatiereStatique {
  return PROGRAMMES_PAR_NIVEAU[niveauId][serieId][matiereId];
}
