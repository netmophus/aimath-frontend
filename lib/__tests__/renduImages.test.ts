import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RenduMarkdown from "../../components/RenduMarkdown";

const rendre = (contenu: string) => renderToStaticMarkup(createElement(RenduMarkdown, { contenu }));

describe("images dans le Markdown des leçons", () => {
  const md = 'Avant.\n\n![Paysage de l\'Aïr](/images/svt/alteration-sedimentation/air-massif-rocheux.webp "Les massifs rocheux sont transformés.")\n\nAprès.';

  it("rend l'image avec texte alternatif, chargement différé et légende visible", () => {
    const html = rendre(md);
    expect(html).toContain('src="/images/svt/alteration-sedimentation/air-massif-rocheux.webp"');
    expect(html).toContain("alt=\"Paysage de l&#x27;Aïr\"");
    expect(html).toContain('loading="lazy"');
    expect(html).toContain("Les massifs rocheux sont transformés.");
  });

  it("reste dans le flux : pas de carrousel, de modale, de bouton ni d'animation", () => {
    const html = rendre(md);
    expect(html).not.toMatch(/<button|role="dialog"|animate|carousel/i);
  });

  it("proportions préservées (hauteur auto, object-contain) et jamais plus large que l'écran", () => {
    const html = rendre(md);
    expect(html).toContain("max-w-full");
    expect(html).toContain("h-auto");
    expect(html).toContain("object-contain");
  });

  it("HTML valide dans un paragraphe : aucun bloc (div, figure) à l'intérieur du <p>", () => {
    const html = rendre(md);
    const p = html.match(/<p>(?:(?!<\/p>)[\s\S])*<img(?:(?!<\/p>)[\s\S])*<\/p>/)?.[0] ?? "";
    expect(p).not.toBe("");
    expect(p).not.toMatch(/<div|<figure/);
  });

  it("le texte autour de l'image est conservé et sans légende l'image reste affichée", () => {
    const html = rendre("Texte A.\n\n![Un schéma](/images/x.webp)\n\nTexte B.");
    expect(html).toContain("Texte A.");
    expect(html).toContain("Texte B.");
    expect(html).toContain('alt="Un schéma"');
    expect(html).not.toContain("italic");
  });

  it("n'affecte pas les marqueurs de glossaire voisins", () => {
    const html = rendre("Le [[granite|granite sain]] est dur.\n\n![alt](/images/x.webp \"légende\")");
    expect(html).toContain("granite sain");
    expect(html).toContain("légende");
  });
});
