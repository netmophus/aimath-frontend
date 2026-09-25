import Link from "next/link";

import type { Vendeur } from "@/lib/vendeurApi";

interface VendeurRowProps {
  vendeur: Vendeur;
  onModifier: (vendeur: Vendeur) => void;
}

/** "Douala" / "Douala · Akwa" / "Akwa" selon ce qui est renseigné — jamais de
 * tiret ou virgule orpheline si une partie manque. */
function adresseCourte(vendeur: Vendeur): string | null {
  const parties = [vendeur.ville, vendeur.quartier].filter((p): p is string => Boolean(p));
  return parties.length > 0 ? parties.join(" · ") : null;
}

export default function VendeurRow({ vendeur, onModifier }: VendeurRowProps) {
  const adresse = adresseCourte(vendeur);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-fh-bleu">
          {vendeur.prenom} {vendeur.nom}
        </p>
        <p className="text-sm text-fh-ardoise">
          {vendeur.telephone} · Commission {vendeur.commission_fcfa.toLocaleString("fr-FR")} FCFA/carte
        </p>
        {adresse && <p className="text-xs text-fh-ardoise">{adresse}</p>}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-fh-accent px-2.5 py-0.5 text-xs font-medium text-fh-orange-fonce">
            {vendeur.cartes_disponibles} disponible{vendeur.cartes_disponibles > 1 ? "s" : ""}
          </span>
          <span className="rounded-full bg-fh-bleu/10 px-2.5 py-0.5 text-xs font-medium text-fh-bleu">
            {vendeur.cartes_vendues} vendue{vendeur.cartes_vendues > 1 ? "s" : ""}
          </span>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            {vendeur.cartes_activees} activée{vendeur.cartes_activees > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onModifier(vendeur)}
          className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          Modifier
        </button>
        <Link
          href={`/admin/vendeurs/${vendeur.id}`}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          Voir le détail
        </Link>
      </div>
    </div>
  );
}
