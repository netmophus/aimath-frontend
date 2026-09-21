"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { ApiError } from "@/lib/api";
import { getLeconEleve, type LeconEleve, type TermeGlossaireEleve } from "@/lib/eleveApi";
import { getLeconLocale, listerIdsTelecharges } from "@/lib/offlineStore";
import { extraireMatiere } from "@/lib/contexteLecon";
import { decouperSections } from "@/lib/decouperSections";
import RenduMarkdown from "@/components/RenduMarkdown";
import SectionLecon from "@/components/eleve/SectionLecon";
import OngletsLecon, { type CouleurOnglet, type Onglet } from "@/components/eleve/OngletsLecon";
import CarteSection from "@/components/eleve/CarteSection";
import CarteExercice from "@/components/eleve/CarteExercice";
import ModaleTerme from "@/components/eleve/ModaleTerme";
import BoutonTelecharger from "@/components/eleve/BoutonTelecharger";

type OngletId = "pourquoi" | "cours" | "demonstrations" | "exercices";

/** Une couleur douce par TYPE d'onglet (son identité, pas sa position) —
 * l'actif repasse toujours en fh-orange plein, voir OngletsLecon.tsx. */
const COULEURS_ONGLET: Record<OngletId, CouleurOnglet> = {
  pourquoi: { fond: "#EAF0FB", texte: "#2A4A9E", bordure: "#D5E0F5" },
  cours: { fond: "#FCE9DE", texte: "#A52D0E", bordure: "#F0D8BF" },
  demonstrations: { fond: "#FBEEE7", texte: "#A8481F", bordure: "#F3D9CB" },
  exercices: { fond: "#EAF5EF", texte: "#1F7A55", bordure: "#CDE9DB" },
};

function estVide(texte: string): boolean {
  return texte.trim().length === 0;
}

/** D'où vient le contenu actuellement affiché — détermine comment le
 * glossaire résout ses termes (voir ModaleTerme) : réseau → API classique,
 * locale → dictionnaire stocké avec le téléchargement (jamais d'appel réseau). */
type SourceLecon = "reseau" | "locale";

export default function LeconEleveDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leconId = Number(params.id);

  const [lecon, setLecon] = useState<LeconEleve | null>(null);
  const [source, setSource] = useState<SourceLecon | null>(null);
  const [termesLocaux, setTermesLocaux] = useState<Record<string, TermeGlossaireEleve> | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ongletActif, setOngletActif] = useState<OngletId>("cours");
  const [slugOuvert, setSlugOuvert] = useState<string | null>(null);
  const [idsTelecharges, setIdsTelecharges] = useState<Set<number>>(new Set());

  // Stratégie de lecture : réseau d'abord — TOUJOURS tenté, indépendamment de
  // navigator.onLine (qui ne détecte qu'une coupure au niveau de l'appareil,
  // pas un backend simplement injoignable pendant que le Wi-Fi reste actif) —
  // puis repli sur la copie locale (IndexedDB) si l'appel échoue ou si aucun
  // réseau n'est disponible. Une leçon jamais téléchargée et inatteignable
  // affiche un message clair plutôt qu'une page cassée. On privilégie donc la
  // fraîcheur (réseau) quand elle est possible, la disponibilité (local)
  // sinon — pas de "local-first" systématique pour les leçons téléchargées :
  // ça éviterait un aller-retour réseau, mais afficherait une version parfois
  // périmée alors que le réseau est là ; le gain de vitesse ne semblait pas
  // justifier ce compromis ici.
  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      setSource(null);
      setTermesLocaux(null);

      let donneesReseau: LeconEleve | null = null;
      let erreurReseau: unknown = null;
      try {
        donneesReseau = await getLeconEleve(leconId);
      } catch (error) {
        erreurReseau = error;
      }

      if (!actif) return;

      if (donneesReseau) {
        setLecon(donneesReseau);
        setSource("reseau");
        setChargement(false);
        return;
      }

      const locale = await getLeconLocale(leconId);
      if (!actif) return;

      if (locale) {
        setLecon(locale.contenuComplet);
        setTermesLocaux(locale.termesGlossaire);
        setSource("locale");
        setChargement(false);
        return;
      }

      setErreur(
        erreurReseau instanceof ApiError && erreurReseau.status === 404
          ? "Cette leçon n'est pas disponible."
          : "Cette leçon n'est pas disponible hors-ligne. Connecte-toi pour la consulter."
      );
      setChargement(false);
    }

    charger();
    return () => {
      actif = false;
    };
  }, [leconId]);

  // Pour le bouton "Voir la leçon" du glossaire en mode hors-ligne (voir
  // ModaleTerme) : quelles leçons sont, elles aussi, disponibles localement.
  useEffect(() => {
    let actif = true;
    listerIdsTelecharges().then((ids) => {
      if (actif) setIdsTelecharges(ids);
    });
    return () => {
      actif = false;
    };
  }, []);

  function surChangementTelechargement(telechargee: boolean) {
    setIdsTelecharges((precedent) => {
      const suivant = new Set(precedent);
      if (telechargee) suivant.add(leconId);
      else suivant.delete(leconId);
      return suivant;
    });
  }

  if (chargement) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3" aria-busy="true" aria-label="Chargement de la leçon">
        <div className="h-4 w-40 animate-pulse rounded bg-fh-sable/50" />
        <div className="h-7 w-64 animate-pulse rounded bg-fh-sable/50" />
        <div className="h-10 animate-pulse rounded-2xl bg-fh-sable/50" />
        <div className="h-40 animate-pulse rounded-2xl bg-fh-sable/50" />
      </div>
    );
  }

  if (erreur || !lecon) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-fh-ardoise">{erreur ?? "Leçon introuvable."}</p>
        <button
          type="button"
          onClick={() => router.push("/eleve")}
          className="min-h-11 rounded-full border border-fh-bleu/20 px-4 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          ← Retour
        </button>
      </div>
    );
  }

  const matiere = extraireMatiere(lecon.notion.programme.libelle);
  const aVideosOuRessources = lecon.videos.length > 0 || lecon.ressources.length > 0;

  // Un onglet ne s'affiche que si son contenu existe (pas d'onglet vide) —
  // "Cours" reste toujours présent : c'est l'ancre principale, même quand son
  // propre texte (cours_redige) est vide, elle porte objectifs/prérequis/
  // à retenir/vidéos/ressources (voir plus bas, avec son propre repli).
  const onglets: Onglet<OngletId>[] = [];
  if (!estVide(lecon.histoire)) {
    onglets.push({ id: "pourquoi", label: "Pourquoi cette notion ?", couleur: COULEURS_ONGLET.pourquoi });
  }
  onglets.push({ id: "cours", label: "Cours", couleur: COULEURS_ONGLET.cours });
  if (!estVide(lecon.demonstrations)) {
    onglets.push({ id: "demonstrations", label: "Démonstrations", couleur: COULEURS_ONGLET.demonstrations });
  }
  if (lecon.exercices.length > 0) {
    onglets.push({ id: "exercices", label: "Exercices", couleur: COULEURS_ONGLET.exercices });
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Link href={`/eleve/programmes/${lecon.notion.programme.id}`} className="text-sm font-medium text-fh-bleu hover:underline">
          ← Retour au programme
        </Link>
        <div className="flex items-center gap-2">
          <p className="truncate text-xs text-fh-ardoise">
            {matiere} · {lecon.notion.theme.titre} · {lecon.notion.chapitre.titre}
          </p>
          {source === "locale" && (
            <span className="shrink-0 rounded-full bg-fh-sable/60 px-2 py-0.5 text-[11px] font-medium text-fh-ardoise/70">
              Hors-ligne
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-fh-bleu">{lecon.titre}</h1>
        <div>
          <BoutonTelecharger leconId={leconId} onChange={surChangementTelechargement} />
        </div>
      </div>

      <OngletsLecon onglets={onglets} actif={ongletActif} onChange={setOngletActif} />

      {ongletActif === "pourquoi" && (
        <div className="flex flex-col gap-5">
          {decouperSections(lecon.histoire).map((section, index) =>
            section.titre ? (
              <CarteSection
                key={`${index}-${section.titre}`}
                titre={section.titre}
                contenu={section.contenu}
                onTermeClick={setSlugOuvert}
              />
            ) : (
              <RenduMarkdown key={`${index}-intro`} contenu={section.contenu} onTermeClick={setSlugOuvert} />
            )
          )}
        </div>
      )}

      {ongletActif === "cours" && (
        <div className="flex flex-col gap-6">
          {!estVide(lecon.objectifs_pedagogiques) && (
            <div
              className="rounded-2xl border px-4 py-4"
              style={{ backgroundColor: "#EAF0FB", borderColor: "#D5E0F5" }}
            >
              <p className="mb-1 text-xs font-bold uppercase tracking-wide" style={{ color: "#2A4A9E" }}>
                Objectifs
              </p>
              <RenduMarkdown contenu={lecon.objectifs_pedagogiques} onTermeClick={setSlugOuvert} />
            </div>
          )}

          {!estVide(lecon.prerequis_texte) && (
            <div
              className="rounded-2xl border px-4 py-4"
              style={{ backgroundColor: "#F3EAFB", borderColor: "#E4D3F5" }}
            >
              <p className="mb-1 text-xs font-bold uppercase tracking-wide" style={{ color: "#6B2FA0" }}>
                Prérequis
              </p>
              <RenduMarkdown contenu={lecon.prerequis_texte} onTermeClick={setSlugOuvert} />
            </div>
          )}

          <SectionLecon titre="Cours">
            {estVide(lecon.cours_redige) ? (
              <p className="text-sm text-fh-ardoise/60">Le cours arrive bientôt.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {decouperSections(lecon.cours_redige).map((section, index) =>
                  section.titre ? (
                    <CarteSection
                      key={`${index}-${section.titre}`}
                      titre={section.titre}
                      contenu={section.contenu}
                      onTermeClick={setSlugOuvert}
                    />
                  ) : (
                    <RenduMarkdown key={`${index}-intro`} contenu={section.contenu} onTermeClick={setSlugOuvert} />
                  )
                )}
              </div>
            )}
          </SectionLecon>

          {!estVide(lecon.a_retenir) && (
            <div className="rounded-2xl bg-fh-accent px-4 py-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-fh-orange-fonce">À retenir</p>
              <RenduMarkdown contenu={lecon.a_retenir} onTermeClick={setSlugOuvert} />
            </div>
          )}

          {aVideosOuRessources && (
            <div className="flex flex-col gap-5">
              {lecon.videos.length > 0 && (
                <SectionLecon titre="Vidéos">
                  <ul className="flex flex-col gap-2">
                    {lecon.videos.map((video) => (
                      <li key={`${video.ordre}-${video.titre}`} className="rounded-xl bg-white p-3 ring-1 ring-fh-sable">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-fh-bleu hover:underline"
                        >
                          🎬 {video.titre}
                        </a>
                        {video.description && <p className="mt-1 text-xs text-fh-ardoise">{video.description}</p>}
                      </li>
                    ))}
                  </ul>
                </SectionLecon>
              )}

              {lecon.ressources.length > 0 && (
                <SectionLecon titre="Ressources">
                  <ul className="flex flex-col gap-2">
                    {lecon.ressources.map((ressource) =>
                      ressource.url ? (
                        <li key={`${ressource.ordre}-${ressource.titre}`}>
                          <a
                            href={ressource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-fh-bleu hover:underline"
                          >
                            📎 {ressource.titre}
                          </a>
                        </li>
                      ) : null
                    )}
                  </ul>
                </SectionLecon>
              )}
            </div>
          )}
        </div>
      )}

      {ongletActif === "demonstrations" && (
        <div className="flex flex-col gap-5">
          {estVide(lecon.demonstrations) ? (
            <p className="text-sm text-fh-ardoise/60">Pas de démonstration pour cette leçon.</p>
          ) : (
            decouperSections(lecon.demonstrations).map((section, index) =>
              section.titre ? (
                <CarteSection
                  key={`${index}-${section.titre}`}
                  titre={section.titre}
                  contenu={section.contenu}
                  onTermeClick={setSlugOuvert}
                />
              ) : (
                <RenduMarkdown key={`${index}-intro`} contenu={section.contenu} onTermeClick={setSlugOuvert} />
              )
            )
          )}
        </div>
      )}

      {ongletActif === "exercices" && (
        <div className="flex flex-col gap-4">
          {lecon.exercices.length === 0 ? (
            <p className="text-sm text-fh-ardoise/60">Pas d&apos;exercice pour cette leçon.</p>
          ) : (
            lecon.exercices.map((exercice, index) => (
              <CarteExercice key={exercice.id} exercice={exercice} numero={index + 1} onTermeClick={setSlugOuvert} />
            ))
          )}
        </div>
      )}

      <ModaleTerme
        slug={slugOuvert}
        onClose={() => setSlugOuvert(null)}
        termesLocaux={source === "locale" ? termesLocaux ?? {} : undefined}
        leconsDisponibles={idsTelecharges}
      />
    </div>
  );
}
