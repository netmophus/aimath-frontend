"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getMesLecons, getMonProgramme, type LeconListeEleve, type ProgrammeEleve } from "@/lib/eleveApi";
import SalutEleve from "@/components/eleve/SalutEleve";
import CarteReprendre from "@/components/eleve/CarteReprendre";
import CarteMatiere from "@/components/eleve/CarteMatiere";

export default function EleveDashboardPage() {
  const { user } = useAuth();

  const [programmes, setProgrammes] = useState<ProgrammeEleve[]>([]);
  const [chargementProgrammes, setChargementProgrammes] = useState(true);
  const [erreurProgrammes, setErreurProgrammes] = useState<string | null>(null);

  // "Reprendre" : pas de suivi de progression pour l'instant — en attendant,
  // proxy = la 1re leçon publiée de la classe (peu importe l'ordre exact).
  // Best-effort : un échec ici bascule simplement sur la carte de repli, sans
  // jamais bloquer le reste du dashboard.
  const [leconAReprendre, setLeconAReprendre] = useState<LeconListeEleve | null>(null);
  const [chargementReprendre, setChargementReprendre] = useState(true);

  useEffect(() => {
    let actif = true;

    async function chargerProgrammes() {
      setChargementProgrammes(true);
      setErreurProgrammes(null);
      try {
        const data = await getMonProgramme();
        if (actif) setProgrammes(data);
      } catch (error) {
        if (actif) {
          setErreurProgrammes(error instanceof ApiError ? error.message : "Impossible de charger ton programme.");
        }
      } finally {
        if (actif) setChargementProgrammes(false);
      }
    }

    async function chargerReprendre() {
      setChargementReprendre(true);
      try {
        const data = await getMesLecons();
        if (actif) setLeconAReprendre(data[0] ?? null);
      } catch {
        if (actif) setLeconAReprendre(null);
      } finally {
        if (actif) setChargementReprendre(false);
      }
    }

    chargerProgrammes();
    chargerReprendre();
    return () => {
      actif = false;
    };
  }, []);

  const classe = user?.serie ? `${user.niveau} ${user.serie}` : user?.niveau ?? null;

  // Une seule matière → on peut désigner sa page programme sans ambiguïté
  // (bouton de repli de CarteReprendre ; l'onglet "Cours" de la barre basse
  // fait le même calcul de son côté, voir EleveLayoutClient). Plusieurs (ou
  // aucune) → pas de cible unique : la grille "Mes matières" juste en
  // dessous reste le seul chemin de navigation dans ce cas.
  const hrefUniqueMatiere = programmes.length === 1 ? `/eleve/programmes/${programmes[0].id}` : null;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8">
      <SalutEleve prenom={user?.prenom ?? ""} nom={user?.nom ?? ""} classe={classe} />

      <div className="mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-8">
        {chargementReprendre ? (
          <div className="h-48 animate-pulse rounded-2xl bg-fh-sable/50" aria-busy="true" aria-label="Chargement" />
        ) : (
          <CarteReprendre lecon={leconAReprendre} hrefProgramme={hrefUniqueMatiere} />
        )}

        <section id="mes-matieres" className="scroll-mt-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-fh-bleu">Mes matières</h2>
            <Link href="/eleve/telechargees" className="text-xs font-medium text-fh-bleu hover:underline">
              📥 Hors-ligne
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {chargementProgrammes ? (
              <>
                <div className="h-28 animate-pulse rounded-2xl bg-fh-sable/50" />
                <div className="h-28 animate-pulse rounded-2xl bg-fh-sable/50" />
              </>
            ) : erreurProgrammes ? (
              <p className="col-span-full rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreurProgrammes}</p>
            ) : programmes.length === 0 ? (
              <div className="col-span-full flex flex-col items-center gap-2 rounded-2xl bg-white py-10 text-center ring-1 ring-fh-sable">
                <span className="text-3xl" aria-hidden="true">
                  📚
                </span>
                <p className="text-sm text-fh-ardoise">Ton programme arrive bientôt.</p>
              </div>
            ) : (
              programmes.map((programme) => <CarteMatiere key={programme.id} programme={programme} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
