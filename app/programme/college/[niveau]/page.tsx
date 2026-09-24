import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BoutonRetour from "@/components/programme/BoutonRetour";
import CarteNavigation from "@/components/programme/CarteNavigation";
import CtaCreerCompte from "@/components/programme/CtaCreerCompte";
import FilAriane from "@/components/programme/FilAriane";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MATIERES_COLLEGE, trouverNiveauCollege } from "@/lib/programmeCollegeStatique";

interface PageProps {
  params: Promise<{ niveau: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { niveau: niveauId } = await params;
  const niveau = trouverNiveauCollege(niveauId);
  return { title: niveau ? `Programme de ${niveau.nom} — Fahimta` : "Fahimta" };
}

/**
 * NIVEAU 2 du parcours : choix de la matière pour le niveau donné (ex. 6e).
 * `niveau` non reconnu (pas dans NIVEAUX_COLLEGE) → 404, jamais un niveau
 * inventé à la volée.
 */
export default async function ProgrammeNiveauPage({ params }: PageProps) {
  const { niveau: niveauId } = await params;
  const niveau = trouverNiveauCollege(niveauId);
  if (!niveau) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <BoutonRetour href="/programme/college" label="Retour aux niveaux du collège" />

        <FilAriane
          maillons={[
            { label: "Collège", href: "/programme/college" },
            { label: niveau.nom },
          ]}
        />

        <h1 className="mt-3 text-2xl font-bold text-fh-bleu sm:text-3xl">
          Programme de {niveau.nom}
        </h1>
        <p className="mt-2 text-sm text-fh-ardoise sm:text-base">
          Choisis une matière scientifique.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MATIERES_COLLEGE.map((matiere) => (
            <CarteNavigation
              key={matiere.id}
              href={`/programme/college/${niveau.id}/${matiere.id}`}
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
