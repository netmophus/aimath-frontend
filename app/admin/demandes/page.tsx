"use client";

import { useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { LIBELLE_STATUT, LIBELLE_TYPE, TYPES, dateFr, libelleMatiere, resume, type StatutDemande, type TypeDemande } from "@/lib/aide";
import { listerDemandesAdmin, pieceJointeAdmin, traiterDemandeAdmin, type DemandeAdmin, type ListeAdmin } from "@/lib/aideApi";
import Toast from "@/components/admin/Toast";

const STATUTS: StatutDemande[] = ["recue", "en_cours", "traitee"];
const CHAMP = "rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange";

function Detail({ demande, onSauve }: { demande: DemandeAdmin; onSauve: (d: DemandeAdmin) => void }) {
  const [statut, setStatut] = useState<StatutDemande>(demande.statut);
  const [reponse, setReponse] = useState(demande.reponse);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!demande.a_piece_jointe) return;
    let actif = true;
    let url: string | null = null;
    pieceJointeAdmin(demande.id)
      .then((b) => {
        if (!actif) return;
        url = URL.createObjectURL(b);
        setImage(url);
      })
      .catch(() => undefined);
    return () => {
      actif = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [demande.id, demande.a_piece_jointe]);

  async function enregistrer(e: FormEvent) {
    e.preventDefault();
    if (enCours) return;
    setEnCours(true);
    setErreur(null);
    try {
      onSauve(await traiterDemandeAdmin(demande.id, { statut, reponse }));
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Enregistrement impossible.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={enregistrer} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-fh-sable">
      <p className="text-sm text-fh-ardoise">
        {demande.eleve.nom} · {demande.eleve.telephone}
        {demande.eleve.classe ? ` · ${demande.eleve.classe}` : ""}
      </p>
      <p className="text-sm text-fh-ardoise">
        {LIBELLE_TYPE[demande.type]} · créée le {dateFr(demande.cree_le)}
        {demande.traitee_le ? ` · traitée le ${dateFr(demande.traitee_le)}` : ""}
      </p>
      {(demande.matiere || demande.lecon) && (
        <p className="text-sm font-semibold text-fh-bleu">
          {[demande.matiere && libelleMatiere(demande.matiere.nom), demande.lecon?.nom].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="whitespace-pre-wrap break-words text-sm text-fh-bleu">{demande.message}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image && <img src={image} alt="Pièce jointe de l'élève" className="max-h-72 w-fit max-w-full rounded-lg" />}

      <label className="text-sm font-semibold text-fh-bleu" htmlFor={`statut-${demande.id}`}>Statut</label>
      <select id={`statut-${demande.id}`} value={statut} onChange={(e) => setStatut(e.target.value as StatutDemande)} className={CHAMP}>
        {STATUTS.map((s) => <option key={s} value={s}>{LIBELLE_STATUT[s]}</option>)}
      </select>
      <label className="text-sm font-semibold text-fh-bleu" htmlFor={`reponse-${demande.id}`}>Réponse (visible par l&apos;élève)</label>
      <textarea id={`reponse-${demande.id}`} rows={5} maxLength={5000} value={reponse} onChange={(e) => setReponse(e.target.value)} className={CHAMP} />
      {erreur && <p role="alert" className="text-sm text-red-700">{erreur}</p>}
      <button type="submit" disabled={enCours} className="w-fit rounded-full bg-fh-orange px-5 py-2 text-sm font-semibold text-white hover:bg-fh-orange-fonce disabled:opacity-60">
        {enCours ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

export default function DemandesAdminPage() {
  const [type, setType] = useState<TypeDemande | "">("");
  const [statut, setStatut] = useState<StatutDemande | "">("");
  const [saisie, setSaisie] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListeAdmin | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ouverte, setOuverte] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    listerDemandesAdmin({ type, statut, q, page })
      .then((d) => actif && (setData(d), setErreur(null)))
      .catch((e) => actif && setErreur(e instanceof ApiError ? e.message : "Chargement impossible."));
    return () => { actif = false; };
  }, [type, statut, q, page]);

  function sauve(d: DemandeAdmin) {
    setData((cur) => (cur ? { ...cur, results: cur.results.map((x) => (x.id === d.id ? d : x)) } : cur));
    setToast("Demande enregistrée.");
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-fh-bleu">Demandes d&apos;aide</h2>
        <p className="text-sm text-fh-ardoise">Questions, erreurs et suggestions des élèves.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); setQ(saisie.trim()); }} className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="f-type">Type</label>
        <select id="f-type" value={type} onChange={(e) => { setType(e.target.value as TypeDemande | ""); setPage(1); }} className={CHAMP}>
          <option value="">Tous les types</option>
          {TYPES.map((t) => <option key={t} value={t}>{LIBELLE_TYPE[t]}</option>)}
        </select>
        <label className="sr-only" htmlFor="f-statut">Statut</label>
        <select id="f-statut" value={statut} onChange={(e) => { setStatut(e.target.value as StatutDemande | ""); setPage(1); }} className={CHAMP}>
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s} value={s}>{LIBELLE_STATUT[s]}</option>)}
        </select>
        <label className="sr-only" htmlFor="f-q">Recherche</label>
        <input id="f-q" type="search" placeholder="Rechercher" value={saisie} onChange={(e) => setSaisie(e.target.value)} className={`${CHAMP} w-full min-w-0 sm:w-auto sm:flex-1`} />
        <button type="submit" className="rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu hover:bg-fh-sable/60">Rechercher</button>
      </form>

      {erreur && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>}
      {!erreur && !data && <p role="status" className="text-sm text-fh-ardoise">Chargement…</p>}
      {data && data.results.length === 0 && <p className="rounded-2xl bg-white py-10 text-center text-sm text-fh-ardoise ring-1 ring-fh-sable">Aucune demande.</p>}

      {data && data.results.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.results.map((d) => (
            <li key={d.id} className="flex flex-col gap-2">
              <button
                type="button"
                aria-expanded={ouverte === d.id}
                onClick={() => setOuverte(ouverte === d.id ? null : d.id)}
                className="flex flex-col items-start gap-1 rounded-2xl bg-white p-4 text-left ring-1 ring-fh-sable hover:bg-fh-sable/30"
              >
                <span className="text-xs font-semibold text-fh-ardoise">
                  {LIBELLE_TYPE[d.type]} · {LIBELLE_STATUT[d.statut]} · {dateFr(d.cree_le)} · {d.eleve.nom}
                </span>
                <span className="break-words text-sm text-fh-bleu">{resume(d.message, 140)}</span>
              </button>
              {ouverte === d.id && <Detail key={`${d.id}-${d.mis_a_jour_le}`} demande={d} onSauve={sauve} />}
            </li>
          ))}
        </ul>
      )}

      {data && (data.next || data.previous) && (
        <div className="flex gap-2">
          <button type="button" disabled={!data.previous} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm text-fh-bleu disabled:opacity-50">Précédent</button>
          <button type="button" disabled={!data.next} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm text-fh-bleu disabled:opacity-50">Suivant</button>
        </div>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
