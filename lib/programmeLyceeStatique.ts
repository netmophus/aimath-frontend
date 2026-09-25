/**
 * Données STATIQUES du programme du lycée — miroir de
 * lib/programmeCollegeStatique.ts, avec un niveau de navigation
 * supplémentaire (la SÉRIE) : niveau → série → matière → thèmes/chapitres.
 *
 * CE QUI EST RÉEL : tout le lycée est désormais RÉEL — Seconde (A, C),
 * Première (A, C, D) et Terminale (A à 1 matière, C et D à 4 matières).
 * Plus aucun placeholder ne subsiste (comme pour lib/programmeCollegeStatique.ts) :
 * chaque ProgrammeMatiereStatique référencé depuis PROGRAMMES_PAR_NIVEAU a
 * estPlaceholder: false.
 *
 * Séries par niveau (programme nigérien réel, à respecter strictement) :
 * Seconde → A, C uniquement (PAS de D) ; Première et Terminale → A, C, D.
 * Aucune série E ni G.
 *
 * NOMBRE DE MATIÈRES VARIABLE : la grande majorité des combinaisons
 * niveau×série ont 4 matières scientifiques (Mathématiques, Physique,
 * Chimie, SVT). EXCEPTION : Terminale A (littéraire) n'a QUE les
 * Mathématiques — pas de Physique/Chimie/SVT en dernière année. Cette
 * variabilité est portée par les données elles-mêmes (PROGRAMMES_PAR_NIVEAU
 * est un Partial<Record<MatiereLyceeId, ...>>, pas un Record complet) et
 * dérivée via matieresDisponiblesLycee() — jamais une liste fixe de 4
 * matières codée dans l'UI.
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

/** RÉEL — repris de lib/maths_2ndeA_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_MATHS_2NDE_A: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Organisation des calculs — Calculs numériques",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Calculs dans ℝ",
          description:
            "Valeur absolue et distance sur la droite réelle. Intervalle de centre a et de rayon r (en termes de distance et de valeur absolue), intersection et réunion d'intervalles. Majorant, minorant, maximum, minimum d'un sous-ensemble de ℝ. Calcul approché : approximation décimale d'ordre n, encadrement.",
        },
      ],
    },
    {
      titre: "Organisation des calculs — Calcul littéral",
      volumeHoraire: 30,
      chapitres: [
        {
          titre: "Équations, inéquations et systèmes",
          description:
            "Équations et inéquations du premier degré (avec paramètre) et du second degré (discriminant). Systèmes d'équations affines dans ℝ² (déterminant) et ℝ³ (substitution, combinaison). Systèmes d'inéquations affines dans ℝ² (régionnement du plan). Résolutions algébrique et graphique.",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 33,
      chapitres: [
        {
          titre: "Fonctions numériques d'une variable réelle",
          description:
            "Fonctions usuelles (affines par intervalles, valeur absolue, x², √x, 1/x, x³). Fonctions polynômes du second degré (zéros, factorisation, forme canonique, signe). Fonctions homographiques. Propriétés : parité, extremums, sens de variation, opérations sur les fonctions.",
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

/** RÉEL — repris de lib/physique_2ndeA_statique.ts (fourni par la personne
 * à l'origine de cette tâche). */
const PROGRAMME_PHYSIQUE_2NDE_A: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Mécanique",
      volumeHoraire: 22,
      chapitres: [
        {
          titre: "Énergie, puissance",
          description:
            "Définitions de force, travail, vitesse, puissance et énergie cinétique et leurs unités. Calcul de l'énergie cinétique d'un corps de masse m et de vitesse v (partie introduite sous forme de rappel).",
        },
        {
          titre: "Structure d'une automobile",
          description:
            "Identifier et nommer les parties d'une automobile : moteur, transmission, suspension et direction, freins et pneus, circuit électrique, carrosserie. Bref historique de l'automobile.",
        },
        {
          titre: "Besoins énergétiques d'une voiture, combustible, rendement",
          description:
            "Définitions de combustible et de rendement. Transformations d'énergie qui se produisent dans une automobile. Calcul d'un rendement à la suite d'une transformation d'énergie.",
        },
        {
          titre: "Moteur à explosion, moteur diesel",
          description:
            "Schéma du cylindre et de ses éléments (piston, bielle, vilebrequin, soupape, bougie). Les 4 temps d'un moteur. Reconnaître les moteurs 4 temps à essence, 4 temps diesel, 2 temps à mélange.",
        },
        {
          titre: "Freinage, sécurité, l'automobile et la société",
          description:
            "Paramètres de la distance de freinage. Intérêt du permis de conduire, contrôles simples d'un chauffeur. Importance de l'automobile dans la société.",
        },
      ],
    },
    {
      titre: "Électricité — Production, transport et utilisation",
      volumeHoraire: 16,
      chapitres: [
        {
          titre: "Énergie électrique dans la maison",
          description:
            "Rôle du disjoncteur et du compteur électrique. Lecture d'une facture d'électricité et calcul de son montant. Distinction énergie / puissance. Dangers des courts-circuits.",
        },
        {
          titre: "Étude succincte du courant alternatif",
          description:
            "Définitions : courant alternatif, période, fréquence, tension efficace. Détermination de la fréquence à partir d'une courbe de tension. Calcul de l'intensité efficace.",
        },
        {
          titre: "Principe de production d'une tension alternative",
          description: "Reconnaître induit, inducteur, stator, rotor. Principe d'un alternateur.",
        },
        {
          titre: "Différents types de centrales",
          description:
            "Différencier centrale électrique, hydro-électrique et thermique. Avantages et inconvénients de ces centrales.",
        },
        {
          titre: "Transport de l'énergie électrique, transformateurs",
          description:
            "Ordres de grandeur des tensions lors du transport de l'électricité (centrale → utilisateurs). Utilité d'un transformateur ; primaire et secondaire.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/chimie_2ndeA_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_CHIMIE_2NDE_A: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Chimie organique",
      volumeHoraire: 14,
      chapitres: [
        {
          titre: "Hydrocarbures saturés : alcanes",
          description:
            "Définitions : hydrocarbure, alcane, chaîne carbonée (linéaire ou ramifiée). Nomenclature et nom des 6 premiers alcanes.",
        },
        {
          titre: "Combustibles fossiles : charbon, gaz naturel, pétrole",
          description:
            "Origine végétale et animale du charbon, du gaz naturel et du pétrole. Pouvoir calorifique et exemples. Unités d'énergie : joule, tec, tep.",
        },
        {
          titre: "Pays producteurs, réserves, consommation",
          description:
            "Comparaison de données en pourcentages (diagrammes). Description qualitative du cycle du carbone.",
        },
        {
          titre: "Transformations du pétrole : distillation, craquage, reformage",
          description:
            "Procédés physiques de séparation. Principaux produits de la distillation : goudron, paraffine, fioul, gazole, kérosène, essence, butane, propane.",
        },
        {
          titre: "Problèmes d'environnement, sécurité",
          description:
            "Problèmes économiques et sociaux liés aux hydrocarbures. Pollution, carburants sans plomb, marée noire, pot catalytique. Consignes de sécurité dans l'usage des produits organiques.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/svt_2ndeA_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_SVT_2NDE_A: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Environnement",
      volumeHoraire: 25,
      chapitres: [
        {
          titre: "Écosystème",
          description:
            "Éléments constitutifs, structure et fonctionnement d'un écosystème. Notions : biotope, biocénose, biomasse, chaîne alimentaire, réseau trophique, équilibre naturel. Écosystèmes du Niger (steppe, oasis, bordure du fleuve, désert). Concept de biodiversité.",
        },
        {
          titre: "Désertification et réchauffement climatique",
          description:
            "Distinguer sécheresse et désertification. Causes et conséquences de la désertification sur les écosystèmes et les populations. Effet de serre, réchauffement et changement climatique : causes, conséquences, méthodes de lutte.",
        },
        {
          titre: "Gestion de l'environnement",
          description:
            "Méthodes de lutte contre la désertification, rôle protecteur de la végétation, variétés résistantes à la sécheresse. Concept de développement durable et domaines qui y participent (gestion des terres, faune, flore, eaux).",
        },
      ],
    },
    {
      titre: "Alimentation et environnement",
      volumeHoraire: 25,
      chapitres: [
        {
          titre: "Alimentation et nutrition humaine",
          description:
            "Se nourrir correctement, autosuffisance alimentaire au Niger et au Sahel. Malnutrition, sous-alimentation, faim et famine : causes naturelles et conséquences. Besoins (≈ 2000 kcal/jour). Conséquences d'une alimentation déséquilibrée (dont le kwashiorkor).",
        },
        {
          titre: "La faim dans le monde : cas du Niger",
          description:
            "Causes de la faim liées à l'environnement au Niger, contraintes de production vivrière. Solutions : amélioration de la fertilité des sols, variétés à haut rendement adaptées aux zones agro-écologiques, lutte intégrée contre maladies, insectes et adventices.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/maths_1reA_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_MATHS_1RE_A: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Organisation des calculs — Calcul littéral",
      volumeHoraire: 9,
      chapitres: [
        {
          titre: "Équations, inéquations, polynômes, systèmes linéaires",
          description:
            "Polynômes du second degré : équations et inéquations, somme et produit des zéros, mise en équation. Factorisation d'un polynôme de degré n (n = 3 et 4), théorème de factorisation. Systèmes d'équations linéaires dans ℝ³ et ℝ⁴ (méthode du pivot de Gauss).",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 69,
      chapitres: [
        {
          titre: "Généralités sur les fonctions numériques",
          description:
            "Comparaison de deux fonctions (algébrique et graphique). Opérations sur les fonctions (somme, différence, produit, quotient, composée). Fonctions associées à f et leurs courbes. Image directe et réciproque ; application injective, surjective, bijective.",
        },
        {
          titre: "Limites — Continuité",
          description:
            "Notion de limite d'une fonction (en +∞, −∞, en un réel). Comportement des fonctions de référence. Limites et opérations, limite à gauche et à droite. Continuité d'une fonction en un point et sur un intervalle (ouvert, fermé, semi-ouvert).",
        },
        {
          titre: "Dérivation",
          description:
            "Nombre dérivé en un point (à gauche, à droite), dérivabilité. Interprétation graphique, équation de la tangente. Fonction dérivée des fonctions usuelles ; dérivée d'une somme, d'un produit, d'un quotient. Signe de la dérivée et sens de variation. Extremums.",
        },
        {
          titre: "Exemples d'étude de fonctions numériques",
          description:
            "Asymptotes et points particuliers. Fonctions polynômes de degré ≤ 3, fonctions homographiques, fonctions rationnelles et irrationnelles simples. Étude, représentation et exploitation graphique dans la résolution de problèmes.",
        },
        {
          titre: "Suites numériques",
          description:
            "Définition d'une suite (graphique, formule, récurrence). Variation d'une suite. Suites arithmétiques et géométriques : raison, premier terme, terme général, somme de termes consécutifs.",
        },
        {
          titre: "Statistique descriptive",
          description:
            "Séries à une variable : regroupement par classes, centre et amplitude, histogramme. Caractéristiques de position (classe modale, médiane, moyenne) et de dispersion (variance, écart-type, étendue, écart moyen) d'une série groupée en classes.",
        },
        {
          titre: "Dénombrement",
          description:
            "Cardinal d'un ensemble fini, arbres de choix et tableaux. p-listes, arrangements, permutations (notations Aⁿₚ, factorielle), combinaisons (Cⁿₚ). Formule du binôme de Newton et triangle de Pascal.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/physique_1reA_statique.ts (fourni par la personne
 * à l'origine de cette tâche). */
const PROGRAMME_PHYSIQUE_1RE_A: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Phénomènes corpusculaires",
      volumeHoraire: 18,
      chapitres: [
        {
          titre: "Structure du noyau",
          description:
            "Constituants du noyau, vocabulaire : proton, neutron, nombre de charge, nombre de masse, nucléide, isotope. Notation AZX.",
        },
        {
          titre: "Radioactivité et rayonnements radioactifs",
          description:
            "Les divers types de rayonnements (α, β, γ). Période radioactive et courbe de décroissance radioactive.",
        },
        {
          titre: "Fission, fusion",
          description:
            "Distinction entre réaction de fission et de fusion. Équilibrage d'une équation de réaction nucléaire. Relation d'Einstein E = mc². Unités (u, MeV, J).",
        },
        {
          titre: "Effets biologiques, environnement, radioprotection",
          description:
            "Effets néfastes des rayonnements sur l'homme et l'environnement. Règles fondamentales de protection : distance, activité, temps, écrans.",
        },
        {
          titre: "Applications de la radioactivité",
          description:
            "Datation, marquage radioactif, utilisations thérapeutiques (médecine), centrales nucléaires. Dater un échantillon à l'aide de la courbe de décroissance.",
        },
        {
          titre: "Uranium : minerais, extraction, traitement, enrichissement",
          description:
            "L'uranium comme combustible nucléaire, ses minerais. Procédés de détection (compteur Geiger, compteur à scintillation), d'extraction, de traitement et d'enrichissement.",
        },
      ],
    },
    {
      titre: "Optique",
      volumeHoraire: 8,
      chapitres: [
        {
          titre: "Réfraction de la lumière",
          description:
            "Réfraction sur un dioptre plan (air-verre), lois de Descartes, indice de réfraction (air, verre, eau). Réflexion partielle et totale (fibres optiques, couches antireflets).",
        },
        {
          titre: "Lentilles convergentes",
          description:
            "Schématiser une lentille convergente, ses points remarquables. Construire l'image donnée par une lentille convergente et mesurer la distance focale.",
        },
      ],
    },
    {
      titre: "Énergies renouvelables",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Énergies renouvelables",
          description:
            "Définition des énergies renouvelables. Types (solaire, éolienne, hydraulique, biomasse et énergie des déchets) et domaines d'application de chacune.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/chimie_1reA_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_CHIMIE_1RE_A: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Engrais",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Éléments fertilisants",
          description:
            "Symboles des éléments (C, H, O, N, P, K). Corps purs H₂O, CO₂, NH₃, O₂, N₂. Besoins des plantes en éléments fertilisants. Vocabulaire : chlorure, nitrate, phosphate, ammonium, urée.",
        },
        {
          titre: "Principaux engrais et analyse chimique",
          description:
            "Principaux engrais : azotés, phosphatés, potassiques. Signification de la « formule d'un engrais » composé, exemple (N, P₂O₅, K₂O).",
        },
        {
          titre: "Cycle de l'azote dans la nature",
          description:
            "Description qualitative du cycle de l'azote. Lecture et utilisation d'un schéma modélisant le cycle.",
        },
        {
          titre: "Procédé de fabrication d'un engrais",
          description:
            "Analyse du schéma de l'unité de fabrication du nitrate d'ammonium : matières premières et étapes d'élaboration.",
        },
        {
          titre: "Engrais naturels",
          description:
            "Engrais naturels (fumier, compost, engrais vert). Fabrication du compost, rôle des engrais dans les cultures locales, avantages et inconvénients.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/svt_1reA_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_SVT_1RE_A: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "La cellule : organisation, transmission et expression de l'information génétique",
      volumeHoraire: 18,
      chapitres: [
        {
          titre: "Organisation de la cellule",
          description:
            "Structures et ultrastructures des cellules animale et végétale (observation au microscope : épiderme d'oignon, cellules de la joue). Organites caractéristiques. Comparaison cellule animale / cellule végétale. La cellule comme unité du vivant.",
        },
        {
          titre: "La mitose et l'ADN",
          description:
            "Mitose ou reproduction conforme : étapes. Relation chromosome-ADN, structure de la molécule d'ADN, réplication. Expérience sur pointes de racines d'oignon.",
        },
        {
          titre: "Synthèse des protéines et notion de gène",
          description:
            "Sièges et étapes de la synthèse des protéines : transcription de l'ADN en ARN messager (noyau), traduction en protéine (cytoplasme). Code génétique. Définition d'un gène.",
        },
      ],
    },
    {
      titre: "Reproduction chez les Mammifères : cas de l'Homme",
      volumeHoraire: 18,
      chapitres: [
        {
          titre: "Organisation et physiologie des organes génitaux",
          description:
            "Appareils reproducteurs masculin et féminin. Gonades, gamétogenèse (spermatogenèse et ovogenèse). Méiose (comparée à la mitose). Régulation hormonale, cycles sexuels chez la femme, activité testiculaire.",
        },
        {
          titre: "Fécondation et régulation des naissances",
          description:
            "Fécondation : définition, lieu, étapes. Régulation des naissances : contraception hormonale chez la femme. Principales causes de stérilité.",
        },
        {
          titre: "Le VIH/SIDA",
          description:
            "Signification de VIH et SIDA, structure du virus. Modes de contamination et de non-transmission, prévention, dépistage. Mode d'action (cible : lymphocytes T), maladies opportunistes. Différence entre séropositivité et SIDA maladie.",
        },
      ],
    },
    {
      titre: "Le tissu nerveux",
      volumeHoraire: 14,
      chapitres: [
        {
          titre: "Tissu nerveux et notions de réflexes",
          description:
            "Nerf, moelle épinière, ultrastructure de la cellule nerveuse. Propriétés du tissu nerveux (excitabilité, conductibilité). Réflexes innés et conditionnés, arc réflexe. Expérience du réflexe de flexion chez la grenouille.",
        },
        {
          titre: "Messages nerveux",
          description:
            "Potentiel de repos et potentiel d'action (au niveau de la membrane plasmique). Propagation du message nerveux dans un neurone et un nerf, naissance au niveau d'un récepteur sensoriel. Synapses et transmission synaptique ; la plaque motrice.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/maths_1reD_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_MATHS_1RE_D: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Organisation des calculs — Calcul littéral",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Équations, inéquations, polynômes, systèmes linéaires",
          description:
            "Polynômes du second degré : somme et produit des zéros, équations et inéquations avec paramètre. Factorisation d'un polynôme de degré n ≥ 3 (théorème de factorisation). Systèmes linéaires dans ℝ³ et ℝ⁴ (pivot de Gauss). Équations et inéquations irrationnelles.",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 80,
      chapitres: [
        {
          titre: "Généralités sur les fonctions numériques",
          description:
            "Comparaison de deux fonctions, opérations (somme, produit, quotient, composée). Fonctions associées à f et leurs courbes. Image directe et réciproque ; application injective, surjective, bijective.",
        },
        {
          titre: "Limites — Continuité",
          description:
            "Notion de limite (comportement des fonctions de référence), limites et opérations, limite à gauche et à droite. Continuité en un point et sur un intervalle. Prolongement par continuité.",
        },
        {
          titre: "Dérivation",
          description:
            "Nombre dérivé en un point, dérivabilité, tangente. Fonction dérivée des fonctions usuelles ; dérivée d'une somme, produit, quotient, composée avec une fonction affine. Signe de la dérivée et sens de variation, extremums.",
        },
        {
          titre: "Exemples d'étude de fonctions numériques",
          description:
            "Asymptotes et points particuliers. Fonctions polynômes (degré ≤ 3), homographiques, rationnelles, et trigonométriques (sin, cos, tan, sin(ax+b), cos(ax+b)). Étude, représentation et résolution de problèmes.",
        },
        {
          titre: "Primitives",
          description:
            "Notion de primitive d'une fonction continue sur un intervalle. Détermination de l'ensemble des primitives et de la primitive prenant une valeur donnée (cas simples : polynômes, sinus, cosinus).",
        },
        {
          titre: "Suites numériques",
          description:
            "Définition (graphique, formule, récurrence). Initiation au raisonnement par récurrence. Variation. Suites arithmétiques et géométriques (raison, terme général, somme). Notion de convergence (approche).",
        },
        {
          titre: "Statistique descriptive",
          description:
            "Séries à une variable : regroupement par classes, histogramme. Caractéristiques de position (classe modale, médiane, moyenne) et de dispersion (variance, écart-type, étendue, écart moyen) d'une série groupée.",
        },
        {
          titre: "Dénombrement",
          description:
            "Cardinal d'un ensemble fini, arbres de choix. Arrangements, permutations (Aⁿₚ, factorielle), combinaisons (Cⁿₚ). Formule du binôme et triangle de Pascal.",
        },
      ],
    },
    {
      titre: "Géométrie plane",
      volumeHoraire: 35,
      chapitres: [
        {
          titre: "Angles orientés et trigonométrie",
          description:
            "Angles orientés d'un couple de vecteurs, relation de Chasles, double d'un angle. Trigonométrie : angles associés, formules d'addition et de duplication (cos(a±b), sin(a±b), tan(a±b), cos2a, sin2a, tan2a). Équations et inéquations trigonométriques.",
        },
        {
          titre: "Applications du produit scalaire et du barycentre",
          description:
            "Équations d'un cercle (paramétrique, cartésienne). Distance d'un point à une droite. Lignes de niveau : fonction scalaire de Leibniz, applications M↦AM·AB, M↦MA·MB, M↦MA/MB.",
        },
        {
          titre: "Transformations du plan",
          description:
            "Isométries : définition et propriétés (conservation des distances, angles, parallélisme, produit scalaire, barycentre). Homothéties et leurs composées. Similitudes (composée d'une homothétie et d'une isométrie) : construction d'images de figures.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/physique_1reD_statique.ts (fourni par la personne
 * à l'origine de cette tâche). */
const PROGRAMME_PHYSIQUE_1RE_D: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Mécanique",
      volumeHoraire: 36,
      chapitres: [
        {
          titre: "Mouvement",
          description:
            "Caractère relatif du mouvement : référentiels, repères, positions, trajectoires. Vitesse d'un point mobile, caractéristiques du vecteur-vitesse (unités m·s⁻¹, rad·s⁻¹). Mouvements rectiligne uniforme et circulaire uniforme. Abscisse curviligne et angulaire.",
        },
        {
          titre: "Centre d'inertie",
          description:
            "Solide isolé et pseudo-isolé, forces extérieures et intérieures. Mise en évidence et propriétés barycentriques du centre d'inertie. Principe d'inertie (le centre d'inertie d'un solide isolé a un mouvement rectiligne uniforme).",
        },
        {
          titre: "Quantité de mouvement",
          description:
            "Définition, caractéristiques et représentation du vecteur quantité de mouvement (unité kg·m·s⁻¹). Quantité de mouvement d'un système de deux solides. Conservation pour un système isolé, variation pour un solide.",
        },
        {
          titre: "Travail et puissance",
          description:
            "Travail et puissance des forces en translation (W = F·AB·cosα) et en rotation autour d'un axe fixe. Caractère algébrique du travail. Couple de forces et moment d'un couple. Puissances moyenne et instantanée.",
        },
        {
          titre: "Énergie cinétique",
          description:
            "Énergie cinétique de translation et de rotation, moment d'inertie (J∆, unité kg·m²) de quelques solides homogènes. Théorème de l'énergie cinétique en translation et en rotation, et ses applications.",
        },
        {
          titre: "Énergie potentielle",
          description:
            "Champ de pesanteur uniforme. Énergie potentielle de pesanteur d'un solide et sa variation. Énergie potentielle élastique.",
        },
        {
          titre: "Énergie mécanique",
          description:
            "Définition et expression de l'énergie mécanique d'un solide. Conservation et non-conservation de l'énergie mécanique (conséquences pratiques : moteurs, freinage).",
        },
      ],
    },
    {
      titre: "Électricité",
      volumeHoraire: 24,
      chapitres: [
        {
          titre: "Énergie électrique — Champ électrostatique",
          description:
            "Champ électrostatique, vecteur champ, relation F = qE (unité V·m⁻¹), champ uniforme. Énergie potentielle d'une charge dans le champ, différence de potentiel, conservation de l'énergie.",
        },
        {
          titre: "Loi d'Ohm pour un récepteur non ohmique",
          description:
            "Caractéristique U = f(I) d'un récepteur non ohmique, force contre-électromotrice (f.c.e.m.). Loi d'Ohm pour un récepteur non ohmique. Bilan énergétique dans un circuit électrique et électronique (transistor).",
        },
        {
          titre: "Condensateurs",
          description:
            "Charge et décharge, capacité d'un condensateur (unité farad), mesure à l'oscilloscope. Associations série et parallèle, capacité équivalente. Énergie emmagasinée. Montages dérivateur et intégrateur. Alimentation continue stabilisée.",
        },
      ],
    },
    {
      titre: "Optique",
      volumeHoraire: 23,
      chapitres: [
        {
          titre: "Réfraction de la lumière",
          description:
            "Lois de Descartes, indice de réfraction d'un milieu transparent, réfringence. Réflexion totale et angle de réfraction limite. Applications (fibres optiques, mirages).",
        },
        {
          titre: "Lentilles minces",
          description:
            "Lentilles convergentes et divergentes : foyers, plans focaux, distance focale, formules de conjugaison et de grandissement. Vergence (unité dioptrie), système de lentilles accolées. Applications (microscope, appareil photo, correction de l'œil).",
        },
        {
          titre: "Dispersion — Diffraction de la lumière",
          description:
            "Prisme et dispersion de la lumière blanche (lois du prisme). Spectres d'émission et d'absorption. Lumière monochromatique.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/chimie_1reD_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_CHIMIE_1RE_D: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Chimie organique",
      volumeHoraire: 20,
      chapitres: [
        {
          titre: "Alcanes",
          description:
            "Structure (représentation en perspective et de Newman), chaîne linéaire ou ramifiée, isomères. Nomenclature. Réactions : bromation du méthane, combustion. Bilans molaire, massique et volumique dans les calculs.",
        },
        {
          titre: "Dérivés insaturés : alcènes et alcynes",
          description:
            "Structures, longueurs de liaisons (C–C, C=C, C≡C), nomenclature, isomérie Z/E. Réactions d'addition (règle de Markovnikov) sur alcènes et alcynes. Polymérisation : monomère, polymère, motif élémentaire (polyéthylène).",
        },
        {
          titre: "Composés aromatiques",
          description:
            "Structure du benzène et représentation conventionnelle. Réactions d'addition (dihydrogène, dichlore) et de substitution (halogénation, nitration). Isomérie ortho, méta, para. Applications des dérivés (explosifs, insecticides).",
        },
        {
          titre: "Combustibles fossiles",
          description:
            "Origine du charbon, du gaz naturel et du pétrole. Pouvoir calorifique (unités joule, tec, tep). Transformations du pétrole : distillation, craquage, reformage. Produits de la distillation.",
        },
      ],
    },
    {
      titre: "Chimie minérale et générale : métaux et oxydoréduction",
      volumeHoraire: 28,
      chapitres: [
        {
          titre: "Couples oxydant-réducteur, classification qualitative",
          description:
            "Notion de couple oxydant-réducteur, couple H₃O⁺/H₂. Classification qualitative de quelques couples selon leur pouvoir oxydant ou réducteur (expériences métaux/acide, métal/ion métallique). L'oxydant le plus fort réagit avec le réducteur le plus fort.",
        },
        {
          titre: "Piles et potentiels d'oxydoréduction, classification quantitative",
          description:
            "Pile : principe, force électromotrice, demi-pile à hydrogène. Potentiel d'oxydoréduction, potentiel standard, échelle des potentiels. Dosage d'oxydoréduction (Fe²⁺ par MnO₄⁻). Nombre d'oxydation. Électrolyse. Protection contre la corrosion.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/svt_1reD_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_SVT_1RE_D: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Géodynamique interne",
      volumeHoraire: 30,
      chapitres: [
        {
          titre: "Structure interne de la Terre",
          description:
            "Étude des séismes : ondes P, L, S. Discontinuités (Mohorovicic, Gutenberg, Lehmann). Foyer, épicentre, sismogramme, intensité, magnitude, échelle de Richter. Modèle concentrique de la structure interne de la Terre (sphères emboîtées).",
        },
        {
          titre: "Tectonique des plaques",
          description:
            "Répartition des séismes et du volcanisme, comparaison géographique. Théorie de la tectonique des plaques, délimitation des plaques, origine de leurs mouvements.",
        },
        {
          titre: "Conséquences de la tectonique des plaques",
          description:
            "Expansion des fonds océaniques (dorsales, accrétion, zones de divergence). Formation des chaînes de montagnes (subduction, collision). Dérive des continents. Convection mantélique comme moteur.",
        },
      ],
    },
    {
      titre: "Notions de stratigraphie",
      volumeHoraire: 26,
      chapitres: [
        {
          titre: "Principes de la stratigraphie et méthodes de datation",
          description:
            "Principes (superposition, continuité, identité paléontologique, recoupement, inclusion). Datation relative et datation absolue (décroissance radioactive : ¹⁴C/¹²C, K/Ar, Rb/Sr ; période radioactive).",
        },
        {
          titre: "L'échelle des temps géologiques",
          description:
            "Ères primaire, secondaire, tertiaire, quaternaire. Notions de fossile, fossilisation, fossiles stratigraphiques et de faciès. Principes d'établissement de l'échelle stratigraphique.",
        },
        {
          titre: "La carte géologique et la coupe géologique",
          description:
            "Composantes d'une carte géologique, accidents géologiques (structures tabulaire, faillée, monoclinale, synclinale, plissée). Réalisation d'une coupe géologique tabulaire.",
        },
      ],
    },
    {
      titre: "La cellule, unité d'organisation des êtres vivants",
      volumeHoraire: 14,
      chapitres: [
        {
          titre: "Organisation de la cellule",
          description:
            "Structures et ultrastructures des cellules eucaryotes (animale et végétale), organites caractéristiques. Comparaison cellule animale / végétale, et cellule eucaryote / procaryote. Observation au microscope (oignon, cellules de la joue).",
        },
      ],
    },
    {
      titre: "La production primaire au niveau de l'organisme chlorophyllien",
      volumeHoraire: 30,
      chapitres: [
        {
          titre: "Nutrition minérale d'un végétal chlorophyllien",
          description:
            "Absorption de l'eau et des ions (poils absorbants, sève brute). Osmose et pression osmotique, perméabilités membranaires, transports passif et actif. Turgescence, plasmolyse, isotonie, hypotonie, hypertonie. Aspiration foliaire.",
        },
        {
          titre: "Nutrition carbonée d'un végétal chlorophyllien",
          description:
            "Chloroplaste, siège de la photosynthèse ; pigments chlorophylliens. Réactions de la phase claire (photochimiques) et de la phase sombre (chimiques). Comparaison plantes en C3 et C4. Entrée du CO₂ par les stomates.",
        },
        {
          titre: "Devenir des substances synthétisées",
          description:
            "Sève élaborée : composition, transport (circulation descendante), mise en réserve. Respiration au niveau cellulaire (mitochondrie) et fermentations (lactique, alcoolique). Comparaison respiration / fermentation.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/maths_1reC_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_MATHS_1RE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Organisation des calculs — Calcul littéral",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Équations, inéquations, polynômes, systèmes linéaires",
          description:
            "Polynômes du second degré : somme et produit des zéros, équations et inéquations avec paramètre. Factorisation d'un polynôme de degré n ≥ 3. Systèmes linéaires dans ℝ³ et ℝ⁴ (pivot de Gauss). Équations et inéquations irrationnelles.",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 78,
      chapitres: [
        {
          titre: "Généralités sur les fonctions numériques",
          description:
            "Comparaison de deux fonctions, opérations (somme, produit, quotient, composée). Fonctions associées à f et leurs courbes. Image directe et réciproque ; application injective, surjective, bijective.",
        },
        {
          titre: "Limites — Continuité",
          description:
            "Limite d'une fonction (en +∞, −∞, en un réel), limites et opérations, limite à gauche et à droite. Unicité de la limite. Continuité en un point et sur un intervalle. Prolongement par continuité.",
        },
        {
          titre: "Dérivation",
          description:
            "Nombre dérivé en un point, dérivabilité, tangente. Fonction dérivée des fonctions usuelles ; dérivée d'une somme, produit, quotient. Signe de la dérivée et sens de variation, extremums.",
        },
        {
          titre: "Exemples d'étude de fonctions numériques",
          description:
            "Asymptotes et points particuliers. Fonctions polynômes (degré ≤ 3), homographiques, rationnelles, et trigonométriques (sin, cos, tan, sin(ax+b), cos(ax+b)). Étude, représentation et résolution de problèmes.",
        },
        {
          titre: "Primitives",
          description:
            "Notion de primitive d'une fonction continue sur un intervalle. Détermination de l'ensemble des primitives et de la primitive prenant une valeur donnée (cas simples : polynômes, sinus, cosinus).",
        },
        {
          titre: "Suites numériques",
          description:
            "Définition (graphique, formule, récurrence). Raisonnement par récurrence. Variation. Suites arithmétiques et géométriques (raison, terme général, somme). Notion de convergence (comportement quand n croît).",
        },
        {
          titre: "Statistique descriptive",
          description:
            "Séries à une variable : regroupement par classes, histogramme. Caractéristiques de position (classe modale, médiane, moyenne) et de dispersion (variance, écart-type, étendue, écart moyen) d'une série groupée.",
        },
        {
          titre: "Dénombrement",
          description:
            "Cardinal d'un ensemble fini, réunion, produit cartésien, parties. Arbres de choix. Arrangements, permutations (Aⁿₚ, factorielle), combinaisons (Cⁿₚ). Formule du binôme et triangle de Pascal.",
        },
      ],
    },
    {
      titre: "Géométrie plane",
      volumeHoraire: 45,
      chapitres: [
        {
          titre: "Angles orientés et trigonométrie",
          description:
            "Angles orientés, relation de Chasles. Angle inscrit dans un cercle, théorème de l'angle inscrit et de l'angle au centre, cocyclicité, arcs capables. Formules d'addition et de duplication. Équations et inéquations trigonométriques.",
        },
        {
          titre: "Applications du produit scalaire et du barycentre",
          description:
            "Équations d'un cercle (paramétrique, cartésienne). Distance d'un point à une droite. Lignes de niveau : fonction scalaire de Leibniz, applications M↦AM·AB, M↦MA·MB, M↦MA/MB.",
        },
        {
          titre: "Transformations du plan",
          description:
            "Isométries : symétrie glissée, déplacement et antidéplacement, propriétés. Homothéties et leurs composées. Similitudes (composée d'une homothétie et d'une isométrie) : construction d'images de figures.",
        },
      ],
    },
    {
      titre: "Géométrie dans l'espace",
      volumeHoraire: 15,
      chapitres: [
        {
          titre: "Vecteurs de l'espace",
          description: "Définition et opérations sur les vecteurs de l'espace, combinaisons linéaires, coplanarité.",
        },
        {
          titre: "Positions de droites et plans de l'espace",
          description:
            "Orthogonalité et projections orthogonales dans l'espace. Représentations paramétriques et équations cartésiennes de droites et plans. Intersections de droites et plans. Distance d'un point à un plan.",
        },
        {
          titre: "Produit scalaire et produit vectoriel dans l'espace",
          description:
            "Produit scalaire dans l'espace : définition, expressions, vecteurs orthogonaux, norme. Produit vectoriel : définition, notation, et utilisation pour déterminer un vecteur normal à un plan.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/physique_1reC_statique.ts (fourni par la personne
 * à l'origine de cette tâche). */
const PROGRAMME_PHYSIQUE_1RE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Mécanique",
      volumeHoraire: 54,
      chapitres: [
        {
          titre: "Mouvement",
          description:
            "Caractère relatif du mouvement : référentiels, repères, positions, trajectoires. Vitesse d'un point mobile, caractéristiques du vecteur-vitesse (unités m·s⁻¹, rad·s⁻¹). Mouvements rectiligne uniforme et circulaire uniforme. Abscisse curviligne et angulaire.",
        },
        {
          titre: "Centre d'inertie",
          description:
            "Solide isolé et pseudo-isolé, forces extérieures et intérieures. Mise en évidence et propriétés barycentriques du centre d'inertie. Principe d'inertie.",
        },
        {
          titre: "Quantité de mouvement",
          description:
            "Définition, caractéristiques et représentation du vecteur quantité de mouvement (unité kg·m·s⁻¹). Système de deux solides, conservation pour un système isolé, variation pour un solide.",
        },
        {
          titre: "Travail et puissance",
          description:
            "Travail et puissance des forces en translation (W = F·AB·cosα) et en rotation autour d'un axe fixe. Caractère algébrique du travail. Couple de forces et moment. Puissances moyenne et instantanée.",
        },
        {
          titre: "Énergie cinétique",
          description:
            "Énergie cinétique de translation et de rotation, moment d'inertie (J∆, unité kg·m²). Théorème de l'énergie cinétique en translation et en rotation, et ses applications.",
        },
        {
          titre: "Énergie potentielle",
          description:
            "Champ de pesanteur uniforme. Énergie potentielle de pesanteur et sa variation. Énergie potentielle élastique.",
        },
        {
          titre: "Énergie mécanique",
          description:
            "Définition et expression de l'énergie mécanique d'un solide. Conservation et non-conservation (conséquences pratiques : moteurs, freinage).",
        },
      ],
    },
    {
      titre: "Électricité",
      volumeHoraire: 28,
      chapitres: [
        {
          titre: "Énergie électrique — Champ électrostatique",
          description:
            "Champ électrostatique, vecteur champ, relation F = qE (unité V·m⁻¹), champ uniforme entre les armatures d'un condensateur plan. Énergie potentielle d'une charge, différence de potentiel, conservation de l'énergie.",
        },
        {
          titre: "Loi d'Ohm pour un récepteur non ohmique",
          description:
            "Caractéristique U = f(I) d'un récepteur non ohmique, force contre-électromotrice (f.c.e.m.). Loi d'Ohm pour un récepteur non ohmique. Bilan énergétique dans un circuit électrique et électronique.",
        },
        {
          titre: "Condensateurs",
          description:
            "Charge et décharge, capacité (unité farad), mesure à l'oscilloscope. Associations série et parallèle, capacité équivalente. Énergie emmagasinée. Montages dérivateur et intégrateur. Alimentation continue stabilisée.",
        },
      ],
    },
    {
      titre: "Optique",
      volumeHoraire: 32,
      chapitres: [
        {
          titre: "Réfraction de la lumière",
          description:
            "Lois de Descartes, indice de réfraction, réfringence. Réflexion totale et angle de réfraction limite. Applications (fibres optiques, mirages).",
        },
        {
          titre: "Lentilles minces",
          description:
            "Lentilles convergentes et divergentes : foyers, plans focaux, distance focale, formules de conjugaison et de grandissement. Vergence (unité dioptrie), système de lentilles accolées. Applications (microscope, appareil photo, correction de l'œil).",
        },
        {
          titre: "Dispersion — Diffraction de la lumière",
          description:
            "Prisme et dispersion de la lumière blanche (lois du prisme). Spectres d'émission et d'absorption. Lumière monochromatique.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/chimie_1reC_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_CHIMIE_1RE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Chimie organique",
      volumeHoraire: 20,
      chapitres: [
        {
          titre: "Alcanes",
          description:
            "Structure (perspective, représentation de Newman), chaîne linéaire ou ramifiée, isomères. Nomenclature. Réactions : bromation du méthane, combustion. Bilans molaire, massique et volumique dans les calculs.",
        },
        {
          titre: "Dérivés insaturés : alcènes et alcynes",
          description:
            "Structures, longueurs de liaisons (C–C, C=C, C≡C), nomenclature, isomérie Z/E. Réactions d'addition (règle de Markovnikov). Polymérisation : monomère, polymère, motif élémentaire (polyéthylène).",
        },
        {
          titre: "Composés aromatiques",
          description:
            "Structure du benzène. Réactions d'addition (dihydrogène, dichlore) et de substitution (halogénation, nitration). Isomérie ortho, méta, para. Applications des dérivés.",
        },
        {
          titre: "Combustibles fossiles",
          description:
            "Origine du charbon, du gaz naturel et du pétrole. Pouvoir calorifique (unités joule, tec, tep). Transformations du pétrole : distillation, craquage, reformage. Produits de la distillation.",
        },
      ],
    },
    {
      titre: "Chimie minérale et générale : métaux et oxydoréduction",
      volumeHoraire: 28,
      chapitres: [
        {
          titre: "Couples oxydant-réducteur, classification qualitative",
          description:
            "Notion de couple oxydant-réducteur, couple H₃O⁺/H₂. Classification qualitative selon le pouvoir oxydant ou réducteur. L'oxydant le plus fort réagit avec le réducteur le plus fort.",
        },
        {
          titre: "Piles et potentiels d'oxydoréduction, classification quantitative",
          description:
            "Pile : principe, force électromotrice, demi-pile à hydrogène. Potentiel d'oxydoréduction, potentiel standard (H₃O⁺/H₂ = 0), échelle des potentiels. Classification quantitative des couples.",
        },
        {
          titre: "Généralisation de l'oxydoréduction",
          description:
            "Généralisation de la notion de couple. Nombre d'oxydation : détermination, identification et équilibrage d'une réaction d'oxydoréduction. Oxydoréduction par voie sèche, électrolyse (chlorure d'étain), protection contre la corrosion.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/svt_1reC_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_SVT_1RE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "La cellule, unité d'organisation des êtres vivants",
      volumeHoraire: 8,
      chapitres: [
        {
          titre: "Organisation de la cellule vivante",
          description:
            "Structures et ultrastructures des cellules eucaryotes (animale et végétale), organites caractéristiques. Comparaison cellule animale / végétale et cellule eucaryote / procaryote. Observation au microscope (oignon, cellules de la joue).",
        },
      ],
    },
    {
      titre: "La production primaire au niveau de l'organisme chlorophyllien",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Nutrition minérale d'un végétal chlorophyllien",
          description:
            "Absorption de l'eau et des ions (poils absorbants, sève brute, xylème, circulation ascendante). Osmose et pression osmotique, perméabilités membranaires, transports actif et passif. Turgescence, plasmolyse, isotonie, hypotonie, hypertonie. Aspiration foliaire.",
        },
        {
          titre: "Nutrition carbonée d'un végétal chlorophyllien",
          description:
            "Chloroplaste, siège de la photosynthèse ; pigments chlorophylliens. Réactions de la phase claire (photochimiques) et de la phase sombre (chimiques). Entrée du CO₂ par les stomates.",
        },
        {
          titre: "Devenir des substances synthétisées",
          description:
            "Sève élaborée : composition, transport (circulation descendante). Devenir des substances : croissance, respiration, mise en réserve (fruits, tubercules, bulbes).",
        },
      ],
    },
    {
      titre: "Production d'énergie à partir des molécules organiques",
      volumeHoraire: 8,
      chapitres: [
        {
          titre: "La respiration au niveau cellulaire",
          description:
            "Siège de la respiration (mitochondrie), étapes des réactions respiratoires à partir de la molécule de glucose. Schéma de l'ultrastructure d'une mitochondrie.",
        },
        {
          titre: "Les fermentations",
          description:
            "Fermentation alcoolique et fermentation lactique. Comparaison du rendement en ATP entre la respiration et les fermentations. Expériences de fermentation.",
        },
      ],
    },
    {
      titre: "Structure interne de la Terre",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Séisme",
          description:
            "Manifestations, conséquences et origine des séismes. Sismographe et sismogramme. Foyer, épicentre, intensité, magnitude, échelle de Richter. Propriétés et caractéristiques des ondes sismiques P, L, S. Moyens de prévention.",
        },
        {
          titre: "La structure du globe",
          description:
            "Croûte continentale et océanique, manteau. Discontinuités (Moho, Gutenberg, Lehmann). Lithosphère, asthénosphère, mésosphère. Apport de la sismographie ; accrétion océanique au niveau des dorsales.",
        },
      ],
    },
    {
      titre: "Notions de stratigraphie",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Principes de la stratigraphie et méthodes de datation",
          description:
            "Principes (superposition, continuité, identité paléontologique, recoupement, inclusion). Datation relative et datation absolue (décroissance radioactive : ¹⁴C/¹²C, K/Ar, Rb/Sr ; période radioactive).",
        },
        {
          titre: "L'échelle des temps géologiques",
          description:
            "Ères primaire, secondaire, tertiaire, quaternaire. Notions de fossile, fossilisation, fossiles stratigraphiques et de faciès. Principes d'établissement de l'échelle stratigraphique.",
        },
        {
          titre: "La carte géologique et la coupe géologique",
          description:
            "Composantes d'une carte géologique, accidents géologiques (structures tabulaire, faillée, monoclinale, synclinale, plissée). Lecture d'une carte et réalisation d'une coupe géologique tabulaire.",
        },
      ],
    },
  ],
};

/** RÉEL — repris du contenu fourni pour la Terminale série A. Particularité
 * du programme nigérien : en Terminale A (littéraire), les Mathématiques
 * sont la SEULE matière scientifique — pas de Physique/Chimie/SVT à ce
 * niveau (contrairement à Seconde A et Première A, qui ont les 4). */
const PROGRAMME_MATHS_TLE_A: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Organisation des données",
      volumeHoraire: 72,
      chapitres: [
        {
          titre: "Suites numériques",
          description:
            "Raisonnement par récurrence. Généralités sur les suites : sens de variation, convergence et divergence. Suites arithmétiques et géométriques : convergence, calculs et résolution de problèmes (exemples en sciences humaines, finances).",
        },
        {
          titre: "Fonctions exponentielles",
          description:
            "Fonction exponentielle de base a (a > 0, a ≠ 1) : propriétés algébriques, dérivée, sens de variation, représentation. Fonction exponentielle de base e : nombre e, limites usuelles, dérivée de e^u(x). Fonction exponentielle de base 10.",
        },
        {
          titre: "Fonctions logarithmes",
          description:
            "Logarithme népérien (ln) comme réciproque de l'exponentielle : propriétés algébriques, dérivée, limites, représentation. Logarithme décimal (log). Résolution d'équations, inéquations et systèmes comportant logarithmes et exponentielles (degré ≤ 3).",
        },
        {
          titre: "Étude de fonctions numériques",
          description:
            "Étude et représentation de fonctions simples : x↦ax+b+c/(dx+e), fonctions puissances x↦xⁿ et x↦x^(1/n), fonctions comportant des logarithmes et/ou des exponentielles. Recherche d'asymptotes.",
        },
        {
          titre: "Probabilités sur un ensemble fini",
          description:
            "Vocabulaire et définitions. Calcul des probabilités par dénombrement. Propriétés (probabilité comprise entre 0 et 1). Lien entre statistiques et probabilités.",
        },
        {
          titre: "Variables aléatoires",
          description:
            "Notion de variable aléatoire réelle. Loi de probabilité : espérance mathématique, variance, écart-type. Fonction de répartition. Loi binomiale et calcul de ses paramètres.",
        },
        {
          titre: "Statistiques",
          description:
            "Séries à une variable : quartiles, déciles, centiles. Séries à deux variables : nuage de points, point moyen, droite de Mayer.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/maths_tleC_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_MATHS_TLE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Organisation des calculs — Calculs numériques",
      volumeHoraire: 48,
      chapitres: [
        {
          titre: "Arithmétique",
          description:
            "Anneau ℤ, multiples et sous-groupes, division euclidienne, numération décimale et binaire. Congruences modulo n, anneau ℤ/nℤ. PGCD et PPCM (algorithme d'Euclide, Bézout, théorème de Gauss). Nombres premiers, décomposition en facteurs premiers, corps ℤ/pℤ.",
        },
        {
          titre: "Nombres complexes",
          description:
            "Corps ℂ : formes algébrique, trigonométrique et exponentielle (z = re^iθ), conjugué, module, argument. Représentation géométrique, affixe. Formules de Moivre et d'Euler, linéarisation, racines n-ièmes. Interprétation géométrique (distances, angles, alignement, cocyclicité). Équations du 2nd et 3e degré dans ℂ.",
        },
      ],
    },
    {
      titre: "Géométrie plane",
      volumeHoraire: 60,
      chapitres: [
        {
          titre: "Calculs barycentriques",
          description:
            "Barycentre de n points : définition et propriétés. Lignes de niveau, fonction scalaire de Leibniz, formules réduites des expressions vectorielles et scalaires.",
        },
        {
          titre: "Applications affines du plan",
          description:
            "Généralités : application affine, application linéaire associée, matrice. Isométries affines (translations, symétries, rotations, symétrie glissée) et leur classification. Similitudes directes et indirectes : caractérisation, application complexe associée, éléments caractéristiques.",
        },
        {
          titre: "Coniques",
          description:
            "Définitions géométriques (foyer et directrice). Équations cartésiennes réduites, hyperbole rapportée à ses asymptotes, équations paramétriques. Tangente en un point et représentation graphique d'une conique.",
        },
      ],
    },
    {
      titre: "Géométrie dans l'espace",
      volumeHoraire: 32,
      chapitres: [
        {
          titre: "Applications affines de l'espace",
          description:
            "Translation, homothétie, symétrie orthogonale (par rapport à un plan ou une droite), rotation, vissage. Isométries de l'espace et leur classification à partir des points invariants. Applications à l'alignement, au parallélisme et à l'orthogonalité.",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 68,
      chapitres: [
        {
          titre: "Suites numériques",
          description:
            "Raisonnement par récurrence. Convergence et divergence, suites majorées/minorées et monotones. Suites de la forme uₙ₊₁ = f(uₙ) et uₙ₊₁ = a·uₙ + b·uₙ₋₁. Théorèmes de comparaison (encadrement, gendarmes).",
        },
        {
          titre: "Fonctions logarithmes",
          description:
            "Logarithme népérien (défini comme primitive de 1/x s'annulant en 1) : propriétés, dérivée, limites, représentation. Logarithme de base a (logₐx = ln x / ln a), cas du logarithme décimal.",
        },
        {
          titre: "Propriétés des fonctions continues ou dérivables",
          description:
            "Théorème des valeurs intermédiaires, image d'un intervalle. Fonction réciproque. Dérivée d'une composée et de la réciproque d'une bijection. Notations df/dx, d²f/dx².",
        },
        {
          titre: "Fonctions exponentielles",
          description:
            "Exponentielle de base e : propriétés, dérivée de e^u(x), limites usuelles. Exponentielle de base a (ax = e^(x·ln a)), réciproque du logarithme de base a. Étude et représentation.",
        },
        {
          titre: "Exemples d'étude de fonctions",
          description:
            "Résolution graphique d'équations et d'inéquations, point d'inflexion, directions asymptotiques, position par rapport aux asymptotes et à la tangente. Fonctions rationnelles, irrationnelles, trigonométriques, logarithmiques et exponentielles. Encadrements et approximation d'un zéro.",
        },
        {
          titre: "Calcul intégral",
          description:
            "Intégrale d'une fonction continue : relation de Chasles, linéarité, positivité, inégalité de la moyenne, valeur moyenne. Techniques (primitivation, changement de variable affine, intégration par parties). Applications : encadrements, calcul d'aires et de volumes.",
        },
        {
          titre: "Équations différentielles",
          description:
            "Équations différentielles simples (y' = ay, y'' + ω²y = 0 et cas s'y ramenant), résolution et conditions initiales.",
        },
        {
          titre: "Probabilités sur un ensemble fini",
          description:
            "Vocabulaire, calcul par dénombrement, propriétés. Probabilité conditionnelle (formule de Bayes, probabilité totale). Événements indépendants, produit d'espaces probabilisés finis.",
        },
        {
          titre: "Variables aléatoires",
          description:
            "Notion de variable aléatoire réelle. Loi de probabilité : espérance, variance, écart-type. Fonction de répartition. Loi binomiale, schéma de Bernoulli, épreuves répétées.",
        },
        {
          titre: "Statistiques",
          description:
            "Séries à deux variables : point moyen, droites de régression, coefficient de corrélation et son interprétation.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/physique_tleC_statique.ts (fourni par la personne
 * à l'origine de cette tâche). */
const PROGRAMME_PHYSIQUE_TLE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Mécanique",
      volumeHoraire: 38,
      chapitres: [
        {
          titre: "Cinématique",
          description:
            "Étude du mouvement d'un point : vecteurs position, vitesse et accélération. Mouvements rectilignes (uniforme, uniformément varié) et circulaires. Repère de Frenet, base intrinsèque. Équations horaires et trajectoires.",
        },
        {
          titre: "Mouvement du centre d'inertie",
          description:
            "Relation fondamentale de la dynamique (théorème du centre d'inertie), système et forces extérieures. Applications aux mouvements de translation et à la détermination des équations du mouvement.",
        },
        {
          titre: "Mouvement dans le champ de pesanteur",
          description:
            "Chute libre et mouvement d'un projectile dans le champ de pesanteur uniforme. Équations horaires, trajectoire parabolique, portée et flèche.",
        },
        {
          titre: "Mouvement de particules chargées",
          description:
            "Mouvement d'une particule chargée dans un champ électrique uniforme (accélération, déviation) et dans un champ magnétique. Applications (oscilloscope, accélérateurs).",
        },
        {
          titre: "Oscillateurs mécaniques",
          description:
            "Oscillateur mécanique (pendule élastique, pendule simple). Équation différentielle du mouvement, période propre, énergie de l'oscillateur. Oscillations libres.",
        },
      ],
    },
    {
      titre: "Vibration et propagation (ondes)",
      volumeHoraire: 32,
      chapitres: [
        {
          titre: "Généralités sur les ondes",
          description:
            "Notion d'onde mécanique, onde progressive, transversale et longitudinale. Célérité, propagation d'une perturbation.",
        },
        {
          titre: "Propagation d'un mouvement vibratoire",
          description:
            "Onde progressive sinusoïdale : période, fréquence, longueur d'onde, relation λ = v·T. Équation d'une onde, notion de phase.",
        },
        {
          titre: "Superposition de deux ondes",
          description: "Superposition de deux mouvements vibratoires, ondes stationnaires. Nœuds et ventres.",
        },
        {
          titre: "Interférences et diffraction d'ondes",
          description:
            "Interférences d'ondes mécaniques et lumineuses (conditions, franges). Diffraction de la lumière. Nature ondulatoire de la lumière.",
        },
      ],
    },
    {
      titre: "Électromagnétisme",
      volumeHoraire: 22,
      chapitres: [
        {
          titre: "Champ magnétique",
          description:
            "Champ magnétique créé par des courants (fil, bobine, solénoïde). Vecteur champ magnétique, spectres magnétiques.",
        },
        {
          titre: "Force de Lorentz",
          description:
            "Force de Lorentz sur une charge en mouvement dans un champ magnétique. Caractéristiques et applications.",
        },
        {
          titre: "Force de Laplace",
          description:
            "Force de Laplace sur un conducteur parcouru par un courant dans un champ magnétique. Loi de Laplace, applications (moteur, haut-parleur).",
        },
        {
          titre: "Induction électromagnétique",
          description:
            "Phénomène d'induction, flux magnétique, loi de Faraday et loi de Lenz. Force électromotrice induite.",
        },
        {
          titre: "Auto-induction",
          description:
            "Auto-induction, inductance d'une bobine, f.é.m. d'auto-induction. Énergie emmagasinée dans une bobine.",
        },
      ],
    },
    {
      titre: "Oscillations électriques",
      volumeHoraire: 16,
      chapitres: [
        {
          titre: "Circuit oscillant",
          description:
            "Circuit LC et RLC : oscillations électriques libres, équation différentielle, période propre. Amortissement, énergie du circuit oscillant.",
        },
        {
          titre: "Circuit en régime sinusoïdal forcé",
          description:
            "Circuit RLC en régime sinusoïdal forcé : impedance, déphasage, résonance. Construction de Fresnel, puissance.",
        },
      ],
    },
    {
      titre: "Phénomènes corpusculaires",
      volumeHoraire: 18,
      chapitres: [
        {
          titre: "Effet photoélectrique",
          description:
            "Effet photoélectrique, quantum d'énergie, photon. Relation d'Einstein, travail d'extraction, cellule photoélectrique.",
        },
        {
          titre: "Noyau atomique",
          description:
            "Constitution du noyau, énergie de liaison, défaut de masse (relation E = mc²). Stabilité des noyaux.",
        },
        {
          titre: "Réactions nucléaires",
          description:
            "Radioactivité (α, β, γ), lois de conservation, décroissance radioactive et période. Fission et fusion nucléaires, applications et dangers.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/chimie_tleC_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_CHIMIE_TLE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Chimie générale : acides et bases en solution aqueuse",
      volumeHoraire: 16,
      chapitres: [
        {
          titre: "Solutions aqueuses",
          description:
            "Autoprotolyse de l'eau, produit ionique Ke, notion de pH. Solutions acides, basiques et neutres. Mesure du pH.",
        },
        {
          titre: "Solutions aqueuses d'acides et de bases",
          description:
            "Acides forts et faibles, bases fortes et faibles. Calcul de pH, coefficient d'ionisation, constante d'acidité Ka et pKa.",
        },
        {
          titre: "Couples acide-base",
          description:
            "Couples acide-base conjugués, force relative, classification. Diagramme de prédominance, domaines de pH.",
        },
        {
          titre: "Réaction acide-base",
          description:
            "Réaction acide-base, dosage acido-basique, équivalence. Courbe de dosage pH-métrique, indicateurs colorés.",
        },
        {
          titre: "Solutions tampon",
          description:
            "Solutions tampon : préparation, propriétés, pouvoir tampon. Importance biologique et applications.",
        },
      ],
    },
    {
      titre: "Chimie organique",
      volumeHoraire: 14,
      chapitres: [
        {
          titre: "Alcools",
          description:
            "Alcools : structure, nomenclature, classes (primaire, secondaire, tertiaire). Réactions : oxydation ménagée, déshydratation, estérification.",
        },
        {
          titre: "Acides carboxyliques",
          description:
            "Acides carboxyliques et dérivés : structure, nomenclature, propriétés acides. Estérification et hydrolyse, réaction avec les bases.",
        },
      ],
    },
    {
      titre: "Cinétique chimique",
      volumeHoraire: 6,
      chapitres: [
        {
          titre: "Cinétique chimique",
          description:
            "Vitesse de réaction, facteurs cinétiques (concentration, température, catalyseur). Suivi temporel d'une transformation, temps de demi-réaction.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/svt_tleC_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_SVT_TLE_C: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Les processus géologiques à l'origine de l'accumulation des ressources géologiques",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Altération et sédimentation",
          description:
            "Mécanismes d'altération des roches (décomposition chimique, désagrégation mécanique, action biologique). Transport des sédiments, sédimentation et diagenèse. Formation des évaporites (sel de cuisine, gypse). Comparaison granite sain / arène granitique.",
        },
        {
          titre: "Métamorphisme",
          description:
            "Définition du métamorphisme. Métamorphisme de contact et métamorphisme général. Notion de série métamorphique. Diversité des roches métamorphiques selon les facteurs (pression, température) et la nature chimique des roches.",
        },
        {
          titre: "Magmatisme (volcanisme et plutonisme)",
          description:
            "Roches de la famille du granite (granite, rhyolite) et du basalte (basalte, gabbro). Distinction volcanisme / plutonisme. Origine des magmas, structures microlitique et grenue. Roches acides et basiques.",
        },
      ],
    },
    {
      titre: "Quelques ressources géologiques exploitées au Niger",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Les gisements métallifères et les processus associés",
          description:
            "Gisements par cristallisation fractionnée (nickel, cobalt, platine), métamorphisme de contact (fer, cuivre), filoniens (or), altération (bauxite), sédimentation (or, fer, phosphate). Indices de présence des ressources.",
        },
        {
          titre: "Le pétrole",
          description:
            "Conditions et étapes de formation du pétrole (dépôt de matières organiques, enfouissement, maturation, migration). Étapes de la prospection et de l'exploitation. Énergies renouvelables et non renouvelables. Avantages et inconvénients.",
        },
      ],
    },
    {
      titre: "Le fonctionnement des appareils génitaux et leur régulation",
      volumeHoraire: 16,
      chapitres: [
        {
          titre: "Les appareils génitaux et leur fonctionnement",
          description:
            "Organisation des appareils génitaux masculin et féminin. Gonades : structure et fonctions. Gamétogenèse (spermatogenèse et ovogenèse, réinvestissement de la méiose). Production d'hormones sexuelles et activité testiculaire.",
        },
        {
          titre: "Régulation du fonctionnement des organes génitaux",
          description:
            "Cycles sexuels chez la femme (ovarien, utérin, glaire cervicale) et leur régulation par le complexe hypothalamo-hypophysaire. Contrôle hormonal de l'activité testiculaire.",
        },
        {
          titre: "De la fécondation à la nidation",
          description:
            "Fécondation : définition, localisation (tiers supérieur des trompes), étapes. Devenir de l'œuf : migration, premières divisions, nidation. Rôle de l'hormone HCG et maintien de la progestérone en début de grossesse.",
        },
      ],
    },
    {
      titre: "La régulation des naissances",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Les méthodes contraceptives et la stérilité",
          description:
            "Méthodes contraceptives (naturelles, mécaniques, chimiques), mode d'action des pilules et fiabilité. Lien entre connaissance des mécanismes hormonaux et régulation des naissances. Causes de stérilité chez l'homme et la femme.",
        },
      ],
    },
    {
      titre: "La communication par voie humorale",
      volumeHoraire: 8,
      chapitres: [
        {
          titre: "La régulation de la glycémie",
          description:
            "Constante glycémique (≈ 1 g/L), hypoglycémie et hyperglycémie. Organes de stockage (foie, muscles, tissu adipeux), rôle du foie. Systèmes hypo- et hyperglycémiant (insuline, glucagon), autorégulation, homéostasie. Les deux types de diabète et leur origine.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/maths_tleD_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_MATHS_TLE_D: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Organisation des calculs — Calculs numériques",
      volumeHoraire: 24,
      chapitres: [
        {
          titre: "Nombres complexes",
          description:
            "Corps ℂ : formes algébrique, trigonométrique et exponentielle (z = re^iθ), conjugué, module, argument. Représentation géométrique, affixe. Formules de Moivre et d'Euler. Racines n-ièmes. Interprétation géométrique (distances, angles, alignement, cocyclicité). Équations du 2nd degré dans ℂ.",
        },
      ],
    },
    {
      titre: "Applications affines du plan",
      volumeHoraire: 9,
      chapitres: [
        {
          titre: "Similitudes planes directes",
          description:
            "Similitudes planes directes : définition, caractérisation, application complexe associée, éléments caractéristiques (centre, rapport, angle). Construction des images de figures simples.",
        },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 123,
      chapitres: [
        {
          titre: "Suites numériques",
          description:
            "Raisonnement par récurrence. Convergence et divergence, suites majorées/minorées et monotones. Suites de la forme uₙ₊₁ = f(uₙ). Théorèmes de comparaison (encadrement, gendarmes).",
        },
        {
          titre: "Fonctions logarithmes",
          description:
            "Logarithme népérien (primitive de 1/x s'annulant en 1) : propriétés, dérivée, limites, représentation. Logarithme de base a, cas du logarithme décimal.",
        },
        {
          titre: "Propriétés des fonctions continues ou dérivables",
          description:
            "Théorème des valeurs intermédiaires, image d'un intervalle. Fonction réciproque. Dérivée d'une composée et de la réciproque d'une bijection. Notations df/dx, d²f/dx².",
        },
        {
          titre: "Fonction exponentielle",
          description:
            "Exponentielle de base e : propriétés, dérivée de e^u(x), limites usuelles. Exponentielle de base a (ax = e^(x·ln a)). Étude et représentation.",
        },
        {
          titre: "Exemples d'étude de fonctions",
          description:
            "Résolution graphique d'équations et d'inéquations, point d'inflexion, asymptotes et position de la courbe. Fonctions rationnelles, irrationnelles, trigonométriques, logarithmiques et exponentielles. Encadrements et approximation d'un zéro.",
        },
        {
          titre: "Calcul intégral",
          description:
            "Intégrale d'une fonction continue : relation de Chasles, linéarité, positivité, inégalité de la moyenne, valeur moyenne. Techniques (primitivation, changement de variable affine, intégration par parties). Applications : encadrements, calcul d'aires et de volumes.",
        },
        {
          titre: "Équations différentielles",
          description:
            "Équations différentielles simples (y' = ay, y'' + ω²y = 0 et cas s'y ramenant), résolution et conditions initiales.",
        },
        {
          titre: "Probabilités sur un ensemble fini",
          description:
            "Vocabulaire, calcul par dénombrement, propriétés. Probabilité conditionnelle (probabilité totale). Événements indépendants.",
        },
        {
          titre: "Variables aléatoires",
          description:
            "Notion de variable aléatoire réelle. Loi de probabilité : espérance, variance, écart-type. Fonction de répartition. Loi binomiale, schéma de Bernoulli.",
        },
        {
          titre: "Séries statistiques à deux variables",
          description:
            "Nuage de points, point moyen, droites de régression, coefficient de corrélation et son interprétation.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/physique_tleD_statique.ts (fourni par la personne
 * à l'origine de cette tâche). */
const PROGRAMME_PHYSIQUE_TLE_D: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Mécanique",
      volumeHoraire: 28,
      chapitres: [
        {
          titre: "Cinématique",
          description:
            "Étude du mouvement d'un point : vecteurs position, vitesse et accélération. Mouvements rectilignes (uniforme, uniformément varié) et circulaires. Repère de Frenet. Équations horaires et trajectoires.",
        },
        {
          titre: "Mouvement du centre d'inertie",
          description:
            "Relation fondamentale de la dynamique (théorème du centre d'inertie), système et forces extérieures. Applications aux mouvements de translation.",
        },
        {
          titre: "Mouvement dans le champ de pesanteur",
          description:
            "Chute libre et mouvement d'un projectile dans le champ de pesanteur uniforme. Équations horaires, trajectoire parabolique, portée et flèche.",
        },
        {
          titre: "Mouvement de particules chargées",
          description:
            "Mouvement d'une particule chargée dans un champ électrique uniforme (accélération, déviation) et dans un champ magnétique. Applications.",
        },
        {
          titre: "Oscillateurs mécaniques",
          description:
            "Oscillateur mécanique (pendule élastique, pendule simple). Équation différentielle, période propre, énergie de l'oscillateur. Oscillations libres.",
        },
      ],
    },
    {
      titre: "Vibration et propagation (ondes)",
      volumeHoraire: 23,
      chapitres: [
        {
          titre: "Généralités sur les ondes",
          description: "Onde mécanique, onde progressive, transversale et longitudinale. Célérité, propagation d'une perturbation.",
        },
        {
          titre: "Propagation d'un mouvement vibratoire",
          description:
            "Onde progressive sinusoïdale : période, fréquence, longueur d'onde (λ = v·T). Équation d'une onde, phase.",
        },
        {
          titre: "Superposition de deux ondes",
          description: "Superposition de deux mouvements vibratoires, ondes stationnaires, nœuds et ventres.",
        },
        {
          titre: "Interférences et diffraction d'ondes",
          description:
            "Interférences d'ondes mécaniques et lumineuses, diffraction de la lumière, nature ondulatoire de la lumière.",
        },
      ],
    },
    {
      titre: "Électromagnétisme",
      volumeHoraire: 25,
      chapitres: [
        {
          titre: "Champ magnétique",
          description: "Champ magnétique créé par des courants (fil, bobine, solénoïde). Vecteur champ magnétique, spectres.",
        },
        {
          titre: "Force de Lorentz",
          description:
            "Force de Lorentz sur une charge en mouvement dans un champ magnétique. Caractéristiques et applications.",
        },
        {
          titre: "Force de Laplace",
          description:
            "Force de Laplace sur un conducteur parcouru par un courant. Loi de Laplace, applications (moteur, haut-parleur).",
        },
        {
          titre: "Induction électromagnétique",
          description:
            "Phénomène d'induction, flux magnétique, loi de Faraday et loi de Lenz. Force électromotrice induite.",
        },
        {
          titre: "Auto-induction",
          description: "Auto-induction, inductance d'une bobine, f.é.m. d'auto-induction, énergie emmagasinée.",
        },
      ],
    },
    {
      titre: "Oscillations électriques",
      volumeHoraire: 9,
      chapitres: [
        {
          titre: "Circuit oscillant LC",
          description:
            "Circuit LC et RLC : oscillations libres, équation différentielle, période propre. Amortissement, énergie.",
        },
        {
          titre: "Circuit en régime sinusoïdal forcé",
          description:
            "Circuit RLC en régime sinusoïdal forcé : impédance, déphasage, résonance. Construction de Fresnel, puissance.",
        },
      ],
    },
    {
      titre: "Phénomènes corpusculaires",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Effet photoélectrique",
          description:
            "Effet photoélectrique, quantum d'énergie, photon. Relation d'Einstein, travail d'extraction, cellule photoélectrique.",
        },
        {
          titre: "Noyau atomique",
          description: "Constitution du noyau, énergie de liaison, défaut de masse (E = mc²), stabilité des noyaux.",
        },
        {
          titre: "Réactions nucléaires",
          description:
            "Radioactivité (α, β, γ), lois de conservation, décroissance et période. Fission et fusion nucléaires, applications et dangers.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/chimie_tleD_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_CHIMIE_TLE_D: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Chimie générale : acides et bases en solution aqueuse",
      volumeHoraire: 16,
      chapitres: [
        {
          titre: "Solutions aqueuses",
          description:
            "Autoprotolyse de l'eau, produit ionique Ke, notion de pH. Solutions acides, basiques et neutres. Mesure du pH.",
        },
        {
          titre: "Solutions aqueuses d'acides et de bases",
          description:
            "Acides forts et faibles, bases fortes et faibles. Calcul de pH, coefficient d'ionisation, constante d'acidité Ka et pKa.",
        },
        {
          titre: "Couples acide-base",
          description:
            "Couples acide-base conjugués, force relative, classification. Diagramme de prédominance, domaines de pH.",
        },
        {
          titre: "Réaction acide-base",
          description:
            "Réaction acide-base, dosage acido-basique, équivalence. Courbe de dosage pH-métrique, indicateurs colorés.",
        },
        {
          titre: "Solutions tampon",
          description: "Solutions tampon : préparation, propriétés, pouvoir tampon, importance biologique.",
        },
      ],
    },
    {
      titre: "Chimie organique",
      volumeHoraire: 24,
      chapitres: [
        {
          titre: "Alcools",
          description: "Alcools : structure, nomenclature, classes. Réactions : oxydation ménagée, déshydratation, estérification.",
        },
        {
          titre: "Acides carboxyliques",
          description:
            "Acides carboxyliques et dérivés : structure, nomenclature, propriétés acides. Estérification et hydrolyse.",
        },
        {
          titre: "Amines",
          description:
            "Amines : structure, nomenclature, classes (primaire, secondaire, tertiaire). Caractère basique et réactions.",
        },
        {
          titre: "Acides aminés",
          description:
            "Acides α-aminés : structure, propriétés (caractère amphotère, zwitterion), chiralité. Liaison peptidique et introduction aux protéines.",
        },
      ],
    },
  ],
};

/** RÉEL — repris de lib/svt_tleD_statique.ts (fourni par la personne à
 * l'origine de cette tâche). */
const PROGRAMME_SVT_TLE_D: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Le support de l'information génétique",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Notion de l'information génétique",
          description:
            "Localisation de l'information génétique (noyau, chromosomes). Notion de gène, de génome. Mise en évidence du rôle du noyau (expériences de transplantation nucléaire).",
        },
        {
          titre: "Nature chimique et structure de l'ADN",
          description:
            "Structure de la molécule d'ADN (double hélice, nucléotides, bases azotées, complémentarité). Universalité de la molécule. Le code génétique.",
        },
      ],
    },
    {
      titre: "La transmission de l'information génétique",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "La reproduction conforme (mitose)",
          description:
            "Réplication de l'ADN (semi-conservative). Mitose : étapes, conservation du caryotype. Reproduction conforme de la cellule.",
        },
        {
          titre: "Notion de cycle cellulaire",
          description:
            "Cycle cellulaire : interphase (G1, S, G2) et mitose. Variation de la quantité d'ADN au cours du cycle. Régulation du cycle.",
        },
      ],
    },
    {
      titre: "L'expression de l'information génétique dans la cellule",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Protéines",
          description:
            "Structure et diversité des protéines (acides aminés, structures primaire à quaternaire). Relation entre protéines et caractères de l'organisme.",
        },
        {
          titre: "Mécanismes de l'expression génétique",
          description:
            "Transcription (ADN → ARN messager) et traduction (ARN → protéine). Code génétique, rôle des ARN de transfert et des ribosomes. Relation gène-protéine-caractère.",
        },
      ],
    },
    {
      titre: "Reproduction sexuée et brassage génétique",
      volumeHoraire: 24,
      chapitres: [
        {
          titre: "Reproduction sexuée et méiose",
          description:
            "Méiose : étapes, réduction chromatique, formation des gamètes. Fécondation et rétablissement de la diploïdie. Stabilité du caryotype de l'espèce.",
        },
        {
          titre: "Brassage des gènes",
          description:
            "Brassage intrachromosomique (crossing-over) et interchromosomique lors de la méiose. Diversité génétique des gamètes et des individus. Échiquier de croisement.",
        },
      ],
    },
    {
      titre: "Hérédité et génétique humaine",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Transmission des caractères héréditaires",
          description:
            "Lois de Mendel, monohybridisme et dihybridisme. Transmission autosomale et liée au sexe. Cartes factorielles, arbres généalogiques.",
        },
        {
          titre: "Anomalies génétiques",
          description:
            "Mutations géniques et chromosomiques. Maladies héréditaires (drépanocytose, hémophilie, daltonisme) et anomalies du caryotype (trisomie 21). Conseil génétique.",
        },
      ],
    },
    {
      titre: "Communication par voies nerveuse et humorale",
      volumeHoraire: 30,
      chapitres: [
        {
          titre: "Tissu nerveux et notions de réflexes",
          description:
            "Organisation du système nerveux, structure du neurone. Réflexes innés et conditionnés, arc réflexe. Propriétés du tissu nerveux.",
        },
        {
          titre: "Messages nerveux",
          description:
            "Potentiel de repos et potentiel d'action. Propagation du message nerveux, synapses et transmission synaptique, plaque motrice. Codage du message.",
        },
        {
          titre: "La glycémie",
          description:
            "Régulation de la glycémie : constante glycémique, rôle du foie et du pancréas (insuline, glucagon), homéostasie. Les deux types de diabète. Communication humorale.",
        },
      ],
    },
    {
      titre: "Fonctionnement des appareils génitaux et leur régulation",
      volumeHoraire: 15,
      chapitres: [
        {
          titre: "Les appareils génitaux et leur fonctionnement",
          description:
            "Organisation des appareils génitaux. Gonades, gamétogenèse (spermatogenèse, ovogenèse), production d'hormones sexuelles, activité testiculaire.",
        },
        {
          titre: "Régulation du fonctionnement des organes génitaux",
          description:
            "Cycles sexuels chez la femme (ovarien, utérin) et leur régulation par le complexe hypothalamo-hypophysaire. Contrôle hormonal de l'activité testiculaire.",
        },
        {
          titre: "De la fécondation à la nidation",
          description:
            "Fécondation : localisation, étapes. Devenir de l'œuf : migration, divisions, nidation. Rôle de l'HCG et maintien de la grossesse.",
        },
      ],
    },
    {
      titre: "Régulation des naissances",
      volumeHoraire: 4,
      chapitres: [
        {
          titre: "Les méthodes contraceptives et la stérilité",
          description:
            "Méthodes contraceptives (naturelles, mécaniques, chimiques), mode d'action des pilules. Causes de stérilité chez l'homme et la femme, procréation médicalement assistée.",
        },
      ],
    },
    {
      titre: "Mécanismes de l'immunité",
      volumeHoraire: 12,
      chapitres: [
        {
          titre: "Le soi et le non-soi",
          description: "Notion de soi et de non-soi, marqueurs du soi (système HLA). Reconnaissance de l'étranger (antigènes).",
        },
        {
          titre: "Les réponses immunitaires",
          description:
            "Immunité non spécifique (inflammation, phagocytose) et spécifique. Réponse humorale (anticorps, lymphocytes B) et cellulaire (lymphocytes T). Mémoire immunitaire, vaccination.",
        },
        {
          titre: "Le dysfonctionnement du système immunitaire : le SIDA",
          description:
            "Le VIH et son action sur les lymphocytes T4. Phases de l'infection, séropositivité et SIDA. Effondrement des défenses immunitaires, prévention.",
        },
      ],
    },
  ],
};

/**
 * Pour chaque série de chaque niveau, les matières RÉELLEMENT enseignées à
 * ce niveau — d'où `Partial<Record<...>>` plutôt qu'un Record complet :
 * la Terminale A (littéraire) n'a QUE les Mathématiques comme matière
 * scientifique (pas de Physique/Chimie/SVT), contrairement à toutes les
 * autres combinaisons niveau×série qui ont les 4. La liste affichée à
 * l'écran (matieresDisponiblesLycee) et le 404 d'une matière absente
 * (obtenirProgrammeLycee renvoie alors undefined) découlent directement
 * des clés présentes ici — jamais d'une liste fixe.
 *
 * Cas Seconde D (n'existe pas, voir SERIES_PAR_NIVEAU) : Record<SerieLyceeId, ...>
 * exige TOUTES les clés en TypeScript, cette entrée reste donc un objet vide
 * ({} — valide grâce à Partial), simplement inaccessible depuis la
 * navigation (trouverSerieLycee la rejette).
 */
const PROGRAMMES_PAR_NIVEAU: Record<
  NiveauLyceeId,
  Record<SerieLyceeId, Partial<Record<MatiereLyceeId, ProgrammeMatiereStatique>>>
> = {
  seconde: {
    a: {
      mathematiques: PROGRAMME_MATHS_2NDE_A,
      physique: PROGRAMME_PHYSIQUE_2NDE_A,
      chimie: PROGRAMME_CHIMIE_2NDE_A,
      svt: PROGRAMME_SVT_2NDE_A,
    },
    c: {
      mathematiques: PROGRAMME_MATHS_2NDE_C,
      physique: PROGRAMME_PHYSIQUE_2NDE_C,
      chimie: PROGRAMME_CHIMIE_2NDE_C,
      svt: PROGRAMME_SVT_2NDE_C,
    },
    d: {},
  },
  premiere: {
    a: {
      mathematiques: PROGRAMME_MATHS_1RE_A,
      physique: PROGRAMME_PHYSIQUE_1RE_A,
      chimie: PROGRAMME_CHIMIE_1RE_A,
      svt: PROGRAMME_SVT_1RE_A,
    },
    c: {
      mathematiques: PROGRAMME_MATHS_1RE_C,
      physique: PROGRAMME_PHYSIQUE_1RE_C,
      chimie: PROGRAMME_CHIMIE_1RE_C,
      svt: PROGRAMME_SVT_1RE_C,
    },
    d: {
      mathematiques: PROGRAMME_MATHS_1RE_D,
      physique: PROGRAMME_PHYSIQUE_1RE_D,
      chimie: PROGRAMME_CHIMIE_1RE_D,
      svt: PROGRAMME_SVT_1RE_D,
    },
  },
  terminale: {
    a: { mathematiques: PROGRAMME_MATHS_TLE_A },
    c: {
      mathematiques: PROGRAMME_MATHS_TLE_C,
      physique: PROGRAMME_PHYSIQUE_TLE_C,
      chimie: PROGRAMME_CHIMIE_TLE_C,
      svt: PROGRAMME_SVT_TLE_C,
    },
    d: {
      mathematiques: PROGRAMME_MATHS_TLE_D,
      physique: PROGRAMME_PHYSIQUE_TLE_D,
      chimie: PROGRAMME_CHIMIE_TLE_D,
      svt: PROGRAMME_SVT_TLE_D,
    },
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

/** Matières réellement enseignées pour ce niveau×série (4 pour la grande
 * majorité des combinaisons, 1 seule — Mathématiques — pour Terminale A).
 * Dérivée des clés présentes dans PROGRAMMES_PAR_NIVEAU, jamais d'une
 * liste fixe : c'est ce qui pilote le nombre de cartes affichées au
 * niveau 3 du parcours (choix de la matière). */
export function matieresDisponiblesLycee(
  niveauId: NiveauLyceeId,
  serieId: SerieLyceeId
): readonly MatiereLycee[] {
  const programmes = PROGRAMMES_PAR_NIVEAU[niveauId][serieId];
  return MATIERES_LYCEE.filter((matiere) => programmes[matiere.id] !== undefined);
}

/** undefined si la matière n'est pas enseignée pour ce niveau×série (ex.
 * Physique en Terminale A) — au niveau 4 du parcours, ce cas doit se
 * traduire par un 404, jamais par un placeholder. */
export function obtenirProgrammeLycee(
  niveauId: NiveauLyceeId,
  serieId: SerieLyceeId,
  matiereId: MatiereLyceeId
): ProgrammeMatiereStatique | undefined {
  return PROGRAMMES_PAR_NIVEAU[niveauId][serieId][matiereId];
}
