"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { creerVendeur, listerVendeurs, modifierVendeur, type Vendeur } from "@/lib/vendeurApi";
import EntityFormModal, { type ChampFormulaire } from "@/components/admin/EntityFormModal";
import Toast from "@/components/admin/Toast";
import VendeurRow from "@/components/admin/vendeurs/VendeurRow";

// Adresse facultative (ville/quartier/école ou point de vente) : sert le
// suivi admin (traçabilité) — voir comptes.models.User, aucun champ requis.
//
// disposition="grille" (voir EntityFormModal) : formulaire à deux colonnes
// (Prénom|Nom, Téléphone|Commission, Ville|Quartier), avec le mot de passe
// et l'école/point de vente en pleine largeur (pleineLargeur) — trop de
// champs pour rester confortable en une seule colonne. Rien d'autre ne
// change (validation, soumission) : uniquement l'ORDRE/LARGEUR déclarés ici,
// EntityFormModal ne connaît que "un champ par ligne" vs "deux colonnes".
const CHAMPS_CREATION: readonly ChampFormulaire[] = [
  { nom: "prenom", label: "Prénom", type: "text", requis: true },
  { nom: "nom", label: "Nom", type: "text", requis: true },
  { nom: "telephone", label: "Téléphone", type: "text", requis: true },
  { nom: "commission_fcfa", label: "Commission (FCFA par carte)", type: "number", requis: true },
  { nom: "mot_de_passe", label: "Mot de passe provisoire", type: "password", requis: true, pleineLargeur: true },
  { nom: "ville", label: "Ville (facultatif)", type: "text" },
  { nom: "quartier", label: "Quartier (facultatif)", type: "text" },
  { nom: "ecole_ou_point_vente", label: "École ou point de vente (facultatif)", type: "text", pleineLargeur: true },
];

const CHAMPS_MODIFICATION: readonly ChampFormulaire[] = [
  { nom: "prenom", label: "Prénom", type: "text", requis: true },
  { nom: "nom", label: "Nom", type: "text", requis: true },
  { nom: "commission_fcfa", label: "Commission (FCFA par carte)", type: "number", requis: true },
  { nom: "ville", label: "Ville (facultatif)", type: "text" },
  { nom: "quartier", label: "Quartier (facultatif)", type: "text" },
  { nom: "ecole_ou_point_vente", label: "École ou point de vente (facultatif)", type: "text", pleineLargeur: true },
];

/**
 * Liste des vendeurs (fondations du module vendeur, côté admin uniquement —
 * l'espace vendeur pour le transfert aux élèves viendra plus tard). Créer/
 * modifier réutilisent EntityFormModal, comme /admin/utilisateurs — aucun
 * nouveau composant de formulaire générique.
 */
export default function VendeursPage() {
  const [vendeurs, setVendeurs] = useState<Vendeur[] | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [refreshCle, setRefreshCle] = useState(0);

  const [modaleCreation, setModaleCreation] = useState(false);
  const [vendeurAModifier, setVendeurAModifier] = useState<Vendeur | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const data = await listerVendeurs();
        if (actif) setVendeurs(data.results);
      } catch (error) {
        if (actif) {
          setErreur(error instanceof ApiError ? error.message : "Impossible de charger les vendeurs.");
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

  async function handleCreer(valeurs: Record<string, string>) {
    await creerVendeur({
      prenom: valeurs.prenom,
      nom: valeurs.nom,
      telephone: valeurs.telephone,
      mot_de_passe: valeurs.mot_de_passe,
      commission_fcfa: Number(valeurs.commission_fcfa),
      ville: valeurs.ville || undefined,
      quartier: valeurs.quartier || undefined,
      ecole_ou_point_vente: valeurs.ecole_ou_point_vente || undefined,
    });
    setModaleCreation(false);
    setToast({ message: "Vendeur créé.", tone: "succes" });
    setRefreshCle((c) => c + 1);
  }

  async function handleModifier(valeurs: Record<string, string>) {
    if (!vendeurAModifier) return;
    await modifierVendeur(vendeurAModifier.id, {
      prenom: valeurs.prenom,
      nom: valeurs.nom,
      commission_fcfa: Number(valeurs.commission_fcfa),
      ville: valeurs.ville || undefined,
      quartier: valeurs.quartier || undefined,
      ecole_ou_point_vente: valeurs.ecole_ou_point_vente || undefined,
    });
    setVendeurAModifier(null);
    setToast({ message: "Vendeur modifié.", tone: "succes" });
    setRefreshCle((c) => c + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-fh-bleu">Vendeurs</h2>
          <p className="text-sm text-fh-ardoise">
            Crée des vendeurs et suis les cartes qui leur sont assignées.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModaleCreation(true)}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          + Créer un vendeur
        </button>
      </div>

      {chargement ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des vendeurs">
          {[0, 1, 2].map((cle) => (
            <div key={cle} className="h-20 animate-pulse rounded-2xl bg-fh-sable/50" />
          ))}
        </div>
      ) : erreur ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>
      ) : !vendeurs || vendeurs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            🧑‍💼
          </span>
          <p className="text-sm text-fh-ardoise">Aucun vendeur pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vendeurs.map((vendeur) => (
            <VendeurRow key={vendeur.id} vendeur={vendeur} onModifier={setVendeurAModifier} />
          ))}
        </div>
      )}

      {modaleCreation && (
        <EntityFormModal
          titre="Créer un vendeur"
          description="Le compte sera actif immédiatement. Le vendeur devra changer ce mot de passe provisoire."
          disposition="grille"
          taille="lg"
          champs={CHAMPS_CREATION}
          valeursInitiales={{
            prenom: "",
            nom: "",
            telephone: "",
            commission_fcfa: "",
            mot_de_passe: "",
            ville: "",
            quartier: "",
            ecole_ou_point_vente: "",
          }}
          onSubmit={handleCreer}
          onClose={() => setModaleCreation(false)}
          libelleSoumettre="Créer"
        />
      )}

      {vendeurAModifier && (
        <EntityFormModal
          titre={`Modifier « ${vendeurAModifier.prenom} ${vendeurAModifier.nom} »`}
          description="Modifier la commission ne change pas celle des cartes déjà assignées — seulement des futures assignations."
          disposition="grille"
          taille="lg"
          champs={CHAMPS_MODIFICATION}
          valeursInitiales={{
            prenom: vendeurAModifier.prenom,
            nom: vendeurAModifier.nom,
            commission_fcfa: String(vendeurAModifier.commission_fcfa),
            ville: vendeurAModifier.ville ?? "",
            quartier: vendeurAModifier.quartier ?? "",
            ecole_ou_point_vente: vendeurAModifier.ecole_ou_point_vente ?? "",
          }}
          onSubmit={handleModifier}
          onClose={() => setVendeurAModifier(null)}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
