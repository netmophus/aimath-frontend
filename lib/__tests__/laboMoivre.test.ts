import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import type { Root } from "mdast";

import {
  LaboMoivreSyntaxeError,
  ONGLETS_MOIVRE,
  SQUELETTE_LABO_MOIVRE,
  contientLaboMoivre,
  parserBlocLaboMoivre,
} from "@/lib/laboMoivre";
import { remarkLaboMoivre } from "@/lib/remarkLaboMoivre";
import { remarkLaboComplexes } from "@/lib/remarkLaboComplexes";
import { contientLaboComplexes, SQUELETTE_LABO_COMPLEXES } from "@/lib/laboComplexes";
import LaboMoivreEuler from "@/components/labo-moivre/LaboMoivreEuler";
import LaboMoivreBloc from "@/components/labo-moivre/LaboMoivreBloc";
import LaboComplexes from "@/components/labo-complexes/LaboComplexes";
import RenduMarkdown from "@/components/RenduMarkdown";
import ChampMarkdown from "@/components/admin/lecons/ChampMarkdown";
import { INSTANCES_DEFI_RACINES } from "@/lib/moivreEulerDefis";
import { puissanceParProduits, cadreRacines, pasNet } from "@/lib/moivreEuler";
import { cx, depuisPolaire, distance, enRadians } from "@/lib/complexes";

type Noeud = { type: string; value?: string; lang?: string; data?: { hName?: string; hProperties?: Record<string, string> }; children?: Noeud[] };

function transformer(markdown: string, ...plugins: Array<() => (tree: Root) => void>): Noeud {
  let proc = unified().use(remarkParse).use(remarkMath) as unknown as ReturnType<typeof unified>;
  for (const p of plugins) proc = proc.use(p) as typeof proc;
  return proc.runSync(proc.parse(markdown)) as unknown as Noeud;
}
function trouver(n: Noeud, pred: (x: Noeud) => boolean, acc: Noeud[] = []): Noeud[] {
  if (pred(n)) acc.push(n);
  n.children?.forEach((c) => trouver(c, pred, acc));
  return acc;
}

describe("analyse du bloc ```labo-moivre", () => {
  it("sans directive : onglet Moivre par défaut", () => {
    expect(parserBlocLaboMoivre("")).toEqual({ onglet: "moivre" });
    expect(parserBlocLaboMoivre("\n  \n# commentaire\n")).toEqual({ onglet: "moivre" });
  });
  it("accepte les six onglets (casse libre) et refuse le reste avec un message en français", () => {
    expect(ONGLETS_MOIVRE).toEqual(["moivre", "euler", "linearisation", "angles", "racines", "geometrie"]);
    for (const o of ONGLETS_MOIVRE) expect(parserBlocLaboMoivre(`onglet: ${o}`)).toEqual({ onglet: o });
    expect(parserBlocLaboMoivre("Onglet:  LINEARISATION ")).toEqual({ onglet: "linearisation" });
    expect(() => parserBlocLaboMoivre("onglet: plan")).toThrow(LaboMoivreSyntaxeError);
    expect(() => parserBlocLaboMoivre("onglet: plan")).toThrow(/Onglet inconnu/);
    expect(() => parserBlocLaboMoivre("couleur: bleu")).toThrow(/Directive inconnue/);
    expect(() => parserBlocLaboMoivre("n'importe quoi")).toThrow(/Ligne invalide/);
  });
});

describe("plugin remark ```labo-moivre", () => {
  it("transforme le bloc en <figure data-labomoivre-source> et ne laisse plus de code brut", () => {
    const arbre = transformer("Avant\n\n```labo-moivre\nonglet: racines\n```\n\nAprès", remarkLaboMoivre);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(1);
    expect(figures[0].data?.hProperties?.["data-labomoivre-source"]).toBe("onglet: racines");
    expect(trouver(arbre, (n) => n.type === "code")).toHaveLength(0);
  });
  it("laisse intacts les blocs ```complexes (sans régression) et les autres langages", () => {
    const md = "```complexes\nonglet: plan\n```\n\n```labo-moivre\nonglet: euler\n```\n\n```python\nprint(1)\n```";
    const arbre = transformer(md, remarkLaboComplexes, remarkLaboMoivre);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(2);
    expect(figures[0].data?.hProperties).toHaveProperty("data-complexes-source");
    expect(figures[0].data?.hProperties).not.toHaveProperty("data-labomoivre-source");
    expect(figures[1].data?.hProperties).toHaveProperty("data-labomoivre-source");
    expect(trouver(arbre, (n) => n.type === "code" && n.lang === "python")).toHaveLength(1);
  });
});

describe("insertion depuis l'administration", () => {
  it("le gabarit est un bloc valide qui s'ouvre sur l'onglet Moivre", () => {
    expect(contientLaboMoivre(SQUELETTE_LABO_MOIVRE)).toBe(true);
    const arbre = transformer(SQUELETTE_LABO_MOIVRE, remarkLaboMoivre);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(1);
    expect(parserBlocLaboMoivre(figures[0].data?.hProperties?.["data-labomoivre-source"] ?? "")).toEqual({ onglet: "moivre" });
  });
  it("détecte un bloc déjà présent sans le confondre avec le laboratoire des nombres complexes", () => {
    expect(contientLaboMoivre("")).toBe(false);
    expect(contientLaboMoivre("Texte\n\n```labo-moivre\nonglet: racines\n```\n")).toBe(true);
    expect(contientLaboMoivre(SQUELETTE_LABO_COMPLEXES)).toBe(false);
    expect(contientLaboComplexes(SQUELETTE_LABO_MOIVRE)).toBe(false);
    expect(contientLaboMoivre("Parle de Moivre dans le texte")).toBe(false);
  });
  it("l'éditeur affiche « + Insérer le labo Moivre » seulement si la prop est active, sans toucher aux autres boutons", () => {
    const props = { valeur: "", onChange: () => {} };
    const avec = renderToStaticMarkup(createElement(ChampMarkdown, { ...props, avecInsertionLaboMoivre: true }));
    expect(avec).toContain("+ Insérer le labo Moivre");
    expect(avec).not.toContain("Nombres complexes");
    const sans = renderToStaticMarkup(createElement(ChampMarkdown, { ...props, avecInsertionLaboComplexes: true }));
    expect(sans).toContain("+ Insérer le labo Nombres complexes");
    expect(sans).not.toContain("labo Moivre");
    const les2 = renderToStaticMarkup(createElement(ChampMarkdown, { ...props, avecInsertionLaboComplexes: true, avecInsertionLaboMoivre: true }));
    expect(les2).toContain("+ Insérer le labo Nombres complexes");
    expect(les2).toContain("+ Insérer le labo Moivre");
  });
  it("l'insertion ne modifie pas le reste du contenu (ajout en fin)", () => {
    const avant = "Un texte avec $z = re^{i\\theta}$.\n";
    expect((avant + SQUELETTE_LABO_MOIVRE).startsWith(avant)).toBe(true);
  });
});

describe("rendu (serveur, sans interaction)", () => {
  const MAUVAIS = /NaN|Infinity|undefined|\[object/;
  // « -0 » ne doit jamais apparaître dans le TEXTE affiché (les classes CSS comme min-w-0 sont exclues).
  const texteVisible = (html: string) => html.replace(/<[^>]+>/g, " ");
  const MOINS_ZERO = /(^|[\s(=;])-0(?![.,\d])/;
  it("le laboratoire affiche titre, sous-titre et les six onglets", () => {
    const html = renderToStaticMarkup(createElement(LaboMoivreEuler, { data: { onglet: "moivre" } }));
    expect(html).toContain("Laboratoire Moivre, Euler et racines n-ièmes");
    expect(html).toContain("Observe, manipule, comprends et vérifie");
    for (const libelle of ["Moivre", "Euler", "Linéariser", "Angles multiples", "Racines", "Géométrie"]) expect(html).toContain(libelle);
    expect(html.match(/role="tab"/g)).toHaveLength(6);
  });
  for (const onglet of ONGLETS_MOIVRE) {
    it(`l'onglet « ${onglet} » se rend sans valeur invalide, avec les trois zones et réinitialisation`, () => {
      const html = renderToStaticMarkup(createElement(LaboMoivreEuler, { data: { onglet } }));
      expect(html).not.toMatch(MAUVAIS);
      expect(texteVisible(html)).not.toMatch(MOINS_ZERO);
      expect(html).toContain("Réinitialiser");
      expect(html).toContain("Lancer un défi");
      expect(html).toContain("Découvrir");
      expect(html).toContain("Comprendre");
      expect(html).toContain("Vérifier");
      expect(html).toContain("katex");
      if (onglet !== "linearisation") expect(html).toContain("<svg");
      else expect(html).toContain('role="img"'); // courbes comparées
    });
  }
  it("exemples préchargés : (1+i)^8 = 16 pour Moivre, 8i et n = 3 pour les racines", () => {
    const moivre = renderToStaticMarkup(createElement(LaboMoivreEuler, { data: { onglet: "moivre" } }));
    expect(moivre).toContain("Exemple guidé");
    expect(moivre).toContain(">16<"); // module de z^8 rendu par KaTeX
    const racines = renderToStaticMarkup(createElement(LaboMoivreEuler, { data: { onglet: "racines" } }));
    expect(racines).toContain("8i");
    expect(racines).toContain('class="mord sqrt"'); // √3 exact
    expect(racines).toContain("Vérifier les racines");
    expect(racines).toContain("Racine z0");
  });
  it("le pont Markdown affiche un encadré d'erreur pour un onglet inconnu", () => {
    const html = renderToStaticMarkup(createElement(LaboMoivreBloc, { source: "onglet: zzz" }));
    expect(html).toContain("non affichable");
    expect(html).toContain("Onglet inconnu");
    expect(renderToStaticMarkup(createElement(LaboMoivreBloc, { source: "onglet: euler" }))).toContain("Laboratoire Moivre");
  });
  it("RenduMarkdown (aperçu admin et page élève) reconnaît le bloc et n'expose pas la directive brute", () => {
    const html = renderToStaticMarkup(createElement(RenduMarkdown, { contenu: "Intro\n\n```labo-moivre\nonglet: geometrie\n```\n\nFin" }));
    expect(html).toContain("Laboratoire Moivre, Euler et racines n-ièmes");
    expect(html).not.toContain("onglet: geometrie");
    expect(html).not.toContain("labo-moivre");
    expect(html).toContain("Intro");
    expect(html).toContain("Fin");
  });
  it("sans régression : le laboratoire des nombres complexes et un bloc ```complexes se rendent toujours", () => {
    const direct = renderToStaticMarkup(createElement(LaboComplexes, { data: { onglet: "plan" } }));
    expect(direct).toContain("Laboratoire des nombres complexes");
    const md = renderToStaticMarkup(createElement(RenduMarkdown, { contenu: "```complexes\nonglet: racines\n```\n\n```labo-moivre\nonglet: euler\n```" }));
    expect(md).toContain("Laboratoire des nombres complexes");
    expect(md).toContain("Laboratoire Moivre, Euler et racines n-ièmes");
  });
  it("le texte ordinaire et les formules ne sont pas affectés par le nouveau plugin", () => {
    const html = renderToStaticMarkup(createElement(RenduMarkdown, { contenu: "Soit $z = 1 + i$.\n\n```python\nprint(1)\n```" }));
    expect(html).toContain("katex");
    expect(html).toContain("print(1)");
  });
});

describe("défi « Racines » : données vérifiées numériquement", () => {
  it("chaque bonne réponse est une racine, aucune proposition fausse n'en est une", () => {
    for (const d of INSTANCES_DEFI_RACINES) {
      const Z = depuisPolaire(d.rho, enRadians(d.phiDeg));
      const ecart = (z: { re: number; im: number }) => distance(puissanceParProduits(cx(z.re, z.im), d.n), Z) / Math.max(1, d.rho);
      expect(ecart(d.correcte.z), `correcte ${d.correcte.tex}`).toBeLessThan(1e-9);
      for (const f of d.fausses) expect(ecart(f.z), `fausse ${f.tex}`).toBeGreaterThan(1e-3);
      expect(Math.abs(Math.pow(d.rho, 1 / d.n) - d.R)).toBeLessThan(1e-12);
    }
  });
});

describe("cadre et graduation des plans de racines", () => {
  it("le cadre contient toujours le cercle avec marge, même pour un module très petit ou très grand", () => {
    for (const R of [0.001, 0.04, 0.7, 1, 2, 2.4, 9, 40, 500, 5000]) expect(cadreRacines(R)).toBeGreaterThanOrEqual(R * 1.3);
  });
  it("la graduation est 1, 2 ou 5 × 10^k", () => {
    for (const B of [0.05, 0.1, 0.5, 1, 2, 3, 5, 12, 50]) {
      const p = pasNet(B);
      const m = p / Math.pow(10, Math.floor(Math.log10(p)));
      expect([1, 2, 5].some((v) => Math.abs(v - m) < 1e-9), `B=${B} p=${p}`).toBe(true);
    }
  });
});
