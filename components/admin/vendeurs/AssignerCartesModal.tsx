"use client";

import { useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { listerCartes } from "@/lib/carteApi";
import {
  assignerExistantes,
  genererPourVendeur,
  type AssignationReponse,
  type Vendeur,
} from "@/lib/vendeurApi";
import Modal from "@/components/admin/Modal";

type Etape = "choix" | "generer" | "stock" | "resultat";

interface AssignerCartesModalProps {
  vendeur: Vendeur;
  onClose: () => void;
  /** Prévenu juste après une assignation réussie — le parent en profite
   * pour rafraîchir les compteurs/la liste des cartes du vendeur. */
  onAssigne: () => void;
}

/**
 * Deux voies d'assignation, dans LA MÊME modale (voir comptes/
 * admin_vendeurs_views.py côté backend, transaction atomique sur chacune) :
 * générer un nouveau lot directement pour ce vendeur, ou piocher dans le
 * stock central déjà existant. Les codes renvoyés restent MASQUÉS ici — à
 * la différence de "Générer un lot" (stock central, page /admin/cartes),
 * ces cartes partent chez un vendeur, pas vers une impression admin.
 */
export default function AssignerCartesModal({ vendeur, onClose, onAssigne }: AssignerCartesModalProps) {
  const [etape, setEtape] = useState<Etape>("choix");
  const [dureeJours, setDureeJours] = useState("30");
  const [quantite, setQuantite] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<AssignationReponse | null>(null);

  const [stockDisponible, setStockDisponible] = useState<number | null>(null);
  const [chargementStock, setChargementStock] = useState(false);

  useEffect(() => {
    if (etape !== "stock") return;
    let actif = true;
    // queueMicrotask : évite un setState synchrone dans le corps de l'effet
    // (règle react-hooks/set-state-in-effect), même pattern que
    // BoutonTelecharger.tsx.
    queueMicrotask(() => {
      if (actif) setChargementStock(true);
    });
    listerCartes({ statut: "active", vendeur: "none" })
      .then((data) => {
        if (actif) setStockDisponible(data.count);
      })
      .catch(() => {
        if (actif) setStockDisponible(null);
      })
      .finally(() => {
        if (actif) setChargementStock(false);
      });
    return () => {
      actif = false;
    };
  }, [etape]);

  async function handleGenerer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      const reponse = await genererPourVendeur({
        vendeur_id: vendeur.id,
        quantite: Number(quantite),
        duree_jours: Number(dureeJours),
      });
      setResultat(reponse);
      setEtape("resultat");
      onAssigne();
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Impossible de générer ce lot.");
    } finally {
      setEnCours(false);
    }
  }

  async function handleAssignerStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      const reponse = await assignerExistantes({ vendeur_id: vendeur.id, quantite: Number(quantite) });
      setResultat(reponse);
      setEtape("resultat");
      onAssigne();
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Impossible d'assigner ces cartes.");
    } finally {
      setEnCours(false);
    }
  }

  const titre =
    etape === "choix"
      ? `Assigner des cartes à ${vendeur.prenom} ${vendeur.nom}`
      : etape === "generer"
        ? "Générer un nouveau lot pour ce vendeur"
        : etape === "stock"
          ? "Assigner depuis le stock central"
          : "Cartes assignées";

  return (
    <Modal titre={titre} onClose={onClose}>
      {etape === "choix" && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setEtape("generer")}
            className="rounded-xl border border-fh-bleu/20 p-4 text-left transition-colors hover:bg-fh-sable/60"
          >
            <p className="font-semibold text-fh-bleu">Générer un nouveau lot pour ce vendeur</p>
            <p className="mt-0.5 text-sm text-fh-ardoise">
              Crée de nouvelles cartes, directement assignées — commission figée à{" "}
              {vendeur.commission_fcfa.toLocaleString("fr-FR")} FCFA.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setEtape("stock")}
            className="rounded-xl border border-fh-bleu/20 p-4 text-left transition-colors hover:bg-fh-sable/60"
          >
            <p className="font-semibold text-fh-bleu">Assigner depuis le stock central</p>
            <p className="mt-0.5 text-sm text-fh-ardoise">
              Réutilise des cartes déjà générées et encore non assignées.
            </p>
          </button>
        </div>
      )}

      {etape === "generer" && (
        <form onSubmit={handleGenerer} className="flex flex-col gap-4">
          <div>
            <label htmlFor="duree-jours" className="mb-1 block text-sm font-medium text-fh-ardoise">
              Durée (jours)
            </label>
            <input
              id="duree-jours"
              type="number"
              min={1}
              required
              value={dureeJours}
              onChange={(event) => setDureeJours(event.target.value)}
              className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            />
          </div>
          <div>
            <label htmlFor="quantite-generer" className="mb-1 block text-sm font-medium text-fh-ardoise">
              Quantité
            </label>
            <input
              id="quantite-generer"
              type="number"
              min={1}
              max={1000}
              required
              placeholder="Ex. 10"
              value={quantite}
              onChange={(event) => setQuantite(event.target.value)}
              className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            />
          </div>

          {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <div className="mt-2 flex justify-between gap-2">
            <button
              type="button"
              onClick={() => setEtape("choix")}
              className="rounded-full px-4 py-2 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
            >
              ← Retour
            </button>
            <button
              type="submit"
              disabled={enCours}
              className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enCours ? "Génération…" : "Générer et assigner"}
            </button>
          </div>
        </form>
      )}

      {etape === "stock" && (
        <form onSubmit={handleAssignerStock} className="flex flex-col gap-4">
          <p className="rounded-lg bg-fh-accent/40 px-3 py-2 text-sm text-fh-ardoise">
            Stock central disponible :{" "}
            <span className="font-semibold text-fh-orange-fonce">
              {chargementStock ? "…" : (stockDisponible ?? "—")}
            </span>{" "}
            carte(s) active(s) non assignée(s).
          </p>
          <div>
            <label htmlFor="quantite-stock" className="mb-1 block text-sm font-medium text-fh-ardoise">
              Quantité à assigner
            </label>
            <input
              id="quantite-stock"
              type="number"
              min={1}
              max={1000}
              required
              placeholder="Ex. 5"
              value={quantite}
              onChange={(event) => setQuantite(event.target.value)}
              className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            />
          </div>

          {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <div className="mt-2 flex justify-between gap-2">
            <button
              type="button"
              onClick={() => setEtape("choix")}
              className="rounded-full px-4 py-2 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
            >
              ← Retour
            </button>
            <button
              type="submit"
              disabled={enCours}
              className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enCours ? "Assignation…" : "Assigner"}
            </button>
          </div>
        </form>
      )}

      {etape === "resultat" && resultat && (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {resultat.quantite} carte{resultat.quantite > 1 ? "s" : ""} assignée{resultat.quantite > 1 ? "s" : ""}
            {resultat.lot ? ` (lot « ${resultat.lot} »)` : ""}. Codes masqués — visibles en clair uniquement au
            moment d&apos;une génération pour le stock central.
          </p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-fh-sable">
            <ul className="divide-y divide-fh-sable">
              {resultat.cartes.map((carte) => (
                <li key={carte.id} className="px-3 py-2 text-center font-mono text-sm text-fh-bleu">
                  {carte.code}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
          >
            Terminé
          </button>
        </div>
      )}
    </Modal>
  );
}
