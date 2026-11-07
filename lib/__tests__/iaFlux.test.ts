import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../api";
import { estSectionEnFlux, genererSection } from "../iaApi";

/** Réponse SSE factice : les morceaux sont envoyés TELS QUELS (donc coupables n'importe où). */
function reponseFlux(morceaux: string[], init: ResponseInit = { status: 200 }): Response {
  const encodeur = new TextEncoder();
  const flux = new ReadableStream<Uint8Array>({
    start(controleur) {
      for (const m of morceaux) controleur.enqueue(encodeur.encode(m));
      controleur.close();
    },
  });
  return new Response(flux, { ...init, headers: { "Content-Type": "text/event-stream" } });
}

const sse = (o: unknown) => `data: ${JSON.stringify(o)}\n\n`;

afterEach(() => vi.unstubAllGlobals());

describe("génération IA en flux (sujet type examen)", () => {
  it("seul le sujet type examen passe en flux", () => {
    expect(estSectionEnFlux("sujet_examen")).toBe(true);
    expect(estSectionEnFlux("cours")).toBe(false);
    expect(estSectionEnFlux("exercices")).toBe(false);
  });

  it("assemble les deltas (même coupés au milieu d'un message) et renvoie le corps final", async () => {
    const msg1 = sse({ type: "delta", texte: "Durée : " });
    const msg2 = sse({ type: "delta", texte: "1 heure" });
    const fin = sse({ type: "fin", tronque: false, contenu: "Durée : 1 heure" });
    const tout = ": ouverture\n\n" + msg1 + msg2 + fin;
    // découpe volontairement au milieu d'un message et d'un caractère multi-octets
    const morceaux = [tout.slice(0, 20), tout.slice(20, 55), tout.slice(55)];
    const fetchMock = vi.fn().mockResolvedValue(reponseFlux(morceaux));
    vi.stubGlobal("fetch", fetchMock);

    const vus: string[] = [];
    const r = await genererSection(1, "sujet_examen", { surTexte: (t) => vus.push(t) });

    expect(vus).toEqual(["Durée : ", "Durée : 1 heure"]);
    expect(r).toEqual({ tronque: false, contenu: "Durée : 1 heure" });
    const corps = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(corps).toEqual({ notion_id: 1, section: "sujet_examen", stream: true });
  });

  it("un événement erreur du flux devient une ApiError avec le statut du serveur", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(reponseFlux([sse({ type: "delta", texte: "a" }), sse({ type: "erreur", detail: "Quota atteint", status: 502 })]))
    );
    await expect(genererSection(1, "sujet_examen")).rejects.toMatchObject({ name: "ApiError", status: 502, message: "Quota atteint" });
  });

  it("un flux coupé sans événement fin est une erreur, jamais un contenu partiel présenté comme complet", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reponseFlux([sse({ type: "delta", texte: "a" })])));
    await expect(genererSection(1, "sujet_examen")).rejects.toBeInstanceOf(ApiError);
  });

  it("un refus avant flux (JSON, ex. budget épuisé) reste une ApiError avec son message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Budget épuisé" }), { status: 503, headers: { "Content-Type": "application/json" } }))
    );
    await expect(genererSection(1, "sujet_examen")).rejects.toMatchObject({ status: 503, message: "Budget épuisé" });
  });

  it("les autres sections gardent l'appel JSON d'un bloc, sans stream", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ contenu: "x", tronque: false }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await genererSection(1, "cours");
    expect(r).toEqual({ contenu: "x", tronque: false });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ notion_id: 1, section: "cours" });
  });
});
