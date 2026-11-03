/**
 * Téléphone en deux parties (indicatif + numéro national) pour les formulaires
 * d'authentification. Le backend n'accepte aujourd'hui QUE « +227 » suivi de
 * 8 chiffres (voir comptes/models.py) : le numéro complet envoyé à l'API est
 * donc exactement celui déjà stocké pour les comptes existants.
 */

export interface PaysTelephone {
  /** Code ISO 3166-1 alpha-2. */
  code: string;
  nom: string;
  /** Indicatif avec « + ». */
  indicatif: string;
  /** true seulement si le backend sait valider et authentifier ce pays. */
  actif: boolean;
}

/**
 * Pays de l'UEMOA, préparés pour une ouverture ultérieure. Seul le Niger est
 * actif : tant que le backend ne valide pas les autres indicatifs, ils ne
 * doivent PAS être proposés à l'utilisateur.
 */
export const PAYS_UEMOA: readonly PaysTelephone[] = [
  { code: "BJ", nom: "Bénin", indicatif: "+229", actif: false },
  { code: "BF", nom: "Burkina Faso", indicatif: "+226", actif: false },
  { code: "CI", nom: "Côte d'Ivoire", indicatif: "+225", actif: false },
  { code: "GW", nom: "Guinée-Bissau", indicatif: "+245", actif: false },
  { code: "ML", nom: "Mali", indicatif: "+223", actif: false },
  { code: "NE", nom: "Niger", indicatif: "+227", actif: true },
  { code: "SN", nom: "Sénégal", indicatif: "+221", actif: false },
  { code: "TG", nom: "Togo", indicatif: "+228", actif: false },
];

export const PAYS_PAR_DEFAUT: PaysTelephone = PAYS_UEMOA.find((p) => p.code === "NE")!;

/**
 * Chiffres du numéro national à partir de la saisie. Tolère un numéro collé
 * avec son indicatif (« +227 90 00 00 00 », « 00227… », « 227… » complet) pour
 * ne jamais produire de double préfixe. Espaces, points et tirets ignorés.
 */
export function chiffresNationaux(saisie: string, pays: PaysTelephone = PAYS_PAR_DEFAUT): string {
  const brut = saisie.trim();
  let chiffres = brut.replace(/\D/g, "");
  const indicatif = pays.indicatif.replace(/\D/g, "");

  if (chiffres.startsWith(`00${indicatif}`)) {
    chiffres = chiffres.slice(2 + indicatif.length);
  } else if (brut.startsWith("+") && chiffres.startsWith(indicatif)) {
    chiffres = chiffres.slice(indicatif.length);
  } else if (chiffres.startsWith(indicatif) && chiffres.length === indicatif.length + 8) {
    // « 22790000000 » : 11 chiffres dont l'indicatif en tête.
    chiffres = chiffres.slice(indicatif.length);
  }
  return chiffres;
}

/**
 * Numéro complet au format attendu par le backend (« +22790000000 »).
 * Chaîne vide si rien n'a été saisi : la validation « champ obligatoire »
 * reste ainsi celle des formulaires.
 */
export function construireTelephone(saisie: string, pays: PaysTelephone = PAYS_PAR_DEFAUT): string {
  const chiffres = chiffresNationaux(saisie, pays);
  return chiffres ? `${pays.indicatif}${chiffres}` : "";
}

/** Regex de validation du numéro complet, identique à celle du backend pour le Niger. */
export const TELEPHONE_RE = /^\+227\d{8}$/;
