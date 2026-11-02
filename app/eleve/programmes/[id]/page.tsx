"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { IconAtom, IconBook2, IconCalculator, IconFlask, IconLeaf, IconStack2, type TablerIcon } from "@tabler/icons-react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getProgrammeEleve, type ProgrammeDetailEleve } from "@/lib/eleveApi";
import { listerIdsTelecharges } from "@/lib/offlineStore";
import { matiereResolvable, type MatiereResolvable } from "@/lib/resoudre";
import ThemeAccordion from "@/components/eleve/ThemeAccordion";
import DrawerLateral from "@/components/eleve/DrawerLateral";
import CarteResoudreMatiere from "@/components/eleve/CarteResoudreMatiere";
import BoutonTesterSimulations from "@/components/labo/BoutonTesterSimulations";
import RenduMarkdown from "@/components/RenduMarkdown";

/** Identité graphique par matière : icône, couleur d'accent du bandeau (carré d'icône) et dégradé de fond. */
const IDENTITES: Record<MatiereResolvable, { icone: TablerIcon; carre: string; fond: string }> = {
  maths: { icone: IconCalculator, carre: "bg-[#F97316]", fond: "from-[#1D4ED8] via-[#1D4ED8] to-[#102A66]" },
  physique: { icone: IconAtom, carre: "bg-[#0891B2]", fond: "from-[#0284C7] via-[#1D4ED8] to-[#102A66]" },
  chimie: { icone: IconFlask, carre: "bg-[#7C3AED]", fond: "from-[#1D4ED8] via-[#4F46E5] to-[#102A66]" },
  svt: { icone: IconLeaf, carre: "bg-[#10B981]", fond: "from-[#1D4ED8] via-[#0E6BA8] to-[#102A66]" },
};
const IDENTITE_DEFAUT = { icone: IconBook2, carre: "bg-[#F97316]", fond: "from-[#1D4ED8] to-[#102A66]" };

export default function ProgrammeEleveDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const programmeId = Number(params.id);
  const { user } = useAuth();
  const abonnementActif = user?.aUnAbonnementActif ?? false;

  const [programme, setProgramme] = useState<ProgrammeDetailEleve | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [themeOuvertId, setThemeOuvertId] = useState<number | null>(null);
  const [presentationOuverte, setPresentationOuverte] = useState(false);
  const [idsTelecharges, setIdsTelecharges] = useState<Set<number>>(new Set());

  useEffect(() => {
    let actif = true;
    listerIdsTelecharges().then((ids) => {
      if (actif) setIdsTelecharges(ids);
    });
    return () => {
      actif = false;
    };
  }, []);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const data = await getProgrammeEleve(programmeId);
        if (actif) setProgramme(data);
      } catch (error) {
        if (actif) {
          setErreur(
            error instanceof ApiError && error.status === 404
              ? "Programme introuvable."
              : "Impossible de charger ce programme."
          );
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [programmeId]);

  function toggleTheme(id: number) {
    setThemeOuvertId((courant) => (courant === id ? null : id));
  }

  if (chargement) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement du programme">
        <div className="h-14 animate-pulse rounded-2xl bg-fh-sable/50" />
        <div className="h-16 animate-pulse rounded-2xl bg-fh-sable/50" />
        <div className="h-16 animate-pulse rounded-2xl bg-fh-sable/50" />
      </div>
    );
  }

  if (erreur || !programme) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-fh-ardoise">{erreur ?? "Programme introuvable."}</p>
        <button
          type="button"
          onClick={() => router.push("/eleve")}
          className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          ← Retour
        </button>
      </div>
    );
  }

  const cleMatiere = matiereResolvable(programme.matiere.nom);
  const identite = cleMatiere ? IDENTITES[cleMatiere] : IDENTITE_DEFAUT;
  const IconeMatiere = identite.icone;
  const classe = programme.serie ? `${programme.niveau.nom} ${programme.serie.nom}` : programme.niveau.nom;

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5">
      <section
        aria-label="Matière"
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br px-5 py-5 text-white shadow-md sm:px-8 sm:py-7 ${identite.fond}`}
      >
        <Link
          href="/eleve"
          className="inline-flex min-h-10 items-center rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          ← Retour
        </Link>
        <div className="relative mt-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <span
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm sm:h-20 sm:w-20 ${identite.carre}`}
              aria-hidden="true"
            >
              <IconeMatiere size={44} stroke={1.6} />
            </span>
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-extrabold leading-tight sm:text-4xl">{programme.matiere.nom}</h1>
              <p className="mt-1.5 inline-block rounded-full bg-white/15 px-3 py-0.5 text-sm font-semibold sm:text-base">{classe}</p>
            </div>
          </div>
          <IconeMatiere size={130} stroke={1.25} className="hidden shrink-0 text-white/25 md:block" aria-hidden="true" />
        </div>
      </section>

      {programme.presentation.trim() && (
        <>
          <button
            type="button"
            onClick={() => setPresentationOuverte(true)}
            className="min-h-11 self-start rounded-full border-2 border-[#1D4ED8]/30 bg-blue-50 px-5 py-2 text-sm font-bold text-[#102A66] transition-colors hover:bg-blue-100"
          >
            Présentation du programme
          </button>
          <DrawerLateral
            ouvert={presentationOuverte}
            onFermer={() => setPresentationOuverte(false)}
            titre="Présentation du programme"
          >
            <RenduMarkdown contenu={programme.presentation} />
          </DrawerLateral>
        </>
      )}

      <CarteResoudreMatiere programmeId={programme.id} matiereNom={programme.matiere.nom} />

      <BoutonTesterSimulations programmeId={programme.id} matiereNom={programme.matiere.nom} />

      {programme.themes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-white py-12 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            🗂️
          </span>
          <p className="text-sm text-fh-ardoise">Le programme de cette matière arrive bientôt.</p>
        </div>
      ) : (
        <section aria-labelledby="titre-programme" className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="titre-programme" className="flex items-center gap-3 text-xl font-extrabold text-[#102A66] sm:text-2xl">
              <IconStack2 size={32} stroke={1.75} className="shrink-0 text-[#1D4ED8]" aria-hidden="true" />
              Programme de la matière
            </h2>
            <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-[#102A66]">
              {programme.themes.length} chapitre{programme.themes.length > 1 ? "s" : ""}
            </span>
          </div>
          {programme.themes.map((theme, index) => (
            <ThemeAccordion
              key={theme.id}
              theme={theme}
              position={index + 1}
              expanded={themeOuvertId === theme.id}
              onToggle={() => toggleTheme(theme.id)}
              idsTelecharges={idsTelecharges}
              abonnementActif={abonnementActif}
            />
          ))}
        </section>
      )}
    </div>
  );
}
