"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { listerTermes, type TermeGlossaire } from "@/lib/glossaireApi";
import Modal from "@/components/admin/Modal";

interface SelecteurTermeModalProps {
  /** Reçoit le marqueur final ([[slug|texte]] ou [[slug]]) à insérer. */
  onInsert: (marqueur: string) => void;
  onClose: () => void;
}

/**
 * Deux écrans dans une seule modale : recherche + liste, puis (une fois un
 * terme choisi) le texte affiché + aperçu du marqueur. Pas besoin d'un
 * routeur d'étapes plus complexe pour deux écrans.
 */
export default function SelecteurTermeModal({ onInsert, onClose }: SelecteurTermeModalProps) {
  const [recherche, setRecherche] = useState("");
  const [termes, setTermes] = useState<TermeGlossaire[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const [termeChoisi, setTermeChoisi] = useState<TermeGlossaire | null>(null);
  const [texteAffiche, setTexteAffiche] = useState("");

  useEffect(() => {
    let actif = true;
    const delai = setTimeout(async () => {
      setChargement(true);
      try {
        const data = await listerTermes({ search: recherche || undefined });
        if (actif) {
          setTermes(data.results);
          setErreur(null);
        }
      } catch (error) {
        if (actif) {
          setErreur(error instanceof ApiError ? error.message : "Impossible de charger le glossaire.");
        }
      } finally {
        if (actif) setChargement(false);
      }
    }, 300);
    return () => {
      actif = false;
      clearTimeout(delai);
    };
  }, [recherche]);

  function choisir(terme: TermeGlossaire) {
    setTermeChoisi(terme);
    setTexteAffiche(terme.terme);
  }

  const texteAfficheFinal = texteAffiche.trim();
  const marqueur = termeChoisi
    ? texteAfficheFinal
      ? `[[${termeChoisi.slug}|${texteAfficheFinal}]]`
      : `[[${termeChoisi.slug}]]`
    : "";

  return (
    <Modal titre="Insérer un terme du glossaire" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {!termeChoisi ? (
          <>
            <input
              type="search"
              autoFocus
              placeholder="Rechercher un terme…"
              value={recherche}
              onChange={(event) => setRecherche(event.target.value)}
              className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            />

            <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {chargement ? (
                <p className="px-1 py-2 text-sm text-fh-ardoise">Recherche…</p>
              ) : erreur ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
              ) : termes.length === 0 ? (
                <p className="px-1 py-2 text-sm text-fh-ardoise/70">Aucun terme. Créez-en un dans le glossaire.</p>
              ) : (
                termes.map((terme) => (
                  <button
                    key={terme.id}
                    type="button"
                    onClick={() => choisir(terme)}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-fh-accent/40"
                  >
                    <span className="font-medium text-fh-bleu">{terme.terme}</span>
                    <code className="shrink-0 text-xs text-fh-ardoise/60">{terme.slug}</code>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setTermeChoisi(null)}
              className="self-start text-sm font-medium text-fh-bleu hover:underline"
            >
              ← Choisir un autre terme
            </button>

            <div>
              <label htmlFor="texte-affiche" className="mb-1 block text-sm font-medium text-fh-ardoise">
                Texte affiché
              </label>
              <input
                id="texte-affiche"
                type="text"
                autoFocus
                value={texteAffiche}
                onChange={(event) => setTexteAffiche(event.target.value)}
                placeholder={termeChoisi.terme}
                className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              />
              {!texteAfficheFinal && (
                <p className="mt-1 text-xs text-fh-orange-fonce">
                  Vide : le slug s&apos;affichera tel quel, « {termeChoisi.slug} ».
                </p>
              )}
            </div>

            <div className="rounded-lg bg-fh-creme px-3 py-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-fh-ardoise/60">
                Marqueur inséré
              </p>
              <code className="text-sm text-fh-bleu">{marqueur}</code>
            </div>
          </>
        )}

        <a
          href="/admin/glossaire"
          target="_blank"
          rel="noopener noreferrer"
          className="self-start text-xs font-medium text-fh-bleu hover:underline"
        >
          Gérer le glossaire ↗
        </a>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
          >
            Annuler
          </button>
          {termeChoisi && (
            <button
              type="button"
              onClick={() => onInsert(marqueur)}
              className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
            >
              Insérer
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
