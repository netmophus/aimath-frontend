"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconAlertCircle, IconArrowLeft, IconArrowRight, IconBooks, IconCircleCheck, IconCreditCard, IconSchool } from "@tabler/icons-react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { activerCarteFahimta } from "@/lib/eleveApi";
import StatutAbonnement from "@/components/eleve/StatutAbonnement";
import PaiementNitaSection from "@/components/eleve/PaiementNitaSection";

/**
 * Destination du bouton "Débloquer avec une carte Fahimta" (voir
 * components/eleve/MurDeblocage.tsx). Le paiement par carte (achat) reste
 * hors périmètre — cette page ne gère que l'ACTIVATION d'un code déjà
 * obtenu par ailleurs (achat direct, ou carte reçue d'un vendeur via
 * /eleve/mes-cartes, qui pré-remplit `code` par ce même paramètre d'URL).
 */
export default function AbonnementPage() {
  return (
    <Suspense fallback={null}>
      <AbonnementContenu />
    </Suspense>
  );
}

function AbonnementContenu() {
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();

  const [code, setCode] = useState(() => searchParams.get("code") ?? "");
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState<{ texte: string; tone: "succes" | "erreur" } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saisie = code.trim();
    if (!saisie) return;

    setChargement(true);
    setMessage(null);
    try {
      const resultat = await activerCarteFahimta(saisie);
      // Met à jour l'état global du user tout de suite (pas d'attente d'un
      // rechargement de page) : les cadenas des listes de leçons et le
      // verrou des cours premium déjà ouverts en profitent dès ce clic.
      updateUser({
        aUnAbonnementActif: true,
        abonnementActifJusquAu: resultat.abonnement_actif_jusqu_au,
      });
      setMessage({ texte: resultat.message, tone: "succes" });
      setCode("");
    } catch (error) {
      const texte = error instanceof ApiError ? error.message : "Impossible d'activer cette carte.";
      setMessage({ texte, tone: "erreur" });
    } finally {
      setChargement(false);
    }
  }

  const abonnementActif = user?.aUnAbonnementActif ?? false;
  const echeance = user?.abonnementActifJusquAu;

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5">
      <Link
        href="/eleve"
        className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-[#102A66] px-5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
      >
        <IconArrowLeft size={22} stroke={2.25} aria-hidden="true" />
        Retour
      </Link>

      {/* 1. Bandeau « Carte Fahimta » */}
      <section
        aria-label="Carte Fahimta"
        className="relative overflow-hidden rounded-3xl bg-[linear-gradient(110deg,#1D4ED8_0%,#102A66_62%,#4C1D95_100%)] px-5 py-6 text-white shadow-md sm:px-8 sm:py-8"
      >
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Carte d'abonnement vectorielle inclinée — purement décorative : aucun numéro, aucun code. */}
          <div aria-hidden="true" className="hidden shrink-0 -rotate-6 sm:block">
            <div className="flex h-24 w-36 flex-col lg:h-28 lg:w-44 justify-between overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-[#F97316] to-[#C2410C] p-3 shadow-xl">
              <IconCreditCard size={52} stroke={1.5} className="text-white" />
              <div className="h-2 w-16 rounded-full bg-white/60" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex sm:hidden">
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#C2410C] text-white"
              >
                <IconCreditCard size={34} stroke={1.75} />
              </span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Carte Fahimta</h1>
            <p className="mt-2 max-w-2xl text-base text-white/90 sm:text-lg">
              Active ta carte et accède aux cours premium pendant 30 jours.
            </p>
          </div>

          <div aria-hidden="true" className="hidden shrink-0 items-end gap-1 text-white lg:flex">
            <IconSchool size={112} stroke={1.5} />
            <IconBooks size={72} stroke={1.5} className="mb-1 text-white/80" />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-5 rounded-[32px] bg-[#F8FAFF] p-3 ring-1 ring-blue-100 sm:p-5">
        {/* 2. Accès aux cartes reçues */}
        <Link
          href="/eleve/mes-cartes"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-4 py-2.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] sm:w-fit sm:self-start sm:px-6"
        >
          <IconCreditCard size={26} stroke={1.8} aria-hidden="true" className="shrink-0" />
          Mes cartes
          <IconArrowRight size={22} stroke={2.5} aria-hidden="true" className="shrink-0" />
        </Link>

        <StatutAbonnement actif={abonnementActif} echeance={echeance ?? null} />

        {/* 3 & 4. Activation à gauche, NITA à droite */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="flex min-w-0 flex-col gap-4 rounded-3xl border-2 border-[#C4B5FD] bg-gradient-to-b from-white to-[#F5F3FF] p-4 shadow-sm sm:p-7"
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#7C3AED] text-white sm:h-[72px] sm:w-[72px]"
              >
                <IconCreditCard size={40} stroke={1.6} />
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-[#102A66] sm:text-2xl">Activer ma carte</h2>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">
                  Saisis le code de ta carte.
                </p>
              </div>
            </div>

            <label htmlFor="code-carte" className="text-base font-bold text-[#102A66]">
              Code de la carte
            </label>
            <input
              id="code-carte"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="FH-XXXX-XXXX-XXXX"
              autoComplete="off"
              autoCapitalize="characters"
              className="min-h-14 w-full min-w-0 rounded-2xl border-2 border-[#C4B5FD] bg-white px-3 py-3 text-center text-base font-bold tracking-wide text-[#102A66] outline-none placeholder:font-semibold placeholder:text-slate-400 focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/20 sm:px-4 sm:text-xl sm:tracking-wider"
            />
            <button
              type="submit"
              disabled={chargement || !code.trim()}
              className="min-h-14 w-full rounded-2xl bg-[#C2410C] px-6 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
            >
              {chargement ? "Activation…" : "Activer ma carte"}
            </button>

            {message && (
              <p
                className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-sm font-semibold sm:text-base ${
                  message.tone === "succes" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
                }`}
                role={message.tone === "erreur" ? "alert" : undefined}
              >
                {message.tone === "succes" ? (
                  <IconCircleCheck size={22} stroke={2} aria-hidden="true" className="mt-0.5 shrink-0" />
                ) : (
                  <IconAlertCircle size={22} stroke={2} aria-hidden="true" className="mt-0.5 shrink-0" />
                )}
                <span className="min-w-0">{message.texte}</span>
              </p>
            )}

            {/* Seulement après une activation réussie : sans ça, l'élève reste
                bloqué sur ce formulaire sans chemin évident vers ses cours. */}
            {message?.tone === "succes" && (
              <Link
                href="/eleve"
                className="flex min-h-14 items-center justify-center rounded-2xl bg-[#C2410C] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
              >
                Accéder à mes cours
              </Link>
            )}
          </form>

          <PaiementNitaSection />
        </div>
      </div>
    </div>
  );
}
