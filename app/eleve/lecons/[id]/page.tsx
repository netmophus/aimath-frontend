"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBook2,
  IconBulb,
  IconListCheck,
  IconLock,
  IconPaperclip,
  IconSchool,
  IconTarget,
  IconVideo,
  IconWifiOff,
} from "@tabler/icons-react";

import { ApiError } from "@/lib/api";
import { getLeconEleve, type LeconEleve, type TermeGlossaireEleve } from "@/lib/eleveApi";
import { getLeconLocale, listerIdsTelecharges } from "@/lib/offlineStore";
import { extraireMatiere } from "@/lib/contexteLecon";
import { decouperSections } from "@/lib/decouperSections";
import { extraireClasseDuLibelle, rubriqueEffective, rubriquesDisponibles, type RubriqueId } from "@/lib/lecon/rubriques";
import RenduMarkdown from "@/components/RenduMarkdown";
import SectionLecon from "@/components/eleve/SectionLecon";
import EncadreLecon from "@/components/eleve/EncadreLecon";
import OngletsLecon, { idOnglet, idPanneau, type Onglet } from "@/components/eleve/OngletsLecon";
import { IDENTITES_RUBRIQUES } from "@/components/eleve/teintesLecon";
import CarteSection from "@/components/eleve/CarteSection";
import CarteExercice from "@/components/eleve/CarteExercice";
import SujetExamenLecture from "@/components/eleve/SujetExamenLecture";
import LecteurVideo from "@/components/eleve/LecteurVideo";
import ModaleTerme from "@/components/eleve/ModaleTerme";
import BoutonTelecharger from "@/components/eleve/BoutonTelecharger";
import MurDeblocage from "@/components/eleve/MurDeblocage";

import "./lecon.css";

type OngletId = RubriqueId;

/** Préfixe des identifiants ARIA (onglets / panneaux) de cette page. */
const PREFIXE_ARIA = "lecon";

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
      <div className="mx-auto flex w-full max-w-[1214px] flex-col gap-5" aria-busy="true" aria-label="Chargement de la leçon">
        <div className="h-40 animate-pulse rounded-3xl bg-fh-sable/50" />
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6">
          <div className="h-16 animate-pulse rounded-2xl bg-fh-sable/50 lg:h-72" />
          <div className="h-64 animate-pulse rounded-3xl bg-fh-sable/50" />
        </div>
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

  const libelleProgramme = lecon.notion.programme.libelle;
  const matiere = extraireMatiere(libelleProgramme);
  const classe = extraireClasseDuLibelle(libelleProgramme);
  const aVideosOuRessources = lecon.videos.length > 0 || lecon.ressources.length > 0;

  // Un onglet ne s'affiche que si son contenu existe (pas d'onglet vide) —
  // "Cours" reste toujours présent : c'est l'ancre principale, même quand son
  // propre texte (cours_redige) est vide, elle porte objectifs/prérequis/
  // à retenir/vidéos/ressources (voir plus bas, avec son propre repli).
  const idsDisponibles = rubriquesDisponibles(lecon);
  const onglets: Onglet<OngletId>[] = idsDisponibles.map((id) => ({ id, ...IDENTITES_RUBRIQUES[id] }));
  const ongletAffiche = rubriqueEffective(idsDisponibles, ongletActif);

  /** Sections Markdown d'un champ en cartes (découpage ##/###), intro sans titre en texte libre. */
  function cartes(markdown: string, id: RubriqueId): ReactNode {
    const { couleur, icone } = IDENTITES_RUBRIQUES[id];
    return decouperSections(markdown).map((section, index) =>
      section.titre ? (
        <CarteSection
          key={`${index}-${section.titre}`}
          titre={section.titre}
          contenu={section.contenu}
          onTermeClick={setSlugOuvert}
          couleur={couleur}
          icone={icone}
        />
      ) : (
        <RenduMarkdown key={`${index}-intro`} contenu={section.contenu} onTermeClick={setSlugOuvert} />
      )
    );
  }

  /** Contenu de chaque rubrique (inchangé fonctionnellement : mêmes champs, mêmes conditions). */
  function contenuRubrique(id: OngletId): ReactNode {
    switch (id) {
      case "pourquoi":
        return <div className="flex flex-col gap-5">{cartes(lecon!.histoire, "pourquoi")}</div>;

      case "cours":
        return (
          <div className="flex flex-col gap-6">
            {!estVide(lecon!.objectifs_pedagogiques) && (
              <EncadreLecon titre="Objectifs" icone={IconTarget} couleur="#2563EB">
                <RenduMarkdown contenu={lecon!.objectifs_pedagogiques} onTermeClick={setSlugOuvert} />
              </EncadreLecon>
            )}

            {!estVide(lecon!.prerequis_texte) && (
              <EncadreLecon titre="Prérequis" icone={IconListCheck} couleur="#7C3AED">
                <RenduMarkdown contenu={lecon!.prerequis_texte} onTermeClick={setSlugOuvert} />
              </EncadreLecon>
            )}

            <SectionLecon titre="Cours" icone={IconBook2} couleur={IDENTITES_RUBRIQUES.cours.couleur}>
              {estVide(lecon!.cours_redige) ? (
                <p className="text-base text-slate-600">Le cours arrive bientôt.</p>
              ) : (
                <div className="flex flex-col gap-5">{cartes(lecon!.cours_redige, "cours")}</div>
              )}
            </SectionLecon>

            {lecon!.verrouille && <MurDeblocage />}

            {!estVide(lecon!.a_retenir) && (
              <EncadreLecon titre="À retenir" icone={IconBulb} couleur="#C2410C">
                <RenduMarkdown contenu={lecon!.a_retenir} onTermeClick={setSlugOuvert} />
              </EncadreLecon>
            )}

            {aVideosOuRessources && (
              <div className="flex flex-col gap-6">
                {lecon!.videos.length > 0 && (
                  <SectionLecon titre="Vidéos" icone={IconVideo} couleur="#0891B2">
                    <ul className="flex flex-col gap-3">
                      {lecon!.videos.map((video) => (
                        <LecteurVideo key={`${video.ordre}-${video.titre}`} video={video} />
                      ))}
                    </ul>
                  </SectionLecon>
                )}

                {lecon!.ressources.length > 0 && (
                  <SectionLecon titre="Ressources" icone={IconPaperclip} couleur="#0891B2">
                    <ul className="flex flex-col gap-2">
                      {lecon!.ressources.map((ressource) =>
                        ressource.url ? (
                          <li key={`${ressource.ordre}-${ressource.titre}`}>
                            <a
                              href={ressource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[#1D4ED8] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
                            >
                              <IconPaperclip size={20} stroke={2} aria-hidden="true" className="shrink-0" />
                              {ressource.titre}
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
        );

      case "demonstrations":
        return (
          <div className="flex flex-col gap-5">
            {estVide(lecon!.demonstrations) ? (
              <p className="text-base text-slate-600">Pas de démonstration pour cette leçon.</p>
            ) : (
              cartes(lecon!.demonstrations, "demonstrations")
            )}
          </div>
        );

      case "exercices":
        return (
          <div className="flex flex-col gap-5">
            {lecon!.exercices.length === 0 ? (
              <p className="text-base text-slate-600">Pas d&apos;exercice pour cette leçon.</p>
            ) : (
              lecon!.exercices.map((exercice, index) => (
                <CarteExercice key={exercice.id} exercice={exercice} numero={index + 1} onTermeClick={setSlugOuvert} />
              ))
            )}
          </div>
        );

      case "examen":
        return <SujetExamenLecture contenu={lecon!.sujet_examen} onTermeClick={setSlugOuvert} />;

      // Sections facultatives : même rendu Markdown que les autres rubriques
      // (KaTeX, tableaux, simulations), copies hors-ligne anciennes tolérées (`?? ""`).
      case "simuler":
        return <div className="flex flex-col gap-5">{cartes(lecon!.simuler_pour_comprendre ?? "", "simuler")}</div>;

      case "plus_loin":
        return <div className="flex flex-col gap-5">{cartes(lecon!.pour_aller_plus_loin ?? "", "plus_loin")}</div>;
    }
  }

  return (
    <>
      <div className="lecon-lecture mx-auto flex w-full max-w-[1214px] flex-col gap-5">
        {/* Bandeau de la leçon : informations réelles uniquement */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D4ED8] to-[#102A66] px-5 py-5 text-white shadow-md sm:px-8 sm:py-7">
          <Link
            href={`/eleve/programmes/${lecon.notion.programme.id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/15 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/25 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <IconArrowLeft size={18} stroke={2.25} aria-hidden="true" />
            Retour au programme
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-bold text-[#102A66]">
              <IconSchool size={18} stroke={2} aria-hidden="true" />
              {matiere}
            </span>
            {classe && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">{classe}</span>
            )}
            {source === "locale" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                <IconWifiOff size={16} stroke={2} aria-hidden="true" />
                Hors-ligne
              </span>
            )}
            {lecon.verrouille && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFEDD5] px-3 py-1 text-sm font-bold text-[#9A3412]">
                <IconLock size={16} stroke={2.25} aria-hidden="true" />
                Premium
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl leading-tight font-extrabold break-words sm:text-4xl">{lecon.titre}</h1>
          <p className="mt-2 text-sm text-white/85 sm:text-base">
            {lecon.notion.theme.titre} · {lecon.notion.chapitre.titre}
          </p>

          <div className="mt-4 w-fit rounded-2xl bg-white p-1.5 shadow-sm">
            <BoutonTelecharger leconId={leconId} verrouille={lecon.verrouille} onChange={surChangementTelechargement} />
          </div>
        </header>

        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <nav aria-label="Navigation de la leçon" className="lg:sticky lg:top-4">
            <OngletsLecon onglets={onglets} actif={ongletAffiche} onChange={setOngletActif} prefixe={PREFIXE_ARIA} />
          </nav>

          <div className="min-w-0 max-w-[950px]">
            {/* Un panneau par rubrique (les ids référencés par aria-controls existent toujours) ;
                seul celui de la rubrique active est rempli — comportement de montage inchangé. */}
            {idsDisponibles.map((id) => (
              <div
                key={id}
                role="tabpanel"
                id={idPanneau(PREFIXE_ARIA, id)}
                aria-labelledby={idOnglet(PREFIXE_ARIA, id)}
                hidden={id !== ongletAffiche}
                tabIndex={0}
                className="rounded-3xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#102A66]"
              >
                {id === ongletAffiche ? contenuRubrique(id) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ModaleTerme
        slug={slugOuvert}
        onClose={() => setSlugOuvert(null)}
        termesLocaux={source === "locale" ? termesLocaux ?? {} : undefined}
        leconsDisponibles={idsTelecharges}
      />
    </>
  );
}
