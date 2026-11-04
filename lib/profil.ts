import type { GenreEleve, MajProfilEleveInput, ProfilEleve } from "@/lib/eleveApi";

export interface ValeursProfil {
  dateNaissance: string;
  ecole: string;
  ville: string;
  genre: GenreEleve | "";
}

/**
 * Seuls les champs réellement modifiés par l'élève sont envoyés : un champ resté identique à ce que le serveur a
 * renvoyé n'est jamais réécrit (pas d'écrasement par une valeur ancienne, pas de date vide envoyée par erreur).
 */
export function champsModifies(profil: ProfilEleve, valeurs: ValeursProfil, photo: File | null): MajProfilEleveInput {
  const modifs: MajProfilEleveInput = {};
  if (valeurs.dateNaissance !== (profil.date_naissance ?? "")) modifs.date_naissance = valeurs.dateNaissance;
  if (valeurs.ecole !== (profil.ecole ?? "")) modifs.ecole = valeurs.ecole;
  if (valeurs.ville !== (profil.ville ?? "")) modifs.ville = valeurs.ville;
  if (valeurs.genre !== (profil.genre ?? "")) modifs.genre = valeurs.genre;
  if (photo) modifs.photo = photo;
  return modifs;
}

export function aDesModifications(modifs: MajProfilEleveInput): boolean {
  return Object.keys(modifs).length > 0;
}

export function classeDe(profil: Pick<ProfilEleve, "niveau" | "serie">): string | null {
  if (!profil.niveau) return null;
  return profil.serie ? `${profil.niveau} ${profil.serie}` : profil.niveau;
}

export function initiales(prenom: string, nom: string): string {
  return `${prenom.trim().charAt(0)}${nom.trim().charAt(0)}`.toUpperCase() || "?";
}
