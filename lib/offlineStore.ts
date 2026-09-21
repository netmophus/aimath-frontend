/**
 * Stockage hors-ligne des leçons — COUCHE 2 du PWA fahimtana.
 *
 * Choix technique : IndexedDB via l'API native du navigateur, sans
 * dépendance externe (pas de lib "idb"). Le projet évite déjà d'ajouter des
 * dépendances quand l'API native suffit (voir components/eleve/icones.tsx) ;
 * un seul object store à clé simple ne justifie pas d'en introduire une —
 * les promesses ci-dessous enveloppent juste IDBRequest/IDBTransaction.
 *
 * Une leçon téléchargée est stockée ENTIÈRE (tout ce que renvoie
 * getLeconEleve) + les définitions du glossaire référencées dans son texte
 * (histoire, cours, démonstrations, à retenir, énoncés et corrigés
 * d'exercices) : de quoi la relire à l'identique sans réseau, y compris ses
 * termes cliquables. Les vidéos restent des liens YouTube externes — hors
 * périmètre du hors-ligne, volontairement non traitées ici.
 */

import { getLeconEleve, getTermeGlossaire, type LeconEleve, type TermeGlossaireEleve } from "./eleveApi";
import { construireContexteLecon, type ContexteLecon } from "./contexteLecon";
import { extraireSlugsGlossaire } from "./glossaireMarqueurs";

const NOM_BASE = "fahimtana-offline";
const VERSION_BASE = 1;
const STORE_LECONS = "lecons";

export interface LeconLocale {
  id: number;
  titreLecon: string;
  contexte: ContexteLecon;
  contenuComplet: LeconEleve;
  /** Définitions des termes [[slug]] référencés dans le contenu de cette
   * leçon, indexées par slug — un terme supprimé entre-temps ou en erreur au
   * moment du téléchargement est simplement absent ici (voir telechargerLecon). */
  termesGlossaire: Record<string, TermeGlossaireEleve>;
  /** Date ISO du (dernier) téléchargement. */
  telechargeLe: string;
}

function ouvrirBase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Le stockage hors-ligne n'est pas disponible sur cet appareil."));
      return;
    }

    const requete = indexedDB.open(NOM_BASE, VERSION_BASE);

    requete.onupgradeneeded = () => {
      const db = requete.result;
      if (!db.objectStoreNames.contains(STORE_LECONS)) {
        db.createObjectStore(STORE_LECONS, { keyPath: "id" });
      }
    };

    requete.onsuccess = () => resolve(requete.result);
    requete.onerror = () => reject(requete.error ?? new Error("Impossible d'ouvrir le stockage hors-ligne."));
  });
}

function promesseRequete<T>(requete: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requete.onsuccess = () => resolve(requete.result);
    requete.onerror = () => reject(requete.error ?? new Error("Erreur de stockage hors-ligne."));
  });
}

/** Réunit tous les champs texte d'une leçon (Markdown) où un [[slug]] peut apparaître. */
function textesDeLaLecon(lecon: LeconEleve): string[] {
  return [
    lecon.histoire,
    lecon.objectifs_pedagogiques,
    lecon.prerequis_texte,
    lecon.cours_redige,
    lecon.demonstrations,
    lecon.a_retenir,
    ...lecon.exercices.flatMap((exercice) => [exercice.enonce, exercice.corrige]),
  ];
}

/**
 * Télécharge une leçon pour lecture hors-ligne : récupère son contenu
 * complet, précharge les définitions de tous les termes de glossaire qu'elle
 * référence, puis enregistre le tout dans IndexedDB.
 *
 * L'échec de l'appel réseau initial (getLeconEleve) est propagé tel quel à
 * l'appelant (voir BoutonTelecharger, qui l'affiche en toast) — en revanche
 * l'échec d'UN terme de glossaire (terme supprimé → 404, ou aléa réseau
 * ponctuel) est ignoré individuellement : il redeviendra simplement non
 * cliquable côté lecture hors-ligne (voir RenduMarkdown), sans jamais faire
 * échouer le téléchargement de la leçon entière pour un seul terme cassé.
 */
export async function telechargerLecon(id: number): Promise<void> {
  const lecon = await getLeconEleve(id);

  const slugs = extraireSlugsGlossaire(textesDeLaLecon(lecon));
  const resultats = await Promise.allSettled(slugs.map((slug) => getTermeGlossaire(slug)));

  const termesGlossaire: Record<string, TermeGlossaireEleve> = {};
  resultats.forEach((resultat, index) => {
    if (resultat.status === "fulfilled") {
      termesGlossaire[slugs[index]] = resultat.value;
    }
  });

  const enregistrement: LeconLocale = {
    id: lecon.id,
    titreLecon: lecon.titre,
    contexte: construireContexteLecon(lecon.notion),
    contenuComplet: lecon,
    termesGlossaire,
    telechargeLe: new Date().toISOString(),
  };

  const db = await ouvrirBase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_LECONS, "readwrite");
      transaction.objectStore(STORE_LECONS).put(enregistrement);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => {
        const erreur = transaction.error;
        reject(
          erreur?.name === "QuotaExceededError"
            ? new Error("Stockage plein : impossible de télécharger cette leçon. Libère de l'espace et réessaie.")
            : erreur ?? new Error("Impossible d'enregistrer cette leçon hors-ligne.")
        );
      };
    });
  } finally {
    db.close();
  }
}

/** Lit une leçon stockée localement, ou null si absente ou si le stockage
 * hors-ligne est indisponible (jamais une erreur bloquante ici : le repli
 * "pas disponible hors-ligne" est géré par l'appelant). */
export async function getLeconLocale(id: number): Promise<LeconLocale | null> {
  try {
    const db = await ouvrirBase();
    try {
      const transaction = db.transaction(STORE_LECONS, "readonly");
      const resultat = await promesseRequete(transaction.objectStore(STORE_LECONS).get(id));
      return (resultat as LeconLocale | undefined) ?? null;
    } finally {
      db.close();
    }
  } catch {
    return null;
  }
}

/** Lit la définition stockée d'un terme pour une leçon donnée (ou null). */
export async function getTermeLocal(id: number, slug: string): Promise<TermeGlossaireEleve | null> {
  const locale = await getLeconLocale(id);
  return locale?.termesGlossaire[slug] ?? null;
}

/** Liste les leçons téléchargées, les plus récentes d'abord — pour l'espace
 * "Mes leçons téléchargées" (app/eleve/telechargees). */
export async function listerLeconsTelechargees(): Promise<LeconLocale[]> {
  try {
    const db = await ouvrirBase();
    try {
      const transaction = db.transaction(STORE_LECONS, "readonly");
      const resultat = await promesseRequete(transaction.objectStore(STORE_LECONS).getAll());
      const liste = (resultat as LeconLocale[] | undefined) ?? [];
      return [...liste].sort((a, b) => b.telechargeLe.localeCompare(a.telechargeLe));
    } finally {
      db.close();
    }
  } catch {
    return [];
  }
}

/** Ensemble des identifiants de leçons téléchargées — pratique pour afficher
 * un badge "hors-ligne" sur plusieurs notions à la fois (programme élève)
 * sans relire IndexedDB une fois par notion. */
export async function listerIdsTelecharges(): Promise<Set<number>> {
  const liste = await listerLeconsTelechargees();
  return new Set(liste.map((lecon) => lecon.id));
}

/** Retire une leçon du stockage hors-ligne. */
export async function supprimerLeconLocale(id: number): Promise<void> {
  const db = await ouvrirBase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_LECONS, "readwrite");
      transaction.objectStore(STORE_LECONS).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Impossible de supprimer ce téléchargement."));
    });
  } finally {
    db.close();
  }
}

/** Une leçon est-elle disponible hors-ligne ? */
export async function estTelechargee(id: number): Promise<boolean> {
  return (await getLeconLocale(id)) !== null;
}
