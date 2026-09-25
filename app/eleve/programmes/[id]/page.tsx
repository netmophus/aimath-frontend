"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getProgrammeEleve, type ProgrammeDetailEleve } from "@/lib/eleveApi";
import { listerIdsTelecharges } from "@/lib/offlineStore";
import ThemeAccordion from "@/components/eleve/ThemeAccordion";

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

  const classe = programme.serie ? `${programme.niveau.nom} ${programme.serie.nom}` : programme.niveau.nom;

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
      <Link href="/eleve" className="text-sm font-medium text-fh-bleu hover:underline">
        ← Retour
      </Link>

      <div>
        <h1 className="text-lg font-bold text-fh-bleu">{programme.matiere.nom}</h1>
        <p className="text-sm text-fh-ardoise">{classe}</p>
      </div>

      {programme.themes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            🗂️
          </span>
          <p className="text-sm text-fh-ardoise">Le programme de cette matière arrive bientôt.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
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
        </div>
      )}
    </div>
  );
}
