"use client";

import { useMemo, useState } from "react";

import type { LeconListe } from "@/lib/leconApi";
import {
  collecterClesADeplier,
  formaterProgres,
  type ChapitreArbre,
  type MatiereArbre,
  type NotionArbre,
  type ProgrammeArbre,
  type ThemeArbre,
} from "@/lib/arbreLecons";
import NoeudArbre from "./NoeudArbre";
import NotionLigne from "./NotionLigne";
import type { NotionPreremplissage } from "./CreerLeconModal";

interface ArbreLeconsProps {
  /** Déjà filtré par l'appelant (voir lib/arbreLecons.ts, filtrerArbre). */
  arbre: MatiereArbre[];
  /** Un filtre/une recherche est actif : déplie automatiquement les branches
   * correspondantes (en plus de ce que l'utilisateur a déplié à la main). */
  filtreActif: boolean;
  /** Terme de recherche déjà trimé, pour le surlignage — "" = aucun. */
  termeRecherche: string;
  idEnCours: number | null;
  onPublier: (id: number) => void;
  onDepublier: (id: number) => void;
  onSupprimer: (lecon: LeconListe) => void;
  onCreerPourNotion: (contexte: NotionPreremplissage) => void;
  onBasculerAcces: (id: number, estGratuit: boolean) => void;
}

interface BrancheCommuneProps {
  termeRecherche: string;
  idEnCours: number | null;
  estOuvert: (cle: string) => boolean;
  toggle: (cle: string) => void;
  onPublier: (id: number) => void;
  onDepublier: (id: number) => void;
  onSupprimer: (lecon: LeconListe) => void;
  onCreerPourNotion: (contexte: NotionPreremplissage) => void;
  onBasculerAcces: (id: number, estGratuit: boolean) => void;
}

function ChapitreBranche({
  chapitre,
  programmeId,
  themeId,
  ...commun
}: BrancheCommuneProps & { chapitre: ChapitreArbre; programmeId: number; themeId: number }) {
  const cle = `chapitre-${chapitre.id}`;
  return (
    <NoeudArbre
      titre={chapitre.titre}
      progres={formaterProgres(chapitre.nbLecons, chapitre.nbNotions, chapitre.nbLeconsPubliees)}
      niveau="chapitre"
      ouvert={commun.estOuvert(cle)}
      onToggle={() => commun.toggle(cle)}
    >
      <div className="flex flex-col gap-1.5">
        {chapitre.notions.map((notion: NotionArbre) => (
          <NotionLigne
            key={notion.id}
            notion={notion}
            termeRecherche={commun.termeRecherche}
            enCours={notion.lecon !== null && commun.idEnCours === notion.lecon.id}
            onPublier={commun.onPublier}
            onDepublier={commun.onDepublier}
            onSupprimer={commun.onSupprimer}
            onBasculerAcces={commun.onBasculerAcces}
            onCreerPourNotion={() =>
              commun.onCreerPourNotion({
                programmeId,
                themeId,
                chapitreId: chapitre.id,
                notionId: notion.id,
                notionTitre: notion.titre,
              })
            }
          />
        ))}
      </div>
    </NoeudArbre>
  );
}

function ThemeBranche({
  theme,
  programmeId,
  ...commun
}: BrancheCommuneProps & { theme: ThemeArbre; programmeId: number }) {
  const cle = `theme-${theme.id}`;
  return (
    <NoeudArbre
      titre={theme.titre}
      sousTitre={theme.volumeHoraire != null ? `${theme.volumeHoraire}h` : undefined}
      progres={formaterProgres(theme.nbLecons, theme.nbNotions, theme.nbLeconsPubliees)}
      niveau="theme"
      ouvert={commun.estOuvert(cle)}
      onToggle={() => commun.toggle(cle)}
    >
      <div className="flex flex-col gap-2">
        {theme.chapitres.map((chapitre) => (
          <ChapitreBranche key={chapitre.id} chapitre={chapitre} programmeId={programmeId} themeId={theme.id} {...commun} />
        ))}
      </div>
    </NoeudArbre>
  );
}

function ProgrammeBranche({ programme, ...commun }: BrancheCommuneProps & { programme: ProgrammeArbre }) {
  const cle = `programme-${programme.id}`;
  return (
    <NoeudArbre
      titre={programme.libelle}
      progres={formaterProgres(programme.nbLecons, programme.nbNotions, programme.nbLeconsPubliees)}
      niveau="programme"
      ouvert={commun.estOuvert(cle)}
      onToggle={() => commun.toggle(cle)}
    >
      <div className="flex flex-col gap-3">
        {programme.themes.map((theme) => (
          <ThemeBranche key={theme.id} theme={theme} programmeId={programme.id} {...commun} />
        ))}
      </div>
    </NoeudArbre>
  );
}

/**
 * Racine de l'arbre Matière → Programme → Thème → Chapitre → Notion. Tout
 * replié par défaut ; l'état de dépliage (Set de clés "niveau-id") vit ICI,
 * pas dans app/admin/lecons/page.tsx, qui n'a besoin de rien en savoir.
 */
export default function ArbreLecons({
  arbre,
  filtreActif,
  termeRecherche,
  idEnCours,
  onPublier,
  onDepublier,
  onSupprimer,
  onCreerPourNotion,
  onBasculerAcces,
}: ArbreLeconsProps) {
  const [deplies, setDeplies] = useState<Set<string>>(new Set());

  const clesAuto = useMemo(
    () => (filtreActif ? collecterClesADeplier(arbre) : new Set<string>()),
    [arbre, filtreActif]
  );

  function estOuvert(cle: string): boolean {
    return deplies.has(cle) || clesAuto.has(cle);
  }

  function toggle(cle: string) {
    setDeplies((precedent) => {
      const suivant = new Set(precedent);
      if (suivant.has(cle)) suivant.delete(cle);
      else suivant.add(cle);
      return suivant;
    });
  }

  if (arbre.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
        <span className="text-3xl" aria-hidden="true">
          🔍
        </span>
        <p className="text-sm text-fh-ardoise">Aucun résultat pour ces filtres.</p>
      </div>
    );
  }

  const commun: BrancheCommuneProps = {
    termeRecherche,
    idEnCours,
    estOuvert,
    toggle,
    onPublier,
    onDepublier,
    onSupprimer,
    onCreerPourNotion,
    onBasculerAcces,
  };

  return (
    <div className="flex flex-col gap-4">
      {arbre.map((matiere: MatiereArbre) => {
        const cle = `matiere-${matiere.nom}`;
        return (
          <NoeudArbre
            key={matiere.nom}
            titre={matiere.nom}
            progres={formaterProgres(matiere.nbLecons, matiere.nbNotions, matiere.nbLeconsPubliees)}
            niveau="matiere"
            ouvert={estOuvert(cle)}
            onToggle={() => toggle(cle)}
          >
            <div className="flex flex-col gap-3">
              {matiere.programmes.map((programme) => (
                <ProgrammeBranche key={programme.id} programme={programme} {...commun} />
              ))}
            </div>
          </NoeudArbre>
        );
      })}
    </div>
  );
}
