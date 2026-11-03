import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import {
  REDIRECTION_PAR_ROLE,
  erreursDepuisApi,
  messageErreurConnexion,
  redirectionApresConnexion,
  validerInscription,
  type ValeursInscription,
} from "@/lib/authFormulaires";
import { niveauNeedsSerie } from "@/lib/classes";
import {
  PAYS_PAR_DEFAUT,
  PAYS_UEMOA,
  TELEPHONE_RE,
  chiffresNationaux,
  construireTelephone,
} from "@/lib/telephone";

describe("indicatif fixe +227 (Niger par défaut)", () => {
  it("le pays par défaut est le Niger, +227, actif", () => {
    expect(PAYS_PAR_DEFAUT).toMatchObject({ code: "NE", indicatif: "+227", actif: true });
  });

  it("les huit pays de l'UEMOA sont préparés, mais seul le Niger est actif", () => {
    expect(PAYS_UEMOA.map((p) => p.indicatif).sort()).toEqual(
      ["+221", "+223", "+225", "+226", "+227", "+228", "+229", "+245"]
    );
    expect(PAYS_UEMOA.filter((p) => p.actif).map((p) => p.code)).toEqual(["NE"]);
  });
});

describe("construction du numéro complet (format du backend : +227 + 8 chiffres)", () => {
  it("construit +227 + numéro national, espaces ignorés", () => {
    expect(construireTelephone("90 00 00 00")).toBe("+22790000000");
    expect(construireTelephone("90000000")).toBe("+22790000000");
    expect(construireTelephone("  90.00-00 00 ")).toBe("+22790000000");
  });

  it("aucun double préfixe, quelle que soit la façon dont le numéro est collé", () => {
    for (const saisie of ["+227 90 00 00 00", "+22790000000", "0022790000000", "22790000000"]) {
      expect(construireTelephone(saisie)).toBe("+22790000000");
    }
    expect(chiffresNationaux("+227 90 00 00 00")).toBe("90000000");
  });

  it("un numéro national qui commence par 227 mais n'est pas complet n'est pas amputé", () => {
    expect(chiffresNationaux("22712345")).toBe("22712345");
  });

  it("saisie vide : chaîne vide (la validation « obligatoire » reste celle des formulaires)", () => {
    expect(construireTelephone("")).toBe("");
    expect(construireTelephone("   ")).toBe("");
  });

  it("compatibilité avec les anciens comptes : le résultat est exactement le format stocké", () => {
    // Anciens comptes : « +227 » + 8 chiffres, sans espaces (comptes/models.py).
    expect(TELEPHONE_RE.test(construireTelephone("96 12 34 56"))).toBe(true);
    expect(construireTelephone("96 12 34 56")).toBe("+22796123456");
  });
});

describe("redirections après connexion", () => {
  it("chaque rôle va vers son espace", () => {
    expect(redirectionApresConnexion({ role: "eleve" })).toBe("/eleve");
    expect(redirectionApresConnexion({ role: "admin" })).toBe("/admin");
    expect(REDIRECTION_PAR_ROLE.vendeur).toBe("/vendeur");
  });

  it("mot de passe temporaire : changement obligatoire d'abord", () => {
    expect(redirectionApresConnexion({ role: "eleve", doit_changer_mdp: true })).toBe("/changer-mot-de-passe");
  });

  it("rôle inattendu : repli sûr vers /", () => {
    expect(redirectionApresConnexion({ role: "inconnu" as never })).toBe("/");
  });
});

describe("messages d'erreur de connexion", () => {
  it("401 : identifiants incorrects", () => {
    expect(messageErreurConnexion(new ApiError(401, "x", null))).toBe("Téléphone ou mot de passe incorrect.");
  });
  it("403 : message renvoyé par l'API (compte en attente, suspendu…)", () => {
    expect(messageErreurConnexion(new ApiError(403, "Ce compte est en attente de validation par un administrateur.", null))).toBe(
      "Ce compte est en attente de validation par un administrateur."
    );
  });
  it("autre statut API et erreur réseau", () => {
    expect(messageErreurConnexion(new ApiError(500, "x", null))).toBe("Une erreur est survenue. Réessaie dans un instant.");
    expect(messageErreurConnexion(new TypeError("fetch"))).toBe("Impossible de contacter le serveur. Vérifie ta connexion.");
  });
});

const VALIDE: ValeursInscription = {
  prenom: "Aïcha",
  nom: "Test",
  telephone: "+22790000000",
  cycleId: "1",
  niveauId: "2",
  serieId: "",
  needsSerie: false,
  motDePasse: "motdepasse1",
  confirmation: "motdepasse1",
};

describe("validation de l'inscription (règles et messages inchangés)", () => {
  it("formulaire complet : aucune erreur", () => {
    expect(validerInscription(VALIDE)).toEqual({});
  });

  it("champs obligatoires", () => {
    const e = validerInscription({ ...VALIDE, prenom: " ", nom: "", telephone: "", cycleId: "", niveauId: "", motDePasse: "", confirmation: "" });
    expect(e).toMatchObject({
      prenom: "Indique ton prénom.",
      nom: "Indique ton nom.",
      telephone: "Indique ton numéro de téléphone.",
      cycle: "Choisis ton cycle.",
      motDePasse: "Choisis un mot de passe.",
      confirmation: "Confirme ton mot de passe.",
    });
  });

  it("numéro invalide, mot de passe trop court, confirmation différente", () => {
    expect(validerInscription({ ...VALIDE, telephone: "+2279000" }).telephone).toMatch(/format \+227 suivi de 8 chiffres/);
    expect(validerInscription({ ...VALIDE, motDePasse: "court", confirmation: "court" }).motDePasse).toBe(
      "Le mot de passe doit contenir au moins 8 caractères."
    );
    expect(validerInscription({ ...VALIDE, confirmation: "autre-chose" }).confirmation).toBe("Les mots de passe ne correspondent pas.");
  });

  it("dépendance Cycle → Niveau → Série", () => {
    expect(validerInscription({ ...VALIDE, cycleId: "1", niveauId: "" }).niveau).toBe("Choisis ton niveau.");
    expect(validerInscription({ ...VALIDE, needsSerie: true, serieId: "" }).serie).toBe("Choisis ta série.");
    expect(validerInscription({ ...VALIDE, needsSerie: true, serieId: "4" }).serie).toBeUndefined();
    // Une série n'est exigée que si le niveau en propose.
    expect(niveauNeedsSerie({ id: 1, nom: "6e", series: [] })).toBe(false);
    expect(niveauNeedsSerie({ id: 2, nom: "Tle", series: [{ id: 3, nom: "C" }] })).toBe(true);
    expect(niveauNeedsSerie(undefined)).toBe(false);
  });

  it("le numéro construit depuis la saisie passe la validation sans double préfixe", () => {
    expect(validerInscription({ ...VALIDE, telephone: construireTelephone("+227 90 00 00 00") }).telephone).toBeUndefined();
  });
});

describe("erreurs renvoyées par l'API à l'inscription", () => {
  it("transforme les erreurs DRF (chaîne ou liste) en erreurs par champ", () => {
    expect(
      erreursDepuisApi({ telephone: ["Ce numéro de téléphone est déjà utilisé."], password2: "Différents.", niveau: ["Requis."] })
    ).toEqual({
      telephone: "Ce numéro de téléphone est déjà utilisé.",
      confirmation: "Différents.",
      niveau: "Requis.",
    });
  });
  it("corps inattendu : aucune erreur de champ", () => {
    expect(erreursDepuisApi(null)).toEqual({});
    expect(erreursDepuisApi("boom")).toEqual({});
    expect(erreursDepuisApi({ detail: "x" })).toEqual({});
  });
});
