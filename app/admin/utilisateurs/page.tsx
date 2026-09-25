"use client";

import { useState, type FormEvent } from "react";

import type { Role, Statut } from "@/lib/api";
import { creerCompte, modifierCompte, type Compte } from "@/lib/adminApi";
import { useGestionComptes } from "@/lib/useGestionComptes";
import CompteRow from "@/components/admin/CompteRow";
import RejeterModal from "@/components/admin/RejeterModal";
import EntityFormModal, { type ChampFormulaire } from "@/components/admin/EntityFormModal";
import Toast from "@/components/admin/Toast";

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

  const [modaleCreation, setModaleCreation] = useState(false);
  const [compteAModifier, setCompteAModifier] = useState<Compte | null>(null);

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
    approuver,
    confirmerRejet,
    suspendre,
    reactiver,
  } = useGestionComptes(
    {
      role: roleFiltre || undefined,
      statut: statutFiltre || undefined,
      search: recherche || undefined,
    },
    page
  );

  function reinitialiserPage() {
    setPage(1);
  }

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

      {modaleCreation && (
        <EntityFormModal
          titre="Créer un compte"
          description="Le compte sera actif immédiatement. L'utilisateur devra changer ce mot de passe provisoire."
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

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={fermerToast} />}
    </div>
  );
}
