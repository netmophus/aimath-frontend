"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  PLANS_NITA,
  initierPaiementNita,
  verifierPaiementNita,
  type PlanNita,
} from "@/lib/eleveApi";

type Etape = "choix" | "attente" | "succes";

const INTERVALLE_POLL_MS = 5000;

/**
 * Section "Payer avec NITA" — second moyen (avec la carte Fahimta ci-
 * dessus) de créditer l'abonnement. Le polling automatique ET le bouton
 * "Vérifier maintenant" appellent TOUS LES DEUX /nita/verifier/, qui
 * ré-interroge activement NITA côté serveur avant de créditer quoi que ce
 * soit (jamais une simple relecture optimiste de /me/) — idempotent, donc
 * sans risque à répéter automatiquement toutes les 5s.
 */
export default function PaiementNitaSection() {
  const { updateUser } = useAuth();
  const [plan] = useState<PlanNita>(PLANS_NITA[0]);

  const [etape, setEtape] = useState<Etape>("choix");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  const [reference, setReference] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function arreterPoll() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  // Nettoyage à la fermeture/au démontage — jamais de polling orphelin.
  useEffect(() => arreterPoll, []);

  async function verifier(requestIdActuel: string, depuisPoll: boolean) {
    try {
      const reponse = await verifierPaiementNita(requestIdActuel);
      if (reponse.confirme) {
        arreterPoll();
        updateUser({
          aUnAbonnementActif: true,
          abonnementActifJusquAu: reponse.abonnement_actif_jusqu_au ?? null,
        });
        setMessageSucces(reponse.message);
        setEtape("succes");
        return;
      }
      // Pas encore confirmé : rien d'anormal pendant le polling silencieux,
      // seul un clic explicite sur "Vérifier maintenant" affiche le message.
      if (!depuisPoll) setErreur(reponse.message);
    } catch (error) {
      const texte = error instanceof ApiError ? error.message : "NITA est injoignable pour l'instant.";
      // Le polling silencieux n'affiche pas une erreur réseau transitoire à
      // chaque tick (ça reviendrait 5s plus tard tout seul) — seul un clic
      // explicite remonte l'erreur immédiatement.
      if (!depuisPoll) setErreur(texte);
    }
  }

  async function handlePayer() {
    setErreur(null);
    setEnCours(true);
    try {
      const reponse = await initierPaiementNita(plan.id);
      setReference(reponse.reference);
      setRequestId(reponse.requestId);
      setEtape("attente");

      arreterPoll();
      pollRef.current = setInterval(() => {
        verifier(reponse.requestId, true);
      }, INTERVALLE_POLL_MS);
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Impossible de démarrer le paiement NITA.");
    } finally {
      setEnCours(false);
    }
  }

  async function handleVerifierMaintenant() {
    if (!requestId) return;
    setErreur(null);
    setEnCours(true);
    try {
      await verifier(requestId, false);
    } finally {
      setEnCours(false);
    }
  }

  function handleAnnuler() {
    arreterPoll();
    setEtape("choix");
    setReference(null);
    setRequestId(null);
    setErreur(null);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-fh-sable">
      <div>
        <h2 className="text-sm font-semibold text-fh-bleu">Payer avec NITA</h2>
        <p className="mt-0.5 text-xs text-fh-ardoise">
          Paiement mobile par référence — active ton abonnement en quelques minutes.
        </p>
      </div>

      {etape === "choix" && (
        <>
          <div className="flex items-center justify-between rounded-xl border border-fh-sable bg-fh-creme px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-fh-bleu">{plan.label}</p>
              <p className="text-xs text-fh-ardoise">{plan.duree_jours} jours · tous les cours</p>
            </div>
            <p className="text-sm font-bold text-fh-orange-fonce">
              {plan.montant.toLocaleString("fr-FR")} FCFA
            </p>
          </div>

          {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <button
            type="button"
            onClick={handlePayer}
            disabled={enCours}
            className="min-h-11 rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enCours ? "Démarrage…" : "Payer avec NITA"}
          </button>
        </>
      )}

      {etape === "attente" && reference && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-dashed border-fh-bleu/30 bg-fh-creme px-4 py-3 text-center">
            <p className="text-xs font-medium text-fh-ardoise">Référence à payer</p>
            <p className="mt-1 break-all font-mono text-lg font-bold text-fh-bleu">{reference}</p>
          </div>

          <p className="text-sm text-fh-ardoise">
            Ouvre <strong>MYNITA</strong> (ou présente-toi au guichet NITA) et paie cette référence. Ton
            abonnement s&apos;active automatiquement dès la confirmation du paiement.
          </p>

          {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleVerifierMaintenant}
              disabled={enCours}
              className="min-h-11 flex-1 rounded-full bg-fh-orange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enCours ? "Vérification…" : "J'ai payé — vérifier maintenant"}
            </button>
            <button
              type="button"
              onClick={handleAnnuler}
              className="min-h-11 rounded-full border border-fh-bleu/20 px-4 py-2.5 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {etape === "succes" && messageSucces && (
        <div className="flex flex-col gap-3">
          <p className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-700">{messageSucces}</p>
          <Link
            href="/eleve"
            className="flex min-h-11 items-center justify-center rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
          >
            Accéder à mes cours
          </Link>
        </div>
      )}
    </div>
  );
}
