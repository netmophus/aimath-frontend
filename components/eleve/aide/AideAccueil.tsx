import Link from "next/link";
import { IconListDetails } from "@tabler/icons-react";

import { type TypeDemande } from "@/lib/aide";
import { BoutonRetour, COULEUR_TYPE, IconeType, IllustrationEleve } from "./ui";

const CARTES: { type: TypeDemande; titre: string; texte: string }[] = [
  { type: "question", titre: "Question sur un cours", texte: "Pose ta question." },
  { type: "erreur", titre: "Signaler une erreur", texte: "Signale une erreur dans un cours." },
  { type: "suggestion", titre: "Suggestion", texte: "Propose une amélioration." },
];

const CARTE_BASE =
  "flex min-h-32 items-center gap-4 rounded-3xl p-5 shadow-md transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] sm:p-6";

export default function AideAccueil() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <BoutonRetour href="/eleve" />
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight text-[#102A66] sm:text-4xl">Aide</h1>
          <p className="mt-1 text-lg text-slate-700">Une question, une erreur ou une idée ?</p>
        </div>
        <IllustrationEleve />
      </header>

      <nav aria-label="Rubriques d'aide" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CARTES.map((c) => (
          <Link
            key={c.type}
            href={`/eleve/aide/nouvelle?type=${c.type}`}
            style={{ backgroundColor: COULEUR_TYPE[c.type] }}
            className={`${CARTE_BASE} text-white`}
          >
            <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <IconeType type={c.type} taille={40} />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl font-extrabold leading-tight">{c.titre}</span>
              <span className="mt-1 block text-base font-medium">{c.texte}</span>
            </span>
          </Link>
        ))}
        <Link href="/eleve/aide/demandes" className={`${CARTE_BASE} bg-white text-[#102A66] ring-2 ring-blue-200`}>
          <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#1D4ED8]">
            <IconListDetails size={40} stroke={2} />
          </span>
          <span className="min-w-0">
            <span className="block text-2xl font-extrabold leading-tight">Mes demandes</span>
            <span className="mt-1 block text-base font-medium text-slate-700">Suis tes demandes et les réponses.</span>
          </span>
        </Link>
      </nav>
    </div>
  );
}
