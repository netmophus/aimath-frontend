/**
 * Logique pure de l'import en masse du glossaire (aucun accès réseau ni disque).
 *
 * L'import réel passe par l'API admin existante (POST /api/admin/glossaire/) :
 * mêmes validations, mêmes droits, même génération de slug que le formulaire.
 * Ce module ne fait que valider le fichier JSON, prévoir le slug (copie du
 * `django.utils.text.slugify`, utilisé par TermeGlossaire._slug_unique) et
 * décider ce qu'il faut créer. Il ne modifie jamais un terme existant.
 */

export interface EntreeGlossaire {
  terme: string;
  definition: string;
  exemple: string;
}

export interface TermeExistant {
  id: number;
  terme: string;
  slug: string;
  definition: string;
  exemple: string;
  lecon_liee?: { id: number } | null;
}

/** Équivalent de django.utils.text.slugify(valeur) (allow_unicode=False). */
export function slugifyDjango(valeur: string): string {
  const ascii = valeur.normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
  const nettoye = ascii.replace(/[^\w\s-]/g, "").trim().toLowerCase();
  return nettoye.replace(/[-\s]+/g, "-").replace(/^[-_]+|[-_]+$/g, "");
}

/** Clé de comparaison : casse, accents, apostrophes et espaces neutralisés. */
export function cleTerme(terme: string): string {
  return slugifyDjango(terme.replace(/[’‘`´]/g, "'"));
}

export interface ResultatValidation {
  entrees: EntreeGlossaire[];
  erreurs: string[];
}

export function validerFichier(contenu: unknown): ResultatValidation {
  const erreurs: string[] = [];
  const entrees: EntreeGlossaire[] = [];
  if (!Array.isArray(contenu)) {
    return { entrees, erreurs: ["Le fichier doit contenir un tableau JSON d'objets {terme, definition, exemple}."] };
  }
  contenu.forEach((brut, i) => {
    const pos = `Entrée ${i + 1}`;
    if (typeof brut !== "object" || brut === null || Array.isArray(brut)) {
      erreurs.push(`${pos} : objet attendu.`);
      return;
    }
    const o = brut as Record<string, unknown>;
    const terme = o.terme;
    const definition = o.definition;
    const exemple = o.exemple ?? "";
    if (typeof terme !== "string" || !terme.trim()) {
      erreurs.push(`${pos} : « terme » manquant ou vide.`);
      return;
    }
    if (terme.length > 255) erreurs.push(`${pos} (${terme}) : « terme » dépasse 255 caractères.`);
    if (typeof definition !== "string" || !definition.trim()) {
      erreurs.push(`${pos} (${terme}) : « definition » manquante ou vide.`);
      return;
    }
    if (typeof exemple !== "string") {
      erreurs.push(`${pos} (${terme}) : « exemple » doit être une chaîne.`);
      return;
    }
    if (!slugifyDjango(terme)) {
      erreurs.push(`${pos} (${terme}) : aucun slug exploitable ne peut être dérivé de ce terme.`);
      return;
    }
    // Contenu conservé tel quel (Markdown / LaTeX non modifiés).
    entrees.push({ terme, definition, exemple });
  });
  return { entrees, erreurs };
}

export interface DoublonFichier {
  terme: string;
  autre: string;
  cle: string;
}

export interface Plan {
  fournis: number;
  aCreer: Array<EntreeGlossaire & { slugPrevu: string }>;
  dejaPresents: Array<{ entree: EntreeGlossaire; existant: TermeExistant; memeContenu: boolean }>;
  doublonsFichier: DoublonFichier[];
  doublonsBase: Array<{ cle: string; termes: string[] }>;
  differences: Array<{ terme: string; champs: string[] }>;
  /** Slugs prévus qui seraient suffixés (-2, -3…) car déjà pris par un autre terme. */
  collisionsSlug: Array<{ terme: string; slugPrevu: string }>;
}

export function planifierImport(entrees: EntreeGlossaire[], existants: TermeExistant[]): Plan {
  const parCle = new Map<string, TermeExistant[]>();
  const slugsPris = new Set<string>();
  for (const e of existants) {
    slugsPris.add(e.slug);
    const cle = cleTerme(e.terme);
    parCle.set(cle, [...(parCle.get(cle) ?? []), e]);
  }

  const doublonsBase: Plan["doublonsBase"] = [];
  const parCleTerme = new Map<string, string[]>();
  for (const e of existants) {
    const c = cleTerme(e.terme);
    parCleTerme.set(c, [...(parCleTerme.get(c) ?? []), e.terme]);
  }
  for (const [cle, termes] of parCleTerme) if (termes.length > 1) doublonsBase.push({ cle, termes });

  const vus = new Map<string, string>();
  const doublonsFichier: DoublonFichier[] = [];
  const aCreer: Plan["aCreer"] = [];
  const dejaPresents: Plan["dejaPresents"] = [];
  const differences: Plan["differences"] = [];
  const collisionsSlug: Plan["collisionsSlug"] = [];

  for (const entree of entrees) {
    const cle = cleTerme(entree.terme);
    const precedent = vus.get(cle);
    if (precedent !== undefined) {
      doublonsFichier.push({ terme: entree.terme, autre: precedent, cle });
      continue;
    }
    vus.set(cle, entree.terme);

    const trouve = parCle.get(cle)?.[0];
    if (trouve) {
      const champs: string[] = [];
      if (trouve.definition !== entree.definition) champs.push("definition");
      if ((trouve.exemple ?? "") !== entree.exemple) champs.push("exemple");
      dejaPresents.push({ entree, existant: trouve, memeContenu: champs.length === 0 });
      if (champs.length) differences.push({ terme: entree.terme, champs });
      continue;
    }
    const slugPrevu = slugifyDjango(entree.terme);
    if (slugsPris.has(slugPrevu)) collisionsSlug.push({ terme: entree.terme, slugPrevu });
    slugsPris.add(slugPrevu);
    aCreer.push({ ...entree, slugPrevu });
  }

  return { fournis: entrees.length, aCreer, dejaPresents, doublonsFichier, doublonsBase, differences, collisionsSlug };
}

/** Marqueur à écrire dans un cours : [[slug|texte]] (le slug ne contient ni espace ni apostrophe). */
export function marqueurCours(terme: string): string {
  const slug = slugifyDjango(terme);
  return slug === terme ? `[[${slug}]]` : `[[${slug}|${terme}]]`;
}

export function formaterRapport(plan: Plan, mode: "dry-run" | "apply", extra: string[] = []): string {
  const l: string[] = [];
  l.push(`Mode : ${mode === "apply" ? "IMPORTATION RÉELLE" : "test à blanc (aucune écriture)"}`);
  l.push(`Termes fournis (hors doublons du fichier) : ${plan.fournis - plan.doublonsFichier.length} / ${plan.fournis}`);
  l.push(`Déjà présents : ${plan.dejaPresents.length}`);
  l.push(`Manquants (à créer) : ${plan.aCreer.length}`);
  l.push(`Doublons dans le fichier : ${plan.doublonsFichier.length}`);
  l.push(`Doublons déjà en base : ${plan.doublonsBase.length}`);
  l.push(`Différences de contenu avec la base (non modifiées) : ${plan.differences.length}`);
  for (const d of plan.differences) l.push(`  - ${d.terme} : ${d.champs.join(", ")}`);
  for (const d of plan.doublonsFichier) l.push(`  doublon fichier : « ${d.terme} » ≡ « ${d.autre} »`);
  for (const d of plan.doublonsBase) l.push(`  doublon base : ${d.termes.join(" / ")}`);
  for (const c of plan.collisionsSlug) l.push(`  collision de slug : « ${c.terme} » (${c.slugPrevu} déjà pris, le serveur suffixera)`);
  if (plan.aCreer.length) {
    l.push("À créer :");
    for (const t of plan.aCreer) l.push(`  + ${t.terme}  →  ${marqueurCours(t.terme)}`);
  }
  l.push(...extra);
  return l.join("\n");
}
