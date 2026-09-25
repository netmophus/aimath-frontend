import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BoutonRetour from "@/components/programme/BoutonRetour";
import CarteNavigation from "@/components/programme/CarteNavigation";
import CtaCreerCompte from "@/components/programme/CtaCreerCompte";
import FilAriane from "@/components/programme/FilAriane";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SERIES_PAR_NIVEAU, trouverNiveauLycee } from "@/lib/programmeLyceeStatique";

interface PageProps {
  params: Promise<{ niveau: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { niveau: niveauId } = await params;
  const niveau = trouverNiveauLycee(niveauId);
  return { title: niveau ? `Programme de ${niveau.nom} — Fahimta` : "Fahimta" };
}

/**
 * NIVEAU 2 du parcours : choix de la série pour le niveau donné (ex.
 * Terminale → A/C/D). `niveau` non reconnu → 404.
 */
export default async function ProgrammeNiveauLyceePage({ params }: PageProps) {
  const { niveau: niveauId } = await params;
  const niveau = trouverNiveauLycee(niveauId);
  if (!niveau) notFound();

  const series = SERIES_PAR_NIVEAU[niveau.id];

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <BoutonRetour href="/programme/lycee" label="Retour aux niveaux du lycée" />

        <FilAriane
          maillons={[
            { label: "Lycée", href: "/programme/lycee" },
            { label: niveau.nom },
          ]}
        />

        <h1 className="mt-3 text-2xl font-bold text-fh-bleu sm:text-3xl">
          Programme de {niveau.nom}
        </h1>
        <p className="mt-2 text-sm text-fh-ardoise sm:text-base">Choisis ta série.</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {series.map((serie) => (
            <CarteNavigation
              key={serie.id}
              href={`/programme/lycee/${niveau.id}/${serie.id}`}
              titre={serie.nom}
            />
          ))}
        </div>

        <CtaCreerCompte />
      </main>
      <Footer />
    </>
  );
}
