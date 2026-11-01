import { describe, expect, it } from "vitest";

import { caler } from "../CadreMaths";

// Contraintes du curseur de la simulation Fonctions : min −4, max 4, pas 0,5.
describe("caler (saisie numérique du paramètre a)", () => {
  it("garde les valeurs permises", () => {
    expect(caler(2, -4, 4, 0.5)).toBe(2);
    expect(caler(-1.5, -4, 4, 0.5)).toBe(-1.5);
    expect(caler(0, -4, 4, 0.5)).toBe(0);
  });
  it("ramène dans les bornes", () => {
    expect(caler(10, -4, 4, 0.5)).toBe(4);
    expect(caler(-99, -4, 4, 0.5)).toBe(-4);
  });
  it("ramène sur la grille du pas", () => {
    expect(caler(1.3, -4, 4, 0.5)).toBe(1.5);
    expect(caler(-0.2, -4, 4, 0.5)).toBe(0);
  });
  it("ne renvoie jamais −0", () => {
    expect(Object.is(caler(-0.1, -4, 4, 0.5), -0)).toBe(false);
  });
});
