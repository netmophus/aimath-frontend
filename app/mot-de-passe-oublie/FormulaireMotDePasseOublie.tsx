"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { IconCircleCheck } from "@tabler/icons-react";

import ChampCodeOtp from "@/components/auth/ChampCodeOtp";
import ChampMotDePasse from "@/components/auth/ChampMotDePasse";
import ChampTelephone from "@/components/auth/ChampTelephone";
import { demanderCodeMotDePasse, reinitialiserMotDePasse, verifierCodeMotDePasse } from "@/lib/api";
import {
  attenteDemandee,
  codeComplet,
  formaterDelai,
  messageErreurRecuperation,
  validerNouveauMotDePasse,
} from "@/lib/motDePasse";
import { chiffresNationaux, construireTelephone, TELEPHONE_RE } from "@/lib/telephone";

const LABEL = "mb-1.5 block text-sm font-semibold text-[#102A66]";
const BOUTON =
  "min-h-[52px] w-full rounded-xl bg-gradient-to-r from-[#FB6A2B] to-[#F4511E] px-6 py-3 text-base font-bold text-white shadow-[0_8px_20px_rgba(244,81,30,0.3)] transition-opacity hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60";
const LIEN = "font-bold text-[#F4511E] underline-offset-2 hover:underline";

type Etape = "telephone" | "code" | "mot_de_passe" | "termine";

function Erreur({ id, texte }: { id: string; texte: string | null }) {
  if (!texte) return null;
  return (
    <p id={id} role="alert" className="rounded-xl bg-[#FFF1EC] px-4 py-3 text-sm font-medium text-[#B03A10]">
      {texte}
    </p>
  );
}

/**
 * Mot de passe oublié : téléphone → code SMS à 6 chiffres → nouveau mot de passe.
 * L'autorisation renvoyée après la vérification du code reste UNIQUEMENT en mémoire du composant (ni URL, ni
 * localStorage, ni journal). Aucune connexion automatique à la fin.
 */
export default function FormulaireMotDePasseOublie() {
  const [etape, setEtape] = useState<Etape>("telephone");
  const [saisieTelephone, setSaisieTelephone] = useState("");
  const [code, setCode] = useState("");
  const [autorisation, setAutorisation] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [attente, setAttente] = useState(0);
  const verrou = useRef(false); // double clic : une seule requête à la fois
  const titre = useRef<HTMLHeadingElement>(null);

  const telephone = construireTelephone(saisieTelephone);

  useEffect(() => {
    if (attente <= 0) return;
    const minuteur = setInterval(() => setAttente((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(minuteur);
  }, [attente]);

  useEffect(() => {
    titre.current?.focus();
  }, [etape]);

  async function executer(action: () => Promise<void>) {
    if (verrou.current) return;
    verrou.current = true;
    setEnCours(true);
    setErreur(null);
    try {
      await action();
    } catch (e) {
      const secondes = attenteDemandee(e);
      if (secondes) setAttente(secondes);
      setErreur(messageErreurRecuperation(e));
    } finally {
      verrou.current = false;
      setEnCours(false);
    }
  }

  function demander(e?: FormEvent) {
    e?.preventDefault();
    if (!TELEPHONE_RE.test(telephone) || chiffresNationaux(saisieTelephone).length !== 8) {
      setErreur("Saisis les 8 chiffres de ton numéro de téléphone.");
      return;
    }
    void executer(async () => {
      const r = await demanderCodeMotDePasse(telephone);
      setInfo(r.message);
      setAttente(r.delai_renvoi_secondes);
      setCode("");
      setEtape("code");
    });
  }

  function renvoyer() {
    if (attente > 0) return;
    void executer(async () => {
      const r = await demanderCodeMotDePasse(telephone);
      setInfo(r.message);
      setAttente(r.delai_renvoi_secondes);
      setCode("");
    });
  }

  function verifier(e: FormEvent) {
    e.preventDefault();
    if (!codeComplet(code)) {
      setErreur("Saisis les 6 chiffres du code.");
      return;
    }
    void executer(async () => {
      const r = await verifierCodeMotDePasse(telephone, code);
      setAutorisation(r.autorisation);
      setCode("");
      setEtape("mot_de_passe");
    });
  }

  function reinitialiser(e: FormEvent) {
    e.preventDefault();
    const probleme = validerNouveauMotDePasse(nouveau, confirmation);
    if (probleme) {
      setErreur(probleme);
      return;
    }
    void executer(async () => {
      await reinitialiserMotDePasse({ telephone, autorisation, nouveauMotDePasse: nouveau, confirmation });
      setAutorisation("");
      setNouveau("");
      setConfirmation("");
      setEtape("termine");
    });
  }

  const enteteTitre = (texte: string) => (
    <>
      <h1 ref={titre} tabIndex={-1} className="text-3xl font-bold text-[#102A66] outline-none">
        {texte}
      </h1>
      <span aria-hidden="true" className="mt-3 mb-6 block h-1 w-12 rounded-full bg-[#F4511E]" />
    </>
  );

  return (
    <div className="mx-auto w-full max-w-md">
      {etape === "telephone" && (
        <>
          {enteteTitre("Mot de passe oublié")}
          <p className="mb-6 text-sm text-[#475A7A]">Saisis ton numéro. Nous t&apos;envoyons un code par SMS.</p>
          <form noValidate onSubmit={demander} className="flex flex-col gap-5">
            <div>
              <label htmlFor="telephone" className={LABEL}>
                Téléphone
              </label>
              <ChampTelephone id="telephone" value={saisieTelephone} onChange={setSaisieTelephone} idErreur="erreur-formulaire" />
            </div>
            <Erreur id="erreur-formulaire" texte={erreur} />
            <button type="submit" disabled={enCours} className={BOUTON}>
              {enCours ? "Envoi…" : "Recevoir le code"}
            </button>
          </form>
        </>
      )}

      {etape === "code" && (
        <>
          {enteteTitre("Saisis le code")}
          <p className="mb-6 text-sm text-[#475A7A]">
            {info ?? "Si ce numéro est associé à un compte, un code sera envoyé."} Le code est valable 5 minutes.
          </p>
          <form noValidate onSubmit={verifier} className="flex flex-col gap-5">
            <ChampCodeOtp value={code} onChange={setCode} disabled={enCours} invalide={!!erreur} idErreur="erreur-formulaire" />
            <Erreur id="erreur-formulaire" texte={erreur} />
            <button type="submit" disabled={enCours} className={BOUTON}>
              {enCours ? "Vérification…" : "Vérifier le code"}
            </button>
          </form>
          <div className="mt-5 text-center text-sm text-[#475A7A]">
            {attente > 0 ? (
              <span aria-live="polite">Renvoyer le code dans {formaterDelai(attente)}</span>
            ) : (
              <button type="button" onClick={renvoyer} disabled={enCours} className={`${LIEN} disabled:opacity-60`}>
                Renvoyer le code
              </button>
            )}
          </div>
          <p className="mt-3 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setEtape("telephone");
                setErreur(null);
                setCode("");
              }}
              className="text-[#475A7A] underline-offset-2 hover:underline"
            >
              Changer de numéro
            </button>
          </p>
        </>
      )}

      {etape === "mot_de_passe" && (
        <>
          {enteteTitre("Nouveau mot de passe")}
          <p className="mb-6 text-sm text-[#475A7A]">Au moins 8 caractères, pas trop courant, pas uniquement des chiffres.</p>
          <form noValidate onSubmit={reinitialiser} className="flex flex-col gap-5">
            <div>
              <label htmlFor="nouveau" className={LABEL}>
                Nouveau mot de passe
              </label>
              <ChampMotDePasse
                id="nouveau"
                value={nouveau}
                onChange={setNouveau}
                autoComplete="new-password"
                designation="le nouveau mot de passe"
              />
            </div>
            <div>
              <label htmlFor="confirmation" className={LABEL}>
                Confirmer le mot de passe
              </label>
              <ChampMotDePasse
                id="confirmation"
                value={confirmation}
                onChange={setConfirmation}
                autoComplete="new-password"
                designation="la confirmation"
              />
            </div>
            <Erreur id="erreur-formulaire" texte={erreur} />
            <button type="submit" disabled={enCours} className={BOUTON}>
              {enCours ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </>
      )}

      {etape === "termine" && (
        <div className="text-center">
          <IconCircleCheck size={64} stroke={1.5} className="mx-auto text-[#16A34A]" aria-hidden="true" />
          <h1 ref={titre} tabIndex={-1} className="mt-4 text-3xl font-bold text-[#102A66] outline-none">
            Mot de passe modifié.
          </h1>
          <p className="mt-2 mb-6 text-sm text-[#475A7A]">Tu peux maintenant te connecter avec ton nouveau mot de passe.</p>
          <Link href="/login" className={`${BOUTON} flex items-center justify-center`}>
            Se connecter
          </Link>
        </div>
      )}

      {etape !== "termine" && (
        <p className="mt-6 text-center text-sm text-[#475A7A]">
          <Link href="/login" className={LIEN}>
            Retour à la connexion
          </Link>
        </p>
      )}
    </div>
  );
}
