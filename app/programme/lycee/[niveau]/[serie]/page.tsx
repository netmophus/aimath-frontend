import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BoutonRetour from "@/components/programme/BoutonRetour";
import CarteNavigation from "@/components/programme/CarteNavigation";
import CtaCreerCompte from "@/components/programme/CtaCreerCompte";
import FilAriane from "@/components/programme/FilAriane";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  matieresDisponiblesLycee,
  trouverNiveauLycee,
  trouverSerieLycee,
} from "@/lib/programmeLyceeStatique";

interface PageProps {
  params: Promise<{ niveau: string; serie: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { niveau: niveauId, serie: serieId } = await params;
  const niveau = trouverNiveauLycee(niveauId);
  const serie = niveau ? trouverSerieLycee(niveau.id, serieId) : undefined;
  return {
    title: niveau && serie ? `${niveau.nom} ${serie.nom} — Fahimta` : "Fahimta",
  };
}

/**
 * NIVEAU 3 du parcours : choix de la matière pour une série donnée (ex.
 * Terminale C → Mathématiques/Physique/Chimie/SVT). `niveau` non reconnu, ou
 * `serie` non reconnue POUR CE NIVEAU (ex. "d" en Seconde) → 404 — jamais de
 * combinaison niveau/série inventée à la volée.
 *
 * Le nombre de matières affichées varie selon la combinaison (4 dans la
 * grande majorité des cas, 1 seule — Mathématiques — pour Terminale A) :
 * matieresDisponiblesLycee() dérive la liste réelle depuis les données,
 * jamais une liste fixe de 4 matières.
 */
export default async function ProgrammeSerieLyceePage({ params }: PageProps) {
  const { niveau: niveauId, serie: serieId } = await params;
  const niveau = trouverNiveauLycee(niveauId);
  if (!niveau) notFound();
  const serie = trouverSerieLycee(niveau.id, serieId);
  if (!serie) notFound();
  const matieres = matieresDisponiblesLycee(niveau.id, serie.id);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <BoutonRetour
          href={`/programme/lycee/${niveau.id}`}
          label={`Retour aux séries de ${niveau.nom}`}
        />

        <FilAriane
          maillons={[
            { label: "Lycée", href: "/programme/lycee" },
            { label: niveau.nom, href: `/programme/lycee/${niveau.id}` },
            { label: serie.nom },
          ]}
        />

        <h1 className="mt-3 text-2xl font-bold text-fh-bleu sm:text-3xl">
          {niveau.nom} {serie.nom}
        </h1>
        <p className="mt-2 text-sm text-fh-ardoise sm:text-base">
          Choisis une matière scientifique.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {matieres.map((matiere) => (
            <CarteNavigation
              key={matiere.id}
              href={`/programme/lycee/${niveau.id}/${serie.id}/${matiere.id}`}
              titre={matiere.nom}
            />
          ))}
        </div>

        <CtaCreerCompte />
      </main>
      <Footer />
    </>
  );
}
