"use client";

import { useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { activerCarteFahimta } from "@/lib/eleveApi";

/** "2026-10-25" → "25 octobre 2026" — même format que le message de succès
 * renvoyé par le backend (voir comptes.cartes.formater_date_fr), pour que
 * l'affichage de l'échéance reste cohérent qu'il vienne de /me/ ou de la
 * réponse d'activation. */
function formaterDateFr(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Destination du bouton "Débloquer avec une carte Fahimta" (voir
 * components/eleve/MurDeblocage.tsx). Le paiement par carte (achat) reste
 * hors périmètre — cette page ne gère que l'ACTIVATION d'un code déjà
 * obtenu par ailleurs.
 */
export default function AbonnementPage() {
  const { user, updateUser } = useAuth();

  const [code, setCode] = useState("");
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState<{ texte: string; tone: "succes" | "erreur" } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saisie = code.trim();
    if (!saisie) return;

    setChargement(true);
    setMessage(null);
    try {
      const resultat = await activerCarteFahimta(saisie);
      // Met à jour l'état global du user tout de suite (pas d'attente d'un
      // rechargement de page) : les cadenas des listes de leçons et le
      // verrou des cours premium déjà ouverts en profitent dès ce clic.
      updateUser({
        aUnAbonnementActif: true,
        abonnementActifJusquAu: resultat.abonnement_actif_jusqu_au,
      });
      setMessage({ texte: resultat.message, tone: "succes" });
      setCode("");
    } catch (error) {
      const texte = error instanceof ApiError ? error.message : "Impossible d'activer cette carte.";
      setMessage({ texte, tone: "erreur" });
    } finally {
      setChargement(false);
    }
  }

  const abonnementActif = user?.aUnAbonnementActif ?? false;
  const echeance = user?.abonnementActifJusquAu;

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-6 px-4 py-10 sm:px-0">
      <div>
        <h1 className="text-xl font-bold text-fh-bleu">Carte Fahimta</h1>
        <p className="mt-1 text-sm text-fh-ardoise">
          Procure-toi une carte Fahimta, saisis son code ci-dessous, et accède à tous les cours premium pendant
          30 jours.
        </p>
      </div>

      {abonnementActif && echeance ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
          <p className="text-sm font-semibold text-green-800">
            Ton abonnement est actif jusqu&apos;au {formaterDateFr(echeance)}.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-fh-sable bg-fh-creme px-4 py-4">
          <p className="text-sm font-medium text-fh-ardoise">Tu n&apos;as pas d&apos;abonnement actif.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-fh-sable">
        <label htmlFor="code-carte" className="text-sm font-semibold text-fh-bleu">
          Code de la carte
        </label>
        <input
          id="code-carte"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="FH-XXXX-XXXX-XXXX"
          autoComplete="off"
          autoCapitalize="characters"
          className="min-h-11 rounded-lg border border-fh-bleu-vif/20 bg-white px-4 py-2 text-center text-base font-semibold tracking-wide text-fh-bleu outline-none focus:border-fh-orange"
        />
        <button
          type="submit"
          disabled={chargement || !code.trim()}
          className="min-h-11 rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
        >
          {chargement ? "Activation…" : "Activer ma carte"}
        </button>

        {message && (
          <p
            className={`text-sm ${message.tone === "succes" ? "text-green-700" : "text-red-600"}`}
            role={message.tone === "erreur" ? "alert" : undefined}
          >
            {message.texte}
          </p>
        )}
      </form>
    </div>
  );
}
