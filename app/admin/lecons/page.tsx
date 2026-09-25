"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import {
  basculerAccesLecon,
  depublierLecon,
  listerToutesLecons,
  publierLecon,
  supprimerLecon,
  type LeconDetail,
  type LeconListe,
  type LeconStatut,
} from "@/lib/leconApi";
import { getProgramme, listerProgrammes, type ProgrammeListe } from "@/lib/programmeApi";
import {
  construireArbre,
  filtrerArbre,
  filtreArbreActif,
  remplacerLeconDansArbre,
  type MatiereArbre,
} from "@/lib/arbreLecons";
import CreerLeconModal, { type NotionPreremplissage } from "@/components/admin/lecons/CreerLeconModal";
import ArbreLecons from "@/components/admin/lecons/ArbreLecons";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Toast from "@/components/admin/Toast";

const OPTIONS_STATUT: readonly { value: LeconStatut | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "brouillon", label: "Brouillon" },
  { value: "a_valider", label: "À valider" },
  { value: "publie", label: "Publié" },
];

/**
 * Arbre Matière → Programme → Thème → Chapitre → Notion (voir
 * lib/arbreLecons.ts), à la place de l'ancienne liste plate. Approche
 * retenue et pourquoi :
 *
 *  - COMPOSITION CÔTÉ CLIENT plutôt qu'un nouvel endpoint backend : le
 *    programme officiel tient dans une poignée de requêtes (1
 *    listerProgrammes + 1 getProgramme par programme, qui renvoie déjà tout
 *    l'arbre thèmes→chapitres→notions + listerToutesLecons, qui suit la
 *    pagination) — jamais des dizaines d'allers-retours, et aucune surface
 *    backend supplémentaire à sécuriser/maintenir pour ce qui reste, au
 *    fond, un simple assemblage de données déjà exposées.
 *  - FILTRES/RECHERCHE = RESTRICTION DE L'ARBRE (pas de bascule vers une
 *    vue liste séparée) : tout l'arbre étant déjà chargé en mémoire, filtrer
 *    revient à un simple filtrage client (lib/arbreLecons.ts, filtrerArbre)
 *    — aucune re-requête réseau à chaque frappe/changement de filtre, et
 *    l'arbre reste la SEULE vue à maintenir (pas de deuxième composant liste
 *    à garder synchronisé). Un filtre actif déplie automatiquement les
 *    branches correspondantes et surligne le texte trouvé.
 */
export default function LeconsPage() {
  const router = useRouter();

  const [programmes, setProgrammes] = useState<ProgrammeListe[]>([]);
  const [arbreBrut, setArbreBrut] = useState<MatiereArbre[] | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [refreshCle, setRefreshCle] = useState(0);

  const [statutFiltre, setStatutFiltre] = useState<LeconStatut | "">("");
  const [programmeFiltre, setProgrammeFiltre] = useState("");
  const [rechercheSaisie, setRechercheSaisie] = useState("");
  const [recherche, setRecherche] = useState("");

  const [idEnCours, setIdEnCours] = useState<number | null>(null);
  const [modaleCreation, setModaleCreation] = useState<false | true | NotionPreremplissage>(false);
  const [leconASupprimer, setLeconASupprimer] = useState<LeconListe | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const progResp = await listerProgrammes();
        if (!actif) return;
        setProgrammes(progResp.results);

        const [details, toutesLecons] = await Promise.all([
          Promise.all(progResp.results.map((p) => getProgramme(p.id))),
          listerToutesLecons(),
        ]);
        if (!actif) return;
        setArbreBrut(construireArbre(details, toutesLecons));
      } catch (error) {
        if (actif) {
          setErreur(error instanceof ApiError ? error.message : "Impossible de charger les leçons.");
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [refreshCle]);

  const filtres = useMemo(
    () => ({ statut: statutFiltre, programmeId: programmeFiltre, recherche }),
    [statutFiltre, programmeFiltre, recherche]
  );
  const filtreActif = filtreArbreActif(filtres);
  const arbreFiltre = useMemo(
    () => (arbreBrut ? filtrerArbre(arbreBrut, filtres) : []),
    [arbreBrut, filtres]
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecherche(rechercheSaisie.trim());
  }

  function handleCreated(lecon: LeconDetail) {
    setModaleCreation(false);
    setToast({ message: "Leçon créée.", tone: "succes" });
    // Redirection plutôt que rafraîchissement sur place : on vient de créer
    // la leçon pour l'éditer tout de suite (éditeur complet en étape 2).
    router.push(`/admin/lecons/${lecon.id}`);
  }

  async function handlePublier(id: number) {
    setIdEnCours(id);
    try {
      await publierLecon(id);
      setToast({ message: "Leçon publiée.", tone: "succes" });
      setRefreshCle((c) => c + 1);
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : "Action impossible.", tone: "erreur" });
    } finally {
      setIdEnCours(null);
    }
  }

  async function handleDepublier(id: number) {
    setIdEnCours(id);
    try {
      await depublierLecon(id);
      setToast({ message: "Leçon repassée en brouillon.", tone: "succes" });
      setRefreshCle((c) => c + 1);
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : "Action impossible.", tone: "erreur" });
    } finally {
      setIdEnCours(null);
    }
  }

  /**
   * Bascule gratuit/premium : mise à jour OPTIMISTE (l'arbre change avant la
   * réponse serveur — voir remplacerLeconDansArbre) avec rollback vers la
   * valeur précédente si l'appel échoue, plutôt qu'un setRefreshCle qui
   * rechargerait tout l'arbre pour un simple booléen.
   */
  async function handleBasculerAcces(id: number, estGratuit: boolean) {
    setIdEnCours(id);
    setArbreBrut((arbre) => (arbre ? remplacerLeconDansArbre(arbre, id, { est_gratuit: estGratuit }) : arbre));
    try {
      await basculerAccesLecon(id, estGratuit);
      setToast({ message: estGratuit ? "Leçon rendue gratuite." : "Leçon rendue premium.", tone: "succes" });
    } catch (error) {
      setArbreBrut((arbre) => (arbre ? remplacerLeconDansArbre(arbre, id, { est_gratuit: !estGratuit }) : arbre));
      setToast({ message: error instanceof ApiError ? error.message : "Action impossible.", tone: "erreur" });
    } finally {
      setIdEnCours(null);
    }
  }

  async function confirmerSuppression() {
    if (!leconASupprimer) return;
    await supprimerLecon(leconASupprimer.id);
    setLeconASupprimer(null);
    setToast({ message: "Leçon supprimée.", tone: "succes" });
    setRefreshCle((c) => c + 1);
  }

  const totaux = arbreBrut?.reduce(
    (acc, m) => ({ lecons: acc.lecons + m.nbLecons, notions: acc.notions + m.nbNotions }),
    { lecons: 0, notions: 0 }
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-fh-bleu">Leçons</h2>
          <p className="text-sm text-fh-ardoise">
            Le contenu pédagogique rédigé pour chaque notion du programme.
            {totaux && ` ${totaux.lecons}/${totaux.notions} notions ont une leçon.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModaleCreation(true)}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          + Créer une leçon
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={statutFiltre}
          onChange={(event) => setStatutFiltre(event.target.value as LeconStatut | "")}
          className="rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        >
          {OPTIONS_STATUT.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={programmeFiltre}
          onChange={(event) => setProgrammeFiltre(event.target.value)}
          className="rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        >
          <option value="">Tous les programmes</option>
          {programmes.map((programme) => (
            <option key={programme.id} value={programme.id}>
              {programme.libelle}
            </option>
          ))}
        </select>

        <form onSubmit={handleSearchSubmit} className="flex min-w-[220px] flex-1 gap-2">
          <input
            type="search"
            placeholder="Rechercher (titre de la leçon ou de la notion)"
            value={rechercheSaisie}
            onChange={(event) => setRechercheSaisie(event.target.value)}
            className="w-full min-w-[180px] rounded-lg border border-fh-bleu-vif/20 bg-white px-4 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
          >
            Rechercher
          </button>
        </form>
      </div>

      {chargement ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des leçons">
          {[0, 1, 2].map((cle) => (
            <div key={cle} className="h-20 animate-pulse rounded-2xl bg-fh-sable/50" />
          ))}
        </div>
      ) : erreur ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>
      ) : !arbreBrut || arbreBrut.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            📖
          </span>
          <p className="text-sm text-fh-ardoise">Aucun programme en base. Créez-en un avant de rédiger des leçons.</p>
        </div>
      ) : (
        <ArbreLecons
          arbre={arbreFiltre}
          filtreActif={filtreActif}
          termeRecherche={recherche}
          idEnCours={idEnCours}
          onPublier={handlePublier}
          onDepublier={handleDepublier}
          onSupprimer={setLeconASupprimer}
          onCreerPourNotion={setModaleCreation}
          onBasculerAcces={handleBasculerAcces}
        />
      )}

      {modaleCreation && (
        <CreerLeconModal
          notionInitiale={modaleCreation === true ? undefined : modaleCreation}
          onCreated={handleCreated}
          onClose={() => setModaleCreation(false)}
        />
      )}

      {leconASupprimer && (
        <DeleteConfirmModal
          titre="Confirmer la suppression"
          question={`Supprimer la leçon « ${leconASupprimer.titre} » ? Cette action est irréversible.`}
          onConfirm={confirmerSuppression}
          onClose={() => setLeconASupprimer(null)}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
