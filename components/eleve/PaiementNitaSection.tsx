"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconAlertCircle, IconCircleCheck, IconDeviceMobile } from "@tabler/icons-react";

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
    <section
      aria-label="Payer avec NITA"
      className="flex flex-col gap-4 rounded-3xl border-2 border-orange-200 bg-gradient-to-b from-white to-[#FFF7ED] p-5 shadow-sm sm:p-7"
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F97316] text-white sm:h-[72px] sm:w-[72px]"
        >
          <IconDeviceMobile size={40} stroke={1.6} />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-[#102A66] sm:text-2xl">Payer avec NITA</h2>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">
            Paiement mobile par référence — active ton abonnement en quelques minutes.
          </p>
        </div>
      </div>

      {etape === "choix" && (
        <>
          <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-orange-200 bg-white px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-[#102A66]">{plan.label}</p>
              <p className="text-sm text-slate-600">{plan.duree_jours} jours · tous les cours</p>
            </div>
            <p className="shrink-0 text-xl font-extrabold text-[#C2410C] sm:text-2xl">
              {plan.montant.toLocaleString("fr-FR")} FCFA
            </p>
          </div>

          {erreur && (
            <p className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:text-base">
              <IconAlertCircle size={22} stroke={2} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="min-w-0">{erreur}</span>
            </p>
          )}

          <button
            type="button"
            onClick={handlePayer}
            disabled={enCours}
            className="min-h-14 w-full rounded-2xl bg-[#C2410C] px-6 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
          >
            {enCours ? "Démarrage…" : "Payer avec NITA"}
          </button>
        </>
      )}

      {etape === "attente" && reference && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border-2 border-dashed border-[#F97316] bg-white px-4 py-4 text-center">
            <p className="text-sm font-semibold text-slate-600">Référence à payer</p>
            <p className="mt-1 break-all font-mono text-xl font-extrabold text-[#102A66] sm:text-2xl">{reference}</p>
          </div>

          <p className="text-sm text-slate-700 sm:text-base">
            Ouvre <strong>MYNITA</strong> (ou présente-toi au guichet NITA) et paie cette référence. Ton
            abonnement s&apos;active automatiquement dès la confirmation du paiement.
          </p>

          {erreur && (
            <p className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:text-base">
              <IconAlertCircle size={22} stroke={2} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="min-w-0">{erreur}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleVerifierMaintenant}
              disabled={enCours}
              className="min-h-14 flex-1 rounded-2xl bg-[#C2410C] px-4 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enCours ? "Vérification…" : "J'ai payé — vérifier maintenant"}
            </button>
            <button
              type="button"
              onClick={handleAnnuler}
              className="min-h-14 rounded-2xl border-2 border-[#102A66]/25 bg-white px-5 py-3 text-base font-semibold text-[#102A66] transition-colors hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {etape === "succes" && messageSucces && (
        <div className="flex flex-col gap-4">
          <p className="flex items-start gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 sm:text-base">
            <IconCircleCheck size={22} stroke={2} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="min-w-0">{messageSucces}</span>
          </p>
          <Link
            href="/eleve"
            className="flex min-h-14 items-center justify-center rounded-2xl bg-[#C2410C] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
          >
            Accéder à mes cours
          </Link>
        </div>
      )}
    </section>
  );
}
