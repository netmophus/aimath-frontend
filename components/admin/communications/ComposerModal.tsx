"use client";

import { useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api";
import {
  LIBELLE_EXCLUSION,
  TEXTE_MAX,
  compter,
  coutEstime,
  erreurTexte,
  etatCampagne,
  formatFcfa,
  nouvelleCleCommunication,
  type ModeCible,
  type TypeCommunication,
} from "@/lib/communications";
import * as api from "@/lib/communicationsApi";
import type { Compte } from "@/lib/adminApi";
import Modal from "@/components/admin/Modal";

export interface CiblesDisponibles {
  /** Comptes cochés (identifiants réels). */
  ids: number[];
  /** Filtres actifs de la liste. */
  filtres: api.Filtres;
  /** Nombre de comptes correspondant aux filtres (compteur de la liste). */
  totalFiltres: number;
}

interface Props {
  type: TypeCommunication;
  /** Un seul destinataire : fenêtre « SMS individuel » (nom, numéro, pas de choix de cible). */
  destinataire?: Compte;
  cibles?: CiblesDisponibles;
  modeInitial?: ModeCible;
  texteInitial?: string;
  onClose: () => void;
  onTermine?: () => void;
}

const TERMINAUX = ["terminee", "arretee"];

function Ligne({ libelle, valeur, fort }: { libelle: string; valeur: string | number; fort?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="text-fh-ardoise">{libelle}</dt>
      <dd className={fort ? "font-bold text-fh-bleu" : "font-medium text-fh-bleu"}>{valeur}</dd>
    </div>
  );
}

export default function ComposerModal({ type, destinataire, cibles, modeInitial, texteInitial = "", onClose, onTermine }: Props) {
  const [texte, setTexte] = useState(texteInitial);
  const [mode, setMode] = useState<ModeCible>(destinataire ? "ids" : (modeInitial ?? "ids"));
  const [etape, setEtape] = useState<"saisie" | "apercu" | "suivi">("saisie");
  const [params, setParams] = useState<api.Parametres | null>(null);
  const [modeles, setModeles] = useState<api.Modele[]>([]);
  const [campagne, setCampagne] = useState<api.Campagne | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [attestation, setAttestation] = useState(false);
  const verrou = useRef(false);

  const idsCibles = destinataire ? [destinataire.id] : (cibles?.ids ?? []);
  const invitation = type === "invitation_whatsapp";

  useEffect(() => {
    let actif = true;
    api.parametres().then((p) => actif && setParams(p)).catch(() => undefined);
    api
      .modeles()
      .then((m) => {
        if (!actif) return;
        setModeles(m.filter((x) => x.type === type));
        // Invitation : le texte vient du modèle serveur (il contient {lien}, remplacé côté serveur).
        const modele = m.find((x) => x.type === "invitation_whatsapp");
        if (type === "invitation_whatsapp" && modele) setTexte((cur) => cur || modele.texte);
      })
      .catch(() => undefined);
    return () => {
      actif = false;
    };
  }, [type]);

  // Suivi de la campagne tant qu'elle n'est pas terminée.
  useEffect(() => {
    if (etape !== "suivi" || !campagne || TERMINAUX.includes(campagne.statut)) return;
    const id = campagne.id;
    const t = setInterval(() => {
      api.campagne(id).then(setCampagne).catch(() => undefined);
    }, 3000);
    return () => clearInterval(t);
  }, [etape, campagne]);

  const tarif = params?.cout_segment_fcfa != null ? Number(params.cout_segment_fcfa) : null;
  const compte = compter(texte);
  const coutIndividuel = coutEstime(compte.segments, tarif);
  const aucuneCible = mode === "ids" && idsCibles.length === 0;

  function messageErreur(e: unknown, defaut: string) {
    return e instanceof ApiError ? e.message : defaut;
  }

  async function preparer() {
    const e = erreurTexte(texte, type);
    if (e) return setErreur(e);
    if (aucuneCible) return setErreur("Aucun destinataire sélectionné.");
    if (verrou.current) return;
    verrou.current = true;
    setEnCours(true);
    setErreur(null);
    try {
      const c = await api.apercu({
        cle: nouvelleCleCommunication(),
        type,
        texte: texte.trim(),
        mode,
        ids: mode === "ids" ? idsCibles : [],
        filtres: mode === "filtres" ? (cibles?.filtres ?? {}) : {},
      });
      setCampagne(c);
      setAttestation(false);
      setEtape("apercu");
    } catch (err) {
      setErreur(messageErreur(err, "Impossible de préparer l'aperçu."));
    } finally {
      verrou.current = false;
      setEnCours(false);
    }
  }

  async function confirmer() {
    if (!campagne || verrou.current) return;
    verrou.current = true;
    setEnCours(true);
    setErreur(null);
    try {
      setCampagne(await api.confirmer(campagne.id, attestation));
      setEtape("suivi");
      onTermine?.();
    } catch (err) {
      setErreur(messageErreur(err, "Envoi impossible."));
    } finally {
      verrou.current = false;
      setEnCours(false);
    }
  }

  async function arreter() {
    if (!campagne) return;
    setEnCours(true);
    try {
      setCampagne(await api.arreter(campagne.id));
    } catch (err) {
      setErreur(messageErreur(err, "Arrêt impossible."));
    } finally {
      setEnCours(false);
    }
  }

  const titre = invitation ? "Inviter sur WhatsApp" : type === "activation" ? "SMS d'activation" : "Envoyer un SMS";

  // ----- Étape suivi
  if (etape === "suivi" && campagne) {
    const m = campagne.messages;
    const fini = TERMINAUX.includes(campagne.statut);
    return (
      <Modal titre={titre} onClose={onClose} taille="lg">
        <div className="flex flex-col gap-4">
          <p role="status" className="rounded-xl bg-fh-accent px-4 py-3 text-sm font-medium text-fh-bleu">
            <strong>{etatCampagne(campagne).libelle}.</strong> {etatCampagne(campagne).aide}{!fini && " Tu peux fermer cette fenêtre."}
          </p>
          <dl className="flex flex-col gap-2 rounded-xl bg-fh-sable/40 p-4">
            <Ligne libelle="Destinataires" valeur={campagne.nb_destinataires} />
            <Ligne libelle="En attente d'envoi" valeur={m.en_attente ?? 0} />
            <Ligne libelle="En cours d'envoi" valeur={m.en_cours ?? 0} />
            <Ligne libelle="Acceptés par le fournisseur" valeur={m.accepte ?? 0} />
            <Ligne libelle="Échecs" valeur={m.echec ?? 0} />
            <Ligne libelle="Résultat incertain" valeur={m.incertain ?? 0} />
            <Ligne libelle="Ignorés ou annulés" valeur={(m.ignore ?? 0) + (m.annule ?? 0)} />
          </dl>
          <p className="text-xs text-fh-ardoise">
            « Accepté » signifie que le fournisseur a pris le message en charge. La livraison au téléphone n&apos;est pas confirmée.
          </p>
          {erreur && <p role="alert" className="text-sm text-red-700">{erreur}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            {campagne.statut === "en_cours" && (
              <button type="button" disabled={enCours} onClick={arreter} className="rounded-full border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
                Arrêter l&apos;envoi
              </button>
            )}
            <button type="button" onClick={onClose} className="rounded-full bg-fh-bleu px-5 py-2 text-sm font-semibold text-white hover:opacity-90">
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // ----- Étape aperçu / confirmation
  if (etape === "apercu" && campagne) {
    const ex = campagne.exclusions;
    const nonEligibles = (ex.statut_non_actif ?? 0) + (ex.numero_invalide ?? 0) + (ex.opposition ?? 0) + (ex.consentement_requis ?? 0) + (ex.consentement_parental_requis ?? 0);
    const valides = campagne.nb_comptes - (ex.statut_non_actif ?? 0) - (ex.numero_invalide ?? 0);
    const b = campagne.budget;
    const desactive = campagne.envois_actifs === false;
    const bloque = desactive || campagne.nb_destinataires === 0 || (invitation && !attestation);
    return (
      <Modal titre="Confirmer l'envoi" onClose={onClose} taille="lg">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-fh-ardoise">Aucun message n&apos;est envoyé tant que tu n&apos;as pas confirmé.</p>
          <dl className="flex flex-col gap-2 rounded-xl bg-fh-sable/40 p-4">
            <Ligne libelle="Comptes concernés" valeur={campagne.nb_comptes} />
            <Ligne libelle="Numéros valides" valeur={valides} />
            <Ligne libelle="Doublons exclus" valeur={ex.doublon ?? 0} />
            <Ligne libelle="Non éligibles" valeur={nonEligibles} />
            {Object.entries(ex)
              .filter(([k, v]) => v > 0 && k !== "doublon")
              .map(([k, v]) => (
                <p key={k} className="pl-3 text-xs text-fh-ardoise">
                  {LIBELLE_EXCLUSION[k] ?? k} : {v}
                </p>
              ))}
            <Ligne libelle="Destinataires" valeur={campagne.nb_destinataires} fort />
            <Ligne libelle="Segments SMS au total" valeur={campagne.segments_total} />
            <Ligne libelle="Coût estimé" valeur={formatFcfa(campagne.cout_estime)} fort />
            {b && <Ligne libelle="Budget restant ce mois" valeur={b.plafond_mensuel_fcfa ? formatFcfa(b.restant_fcfa) : "plafond non défini"} />}
          </dl>
          <div>
            <p className="mb-1 text-sm font-semibold text-fh-bleu">Texte exact{campagne.texte.includes("{prenom}") ? " (exemple pour le premier destinataire)" : ""}</p>
            <p className="whitespace-pre-wrap break-words rounded-xl bg-white p-3 text-sm text-fh-bleu ring-1 ring-fh-sable">{campagne.texte_exemple ?? campagne.texte}</p>
          </div>
          {invitation && (
            <label className="flex items-start gap-2 rounded-xl bg-fh-accent p-3 text-sm text-fh-bleu">
              <input type="checkbox" checked={attestation} onChange={(e) => setAttestation(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
              <span>
                Je confirme que ces personnes (ou leurs parents pour les mineurs) ont accepté de recevoir cette invitation. Rejoindre le groupe peut rendre le numéro visible des autres membres.
              </span>
            </label>
          )}
          {desactive && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Les envois de SMS sont désactivés sur cet environnement. Rien ne peut partir.
            </p>
          )}
          {campagne.nb_destinataires === 0 && <p role="alert" className="text-sm text-red-700">Aucun destinataire éligible.</p>}
          {erreur && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => { setEtape("saisie"); setErreur(null); }} className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu hover:bg-fh-sable/60">
              Modifier
            </button>
            <button type="button" disabled={enCours || bloque} onClick={confirmer} className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
              {enCours ? "Envoi…" : "Confirmer et envoyer"}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // ----- Étape saisie
  const options: { mode: ModeCible; libelle: string; desactive?: boolean }[] = cibles
    ? [
        { mode: "ids", libelle: `Comptes sélectionnés (${cibles.ids.length})`, desactive: cibles.ids.length === 0 },
        { mode: "filtres", libelle: `Tous les résultats filtrés (${cibles.totalFiltres})` },
        { mode: "tous", libelle: "Tous les utilisateurs éligibles" },
      ]
    : [];

  return (
    <Modal titre={titre} onClose={onClose} taille="lg">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void preparer();
        }}
      >
        {destinataire ? (
          <div className="rounded-xl bg-fh-sable/40 p-3 text-sm">
            <p className="font-semibold text-fh-bleu">
              {destinataire.prenom} {destinataire.nom}
            </p>
            <p className="text-fh-ardoise">{destinataire.telephone}</p>
          </div>
        ) : (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-fh-bleu">Destinataires</legend>
            {options.map((o) => (
              <label key={o.mode} className={`flex items-center gap-2 text-sm ${o.desactive ? "text-fh-ardoise/50" : "text-fh-bleu"}`}>
                <input type="radio" name="cible" checked={mode === o.mode} disabled={o.desactive} onChange={() => setMode(o.mode)} />
                {o.libelle}
              </label>
            ))}
            <p className="text-xs text-fh-ardoise">Les destinataires sont calculés par le serveur. Les comptes non éligibles sont exclus à l&apos;étape suivante.</p>
          </fieldset>
        )}

        {!invitation && type !== "activation" && modeles.length > 0 && (
          <div className="flex flex-col gap-1">
            <label htmlFor="modele" className="text-sm font-semibold text-fh-bleu">Modèle</label>
            <select
              id="modele"
              defaultValue=""
              onChange={(e) => {
                const m = modeles.find((x) => x.code === e.target.value);
                if (m) setTexte(m.texte);
              }}
              className="rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            >
              <option value="">Message libre</option>
              {modeles.map((m) => <option key={m.code} value={m.code}>{m.libelle}</option>)}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="texte-sms" className="text-sm font-semibold text-fh-bleu">Message</label>
          <textarea
            id="texte-sms"
            rows={5}
            maxLength={TEXTE_MAX}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            className="rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
          />
          <p className="text-xs text-fh-ardoise" aria-live="polite">
            {compte.caracteres} caractère(s) · {compte.segments} segment(s) SMS
            {compte.unicode ? " · accents spéciaux (ê, ô, î…) : segments plus courts, coût plus élevé" : ""}
            {destinataire ? ` · coût estimé : ${formatFcfa(coutIndividuel)}` : ""}
          </p>
          <p className="text-xs text-fh-ardoise">Variables possibles : {"{prenom}"}{invitation ? " et {lien}" : ""}. Ne jamais écrire de mot de passe.</p>
        </div>

        {erreur && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu hover:bg-fh-sable/60">
            Annuler
          </button>
          <button type="submit" disabled={enCours || aucuneCible} className="rounded-full bg-fh-orange px-5 py-2 text-sm font-semibold text-white hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60">
            {enCours ? "Préparation…" : "Envoyer SMS"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
