"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { creerTerme, modifierTerme, type TermeGlossaire, type TermeInput } from "@/lib/glossaireApi";
import { listerLecons, type LeconStatut } from "@/lib/leconApi";
import Modal from "@/components/admin/Modal";
import ChampMarkdown from "@/components/admin/lecons/ChampMarkdown";

interface TermeFormModalProps {
  /** null = création ; un terme = édition. */
  terme: TermeGlossaire | null;
  onSaved: (terme: TermeGlossaire) => void;
  onClose: () => void;
}

interface OptionLecon {
  id: number;
  titre: string;
  statut: LeconStatut;
}

/**
 * Modale dédiée (pas EntityFormModal) : deux champs Markdown+LaTeX avec
 * aperçu (réutilise ChampMarkdown, le même composant que l'éditeur de leçon)
 * et un sélecteur de leçon cherché en direct — au-delà de ce que le
 * formulaire générique gère.
 */
export default function TermeFormModal({ terme, onSaved, onClose }: TermeFormModalProps) {
  const [termeTexte, setTermeTexte] = useState(terme?.terme ?? "");
  const [slug, setSlug] = useState(terme?.slug ?? "");
  const [definition, setDefinition] = useState(terme?.definition ?? "");
  const [exemple, setExemple] = useState(terme?.exemple ?? "");
  const [leconLieeId, setLeconLieeId] = useState(terme?.lecon_liee ? String(terme.lecon_liee.id) : "");

  const [rechercheLecon, setRechercheLecon] = useState("");
  const [lecons, setLecons] = useState<OptionLecon[]>([]);

  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const erreurRef = useRef<HTMLParagraphElement>(null);

  // Le formulaire défile en interne (beaucoup de champs, dont deux éditeurs
  // Markdown) : sans ça, une erreur de validation (ex. doublon de slug)
  // peut apparaître hors de la zone visible sans que l'admin s'en rende compte.
  useEffect(() => {
    if (erreur) erreurRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [erreur]);

  // Recherche de leçon en direct (debounce léger) — peu de leçons pour
  // l'instant, mais reste utile quand il y en aura beaucoup plus.
  useEffect(() => {
    let actif = true;
    const delai = setTimeout(async () => {
      try {
        const data = await listerLecons({ search: rechercheLecon || undefined });
        if (actif) setLecons(data.results.map((l) => ({ id: l.id, titre: l.titre, statut: l.statut })));
      } catch {
        // Sélecteur secondaire : une panne ici ne doit pas bloquer le formulaire.
      }
    }, 300);
    return () => {
      actif = false;
      clearTimeout(delai);
    };
  }, [rechercheLecon]);

  // La leçon déjà liée doit rester visible dans les options même si la
  // recherche en cours ne la fait pas remonter (elle vient du terme lui-même,
  // pas d'une requête supplémentaire).
  const optionsLecons = useMemo<OptionLecon[]>(() => {
    const parId = new Map<number, OptionLecon>();
    if (terme?.lecon_liee) {
      parId.set(terme.lecon_liee.id, { id: terme.lecon_liee.id, titre: terme.lecon_liee.titre, statut: terme.lecon_liee.statut });
    }
    for (const lecon of lecons) parId.set(lecon.id, lecon);
    return [...parId.values()];
  }, [lecons, terme]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur(null);
    setEnvoiEnCours(true);
    try {
      const payload: TermeInput = {
        terme: termeTexte.trim(),
        slug: slug.trim(),
        definition,
        exemple: exemple.trim(),
        lecon_liee: leconLieeId ? Number(leconLieeId) : null,
      };
      const resultat = terme ? await modifierTerme(terme.id, payload) : await creerTerme(payload);
      onSaved(resultat);
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Impossible d'enregistrer ce terme.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Modal titre={terme ? "Modifier le terme" : "Ajouter un terme"} onClose={onClose} taille="lg">
      <form onSubmit={handleSubmit} className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1">
        <div>
          <label htmlFor="terme" className="mb-1 block text-sm font-medium text-fh-ardoise">
            Terme
          </label>
          <input
            id="terme"
            type="text"
            required
            value={termeTexte}
            onChange={(event) => setTermeTexte(event.target.value)}
            placeholder="Ex. primitive"
            className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium text-fh-ardoise">
            Slug {!terme && "(laisser vide pour générer automatiquement)"}
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="laisser vide pour générer depuis le terme"
            className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 font-mono text-sm text-fh-bleu outline-none focus:border-fh-orange"
          />
          {terme && (
            <p className="mt-1 text-xs text-fh-orange-fonce">
              ⚠️ Changer le slug casse les [[{terme.slug}]] déjà écrits dans des cours — ils ne référenceront plus ce
              terme.
            </p>
          )}
        </div>

        <ChampMarkdown
          label="Définition"
          valeur={definition}
          onChange={setDefinition}
          placeholder="Explique le terme (Markdown + LaTeX)…"
        />

        <ChampMarkdown
          label="Exemple (optionnel)"
          valeur={exemple}
          onChange={setExemple}
          placeholder="Un exemple d'application (Markdown + LaTeX)…"
        />

        <div>
          <label htmlFor="lecon-liee" className="mb-1 block text-sm font-medium text-fh-ardoise">
            Leçon liée (optionnel)
          </label>
          <input
            type="search"
            value={rechercheLecon}
            onChange={(event) => setRechercheLecon(event.target.value)}
            placeholder="Rechercher une leçon…"
            className="mb-2 w-full rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
          />
          <select
            id="lecon-liee"
            value={leconLieeId}
            onChange={(event) => setLeconLieeId(event.target.value)}
            className="w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
          >
            <option value="">Aucune leçon</option>
            {optionsLecons.map((lecon) => (
              <option key={lecon.id} value={lecon.id}>
                {lecon.titre} — {lecon.statut === "publie" ? "Publié" : lecon.statut === "a_valider" ? "À valider" : "Brouillon"}
              </option>
            ))}
          </select>
        </div>

        {erreur && (
          <p ref={erreurRef} className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <div className="sticky bottom-0 mt-2 flex justify-end gap-2 bg-white pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={envoiEnCours}
            className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
          >
            {envoiEnCours ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
