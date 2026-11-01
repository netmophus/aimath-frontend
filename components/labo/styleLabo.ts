"use client";

import { createContext } from "react";

/**
 * Habillage « moderne » (bleu-violet) du laboratoire de chimie de la page d'accueil.
 *
 * Faux par défaut : les cours (fence labochimie), les maths, la physique et la SVT gardent leur rendu actuel.
 * Seul `components/LaboChimie.tsx`, en mode `vitrine` (page d'accueil), le passe à vrai pour ses enfants.
 * Les composants partagés (Curseur, Valeur, Planche, Bouton, Choix, OngletLabo) ne changent d'apparence que
 * sous ce fournisseur ; leur logique et leur balisage ARIA restent identiques.
 */
export const StyleLaboModerne = createContext(false);
