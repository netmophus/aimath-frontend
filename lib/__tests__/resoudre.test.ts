import { describe, expect, it } from "vitest";

import {
  LONGUEUR_MAX_ENONCE,
  MODES_RESOLUTION,
  NB_MAX_IMAGES,
  TAILLE_MAX_FICHIER_OCTETS,
  TAILLE_MAX_TOTAL_OCTETS,
  erreurFichier,
  hrefResoudre,
  programmesParMatiere,
} from "@/lib/resoudre";

const prog = (id: number, nom: string) => ({ id, matiere: { nom } });

describe("hrefResoudre : navigation directe depuis les matières", () => {
  it("utilise l'identifiant réel du programme", () => {
    expect(hrefResoudre(42)).toBe("/eleve/resoudre?programme=42");
    expect(hrefResoudre(7)).toBe("/eleve/resoudre?programme=7");
  });
});

describe("programmesParMatiere : les quatre boutons du tableau de bord", () => {
  it("associe chaque matière à son programme réel, dans l'ordre Maths, Physique, Chimie, SVT", () => {
    const programmes = [prog(31, "SVT"), prog(12, "Chimie"), prog(5, "Mathématiques"), prog(9, "Physique")];
    const resultat = programmesParMatiere(programmes);
    expect(resultat.map((r) => r.matiere)).toEqual(["maths", "physique", "chimie", "svt"]);
    expect(resultat.map((r) => hrefResoudre(r.programme.id))).toEqual([
      "/eleve/resoudre?programme=5",
      "/eleve/resoudre?programme=9",
      "/eleve/resoudre?programme=12",
      "/eleve/resoudre?programme=31",
    ]);
  });

  it("n'invente aucun identifiant : une matière absente de la classe est omise", () => {
    const resultat = programmesParMatiere([prog(5, "Mathématiques"), prog(31, "SVT")]);
    expect(resultat.map((r) => r.matiere)).toEqual(["maths", "svt"]);
    expect(resultat.map((r) => r.programme.id)).toEqual([5, 31]);
  });

  it("ignore les matières hors périmètre et garde le premier programme d'une même matière", () => {
    const resultat = programmesParMatiere([prog(1, "Histoire-Géographie"), prog(2, "Physique-Chimie"), prog(3, "Physique")]);
    expect(resultat.map((r) => [r.matiere, r.programme.id])).toEqual([["physique", 2]]);
  });

  it("aucun programme : aucun bouton (et donc aucun identifiant incorrect envoyé)", () => {
    expect(programmesParMatiere([])).toEqual([]);
  });
});

describe("modes d'aide : valeurs techniques et textes", () => {
  it("conserve les valeurs envoyées au backend et leur ordre", () => {
    expect(MODES_RESOLUTION.map((m) => m.valeur)).toEqual(["correction", "professeur"]);
  });

  it("affiche les titres et descriptions de la maquette", () => {
    expect(MODES_RESOLUTION[0]).toMatchObject({
      titre: "Correction complète",
      description: "Obtiens une correction détaillée, étape par étape.",
    });
    expect(MODES_RESOLUTION[1]).toMatchObject({
      titre: "Professeur particulier IA",
      description: "Comprends et trouve la solution avec l'aide d'un professeur IA.",
    });
  });
});

describe("limites et validation des fichiers (inchangées)", () => {
  it("limites techniques", () => {
    expect(NB_MAX_IMAGES).toBe(6);
    expect(TAILLE_MAX_FICHIER_OCTETS).toBe(10 * 1024 * 1024);
    expect(TAILLE_MAX_TOTAL_OCTETS).toBe(20 * 1024 * 1024);
    expect(LONGUEUR_MAX_ENONCE).toBe(4000);
  });

  const fichier = (type: string, taille: number, nom = "exo") => ({ name: nom, type, size: taille }) as File;

  it("accepte JPG, PNG, WebP et PDF dans la limite de taille", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "application/pdf"]) {
      expect(erreurFichier(fichier(type, 1000))).toBeNull();
    }
  });

  it("refuse un type inconnu, un fichier trop gros et un fichier vide", () => {
    expect(erreurFichier(fichier("image/gif", 1000))).toMatch(/n'est pas accepté/);
    expect(erreurFichier(fichier("application/pdf", TAILLE_MAX_FICHIER_OCTETS + 1))).toMatch(/trop volumineux/);
    expect(erreurFichier(fichier("image/png", 0))).toMatch(/est vide/);
  });
});
