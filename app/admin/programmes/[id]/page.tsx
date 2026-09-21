"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { ApiError } from "@/lib/api";
import {
  creerChapitre,
  creerNotion,
  creerTheme,
  descendreChapitre,
  descendreNotion,
  descendreTheme,
  getProgramme,
  modifierChapitre,
  modifierNotion,
  modifierTheme,
  monterChapitre,
  monterNotion,
  monterTheme,
  supprimerChapitre,
  supprimerNotion,
  supprimerTheme,
  type ChapitreNoeud,
  type NotionNoeud,
  type ProgrammeDetail,
  type ThemeNoeud,
} from "@/lib/programmeApi";
import ThemeNode from "@/components/admin/programmes/ThemeNode";
import EntityFormModal, { type ChampFormulaire } from "@/components/admin/EntityFormModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Toast from "@/components/admin/Toast";

type ModaleFormulaire =
  | { ressource: "theme"; mode: "creer" }
  | { ressource: "theme"; mode: "modifier"; item: ThemeNoeud }
  | { ressource: "chapitre"; mode: "creer"; theme: ThemeNoeud }
  | { ressource: "chapitre"; mode: "modifier"; item: ChapitreNoeud; theme: ThemeNoeud }
  | { ressource: "notion"; mode: "creer"; chapitre: ChapitreNoeud }
  | { ressource: "notion"; mode: "modifier"; item: NotionNoeud; chapitre: ChapitreNoeud };

type ModaleSuppression =
  | { ressource: "theme"; item: ThemeNoeud }
  | { ressource: "chapitre"; item: ChapitreNoeud }
  | { ressource: "notion"; item: NotionNoeud };

const CHAMPS_THEME: readonly ChampFormulaire[] = [
  { nom: "titre", label: "Titre", type: "text", requis: true },
  { nom: "volume_horaire", label: "Volume horaire (heures, optionnel)", type: "number" },
];

const CHAMPS_CHAPITRE: readonly ChampFormulaire[] = [
  { nom: "titre", label: "Titre", type: "text", requis: true },
];

/**
 * Ordre à donner à un nouvel élément ajouté en fin de liste. Ne suppose PAS
 * que les ordre existants sont 0-indexés/contigus (les données réelles
 * démarrent par exemple à 1) : on prend le max existant + 1.
 */
function prochainOrdre(items: readonly { ordre: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((item) => item.ordre)) + 1;
}

const CHAMPS_NOTION: readonly ChampFormulaire[] = [
  { nom: "titre", label: "Titre", type: "text", requis: true },
  { nom: "ordre", label: "Ordre", type: "number", requis: true },
  { nom: "contenus_officiels", label: "Contenus officiels", type: "textarea", lignes: 4 },
  { nom: "objectifs_officiels", label: "Objectifs officiels", type: "textarea", lignes: 4 },
  { nom: "commentaires_officiels", label: "Commentaires officiels", type: "textarea", lignes: 3 },
];

export default function ProgrammeDetailPage() {
  const params = useParams<{ id: string }>();
  const programmeId = Number(params.id);

  const [programme, setProgramme] = useState<ProgrammeDetail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [actionEnCours, setActionEnCours] = useState(false);

  const [themesOuverts, setThemesOuverts] = useState<Set<number>>(new Set());
  const [modaleFormulaire, setModaleFormulaire] = useState<ModaleFormulaire | null>(null);
  const [modaleSuppression, setModaleSuppression] = useState<ModaleSuppression | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const data = await getProgramme(programmeId);
        if (actif) setProgramme(data);
      } catch (error) {
        if (actif) {
          setErreur(error instanceof ApiError ? error.message : "Impossible de charger ce programme.");
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

  async function rafraichir() {
    const data = await getProgramme(programmeId);
    setProgramme(data);
  }

  function toggleTheme(id: number) {
    setThemesOuverts((courant) => {
      const suivant = new Set(courant);
      if (suivant.has(id)) suivant.delete(id);
      else suivant.add(id);
      return suivant;
    });
  }

  async function executerReordonnancement(action: () => Promise<unknown>) {
    setActionEnCours(true);
    try {
      await action();
      await rafraichir();
    } catch (error) {
      setToast({
        message: error instanceof ApiError ? error.message : "Action impossible.",
        tone: "erreur",
      });
    } finally {
      setActionEnCours(false);
    }
  }

  // --- Formulaires création/édition ---

  function titrePourModale(modale: ModaleFormulaire): string {
    if (modale.mode === "creer") {
      switch (modale.ressource) {
        case "theme":
          return "Ajouter un thème";
        case "chapitre":
          return `Ajouter un chapitre · ${modale.theme.titre}`;
        case "notion":
          return `Ajouter une notion · ${modale.chapitre.titre}`;
      }
    }
    switch (modale.ressource) {
      case "theme":
        return `Modifier le thème « ${modale.item.titre} »`;
      case "chapitre":
        return `Modifier le chapitre « ${modale.item.titre} »`;
      case "notion":
        return `Modifier la notion « ${modale.item.titre} »`;
    }
  }

  function champsPourModale(modale: ModaleFormulaire): readonly ChampFormulaire[] {
    switch (modale.ressource) {
      case "theme":
        return CHAMPS_THEME;
      case "chapitre":
        return CHAMPS_CHAPITRE;
      case "notion":
        return CHAMPS_NOTION;
    }
  }

  function valeursInitialesPourModale(modale: ModaleFormulaire): Record<string, string> {
    if (modale.mode === "creer") {
      switch (modale.ressource) {
        case "theme":
          return { titre: "", volume_horaire: "" };
        case "chapitre":
          return { titre: "" };
        case "notion":
          return {
            titre: "",
            ordre: String(prochainOrdre(modale.chapitre.notions)),
            contenus_officiels: "",
            objectifs_officiels: "",
            commentaires_officiels: "",
          };
      }
    }
    switch (modale.ressource) {
      case "theme":
        return {
          titre: modale.item.titre,
          volume_horaire: modale.item.volume_horaire != null ? String(modale.item.volume_horaire) : "",
        };
      case "chapitre":
        return { titre: modale.item.titre };
      case "notion":
        return {
          titre: modale.item.titre,
          ordre: String(modale.item.ordre),
          contenus_officiels: modale.item.contenus_officiels,
          objectifs_officiels: modale.item.objectifs_officiels,
          commentaires_officiels: modale.item.commentaires_officiels,
        };
    }
  }

  async function soumettreFormulaire(valeurs: Record<string, string>) {
    const modale = modaleFormulaire;
    if (!modale || !programme) return;

    if (modale.ressource === "theme") {
      const data = {
        programme: programmeId,
        titre: valeurs.titre,
        volume_horaire: valeurs.volume_horaire ? Number(valeurs.volume_horaire) : null,
        ordre: modale.mode === "creer" ? prochainOrdre(programme.themes) : modale.item.ordre,
      };
      if (modale.mode === "creer") await creerTheme(data);
      else await modifierTheme(modale.item.id, data);
    } else if (modale.ressource === "chapitre") {
      const theme = modale.theme;
      const data = {
        theme: theme.id,
        titre: valeurs.titre,
        ordre: modale.mode === "creer" ? prochainOrdre(theme.chapitres) : modale.item.ordre,
      };
      if (modale.mode === "creer") await creerChapitre(data);
      else await modifierChapitre(modale.item.id, data);
    } else {
      const chapitre = modale.chapitre;
      const data = {
        chapitre: chapitre.id,
        titre: valeurs.titre,
        ordre: Number(valeurs.ordre),
        contenus_officiels: valeurs.contenus_officiels,
        objectifs_officiels: valeurs.objectifs_officiels,
        commentaires_officiels: valeurs.commentaires_officiels,
      };
      if (modale.mode === "creer") await creerNotion(data);
      else await modifierNotion(modale.item.id, data);
    }

    setModaleFormulaire(null);
    setToast({ message: modale.mode === "creer" ? "Ajouté." : "Modifié.", tone: "succes" });
    await rafraichir();
  }

  // --- Suppression ---

  async function confirmerSuppression() {
    const modale = modaleSuppression;
    if (!modale) return;

    if (modale.ressource === "theme") await supprimerTheme(modale.item.id);
    else if (modale.ressource === "chapitre") await supprimerChapitre(modale.item.id);
    else await supprimerNotion(modale.item.id);

    setModaleSuppression(null);
    setToast({ message: "Supprimé.", tone: "succes" });
    await rafraichir();
  }

  function questionSuppression(modale: ModaleSuppression): string {
    switch (modale.ressource) {
      case "theme":
        return `Supprimer le thème « ${modale.item.titre} » et tout son contenu ? Cette action est irréversible.`;
      case "chapitre":
        return `Supprimer le chapitre « ${modale.item.titre} » et ses notions ? Cette action est irréversible.`;
      case "notion":
        return `Supprimer la notion « ${modale.item.titre} » ? Cette action est irréversible.`;
    }
  }

  if (chargement) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement du programme">
        <div className="h-16 animate-pulse rounded-2xl bg-fh-sable/50" />
        <div className="h-40 animate-pulse rounded-2xl bg-fh-sable/50" />
        <div className="h-40 animate-pulse rounded-2xl bg-fh-sable/50" />
      </div>
    );
  }

  if (erreur || !programme) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/programmes" className="text-sm font-medium text-fh-bleu hover:underline">
          ← Retour aux programmes
        </Link>
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreur ?? "Programme introuvable."}
        </p>
      </div>
    );
  }

  const nbChapitres = programme.themes.reduce((total, theme) => total + theme.chapitres.length, 0);
  const nbNotions = programme.themes.reduce(
    (total, theme) => total + theme.chapitres.reduce((sous, chapitre) => sous + chapitre.notions.length, 0),
    0
  );
  const nbLecons = programme.themes.reduce(
    (total, theme) =>
      total +
      theme.chapitres.reduce(
        (sous, chapitre) => sous + chapitre.notions.filter((notion) => notion.a_lecon).length,
        0
      ),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link href="/admin/programmes" className="text-sm font-medium text-fh-bleu hover:underline">
          ← Retour aux programmes
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-fh-bleu">{programme.libelle}</h2>
            <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-fh-bleu">
              <span className="rounded-full bg-fh-accent/50 px-2 py-1">{programme.themes.length} thème(s)</span>
              <span className="rounded-full bg-fh-accent/50 px-2 py-1">{nbChapitres} chapitre(s)</span>
              <span className="rounded-full bg-fh-accent/50 px-2 py-1">{nbNotions} notion(s)</span>
              <span className="rounded-full bg-fh-sable/60 px-2 py-1">{nbLecons} leçon(s)</span>
            </div>
          </div>
          <button
            type="button"
            disabled={actionEnCours}
            onClick={() => setModaleFormulaire({ ressource: "theme", mode: "creer" })}
            className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
          >
            + Ajouter un thème
          </button>
        </div>
      </div>

      {programme.themes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            🗂️
          </span>
          <p className="text-sm text-fh-ardoise">Aucun thème. Ajoute le premier thème du programme.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {programme.themes.map((theme, index) => (
            <ThemeNode
              key={theme.id}
              theme={theme}
              estPremier={index === 0}
              estDernier={index === programme.themes.length - 1}
              expanded={themesOuverts.has(theme.id)}
              actionEnCours={actionEnCours}
              onToggleExpand={() => toggleTheme(theme.id)}
              onEdit={() => setModaleFormulaire({ ressource: "theme", mode: "modifier", item: theme })}
              onDelete={() => setModaleSuppression({ ressource: "theme", item: theme })}
              onMonter={() => executerReordonnancement(() => monterTheme(theme.id))}
              onDescendre={() => executerReordonnancement(() => descendreTheme(theme.id))}
              onAjouterChapitre={() => setModaleFormulaire({ ressource: "chapitre", mode: "creer", theme })}
              onEditChapitre={(chapitre) =>
                setModaleFormulaire({ ressource: "chapitre", mode: "modifier", item: chapitre, theme })
              }
              onDeleteChapitre={(chapitre) => setModaleSuppression({ ressource: "chapitre", item: chapitre })}
              onMonterChapitre={(chapitre) => executerReordonnancement(() => monterChapitre(chapitre.id))}
              onDescendreChapitre={(chapitre) => executerReordonnancement(() => descendreChapitre(chapitre.id))}
              onAjouterNotion={(chapitre) => setModaleFormulaire({ ressource: "notion", mode: "creer", chapitre })}
              onEditNotion={(notion) => {
                const chapitre = theme.chapitres.find((c) => c.notions.some((n) => n.id === notion.id));
                if (chapitre) setModaleFormulaire({ ressource: "notion", mode: "modifier", item: notion, chapitre });
              }}
              onDeleteNotion={(notion) => setModaleSuppression({ ressource: "notion", item: notion })}
              onMonterNotion={(notion) => executerReordonnancement(() => monterNotion(notion.id))}
              onDescendreNotion={(notion) => executerReordonnancement(() => descendreNotion(notion.id))}
            />
          ))}
        </div>
      )}

      {modaleFormulaire && (
        <EntityFormModal
          titre={titrePourModale(modaleFormulaire)}
          champs={champsPourModale(modaleFormulaire)}
          valeursInitiales={valeursInitialesPourModale(modaleFormulaire)}
          onSubmit={soumettreFormulaire}
          onClose={() => setModaleFormulaire(null)}
          libelleSoumettre={modaleFormulaire.mode === "creer" ? "Ajouter" : "Enregistrer"}
        />
      )}

      {modaleSuppression && (
        <DeleteConfirmModal
          titre="Confirmer la suppression"
          question={questionSuppression(modaleSuppression)}
          onConfirm={confirmerSuppression}
          onClose={() => setModaleSuppression(null)}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
