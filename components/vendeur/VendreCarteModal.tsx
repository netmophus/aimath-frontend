"use client";

import { useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { PRIX_CARTE_FCFA } from "@/lib/carteApi";
import {
  listerCartesDisponibles,
  verifierEleve,
  vendreCarte,
  type CarteVendeur,
  type EleveTrouve,
} from "@/lib/vendeurEspaceApi";
import Modal from "@/components/admin/Modal";

type Etape = "saisie" | "selection" | "succes";

interface VendreCarteModalProps {
  /** Commission fixe du vendeur (FCFA/carte) — pour le total affiché à la
   * sélection (voir StatCard "Commission" du dashboard, même source `moi`). */
  commissionFcfa: number;
  onClose: () => void;
  /** Prévenu juste après une vente réussie — le parent en profite pour
   * rafraîchir les compteurs et la liste. */
  onVendue: () => void;
}

/**
 * Vente = transfert d'une ou plusieurs cartes ACTIVES du vendeur connecté à
 * un élève déjà inscrit, identifié par téléphone. Trois étapes :
 *   1. saisie du téléphone + vérification (affiche le nom de l'élève avant
 *      d'aller plus loin — une faute de frappe n'attribue jamais une carte
 *      au mauvais élève sans que le vendeur ait pu vérifier le nom) ;
 *   2. sélection individuelle des cartes à vendre (cases à cocher parmi les
 *      cartes disponibles), avec total et commission calculés en direct ;
 *   3. confirmation → vente, tout ou rien côté backend (voir
 *      comptes.vendeur_views.VendreCarteView).
 *
 * Le vendeur ne voit JAMAIS de code ici, à aucune étape — CarteVendeur
 * (lib/vendeurEspaceApi.ts) n'a d'ailleurs pas de champ `code`.
 */
export default function VendreCarteModal({ commissionFcfa, onClose, onVendue }: VendreCarteModalProps) {
  const [etape, setEtape] = useState<Etape>("saisie");
  const [telephone, setTelephone] = useState("");
  const [eleveTrouve, setEleveTrouve] = useState<EleveTrouve | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  const [cartesDisponibles, setCartesDisponibles] = useState<CarteVendeur[] | null>(null);
  const [chargementCartes, setChargementCartes] = useState(false);
  const [selection, setSelection] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (etape !== "selection") return;
    let actif = true;
    // queueMicrotask : évite un setState synchrone dans le corps de l'effet
    // (règle react-hooks/set-state-in-effect), même pattern qu'AssignerCartesModal.tsx.
    queueMicrotask(() => {
      if (actif) setChargementCartes(true);
    });
    listerCartesDisponibles()
      .then((cartes) => {
        if (actif) setCartesDisponibles(cartes);
      })
      .catch(() => {
        if (actif) setCartesDisponibles([]);
      })
      .finally(() => {
        if (actif) setChargementCartes(false);
      });
    return () => {
      actif = false;
    };
  }, [etape]);

  async function handleVerifier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saisie = telephone.trim();
    if (!saisie) return;

    setErreur(null);
    setEnCours(true);
    try {
      const eleve = await verifierEleve(saisie);
      setEleveTrouve(eleve);
      setEtape("selection");
    } catch (error) {
      setErreur(
        error instanceof ApiError ? error.message : "Impossible de vérifier ce numéro pour l'instant."
      );
    } finally {
      setEnCours(false);
    }
  }

  function toggleCarte(id: number) {
    setSelection((actuelle) => {
      const suivante = new Set(actuelle);
      if (suivante.has(id)) {
        suivante.delete(id);
      } else {
        suivante.add(id);
      }
      return suivante;
    });
  }

  function toggleTout() {
    if (!cartesDisponibles) return;
    setSelection((actuelle) =>
      actuelle.size === cartesDisponibles.length ? new Set() : new Set(cartesDisponibles.map((c) => c.id))
    );
  }

  async function handleConfirmer() {
    if (selection.size === 0) return;
    setErreur(null);
    setEnCours(true);
    try {
      const reponse = await vendreCarte({
        telephone_eleve: telephone.trim(),
        carte_ids: Array.from(selection),
      });
      setMessageSucces(reponse.message);
      setEtape("succes");
      onVendue();
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Impossible de vendre ces cartes pour l'instant.");
    } finally {
      setEnCours(false);
    }
  }

  const titre =
    etape === "saisie" ? "Vendre une carte" : etape === "selection" ? "Choisir les cartes" : "Cartes envoyées";

  const total = selection.size * PRIX_CARTE_FCFA;
  const commission = selection.size * commissionFcfa;

  return (
    <Modal titre={titre} onClose={onClose}>
      {etape === "saisie" && (
        <form onSubmit={handleVerifier} className="flex flex-col gap-4">
          <div>
            <label htmlFor="telephone-eleve" className="mb-1 block text-sm font-medium text-fh-ardoise">
              Téléphone de l&apos;élève
            </label>
            <input
              id="telephone-eleve"
              type="tel"
              required
              placeholder="+227 90 00 00 00"
              value={telephone}
              onChange={(event) => setTelephone(event.target.value)}
              className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            />
            <p className="mt-1 text-xs text-fh-ardoise">
              L&apos;élève doit déjà avoir un compte Fahimta avec ce numéro.
            </p>
          </div>

          {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={enCours || !telephone.trim()}
              className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enCours ? "Vérification…" : "Vérifier"}
            </button>
          </div>
        </form>
      )}

      {etape === "selection" && eleveTrouve && (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg bg-fh-accent/40 px-3 py-2 text-sm text-fh-ardoise">
            Élève trouvé :{" "}
            <span className="font-semibold text-fh-orange-fonce">
              {eleveTrouve.prenom} {eleveTrouve.nom}
            </span>
            . Coche les cartes à lui envoyer.
          </p>

          {chargementCartes ? (
            <div className="flex flex-col gap-2" aria-busy="true" aria-label="Chargement des cartes disponibles">
              {[0, 1, 2].map((cle) => (
                <div key={cle} className="h-10 animate-pulse rounded-lg bg-fh-sable/50" />
              ))}
            </div>
          ) : !cartesDisponibles || cartesDisponibles.length === 0 ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Aucune carte disponible pour l&apos;instant.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleTout}
                className="self-start text-xs font-medium text-fh-orange hover:text-fh-orange-fonce"
              >
                {selection.size === cartesDisponibles.length ? "Tout désélectionner" : "Tout sélectionner"}
              </button>

              <div className="max-h-64 overflow-y-auto rounded-lg border border-fh-sable">
                <ul className="divide-y divide-fh-sable">
                  {cartesDisponibles.map((carte) => (
                    <li key={carte.id}>
                      <label className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-fh-sable/40">
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selection.has(carte.id)}
                            onChange={() => toggleCarte(carte.id)}
                            className="h-4 w-4 accent-fh-orange"
                          />
                          <span className="text-fh-bleu">
                            {carte.duree_jours} jour{carte.duree_jours > 1 ? "s" : ""}
                          </span>
                        </span>
                        <span className="text-fh-ardoise">{PRIX_CARTE_FCFA.toLocaleString("fr-FR")} FCFA</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-fh-creme px-3 py-2.5 text-sm text-fh-bleu">
                <p>
                  <span className="font-semibold">{selection.size}</span> carte
                  {selection.size > 1 ? "s" : ""} sélectionnée{selection.size > 1 ? "s" : ""}
                </p>
                <p className="mt-0.5 text-fh-ardoise">
                  Total {total.toLocaleString("fr-FR")} FCFA · Commission {commission.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            </>
          )}

          {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <div className="mt-2 flex justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setEtape("saisie");
                setSelection(new Set());
                setCartesDisponibles(null);
              }}
              className="rounded-full px-4 py-2 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
            >
              ← Retour
            </button>
            <button
              type="button"
              onClick={handleConfirmer}
              disabled={enCours || selection.size === 0}
              className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enCours ? "Envoi…" : "Confirmer la vente"}
            </button>
          </div>
        </div>
      )}

      {etape === "succes" && messageSucces && (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-700">{messageSucces}</p>
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
