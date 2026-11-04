"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { dateFr, etatReponse, libelleMatiere } from "@/lib/aide";
import { getMaDemande, pieceJointeEleve, type Demande } from "@/lib/aideApi";
import { BoutonRetour, CARTE, EtiquetteType, Message, PastilleStatut } from "./ui";

export default function DetailDemande({ id }: { id: number }) {
  const [demande, setDemande] = useState<Demande | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    let url: string | null = null;
    getMaDemande(id)
      .then(async (d) => {
        if (!actif) return;
        setDemande(d);
        if (d.a_piece_jointe) {
          try {
            const blob = await pieceJointeEleve(id);
            if (!actif) return;
            url = URL.createObjectURL(blob);
            setImage(url);
          } catch {
            /* l'image reste absente : le texte et la réponse restent lisibles */
          }
        }
      })
      .catch((e) => actif && setErreur(e instanceof ApiError && e.status === 404 ? "Demande introuvable." : "Chargement impossible. Réessaie."));
    return () => {
      actif = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
      <BoutonRetour href="/eleve/aide/demandes" />
      <h1 className="text-3xl font-extrabold leading-tight text-[#102A66] sm:text-4xl">Ma demande</h1>
      {erreur && <Message ton="erreur">{erreur}</Message>}
      {!erreur && !demande && <p role="status" className="text-lg font-semibold text-slate-700">Chargement…</p>}
      {demande && (
        <>
          <section className={`${CARTE} flex flex-col gap-3`}>
            <div className="flex flex-wrap items-center gap-2">
              <EtiquetteType type={demande.type} />
              <PastilleStatut statut={demande.statut} />
              <span className="text-sm font-semibold text-slate-700">{dateFr(demande.cree_le)}</span>
            </div>
            {demande.matiere && <p className="text-base font-bold text-[#102A66]">Matière : {libelleMatiere(demande.matiere.nom)}</p>}
            {demande.lecon && <p className="text-base font-bold text-[#102A66]">Leçon : {demande.lecon.nom}</p>}
            <p className="whitespace-pre-wrap break-words text-lg text-slate-900">{demande.message}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {image && <img src={image} alt="Image jointe à ta demande" className="max-h-96 w-fit max-w-full rounded-2xl ring-1 ring-blue-200" />}
          </section>

          <section aria-labelledby="titre-reponse" className={`${CARTE} flex flex-col gap-3`}>
            <h2 id="titre-reponse" className="text-xl font-extrabold text-[#102A66]">Réponse</h2>
            {demande.a_reponse ? (
              <>
                <p className="whitespace-pre-wrap break-words text-lg text-slate-900">{demande.reponse}</p>
                {demande.reponse_le && <p className="text-sm font-semibold text-slate-700">Répondu le {dateFr(demande.reponse_le)}</p>}
              </>
            ) : (
              <p className="text-base font-semibold text-slate-700">
                {etatReponse(demande)}.
                {demande.statut === "traitee" && demande.traitee_le ? ` Le ${dateFr(demande.traitee_le)}.` : ""}
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
