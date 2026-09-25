import type { Metadata } from "next";
import CarteNavigation from "@/components/programme/CarteNavigation";
import CtaCreerCompte from "@/components/programme/CtaCreerCompte";
import FilAriane from "@/components/programme/FilAriane";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NIVEAUX_LYCEE } from "@/lib/programmeLyceeStatique";

export const metadata: Metadata = {
  title: "Programme du lycée — Fahimta",
};

/**
 * NIVEAU 1 du parcours /programme/lycee/[niveau]/[serie]/[matiere] : choix
 * du niveau (Seconde/Première/Terminale). Page publique, aucune garde
 * d'authentification — même principe que /programme/college.
 */
export default function ProgrammeLyceePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane maillons={[{ label: "Lycée" }]} />

        <h1 className="mt-3 text-2xl font-bold text-fh-bleu sm:text-3xl">
          Programme du lycée
        </h1>
        <p className="mt-2 text-sm text-fh-ardoise sm:text-base">
          Choisis ta classe pour voir le programme officiel du Niger.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {NIVEAUX_LYCEE.map((niveau) => (
            <CarteNavigation
              key={niveau.id}
              href={`/programme/lycee/${niveau.id}`}
              titre={niveau.nom}
            />
          ))}
        </div>

        <CtaCreerCompte />
      </main>
      <Footer />
    </>
  );
}
