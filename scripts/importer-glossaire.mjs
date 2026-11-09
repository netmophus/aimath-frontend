#!/usr/bin/env node
/**
 * Import en masse de termes dans le glossaire FAHIMTA, via l'API admin existante.
 *
 *   node scripts/importer-glossaire.mjs fichier.json                 → test à blanc, validation seule (hors ligne)
 *   node scripts/importer-glossaire.mjs fichier.json --inventaire    → test à blanc comparé à la base (lecture seule)
 *   node scripts/importer-glossaire.mjs fichier.json --apply         → importation réelle (crée seulement les manquants)
 *
 * Options : --lecon-id N | --lecon-titre "Titre exact"  (associe les NOUVEAUX termes à cette leçon)
 *
 * Connexion (variables d'environnement, jamais en argument) :
 *   FAHIMTA_API_URL            ex. https://…  (défaut http://127.0.0.1:8001)
 *   FAHIMTA_ACCESS_TOKEN       jeton JWT d'un compte admin
 *   ou FAHIMTA_TELEPHONE + FAHIMTA_PASSWORD (POST /api/auth/login/)
 *
 * Garanties : aucune modification ni suppression d'un terme existant (jamais de PATCH/PUT/DELETE),
 * idempotent (une seconde exécution ne crée rien), slug généré par le serveur.
 * L'importation réelle exige --apply ET FAHIMTA_CONFIRM_IMPORT=OUI.
 */
import { readFileSync } from "node:fs";

import { cleTerme, formaterRapport, planifierImport, validerFichier } from "../lib/glossaireImport.ts";

const args = process.argv.slice(2);
const fichier = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--lecon-id" && args[args.indexOf(a) - 1] !== "--lecon-titre");
const drapeau = (n) => args.includes(n);
const valeur = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const apply = drapeau("--apply");
const inventaire = drapeau("--inventaire") || apply;
const BASE = (process.env.FAHIMTA_API_URL ?? "http://127.0.0.1:8001").replace(/\/$/, "");

function sortir(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

if (!fichier) sortir("Usage : node scripts/importer-glossaire.mjs fichier.json [--inventaire] [--apply] [--lecon-id N | --lecon-titre T]");
if (apply && process.env.FAHIMTA_CONFIRM_IMPORT !== "OUI") sortir("Importation réelle refusée : définir FAHIMTA_CONFIRM_IMPORT=OUI (autorisation explicite).");

let contenu;
try {
  contenu = JSON.parse(readFileSync(fichier, "utf8").replace(/^﻿/, ""));
} catch (e) {
  sortir(`Lecture impossible de ${fichier} : ${e.message}`);
}

const { entrees, erreurs } = validerFichier(contenu);
if (erreurs.length) sortir(`Fichier invalide (${erreurs.length} erreur(s)) :\n- ${erreurs.join("\n- ")}`);
console.log(`Fichier valide : ${entrees.length} entrée(s).`);

async function jeton() {
  if (process.env.FAHIMTA_ACCESS_TOKEN) return process.env.FAHIMTA_ACCESS_TOKEN;
  const { FAHIMTA_TELEPHONE: telephone, FAHIMTA_PASSWORD: password } = process.env;
  if (!telephone || !password) sortir("Identifiants manquants : FAHIMTA_ACCESS_TOKEN ou FAHIMTA_TELEPHONE + FAHIMTA_PASSWORD.");
  const r = await fetch(`${BASE}/api/auth/login/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ telephone, password }) });
  if (!r.ok) sortir(`Connexion refusée (HTTP ${r.status}).`);
  const j = await r.json();
  return j.access ?? j.tokens?.access ?? sortir("Réponse de connexion sans jeton d'accès.");
}

async function api(token, chemin, options = {}) {
  const r = await fetch(`${BASE}${chemin}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${options.method ?? "GET"} ${chemin} : ${(await r.text()).slice(0, 300)}`);
  return r.status === 204 ? null : r.json();
}

async function toutLister(token, chemin) {
  const out = [];
  let url = `${chemin}${chemin.includes("?") ? "&" : "?"}page=1`;
  for (let p = 1; p < 200; p++) {
    const page = await api(token, `${chemin}${chemin.includes("?") ? "&" : "?"}page=${p}`);
    out.push(...page.results);
    if (!page.next) return out;
  }
  throw new Error(`Pagination interminable sur ${url}`);
}

let existants = [];
let leconId = valeur("--lecon-id") ? Number(valeur("--lecon-id")) : null;
let token = null;
const extra = [];

if (inventaire) {
  token = await jeton();
  existants = await toutLister(token, "/api/admin/glossaire/");
  console.log(`Inventaire : ${existants.length} terme(s) déjà en base.`);
  const titre = valeur("--lecon-titre");
  if (titre) {
    const lecons = (await toutLister(token, "/api/admin/lecons/")).filter((l) => cleTerme(l.titre) === cleTerme(titre));
    if (lecons.length !== 1) sortir(`Leçon « ${titre} » : ${lecons.length} correspondance(s), exactement 1 attendue. Utiliser --lecon-id.`);
    leconId = lecons[0].id;
    extra.push(`Leçon associée aux nouveaux termes : #${leconId} « ${lecons[0].titre} »`);
  } else if (leconId) {
    extra.push(`Leçon associée aux nouveaux termes : #${leconId}`);
  } else {
    extra.push("Aucune leçon associée (lecon_liee laissé vide).");
  }
} else {
  extra.push("Hors ligne : comparaison avec la base non effectuée (utiliser --inventaire).");
}

const plan = planifierImport(entrees, existants);
console.log(formaterRapport(plan, apply ? "apply" : "dry-run", extra));

if (plan.doublonsBase.length && apply) sortir("Doublons détectés en base : importation interrompue, à examiner d'abord.");

if (apply) {
  let crees = 0;
  const echecs = [];
  for (const t of plan.aCreer) {
    try {
      const corps = { terme: t.terme, definition: t.definition, exemple: t.exemple };
      if (leconId) corps.lecon_liee = leconId;
      const cree = await api(token, "/api/admin/glossaire/", { method: "POST", body: JSON.stringify(corps) });
      crees++;
      console.log(`  créé #${cree.id} ${cree.slug}${cree.slug !== t.slugPrevu ? `  (slug prévu ${t.slugPrevu})` : ""}`);
    } catch (e) {
      echecs.push(`${t.terme} : ${e.message}`);
    }
  }
  console.log(`Terminé : ${crees} créé(s), ${echecs.length} échec(s).`);
  for (const e of echecs) console.error(`  ÉCHEC ${e}`);
  process.exit(echecs.length ? 2 : 0);
}
