"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import katex from "katex";

import { diviserEuclidien, reduireModulo, type HorlogeData } from "@/lib/horloge";

/**
 * Cadran d'horloge modulaire — SVG statique + React (état local pour la
 * valeur courante, l'animation, et la comparaison optionnelle). Même
 * raisonnement SSR que components/TableauVariations.tsx : aucune API
 * navigateur touchée au premier rendu (pas de window/document — seuls
 * `setInterval`/`katex.renderToString` s'exécutent après hydratation, dans
 * des effects/handlers, jamais pendant le rendu lui-même) — donc SSR-safe,
 * PAS de `next/dynamic({ ssr: false })` nécessaire, contrairement aux
 * courbes (function-plot/d3).
 */

const CENTRE = 110;
const TAILLE_SVG = 220;
const RAYON_CADRAN = 96;
const RAYON_GRADUATION = 78;
const RAYON_AIGUILLE = 62;
const RAYON_AIGUILLE_COMPARAISON = 46; // plus courte que la 1re : les deux restent distinguables même superposées
const RAYON_ZONE_TACTILE = 17;

const COULEUR_CADRE = "#1E2B6A"; // fh-bleu
const COULEUR_TEINTE = "rgba(30, 43, 106, 0.05)";
const COULEUR_GRADUATION = "#1E2B6A";
const COULEUR_AIGUILLE = "#D14205"; // fh-orange — 1re aiguille (valeur courante "a")
const COULEUR_AIGUILLE_COMPARAISON = "#1E2B6A"; // fh-bleu — 2e aiguille (comparaison "b"), voir data.comparaison
const COULEUR_VERDICT_OK = "#0F7A3D";
const COULEUR_VERDICT_KO = "#C0392B";

// Animation du comptage : la vitesse s'adapte à |valeur| pour que la durée
// totale reste courte quel que soit le nombre (un grand nombre avance donc
// plus vite par cran, comme demandé) — bornée entre un pas perceptible et un
// pas pas trop lent sur un petit nombre.
const DUREE_ANIMATION_CIBLE_MS = 2600;
const DELAI_PAS_MIN_MS = 15;
const DELAI_PAS_MAX_MS = 260;

interface HorlogeModulaireProps {
  data: HorlogeData;
}

/** 0 tout en haut du cadran (comme le 12 d'une horloge), sens horaire. */
function angleGraduation(k: number, n: number): number {
  return (-90 + (k * 360) / n) * (Math.PI / 180);
}

function pointSurCercle(angle: number, rayon: number): { x: number; y: number } {
  return { x: CENTRE + rayon * Math.cos(angle), y: CENTRE + rayon * Math.sin(angle) };
}

export default function HorlogeModulaire({ data }: HorlogeModulaireProps) {
  const idChamp = useId();
  const idCurseur = useId();
  const { modulo, comparaison } = data;
  const afficheComparaison = comparaison !== undefined;

  const [valeur, setValeur] = useState(0);
  const [saisie, setSaisie] = useState("");

  // Animation : `pas` est la valeur "en cours de comptage" (avance cran par
  // cran de 0 vers `valeur`) ; `null` = aucune animation en cours ni terminée
  // affichée (état par défaut, ou effacé par la dernière interaction manuelle).
  // `pasRef` mirrore `pas` pour l'effet d'animation ci-dessous : lu comme
  // point de départ/compteur SANS devenir une dépendance de l'effet (sinon
  // chaque tick — qui met `pas` à jour — recréerait l'intervalle). `pas`
  // (le state) ne sert lui qu'à l'affichage.
  const [pas, setPas] = useState<number | null>(null);
  const pasRef = useRef<number | null>(null);
  const [enLecture, setEnLecture] = useState(false); // anime activement (pas en pause)
  const minuteurRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const arreterMinuteur = useCallback(() => {
    if (minuteurRef.current !== null) {
      clearInterval(minuteurRef.current);
      minuteurRef.current = null;
    }
  }, []);

  useEffect(() => arreterMinuteur, [arreterMinuteur]); // nettoyage au démontage

  /** Toute interaction manuelle (boutons, curseur, champ, graduation) annule
   * une animation en cours et efface son affichage — l'utilisateur reprend
   * la main sur la position, pas de décalage entre ce qu'il vient de faire et
   * ce que montre le cadran. */
  function changerValeur(nouvelleValeur: number) {
    arreterMinuteur();
    setEnLecture(false);
    pasRef.current = null;
    setPas(null);
    setValeur(nouvelleValeur);
  }

  function demarrerAnimation() {
    arreterMinuteur();
    pasRef.current = 0;
    setPas(0);
    if (valeur === 0) {
      setEnLecture(false); // rien à animer, mais on affiche quand même 0 = 0×n+0
      return;
    }
    setEnLecture(true);
  }

  function togglePause() {
    if (pas === null || pas === valeur) return; // rien à mettre en pause si pas démarré/déjà fini
    setEnLecture((v) => !v);
  }

  // Boucle d'animation : avance `pas` d'un cran vers `valeur` à intervalle
  // régulier, et arrête tout (minuteur + `enLecture`) dès que la cible est
  // atteinte — le tout dans le callback du minuteur (jamais de setState
  // synchrone dans le corps de l'effet lui-même, voir react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!enLecture) return;

    const delai = Math.max(
      DELAI_PAS_MIN_MS,
      Math.min(DELAI_PAS_MAX_MS, DUREE_ANIMATION_CIBLE_MS / Math.max(1, Math.abs(valeur)))
    );
    const sens = valeur >= 0 ? 1 : -1;

    minuteurRef.current = setInterval(() => {
      if (pasRef.current === null) return;
      pasRef.current += sens;
      setPas(pasRef.current);
      if (pasRef.current === valeur) {
        arreterMinuteur();
        setEnLecture(false);
      }
    }, delai);

    return arreterMinuteur;
  }, [enLecture, valeur, arreterMinuteur]);

  const position = reduireModulo(valeur, modulo);
  const positionAffichee = pas !== null ? reduireModulo(pas, modulo) : position;
  const pointeAiguille = pointSurCercle(angleGraduation(positionAffichee, modulo), RAYON_AIGUILLE);

  const positionComparaison = afficheComparaison ? reduireModulo(comparaison, modulo) : null;
  const pointeAiguilleComparaison =
    positionComparaison !== null ? pointSurCercle(angleGraduation(positionComparaison, modulo), RAYON_AIGUILLE_COMPARAISON) : null;

  const graduations = useMemo(
    () => Array.from({ length: modulo }, (_, k) => ({ k, ...pointSurCercle(angleGraduation(k, modulo), RAYON_GRADUATION) })),
    [modulo]
  );

  const htmlCongruence = useMemo(
    () =>
      katex.renderToString(`${valeur} \\equiv ${position} \\pmod{${modulo}}`, {
        throwOnError: false,
        output: "html",
      }),
    [valeur, position, modulo]
  );

  // Égalité dynamique affichée pendant/à la fin de l'animation : pas = q×n + r.
  const { quotient: quotientAnime, reste: resteAnime } = diviserEuclidien(pas ?? valeur, modulo);
  const htmlEgaliteAnimation = useMemo(
    () =>
      pas === null
        ? ""
        : katex.renderToString(`${pas} = ${quotientAnime} \\times ${modulo} + ${resteAnime}`, {
            throwOnError: false,
            output: "html",
          }),
    [pas, quotientAnime, modulo, resteAnime]
  );

  // Verdict de congruence a ≡ b (mod n), a = valeur courante, b = comparaison
  // (fixe, venant du bloc) — recalculé à chaque changement de `valeur`.
  let sontCongruents: boolean | null = null;
  let htmlJustificationVerdict = "";
  if (afficheComparaison && positionComparaison !== null) {
    sontCongruents = position === positionComparaison;
    if (sontCongruents) {
      const ecart = valeur - comparaison;
      const facteur = ecart / modulo;
      htmlJustificationVerdict = katex.renderToString(
        `${modulo} \\mid (${valeur} - ${comparaison}) = ${ecart} = ${facteur} \\times ${modulo}`,
        { throwOnError: false, output: "html" }
      );
    } else {
      htmlJustificationVerdict = katex.renderToString(
        `${valeur} \\equiv ${position},\\ \\ ${comparaison} \\equiv ${positionComparaison} \\pmod{${modulo}} \\quad (${position} \\neq ${positionComparaison})`,
        { throwOnError: false, output: "html" }
      );
    }
  }

  function avancer(pasIncrement: number) {
    changerValeur(valeur + pasIncrement);
  }

  function allerA(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const n = Number(saisie);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return;
    changerValeur(n);
  }

  // Bornes du curseur : une plage généreuse mais fixe autour de 0, calquée
  // sur le modulo (assez large pour montrer plusieurs tours, y compris en
  // négatif) — le champ "Ajouter un nombre" reste, lui, sans limite.
  const curseurMin = -2 * modulo;
  const curseurMax = 6 * modulo;
  const valeurCurseur = Math.min(curseurMax, Math.max(curseurMin, valeur));

  function handleCurseur(event: ChangeEvent<HTMLInputElement>) {
    changerValeur(Number(event.target.value));
  }

  const animationVisible = pas !== null;
  const animationTerminee = pas !== null && pas === valeur;
  const toursAffiches = Math.abs(quotientAnime);

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-fh-sable bg-white p-4">
      <svg
        role="img"
        aria-label={`Horloge modulaire, modulo ${modulo}, aiguille sur ${positionAffichee}`}
        viewBox={`0 0 ${TAILLE_SVG} ${TAILLE_SVG}`}
        className="w-full max-w-[260px]"
      >
        <circle cx={CENTRE} cy={CENTRE} r={RAYON_CADRAN} fill={COULEUR_TEINTE} stroke={COULEUR_CADRE} strokeWidth={2} />

        {graduations.map(({ k, x, y }) => (
          <g
            key={k}
            onClick={() => changerValeur(k)}
            className="cursor-pointer"
            role="button"
            aria-label={`Aller directement à ${k}`}
          >
            <circle cx={x} cy={y} r={RAYON_ZONE_TACTILE} fill="transparent" />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={k === positionAffichee ? 15 : 13}
              fontWeight={k === positionAffichee ? 700 : 500}
              fill={k === positionAffichee ? COULEUR_AIGUILLE : COULEUR_GRADUATION}
            >
              {k}
            </text>
          </g>
        ))}

        {pointeAiguilleComparaison && (
          <line
            x1={CENTRE}
            y1={CENTRE}
            x2={pointeAiguilleComparaison.x}
            y2={pointeAiguilleComparaison.y}
            stroke={COULEUR_AIGUILLE_COMPARAISON}
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}

        <line
          x1={CENTRE}
          y1={CENTRE}
          x2={pointeAiguille.x}
          y2={pointeAiguille.y}
          stroke={COULEUR_AIGUILLE}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={CENTRE} cy={CENTRE} r={6} fill={COULEUR_AIGUILLE} />
      </svg>

      <div
        className="text-center text-base font-semibold text-fh-bleu"
        dangerouslySetInnerHTML={{ __html: htmlCongruence }}
      />

      {afficheComparaison && sontCongruents !== null && (
        <div className="flex flex-col items-center gap-1 rounded-xl bg-fh-creme px-4 py-3 text-center">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: sontCongruents ? COULEUR_VERDICT_OK : COULEUR_VERDICT_KO }}
              aria-hidden="true"
            >
              {sontCongruents ? "✓" : "✗"}
            </span>
            <span style={{ color: sontCongruents ? COULEUR_VERDICT_OK : COULEUR_VERDICT_KO }}>
              {valeur} {sontCongruents ? "≡" : "≢"} {comparaison} (mod {modulo})
            </span>
          </div>
          <div className="text-sm text-fh-ardoise" dangerouslySetInnerHTML={{ __html: htmlJustificationVerdict }} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => avancer(1)}
          className="min-h-11 min-w-11 rounded-full border border-fh-bleu-vif/40 px-4 text-sm font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => avancer(modulo)}
          className="min-h-11 rounded-full border border-fh-bleu-vif/40 px-4 text-sm font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
        >
          +{modulo} (un tour complet)
        </button>
        <button
          type="button"
          onClick={() => changerValeur(0)}
          className="min-h-11 rounded-full px-4 text-sm font-medium text-fh-ardoise/70 transition-colors hover:bg-fh-sable/60"
        >
          Réinitialiser
        </button>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-1">
        <label htmlFor={idCurseur} className="text-xs text-fh-ardoise/70">
          Curseur (de {curseurMin} à {curseurMax})
        </label>
        <input
          id={idCurseur}
          type="range"
          min={curseurMin}
          max={curseurMax}
          step={1}
          value={valeurCurseur}
          onChange={handleCurseur}
          className="h-11 w-full accent-fh-orange"
        />
      </div>

      <form onSubmit={allerA} className="flex flex-wrap items-center justify-center gap-2">
        <label htmlFor={idChamp} className="text-sm text-fh-ardoise">
          Ajouter un nombre :
        </label>
        <input
          id={idChamp}
          type="number"
          value={saisie}
          onChange={(event) => setSaisie(event.target.value)}
          placeholder="ex. 25"
          className="h-11 w-24 rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        />
        <button
          type="submit"
          className="min-h-11 rounded-full bg-fh-orange px-4 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          Aller à
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={demarrerAnimation}
          className="min-h-11 rounded-full border border-fh-orange/50 px-4 text-sm font-medium text-fh-orange-fonce transition-colors hover:bg-fh-accent/40"
        >
          ▶ Animer le comptage
        </button>
        {pas !== null && !animationTerminee && (
          <button
            type="button"
            onClick={togglePause}
            className="min-h-11 rounded-full border border-fh-bleu-vif/40 px-4 text-sm font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10"
          >
            {enLecture ? "⏸ Pause" : "▶ Reprendre"}
          </button>
        )}
      </div>

      {animationVisible && (
        <div className="flex w-full flex-col items-center gap-1 rounded-xl bg-fh-creme px-4 py-3 text-center">
          <div className="text-sm text-fh-bleu" dangerouslySetInnerHTML={{ __html: htmlEgaliteAnimation }} />
          <p className="text-xs text-fh-ardoise/70">
            Tours complets : <span className="font-semibold text-fh-bleu">{toursAffiches}</span>
            {quotientAnime < 0 && " (sens inverse)"}
            {!animationTerminee && " — en cours…"}
            {animationTerminee && " — terminé"}
          </p>
        </div>
      )}
    </div>
  );
}
