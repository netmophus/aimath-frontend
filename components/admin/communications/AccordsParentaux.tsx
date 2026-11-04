"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { LIBELLE_METHODE } from "@/lib/preferencesCommunication";
import { demandesParentales, deciderParental, type DemandeParentale, type MethodeParentale } from "@/lib/preferencesCommunicationApi";

const CHAMP = "rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange";

function Ligne({ d, onFait, onErreur }: { d: DemandeParentale; onFait: (m: string) => void; onErreur: (m: string) => void }) {
  const [methode, setMethode] = useState<MethodeParentale>("appel");
  const [occupe, setOccupe] = useState(false);

  async function decider(decision: "valider" | "refuser") {
    if (occupe) return;
    setOccupe(true);
    try {
      await deciderParental(d.utilisateur_id, { decision, methode: decision === "valider" ? methode : undefined });
      onFait(decision === "valider" ? "Accord parental validé et consigné." : "Demande refusée.");
    } catch (e) {
      onErreur(e instanceof ApiError ? e.message : "Action impossible.");
      setOccupe(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl bg-fh-sable/40 p-3">
      <p className="break-words text-sm text-fh-bleu">
        <span className="font-semibold">{d.nom}</span> · parent : <span className="font-mono">{d.parental_telephone}</span>
        {d.majorite === "inconnue" ? " · âge inconnu" : ""}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor={`methode-${d.utilisateur_id}`}>Méthode de vérification</label>
        <select id={`methode-${d.utilisateur_id}`} value={methode} onChange={(e) => setMethode(e.target.value as MethodeParentale)} className={CHAMP}>
          {Object.entries(LIBELLE_METHODE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="button" disabled={occupe} onClick={() => decider("valider")} className="rounded-lg bg-fh-bleu px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Valider après vérification</button>
        <button type="button" disabled={occupe} onClick={() => decider("refuser")} className="rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm text-fh-bleu disabled:opacity-50">Refuser</button>
      </div>
    </li>
  );
}

/** File des accords parentaux demandés par des élèves mineurs : validés à la main, après vérification, et consignés. */
export default function AccordsParentaux({ onMessage }: { onMessage: (m: string, tone: "succes" | "erreur") => void }) {
  const [liste, setListe] = useState<DemandeParentale[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(() => {
    demandesParentales()
      .then((d) => { setListe(d); setErreur(null); })
      .catch((e) => setErreur(e instanceof ApiError ? e.message : "Chargement impossible."));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  return (
    <section aria-labelledby="titre-parental" className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-fh-sable">
      <h3 id="titre-parental" className="text-sm font-bold text-fh-bleu">Accords parentaux à vérifier</h3>
      <p className="text-xs text-fh-ardoise">
        Un élève mineur doit indiquer le numéro d&apos;un parent. Contacte ce parent, puis valide en précisant comment tu as vérifié. Sans validation, aucune invitation WhatsApp n&apos;est envoyée.
      </p>
      {erreur && <p role="alert" className="text-sm text-red-700">{erreur}</p>}
      {liste && liste.length === 0 && <p className="text-sm text-fh-ardoise">Aucune demande en attente.</p>}
      {liste && liste.length > 0 && (
        <ul className="flex flex-col gap-2">
          {liste.map((d) => (
            <Ligne key={d.utilisateur_id} d={d} onFait={(m) => { onMessage(m, "succes"); charger(); }} onErreur={(m) => onMessage(m, "erreur")} />
          ))}
        </ul>
      )}
    </section>
  );
}
