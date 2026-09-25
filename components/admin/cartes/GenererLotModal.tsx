"use client";

import { useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { genererLot, telechargerExportCsv, type CarteGeneree } from "@/lib/carteApi";
import Modal from "@/components/admin/Modal";

interface GenererLotModalProps {
  onClose: () => void;
  /** Prévenu juste après une génération réussie — le parent en profite pour
   * rafraîchir ses vues (lots/liste) sans attendre la fermeture de la modale. */
  onGenere: () => void;
}

/**
 * Formulaire de génération d'un lot, en deux temps dans la MÊME modale :
 * saisie (durée/quantité) puis résultat (codes en clair, copiables/
 * exportables). C'EST LE SEUL MOMENT (avec l'export CSV) où les codes non
 * masqués apparaissent en masse côté back-office — d'où l'avertissement
 * explicite et les deux actions de sauvegarde immédiate (copier, CSV) avant
 * que l'admin ne referme la modale.
 */
export default function GenererLotModal({ onClose, onGenere }: GenererLotModalProps) {
  const [dureeJours, setDureeJours] = useState("30");
  const [quantite, setQuantite] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<{ lot: string; cartes: CarteGeneree[] } | null>(null);
  const [copie, setCopie] = useState(false);
  const [exportEnCours, setExportEnCours] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      const reponse = await genererLot({ quantite: Number(quantite), duree_jours: Number(dureeJours) });
      setResultat({ lot: reponse.lot, cartes: reponse.cartes });
      onGenere();
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Impossible de générer ce lot.");
    } finally {
      setEnCours(false);
    }
  }

  async function copierCodes() {
    if (!resultat) return;
    try {
      await navigator.clipboard.writeText(resultat.cartes.map((carte) => carte.code).join("\n"));
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Presse-papier indisponible (contexte non sécurisé, permission
      // refusée…) : silencieux, l'export CSV reste l'alternative fiable.
    }
  }

  async function exporterCsv() {
    if (!resultat) return;
    setExportEnCours(true);
    try {
      await telechargerExportCsv(resultat.lot);
    } catch {
      // Best-effort : un export raté ici n'empêche pas de fermer la
      // modale, les codes restent visibles/copiables à l'écran.
    } finally {
      setExportEnCours(false);
    }
  }

  return (
    <Modal titre={resultat ? `Lot « ${resultat.lot} » généré` : "Générer un lot de cartes"} onClose={onClose}>
      {!resultat ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <label htmlFor="quantite" className="mb-1 block text-sm font-medium text-fh-ardoise">
              Quantité
            </label>
            <input
              id="quantite"
              type="number"
              min={1}
              max={1000}
              required
              placeholder="Ex. 50"
              value={quantite}
              onChange={(event) => setQuantite(event.target.value)}
              className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            />
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
              disabled={enCours}
              className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enCours ? "Génération…" : "Générer"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg bg-fh-accent/40 px-3 py-2 text-sm text-fh-ardoise">
            {resultat.cartes.length} carte(s) créée(s), {resultat.cartes[0]?.duree_jours} jour(s) chacune. Les
            codes en clair ne sont visibles qu&apos;ici : copie-les ou exporte-les maintenant, ils seront masqués
            ensuite dans la liste.
          </p>

          <div className="max-h-64 overflow-y-auto rounded-lg border border-fh-sable">
            <ul className="divide-y divide-fh-sable">
              {resultat.cartes.map((carte) => (
                <li key={carte.id} className="px-3 py-2 text-center font-mono text-sm text-fh-bleu">
                  {carte.code}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copierCodes}
              className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
            >
              {copie ? "Copié !" : "Copier les codes"}
            </button>
            <button
              type="button"
              disabled={exportEnCours}
              onClick={exporterCsv}
              className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportEnCours ? "Export…" : "Exporter CSV"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
            >
              Terminé
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
