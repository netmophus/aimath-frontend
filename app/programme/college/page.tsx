import type { Metadata } from "next";
import CarteNavigation from "@/components/programme/CarteNavigation";
import CtaCreerCompte from "@/components/programme/CtaCreerCompte";
import FilAriane from "@/components/programme/FilAriane";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NIVEAUX_COLLEGE } from "@/lib/programmeCollegeStatique";

export const metadata: Metadata = {
  title: "Programme du collège — Fahimta",
};

/**
 * NIVEAU 1 du parcours /programme/college/[niveau]/[matiere] : choix du
 * niveau (6e/5e/4e/3e). Page publique, aucune garde d'authentification
 * (pas de middleware global sur /programme, pas de layout élève ici).
 */
export default function ProgrammeCollegePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane maillons={[{ label: "Collège" }]} />

        <h1 className="mt-3 text-2xl font-bold text-fh-bleu sm:text-3xl">
          Programme du collège
        </h1>
        <p className="mt-2 text-sm text-fh-ardoise sm:text-base">
          Choisis ta classe pour voir le programme officiel du Niger.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {NIVEAUX_COLLEGE.map((niveau) => (
            <CarteNavigation
              key={niveau.id}
              href={`/programme/college/${niveau.id}`}
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
