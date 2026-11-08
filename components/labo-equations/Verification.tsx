"use client";

import { useMemo, useState } from "react";
import { IconEye, IconEyeOff, IconPencil, IconRefresh } from "@tabler/icons-react";

import { cx, div, modC, oppose, sub, type Cx } from "@/lib/complexes";
import { lireComplexe, texComplexe, texNombre } from "@/lib/complexesTex";
import { bilanRacine, comparerRacines, comparerReponses, resoudreSecondDegre, resoudreTroisiemeDegre, verifierViete } from "@/lib/equationsComplexes";
import { EXEMPLES_VERIFICATION, INSTANCES_ENTRAINEMENT, type ExempleVerification } from "@/lib/equationsComplexesExemples";
import { parC, texDeltaComplexe, texEquation, texPolynome, texSubstitutionPolynome } from "@/lib/equationsComplexesAffichage";
import BilanPolynome from "./BilanPolynome";
import { Bouton, ChampComplexe, Commandes, DeuxColonnes, EQ, EtapeFormule, Intro, Message, Panneau, Pastille, PlanEquations, Tex, Valeur, Verdict, etiquetteCoord, indice, type RacinePlan } from "./ui";

/** Écrit un complexe dans le champ de saisie : « 2.5-1i » (point décimal, lisible par lireComplexe). */
function texteNombre(z: Cx): string {
  const re = Number(z.re.toFixed(4));
  const im = Number(z.im.toFixed(4));
  if (im === 0) return String(re);
  const imTexte = `${Math.abs(im) === 1 ? "" : Math.abs(im)}i`;
  if (re === 0) return `${im < 0 ? "-" : ""}${imTexte}`;
  return `${re}${im < 0 ? "-" : "+"}${imTexte}`;
}

/** Regroupe des racines (avec répétitions) en racines distinctes avec multiplicité. */
function grouper(racines: Cx[]): Array<{ z: Cx; m: number }> {
  const groupes: Array<{ z: Cx; m: number }> = [];
  for (const z of [...racines].sort(comparerRacines)) {
    const g = groupes.find((x) => modC(sub(x.z, z)) <= 1e-8 * Math.max(1, modC(z)));
    if (g) g.m += 1;
    else groupes.push({ z, m: 1 });
  }
  return groupes;
}

/** Onglet 5 : vérifier par soi-même (candidat saisi ou point déplacé), relations de Viète, entraînement « À toi de trouver ». */
export default function Verification() {
  const [entrainement, setEntrainement] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-[#10B981] bg-emerald-50">
        Un nombre <Tex expr="z" /> est solution de <Tex expr="P(z) = 0" /> si et seulement si <Tex expr="P(z)" /> est nul. Ici, tu proposes un nombre (en l&apos;écrivant ou en déplaçant le point) et le laboratoire calcule <Tex expr="P(z)" />, partie réelle et partie imaginaire séparément.
      </Intro>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Mode de l'onglet Vérification">
        <Pastille actif={!entrainement} onClick={() => setEntrainement(false)}>
          Explorer
        </Pastille>
        <Pastille actif={entrainement} onClick={() => setEntrainement(true)}>
          <IconPencil size={16} aria-hidden="true" className="mr-1" />À toi de trouver
        </Pastille>
      </div>
      {entrainement ? <Entrainement /> : <Exploration />}
    </div>
  );
}

// --- Exploration ---------------------------------------------------------------------------------------------------

function Exploration() {
  const [idx, setIdx] = useState(0);
  const [texte, setTexte] = useState("2");
  const [z, setZ] = useState<Cx>(cx(2));
  const [montrer, setMontrer] = useState(false);

  const ex: ExempleVerification = EXEMPLES_VERIFICATION[idx];
  const p = ex.p;
  const lecture = lireComplexe(texte);
  const bilan = useMemo(() => bilanRacine(p, z), [p, z]);
  const attendues = useMemo(() => grouper(ex.attendues), [ex]);
  const amplitude = Math.max(3, ...ex.attendues.map((r) => Math.max(Math.abs(r.re), Math.abs(r.im))));
  const degre2 = p.length === 3;
  const sd = degre2 ? resoudreSecondDegre(p[0], p[1], p[2]) : null;
  const viete = sd && sd.ok ? verifierViete(p[0], p[1], p[2], sd.racines[0], sd.racines[sd.double ? 0 : 1]) : null;
  const quotientSomme = degre2 ? div(oppose(p[1]), p[0]) : null;
  const autre = quotientSomme && bilan.estRacine ? sub(quotientSomme, z) : null;

  function choisir(i: number) {
    setIdx(i);
    setTexte("2");
    setZ(cx(2));
    setMontrer(false);
  }
  function saisir(t: string) {
    setTexte(t);
    const l = lireComplexe(t);
    if (l.ok && Math.abs(l.valeur.re) <= 1e6 && Math.abs(l.valeur.im) <= 1e6) setZ(l.valeur);
  }

  const racinesPlan: RacinePlan[] = montrer
    ? attendues.map((g, i) => ({ id: `s${i}`, nom: `s${indice(i + 1)}`, z: g.z, couleur: EQ.vert, etiquette: etiquetteCoord(`s${indice(i + 1)}`, g.z), multiplicite: g.m }))
    : [];

  return (
    <DeuxColonnes
      gauche={
        <>
          <Panneau titre="Équation et candidat">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Choix de l'équation">
              {EXEMPLES_VERIFICATION.map((e, i) => (
                <Pastille key={e.libelle} actif={i === idx} onClick={() => choisir(i)}>
                  {e.libelle}
                </Pastille>
              ))}
            </div>
            <Tex expr={texEquation(p)} bloc className="text-lg" />
            <ChampComplexe etiquette="Ton candidat z (forme a + bi)" valeur={texte} erreur={lecture.ok ? null : lecture.erreur} onChange={saisir} placeholder="ex. 2 - 3i" />
            <div className="flex flex-wrap gap-2">
              <Bouton onClick={() => choisir(idx)}>
                <IconRefresh size={18} aria-hidden="true" />
                Réinitialiser
              </Bouton>
              <Bouton onClick={() => setMontrer((m) => !m)}>
                {montrer ? <IconEyeOff size={18} aria-hidden="true" /> : <IconEye size={18} aria-hidden="true" />}
                {montrer ? "Cacher les racines" : "Montrer les racines"}
              </Bouton>
            </div>
          </Panneau>

          <Panneau titre="Calcul de P(z)" ton="resultat">
            <Tex expr={`z = ${texComplexe(z)}`} />
            <Tex expr={texSubstitutionPolynome(p, z)} bloc />
            <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
              <Valeur etiquette="Partie réelle de P(z)">
                <Tex expr={`\\mathrm{Re}\\,P(z) \\approx ${texNombre(bilan.valeur.re, 6)}`} />
              </Valeur>
              <Valeur etiquette="Partie imaginaire de P(z)">
                <Tex expr={`\\mathrm{Im}\\,P(z) \\approx ${texNombre(bilan.valeur.im, 6)}`} />
              </Valeur>
            </div>
            {bilan.estRacine ? <Verdict ton="ok">Le polynôme s&apos;annule : z est une racine.</Verdict> : <Verdict ton="non">P(z) n&apos;est pas nul : z n&apos;est pas une racine.</Verdict>}
            <BilanPolynome p={p} z={z} />
            <p className="text-xs leading-relaxed text-fh-ardoise/70">
              Règle de décision : z est déclaré racine si |P(z)| ≤ 10⁻⁹ × (|a||z|ⁿ + … + |c|), une tolérance relative à la taille des termes. Quand tous les coefficients et z sont entiers, le calcul est exact : on peut alors parler d&apos;égalité, pas seulement d&apos;approximation.
            </p>
          </Panneau>

          {degre2 && sd && sd.ok && viete && (
            <Panneau titre="Relations entre coefficients et racines (Viète)" ton="explication">
              <Tex
                bloc
                expr={`\\begin{aligned} z_1 + z_2 &= ${texComplexe(viete.somme)} \\quad\\text{et}\\quad -\\frac{b}{a} = ${texComplexe(viete.sommeAttendue)} \\\\ z_1 z_2 &= ${texComplexe(viete.produit)} \\quad\\text{et}\\quad \\frac{c}{a} = ${texComplexe(viete.produitAttendu)} \\end{aligned}`}
              />
              <Message type={viete.sommeOk && viete.produitOk ? "ok" : "erreur"}>
                {viete.sommeOk && viete.produitOk ? "Les deux relations sont vérifiées avec les racines de l'équation." : "Une relation n'est pas vérifiée : signale ce cas à l'enseignant."}
              </Message>
              {autre && bilan.estRacine ? (
                <p className="text-sm text-fh-ardoise">
                  Ton candidat est une racine, donc l&apos;autre racine vaut <Tex expr={`-\\frac{b}{a} - z = ${texComplexe(autre)}`} />.
                </p>
              ) : null}
            </Panneau>
          )}
        </>
      }
      droite={
        <Panneau titre="Plan complexe">
          <PlanEquations
            titre="Déplace le point z : P(z) se recalcule"
            etiquette="Plan complexe : point z déplaçable"
            racines={racinesPlan}
            cadre={amplitude}
            aimant={0.5}
            points={[{ id: "z", z, couleur: bilan.estRacine ? EQ.vert : EQ.bleu, etiquette: etiquetteCoord("z", z), deplacable: true }]}
            onDeplacer={(_, nz) => {
              setZ(nz);
              setTexte(texteNombre(nz));
            }}
            legende={<p className="text-xs leading-relaxed text-fh-ardoise/80">Le point se déplace par pas de 0,5 (souris, doigt ou flèches du clavier). Il devient vert quand P(z) s&apos;annule.</p>}
          />
        </Panneau>
      }
    />
  );
}

// --- Entraînement « À toi de trouver » -------------------------------------------------------------------------------

function Entrainement() {
  const [i, setI] = useState(0);
  const [essai, setEssai] = useState(0);
  const inst = INSTANCES_ENTRAINEMENT[i];
  return <Question key={`${i}-${essai}`} inst={inst} numero={i + 1} total={INSTANCES_ENTRAINEMENT.length} onNouvelle={() => { setI((x) => (x + 1) % INSTANCES_ENTRAINEMENT.length); setEssai(0); }} onRecommencer={() => setEssai((e) => e + 1)} />;
}

/** Étapes de correction (affichées une à une). */
function etapesCorrection(inst: ExempleVerification): Array<{ titre: string; texte?: string; expr: string }> {
  const p = inst.p;
  if (p.length === 3) {
    const r = resoudreSecondDegre(p[0], p[1], p[2]);
    if (!r.ok) return [];
    return [
      { titre: "Calculer le discriminant", expr: texDeltaComplexe(p[0], p[1], p[2], r.delta) },
      { titre: "Une racine carrée de Δ", texte: r.double ? "Δ = 0 : racine double." : "On cherche δ tel que δ² = Δ.", expr: r.double ? "\\delta = 0" : `\\delta = ${texComplexe(r.racineDelta)}` },
      { titre: "Les solutions", expr: `S = \\left\\{ ${r.racines.map((z) => texComplexe(z)).join(" \\; ; \\; ")} \\right\\}${r.double ? "\\quad (\\text{racine double})" : ""}` },
    ];
  }
  const z0 = inst.racineConnue ?? cx(0);
  const r = resoudreTroisiemeDegre(p, z0);
  if (!r.ok) return [];
  return [
    { titre: "Chercher une racine simple", texte: "On teste des valeurs simples (entiers, ±i…).", expr: texSubstitutionPolynome(p, z0) + ` = 0` },
    { titre: "Factoriser par (z − z₀)", expr: `P(z) = \\left(z - ${parC(z0)}\\right)\\left(${texPolynome(r.quotient)}\\right)` },
    { titre: "Résoudre Q(z) = 0", expr: `${texDeltaComplexe(r.secondDegre.a, r.secondDegre.b, r.secondDegre.c, r.secondDegre.delta)}` },
    { titre: "Les racines", expr: `S = \\left\\{ ${r.racines.map((z, k) => `${texComplexe(z)}${r.multiplicites[k] > 1 ? `\\,(\\times ${r.multiplicites[k]})` : ""}`).join(" \\; ; \\; ")} \\right\\}` },
  ];
}

function Question({ inst, numero, total, onNouvelle, onRecommencer }: { inst: ExempleVerification; numero: number; total: number; onNouvelle: () => void; onRecommencer: () => void }) {
  const degre = inst.p.length - 1;
  const [saisies, setSaisies] = useState<string[]>(Array(degre).fill(""));
  const [retour, setRetour] = useState<{ ok: boolean; messages: string[] } | null>(null);
  const [correction, setCorrection] = useState<number | null>(null);
  const etapes = useMemo(() => etapesCorrection(inst), [inst]);

  function verifier() {
    const lues = saisies.map((t) => lireComplexe(t));
    const vides = saisies.filter((t) => t.trim() === "").length;
    if (vides === saisies.length) {
      setRetour({ ok: false, messages: ["Écris d'abord tes solutions."] });
      return;
    }
    const illisibles = lues.map((l, k) => (l.ok || saisies[k].trim() === "" ? null : `Solution ${k + 1} illisible : ${l.erreur}`)).filter((m): m is string => m !== null);
    if (illisibles.length > 0) {
      setRetour({ ok: false, messages: illisibles });
      return;
    }
    const valeurs = lues.filter((l) => l.ok).map((l) => (l.ok ? l.valeur : cx(0)));
    const bilan = comparerReponses(inst.attendues, valeurs);
    if (bilan.correct) {
      setRetour({ ok: true, messages: ["Bravo : toutes les solutions sont trouvées, avec la bonne multiplicité."] });
      return;
    }
    const messages: string[] = [];
    for (const s of bilan.intrus) {
      messages.push(bilanRacine(inst.p, s).estRacine ? `${texteNombre(s)} est bien une racine, mais elle n'est pas attendue autant de fois : relis la multiplicité.` : `${texteNombre(s)} n'est pas une solution : P(${texteNombre(s)}) n'est pas nul.`);
    }
    if (bilan.manquantes.length > 0) messages.push(`Il manque ${bilan.manquantes.length} solution${bilan.manquantes.length > 1 ? "s" : ""} (une racine double se compte deux fois).`);
    setRetour({ ok: false, messages });
  }

  return (
    <Panneau titre={`À toi de trouver · équation ${numero}/${total}`}>
      <Tex expr={texEquation(inst.p)} bloc className="text-xl" />
      <p className="text-sm text-fh-ardoise">
        Trouve les {degre} solutions de cette équation dans ℂ (une racine double s&apos;écrit deux fois). Les résultats sont masqués : cherche d&apos;abord, vérifie ensuite.
        {degre === 3 && " Indice de méthode : cherche une racine simple, puis factorise."}
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {saisies.map((t, k) => (
          <ChampComplexe key={k} etiquette={`Solution ${k + 1}`} valeur={t} onChange={(v) => setSaisies((s) => s.map((x, j) => (j === k ? v : x)))} placeholder="ex. 1 + 2i" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Bouton variante="plein" onClick={verifier}>
          Vérifier mes réponses
        </Bouton>
        <Bouton onClick={() => setCorrection((c) => (c === null ? 1 : c))} disabled={correction !== null}>
          Voir la correction
        </Bouton>
        <Bouton onClick={onRecommencer}>Recommencer</Bouton>
        <Bouton onClick={onNouvelle}>Nouvelle équation</Bouton>
      </div>
      {retour && (
        <Verdict ton={retour.ok ? "ok" : "non"}>
          <ul className="flex flex-col gap-1">
            {retour.messages.map((m, k) => (
              <li key={k}>{m}</li>
            ))}
          </ul>
        </Verdict>
      )}
      {correction !== null && (
        <div className="flex flex-col gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3" aria-label="Correction">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Correction, étape par étape</p>
          <Commandes etape={correction} total={etapes.length} onPrecedent={() => setCorrection((c) => Math.max(1, (c ?? 1) - 1))} onSuivant={() => setCorrection((c) => Math.min(etapes.length, (c ?? 1) + 1))} onTout={() => setCorrection(etapes.length)} onRecommencer={() => setCorrection(1)} />
          <ol className="flex flex-col gap-2">
            {etapes.slice(0, correction).map((e, k) => (
              <EtapeFormule key={k} numero={k + 1} titre={e.titre} texte={e.texte} expr={e.expr} />
            ))}
          </ol>
        </div>
      )}
    </Panneau>
  );
}
