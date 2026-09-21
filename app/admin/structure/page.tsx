"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import {
  creerCycle,
  creerMatiere,
  creerNiveau,
  creerSerie,
  listerCycles,
  listerMatieres,
  listerNiveaux,
  listerSeries,
  modifierCycle,
  modifierMatiere,
  modifierNiveau,
  modifierSerie,
  supprimerCycle,
  supprimerMatiere,
  supprimerNiveau,
  supprimerSerie,
  type Cycle,
  type Matiere,
  type Niveau,
  type Serie,
} from "@/lib/structureApi";
import SectionPanel from "@/components/admin/structure/SectionPanel";
import ItemCard from "@/components/admin/structure/ItemCard";
import EntityFormModal, { type ChampFormulaire } from "@/components/admin/EntityFormModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Toast from "@/components/admin/Toast";

type ModaleFormulaire =
  | { ressource: "cycle"; mode: "creer" }
  | { ressource: "cycle"; mode: "modifier"; item: Cycle }
  | { ressource: "niveau"; mode: "creer" }
  | { ressource: "niveau"; mode: "modifier"; item: Niveau }
  | { ressource: "serie"; mode: "creer" }
  | { ressource: "serie"; mode: "modifier"; item: Serie }
  | { ressource: "matiere"; mode: "creer" }
  | { ressource: "matiere"; mode: "modifier"; item: Matiere };

type ModaleSuppression =
  | { ressource: "cycle"; item: Cycle }
  | { ressource: "niveau"; item: Niveau }
  | { ressource: "serie"; item: Serie }
  | { ressource: "matiere"; item: Matiere };

export default function StructurePage() {
  // Cycles
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cyclesChargement, setCyclesChargement] = useState(true);
  const [cyclesErreur, setCyclesErreur] = useState<string | null>(null);
  const [cyclesRefreshCle, setCyclesRefreshCle] = useState(0);
  const [cycleSelectionneId, setCycleSelectionneId] = useState<number | null>(null);

  // Niveaux (du cycle sélectionné)
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [niveauxChargement, setNiveauxChargement] = useState(false);
  const [niveauxErreur, setNiveauxErreur] = useState<string | null>(null);
  const [niveauxRefreshCle, setNiveauxRefreshCle] = useState(0);
  const [niveauSelectionneId, setNiveauSelectionneId] = useState<number | null>(null);

  // Séries (du niveau sélectionné)
  const [series, setSeries] = useState<Serie[]>([]);
  const [seriesChargement, setSeriesChargement] = useState(false);
  const [seriesErreur, setSeriesErreur] = useState<string | null>(null);
  const [seriesRefreshCle, setSeriesRefreshCle] = useState(0);

  // Matières (bloc indépendant)
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [matieresChargement, setMatieresChargement] = useState(true);
  const [matieresErreur, setMatieresErreur] = useState<string | null>(null);
  const [matieresRefreshCle, setMatieresRefreshCle] = useState(0);

  // Modales + toast
  const [modaleFormulaire, setModaleFormulaire] = useState<ModaleFormulaire | null>(null);
  const [modaleSuppression, setModaleSuppression] = useState<ModaleSuppression | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  // Chaque effet enveloppe son fetch dans une fonction locale (plutôt que
  // d'appeler setState au premier niveau du corps de l'effet) : pattern
  // requis par la règle react-hooks/set-state-in-effect de cette version
  // d'eslint-plugin-react-hooks.
  useEffect(() => {
    let actif = true;

    async function charger() {
      setCyclesChargement(true);
      setCyclesErreur(null);
      try {
        const data = await listerCycles();
        if (actif) setCycles(data.results);
      } catch (error) {
        if (actif) {
          setCyclesErreur(
            error instanceof ApiError ? error.message : "Impossible de charger les cycles."
          );
        }
      } finally {
        if (actif) setCyclesChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [cyclesRefreshCle]);

  useEffect(() => {
    let actif = true;

    async function charger() {
      if (cycleSelectionneId === null) {
        setNiveaux([]);
        return;
      }
      setNiveauxChargement(true);
      setNiveauxErreur(null);
      try {
        const data = await listerNiveaux({ cycle: cycleSelectionneId });
        if (actif) setNiveaux(data.results);
      } catch (error) {
        if (actif) {
          setNiveauxErreur(
            error instanceof ApiError ? error.message : "Impossible de charger les niveaux."
          );
        }
      } finally {
        if (actif) setNiveauxChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [cycleSelectionneId, niveauxRefreshCle]);

  useEffect(() => {
    let actif = true;

    async function charger() {
      if (niveauSelectionneId === null) {
        setSeries([]);
        return;
      }
      setSeriesChargement(true);
      setSeriesErreur(null);
      try {
        const data = await listerSeries({ niveau: niveauSelectionneId });
        if (actif) setSeries(data.results);
      } catch (error) {
        if (actif) {
          setSeriesErreur(
            error instanceof ApiError ? error.message : "Impossible de charger les séries."
          );
        }
      } finally {
        if (actif) setSeriesChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [niveauSelectionneId, seriesRefreshCle]);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setMatieresChargement(true);
      setMatieresErreur(null);
      try {
        const data = await listerMatieres();
        if (actif) setMatieres(data.results);
      } catch (error) {
        if (actif) {
          setMatieresErreur(
            error instanceof ApiError ? error.message : "Impossible de charger les matières."
          );
        }
      } finally {
        if (actif) setMatieresChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [matieresRefreshCle]);

  function selectionnerCycle(id: number) {
    setCycleSelectionneId((courant) => (courant === id ? null : id));
    setNiveauSelectionneId(null);
  }

  function selectionnerNiveau(id: number) {
    setNiveauSelectionneId((courant) => (courant === id ? null : id));
  }

  const cycleSelectionne = cycles.find((c) => c.id === cycleSelectionneId) ?? null;
  const niveauSelectionne = niveaux.find((n) => n.id === niveauSelectionneId) ?? null;

  function champsPourModale(modale: ModaleFormulaire): readonly ChampFormulaire[] {
    switch (modale.ressource) {
      case "cycle":
        return [
          { nom: "nom", label: "Nom", type: "text", requis: true },
          { nom: "ordre", label: "Ordre", type: "number", requis: true },
        ];
      case "niveau":
        return [
          {
            nom: "cycle",
            label: "Cycle",
            type: "select",
            requis: true,
            options: cycles.map((c) => ({ value: c.id, label: c.nom })),
          },
          { nom: "nom", label: "Nom", type: "text", requis: true },
          { nom: "ordre", label: "Ordre", type: "number", requis: true },
        ];
      case "serie":
        return [
          {
            nom: "niveau",
            label: "Niveau",
            type: "select",
            requis: true,
            options: niveaux.map((n) => ({ value: n.id, label: n.nom })),
          },
          { nom: "nom", label: "Nom", type: "text", requis: true },
        ];
      case "matiere":
        return [{ nom: "nom", label: "Nom", type: "text", requis: true }];
    }
  }

  function valeursInitialesPourModale(modale: ModaleFormulaire): Record<string, string> {
    if (modale.mode === "creer") {
      switch (modale.ressource) {
        case "cycle":
          return { nom: "", ordre: "0" };
        case "niveau":
          return {
            cycle: cycleSelectionneId ? String(cycleSelectionneId) : "",
            nom: "",
            ordre: "0",
          };
        case "serie":
          return { niveau: niveauSelectionneId ? String(niveauSelectionneId) : "", nom: "" };
        case "matiere":
          return { nom: "" };
      }
    }
    switch (modale.ressource) {
      case "cycle":
        return { nom: modale.item.nom, ordre: String(modale.item.ordre) };
      case "niveau":
        return {
          cycle: String(modale.item.cycle.id),
          nom: modale.item.nom,
          ordre: String(modale.item.ordre),
        };
      case "serie":
        return { niveau: String(modale.item.niveau.id), nom: modale.item.nom };
      case "matiere":
        return { nom: modale.item.nom };
    }
  }

  function titrePourModale(modale: ModaleFormulaire): string {
    if (modale.mode === "creer") {
      switch (modale.ressource) {
        case "cycle":
          return "Ajouter un cycle";
        case "niveau":
          return "Ajouter un niveau";
        case "serie":
          return "Ajouter une série";
        case "matiere":
          return "Ajouter une matière";
      }
    }
    switch (modale.ressource) {
      case "cycle":
        return `Modifier le cycle « ${modale.item.nom} »`;
      case "niveau":
        return `Modifier le niveau « ${modale.item.nom} »`;
      case "serie":
        return `Modifier la série « ${modale.item.nom} »`;
      case "matiere":
        return `Modifier la matière « ${modale.item.nom} »`;
    }
  }

  async function soumettreFormulaire(valeurs: Record<string, string>) {
    const modale = modaleFormulaire;
    if (!modale) return;

    if (modale.ressource === "cycle") {
      const data = { nom: valeurs.nom, ordre: Number(valeurs.ordre) };
      if (modale.mode === "creer") await creerCycle(data);
      else await modifierCycle(modale.item.id, data);
      setCyclesRefreshCle((c) => c + 1);
    } else if (modale.ressource === "niveau") {
      const data = { cycle: Number(valeurs.cycle), nom: valeurs.nom, ordre: Number(valeurs.ordre) };
      if (modale.mode === "creer") await creerNiveau(data);
      else await modifierNiveau(modale.item.id, data);
      setCyclesRefreshCle((c) => c + 1); // nb_niveaux du cycle peut changer
      setNiveauxRefreshCle((c) => c + 1);
    } else if (modale.ressource === "serie") {
      const data = { niveau: Number(valeurs.niveau), nom: valeurs.nom };
      if (modale.mode === "creer") await creerSerie(data);
      else await modifierSerie(modale.item.id, data);
      setNiveauxRefreshCle((c) => c + 1); // nb_series du niveau peut changer
      setSeriesRefreshCle((c) => c + 1);
    } else {
      const data = { nom: valeurs.nom };
      if (modale.mode === "creer") await creerMatiere(data);
      else await modifierMatiere(modale.item.id, data);
      setMatieresRefreshCle((c) => c + 1);
    }

    setToast({ message: modale.mode === "creer" ? "Ajouté." : "Modifié.", tone: "succes" });
    setModaleFormulaire(null);
  }

  async function confirmerSuppression() {
    const modale = modaleSuppression;
    if (!modale) return;

    if (modale.ressource === "cycle") {
      await supprimerCycle(modale.item.id);
      setCyclesRefreshCle((c) => c + 1);
    } else if (modale.ressource === "niveau") {
      await supprimerNiveau(modale.item.id);
      setCyclesRefreshCle((c) => c + 1);
      setNiveauxRefreshCle((c) => c + 1);
    } else if (modale.ressource === "serie") {
      await supprimerSerie(modale.item.id);
      setNiveauxRefreshCle((c) => c + 1);
      setSeriesRefreshCle((c) => c + 1);
    } else {
      await supprimerMatiere(modale.item.id);
      setMatieresRefreshCle((c) => c + 1);
    }

    setToast({ message: "Supprimé.", tone: "succes" });
    setModaleSuppression(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-bold text-fh-bleu">Structure scolaire</h2>
        <p className="text-sm text-fh-ardoise">
          Les briques de base du programme : cycles, niveaux, séries et matières.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionPanel
          titre="Cycles"
          onAjouter={() => setModaleFormulaire({ ressource: "cycle", mode: "creer" })}
          chargement={cyclesChargement}
          erreur={cyclesErreur}
          vide={cycles.length === 0}
          messageVide="Aucun cycle. Ajoute le premier cycle pour commencer."
        >
          <div className="flex flex-col gap-2">
            {cycles.map((cycle) => (
              <ItemCard
                key={cycle.id}
                titre={cycle.nom}
                sousTitre={`Ordre ${cycle.ordre}`}
                compteurs={[`${cycle.nb_niveaux} niveau(x)`]}
                selectionne={cycle.id === cycleSelectionneId}
                onClick={() => selectionnerCycle(cycle.id)}
                peutSupprimer={cycle.nb_niveaux === 0}
                onEdit={() => setModaleFormulaire({ ressource: "cycle", mode: "modifier", item: cycle })}
                onDelete={() => setModaleSuppression({ ressource: "cycle", item: cycle })}
              />
            ))}
          </div>
        </SectionPanel>

        <SectionPanel
          titre={cycleSelectionne ? `Niveaux · ${cycleSelectionne.nom}` : "Niveaux"}
          onAjouter={
            cycleSelectionne
              ? () => setModaleFormulaire({ ressource: "niveau", mode: "creer" })
              : undefined
          }
          chargement={niveauxChargement}
          erreur={niveauxErreur}
          vide={!cycleSelectionne || niveaux.length === 0}
          messageVide={
            !cycleSelectionne ? "Sélectionne un cycle à gauche." : "Aucun niveau dans ce cycle."
          }
        >
          <div className="flex flex-col gap-2">
            {niveaux.map((niveau) => (
              <ItemCard
                key={niveau.id}
                titre={niveau.nom}
                sousTitre={`Ordre ${niveau.ordre}`}
                compteurs={[
                  `${niveau.nb_series} série(s)`,
                  `${niveau.nb_programmes} programme(s)`,
                  `${niveau.nb_eleves} élève(s)`,
                ]}
                selectionne={niveau.id === niveauSelectionneId}
                onClick={() => selectionnerNiveau(niveau.id)}
                peutSupprimer={
                  niveau.nb_series === 0 && niveau.nb_programmes === 0 && niveau.nb_eleves === 0
                }
                onEdit={() => setModaleFormulaire({ ressource: "niveau", mode: "modifier", item: niveau })}
                onDelete={() => setModaleSuppression({ ressource: "niveau", item: niveau })}
              />
            ))}
          </div>
        </SectionPanel>

        <SectionPanel
          titre={niveauSelectionne ? `Séries · ${niveauSelectionne.nom}` : "Séries"}
          onAjouter={
            niveauSelectionne
              ? () => setModaleFormulaire({ ressource: "serie", mode: "creer" })
              : undefined
          }
          chargement={seriesChargement}
          erreur={seriesErreur}
          vide={!niveauSelectionne || series.length === 0}
          messageVide={
            !niveauSelectionne ? "Sélectionne un niveau au centre." : "Aucune série pour ce niveau."
          }
        >
          <div className="flex flex-col gap-2">
            {series.map((serie) => (
              <ItemCard
                key={serie.id}
                titre={serie.nom}
                compteurs={[`${serie.nb_programmes} programme(s)`, `${serie.nb_eleves} élève(s)`]}
                peutSupprimer={serie.nb_programmes === 0 && serie.nb_eleves === 0}
                onEdit={() => setModaleFormulaire({ ressource: "serie", mode: "modifier", item: serie })}
                onDelete={() => setModaleSuppression({ ressource: "serie", item: serie })}
              />
            ))}
          </div>
        </SectionPanel>
      </div>

      <SectionPanel
        titre="Matières"
        onAjouter={() => setModaleFormulaire({ ressource: "matiere", mode: "creer" })}
        chargement={matieresChargement}
        erreur={matieresErreur}
        vide={matieres.length === 0}
        messageVide="Aucune matière. Ajoute la première matière."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {matieres.map((matiere) => (
            <ItemCard
              key={matiere.id}
              titre={matiere.nom}
              compteurs={[`${matiere.nb_programmes} programme(s)`]}
              peutSupprimer={matiere.nb_programmes === 0}
              onEdit={() => setModaleFormulaire({ ressource: "matiere", mode: "modifier", item: matiere })}
              onDelete={() => setModaleSuppression({ ressource: "matiere", item: matiere })}
            />
          ))}
        </div>
      </SectionPanel>

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
          question={`Supprimer « ${modaleSuppression.item.nom} » ? Cette action est irréversible.`}
          onConfirm={confirmerSuppression}
          onClose={() => setModaleSuppression(null)}
        />
      )}

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
