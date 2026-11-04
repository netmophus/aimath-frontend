"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";
import {
  LIBELLE_EXCLUSION,
  etatCampagne,
  LIBELLE_STATUT_MESSAGE,
  LIBELLE_TYPE,
  formatFcfa,
} from "@/lib/communications";
import * as api from "@/lib/communicationsApi";
import Toast from "@/components/admin/Toast";
import AccordsParentaux from "@/components/admin/communications/AccordsParentaux";

function dateHeure(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const CHAMP = "rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange";

function Reglages({ params, onSauve, onErreur }: { params: api.Parametres; onSauve: (p: api.Parametres) => void; onErreur: (m: string) => void }) {
  const [lien, setLien] = useState(params.lien_whatsapp);
  const [plafond, setPlafond] = useState(String(params.plafond_mensuel_fcfa));
  const [tarif, setTarif] = useState(params.cout_segment_fcfa ?? "");
  const [enCours, setEnCours] = useState(false);

  async function enregistrer(e: FormEvent) {
    e.preventDefault();
    if (enCours) return;
    setEnCours(true);
    try {
      onSauve(
        await api.modifierParametres({
          lien_whatsapp: lien.trim(),
          plafond_mensuel_fcfa: Number(plafond) || 0,
          cout_segment_fcfa: String(tarif).trim() === "" ? null : Number(String(tarif).replace(",", ".")),
        }),
      );
    } catch (err) {
      onErreur(err instanceof ApiError ? err.message : "Enregistrement impossible.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={enregistrer} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-fh-sable">
      <h3 className="text-base font-bold text-fh-bleu">Réglages</h3>
      <p role="status" className={`rounded-lg px-3 py-2 text-sm ${params.envois_actifs ? "bg-green-50 text-green-800" : "bg-fh-accent text-fh-bleu"}`}>
        {params.envois_actifs ? "Envois activés." : "Envois désactivés sur cet environnement : aucun SMS ne peut partir."} Fournisseur : {params.fournisseur}.
        {" "}Livraison confirmée par le fournisseur : {params.livraison_confirmee ? "oui" : "non (statut « livré » indisponible)"}.
      </p>
      <label className="text-sm font-semibold text-fh-bleu" htmlFor="lien-wa">Lien du groupe WhatsApp</label>
      <input id="lien-wa" type="url" placeholder="https://chat.whatsapp.com/…" value={lien} onChange={(e) => setLien(e.target.value)} className={`${CHAMP} w-full min-w-0`} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-fh-bleu" htmlFor="plafond">Plafond mensuel (FCFA)</label>
          <input id="plafond" inputMode="numeric" value={plafond} onChange={(e) => setPlafond(e.target.value)} className={`${CHAMP} w-full min-w-0`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-fh-bleu" htmlFor="tarif">Coût d&apos;un segment SMS (FCFA)</label>
          <input id="tarif" inputMode="decimal" value={tarif} onChange={(e) => setTarif(e.target.value)} className={`${CHAMP} w-full min-w-0`} />
        </div>
      </div>
      <p className="text-sm text-fh-ardoise">
        Dépensé ce mois : {formatFcfa(params.depense_mois_fcfa)} · Restant : {params.plafond_mensuel_fcfa ? formatFcfa(params.restant_fcfa) : "plafond non défini"}
      </p>
      <button type="submit" disabled={enCours} className="w-fit rounded-full bg-fh-orange px-5 py-2 text-sm font-semibold text-white hover:bg-fh-orange-fonce disabled:opacity-60">
        {enCours ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

function Detail({ campagne, onChange, onErreur }: { campagne: api.Campagne; onChange: () => void; onErreur: (m: string) => void }) {
  const [liste, setListe] = useState<api.Page<api.MessageHistorique> | null>(null);
  const [page, setPage] = useState(1);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    let actif = true;
    api.messages({ campagne: campagne.id, page }).then((r) => actif && setListe(r)).catch(() => actif && setListe(null));
    return () => {
      actif = false;
    };
  }, [campagne.id, campagne.messages.accepte, campagne.messages.echec, page]);

  async function agir(fn: () => Promise<unknown>) {
    if (enCours) return;
    setEnCours(true);
    try {
      await fn();
      onChange();
    } catch (err) {
      onErreur(err instanceof ApiError ? err.message : "Action impossible.");
    } finally {
      setEnCours(false);
    }
  }

  const m = campagne.messages;
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-fh-sable">
      <p className="rounded-xl bg-fh-accent px-3 py-2 text-sm text-fh-bleu"><strong>{etatCampagne(campagne).libelle}.</strong> {etatCampagne(campagne).aide}</p>
      <p className="whitespace-pre-wrap break-words text-sm text-fh-bleu">{campagne.texte}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div><dt className="text-fh-ardoise">Comptes concernés</dt><dd className="font-semibold text-fh-bleu">{campagne.nb_comptes}</dd></div>
        <div><dt className="text-fh-ardoise">Destinataires</dt><dd className="font-semibold text-fh-bleu">{campagne.nb_destinataires}</dd></div>
        <div><dt className="text-fh-ardoise">Segments</dt><dd className="font-semibold text-fh-bleu">{campagne.segments_total}</dd></div>
        <div><dt className="text-fh-ardoise">En attente d&apos;envoi</dt><dd className="font-semibold text-fh-bleu">{m.en_attente ?? 0}</dd></div>
        <div><dt className="text-fh-ardoise">En cours d&apos;envoi</dt><dd className="font-semibold text-fh-bleu">{m.en_cours ?? 0}</dd></div>
        <div><dt className="text-fh-ardoise">Acceptés</dt><dd className="font-semibold text-fh-bleu">{m.accepte ?? 0}</dd></div>
        <div><dt className="text-fh-ardoise">Échecs</dt><dd className="font-semibold text-fh-bleu">{m.echec ?? 0}</dd></div>
        <div><dt className="text-fh-ardoise">Incertains</dt><dd className="font-semibold text-fh-bleu">{m.incertain ?? 0}</dd></div>
        <div><dt className="text-fh-ardoise">Livrés</dt><dd className="font-semibold text-fh-bleu">non disponible</dd></div>
        <div><dt className="text-fh-ardoise">Coût estimé</dt><dd className="font-semibold text-fh-bleu">{formatFcfa(campagne.cout_estime)}</dd></div>
      </dl>
      {Object.entries(campagne.exclusions).some(([, v]) => v > 0) && (
        <p className="text-xs text-fh-ardoise">
          Exclus :{" "}
          {Object.entries(campagne.exclusions)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => `${LIBELLE_EXCLUSION[k] ?? k} ${v}`)
            .join(" · ")}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {campagne.statut === "en_cours" && (
          <button type="button" disabled={enCours} onClick={() => agir(() => api.arreter(campagne.id))} className="rounded-full border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
            Arrêter la campagne
          </button>
        )}
        {campagne.statut === "terminee" && (m.echec ?? 0) > 0 && (
          <button type="button" disabled={enCours} onClick={() => agir(() => api.relancerEchecs(campagne.id))} className="rounded-full border border-fh-orange px-4 py-2 text-sm font-semibold text-fh-orange hover:bg-fh-accent disabled:opacity-60">
            Relancer les échecs
          </button>
        )}
      </div>
      {liste && liste.results.length > 0 && (
        <ul className="flex flex-col divide-y divide-fh-sable text-sm">
          {liste.results.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="min-w-0 break-words text-fh-bleu">{x.nom ?? "Compte supprimé"} · {x.telephone}</span>
              <span className="text-xs font-semibold text-fh-ardoise">{LIBELLE_STATUT_MESSAGE[x.statut] ?? x.statut}</span>
            </li>
          ))}
        </ul>
      )}
      {liste && (liste.next || liste.previous) && (
        <div className="flex gap-2">
          <button type="button" disabled={!liste.previous} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm text-fh-bleu disabled:opacity-50">Précédent</button>
          <button type="button" disabled={!liste.next} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm text-fh-bleu disabled:opacity-50">Suivant</button>
        </div>
      )}
    </div>
  );
}

export default function CommunicationsPage() {
  const [params, setParams] = useState<api.Parametres | null>(null);
  const [data, setData] = useState<api.Page<api.Campagne> | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [ouverte, setOuverte] = useState<number | null>(null);
  const [rafraichir, setRafraichir] = useState(0);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  useEffect(() => {
    let actif = true;
    api.parametres().then((p) => actif && setParams(p)).catch(() => undefined);
    return () => {
      actif = false;
    };
  }, [rafraichir]);

  useEffect(() => {
    let actif = true;
    api
      .campagnes(page)
      .then((d) => actif && (setData(d), setErreur(null)))
      .catch((e) => actif && setErreur(e instanceof ApiError ? e.message : "Chargement impossible."));
    return () => {
      actif = false;
    };
  }, [page, rafraichir]);

  const fermerToast = useCallback(() => setToast(null), []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-fh-bleu">Communications</h2>
        <p className="text-sm text-fh-ardoise">Historique des SMS et des invitations. Rien ne part sans confirmation d&apos;un administrateur.</p>
      </div>

      {params && <Reglages params={params} onSauve={(p) => { setParams(p); setToast({ message: "Réglages enregistrés.", tone: "succes" }); }} onErreur={(m) => setToast({ message: m, tone: "erreur" })} />}

      <AccordsParentaux onMessage={(m, tone) => setToast({ message: m, tone })} />

      {params && params.file_attente && params.file_attente.en_attente > 0 && (
        <p role="status" data-testid="bandeau-file" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          {params.file_attente.en_attente} message(s) confirmé(s) attendent d&apos;être traités. Ils ne sont pas encore partis : ils partent quand le worker Communications est démarré.
          {!params.envois_actifs && " Les envois sont aujourd'hui désactivés."}
        </p>
      )}

      {erreur && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>}
      {!erreur && !data && <p role="status" className="text-sm text-fh-ardoise">Chargement…</p>}
      {data && data.results.length === 0 && (
        <p className="rounded-2xl bg-white py-10 text-center text-sm text-fh-ardoise ring-1 ring-fh-sable">Aucune communication.</p>
      )}

      {data && data.results.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.results.map((c) => (
            <li key={c.id} className="flex flex-col gap-2">
              <button
                type="button"
                aria-expanded={ouverte === c.id}
                onClick={() => setOuverte(ouverte === c.id ? null : c.id)}
                className="flex flex-col items-start gap-1 rounded-2xl bg-white p-4 text-left ring-1 ring-fh-sable hover:bg-fh-sable/30"
              >
                <span className="text-xs font-semibold text-fh-ardoise">
                  {dateHeure(c.confirmee_le ?? c.cree_le)} · {LIBELLE_TYPE[c.type]} · {etatCampagne(c).libelle}
                </span>
                <span className="break-words text-sm text-fh-bleu">
                  {c.nb_destinataires} destinataire(s) · {c.messages.en_attente ?? 0} en attente · {c.messages.en_cours ?? 0} en cours · {c.messages.accepte ?? 0} acceptés · {c.messages.incertain ?? 0} incertains · {c.messages.echec ?? 0} échecs · coût {formatFcfa(c.cout_estime)}
                </span>
                <span className="text-xs text-fh-ardoise">Par {c.auteur ?? "inconnu"}</span>
              </button>
              {ouverte === c.id && <Detail campagne={c} onChange={() => setRafraichir((n) => n + 1)} onErreur={(m) => setToast({ message: m, tone: "erreur" })} />}
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
      {toast && <Toast message={toast.message} tone={toast.tone} onClose={fermerToast} />}
    </div>
  );
}
