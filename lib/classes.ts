/**
 * Petit helper pour la cascade Cycle → Niveau → Série du formulaire
 * d'inscription (app/register/RegisterForm.tsx).
 *
 * La hiérarchie elle-même n'est PLUS codée en dur ici : elle vient de l'API
 * (lib/api.ts, getClasses() -> GET /api/auth/classes/, public), avec les
 * vrais id de Niveau/Serie attendus par POST /api/auth/register/ — un id
 * texte inventé ("tle", "C"...) aurait fait échouer l'inscription en 400
 * (PrimaryKeyRelatedField attend un entier réel).
 */

import type { ClasseNiveau } from "./api";

/** Un niveau exige une série si sa liste de séries n'est pas vide. */
export function niveauNeedsSerie(niveau: ClasseNiveau | undefined): boolean {
  return Boolean(niveau && niveau.series.length > 0);
}
