"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import type { CarteRecueEleve, StatutCarteRecue } from "@/lib/eleveApi";
import StatutBadge from "@/components/admin/StatutBadge";

const STYLES_STATUT: Record<StatutCarteRecue, string> = {
  active: "bg-fh-accent text-fh-orange-fonce",
  utilisee: "bg-green-100 text-green-700",
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

/** Hachures grises en CSS pur — même texture que l'aperçu admin (voir
 * components/admin/cartes/CarteRow.tsx), pour un design carte cohérent dans
 * toute l'app : ici le code est VISIBLE (c'est légitime, l'élève est
 * propriétaire de sa carte), la texture n'a donc qu'un rôle décoratif. */
const TEXTURE_GRATTAGE: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 2px, transparent 2px, transparent 9px)",
};

/**
 * Une carte reçue d'un vendeur, affichée à l'élève connecté — MÊME design
 * visuel que l'aperçu admin (dégradé, logo, pastille prix) mais avec le
 * CODE EN CLAIR (voir lib/eleveApi.ts, CarteRecueEleve.code) : contrairement
 * au vendeur, l'élève a le droit de voir le code de SA carte. Boutons
 * "Copier le code" et "Activer" (pré-remplit /eleve/abonnement?code=...).
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
    <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E2B6A] to-[#243584] p-4 text-white shadow-md sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-1">
          <Image src="/fahimta.png" alt="" width={32} height={32} className="h-full w-full object-contain" />
        </span>
        <span className="text-sm font-bold tracking-wide text-white">Fahimta</span>
        <span className="ml-auto text-xs text-white/70">
          {carte.duree_jours} jour{carte.duree_jours > 1 ? "s" : ""} · tous les cours
        </span>
      </div>

      <div
        style={TEXTURE_GRATTAGE}
        className="flex items-center justify-center rounded-lg bg-fh-bleu-charbon/60 px-3 py-2.5"
      >
        <span className="break-all text-center font-mono text-sm font-semibold tracking-wide text-white sm:text-base">
          {carte.code}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatutBadge statut={carte.statut} styles={STYLES_STATUT} labels={LABELS_STATUT} />
        {carte.statut === "utilisee" && carte.date_activation && (
          <span className="text-xs text-white/70">Activée le {formaterDateFr(carte.date_activation)}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copierCode}
          className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          {copie ? "Copié !" : "Copier le code"}
        </button>
        {carte.statut === "active" && (
          <Link
            href={`/eleve/abonnement?code=${encodeURIComponent(carte.code)}`}
            className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
          >
            Activer
          </Link>
        )}
      </div>
    </div>
  );
}
