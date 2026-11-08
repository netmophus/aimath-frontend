import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import katex from "katex";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import type { Root } from "mdast";

import { LaboEquationsSyntaxeError, ONGLETS_EQUATIONS, SQUELETTE_LABO_EQUATIONS, contientLaboEquations, parserBlocLaboEquations } from "@/lib/laboEquations";
import { remarkLaboEquations } from "@/lib/remarkLaboEquations";
import { remarkLaboMoivre } from "@/lib/remarkLaboMoivre";
import { contientLaboMoivre } from "@/lib/laboMoivre";
import { cx, modC, sub } from "@/lib/complexes";
import {
  bilanRacine,
  discriminantReel,
  racineCarree,
  resoudreSecondDegre,
  resoudreTroisiemeDegre,
} from "@/lib/equationsComplexes";
import {
  EXEMPLES_DISCRIMINANT,
  EXEMPLES_RACINES_CARREES,
  EXEMPLES_RESOLUTION,
  EXEMPLES_TROISIEME,
  EXEMPLES_VERIFICATION,
  INSTANCES_ENTRAINEMENT,
} from "@/lib/equationsComplexesExemples";
import { etapesRacineCarree, texDeltaComplexe, texDeltaReel, texEquation, texFormesPolaires, texPolynome, texRacine, texReelPrecis, texScientifique, texSubstitutionPolynome, texValeurPolynome } from "@/lib/equationsComplexesAffichage";
import LaboEquations from "@/components/labo-equations/LaboEquations";
import LaboEquationsBloc from "@/components/labo-equations/LaboEquationsBloc";
import LaboMoivreEuler from "@/components/labo-moivre/LaboMoivreEuler";
import LaboComplexes from "@/components/labo-complexes/LaboComplexes";
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

describe("analyse du bloc ```labo-equations-complexes", () => {
  it("sans directive : onglet Discriminant par défaut", () => {
    expect(parserBlocLaboEquations("")).toEqual({ onglet: "discriminant" });
    expect(parserBlocLaboEquations("\n# commentaire\n")).toEqual({ onglet: "discriminant" });
  });
  it("accepte les cinq onglets (casse libre) et refuse le reste avec un message en français", () => {
    expect(ONGLETS_EQUATIONS).toEqual(["discriminant", "racines", "resolution", "troisieme-degre", "verification"]);
    for (const o of ONGLETS_EQUATIONS) expect(parserBlocLaboEquations(`onglet: ${o}`)).toEqual({ onglet: o });
    expect(parserBlocLaboEquations("Onglet:  TROISIEME-DEGRE ")).toEqual({ onglet: "troisieme-degre" });
    expect(() => parserBlocLaboEquations("onglet: plan")).toThrow(LaboEquationsSyntaxeError);
    expect(() => parserBlocLaboEquations("onglet: plan")).toThrow(/Onglet inconnu/);
    expect(() => parserBlocLaboEquations("couleur: bleu")).toThrow(/Directive inconnue/);
    expect(() => parserBlocLaboEquations("n'importe quoi")).toThrow(/Ligne invalide/);
  });
});

describe("plugin remark ```labo-equations-complexes", () => {
  it("transforme le bloc en <figure data-laboequations-source> et ne laisse plus de code brut", () => {
    const arbre = transformer("Avant\n\n```labo-equations-complexes\nonglet: racines\n```\n\nAprès", remarkLaboEquations);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(1);
    expect(figures[0].data?.hProperties?.["data-laboequations-source"]).toBe("onglet: racines");
    expect(trouver(arbre, (n) => n.type === "code")).toHaveLength(0);
  });
  it("n'interfère pas avec ```labo-moivre ni avec les autres langages", () => {
    const md = "```labo-moivre\nonglet: euler\n```\n\n```labo-equations-complexes\nonglet: verification\n```\n\n```python\nprint(1)\n```";
    const arbre = transformer(md, remarkLaboMoivre, remarkLaboEquations);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(2);
    expect(figures[0].data?.hProperties).toHaveProperty("data-labomoivre-source");
    expect(figures[0].data?.hProperties).not.toHaveProperty("data-laboequations-source");
    expect(figures[1].data?.hProperties).toHaveProperty("data-laboequations-source");
    expect(trouver(arbre, (n) => n.type === "code" && n.lang === "python")).toHaveLength(1);
  });
});

describe("insertion dans l'éditeur d'administration", () => {
  it("le gabarit est un bloc valide, détecté une seule fois", () => {
    expect(SQUELETTE_LABO_EQUATIONS).toContain("```labo-equations-complexes");
    expect(parserBlocLaboEquations(SQUELETTE_LABO_EQUATIONS.replace(/```[a-z-]*/g, "").trim())).toEqual({ onglet: "discriminant" });
    expect(contientLaboEquations(SQUELETTE_LABO_EQUATIONS)).toBe(true);
    expect(contientLaboEquations("")).toBe(false);
    expect(contientLaboEquations("Texte sur les équations complexes")).toBe(false);
    expect(contientLaboEquations("Texte\n\n```labo-equations-complexes\nonglet: racines\n```\n")).toBe(true);
  });
  it("les détecteurs des autres laboratoires ne se croisent pas", () => {
    expect(contientLaboMoivre(SQUELETTE_LABO_EQUATIONS)).toBe(false);
    expect(contientLaboEquations("```labo-moivre\nonglet: euler\n```")).toBe(false);
  });
  it("l'éditeur affiche « + Insérer le labo Équations complexes » seulement si la prop est active", () => {
    const props = { valeur: "", onChange: () => {} };
    const avec = renderToStaticMarkup(createElement(ChampMarkdown, { ...props, avecInsertionLaboEquations: true }));
    expect(avec).toContain("+ Insérer le labo Équations complexes");
    expect(avec).not.toContain("labo Moivre");
    const sans = renderToStaticMarkup(createElement(ChampMarkdown, { ...props, avecInsertionLaboMoivre: true }));
    expect(sans).toContain("+ Insérer le labo Moivre");
    expect(sans).not.toContain("Équations complexes");
    const sansRien = renderToStaticMarkup(createElement(ChampMarkdown, props));
    expect(sansRien).not.toContain("Équations complexes");
  });
  it("l'insertion ne modifie pas le reste du contenu (ajout en fin)", () => {
    const avant = "Un texte avec $\\Delta = b^2 - 4ac$.\n";
    expect((avant + SQUELETTE_LABO_EQUATIONS).startsWith(avant)).toBe(true);
  });
});

describe("rendu (serveur, sans interaction)", () => {
  const MAUVAIS = /NaN|Infinity|undefined|\[object/;
  const texteVisible = (html: string) => html.replace(/<[^>]+>/g, " ");
  const MOINS_ZERO = /(^|[\s(=;])-0(?![.,\d])/;
  it("le laboratoire affiche titre, sous-titre et les cinq onglets", () => {
    const html = renderToStaticMarkup(createElement(LaboEquations, { data: { onglet: "discriminant" } }));
    expect(html).toContain("Équations complexes");
    expect(html).toContain("Explore, calcule et comprends les racines dans ℂ.");
    for (const libelle of ["Discriminant", "Racines carrées", "Résolution", "Troisième degré", "Vérification"]) expect(html).toContain(libelle);
    expect(html.match(/role="tab"/g)).toHaveLength(5);
  });
  for (const onglet of ONGLETS_EQUATIONS) {
    it(`l'onglet « ${onglet} » se rend sans valeur invalide ni erreur KaTeX, avec un plan orthonormé`, () => {
      const html = renderToStaticMarkup(createElement(LaboEquations, { data: { onglet } }));
      expect(html).not.toMatch(MAUVAIS);
      expect(html).not.toContain("katex-error");
      expect(texteVisible(html)).not.toMatch(MOINS_ZERO);
      expect(html).toContain("katex");
      expect(html).toContain("<svg");
      expect(html).toContain("Zoom avant");
      expect(html).toContain("Recentrer le repère");
    });
  }
  it("exemples préchargés : Discriminant (z² − 5z + 6), Racines (3 + 4i), Résolution (z² − 4z + 13), 3e degré (z₀ = 2)", () => {
    const d = renderToStaticMarkup(createElement(LaboEquations, { data: { onglet: "discriminant" } }));
    expect(d).toContain("Deux racines réelles distinctes");
    expect(d).toContain('aria-current="true"');
    const r = renderToStaticMarkup(createElement(LaboEquations, { data: { onglet: "racines" } }));
    expect(r).toContain("Comprendre les étapes");
    expect(r).toContain("Plan de Δ");
    expect(r).toContain("Plan des racines carrées");
    const s = renderToStaticMarkup(createElement(LaboEquations, { data: { onglet: "resolution" } }));
    expect(s).toContain("Racine z₁ : afficher le détail");
    expect(s).toContain("Racine z₂ : afficher le détail");
    expect(s.match(/type="text"/g)?.length).toBeGreaterThanOrEqual(6);
    const t = renderToStaticMarkup(createElement(LaboEquations, { data: { onglet: "troisieme-degre" } }));
    expect(t).toContain("Racine vérifiée");
    expect(t).toContain("multiplicité 1");
    expect(t).toContain("pas toutes les équations du troisième degré");
    const v = renderToStaticMarkup(createElement(LaboEquations, { data: { onglet: "verification" } }));
    expect(v).toContain("À toi de trouver");
    expect(v).toContain("Partie réelle de P(z)");
  });
  it("le pont Markdown affiche un encadré d'erreur pour un onglet inconnu", () => {
    const html = renderToStaticMarkup(createElement(LaboEquationsBloc, { source: "onglet: zzz" }));
    expect(html).toContain("non affichable");
    expect(html).toContain("Onglet inconnu");
    expect(renderToStaticMarkup(createElement(LaboEquationsBloc, { source: "onglet: racines" }))).toContain("Équations complexes");
  });
  it("RenduMarkdown (aperçu admin et page élève) reconnaît chaque onglet et n'expose pas la directive brute", () => {
    for (const o of ONGLETS_EQUATIONS) {
      const html = renderToStaticMarkup(createElement(RenduMarkdown, { contenu: `Intro\n\n\`\`\`labo-equations-complexes\nonglet: ${o}\n\`\`\`\n\nFin` }));
      expect(html).toContain("Explore, calcule et comprends les racines dans ℂ.");
      expect(html).not.toContain(`onglet: ${o}`);
      expect(html).not.toContain("labo-equations-complexes");
      expect(html).toContain("Intro");
      expect(html).toContain("Fin");
      expect(html).toContain(`id="equations-onglet-${o}" role="tab" type="button" aria-selected="true"`);
    }
  });
  it("sans régression : les laboratoires Moivre et Nombres complexes et leurs blocs se rendent toujours, à côté du nouveau", () => {
    expect(renderToStaticMarkup(createElement(LaboMoivreEuler, { data: { onglet: "moivre" } }))).toContain("Laboratoire Moivre, Euler et racines n-ièmes");
    expect(renderToStaticMarkup(createElement(LaboComplexes, { data: { onglet: "plan" } }))).toContain("Laboratoire des nombres complexes");
    const md = renderToStaticMarkup(createElement(RenduMarkdown, { contenu: "```complexes\nonglet: racines\n```\n\n```labo-moivre\nonglet: euler\n```\n\n```labo-equations-complexes\nonglet: verification\n```" }));
    expect(md).toContain("Laboratoire des nombres complexes");
    expect(md).toContain("Laboratoire Moivre, Euler et racines n-ièmes");
    expect(md).toContain("Équations complexes");
  });
  it("les formules KaTeX et le texte ordinaire ne sont pas affectés", () => {
    const html = renderToStaticMarkup(createElement(RenduMarkdown, { contenu: "Soit $\\Delta = b^2 - 4ac$.\n\n```python\nprint(1)\n```" }));
    expect(html).toContain("katex");
    expect(html).toContain("print(1)");
  });
});

describe("exemples prédéfinis : le moteur retrouve exactement les solutions attendues", () => {
  const dans = (liste: Array<{ re: number; im: number }>, z: { re: number; im: number }) => liste.some((w) => modC(sub(w, z)) <= 1e-9 * Math.max(1, modC(w)));
  it("discriminant", () => {
    for (const e of EXEMPLES_DISCRIMINANT) {
      const r = discriminantReel(e.a, e.b, e.c);
      expect(r.ok, e.libelle).toBe(true);
      if (r.ok) {
        expect(r.racines).toHaveLength(e.attendues.length);
        for (const z of e.attendues) expect(dans(r.racines, z), `${e.libelle} ${z.re}+${z.im}i`).toBe(true);
      }
    }
  });
  it("racines carrées", () => {
    for (const e of EXEMPLES_RACINES_CARREES) {
      const r = racineCarree(e.X, e.Y);
      expect(r.ok, e.libelle).toBe(true);
      if (r.ok) {
        expect(r.racines).toHaveLength(e.attendues.length);
        expect(r.racines[0]).toEqual(e.attendues[0]);
        for (const z of e.attendues) expect(dans(r.racines, z)).toBe(true);
      }
    }
  });
  it("résolution", () => {
    for (const e of EXEMPLES_RESOLUTION) {
      const r = resoudreSecondDegre(e.a, e.b, e.c);
      expect(r.ok, e.libelle).toBe(true);
      if (r.ok) {
        expect(r.racines).toHaveLength(e.attendues.length);
        for (const z of e.attendues) expect(dans(r.racines, z), `${e.libelle} ${z.re}+${z.im}i`).toBe(true);
      }
    }
  });
  it("troisième degré, multiplicités comprises", () => {
    for (const e of EXEMPLES_TROISIEME) {
      const r = resoudreTroisiemeDegre(e.p, e.racineConnue);
      expect(r.ok, e.libelle).toBe(true);
      if (r.ok) {
        expect(r.racines).toHaveLength(e.attendues.length);
        for (const att of e.attendues) {
          const k = r.racines.findIndex((z) => modC(sub(z, att.z)) <= 1e-9 * Math.max(1, modC(att.z)));
          expect(k, `${e.libelle} ${att.z.re}+${att.z.im}i`).toBeGreaterThanOrEqual(0);
          expect(r.multiplicites[k]).toBe(att.m);
        }
      }
    }
  });
  it("vérification et entraînement : chaque racine attendue annule bien le polynôme, aucune racine voisine ne le fait", () => {
    for (const e of [...EXEMPLES_VERIFICATION, ...INSTANCES_ENTRAINEMENT]) {
      expect(e.attendues).toHaveLength(e.p.length - 1);
      for (const z of e.attendues) {
        expect(bilanRacine(e.p, z).estRacine, `${e.libelle} ${z.re}+${z.im}i`).toBe(true);
        expect(bilanRacine(e.p, cx(z.re + 0.5, z.im)).estRacine).toBe(false);
      }
    }
  });
});

describe("tout le TeX généré est valide pour KaTeX (mode strict : une erreur de syntaxe fait échouer le test)", () => {
  const strict = (expr: string) => katex.renderToString(expr, { throwOnError: true, output: "html" });
  it("équations, discriminants, substitutions pour tous les exemples", () => {
    for (const e of [...EXEMPLES_VERIFICATION, ...INSTANCES_ENTRAINEMENT, ...EXEMPLES_TROISIEME]) {
      expect(() => strict(texEquation(e.p)), e.libelle).not.toThrow();
      expect(() => strict(texPolynome(e.p))).not.toThrow();
      for (const z of [cx(2), cx(0, 1), cx(1.5, -2.25), cx(0)]) expect(() => strict(texSubstitutionPolynome(e.p, z)), `${e.libelle} ${z.re}`).not.toThrow();
    }
    for (const e of EXEMPLES_DISCRIMINANT) {
      const r = discriminantReel(e.a, e.b, e.c);
      if (r.ok) expect(() => strict(texDeltaReel(e.a, e.b, e.c, r.delta))).not.toThrow();
    }
    for (const e of EXEMPLES_RESOLUTION) {
      const r = resoudreSecondDegre(e.a, e.b, e.c);
      if (r.ok) {
        expect(() => strict(texDeltaComplexe(e.a, e.b, e.c, r.delta))).not.toThrow();
        for (const z of r.racines) {
          expect(() => strict(texRacine(z))).not.toThrow();
          if (modC(z) > 0) expect(() => strict(texFormesPolaires(z, Math.atan2(z.im, z.re)).trig)).not.toThrow();
          if (modC(z) > 0) expect(() => strict(texFormesPolaires(z, Math.atan2(z.im, z.re)).exp)).not.toThrow();
        }
      }
    }
  });
  it("les six étapes de la racine carrée, pour tous les exemples et une grille de valeurs", () => {
    const valeurs = [-12.5, -4, -1, 0, 0.3, 2, 3, 4, 9, 25];
    for (const X of valeurs)
      for (const Y of valeurs) {
        const r = racineCarree(X, Y);
        expect(r.ok).toBe(true);
        if (!r.ok) continue;
        const etapes = etapesRacineCarree(r);
        expect(etapes).toHaveLength(6);
        for (const e of etapes) expect(() => strict(e.expr), `X=${X} Y=${Y} : ${e.titre}`).not.toThrow();
      }
  });
  it("aucun caractère de contrôle (antislash mal échappé) et jamais « -0 » ou NaN dans le TeX", () => {
    // Tous les caractères de contrôle, tabulation et saut de ligne compris : « \times » mal échappé donne une tabulation + « imes »,
    // « \neq » un saut de ligne + « eq » — KaTeX les accepte sans erreur, l'élève verrait « 1imes2 ».
    const controle = /[\u0000-\u001f]/;
    const sain = (tex: string, contexte: string) => {
      expect(controle.test(tex), `caractère de contrôle dans ${contexte} : ${JSON.stringify(tex)}`).toBe(false);
      expect(/NaN|Infinity|undefined/.test(tex), `valeur invalide dans ${contexte} : ${tex}`).toBe(false);
    };
    for (const X of [-4, 0, 2, 3, 0.3, 25]) {
      for (const Y of [-2, 0, 4, 12]) {
        const r = racineCarree(X, Y);
        if (!r.ok) continue;
        for (const e of etapesRacineCarree(r)) sain(e.expr, `étape « ${e.titre} » (${X}, ${Y})`);
      }
    }
    for (const e of [...EXEMPLES_VERIFICATION, ...INSTANCES_ENTRAINEMENT, ...EXEMPLES_TROISIEME]) {
      sain(texEquation(e.p), `équation ${e.libelle}`);
      for (const z of [cx(2), cx(0, 1), cx(1.5, -2.25), cx(0), cx(-3, 4)]) sain(texSubstitutionPolynome(e.p, z), `substitution ${e.libelle} en ${z.re}+${z.im}i`);
    }
    for (const e of EXEMPLES_DISCRIMINANT) {
      const r = discriminantReel(e.a, e.b, e.c);
      if (r.ok) sain(texDeltaReel(e.a, e.b, e.c, r.delta), `Δ ${e.libelle}`);
    }
    for (const e of EXEMPLES_RESOLUTION) {
      const r = resoudreSecondDegre(e.a, e.b, e.c);
      if (!r.ok) continue;
      sain(texDeltaComplexe(e.a, e.b, e.c, r.delta), `Δ complexe ${e.libelle}`);
      for (const z of r.racines) {
        sain(texRacine(z), `racine ${e.libelle}`);
        if (modC(z) > 0) {
          const f = texFormesPolaires(z, Math.atan2(z.im, z.re));
          sain(f.trig, "forme trigonométrique");
          sain(f.exp, "forme exponentielle");
        }
      }
    }
    for (const x of [0, 1e-16, -3.2e-12, 4.5e7]) sain(texScientifique(x), `notation scientifique ${x}`);
    for (const v of [cx(0), cx(1e-17, -2e-17), cx(3.25, -4.5)]) sain(texValeurPolynome(v), `valeur de P ${v.re}`);
  });
  it("le rendu serveur de chaque onglet ne contient ni tabulation ni saut de ligne parasite dans les formules", () => {
    for (const o of ONGLETS_EQUATIONS) {
      const html = renderToStaticMarkup(createElement(LaboEquations, { data: { onglet: o } }));
      expect(/\t|\r/.test(html), `onglet ${o}`).toBe(false);
    }
  });
  it("l'écriture de Δ garde assez de décimales : un Δ non nul ne s'affiche jamais « 0 »", () => {
    expect(texReelPrecis(0)).toBe("0");
    expect(texReelPrecis(1)).toBe("1");
    expect(texReelPrecis(1.2e-5)).not.toBe("0");
    expect(texReelPrecis(1.2e-5)).toBe("0{,}000012");
    expect(texReelPrecis(-0.0004)).toBe("-0{,}0004");
  });
  it("les polynômes s'écrivent proprement : coefficients ±1 et 0 omis, complexes entre parenthèses", () => {
    expect(texPolynome([cx(1), cx(-4), cx(13)])).toBe("z^{2} - 4\\,z + 13");
    expect(texPolynome([cx(1), cx(0), cx(4)])).toBe("z^{2} + 4");
    expect(texPolynome([cx(-1), cx(1), cx(0)])).toBe("-z^{2} + z");
    expect(texPolynome([cx(1), cx(-3, -1), cx(2, 2)])).toContain("\\left(");
    expect(texPolynome([cx(0), cx(0), cx(0)])).toBe("0");
  });
});
