import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import SimulationGeogebraCubique from "@/components/labo/SimulationGeogebraCubique";

/**
 * Laboratoire GeoGebra (8B.1) — PROTOTYPE PRIVÉ. La route n'existe qu'en développement local : le contrôle est
 * fait ICI, côté serveur, à chaque requête (`force-dynamic`), et en amont par proxy.ts (vrai 404 hors développement).
 * Aucun lien dans les menus ; seul un bouton provisoire de la page Mathématiques y mène (développement uniquement).
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Laboratoire GeoGebra", robots: { index: false, follow: false } };

/** Seule destination de retour acceptée : la page d'un programme de l'espace élève (évite toute redirection libre). */
function destinationRetour(retour: string | string[] | undefined): string | null {
  return typeof retour === "string" && /^\/eleve\/programmes\/\d+$/.test(retour) ? retour : null;
}

export default async function LaboGeogebraPage({ searchParams }: { searchParams: Promise<{ retour?: string | string[] }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const retour = destinationRetour((await searchParams).retour);
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4">
      <Link href={retour ?? "/eleve"} className="text-sm font-medium text-fh-bleu hover:underline">
        {retour ? "← Retour à Mathématiques" : "← Retour à l'espace élève"}
      </Link>
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-300">
        Page de test interne, visible uniquement en développement local. Ne pas communiquer ce lien.
      </p>
      <SimulationGeogebraCubique />
    </div>
  );
}
