import type { ReactNode } from "react";

import type { ItemAccordeon } from "@/components/ui/Accordeon";
import { Formule, Tx } from "./commun";

/** Panneau d'étape : texte avant, formules en bloc (KaTeX), texte après. Chaînes écrites ici, jamais saisies par le visiteur. */
function etape(avant: string | null, formules: string[] = [], apres?: string): ReactNode {
  return (
    <>
      {avant && (
        <p>
          <Tx>{avant}</Tx>
        </p>
      )}
      {formules.map((tex, i) => (
        <Formule key={i} bloc tex={tex} />
      ))}
      {apres && (
        <p>
          <Tx>{apres}</Tx>
        </p>
      )}
    </>
  );
}

export interface ExerciceIA {
  id: string;
  titre: string;
  /** Énoncé rendu en KaTeX (passages entre $ … $). */
  enonce: string;
  /** Le même énoncé en texte brut, pour le compteur de caractères. */
  enoncePlain: string;
  /** Mode « Correction complète ». */
  correction: ItemAccordeon[];
  /** Mode « Professeur particulier IA » : questions de guidage. */
  guidage: ItemAccordeon[];
}

const r = String.raw;

export const EXERCICES_IA: ExerciceIA[] = [
  {
    id: "fonction-exponentielle",
    titre: "Fonction × exponentielle",
    enonce: r`Soit $f$ définie sur $\mathbb{R}$ par $f(x) = (x^2 - 3x + 2)\,e^{-x}$. Étudier les variations de $f$ et déterminer la limite de $f$ en $+\infty$.`,
    enoncePlain: "Soit f définie sur ℝ par f(x) = (x² − 3x + 2)·e^(−x). Étudier les variations de f et déterminer la limite de f en +∞.",
    correction: [
      {
        titre: "Dérivée",
        contenu: etape(
          r`$f$ est un produit : $f = u \times v$ avec $u(x) = x^2 - 3x + 2$ et $v(x) = e^{-x}$. Donc $f' = u'v + uv'$ :`,
          [r`f'(x) = (2x - 3)\,e^{-x} - (x^2 - 3x + 2)\,e^{-x} = -(x^2 - 5x + 5)\,e^{-x}`],
        ),
      },
      {
        titre: "Signe de la dérivée",
        contenu: etape(
          r`Comme $e^{-x} > 0$, le signe de $f'(x)$ est celui de $-(x^2 - 5x + 5)$. Pour $x^2 - 5x + 5$ : $\Delta = 5$, et les racines sont`,
          [r`x_1 = \dfrac{5 - \sqrt{5}}{2} \approx 1{,}38 \qquad x_2 = \dfrac{5 + \sqrt{5}}{2} \approx 3{,}62`],
        ),
      },
      {
        titre: "Variations",
        contenu: etape(
          r`$f'(x) > 0$ sur $]x_1\,;x_2[$ et $f'(x) < 0$ ailleurs. Donc $f$ est décroissante sur $]-\infty\,;x_1]$, croissante sur $[x_1\,;x_2]$, puis décroissante sur $[x_2\,;+\infty[$. Elle admet un minimum en $x_1 \approx 1{,}38$ et, sur $[x_1\,;+\infty[$, un maximum en $x_2 \approx 3{,}62$.`,
        ),
      },
      {
        titre: "Limite en $+\\infty$",
        contenu: etape(r`Par croissances comparées :`, [r`\lim_{x \to +\infty} (x^2 - 3x + 2)\,e^{-x} = 0`], r`La courbe admet donc l'axe des abscisses ($y = 0$) pour asymptote en $+\infty$.`),
      },
    ],
    guidage: [
      { titre: "Reconnaître la forme de $f$", contenu: etape(r`$f$ est un produit : qui est $u$, qui est $v$ ? Quelle formule donne $(uv)'$ ?`) },
      {
        titre: "Dériver",
        contenu: etape(r`Dérive $u$ et $v$ séparément (attention : $(e^{-x})' = -e^{-x}$), assemble avec la formule, puis factorise par $e^{-x}$.`),
      },
      {
        titre: "Étudier le signe",
        contenu: etape(r`$e^{-x}$ est toujours positif : le signe de $f'$ ne dépend que du trinôme. Calcule $\Delta$ et les racines, puis dresse le tableau de signes.`),
      },
      {
        titre: "Calculer la limite",
        contenu: etape(r`Pour la limite en $+\infty$, qui l'emporte entre $x^2$ et $e^{-x}$ ? Revois les croissances comparées.`),
      },
    ],
  },
  {
    id: "integration-par-parties",
    titre: "Intégration par parties",
    enonce: r`Calculer l'intégrale $I = \displaystyle\int_0^1 x\,e^x\,dx$ à l'aide d'une intégration par parties.`,
    enoncePlain: "Calculer l'intégrale I = ∫₀¹ x·e^x dx à l'aide d'une intégration par parties.",
    correction: [
      {
        titre: "On pose les deux fonctions",
        contenu: etape(r`On veut calculer $I = \displaystyle\int_0^1 x\,e^x\,dx$. L'intégrande $x\,e^x$ est un produit de deux fonctions. On pose $u = x$ et $v = e^x$.`),
      },
      {
        titre: "La dérivée d'un produit",
        contenu: etape(null, [r`(u \cdot v)' = u' \cdot v + u \cdot v'`]),
      },
      {
        titre: "On intègre entre 0 et 1",
        contenu: etape(r`Une primitive de $(u \cdot v)'$ est $u \cdot v$, donc :`, [r`\left[u \cdot v\right]_0^1 = \int_0^1 u' \cdot v\,dx + \int_0^1 u \cdot v'\,dx`]),
      },
      {
        titre: "On isole l'intégrale cherchée",
        contenu: etape(null, [r`\int_0^1 u \cdot v'\,dx = \left[u \cdot v\right]_0^1 - \int_0^1 u' \cdot v\,dx`], r`C'est la formule d'intégration par parties.`),
      },
      {
        titre: "On calcule $u'$ et $v'$",
        contenu: etape(
          r`$u = x \Rightarrow u' = 1$ et $v = e^x \Rightarrow v' = e^x$. On a bien $x\,e^x = u \cdot v'$. La formule donne :`,
          [r`I = \left[x\,e^x\right]_0^1 - \int_0^1 1 \cdot e^x\,dx`],
        ),
      },
      {
        titre: "On calcule chaque terme",
        contenu: etape(null, [r`\left[x\,e^x\right]_0^1 = 1 \cdot e^1 - 0 \cdot e^0 = e`, r`\int_0^1 e^x\,dx = \left[e^x\right]_0^1 = e - 1`]),
      },
      {
        titre: "Résultat",
        contenu: etape(null, [r`I = e - (e - 1) = 1`]),
      },
    ],
    guidage: [
      {
        titre: "Choisir la technique",
        contenu: etape(r`$x\,e^x$ n'a pas de primitive évidente. Quelle technique utiliser ? Rappelle d'où elle vient :`, [r`(u \cdot v)' = u' \cdot v + u \cdot v'`]),
      },
      {
        titre: "Choisir $u$ et $v$",
        contenu: etape(r`Écris $x\,e^x$ comme un produit $u \cdot v$. Prends pour $u$ la fonction qui devient plus simple quand on la dérive.`),
      },
      {
        titre: "Préparer la formule",
        contenu: etape(r`Calcule $u'$. L'autre fonction est $e^x$ : que vaut sa primitive ? Tu as tout pour appliquer la formule.`),
      },
      {
        titre: "Appliquer et calculer",
        contenu: etape(r`Applique`, [r`\int_0^1 u \cdot v'\,dx = \left[u \cdot v\right]_0^1 - \int_0^1 u' \cdot v\,dx`], r`remplace, puis calcule. Que remarques-tu sur les termes en $e$ ?`),
      },
    ],
  },
  {
    id: "nombres-complexes",
    titre: "Nombres complexes",
    enonce: r`Soit $z = 1 + i\sqrt{3}$. Déterminer le module et un argument de $z$, puis écrire $z$ sous forme exponentielle.`,
    enoncePlain: "Soit z = 1 + i√3. Déterminer le module et un argument de z, puis écrire z sous forme exponentielle.",
    correction: [
      {
        titre: "Module",
        contenu: etape(null, [r`|z| = \sqrt{\operatorname{Re}(z)^2 + \operatorname{Im}(z)^2} = \sqrt{1^2 + (\sqrt{3})^2} = \sqrt{4} = 2`]),
      },
      {
        titre: "Forme trigonométrique",
        contenu: etape(null, [r`z = 2\left(\dfrac{1}{2} + i\,\dfrac{\sqrt{3}}{2}\right)`], r`On cherche $\theta$ tel que $\cos\theta = \dfrac{1}{2}$ et $\sin\theta = \dfrac{\sqrt{3}}{2}$.`),
      },
      {
        titre: "Argument",
        contenu: etape(r`$\theta = \dfrac{\pi}{3}$, donc :`, [r`\arg(z) = \dfrac{\pi}{3} \quad [2\pi]`]),
      },
      {
        titre: "Forme exponentielle",
        contenu: etape(null, [r`z = 2\,e^{i\frac{\pi}{3}}`]),
      },
    ],
    guidage: [
      { titre: "Calculer le module", contenu: etape(r`Comment calcule-t-on $|z|$ à partir de $\operatorname{Re}(z)$ et $\operatorname{Im}(z)$ ? Applique la formule.`) },
      {
        titre: "Mettre le module en facteur",
        contenu: etape(r`Mets le module en facteur : $z = |z|\left(\dfrac{a}{|z|} + i\,\dfrac{b}{|z|}\right)$. Que valent les deux coefficients ?`),
      },
      {
        titre: "Trouver l'angle",
        contenu: etape(r`Quel angle usuel a pour cosinus $\dfrac{1}{2}$ et pour sinus $\dfrac{\sqrt{3}}{2}$ ?`),
      },
      {
        titre: "Écrire la forme exponentielle",
        contenu: etape(r`Assemble $|z|$ et $\theta$ dans $z = |z|\,e^{i\theta}$.`),
      },
    ],
  },
];
