"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconCheck, IconCircleCheck, IconCopy, IconCreditCard } from "@tabler/icons-react";

import type { CarteRecueEleve, StatutCarteRecue } from "@/lib/eleveApi";
import StatutBadge from "@/components/admin/StatutBadge";

const STYLES_STATUT: Record<StatutCarteRecue, string> = {
  active: "bg-[#FFEDD5] text-[#9A3412]",
  utilisee: "bg-green-100 text-green-800",
};

const LABELS_STATUT: Record<StatutCarteRecue, string> = {
  active: "À activer",
  utilisee: "Activée",
};

function formaterDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Hachures en CSS pur — même texture que l'aperçu admin (voir
 * components/admin/cartes/CarteRow.tsx), pour un design carte cohérent dans
 * toute l'app : ici le code est VISIBLE (c'est légitime, l'élève est
 * propriétaire de sa carte), la texture n'a donc qu'un rôle décoratif. */
const TEXTURE_GRATTAGE: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 2px, transparent 2px, transparent 9px)",
};

/**
 * Une carte reçue d'un vendeur, affichée à l'élève connecté — MÊME design
 * visuel que l'aperçu admin (dégradé, logo, durée) mais avec le CODE EN
 * CLAIR (voir lib/eleveApi.ts, CarteRecueEleve.code) : contrairement au
 * vendeur, l'élève a le droit de voir le code de SA carte. Boutons "Copier
 * le code" et "Activer" (pré-remplit /eleve/abonnement?code=... — ne déclenche
 * aucune activation par lui-même).
 */
export default function CarteRecueRow({ carte }: { carte: CarteRecueEleve }) {
  const [copie, setCopie] = useState(false);

  async function copierCode() {
    try {
      await navigator.clipboard.writeText(carte.code);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Presse-papier indisponible (contexte non sécurisé, permission
      // refusée…) : silencieux, le code reste visible et copiable à la main.
    }
  }

  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/15 bg-[linear-gradient(135deg,#102A66_0%,#1E3A8A_55%,#4C1D95_130%)] p-4 text-white shadow-lg sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white p-1.5">
          <Image src="/fahimta.png" alt="" width={36} height={36} className="h-full w-full object-contain" />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-extrabold tracking-wide">Fahimta</p>
          <p className="text-sm text-white/80">
            {carte.duree_jours} jour{carte.duree_jours > 1 ? "s" : ""} · tous les cours
          </p>
        </div>
        <span
          aria-hidden="true"
          className="ml-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#C2410C] text-white shadow-md"
        >
          <IconCreditCard size={34} stroke={1.7} />
        </span>
      </div>

      <div
        style={TEXTURE_GRATTAGE}
        className="flex items-center justify-center rounded-2xl border border-white/20 bg-[#0B1B45]/70 px-3 py-4"
      >
        <span className="break-all text-center font-mono text-base font-bold tracking-[0.1em] text-white sm:text-xl">
          {carte.code}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatutBadge statut={carte.statut} styles={STYLES_STATUT} labels={LABELS_STATUT} />
        {carte.statut === "utilisee" && carte.date_activation && (
          <span className="text-sm text-white/80">Activée le {formaterDateFr(carte.date_activation)}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copierCode}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-white/60 px-5 text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-none"
        >
          {copie ? <IconCheck size={22} stroke={2.5} aria-hidden="true" /> : <IconCopy size={22} stroke={2} aria-hidden="true" />}
          {copie ? "Copié !" : "Copier le code"}
        </button>
        {carte.statut === "active" && (
          <Link
            href={`/eleve/abonnement?code=${encodeURIComponent(carte.code)}`}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-none"
          >
            <IconCircleCheck size={22} stroke={2} aria-hidden="true" />
            Activer
          </Link>
        )}
      </div>
    </div>
  );
}
