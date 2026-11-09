import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import type { Root } from "mdast";

import { LaboChimieEauSyntaxeError, ONGLETS_CHIMIE_EAU, estLangageChimieEau, parserLaboChimieEau } from "@/lib/laboChimieEau";
import { remarkLaboChimieEau } from "@/lib/remarkLaboChimieEau";
import {
  AUTOPROTOLYSE_DEFAUT,
  CHARGES_DEFAUT,
  DISSOLUTION_DEFAUT,
  IONISATION_DEFAUT,
  PH_DEFAUT,
  evaluerReponse,
  questionsAutoprotolyse,
  questionsCharges,
  questionsDissolution,
  questionsIonisation,
  questionsMystere,
  questionsPH,
  questionsPhMetre,
  type Question,
} from "@/lib/chimieEauExercices";
import { ECHANTILLONS } from "@/lib/chimieEau";
import LaboChimieEau, { SimulationChimieEau } from "@/components/labo-chimie-eau/LaboChimieEau";
import LaboChimieEauBloc from "@/components/labo-chimie-eau/LaboChimieEauBloc";
import { avancementTransfert } from "@/components/labo-chimie-eau/Autoprotolyse";
import RenduMarkdown from "@/components/RenduMarkdown";
import SimulationPlanInclineBloc from "@/components/SimulationPlanInclineBloc";

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

describe("analyse du bloc labo-chimie-eau", () => {
  it("valeurs par défaut : onglet dissolution, 25 °C", () => {
    expect(parserLaboChimieEau("")).toEqual({ onglet: "dissolution", temperature: 25 });
    expect(estLangageChimieEau("labo-chimie-eau")).toBe(true);
    expect(estLangageChimieEau("labochimie")).toBe(false);
    expect(ONGLETS_CHIMIE_EAU).toEqual(["dissolution", "ionisation", "charges", "autoprotolyse", "ph", "ph-metre"]);
  });
  it("lit onglet et température (casse libre, unité °C acceptée)", () => {
    expect(parserLaboChimieEau("onglet: Autoprotolyse\ntemperature: 60")).toEqual({ onglet: "autoprotolyse", temperature: 60 });
    expect(parserLaboChimieEau("# commentaire\nONGLET: ph-metre\nTemperature: 0 °C")).toEqual({ onglet: "ph-metre", temperature: 0 });
  });
  it("messages explicites en français pour les erreurs", () => {
    expect(() => parserLaboChimieEau("onglet: bille")).toThrow(/Onglet inconnu/);
    expect(() => parserLaboChimieEau("temperature: 40")).toThrow(/prises en charge : 0, 25, 60/);
    expect(() => parserLaboChimieEau("temperature: chaud")).toThrow(LaboChimieEauSyntaxeError);
    expect(() => parserLaboChimieEau("couleur: bleu")).toThrow(/Directive inconnue/);
    expect(() => parserLaboChimieEau("onglet: ph\nonglet: charges")).toThrow(/répétée/);
    expect(() => parserLaboChimieEau("pas de deux points")).toThrow(/Ligne invalide/);
  });
});

describe("plugin remark du laboratoire de chimie de l'eau", () => {
  it("transforme le bloc en figure avec sa source", () => {
    const arbre = transformer("Avant\n\n```labo-chimie-eau\nonglet: ph\n```\n\nAprès", remarkLaboChimieEau);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(1);
    expect(figures[0].data?.hProperties?.["data-labochimieeau-source"]).toBe("onglet: ph");
    expect(trouver(arbre, (n) => n.type === "code")).toHaveLength(0);
  });
  it("laisse intacts tous les autres blocs (dynamique, cinématique, chimie historique, plan-incline)", () => {
    const md = ["labo-dynamique", "labo-cinematique", "labochimie", "phmetre", "ionisation", "autoprotolyse", "plan-incline", "python"].map((l) => "```" + l + "\nx: 1\n```").join("\n\n");
    const arbre = transformer(md, remarkLaboChimieEau);
    expect(trouver(arbre, (n) => n.type === "code")).toHaveLength(8);
    expect(trouver(arbre, (n) => n.data?.hName === "figure")).toHaveLength(0);
  });
});

describe("rendu du laboratoire de chimie de l'eau", () => {
  it("le laboratoire complet affiche ses six onglets et les trois modes pédagogiques", () => {
    const html = renderToStaticMarkup(createElement(LaboChimieEau, {}));
    expect(html).toContain("Laboratoire de chimie de l&#x27;eau");
    for (const t of ["Dissolution", "Ionisation", "Charges", "Autoprotolyse", "pH", "pH-mètre"]) expect(html).toContain(t);
    expect((html.match(/role="tab"/g) ?? []).length).toBe(6);
    expect(html).toContain('role="tablist"');
    for (const m of ["Observer", "Comprendre", "S&#x27;exercer"]) expect(html).toContain(m);
  });
  it("chaque onglet se rend avec SVG, paramètres, résultats, sans NaN ni Infinity", () => {
    for (const o of ONGLETS_CHIMIE_EAU) {
      const html = renderToStaticMarkup(createElement(SimulationChimieEau, { id: o }));
      expect(html, o).toContain("<svg");
      expect(html, o).toContain("Paramètres");
      expect(html, o).toContain("Résultats");
      expect(html, o).not.toContain("NaN");
      expect(html, o).not.toContain("Infinity");
    }
  });
  it("l'onglet demandé est affiché en premier (bloc avec onglet et température)", () => {
    const html = renderToStaticMarkup(createElement(LaboChimieEauBloc, { source: "onglet: autoprotolyse\ntemperature: 60" }));
    expect(html).toContain("Autoprotolyse de l&#x27;eau");
    expect(html).toContain("13,02");
    expect(html).toContain("6,51");
    const ph = renderToStaticMarkup(createElement(LaboChimieEauBloc, { source: "onglet: ph" }));
    expect(ph).toContain("pH et concentrations ioniques");
    expect(ph).toContain("10⁻³");
    expect(ph).toContain("10⁻¹¹");
  });
  it("dissolution : équations et valeurs de l'exemple (0,1 mol, 0,2 mol/L)", () => {
    const html = renderToStaticMarkup(createElement(SimulationChimieEau, { id: "dissolution" }));
    expect(html).toContain("0,1 mol");
    expect(html).toContain("0,2 mol/L");
    expect(html).toContain("Ajouter le sel");
    expect(html).toContain("katex");
  });
  it("ionisation : pH 2 pour C = 0,010 mol/L", () => {
    const html = renderToStaticMarkup(createElement(SimulationChimieEau, { id: "ionisation" }));
    expect(html).toContain("pH ≈ −log C");
    expect(html).toContain(">2<");
  });
  it("charges : CaCl₂ de l'exemple, bilan nul", () => {
    const html = renderToStaticMarkup(createElement(SimulationChimieEau, { id: "charges" }));
    expect(html).toContain("Électriquement neutre");
    expect(html).toContain("0,04 mol/L");
    expect(html).not.toContain("n&#x27;est pas équilibré");
  });
  it("pH-mètre : procédure, tampons et mode mystère", () => {
    const html = renderToStaticMarkup(createElement(SimulationChimieEau, { id: "ph-metre" }));
    for (const t of ["Préparer", "Valider le point d&#x27;étalonnage", "Rincer l&#x27;électrode", "Plonger dans le tampon pH 4", "Plonger dans la solution A", "Relever la mesure", "Trois solutions mystérieuses"]) expect(html).toContain(t);
    expect(html).toContain("Aucune mesure relevée");
  });
});

describe("avancement du transfert de proton (autoprotolyse)", () => {
  it("cyclique : deux molécules, ions formés, retour", () => {
    expect(avancementTransfert(0.5, 0)).toBe(0);
    expect(avancementTransfert(2.5, 0)).toBe(1);
    expect(avancementTransfert(5, 0)).toBe(0);
    expect(avancementTransfert(1.5, 0)).toBeGreaterThan(0);
    expect(avancementTransfert(1.5, 0)).toBeLessThan(1);
    expect(avancementTransfert(2, 3)).toBe(0);
    expect(avancementTransfert(5.5, 3)).toBe(1);
    expect(avancementTransfert(8.5, 0)).toBe(1);
  });
});

describe("intégration dans RenduMarkdown", () => {
  it("le bloc labo-chimie-eau affiche le laboratoire complet", () => {
    const html = rendu("Avant.\n\n```labo-chimie-eau\nonglet: dissolution\n```\n\nAprès.");
    expect(html).toContain("Laboratoire de chimie de l&#x27;eau");
    expect((html.match(/role="tab"/g) ?? []).length).toBe(6);
    expect(html).toContain("Avant.");
    expect(html).toContain("Après.");
    expect(html).not.toContain("labo-chimie-eau");
  });
  it("un bloc mal configuré produit un message explicite sans casser la leçon", () => {
    const html = rendu("Avant.\n\n```labo-chimie-eau\ntemperature: 40\n```\n\nAprès.");
    expect(html).toContain("Laboratoire de chimie de l&#x27;eau non affichable");
    expect(html).toContain("prises en charge");
    expect(html).toContain("Après.");
  });
  it("sans impact sur plan-incline, le laboratoire de dynamique, de cinématique et la chimie historique", () => {
    const plan = rendu("```plan-incline\nangle: 30\nmasse: 2\n```");
    expect(plan).toContain(renderToStaticMarkup(createElement(SimulationPlanInclineBloc, { source: "angle: 30\nmasse: 2" })));
    expect(plan).not.toContain("Laboratoire de chimie de l&#x27;eau");
    expect(rendu("```labo-dynamique\nonglet: plan\n```")).toContain("Laboratoire de dynamique");
    expect(rendu("```labo-dynamique\nonglet: plan\n```")).not.toContain("chimie de l&#x27;eau");
    expect(rendu("```labo-cinematique\nonglet: frenet\n```")).toContain("Laboratoire de cinématique");
    expect(rendu("```phmetre\n```")).not.toContain("Laboratoire de chimie de l&#x27;eau");
    expect(rendu("```labochimie\n```")).not.toContain("Laboratoire de chimie de l&#x27;eau");
  });
});

describe("exercices : générés par le moteur et vérifiés", () => {
  const ensembles: Array<[string, Question[]]> = [
    ["dissolution", questionsDissolution(DISSOLUTION_DEFAUT)],
    ["ionisation", questionsIonisation(IONISATION_DEFAUT)],
    ["charges", questionsCharges(CHARGES_DEFAUT)],
    ["autoprotolyse", questionsAutoprotolyse(AUTOPROTOLYSE_DEFAUT)],
    ["ph", questionsPH(PH_DEFAUT)],
    ["ph-metre", questionsPhMetre({ echantillon: ECHANTILLONS[0], releve: null })],
  ];
  for (const [nom, qs] of ensembles) {
    it(`${nom} : au moins quatre questions, trois niveaux de difficulté, réponses cohérentes`, () => {
      expect(qs.length).toBeGreaterThanOrEqual(4);
      expect(new Set(qs.map((q) => q.niveau)).size).toBe(3);
      for (const q of qs) {
        expect(q.indice.length).toBeGreaterThan(5);
        expect(q.explication.length).toBeGreaterThan(5);
        if (q.type === "choix") {
          expect(q.attendu).toBeGreaterThanOrEqual(0);
          expect(q.attendu).toBeLessThan(q.options.length);
          expect(evaluerReponse(q, q.attendu).ok).toBe(true);
          expect(evaluerReponse(q, (q.attendu + 1) % q.options.length).ok).toBe(false);
        } else {
          expect(Number.isFinite(q.attendu)).toBe(true);
          expect(evaluerReponse(q, `${q.attendu}`).ok, q.id).toBe(true);
        }
      }
    });
  }
  it("pH 4 est reconnu sous les écritures 4, 4,0 et 4.00 ; unités facultatives mais vérifiées", () => {
    const q = questionsPH(PH_DEFAUT).find((x) => x.id === "ph-1")!;
    for (const s of ["4", "4,0", "4.00", " 4 "]) expect(evaluerReponse(q, s).ok, s).toBe(true);
    expect(evaluerReponse(q, "5").ok).toBe(false);
    expect(evaluerReponse(q, "abc").ok).toBe(false);
    expect(evaluerReponse(q, "4 mol/L").ok).toBe(false);
    const c = questionsPH(PH_DEFAUT).find((x) => x.id === "ph-2a")!;
    for (const s of ["1e-9", "10^-9", "10^{-9}", "1×10^-9", "0.000000001", "1e-9 mol/L", "1e-9 mol.L-1"]) expect(evaluerReponse(c, s).ok, s).toBe(true);
    expect(evaluerReponse(c, "1e-8").ok).toBe(false);
    expect(evaluerReponse(c, "1e-9 g").ok).toBe(false);
  });
  it("une concentration minuscule n'est pas validée par une tolérance absolue (1e-11 ≠ 1e-3)", () => {
    const q = questionsPH({ pH: 3, T: 25 }).find((x) => x.id === "ph-2b")!;
    expect(evaluerReponse(q, "1e-5").ok).toBe(true);
    expect(evaluerReponse(q, "1e-9").ok).toBe(false);
    expect(evaluerReponse(q, "0").ok).toBe(false);
  });
  it("les questions suivent les paramètres courants", () => {
    const a = questionsDissolution({ ...DISSOLUTION_DEFAUT, masse: 11.688 }).find((q) => q.id === "diss-C");
    const b = questionsDissolution(DISSOLUTION_DEFAUT).find((q) => q.id === "diss-C");
    expect(a && a.type === "nombre" && b && b.type === "nombre" && a.attendu).toBeCloseTo(0.4, 3);
    expect(b && b.type === "nombre" && b.attendu).toBeCloseTo(0.2, 3);
    const hot = questionsAutoprotolyse({ T: 60 }).find((q) => q.id === "ap-neutre");
    expect(hot && hot.type === "nombre" && hot.attendu).toBeCloseTo(6.51, 12);
    const ca = questionsCharges({ ...CHARGES_DEFAUT, C: 0.015 }).find((q) => q.id === "ch-conc");
    expect(ca && ca.type === "nombre" && ca.attendu).toBeCloseTo(0.03, 12);
  });
  it("scénario mystérieux : questions calculées à partir des mesures relevées", () => {
    expect(questionsMystere({})).toHaveLength(0);
    const qs = questionsMystere({ A: 3.01, B: 6.98, C: 10.9 });
    expect(qs).toHaveLength(6);
    const h = qs.find((q) => q.id === "my-h-C");
    expect(h && h.type === "nombre" && h.attendu).toBeCloseTo(10 ** -10.9, 15);
    const nature = qs.find((q) => q.id === "my-nature-A");
    expect(nature && nature.type === "choix" && nature.options[nature.attendu]).toBe("acide");
  });
  it("question sans solution acceptée : saisie vide ou texte refusés", () => {
    const q = questionsDissolution(DISSOLUTION_DEFAUT).find((x) => x.id === "diss-C")!;
    expect(evaluerReponse(q, "").ok).toBe(false);
    expect(evaluerReponse(q, "0,2 mol/L").ok).toBe(true);
    expect(evaluerReponse(q, "0,3").ok).toBe(false);
  });
});
