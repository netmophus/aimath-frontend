import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccordeonThemes from "@/components/programme/AccordeonThemes";
import BoutonRetour from "@/components/programme/BoutonRetour";
import CtaCreerCompte from "@/components/programme/CtaCreerCompte";
import FilAriane from "@/components/programme/FilAriane";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  obtenirProgrammeLycee,
  trouverMatiereLycee,
  trouverNiveauLycee,
  trouverSerieLycee,
} from "@/lib/programmeLyceeStatique";

interface PageProps {
  params: Promise<{ niveau: string; serie: string; matiere: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { niveau: niveauId, serie: serieId, matiere: matiereId } = await params;
  const niveau = trouverNiveauLycee(niveauId);
  const serie = niveau ? trouverSerieLycee(niveau.id, serieId) : undefined;
  const matiere = trouverMatiereLycee(matiereId);
  return {
    title:
      niveau && serie && matiere
        ? `${matiere.nom} ${niveau.nom} ${serie.nom} — Fahimta`
        : "Fahimta",
  };
}

/**
 * NIVEAU 4 du parcours : programme détaillé (thèmes → chapitres) pour une
 * matière d'une série d'un niveau donné. `niveau`/`serie` (pour ce
 * niveau)/`matiere` non reconnus → 404.
 *
 * Données STATIQUES (lib/programmeLyceeStatique.ts) — toute la Seconde
 * (A et C) et Première × Séries A et D sont déjà remplies ; Première C et
 * toute la Terminale sont encore PROGRAMME_PLACEHOLDER et seront intégrées
 * niveau/série par niveau/série dans un second temps.
 */
export default async function ProgrammeMatiereLyceePage({ params }: PageProps) {
  const { niveau: niveauId, serie: serieId, matiere: matiereId } = await params;
  const niveau = trouverNiveauLycee(niveauId);
  if (!niveau) notFound();
  const serie = trouverSerieLycee(niveau.id, serieId);
  if (!serie) notFound();
  const matiere = trouverMatiereLycee(matiereId);
  if (!matiere) notFound();

  const programme = obtenirProgrammeLycee(niveau.id, serie.id, matiere.id);
  const volumeHoraireTotal = programme.themes.reduce((total, theme) => total + theme.volumeHoraire, 0);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <BoutonRetour
          href={`/programme/lycee/${niveau.id}/${serie.id}`}
          label={`Retour aux matières de ${niveau.nom} ${serie.nom}`}
        />

        <FilAriane
          maillons={[
            { label: "Lycée", href: "/programme/lycee" },
            { label: niveau.nom, href: `/programme/lycee/${niveau.id}` },
            { label: serie.nom, href: `/programme/lycee/${niveau.id}/${serie.id}` },
            { label: matiere.nom },
          ]}
        />

        <h1 className="mt-3 text-2xl font-bold text-fh-bleu sm:text-3xl">
          {matiere.nom} — {niveau.nom} {serie.nom}
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
                Le détail de {matiere.nom.toLowerCase()} {niveau.nom} {serie.nom} arrive
                prochainement.
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
