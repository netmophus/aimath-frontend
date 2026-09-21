"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, type Role, type Statut } from "./api";
import {
  approuverCompte,
  listerComptes,
  reactiverCompte,
  rejeterCompte,
  suspendreCompte,
  type Compte,
  type ComptePagine,
} from "./adminApi";

export interface FiltresComptes {
  statut?: Statut;
  role?: Role;
  search?: string;
}

interface ToastEtat {
  message: string;
  tone: "succes" | "erreur";
}

/**
 * Logique partagée entre /admin/validations et /admin/utilisateurs :
 * chargement paginé et filtré de la liste des comptes, plus les actions de
 * cycle de vie (approuver/rejeter/suspendre/réactiver) avec retour visuel
 * (toast) et rafraîchissement automatique. Chaque page ne garde que sa
 * propre UI de filtres et ses modales de création/modification.
 */
export function useGestionComptes(filtres: FiltresComptes, page: number) {
  const [data, setData] = useState<ComptePagine | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [refreshCle, setRefreshCle] = useState(0);

  const [idEnCours, setIdEnCours] = useState<number | null>(null);
  const [compteARejeter, setCompteARejeter] = useState<Compte | null>(null);
  const [toast, setToast] = useState<ToastEtat | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const reponse = await listerComptes({ ...filtres, page });
        if (actif) setData(reponse);
      } catch (error) {
        if (actif) {
          setErreur(
            error instanceof ApiError ? error.message : "Impossible de charger les comptes."
          );
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
    // Dépendances volontairement sur les champs primitifs de `filtres` (un
    // nouvel objet littéral à chaque rendu ne doit pas redéclencher l'effet).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtres.statut, filtres.role, filtres.search, page, refreshCle]);

  const recharger = useCallback(() => setRefreshCle((cle) => cle + 1), []);

  async function approuver(id: number) {
    setIdEnCours(id);
    try {
      await approuverCompte(id);
      setToast({ message: "Compte approuvé.", tone: "succes" });
      recharger();
    } catch (error) {
      setToast({
        message: error instanceof ApiError ? error.message : "Impossible d'approuver ce compte.",
        tone: "erreur",
      });
    } finally {
      setIdEnCours(null);
    }
  }

  async function confirmerRejet(motif: string) {
    if (!compteARejeter) return;
    const id = compteARejeter.id;
    setIdEnCours(id);
    try {
      await rejeterCompte(id, motif.trim() || undefined);
      setToast({ message: "Compte rejeté.", tone: "succes" });
      setCompteARejeter(null);
      recharger();
    } catch (error) {
      setToast({
        message: error instanceof ApiError ? error.message : "Impossible de rejeter ce compte.",
        tone: "erreur",
      });
    } finally {
      setIdEnCours(null);
    }
  }

  async function suspendre(id: number) {
    if (!window.confirm("Suspendre ce compte ?")) return;
    setIdEnCours(id);
    try {
      await suspendreCompte(id);
      setToast({ message: "Compte suspendu.", tone: "succes" });
      recharger();
    } catch (error) {
      setToast({
        message: error instanceof ApiError ? error.message : "Impossible de suspendre ce compte.",
        tone: "erreur",
      });
    } finally {
      setIdEnCours(null);
    }
  }

  async function reactiver(id: number) {
    if (!window.confirm("Réactiver ce compte ?")) return;
    setIdEnCours(id);
    try {
      await reactiverCompte(id);
      setToast({ message: "Compte réactivé.", tone: "succes" });
      recharger();
    } catch (error) {
      setToast({
        message: error instanceof ApiError ? error.message : "Impossible de réactiver ce compte.",
        tone: "erreur",
      });
    } finally {
      setIdEnCours(null);
    }
  }

  return {
    data,
    chargement,
    erreur,
    idEnCours,
    compteARejeter,
    demanderRejet: setCompteARejeter,
    annulerRejet: () => setCompteARejeter(null),
    toast,
    setToast,
    fermerToast: () => setToast(null),
    recharger,
    approuver,
    confirmerRejet,
    suspendre,
    reactiver,
  };
}
