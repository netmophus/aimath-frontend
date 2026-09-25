import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccordeonThemes from "@/components/programme/AccordeonThemes";
import BoutonRetour from "@/components/programme/BoutonRetour";
import CtaCreerCompte from "@/components/programme/CtaCreerCompte";
import FilAriane from "@/components/programme/FilAriane";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  obtenirProgrammeCollege,
  trouverMatiereCollege,
  trouverNiveauCollege,
} from "@/lib/programmeCollegeStatique";

interface PageProps {
  params: Promise<{ niveau: string; matiere: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { niveau: niveauId, matiere: matiereId } = await params;
  const niveau = trouverNiveauCollege(niveauId);
  const matiere = trouverMatiereCollege(matiereId);
  return {
    title: niveau && matiere ? `${matiere.nom} ${niveau.nom} — Fahimta` : "Fahimta",
  };
}

/**
 * NIVEAU 3 du parcours : programme détaillé (thèmes → chapitres) pour une
 * matière d'un niveau donné. `niveau`/`matiere` non reconnus → 404.
 *
 * Données STATIQUES (lib/programmeCollegeStatique.ts) — les 4 niveaux × 4
 * matières du collège ont toutes leur vrai contenu, aucun placeholder ne
 * subsiste. À remplacer par un appel API public plus tard (voir le
 * commentaire en tête de ce fichier de données).
 */
export default async function ProgrammeMatierePage({ params }: PageProps) {
  const { niveau: niveauId, matiere: matiereId } = await params;
  const niveau = trouverNiveauCollege(niveauId);
  const matiere = trouverMatiereCollege(matiereId);
  if (!niveau || !matiere) notFound();

  const programme = obtenirProgrammeCollege(niveau.id, matiere.id);
  const volumeHoraireTotal = programme.themes.reduce((total, theme) => total + theme.volumeHoraire, 0);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <BoutonRetour
          href={`/programme/college/${niveau.id}`}
          label={`Retour aux matières de ${niveau.nom}`}
        />

        <FilAriane
          maillons={[
            { label: "Collège", href: "/programme/college" },
            { label: niveau.nom, href: `/programme/college/${niveau.id}` },
            { label: matiere.nom },
          ]}
        />

        <h1 className="mt-3 text-2xl font-bold text-fh-bleu sm:text-3xl">
          {matiere.nom} — {niveau.nom}
        </h1>
        {!programme.estPlaceholder && (
          <p className="mt-2 text-sm text-fh-ardoise sm:text-base">
            {programme.themes.length} thèmes · {volumeHoraireTotal} heures au programme
          </p>
        )}

        <div className="mt-8">
          {programme.estPlaceholder ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-16 text-center ring-1 ring-fh-sable">
              <span className="text-3xl" aria-hidden="true">
                📚
              </span>
              <p className="font-semibold text-fh-bleu">Programme bientôt disponible</p>
              <p className="max-w-xs text-sm text-fh-ardoise">
                Le détail de {matiere.nom.toLowerCase()} {niveau.nom} arrive prochainement.
              </p>
            </div>
          ) : (
            <AccordeonThemes themes={programme.themes} />
          )}
        </div>

        <CtaCreerCompte />
      </main>
      <Footer />
    </>
  );
}
