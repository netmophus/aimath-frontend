"use client";

import { useState } from "react";

import { MAX_NOMBRE, diviseurDepuisExposants, diviseursPositifs, facteursPremiers, lireNaturel, nombreDiviseurs, pgcdPpcmExposants } from "@/lib/premiers";
import { Bouton, ChampNombre, Conclusion, Defi, Intro, Message, Pastille, Stepper, Tex, Zone, texFacteurs, texNombre } from "./ui";

const EXEMPLES = [60, 84, 360, 1152, 2310];

function ConstructeurDiviseur() {
  const [saisie, setSaisie] = useState("360");
  const lecture = lireNaturel(saisie, 1, MAX_NOMBRE);
  const n = lecture.ok ? lecture.valeur : 360;
  const f = facteursPremiers(n);
  const [choix, setChoix] = useState<number[]>([]);
  const [liste, setListe] = useState(false);
  const [devine, setDevine] = useState("");
  const [verifDevine, setVerifDevine] = useState(false);

  const c = f.map((_, i) => choix[i] ?? 0);
  const d = diviseurDepuisExposants(f, c);
  const total = nombreDiviseurs(f);
  const divs = liste && total <= 2000 ? diviseursPositifs(n) : [];
  const produitTex = f.map(({ e }) => e + 1);
  const lg = lireNaturel(devine, 0, 1_000_000);

  function changer(v: string) {
    setSaisie(v);
    setChoix([]);
    setListe(false);
    setDevine("");
    setVerifDevine(false);
  }
  function maj(i: number, v: number) {
    setChoix((x) => {
      const y = f.map((_, j) => x[j] ?? 0);
      y[i] = v;
      return y;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <div className="flex flex-wrap items-end gap-3">
          <ChampNombre etiquette={`Entier n (1 à ${MAX_NOMBRE.toLocaleString("fr-FR")})`} valeur={saisie} onChange={changer} erreur={lecture.ok ? null : lecture.erreur} />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
            {EXEMPLES.map((x) => (
              <Pastille key={x} actif={lecture.ok && lecture.valeur === x} onClick={() => changer(String(x))}>
                {x.toLocaleString("fr-FR")}
              </Pastille>
            ))}
          </div>
        </div>
      </Zone>

      {lecture.ok && (
        <>
          <Zone titre="Simulation">
            <Tex bloc className="text-lg" expr={`${texNombre(n)} = ${texFacteurs(f)}`} />
            {f.length === 0 ? (
              <Message type="info">1 n&apos;a aucun facteur premier : son seul diviseur positif est 1.</Message>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2" aria-label="Choix des exposants">
                {f.map(({ p, e }, i) => (
                  <li key={p} className="flex flex-col gap-2 rounded-xl border-2 border-fh-bleu-vif/40 bg-fh-accent/40 p-3">
                    <Tex className="text-lg" expr={`${p}^{${e}}`} />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-fh-ardoise/80">Exposant de {p} (0 à {e})</span>
                      <Stepper etiquette={`Exposant de ${p}`} valeur={c[i]} min={0} max={e} onChange={(v) => maj(i, v)} />
                    </div>
                    <p className="text-sm text-fh-ardoise">Nombre de choix pour le facteur {p} : <strong>{e + 1}</strong></p>
                  </li>
                ))}
              </ul>
            )}
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3" aria-live="polite">
              <Tex bloc expr={`d = ${f.length === 0 ? "1" : f.map(({ p }, i) => `${p}^{${c[i]}}`).join(" \\times ")} = ${f.length === 0 ? "1" : f.map(({ p }, i) => String(p ** c[i])).join(" \\times ")} = ${texNombre(d)}`} />
              <p className="text-sm text-fh-ardoise">
                Vérification : <Tex expr={`${texNombre(n)} \\div ${texNombre(d)} = ${texNombre(n / d)}`} />, donc {d} divise {n}.
              </p>
            </div>
          </Zone>

          <Zone titre="Explications" ton="explication">
            <p className="text-sm text-fh-ardoise">
              Un diviseur positif de n a pour décomposition <Tex expr="p_1^{\beta_1} \times \dots \times p_r^{\beta_r}" /> avec 0 ≤ βᵢ ≤ αᵢ : on choisit chaque exposant indépendamment.
            </p>
            <Tex bloc expr={`${produitTex.length > 0 ? produitTex.join(" \\times ") : "1"} = ${total}`} />
            <p className="text-sm text-fh-ardoise">
              Si n = p₁^α₁ × … × pᵣ^αᵣ, le nombre de diviseurs positifs est (α₁ + 1) × … × (αᵣ + 1) : ici <strong>{total}</strong>.
            </p>
            <div className="flex flex-wrap gap-2">
              <Bouton onClick={() => setListe(!liste)} disabled={total > 2000}>{liste ? "Masquer les diviseurs" : "Afficher tous les diviseurs"}</Bouton>
              <Bouton onClick={() => setChoix([])} disabled={choix.every((x) => !x)}>Recommencer</Bouton>
            </div>
            {divs.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label={`Diviseurs positifs de ${n}`}>
                {divs.map((x) => (
                  <li key={x} className={`rounded-full border px-2.5 py-1 text-sm ${x === d ? "border-fh-bleu-vif bg-fh-bleu-vif font-bold text-white" : "border-fh-sable bg-white text-fh-bleu"}`}>
                    {x}
                  </li>
                ))}
              </ul>
            )}
            {liste && <p className="text-sm text-fh-ardoise">{divs.length} diviseurs, rangés dans l&apos;ordre croissant, sans doublon.</p>}
          </Zone>

          <Defi>
            <p className="text-sm text-fh-ardoise">Avant d&apos;afficher la liste, combien de diviseurs positifs a {n} ?</p>
            <div className="flex flex-wrap items-end gap-2">
              <ChampNombre etiquette="Ton nombre de diviseurs" valeur={devine} onChange={(v) => { setDevine(v); setVerifDevine(false); }} erreur={devine === "" || lg.ok ? null : lg.erreur} />
              <Bouton variante="plein" onClick={() => setVerifDevine(true)} disabled={!lg.ok}>Vérifier</Bouton>
            </div>
            {verifDevine && lg.ok && (
              <Message type={lg.valeur === total ? "ok" : "erreur"}>
                {lg.valeur === total ? `Exact : ${total} diviseurs.` : `Pas tout à fait : on multiplie les nombres de choix, (exposant + 1) pour chaque facteur premier.`}
              </Message>
            )}
          </Defi>
        </>
      )}
    </div>
  );
}

type TypeOp = "pgcd" | "ppcm";

function ExtensionPgcdPpcm() {
  const [sa, setSa] = useState("360");
  const [sb, setSb] = useState("150");
  const [type, setType] = useState<TypeOp>("pgcd");
  const [guide, setGuide] = useState(true);
  const [choix, setChoix] = useState<number[] | null>(null);
  const [valide, setValide] = useState(false);

  const la = lireNaturel(sa, 1, MAX_NOMBRE);
  const lb = lireNaturel(sb, 1, MAX_NOMBRE);
  const r = la.ok && lb.ok ? pgcdPpcmExposants(la.valeur, lb.valeur) : null;
  const c = r ? r.lignes.map((l, i) => choix?.[i] ?? 0) : [];
  const attendu = r ? r.lignes.map((l) => (type === "pgcd" ? l.min : l.max)) : [];
  const juste = r !== null && c.every((x, i) => x === attendu[i]);
  const valeurChoisie = r ? r.lignes.reduce((acc, l, i) => acc * BigInt(l.p) ** BigInt(c[i]), BigInt(1)) : BigInt(1);

  function reinit() {
    setChoix(null);
    setValide(false);
  }
  function maj(i: number, v: number) {
    if (!r) return;
    setChoix(r.lignes.map((_, j) => (j === i ? v : (choix?.[j] ?? 0))));
    setValide(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <div className="flex flex-wrap gap-3">
          <ChampNombre etiquette="Entier a" valeur={sa} onChange={(v) => { setSa(v); reinit(); }} erreur={la.ok ? null : la.erreur} />
          <ChampNombre etiquette="Entier b" valeur={sb} onChange={(v) => { setSb(v); reinit(); }} erreur={lb.ok ? null : lb.erreur} />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
          <Pastille onClick={() => { setSa("360"); setSb("150"); reinit(); }}>360 et 150</Pastille>
          <Pastille onClick={() => { setSa("2310"); setSb("1050"); reinit(); }}>2 310 et 1 050</Pastille>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Opération et mode">
          <Pastille actif={type === "pgcd"} onClick={() => { setType("pgcd"); reinit(); }}>Je construis le PGCD</Pastille>
          <Pastille actif={type === "ppcm"} onClick={() => { setType("ppcm"); reinit(); }}>Je construis le PPCM</Pastille>
          <Pastille actif={guide} onClick={() => setGuide(!guide)}>Mode guidé</Pastille>
        </div>
      </Zone>

      {r && la.ok && lb.ok && (
        <>
          <Zone titre="Simulation">
            <Tex bloc expr={`${texNombre(la.valeur)} = ${texFacteurs(facteursPremiers(la.valeur))}`} />
            <Tex bloc expr={`${texNombre(lb.valeur)} = ${texFacteurs(facteursPremiers(lb.valeur))}`} />
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[20rem] border-separate border-spacing-y-1 text-center text-sm" aria-label="Exposants des facteurs premiers">
                <thead>
                  <tr className="text-xs text-fh-ardoise/80">
                    <th scope="col">Facteur</th>
                    <th scope="col">Dans a</th>
                    <th scope="col">Dans b</th>
                    <th scope="col">Ton exposant ({type === "pgcd" ? "PGCD" : "PPCM"})</th>
                    {guide && <th scope="col">Règle</th>}
                  </tr>
                </thead>
                <tbody>
                  {r.lignes.map((l, i) => (
                    <tr key={l.p} className="bg-fh-accent/30">
                      <th scope="row" className="font-bold text-fh-bleu">{l.p}</th>
                      <td>{l.ea}</td>
                      <td>{l.eb}</td>
                      <td>
                        <div className="flex justify-center">
                          <Stepper etiquette={`Exposant de ${l.p} dans le ${type === "pgcd" ? "PGCD" : "PPCM"}`} valeur={c[i]} min={0} max={Math.max(l.ea, l.eb) + 1} onChange={(v) => maj(i, v)} />
                        </div>
                      </td>
                      {guide && <td className="text-xs text-fh-ardoise">{type === "pgcd" ? `plus petit : min(${l.ea}, ${l.eb}) = ${l.min}` : `plus grand : max(${l.ea}, ${l.eb}) = ${l.max}`}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Tex bloc expr={`${type === "pgcd" ? "\\mathrm{PGCD}" : "\\mathrm{PPCM}"} = ${r.lignes.map((l, i) => `${l.p}^{${c[i]}}`).join(" \\times ")} = ${texNombre(valeurChoisie)}`} />
            <div className="flex flex-wrap gap-2">
              <Bouton variante="plein" onClick={() => setValide(true)}>Valider</Bouton>
              <Bouton onClick={reinit}>Recommencer</Bouton>
            </div>
            {valide &&
              (juste ? (
                <Message type="ok">
                  Exact : {type === "pgcd" ? "pour le PGCD, on garde le plus petit exposant de chaque facteur" : "pour le PPCM, on garde le plus grand exposant de chaque facteur"}.
                </Message>
              ) : (
                <Message type="erreur">
                  Ce n&apos;est pas le {type === "pgcd" ? "PGCD" : "PPCM"}. {type === "pgcd" ? "Le PGCD garde, pour chaque facteur, le plus petit des deux exposants." : "Le PPCM garde, pour chaque facteur, le plus grand des deux exposants."}
                </Message>
              ))}
          </Zone>
          <Zone titre="Résultat" ton="resultat">
            {valide && juste ? (
              <>
                <Tex bloc expr={`\\mathrm{PGCD}(a, b) = ${texNombre(r.pgcd)},\\quad \\mathrm{PPCM}(a, b) = ${texNombre(r.ppcm)}`} />
                <Tex bloc expr={`${texNombre(r.pgcd)} \\times ${texNombre(r.ppcm)} = ${texNombre(r.pgcd * r.ppcm)} = ${texNombre(la.valeur)} \\times ${texNombre(lb.valeur)}`} />
                <p className="text-sm text-fh-ardoise">{r.verifie ? "PGCD(a, b) × PPCM(a, b) = a × b : vérifié, et recoupé avec l'algorithme d'Euclide." : "Incohérence détectée."}</p>
              </>
            ) : (
              <p className="text-sm text-fh-ardoise">Le PGCD, le PPCM et la vérification du produit apparaissent après une validation juste.</p>
            )}
          </Zone>
        </>
      )}
    </div>
  );
}

export default function SimDiviseurs() {
  const [partie, setPartie] = useState<"diviseurs" | "pgcd">("diviseurs");
  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-rose-500 bg-rose-50">
        La décomposition en facteurs premiers permet de <strong>construire tous les diviseurs</strong> d&apos;un entier et de les compter. Elle donne aussi le PGCD et le PPCM de deux entiers.
      </Intro>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Partie du constructeur">
        <Pastille actif={partie === "diviseurs"} onClick={() => setPartie("diviseurs")}>Construire un diviseur</Pastille>
        <Pastille actif={partie === "pgcd"} onClick={() => setPartie("pgcd")}>Extension : PGCD et PPCM</Pastille>
      </div>
      {partie === "diviseurs" ? <ConstructeurDiviseur /> : <ExtensionPgcdPpcm />}
      <Conclusion>
        <div className="flex flex-col gap-2">
          <p>Si un entier se décompose en</p>
          <Tex bloc expr={"n = p_1^{\\alpha_1}\\times p_2^{\\alpha_2}\\times\\cdots\\times p_r^{\\alpha_r}"} />
          <p>
            alors chaque diviseur positif de n correspond à un choix d&apos;exposants <Tex expr={"\\beta_i"} /> avec <Tex expr={"0\\leq\\beta_i\\leq\\alpha_i"} />.
          </p>
          <p>Nombre de diviseurs positifs :</p>
          <Tex bloc className="whitespace-nowrap" expr={"(\\alpha_1+1)(\\alpha_2+1)\\cdots(\\alpha_r+1)"} />
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>PGCD : on prend le plus petit exposant de chaque facteur commun.</li>
            <li>PPCM : on prend le plus grand exposant de chaque facteur.</li>
          </ul>
          <p>Relation :</p>
          <Tex bloc className="whitespace-nowrap" expr={"\\mathrm{PGCD}(a,b)\\times\\mathrm{PPCM}(a,b)=a\\times b"} />
          <div className="mt-1 flex flex-col gap-1 rounded-lg border border-emerald-300 bg-white p-3" aria-label="Exemple concret">
            <p className="font-semibold text-emerald-900">Exemple concret</p>
            <p>
              Prenons <Tex className="whitespace-nowrap" expr={"n = 360 = 2^3\\times3^2\\times5"} />.
            </p>
            <p>Nombre de diviseurs :</p>
            <Tex bloc className="whitespace-nowrap" expr={"(3+1)(2+1)(1+1) = 4\\times3\\times2 = 24"} />
            <p>24 diviseurs.</p>
            <p>Avec :</p>
            <Tex bloc className="whitespace-nowrap" expr={"a = 360 = 2^3\\times3^2\\times5"} />
            <Tex bloc className="whitespace-nowrap" expr={"b = 150 = 2\\times3\\times5^2"} />
            <p>PGCD, exposants min :</p>
            <Tex bloc className="whitespace-nowrap" expr={"2^{\\min(3,1)}\\times3^{\\min(2,1)}\\times5^{\\min(1,2)}"} />
            <Tex bloc className="whitespace-nowrap" expr={"= 2\\times3\\times5 = 30"} />
            <p>PPCM, exposants max :</p>
            <Tex bloc className="whitespace-nowrap" expr={"2^{\\max(3,1)}\\times3^{\\max(2,1)}\\times5^{\\max(1,2)}"} />
            <Tex bloc className="whitespace-nowrap" expr={"= 2^3\\times3^2\\times5^2 = 1\\,800"} />
            <p>Vérification :</p>
            <Tex bloc className="whitespace-nowrap" expr={"30\\times1\\,800 = 54\\,000 = 360\\times150"} />
            <p>Les deux produits valent 54 000. ✓</p>
          </div>
        </div>
      </Conclusion>
    </div>
  );
}
