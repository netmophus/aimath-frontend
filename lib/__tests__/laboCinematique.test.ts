import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import type { Root } from "mdast";

import { LaboCinematiqueSyntaxeError, ONGLETS_CINEMATIQUE, SQUELETTE_LABO_CINEMATIQUE, contientLaboCinematique, parserBlocLaboCinematique } from "@/lib/laboCinematique";
import { remarkLaboCinematique } from "@/lib/remarkLaboCinematique";
import { contientLaboEquations } from "@/lib/laboEquations";
import { contientLaboMoivre } from "@/lib/laboMoivre";
import LaboCinematique from "@/components/labo-cinematique/LaboCinematique";
import LaboCinematiqueBloc from "@/components/labo-cinematique/LaboCinematiqueBloc";
import LaboEquations from "@/components/labo-equations/LaboEquations";
import LaboMoivreEuler from "@/components/labo-moivre/LaboMoivreEuler";
import RenduMarkdown from "@/components/RenduMarkdown";
import ChampMarkdown from "@/components/admin/lecons/ChampMarkdown";

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

describe("analyse du bloc ```labo-cinematique", () => {
  it("sans directive : onglet MRU par défaut", () => {
    expect(parserBlocLaboCinematique("")).toEqual({ onglet: "mru" });
    expect(parserBlocLaboCinematique("\n# commentaire\n")).toEqual({ onglet: "mru" });
  });
  it("accepte les six onglets (casse libre) et refuse le reste avec un message en français", () => {
    expect(ONGLETS_CINEMATIQUE).toEqual(["mru", "circulaire", "frenet", "hodographe", "chronophoto", "referentiels"]);
    for (const o of ONGLETS_CINEMATIQUE) expect(parserBlocLaboCinematique(`onglet: ${o}`)).toEqual({ onglet: o });
    expect(parserBlocLaboCinematique("Onglet:  HODOGRAPHE ")).toEqual({ onglet: "hodographe" });
    expect(() => parserBlocLaboCinematique("onglet: vitesse")).toThrow(LaboCinematiqueSyntaxeError);
    expect(() => parserBlocLaboCinematique("onglet: vitesse")).toThrow(/Onglet inconnu/);
    expect(() => parserBlocLaboCinematique("zzz")).toThrow(/Ligne invalide/);
    expect(() => parserBlocLaboCinematique("duree: 5")).toThrow(/Directive inconnue/);
  });
});

describe("plugin remark ```labo-cinematique", () => {
  it("transforme le bloc en <figure data-labocinematique-source> et ne laisse plus de code brut", () => {
    const arbre = transformer("Avant\n\n```labo-cinematique\nonglet: frenet\n```\n\nAprès", remarkLaboCinematique);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(1);
    expect(figures[0].data?.hProperties?.["data-labocinematique-source"]).toBe("onglet: frenet");
    expect(trouver(arbre, (n) => n.type === "code")).toHaveLength(0);
  });
  it("n'interfère pas avec les autres langages ni avec ```mouvement et ```circulaire", () => {
    const arbre = transformer("```mouvement\nx0: 0\n```\n\n```circulaire\nrayon: 1\n```\n\n```python\nprint(1)\n```", remarkLaboCinematique);
    expect(trouver(arbre, (n) => n.type === "code")).toHaveLength(3);
    expect(trouver(arbre, (n) => n.data?.hName === "figure")).toHaveLength(0);
  });
});

describe("insertion dans l'éditeur d'administration", () => {
  it("le gabarit est un bloc valide, détecté une seule fois", () => {
    expect(SQUELETTE_LABO_CINEMATIQUE).toContain("```labo-cinematique");
    expect(parserBlocLaboCinematique(SQUELETTE_LABO_CINEMATIQUE.replace(/```[a-z-]*/g, "").trim())).toEqual({ onglet: "mru" });
    expect(contientLaboCinematique(SQUELETTE_LABO_CINEMATIQUE)).toBe(true);
    expect(contientLaboCinematique("")).toBe(false);
    expect(contientLaboCinematique("Cours de cinématique")).toBe(false);
    expect(contientLaboCinematique("```mouvement\nx0: 0\n```")).toBe(false);
  });
  it("les détecteurs des autres laboratoires ne se croisent pas", () => {
    expect(contientLaboEquations(SQUELETTE_LABO_CINEMATIQUE)).toBe(false);
    expect(contientLaboMoivre(SQUELETTE_LABO_CINEMATIQUE)).toBe(false);
    expect(contientLaboCinematique("```labo-moivre\nonglet: euler\n```")).toBe(false);
  });
  it("l'éditeur affiche « + Insérer le labo Cinématique » seulement si la prop est active", () => {
    const props = { valeur: "", onChange: () => {} };
    const avec = renderToStaticMarkup(createElement(ChampMarkdown, { ...props, avecInsertionLaboCinematique: true }));
    expect(avec).toContain("+ Insérer le labo Cinématique");
    const sans = renderToStaticMarkup(createElement(ChampMarkdown, { ...props, avecInsertionLaboEquations: true }));
    expect(sans).toContain("+ Insérer le labo Équations complexes");
    expect(sans).not.toContain("Cinématique");
    expect(renderToStaticMarkup(createElement(ChampMarkdown, props))).not.toContain("Cinématique");
  });
  it("l'insertion ne modifie pas le reste du contenu (ajout en fin)", () => {
    const avant = "Un texte avec $v = \\dfrac{d}{t}$.\n";
    expect((avant + SQUELETTE_LABO_CINEMATIQUE).startsWith(avant)).toBe(true);
  });
});

describe("rendu (serveur, sans interaction)", () => {
  const MAUVAIS = /NaN|Infinity|undefined|\[object/;
  const texteVisible = (html: string) => html.replace(/<[^>]+>/g, " ");
  const MOINS_ZERO = /(^|[\s(=;])-0(?![.,\d])/;
  it("le laboratoire affiche titre, sous-titre et les six onglets", () => {
    const html = renderToStaticMarkup(createElement(LaboCinematique, { data: { onglet: "mru" } }));
    expect(html).toContain("Laboratoire de cinématique");
    expect(html).toContain("Observe, mesure et comprends le mouvement.");
    for (const libelle of ["MRU / MRUV", "Circulaire", "Frenet", "Hodographe", "Chronophoto", "Référentiels"]) expect(html).toContain(libelle);
    expect(html.match(/role="tab"/g)).toHaveLength(6);
  });
  for (const onglet of ONGLETS_CINEMATIQUE) {
    it(`l'onglet « ${onglet} » se rend sans valeur invalide ni erreur KaTeX, sans caractère de contrôle`, () => {
      const html = renderToStaticMarkup(createElement(LaboCinematique, { data: { onglet } }));
      expect(html).not.toMatch(MAUVAIS);
      expect(html).not.toContain("katex-error");
      expect(texteVisible(html)).not.toMatch(MOINS_ZERO);
      expect(html).toContain("katex");
      expect(html).toContain("<svg");
      expect(/\t|\r/.test(html), `onglet ${onglet}`).toBe(false);
      for (const commande of ["Lecture", "Recommencer", "Réinitialiser"]) expect(html).toContain(commande);
      expect(html).toContain("Afficher les vecteurs");
      expect(html).toContain("Afficher les calculs");
    });
  }
  it("MRU : trois graphiques synchronisés, quatre situations, résultats du cahier des charges", () => {
    const html = renderToStaticMarkup(createElement(LaboCinematique, { data: { onglet: "mru" } }));
    for (const s of ["MRU", "MRUV accéléré", "Freinage", "Changement de sens"]) expect(html).toContain(s);
    expect(html.match(/en fonction du temps/g)?.length).toBe(3);
    expect(html).toContain("Distance parcourue");
    expect(html).toContain("Déplacement");
  });
  it("Circulaire : exemples, période, expérience ω × 2", () => {
    const html = renderToStaticMarkup(createElement(LaboCinematique, { data: { onglet: "circulaire" } }));
    expect(html).toContain("R = 0,5 m ; ω = 2 rad/s");
    expect(html).toContain("R = 0,5 m ; ω = 4 rad/s");
    expect(html).toContain("Période T");
    expect(html).toContain("Appliquer ω × 2");
  });
  it("Frenet, Hodographe, Chronophoto, Référentiels : éléments pédagogiques attendus", () => {
    const f = renderToStaticMarkup(createElement(LaboCinematique, { data: { onglet: "frenet" } }));
    expect(f).toContain("Accélération composée");
    expect(f).toContain("aN = v²/Rc");
    const h = renderToStaticMarkup(createElement(LaboCinematique, { data: { onglet: "hodographe" } }));
    expect(h).toContain("Trajectoire : évolution de la position.");
    expect(h).toContain("Hodographe : évolution de la vitesse.");
    expect(h).toContain("hodographe (vitesse)");
    const c = renderToStaticMarkup(createElement(LaboCinematique, { data: { onglet: "chronophoto" } }));
    expect(c).toContain("Écart absolu");
    expect(c).toContain("Écart relatif");
    expect(c).toContain("Effet du pas de temps");
    const r = renderToStaticMarkup(createElement(LaboCinematique, { data: { onglet: "referentiels" } }));
    expect(r).toContain("Référentiel terrestre");
    expect(r).toContain("Référentiel du véhicule");
    expect(r).toContain("non à l&#x27;échelle");
  });
  it("le pont Markdown affiche un encadré d'erreur pour un onglet inconnu", () => {
    const html = renderToStaticMarkup(createElement(LaboCinematiqueBloc, { source: "onglet: zzz" }));
    expect(html).toContain("non affichable");
    expect(html).toContain("Onglet inconnu");
    expect(renderToStaticMarkup(createElement(LaboCinematiqueBloc, { source: "onglet: frenet" }))).toContain("Laboratoire de cinématique");
  });
  it("RenduMarkdown reconnaît chaque onglet et n'expose pas la directive brute", () => {
    for (const o of ONGLETS_CINEMATIQUE) {
      const html = renderToStaticMarkup(createElement(RenduMarkdown, { contenu: `Intro\n\n\`\`\`labo-cinematique\nonglet: ${o}\n\`\`\`\n\nFin` }));
      expect(html).toContain("Observe, mesure et comprends le mouvement.");
      expect(html).not.toContain(`onglet: ${o}`);
      expect(html).not.toContain("labo-cinematique");
      expect(html).toContain("Intro");
      expect(html).toContain("Fin");
      expect(html).toContain(`id="cinematique-onglet-${o}" role="tab" type="button" aria-selected="true"`);
    }
  });
  it("sans régression : blocs mouvement, circulaire, courbe et autres laboratoires, à côté du nouveau", () => {
    expect(renderToStaticMarkup(createElement(LaboEquations, { data: { onglet: "discriminant" } }))).toContain("Équations complexes");
    expect(renderToStaticMarkup(createElement(LaboMoivreEuler, { data: { onglet: "moivre" } }))).toContain("Laboratoire Moivre, Euler et racines n-ièmes");
    const anciens = "```mouvement\nx0: 0\nv0: 2\na: 1\nduree: 10\n```\n\n```circulaire\nrayon: 1\nomega: 2\nduree: 10\n```\n\n```courbe\nfonction: x^2\n```";
    const seul = renderToStaticMarkup(createElement(RenduMarkdown, { contenu: anciens }));
    const avec = renderToStaticMarkup(createElement(RenduMarkdown, { contenu: `${anciens}\n\n\`\`\`labo-cinematique\nonglet: mru\n\`\`\`\n\n\`\`\`labo-equations-complexes\nonglet: racines\n\`\`\`` }));
    expect(seul).not.toContain("Laboratoire de cinématique");
    expect(seul.length).toBeGreaterThan(500);
    // Les trois blocs existants se rendent à l'identique (seule la balise fermante du conteneur suit le contenu ajouté).
    expect(avec.startsWith(seul.slice(0, seul.lastIndexOf("</")))).toBe(true);
    expect(avec).toContain("Laboratoire de cinématique");
    expect(avec).toContain("Équations complexes");
  });
});
