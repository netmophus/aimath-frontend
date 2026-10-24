"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api";
import { modifierPresentationProgramme } from "@/lib/programmeApi";
import RenduMarkdown from "@/components/RenduMarkdown";

interface PresentationProgrammeProps {
  programmeId: number;
  valeurInitiale: string;
  onSauvegarde: (texte: string) => void;
}

/** Édition du texte markdown « Présentation du programme » (ouvert côté élève dans un drawer). */
export default function PresentationProgramme({
  programmeId,
  valeurInitiale,
  onSauvegarde,
}: PresentationProgrammeProps) {
  const [texte, setTexte] = useState(valeurInitiale);
  const [enregistre, setEnregistre] = useState(valeurInitiale);
  const [apercu, setApercu] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ texte: string; tone: "succes" | "erreur" } | null>(null);

  const modifie = texte !== enregistre;

  async function enregistrer() {
    setEnCours(true);
    setMessage(null);
    try {
      await modifierPresentationProgramme(programmeId, texte);
      setEnregistre(texte);
      onSauvegarde(texte);
      setMessage({ texte: "Présentation enregistrée.", tone: "succes" });
    } catch (error) {
      setMessage({
        texte: error instanceof ApiError ? error.message : "Enregistrement impossible.",
        tone: "erreur",
      });
    } finally {
      setEnCours(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-fh-sable">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-fh-bleu">Présentation du programme</h3>
        <button
          type="button"
          onClick={() => setApercu((courant) => !courant)}
          className="rounded-full border border-fh-bleu/20 px-3 py-1 text-xs font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          {apercu ? "Masquer l'aperçu" : "Aperçu"}
        </button>
      </div>

      <textarea
        value={texte}
        onChange={(event) => {
          setTexte(event.target.value);
          setMessage(null);
        }}
        rows={10}
        aria-label="Présentation du programme (markdown)"
        placeholder="Texte de présentation en markdown (les formules LaTeX sont acceptées). Laisser vide pour masquer le bouton côté élève."
        className="w-full rounded-xl border border-fh-sable bg-fh-creme/40 px-3 py-2 font-mono text-sm text-fh-bleu outline-none focus:border-fh-bleu"
      />

      {apercu && (
        <div className="rounded-xl border border-fh-sable px-4 py-3">
          {texte.trim() ? (
            <RenduMarkdown contenu={texte} />
          ) : (
            <p className="text-sm text-fh-ardoise">Rien à afficher.</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={enregistrer}
          disabled={enCours || !modifie}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enCours ? "Enregistrement…" : "Enregistrer"}
        </button>
        {message && (
          <p
            role="status"
            className={`text-sm ${message.tone === "succes" ? "text-green-700" : "text-red-700"}`}
          >
            {message.texte}
          </p>
        )}
      </div>
    </section>
  );
}
