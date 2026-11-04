"use client";

import { useEffect, useState, type FormEvent } from "react";

import type { Role, Statut } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { creerCompte, modifierCompte, reinitialiserMotDePasseCompte, type Compte } from "@/lib/adminApi";
import { useGestionComptes } from "@/lib/useGestionComptes";
import CompteRow from "@/components/admin/CompteRow";
import RejeterModal from "@/components/admin/RejeterModal";
import ReinitialiserMdpModal from "@/components/admin/ReinitialiserMdpModal";
import EntityFormModal, { type ChampFormulaire } from "@/components/admin/EntityFormModal";
import Toast from "@/components/admin/Toast";
import ComposerModal from "@/components/admin/communications/ComposerModal";
import ActivationFlow from "@/components/admin/communications/ActivationFlow";
import { TEXTE_ACTIVATION, basculerId, basculerPage, nombreSelectionne, type StatutIndicateur, type TypeCommunication } from "@/lib/communications";
import { statutsActivation } from "@/lib/communicationsApi";
import { listerNiveaux, listerSeries, type Niveau, type Serie } from "@/lib/structureApi";

const OPTIONS_ROLE: readonly { value: Role | ""; label: string }[] = [
  { value: "", label: "Tous les rôles" },
  { value: "eleve", label: "Élèves" },
  { value: "enseignant", label: "Enseignants" },
  { value: "admin", label: "Admins" },
  { value: "partenaire", label: "Partenaires" },
  { value: "vendeur", label: "Vendeurs" },
];

const OPTIONS_STATUT: readonly { value: Statut | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "actif", label: "Actifs" },
  { value: "en_attente", label: "En attente" },
  { value: "suspendu", label: "Suspendus" },
  { value: "rejete", label: "Rejetés" },
];

// disposition="grille" (voir EntityFormModal) : Prénom|Nom, Téléphone|Email,
// Rôle en pleine largeur (évite une case vide à côté — le select prend toute
// la ligne plutôt que de laisser un trou), Mot de passe|Confirmation.
const CHAMPS_CREATION: readonly ChampFormulaire[] = [
  { nom: "prenom", label: "Prénom", type: "text", requis: true },
  { nom: "nom", label: "Nom", type: "text", requis: true },
  { nom: "telephone", label: "Téléphone", type: "text", requis: true },
  { nom: "email", label: "Email (optionnel)", type: "text" },
  {
    nom: "role",
    label: "Rôle",
    type: "select",
    requis: true,
    pleineLargeur: true,
    options: [
      { value: 1, label: "Enseignant" },
      { value: 2, label: "Admin" },
    ],
  },
  { nom: "password", label: "Mot de passe provisoire", type: "password", requis: true },
  { nom: "password2", label: "Confirmer le mot de passe", type: "password", requis: true },
];

const CHAMPS_MODIFICATION: readonly ChampFormulaire[] = [
  { nom: "prenom", label: "Prénom", type: "text", requis: true },
  { nom: "nom", label: "Nom", type: "text", requis: true },
  { nom: "email", label: "Email (optionnel)", type: "text" },
];

// Le select générique ne travaille qu'avec des valeurs numériques (voir
// CHAMPS_CREATION) ; on fait la correspondance ici plutôt que de complexifier
// EntityFormModal pour ce seul cas d'usage.
const ROLE_PAR_OPTION: Record<string, "enseignant" | "admin"> = {
  "1": "enseignant",
  "2": "admin",
};

export default function UtilisateursPage() {
  const [roleFiltre, setRoleFiltre] = useState<Role | "">("");
  const [statutFiltre, setStatutFiltre] = useState<Statut | "">("");
  const [rechercheSaisie, setRechercheSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [niveauFiltre, setNiveauFiltre] = useState(0);
  const [serieFiltre, setSerieFiltre] = useState(0);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);

  // Sélection pour les envois : identifiants réels des comptes, ou « tous les résultats filtrés ».
  const [idsSelection, setIdsSelection] = useState<number[]>([]);
  const [tousLesFiltres, setTousLesFiltres] = useState(false);
  const [compteSms, setCompteSms] = useState<Compte | null>(null);
  const [compteActivation, setCompteActivation] = useState<Compte | null>(null);
  const [envoiGroupe, setEnvoiGroupe] = useState<TypeCommunication | null>(null);
  const [indicateurs, setIndicateurs] = useState<Record<string, StatutIndicateur>>({});
  const [rafraichir, setRafraichir] = useState(0);

  const [modaleCreation, setModaleCreation] = useState(false);
  const [compteAModifier, setCompteAModifier] = useState<Compte | null>(null);
  const [compteAReinitialiser, setCompteAReinitialiser] = useState<Compte | null>(null);
  const { user: moi } = useAuth();

  const {
    data,
    chargement,
    erreur,
    idEnCours,
    compteARejeter,
    demanderRejet,
    annulerRejet,
    toast,
    setToast,
    fermerToast,
    recharger,
    compteApprouve,
    fermerApprobation,
    approuver,
    confirmerRejet,
    suspendre,
    reactiver,
  } = useGestionComptes(
    {
      role: roleFiltre || undefined,
      statut: statutFiltre || undefined,
      search: recherche || undefined,
      niveau: niveauFiltre || undefined,
      serie: serieFiltre || undefined,
    },
    page
  );

  // Changer de filtre ou de recherche change l'ensemble des résultats : la sélection est donc vidée.
  function reinitialiserPage() {
    setPage(1);
    setIdsSelection([]);
    setTousLesFiltres(false);
  }

  useEffect(() => {
    let actif = true;
    listerNiveaux().then((r) => actif && setNiveaux(r.results)).catch(() => undefined);
    listerSeries().then((r) => actif && setSeries(r.results)).catch(() => undefined);
    return () => {
      actif = false;
    };
  }, []);

  // Indicateur « SMS d'activation » des comptes actifs affichés (lecture seule).
  const idsActifsAffiches = (data?.results ?? []).filter((c) => c.statut === "actif").map((c) => c.id);
  const cleActifs = idsActifsAffiches.join(",");
  useEffect(() => {
    if (!cleActifs) return;
    let actif = true;
    statutsActivation(cleActifs.split(",").map(Number))
      .then((r) => actif && setIndicateurs((cur) => ({ ...cur, ...r })))
      .catch(() => undefined);
    return () => {
      actif = false;
    };
  }, [cleActifs, rafraichir]);

  const idsPage = (data?.results ?? []).map((c) => c.id);
  const nbSelectionnes = nombreSelectionne({ ids: idsSelection, tousLesFiltres }, data?.count ?? 0);
  const pageEntiere = idsPage.length > 0 && idsPage.every((id) => idsSelection.includes(id));
  const filtresActuels = {
    role: roleFiltre || undefined,
    statut: statutFiltre || undefined,
    search: recherche || undefined,
    niveau: niveauFiltre || undefined,
    serie: serieFiltre || undefined,
  };

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reinitialiserPage();
    setRecherche(rechercheSaisie.trim());
  }

  async function handleCreerCompte(valeurs: Record<string, string>) {
    if (valeurs.password !== valeurs.password2) {
      throw new Error("Les mots de passe ne correspondent pas.");
    }
    const role = ROLE_PAR_OPTION[valeurs.role];
    await creerCompte({
      prenom: valeurs.prenom,
      nom: valeurs.nom,
      telephone: valeurs.telephone,
      email: valeurs.email || undefined,
      role,
      password: valeurs.password,
    });
    setModaleCreation(false);
    setToast({ message: "Compte créé.", tone: "succes" });
    recharger();
  }

  async function handleModifierCompte(valeurs: Record<string, string>) {
    if (!compteAModifier) return;
    await modifierCompte(compteAModifier.id, {
      prenom: valeurs.prenom,
      nom: valeurs.nom,
      email: valeurs.email || undefined,
    });
    setCompteAModifier(null);
    setToast({ message: "Compte modifié.", tone: "succes" });
    recharger();
  }

  async function handleReinitialiserMdp() {
    if (!compteAReinitialiser) return;
    const resultat = await reinitialiserMotDePasseCompte(compteAReinitialiser.id);
    setCompteAReinitialiser(null);
    setToast(
      resultat.sms_envoye
        ? { message: "Mot de passe réinitialisé : le SMS a été envoyé.", tone: "succes" }
        : {
            message: "Mot de passe réinitialisé, mais le SMS n'a PAS pu être envoyé. Relance la réinitialisation.",
            tone: "erreur",
          }
    );
    recharger();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-fh-bleu">Utilisateurs</h2>
          <p className="text-sm text-fh-ardoise">
            Tous les comptes de la plateforme, tous rôles et statuts confondus.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModaleCreation(true)}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          + Créer un compte
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={roleFiltre}
          onChange={(event) => {
            setRoleFiltre(event.target.value as Role | "");
            reinitialiserPage();
          }}
          className="rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        >
          {OPTIONS_ROLE.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={statutFiltre}
          onChange={(event) => {
            setStatutFiltre(event.target.value as Statut | "");
            reinitialiserPage();
          }}
          className="rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        >
          {OPTIONS_STATUT.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Classe"
          value={niveauFiltre}
          onChange={(event) => {
            setNiveauFiltre(Number(event.target.value));
            setSerieFiltre(0);
            reinitialiserPage();
          }}
          className="min-w-0 max-w-full rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        >
          <option value={0}>Toutes les classes</option>
          {niveaux.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nom}
            </option>
          ))}
        </select>

        <select
          aria-label="Série"
          value={serieFiltre}
          onChange={(event) => {
            setSerieFiltre(Number(event.target.value));
            reinitialiserPage();
          }}
          className="min-w-0 max-w-full rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
        >
          <option value={0}>Toutes les séries</option>
          {series
            .filter((s) => !niveauFiltre || s.niveau.id === niveauFiltre)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.niveau.nom} {s.nom}
              </option>
            ))}
        </select>

        <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-[220px] gap-2">
          <input
            type="search"
            placeholder="Rechercher (nom, prénom, téléphone)"
            value={rechercheSaisie}
            onChange={(event) => setRechercheSaisie(event.target.value)}
            className="w-full min-w-[180px] rounded-lg border border-fh-bleu-vif/20 bg-white px-4 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
          >
            Rechercher
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-fh-sable" aria-label="Actions de communication">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-fh-bleu">
            <input
              type="checkbox"
              checked={pageEntiere}
              disabled={idsPage.length === 0}
              onChange={() => {
                setTousLesFiltres(false);
                setIdsSelection((cur) => basculerPage(cur, idsPage));
              }}
              className="h-5 w-5 accent-fh-orange"
            />
            Sélectionner cette page
          </label>
          <span className="text-sm font-semibold text-fh-bleu" aria-live="polite">
            {nbSelectionnes} destinataire(s) sélectionné(s)
          </span>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => setEnvoiGroupe("sms")}
              className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
            >
              Envoyer SMS
            </button>
            <button
              type="button"
              onClick={() => setEnvoiGroupe("invitation_whatsapp")}
              className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              Inviter WhatsApp
            </button>
          </div>
        </div>
        {data && pageEntiere && !tousLesFiltres && data.count > idsPage.length && (
          <p className="rounded-lg bg-fh-accent px-3 py-2 text-sm text-fh-bleu">
            Les {idsPage.length} comptes de cette page sont sélectionnés.{" "}
            <button type="button" onClick={() => setTousLesFiltres(true)} className="font-semibold underline">
              Sélectionner les {data.count} comptes correspondant aux filtres
            </button>
          </p>
        )}
        {data && tousLesFiltres && (
          <p className="rounded-lg bg-fh-accent px-3 py-2 text-sm text-fh-bleu">
            Les {data.count} comptes correspondant aux filtres sont sélectionnés, sur toutes les pages.{" "}
            <button
              type="button"
              onClick={() => {
                setTousLesFiltres(false);
                setIdsSelection([]);
              }}
              className="font-semibold underline"
            >
              Tout désélectionner
            </button>
          </p>
        )}
      </div>

      {chargement ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des comptes">
          {[0, 1, 2].map((cle) => (
            <div key={cle} className="h-20 animate-pulse rounded-2xl bg-fh-sable/50" />
          ))}
        </div>
      ) : erreur ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>
      ) : !data || data.results.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            📭
          </span>
          <p className="text-sm text-fh-ardoise">Aucun compte ne correspond à ces filtres.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.results.map((compte) => (
            <CompteRow
              key={compte.id}
              compte={compte}
              enCours={idEnCours === compte.id}
              onApprouver={approuver}
              onDemanderRejet={demanderRejet}
              onSuspendre={suspendre}
              onReactiver={reactiver}
              onModifier={setCompteAModifier}
              onReinitialiserMdp={compte.telephone === moi?.telephone ? undefined : setCompteAReinitialiser}
              coche={tousLesFiltres || idsSelection.includes(compte.id)}
              onBasculerSelection={(id) => {
                if (tousLesFiltres) {
                  // Décocher un compte quitte le mode « tous les filtrés » : on garde la page affichée, moins ce compte.
                  setTousLesFiltres(false);
                  setIdsSelection(idsPage.filter((x) => x !== id));
                } else {
                  setIdsSelection((cur) => basculerId(cur, id));
                }
              }}
              onEnvoyerSms={setCompteSms}
              indicateurSms={indicateurs[String(compte.id)] ?? "non_envoye"}
              onNotifierActivation={setCompteActivation}
            />
          ))}
        </div>
      )}

      {data && (data.next || data.previous) && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={!data.previous}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu disabled:cursor-not-allowed disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-sm text-fh-ardoise">{data.count} compte(s)</span>
          <button
            type="button"
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

      {compteARejeter && (
        <RejeterModal
          compte={compteARejeter}
          enCours={idEnCours === compteARejeter.id}
          onConfirm={confirmerRejet}
          onClose={annulerRejet}
        />
      )}

      {compteAReinitialiser && (
        <ReinitialiserMdpModal
          compte={compteAReinitialiser}
          onConfirm={handleReinitialiserMdp}
          onClose={() => setCompteAReinitialiser(null)}
        />
      )}

      {modaleCreation && (
        <EntityFormModal
          titre="Créer un compte"
          description="Le compte sera actif immédiatement. L'utilisateur devra changer ce mot de passe provisoire."
          disposition="grille"
          taille="lg"
          champs={CHAMPS_CREATION}
          valeursInitiales={{ prenom: "", nom: "", telephone: "", email: "", role: "", password: "", password2: "" }}
          onSubmit={handleCreerCompte}
          onClose={() => setModaleCreation(false)}
          libelleSoumettre="Créer"
        />
      )}

      {compteAModifier && (
        <EntityFormModal
          titre={`Modifier « ${compteAModifier.prenom} ${compteAModifier.nom} »`}
          champs={CHAMPS_MODIFICATION}
          valeursInitiales={{
            prenom: compteAModifier.prenom,
            nom: compteAModifier.nom,
            email: compteAModifier.email ?? "",
          }}
          onSubmit={handleModifierCompte}
          onClose={() => setCompteAModifier(null)}
        />
      )}

      {compteApprouve && (
        <ActivationFlow compte={compteApprouve} onClose={fermerApprobation} onTermine={() => setRafraichir((n) => n + 1)} />
      )}

      {compteActivation && (
        <ComposerModal
          type="activation"
          destinataire={compteActivation}
          texteInitial={TEXTE_ACTIVATION}
          onClose={() => setCompteActivation(null)}
          onTermine={() => setRafraichir((n) => n + 1)}
        />
      )}

      {compteSms && <ComposerModal type="sms" destinataire={compteSms} onClose={() => setCompteSms(null)} />}

      {envoiGroupe && (
        <ComposerModal
          type={envoiGroupe}
          cibles={{ ids: idsSelection, filtres: filtresActuels, totalFiltres: data?.count ?? 0 }}
          modeInitial={tousLesFiltres ? "filtres" : idsSelection.length > 0 ? "ids" : "filtres"}
          onClose={() => setEnvoiGroupe(null)}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={fermerToast} />}
    </div>
  );
}
