"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconInbox } from "@tabler/icons-react";

import { ApiError } from "@/lib/api";
import { dateFr, etatReponse, libelleMatiere, resume } from "@/lib/aide";
import { listerMesDemandes, type Demande } from "@/lib/aideApi";
import { BOUTON_ORANGE, BoutonRetour, CARTE, EtiquetteType, Message, PastilleStatut, Pastille } from "./ui";

export default function ListeDemandes({ envoyee }: { envoyee: boolean }) {
  const [demandes, setDemandes] = useState<Demande[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let actif = true;
    listerMesDemandes()
      .then((d) => actif && (setDemandes(d), setErreur(null)))
      .catch((e) => actif && setErreur(e instanceof ApiError ? e.message : "Chargement impossible. Réessaie."));
    return () => { actif = false; };
  }, [essai]);

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
      <BoutonRetour href="/eleve/aide" />
      <h1 className="text-3xl font-extrabold leading-tight text-[#102A66] sm:text-4xl">Mes demandes</h1>

      {envoyee && <Message ton="succes">Demande envoyée. Tu verras la réponse ici.</Message>}

      {erreur && (
        <div className="flex flex-col gap-3">
          <Message ton="erreur">{erreur}</Message>
          <button type="button" onClick={() => { setErreur(null); setEssai((n) => n + 1); }} className={`${BOUTON_ORANGE} w-fit`}>
            Réessayer
          </button>
        </div>
      )}

      {!erreur && demandes === null && <p role="status" className="text-lg font-semibold text-slate-700">Chargement…</p>}

      {demandes && demandes.length === 0 && (
        <div className={`${CARTE} flex flex-col items-center gap-3 py-12 text-center`}>
          <IconInbox size={48} className="text-[#1D4ED8]" aria-hidden="true" />
          <p className="text-xl font-extrabold text-[#102A66]">Aucune demande</p>
          <Link href="/eleve/aide" className={BOUTON_ORANGE}>Poser une demande</Link>
        </div>
      )}

      {demandes && demandes.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {demandes.map((d) => (
            <li key={d.id}>
              <Link
                href={`/eleve/aide/demandes/${d.id}`}
                className={`${CARTE} flex h-full gap-4 transition-shadow hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]`}
              >
                <Pastille type={d.type} className="h-12 w-12" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="flex flex-wrap items-center gap-2">
                    <EtiquetteType type={d.type} />
                    <PastilleStatut statut={d.statut} />
                    <span className="text-sm font-semibold text-slate-700">{dateFr(d.cree_le)}</span>
                  </span>
                  {(d.matiere || d.lecon) && (
                    <span className="text-base font-bold text-[#102A66]">
                      {[d.matiere && libelleMatiere(d.matiere.nom), d.lecon?.nom].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  <span className="break-words text-base text-slate-800">{resume(d.message)}</span>
                  <span className="text-sm font-semibold text-slate-700">{etatReponse(d)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
