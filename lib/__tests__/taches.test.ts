import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { attendreTache, estTacheAcceptee, suivreSiTache } from "@/lib/taches";

/** Horloge virtuelle : `attendre` fait avancer le temps, aucun vrai délai. */
function horloge() {
  let t = 0;
  return { maintenant: () => t, attendre: async (ms: number) => void (t += ms), pauses: () => t };
}
const etat = (statut: string, extra: object = {}) => ({ id: "t1", statut, ...extra }) as never;

describe("suivi des tâches IA longues", () => {
  it("reconnaît une réponse 202", () => {
    expect(estTacheAcceptee({ tache: { id: "x", statut: "en_attente" } })).toBe(true);
    expect(estTacheAcceptee({ valide: true })).toBe(false);
    expect(estTacheAcceptee(null)).toBe(false);
  });

  it("consulte jusqu'au résultat et le renvoie tel quel", async () => {
    const h = horloge();
    const lire = vi.fn().mockResolvedValueOnce(etat("en_attente")).mockResolvedValueOnce(etat("en_cours")).mockResolvedValueOnce(etat("terminee", { http: 200, corps: { analysee: true } }));
    await expect(attendreTache("t1", { lire, delaiVueMs: 0, ...h })).resolves.toEqual({ analysee: true });
    expect(lire).toHaveBeenCalledTimes(3);
  });

  it("une erreur de la tâche (429, 503) arrive comme une ApiError, jamais un blocage", async () => {
    const lire = vi.fn().mockResolvedValue(etat("terminee", { http: 429, corps: { detail: "Limite du jour atteinte.", code: "limite_jour" } }));
    const erreur = await attendreTache<never>("t1", { lire, delaiVueMs: 0, ...horloge() }).catch((e: unknown) => e as ApiError);
    expect(erreur).toBeInstanceOf(ApiError);
    expect(erreur.status).toBe(429);
    expect(erreur.message).toBe("Limite du jour atteinte.");
    expect(erreur.body).toEqual({ detail: "Limite du jour atteinte.", code: "limite_jour" });
  });

  it("tâche abandonnée par le serveur : message neutre", async () => {
    const lire = vi.fn().mockResolvedValue(etat("echouee", { http: 503, corps: { detail: "Service temporairement indisponible. Réessaie plus tard." } }));
    const erreur = await attendreTache<never>("t1", { lire, delaiVueMs: 0, ...horloge() }).catch((e: unknown) => e as ApiError);
    expect(erreur.status).toBe(503);
  });

  it("jamais d'attente infinie : délai maximal puis TimeoutError", async () => {
    const lire = vi.fn().mockResolvedValue(etat("en_cours"));
    const erreur = await attendreTache<never>("t1", { lire, delaiMaxMs: 20_000, ...horloge() }).catch((e: unknown) => e as ApiError);
    expect(erreur).toBeInstanceOf(DOMException);
    expect((erreur as unknown as DOMException).name).toBe("TimeoutError");
  });

  it("tolère quelques coupures réseau passagères puis réussit", async () => {
    const lire = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce(etat("terminee", { http: 200, corps: { ok: 1 } }));
    await expect(attendreTache("t1", { lire, delaiVueMs: 0, ...horloge() })).resolves.toEqual({ ok: 1 });
  });

  it("abandonne après trop d'échecs réseau consécutifs", async () => {
    const lire = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    await expect(attendreTache("t1", { lire, echecsTolerables: 2, ...horloge() })).rejects.toBeInstanceOf(TypeError);
    expect(lire).toHaveBeenCalledTimes(3);
  });

  it("session expirée ou tâche introuvable : arrêt immédiat, sans insister", async () => {
    const lire = vi.fn().mockRejectedValue(new ApiError(404, "Introuvable", null));
    await expect(attendreTache("t1", { lire, delaiVueMs: 0, ...horloge() })).rejects.toMatchObject({ status: 404 });
    expect(lire).toHaveBeenCalledTimes(1);
  });

  it("les premières consultations sont rapides, puis espacées", async () => {
    const pauses: number[] = [];
    let t = 0;
    const lire = vi.fn().mockResolvedValue(etat("en_cours"));
    await attendreTache<never>("t1", {
      lire,
      delaiMaxMs: 30_000,
      maintenant: () => t,
      attendre: async (ms) => {
        pauses.push(ms);
        t += ms;
      },
    }).catch(() => undefined);
    expect(pauses.slice(0, 3)).toEqual([600, 900, 1200]);
    expect(pauses[pauses.length - 1]).toBe(2500);
  });

  it("annulation par l'appelant", async () => {
    const ctrl = new AbortController();
    ctrl.abort();
    await expect(attendreTache("t1", { signal: ctrl.signal, lire: vi.fn(), ...horloge() })).rejects.toMatchObject({ name: "AbortError" });
  });

  it("une réponse synchrone passe sans consultation (ancien comportement)", async () => {
    const reponse = { valide: true };
    await expect(suivreSiTache(reponse)).resolves.toBe(reponse);
  });
});
