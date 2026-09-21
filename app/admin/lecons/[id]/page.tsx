"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import {
  depublierLecon,
  getLecon,
  messageErreurEnregistrementLecon,
  modifierLecon,
  publierLecon,
  type Difficulte,
  type LeconDetail,
} from "@/lib/leconApi";
import StatutBadge from "@/components/admin/StatutBadge";
import Toast from "@/components/admin/Toast";
import { LECON_STATUT_LABELS, LECON_STATUT_STYLES } from "@/components/admin/lecons/leconStatutStyles";
import { nouvelleClef } from "@/components/admin/lecons/clefsLocales";
import ChampMarkdown from "@/components/admin/lecons/ChampMarkdown";
import BoutonGenererSectionIA from "@/components/admin/lecons/BoutonGenererSectionIA";
import EditeurExercices, { type ExerciceDraft } from "@/components/admin/lecons/EditeurExercices";
import EditeurVideos, { type VideoDraft } from "@/components/admin/lecons/EditeurVideos";
import EditeurRessources, { type RessourceDraft } from "@/components/admin/lecons/EditeurRessources";

/**
 * Éditeur complet de leçon : toutes les sections sur une page, sauvegarde
 * manuelle. Voir lib/leconApi.ts pour la convention de synchro des listes
 * imbriquées (exercices/vidéos/ressources) respectée par handleEnregistrer.
 */

interface EditeurState {
  titre: string;
  histoire: string;
  objectifsPedagogiques: string;
  prerequisTexte: string;
  coursRedige: string;
  demonstrations: string;
  aRetenir: string;
  exercices: ExerciceDraft[];
  videos: VideoDraft[];
  ressources: RessourceDraft[];
}

function depuisLecon(lecon: LeconDetail): EditeurState {
  return {
    titre: lecon.titre,
    histoire: lecon.histoire,
    objectifsPedagogiques: lecon.objectifs_pedagogiques,
    prerequisTexte: lecon.prerequis_texte,
    coursRedige: lecon.cours_redige,
    demonstrations: lecon.demonstrations,
    aRetenir: lecon.a_retenir,
    exercices: [...lecon.exercices]
      .sort((a, b) => a.ordre - b.ordre)
      .map((e) => ({ clef: nouvelleClef(), id: e.id, enonce: e.enonce, corrige: e.corrige, difficulte: e.difficulte })),
    videos: [...lecon.videos]
      .sort((a, b) => a.ordre - b.ordre)
      .map((v) => ({ clef: nouvelleClef(), id: v.id, titre: v.titre, url: v.url, description: v.description })),
    ressources: [...lecon.ressources]
      .sort((a, b) => a.ordre - b.ordre)
      .map((r) => ({ clef: nouvelleClef(), id: r.id, titre: r.titre, url: r.url })),
  };
}

interface Comparable {
  titre: string;
  histoire: string;
  objectifs_pedagogiques: string;
  prerequis_texte: string;
  cours_redige: string;
  demonstrations: string;
  a_retenir: string;
  exercices: { id?: number; enonce: string; corrige: string; difficulte: Difficulte }[];
  videos: { id?: number; titre: string; url: string; description: string }[];
  ressources: { id?: number; titre: string; url: string }[];
}

/** Snapshot comparable (sans les clés React locales) pour détecter les modifications. */
function versComparable(etat: EditeurState): Comparable {
  return {
    titre: etat.titre,
    histoire: etat.histoire,
    objectifs_pedagogiques: etat.objectifsPedagogiques,
    prerequis_texte: etat.prerequisTexte,
    cours_redige: etat.coursRedige,
    demonstrations: etat.demonstrations,
    a_retenir: etat.aRetenir,
    exercices: etat.exercices.map(({ id, enonce, corrige, difficulte }) => ({ id, enonce, corrige, difficulte })),
    videos: etat.videos.map(({ id, titre, url, description }) => ({ id, titre, url, description })),
    ressources: etat.ressources.map(({ id, titre, url }) => ({ id, titre, url })),
  };
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable sm:p-6">
      <h3 className="text-base font-bold text-fh-bleu">{titre}</h3>
      {children}
    </section>
  );
}

export default function LeconEditeurPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leconId = Number(params.id);

  const [lecon, setLecon] = useState<LeconDetail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const [etat, setEtat] = useState<EditeurState | null>(null);
  const [etatEnregistre, setEtatEnregistre] = useState<EditeurState | null>(null);
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);
  const [actionStatutEnCours, setActionStatutEnCours] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const data = await getLecon(leconId);
        if (actif) {
          setLecon(data);
          const initial = depuisLecon(data);
          setEtat(initial);
          setEtatEnregistre(initial);
        }
      } catch (error) {
        if (actif) {
          setErreur(error instanceof ApiError ? error.message : "Impossible de charger cette leçon.");
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [leconId]);

  const modifie = useMemo(() => {
    if (!etat || !etatEnregistre) return false;
    return JSON.stringify(versComparable(etat)) !== JSON.stringify(versComparable(etatEnregistre));
  }, [etat, etatEnregistre]);

  // Ferme-t-on l'onglet avec des modifications non enregistrées ? Le navigateur
  // affiche sa propre boîte de confirmation générique (texte non personnalisable).
  useEffect(() => {
    function handler(event: BeforeUnloadEvent) {
      if (!modifie) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [modifie]);

  function setChamp<K extends keyof EditeurState>(champ: K, valeur: EditeurState[K]) {
    setEtat((courant) => (courant ? { ...courant, [champ]: valeur } : courant));
  }

  /**
   * Validation locale avant envoi : évite un aller-retour serveur pour des
   * erreurs prévisibles (champ requis vide sur un item de liste) et donne un
   * message précis — le backend renvoie sinon une erreur imbriquée par index
   * ("videos.0.url") peu lisible telle quelle.
   */
  function validerEtat(courant: EditeurState): string | null {
    for (const [index, exercice] of courant.exercices.entries()) {
      if (!exercice.enonce.trim()) return `Exercice ${index + 1} : l'énoncé ne peut pas être vide.`;
    }
    for (const [index, video] of courant.videos.entries()) {
      if (!video.titre.trim()) return `Vidéo ${index + 1} : le titre ne peut pas être vide.`;
      if (!video.url.trim()) return `Vidéo ${index + 1} : l'URL ne peut pas être vide.`;
    }
    for (const [index, ressource] of courant.ressources.entries()) {
      if (!ressource.titre.trim()) return `Ressource ${index + 1} : le titre ne peut pas être vide.`;
      if (!ressource.url.trim()) return `Ressource ${index + 1} : l'URL ne peut pas être vide.`;
    }
    return null;
  }

  async function handleEnregistrer() {
    if (!etat) return;
    const erreurValidation = validerEtat(etat);
    if (erreurValidation) {
      setToast({ message: erreurValidation, tone: "erreur" });
      return;
    }
    setSauvegardeEnCours(true);
    try {
      const lecon = await modifierLecon(leconId, {
        titre: etat.titre,
        histoire: etat.histoire,
        objectifs_pedagogiques: etat.objectifsPedagogiques,
        prerequis_texte: etat.prerequisTexte,
        cours_redige: etat.coursRedige,
        demonstrations: etat.demonstrations,
        a_retenir: etat.aRetenir,
        exercices: etat.exercices.map((e, index) => ({
          id: e.id,
          enonce: e.enonce,
          corrige: e.corrige,
          difficulte: e.difficulte,
          ordre: index + 1,
        })),
        videos: etat.videos.map((v, index) => ({
          id: v.id,
          titre: v.titre,
          url: v.url,
          description: v.description,
          ordre: index + 1,
        })),
        ressources: etat.ressources.map((r, index) => ({
          id: r.id,
          titre: r.titre,
          url: r.url,
          ordre: index + 1,
        })),
      });
      // On repart de la réponse serveur (et pas de `etat`) : elle porte les
      // ids définitifs des exercices/vidéos/ressources nouvellement créés.
      setLecon(lecon);
      const nouvelEtat = depuisLecon(lecon);
      setEtat(nouvelEtat);
      setEtatEnregistre(nouvelEtat);
      setToast({ message: "Leçon enregistrée.", tone: "succes" });
    } catch (error) {
      setToast({ message: messageErreurEnregistrementLecon(error), tone: "erreur" });
    } finally {
      setSauvegardeEnCours(false);
    }
  }

  async function handlePublier() {
    if (modifie) {
      setToast({ message: "Enregistre d'abord tes modifications avant de publier.", tone: "erreur" });
      return;
    }
    setActionStatutEnCours(true);
    try {
      const misAJour = await publierLecon(leconId);
      setLecon(misAJour);
      setToast({ message: "Leçon publiée.", tone: "succes" });
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : "Action impossible.", tone: "erreur" });
    } finally {
      setActionStatutEnCours(false);
    }
  }

  async function handleDepublier() {
    setActionStatutEnCours(true);
    try {
      const misAJour = await depublierLecon(leconId);
      setLecon(misAJour);
      setToast({ message: "Leçon repassée en brouillon.", tone: "succes" });
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : "Action impossible.", tone: "erreur" });
    } finally {
      setActionStatutEnCours(false);
    }
  }

  function handleRetour() {
    if (modifie && !window.confirm("Des modifications ne sont pas enregistrées. Quitter quand même ?")) {
      return;
    }
    router.push("/admin/lecons");
  }

  if (chargement) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement de la leçon">
        <div className="h-16 animate-pulse rounded-2xl bg-fh-sable/50" />
        <div className="h-64 animate-pulse rounded-2xl bg-fh-sable/50" />
        <div className="h-64 animate-pulse rounded-2xl bg-fh-sable/50" />
      </div>
    );
  }

  if (erreur || !lecon || !etat) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/lecons")}
          className="self-start text-sm font-medium text-fh-bleu hover:underline"
        >
          ← Retour aux leçons
        </button>
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur ?? "Leçon introuvable."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 bg-fh-creme/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={etat.titre}
              onChange={(event) => setChamp("titre", event.target.value)}
              className="w-full min-w-0 rounded-lg border border-transparent bg-transparent px-1 text-lg font-bold text-fh-bleu outline-none transition-colors focus:border-fh-orange focus:bg-white"
            />
            <p className="truncate px-1 text-sm text-fh-ardoise">
              {lecon.notion.programme.libelle} · {lecon.notion.theme.titre} · {lecon.notion.chapitre.titre} ·{" "}
              {lecon.notion.titre}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <StatutBadge statut={lecon.statut} styles={LECON_STATUT_STYLES} labels={LECON_STATUT_LABELS} />
            {modifie && (
              <span className="rounded-full bg-fh-accent px-3 py-1 text-xs font-semibold text-fh-orange-fonce">
                Modifié
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={sauvegardeEnCours || !modifie}
            onClick={handleEnregistrer}
            className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sauvegardeEnCours ? "Enregistrement…" : "Enregistrer"}
          </button>

          {lecon.statut === "publie" ? (
            <button
              type="button"
              disabled={actionStatutEnCours}
              onClick={handleDepublier}
              className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Dépublier
            </button>
          ) : (
            <button
              type="button"
              disabled={actionStatutEnCours}
              onClick={handlePublier}
              className="rounded-full border border-green-600 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Publier
            </button>
          )}

          <button
            type="button"
            onClick={handleRetour}
            className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
          >
            Retour
          </button>
        </div>
      </div>

      <Section titre="1. Pourquoi cette notion ? (histoire, enjeux, usages)">
        <ChampMarkdown
          valeur={etat.histoire}
          onChange={(v) => setChamp("histoire", v)}
          placeholder="Contexte historique, enjeux, usages de la notion (facultatif)…"
          avecInsertionTerme
          actionsSupplementaires={
            <BoutonGenererSectionIA
              section="histoire"
              notionId={lecon.notion.id}
              valeurActuelle={etat.histoire}
              onInsere={(v) => setChamp("histoire", v)}
            />
          }
        />
      </Section>

      <Section titre="2. Objectifs pédagogiques">
        <ChampMarkdown
          valeur={etat.objectifsPedagogiques}
          onChange={(v) => setChamp("objectifsPedagogiques", v)}
          placeholder="Ex. Définir la fonction ln, étudier ses variations…"
          avecInsertionTerme
          actionsSupplementaires={
            <BoutonGenererSectionIA
              section="objectifs"
              notionId={lecon.notion.id}
              valeurActuelle={etat.objectifsPedagogiques}
              onInsere={(v) => setChamp("objectifsPedagogiques", v)}
            />
          }
        />
      </Section>

      <Section titre="3. Prérequis">
        <ChampMarkdown
          valeur={etat.prerequisTexte}
          onChange={(v) => setChamp("prerequisTexte", v)}
          placeholder="Ex. Maîtriser la dérivation et le calcul de limites…"
          avecInsertionTerme
          actionsSupplementaires={
            <BoutonGenererSectionIA
              section="prerequis"
              notionId={lecon.notion.id}
              valeurActuelle={etat.prerequisTexte}
              onInsere={(v) => setChamp("prerequisTexte", v)}
            />
          }
        />
      </Section>

      <Section titre="4. Cours">
        <ChampMarkdown
          valeur={etat.coursRedige}
          onChange={(v) => setChamp("coursRedige", v)}
          placeholder="Rédige le cours ici (Markdown + LaTeX)…"
          hauteur={280}
          avecInsertionTerme
          avecInsertionCourbe
          avecInsertionVariations
          actionsSupplementaires={
            <BoutonGenererSectionIA
              section="cours"
              notionId={lecon.notion.id}
              valeurActuelle={etat.coursRedige}
              onInsere={(v) => setChamp("coursRedige", v)}
            />
          }
        />
      </Section>

      <Section titre="5. Démonstrations">
        <ChampMarkdown
          valeur={etat.demonstrations}
          onChange={(v) => setChamp("demonstrations", v)}
          placeholder="Démonstrations détaillées…"
          hauteur={240}
          avecInsertionTerme
          avecInsertionCourbe
          avecInsertionVariations
          actionsSupplementaires={
            <BoutonGenererSectionIA
              section="demonstrations"
              notionId={lecon.notion.id}
              valeurActuelle={etat.demonstrations}
              onInsere={(v) => setChamp("demonstrations", v)}
            />
          }
        />
      </Section>

      <Section titre="6. À retenir">
        <ChampMarkdown
          valeur={etat.aRetenir}
          onChange={(v) => setChamp("aRetenir", v)}
          placeholder="L'essentiel à retenir, en quelques lignes…"
          avecInsertionTerme
          actionsSupplementaires={
            <BoutonGenererSectionIA
              section="a_retenir"
              notionId={lecon.notion.id}
              valeurActuelle={etat.aRetenir}
              onInsere={(v) => setChamp("aRetenir", v)}
            />
          }
        />
      </Section>

      <Section titre="7. Vidéos">
        <EditeurVideos videos={etat.videos} onChange={(videos) => setChamp("videos", videos)} />
      </Section>

      <Section titre="8. Exercices">
        <EditeurExercices
          exercices={etat.exercices}
          onChange={(exercices) => setChamp("exercices", exercices)}
          notionId={lecon.notion.id}
        />
      </Section>

      <Section titre="9. Ressources">
        <EditeurRessources ressources={etat.ressources} onChange={(ressources) => setChamp("ressources", ressources)} />
      </Section>

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
