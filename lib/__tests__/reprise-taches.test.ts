import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { MESSAGE_RESULTAT_EXPIRE, attendreTache, marquerTacheVue, tacheVue } from "@/lib/taches";

function stockage() {
  const m = new Map<string, string>();
  vi.stubGlobal("localStorage", { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) });
}
const etat = (statut: string, extra: object = {}) => ({ id: "t1", statut, ...extra }) as never;
const horloge = () => {
  let t = 0;
  return { maintenant: () => t, attendre: async (ms: number) => void (t += ms) };
};

describe("reprise d'une tâche après actualisation", () => {
  beforeEach(stockage);
  afterEach(() => vi.unstubAllGlobals());

  it("un résultat présenté n'est plus ressorti automatiquement", async () => {
    const lire = vi.fn().mockResolvedValue(etat("terminee", { http: 200, corps: { ok: 1 } }));
    expect(tacheVue("t1")).toBe(false);
    await expect(attendreTache("t1", { lire, delaiVueMs: 0, ...horloge() })).resolves.toEqual({ ok: 1 });
    expect(tacheVue("t1")).toBe(true);
  });

  it("un résultat n'est marqué consulté qu'après un court affichage : un rechargement immédiat le ressort", async () => {
    vi.useFakeTimers();
    try {
      const lire = vi.fn().mockResolvedValue(etat("terminee", { http: 200, corps: { ok: 3 } }));
      await expect(attendreTache("t9", { lire, ...horloge() })).resolves.toEqual({ ok: 3 });
      expect(tacheVue("t9")).toBe(false);          // rechargement (service worker) à cet instant : le résultat reste récupérable
      vi.advanceTimersByTime(3999);
      expect(tacheVue("t9")).toBe(false);
      vi.advanceTimersByTime(1);
      expect(tacheVue("t9")).toBe(true);           // affiché assez longtemps : plus ressorti ensuite
    } finally {
      vi.useRealTimers();
    }
  });

  it("une tâche en erreur est retrouvée comme ApiError puis marquée vue", async () => {
    const lire = vi.fn().mockResolvedValue(etat("terminee", { http: 503, corps: { detail: "Le traitement a été interrompu. Relance l'analyse.", code: "resultat_inconnu" } }));
    const erreur = await attendreTache<never>("t1", { lire, delaiVueMs: 0, ...horloge() }).catch((e: unknown) => e as ApiError);
    expect(erreur).toBeInstanceOf(ApiError);
    expect(erreur.message).toContain("interrompu");
    expect(tacheVue("t1")).toBe(true);
  });

  it("un résultat expiré donne un message clair (410), sans réessai automatique", async () => {
    const lire = vi.fn().mockResolvedValue(etat("expiree"));
    const erreur = await attendreTache<never>("t1", { lire, delaiVueMs: 0, ...horloge() }).catch((e: unknown) => e as ApiError);
    expect(erreur.status).toBe(410);
    expect(erreur.message).toBe(MESSAGE_RESULTAT_EXPIRE);
    expect(lire).toHaveBeenCalledTimes(1);
    expect(tacheVue("t1")).toBe(true);
  });

  it("perte temporaire de connexion pendant l'attente : on reprend sans perdre la tâche", async () => {
    const lire = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(etat("en_cours"))
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(etat("terminee", { http: 200, corps: { fini: true } }));
    await expect(attendreTache("t1", { lire, delaiVueMs: 0, ...horloge() })).resolves.toEqual({ fini: true });
    expect(lire).toHaveBeenCalledTimes(4);
  });

  it("sans stockage navigateur, tout fonctionne quand même", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("bloqué");
      },
      setItem: () => {
        throw new Error("bloqué");
      },
    });
    expect(tacheVue("x")).toBe(false);
    expect(() => marquerTacheVue("x")).not.toThrow();
    const lire = vi.fn().mockResolvedValue(etat("terminee", { http: 200, corps: { ok: 2 } }));
    await expect(attendreTache("t1", { lire, delaiVueMs: 0, ...horloge() })).resolves.toEqual({ ok: 2 });
  });
});
