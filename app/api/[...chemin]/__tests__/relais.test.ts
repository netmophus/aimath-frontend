import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "../route";

const contexte = { params: Promise.resolve({ chemin: ["eleve", "mon-programme"] }) };
const requete = () => new NextRequest("https://myfahimta.com/api/eleve/mon-programme?x=1");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("relais /api/* vers Django", () => {
  it("production sans URL backend : 503 propre, jamais 127.0.0.1", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BACKEND_API_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const r = await GET(requete(), contexte);
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ detail: "Service temporairement indisponible." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("production : relaie vers l'URL absolue du backend, avec le slash final", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BACKEND_API_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://backend.example.com/");
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await GET(requete(), contexte);
    expect(r.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe("https://backend.example.com/api/eleve/mon-programme/?x=1");
  });

  it("BACKEND_API_URL (serveur) prime sur NEXT_PUBLIC_API_URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BACKEND_API_URL", "https://interne.example.com");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://public.example.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await GET(requete(), contexte);
    expect(String(fetchMock.mock.calls[0][0]).startsWith("https://interne.example.com/")).toBe(true);
  });

  it("backend injoignable : 502 propre au lieu d'une exception", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://backend.example.com");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    const r = await GET(requete(), contexte);
    expect(r.status).toBe(502);
    expect(await r.json()).toEqual({ detail: "Service temporairement indisponible." });
  });

  it("développement : repli local 127.0.0.1:8001 seulement hors production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("BACKEND_API_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await GET(requete(), contexte);
    expect(String(fetchMock.mock.calls[0][0]).startsWith("http://127.0.0.1:8001/")).toBe(true);
  });
});
