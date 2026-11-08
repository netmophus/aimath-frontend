import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import type { Root } from "mdast";

import { BLOCS_DYNAMIQUE, LaboDynamiqueSyntaxeError, ONGLETS_DYNAMIQUE, estLangageDynamique, parserBlocDynamique } from "@/lib/laboDynamique";
import { remarkLaboDynamique } from "@/lib/remarkLaboDynamique";
import { remarkLaboCinematique } from "@/lib/remarkLaboCinematique";
import { remarkPlanIncline } from "@/lib/remarkPlanIncline";
import { ATWOOD_DEFAUT, MONTE_DEFAUT, PENDULE_DEFAUT, PLAN_DEFAUT, SPHERE_DEFAUT, VIRAGE_DEFAUT } from "@/lib/dynamique";
import LaboDynamique, { LaboDynamiqueSimple } from "@/components/labo-dynamique/LaboDynamique";
import LaboDynamiqueBloc from "@/components/labo-dynamique/LaboDynamiqueBloc";
import RenduMarkdown from "@/components/RenduMarkdown";

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
const rendu = (md: string) => renderToStaticMarkup(createElement(RenduMarkdown, { contenu: md }));

describe("analyse des blocs de dynamique", () => {
  it("reconnaît les sept blocs", () => {
    expect(Object.keys(BLOCS_DYNAMIQUE).sort()).toEqual(["labo-dynamique", "machine-atwood", "monte-charge", "pendule-conique", "plan-incline", "solide-sphere", "vehicule-virage"]);
    expect(estLangageDynamique("plan-incline")).toBe(true);
    expect(estLangageDynamique("mouvement")).toBe(false);
    expect(estLangageDynamique("labo-cinematique")).toBe(false);
    expect(estLangageDynamique(null)).toBe(false);
    expect(ONGLETS_DYNAMIQUE).toEqual(["plan", "atwood", "pendule", "monte-charge", "virage", "sphere"]);
  });
  it("valeurs par défaut valides pour un bloc vide", () => {
    expect(parserBlocDynamique("plan-incline", "")).toEqual({ kind: "plan", params: PLAN_DEFAUT });
    expect(parserBlocDynamique("machine-atwood", "")).toEqual({ kind: "atwood", params: ATWOOD_DEFAUT });
    expect(parserBlocDynamique("pendule-conique", "")).toEqual({ kind: "pendule", params: PENDULE_DEFAUT });
    expect(parserBlocDynamique("monte-charge", "")).toEqual({ kind: "monte-charge", params: MONTE_DEFAUT });
    expect(parserBlocDynamique("vehicule-virage", "")).toEqual({ kind: "virage", params: VIRAGE_DEFAUT });
    expect(parserBlocDynamique("solide-sphere", "")).toEqual({ kind: "sphere", params: SPHERE_DEFAUT });
    expect(parserBlocDynamique("labo-dynamique", "")).toEqual({ kind: "labo", onglet: "plan" });
  });
  it("lit les paramètres des exemples de la spécification (SI, virgule décimale acceptée, casse libre)", () => {
    expect(parserBlocDynamique("plan-incline", "angle: 30\nmasse: 2")).toEqual({ kind: "plan", params: PLAN_DEFAUT });
    expect(parserBlocDynamique("plan-incline", "angle: 45\nmasse: 3,5\ngravite: 9.8\ndistance: 8\nvitesse: 1")).toEqual({ kind: "plan", params: { m: 3.5, alpha: 45, g: 9.8, v0: 1, distance: 8 } });
    expect(parserBlocDynamique("machine-atwood", "masse1: 0.5\nmasse2: 0.3\ngravite: 9.8")).toEqual({ kind: "atwood", params: ATWOOD_DEFAUT });
    const pend = parserBlocDynamique("pendule-conique", "masse: 0.1\nlongueur: 0.5\nangle: 30\ngravite: 10");
    expect(pend).toMatchObject({ kind: "pendule", params: { m: 0.1, l: 0.5, theta: 30, g: 10, mode: "angle" } });
    expect(parserBlocDynamique("pendule-conique", "omega: 6")).toMatchObject({ params: { mode: "omega", omega: 6 } });
    expect(parserBlocDynamique("monte-charge", "masse: 500\ngravite: 10\nacceleration: 1")).toMatchObject({ params: { m: 500, g: 10, a: 1 } });
    const vir = parserBlocDynamique("vehicule-virage", "masse: 1000\nvitesse: 15\nrayon: 50\ngravite: 10");
    expect(vir).toMatchObject({ params: { m: 1000, v: 15, R: 50, g: 10, adherence: false } });
    expect(parserBlocDynamique("vehicule-virage", "mu: 0.6")).toMatchObject({ params: { mu: 0.6, adherence: true } });
    expect(parserBlocDynamique("solide-sphere", "masse: 1\nrayon: 2\ngravite: 10\nangleInitial: 1")).toEqual({ kind: "sphere", params: SPHERE_DEFAUT });
    expect(parserBlocDynamique("solide-sphere", "ANGLEINITIAL: 5")).toMatchObject({ params: { theta0: 5 } });
    expect(parserBlocDynamique("labo-dynamique", "onglet: Sphere")).toEqual({ kind: "labo", onglet: "sphere" });
  });
  it("valide strictement les unités : les valeurs doivent être des nombres SI sans unité écrite", () => {
    expect(() => parserBlocDynamique("monte-charge", "masse: 500 g")).toThrow(LaboDynamiqueSyntaxeError);
    expect(() => parserBlocDynamique("monte-charge", "masse: 500 g")).toThrow(/unités SI/);
    expect(() => parserBlocDynamique("plan-incline", "distance: 5 cm")).toThrow(/sans unité écrite/);
    expect(() => parserBlocDynamique("plan-incline", "masse: lourd")).toThrow(/nombre/);
    expect(() => parserBlocDynamique("plan-incline", "masse: 0")).toThrow(/strictement/);
    expect(() => parserBlocDynamique("plan-incline", "masse: -2")).toThrow();
    expect(() => parserBlocDynamique("plan-incline", "angle: 80")).toThrow(/compris entre 0 et 75/);
    expect(() => parserBlocDynamique("plan-incline", "gravite: 0")).toThrow();
    expect(() => parserBlocDynamique("vehicule-virage", "rayon: 0.5")).toThrow();
  });
  it("messages explicites en français pour les erreurs de syntaxe", () => {
    expect(() => parserBlocDynamique("plan-incline", "vitesse initiale 3")).toThrow(/Ligne invalide/);
    expect(() => parserBlocDynamique("plan-incline", "couleur: bleu")).toThrow(/Directive inconnue/);
    expect(() => parserBlocDynamique("plan-incline", "angle: 30\nangle: 40")).toThrow(/répétée/);
    expect(() => parserBlocDynamique("labo-dynamique", "onglet: bille")).toThrow(/Onglet inconnu/);
    expect(() => parserBlocDynamique("labo-dynamique", "autre: 1")).toThrow(/Directive inconnue/);
  });
  it("refuse des valeurs de pendule et de monte-charge physiquement incohérentes", () => {
    expect(() => parserBlocDynamique("pendule-conique", "angle: 30\nomega: 5")).toThrow(/angle:" OU "omega/);
    expect(() => parserBlocDynamique("monte-charge", "gravite: 10\nacceleration: -10")).toThrow(/câble détendu/);
    expect(() => parserBlocDynamique("monte-charge", "gravite: 10\nacceleration: -15")).toThrow(/tension/);
    expect(parserBlocDynamique("monte-charge", "gravite: 10\nacceleration: -9.5")).toMatchObject({ params: { a: -9.5 } });
  });
});

describe("plugin remark du laboratoire de dynamique", () => {
  it("transforme chacun des sept blocs en figure avec le nom du bloc et sa source", () => {
    for (const lang of Object.keys(BLOCS_DYNAMIQUE)) {
      const arbre = transformer(`Avant\n\n\`\`\`${lang}\nmasse: 2\n\`\`\`\n\nAprès`, remarkLaboDynamique);
      const figures = trouver(arbre, (n) => n.data?.hName === "figure");
      expect(figures).toHaveLength(1);
      expect(figures[0].data?.hProperties?.["data-labodynamique-lang"]).toBe(lang);
      expect(figures[0].data?.hProperties?.["data-labodynamique-source"]).toBe("masse: 2");
      expect(trouver(arbre, (n) => n.type === "code")).toHaveLength(0);
    }
  });
  it("laisse intacts les blocs mouvement, circulaire, courbe, labo-cinematique et les autres langages", () => {
    const md = "```mouvement\nx0: 0\n```\n\n```circulaire\nrayon: 1\n```\n\n```courbe\nf: x\n```\n\n```labo-cinematique\nonglet: mru\n```\n\n```python\nprint(1)\n```";
    const arbre = transformer(md, remarkLaboDynamique);
    expect(trouver(arbre, (n) => n.type === "code")).toHaveLength(5);
    expect(trouver(arbre, (n) => n.data?.hName === "figure")).toHaveLength(0);
  });
  it("placé avant remarkPlanIncline, il capte plan-incline : l'ancien plugin n'a plus rien à traiter", () => {
    const arbre = transformer("```plan-incline\nangle: 30\nmasse: 2\n```", remarkLaboDynamique, remarkPlanIncline);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(1);
    expect(figures[0].data?.hProperties?.["data-labodynamique-lang"]).toBe("plan-incline");
    expect(figures[0].data?.hProperties?.["data-plan-incline-source"]).toBeUndefined();
    // les deux plugins combinés avec le plugin cinématique n'interfèrent pas
    const deux = transformer("```plan-incline\nangle: 30\n```\n\n```labo-cinematique\nonglet: frenet\n```", remarkLaboDynamique, remarkPlanIncline, remarkLaboCinematique);
    expect(trouver(deux, (n) => n.data?.hName === "figure")).toHaveLength(2);
  });
});

describe("rendu du laboratoire de dynamique", () => {
  it("le laboratoire complet affiche ses six onglets, les trois modes pédagogiques et les contrôles de lecture", () => {
    const html = renderToStaticMarkup(createElement(LaboDynamique, { onglet: "plan" }));
    expect(html).toContain("Laboratoire de dynamique");
    for (const t of ["Plan incliné", "Atwood", "Pendule", "Monte-charge", "Virage", "Sphère"]) expect(html).toContain(t);
    for (const m of ["Observer", "Comprendre", "S&#x27;exercer"]) expect(html).toContain(m);
    for (const c of ["Lecture", "Recommencer", "Réinitialiser", "Reprendre l&#x27;exemple", "×0,25", "×0,5", "×1", "×2"]) expect(html).toContain(c);
    expect(html).toContain('role="tablist"');
    expect((html.match(/role="tab"/g) ?? []).length).toBe(6);
  });
  it("chaque simulation se rend seule, avec ses paramètres, ses résultats et sa légende", () => {
    for (const o of ONGLETS_DYNAMIQUE) {
      const html = renderToStaticMarkup(createElement(LaboDynamiqueSimple, { onglet: o }));
      expect(html).toContain("<svg");
      expect(html).toContain("Paramètres");
      expect(html).toContain("Légende des vecteurs");
      expect(html).not.toContain("NaN");
      expect(html).not.toContain("Infinity");
    }
  });
  it("le plan incliné affiche les valeurs du cas de validation (calculées, pas figées)", () => {
    const html = renderToStaticMarkup(createElement(LaboDynamiqueSimple, { onglet: "plan" }));
    expect(html).toContain("20 N"); // P
    expect(html).toContain("17,32 N"); // N = 10√3
    expect(html).toContain("5 m/s²"); // a
    expect(html).toContain("7,07 m/s"); // v après 5 m
    const autre = renderToStaticMarkup(createElement(LaboDynamiqueSimple, { onglet: "plan", initial: { plan: { ...PLAN_DEFAUT, m: 8 } } }));
    expect(autre).toContain("80 N");
    expect(autre).toContain("5 m/s²");
  });
  it("Atwood : valeurs de référence 2,45 m/s² et 3,675 N", () => {
    const html = renderToStaticMarkup(createElement(LaboDynamiqueSimple, { onglet: "atwood" }));
    expect(html).toContain("2,45 m/s²");
    expect(html).toContain("3,675 N");
  });
  it("pendule conique : valeurs de référence et message d'erreur pour une vitesse angulaire trop faible", () => {
    const html = renderToStaticMarkup(createElement(LaboDynamiqueSimple, { onglet: "pendule" }));
    expect(html).toContain("0,25 m");
    expect(html).toContain("4,806 rad/s");
    expect(html).toContain("1,201 m/s");
    expect(html).toContain("1,155 N");
    const faux = renderToStaticMarkup(createElement(LaboDynamiqueSimple, { onglet: "pendule", initial: { pendule: { ...PENDULE_DEFAUT, mode: "omega", omega: 3 } } }));
    expect(faux).toContain("pas de configuration conique");
    expect(faux).not.toContain("NaN");
    expect(faux).not.toContain("Infinity");
  });
  it("virage : adhérence insuffisante signalée, animation arrêtée", () => {
    const html = renderToStaticMarkup(createElement(LaboDynamiqueSimple, { onglet: "virage", initial: { virage: { ...VIRAGE_DEFAUT, v: 25, mu: 0.5, adherence: true } } }));
    expect(html).toContain("Adhérence insuffisante");
    expect(html).toContain("Virage impossible avec cette adhérence");
  });
  it("monte-charge : câble détendu signalé (T non affichée comme une situation normale)", () => {
    const html = renderToStaticMarkup(createElement(LaboDynamiqueSimple, { onglet: "monte-charge", initial: { "monte-charge": { ...MONTE_DEFAUT, a: -12 } } }));
    expect(html).toContain("câble se détend");
    expect(html).not.toContain("Tension T = m(g + a)");
  });
  it("sphère : contact perdu immédiatement signalé avec une grande vitesse initiale", () => {
    const html = renderToStaticMarkup(createElement(LaboDynamiqueSimple, { onglet: "sphere", initial: { sphere: { ...SPHERE_DEFAUT, v0: 8 } } }));
    expect(html).toContain("quitte la sphère dès le départ");
  });
});

describe("intégration dans RenduMarkdown", () => {
  it("les six blocs dédiés et le laboratoire complet s'affichent dans une même leçon", () => {
    const md = [
      "```plan-incline\nangle: 30\nmasse: 2\n```",
      "```machine-atwood\nmasse1: 0.5\nmasse2: 0.3\n```",
      "```pendule-conique\nangle: 30\n```",
      "```monte-charge\nacceleration: 1\n```",
      "```vehicule-virage\nvitesse: 15\n```",
      "```solide-sphere\nangleInitial: 1\n```",
      "```labo-dynamique\nonglet: virage\n```",
    ].join("\n\n");
    const html = rendu(md);
    expect((html.match(/Laboratoire de dynamique/g) ?? []).length).toBe(7);
    for (const t of ["Plan incliné sans frottement", "Machine d&#x27;Atwood", "Pendule conique", "Monte-charge", "Véhicule dans un virage", "Solide glissant sur une sphère"]) expect(html).toContain(t);
    expect(html).not.toContain("labo-dynamique");
  });
  it("le bloc plan-incline existant est raccordé au nouveau laboratoire (et plus à l'ancien rendu)", () => {
    const html = rendu("```plan-incline\nangle: 30\nmasse: 2\n```");
    expect(html).toContain("Laboratoire de dynamique");
    expect(html).toContain("17,32 N");
    expect(html).not.toContain("g·sin(α)"); // notation de l'ancien composant
  });
  it("un bloc mal configuré produit un message explicite sans casser le reste de la leçon", () => {
    const html = rendu("Avant la simulation.\n\n```machine-atwood\nmasse1: 500 g\n```\n\nAprès la simulation.");
    expect(html).toContain("Avant la simulation.");
    expect(html).toContain("Après la simulation.");
    expect(html).toContain("Simulation de dynamique non affichable");
    expect(html).toContain("unités SI");
  });
  it("sans impact sur les blocs du laboratoire de cinématique, mouvement et circulaire", () => {
    const cin = rendu("```labo-cinematique\nonglet: frenet\n```");
    expect(cin).toContain("Laboratoire de cinématique");
    expect(cin).not.toContain("Laboratoire de dynamique");
    const mouv = rendu("```mouvement\nx0: 0\nv0: 2\na: 1\n```");
    expect(mouv).not.toContain("Laboratoire de dynamique");
    const circ = rendu("```circulaire\nrayon: 2\n```");
    expect(circ).not.toContain("Laboratoire de dynamique");
  });
  it("LaboDynamiqueBloc gère un langage inconnu sans lever d'exception", () => {
    const html = renderToStaticMarkup(createElement(LaboDynamiqueBloc, { langage: "inconnu", source: "" }));
    expect(html).toContain("Bloc inconnu");
  });
});
