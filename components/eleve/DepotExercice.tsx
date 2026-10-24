"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { IconCamera, IconCircleCheck, IconFileTypePdf, IconPhoto, IconRefresh, IconX } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import AnalyseEnonce from "@/components/eleve/AnalyseEnonce";
import { deposerExercice, type AnalyseEnonce as Analyse } from "@/lib/eleveApi";
import { preparerImage } from "@/lib/reduireImage";
import {
  ACCEPT_IMPORT,
  LONGUEUR_MAX_ENONCE,
  MESSAGE_DEPOT_VALIDE,
  MODES_RESOLUTION,
  NB_MAX_IMAGES,
  TAILLE_MAX_TOTAL_OCTETS,
  TYPE_PDF,
  decrireErreurDepot,
  erreurFichier,
  formaterTaille,
  type ErreurDepot,
  type ModeResolution,
} from "@/lib/resoudre";

interface ImageDepot {
  id: number;
  fichier: File;
  /** URL d'objet créée à la sélection : TOUJOURS révoquée à la suppression, au
   * « recommencer » et au démontage (sinon le navigateur garde l'image en mémoire). */
  apercuUrl: string;
}

interface DepotExerciceProps {
  /** Identifiant RÉEL du programme (voir GET /api/eleve/mon-programme/), envoyé tel quel à l'API. */
  programmeId: number;
  /** Libellé de la matière (« Mathématiques »…), pour les textes d'aide. */
  matiere: string;
}

const BOUTON_ACTION =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-fh-bleu/20 bg-white px-4 py-2 text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-accent disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Interface de dépôt d'un exercice : photo(s) à la caméra, import d'images ou
 * d'un PDF, et/ou énoncé saisi, puis choix du mode. « Soumettre » envoie le
 * tout à POST /api/eleve/resoudre/, qui VALIDE seulement l'exercice : il n'est
 * ni enregistré ni résolu à ce stade, et l'interface ne le prétend jamais.
 * Les fichiers restent en place après une erreur pour permettre de réessayer.
 *
 * Règles : soit des images (jusqu'à NB_MAX_IMAGES, une photo à la fois pour un
 * exercice sur plusieurs pages), soit un seul PDF — pas les deux à la fois ;
 * l'énoncé saisi peut s'y ajouter. Les types et la taille sont vérifiés
 * (voir erreurFichier dans lib/resoudre.ts).
 */
export default function DepotExercice({ programmeId, matiere }: DepotExerciceProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const [images, setImages] = useState<ImageDepot[]>([]);
  const [pdf, setPdf] = useState<File | null>(null);
  const [enonce, setEnonce] = useState("");
  const [mode, setMode] = useState<ModeResolution>("correction");
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState<ErreurDepot | null>(null);
  const [depotValide, setDepotValide] = useState(false);
  // Énoncé reconnu par l'IA, à relire avant toute résolution (null tant qu'il n'y en a pas).
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
  const [enonceConfirme, setEnonceConfirme] = useState(false);
  const [correctionDisponible, setCorrectionDisponible] = useState(false);
  const [professeurDisponible, setProfesseurDisponible] = useState(false);

  // Verrou synchrone : deux clics très rapprochés peuvent précéder le rendu qui
  // désactive le bouton, un état React seul ne suffirait pas.
  const envoiVerrou = useRef(false);
  const prochainId = useRef(1);
  const imagesRef = useRef<ImageDepot[]>([]);
  const entreeCamera = useRef<HTMLInputElement>(null);
  const entreeImport = useRef<HTMLInputElement>(null);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Libère les aperçus restants quand on quitte la page.
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.apercuUrl));
    };
  }, []);

  const aContenu = images.length > 0 || pdf !== null || enonce.trim().length > 0;
  const placesRestantes = NB_MAX_IMAGES - images.length;

  function ajouterFichiers(fichiers: File[]) {
    const problemes: string[] = [];
    const nouvellesImages: ImageDepot[] = [];
    let nouveauPdf: File | null = null;
    let places = placesRestantes;
    let total = images.reduce((somme, image) => somme + image.fichier.size, 0) + (pdf?.size ?? 0);

    for (const fichier of fichiers) {
      const probleme = erreurFichier(fichier);
      if (probleme) {
        problemes.push(probleme);
      } else if (total + fichier.size > TAILLE_MAX_TOTAL_OCTETS) {
        problemes.push(
          `« ${fichier.name} » n'a pas été ajouté : ${formaterTaille(TAILLE_MAX_TOTAL_OCTETS)} maximum pour l'ensemble de l'exercice.`,
        );
      } else if (fichier.type === TYPE_PDF) {
        if (images.length > 0 || nouvellesImages.length > 0) {
          problemes.push("Un PDF ne peut pas être mélangé à des photos : retire d'abord les images.");
        } else if (pdf || nouveauPdf) {
          problemes.push("Un seul PDF à la fois : retire le PDF actuel pour en choisir un autre.");
        } else {
          nouveauPdf = fichier;
          total += fichier.size;
        }
      } else if (pdf || nouveauPdf) {
        problemes.push("Des images ne peuvent pas être mélangées à un PDF : retire d'abord le PDF.");
      } else if (places <= 0) {
        problemes.push(`${NB_MAX_IMAGES} images maximum : « ${fichier.name} » n'a pas été ajoutée.`);
      } else {
        places -= 1;
        total += fichier.size;
        nouvellesImages.push({
          id: prochainId.current++,
          fichier,
          apercuUrl: URL.createObjectURL(fichier),
        });
      }
    }

    if (nouvellesImages.length > 0) setImages((courantes) => [...courantes, ...nouvellesImages]);
    if (nouveauPdf) setPdf(nouveauPdf);
    setErreurs(problemes);
  }

  function handleChoix(event: ChangeEvent<HTMLInputElement>) {
    const fichiers = Array.from(event.target.files ?? []);
    // Remet le champ à zéro : sans ça, re-choisir le même fichier après l'avoir
    // supprimé ne déclencherait aucun évènement.
    event.target.value = "";
    if (fichiers.length > 0) ajouterFichiers(fichiers);
  }

  function supprimerImage(id: number) {
    const cible = images.find((image) => image.id === id);
    if (cible) URL.revokeObjectURL(cible.apercuUrl);
    setImages((courantes) => courantes.filter((image) => image.id !== id));
    setErreurs([]);
  }

  function recommencer() {
    images.forEach((image) => URL.revokeObjectURL(image.apercuUrl));
    setImages([]);
    setPdf(null);
    setEnonce("");
    setErreurs([]);
    setErreurEnvoi(null);
    setDepotValide(false);
    setAnalyse(null);
    setEnonceConfirme(false);
  }

  async function soumettre(remarque?: string) {
    if (envoiVerrou.current || !aContenu) return;
    envoiVerrou.current = true;
    setEnvoiEnCours(true);
    setErreurEnvoi(null);

    try {
      // Les photos lourdes sont réduites avant l'envoi (limite de lecture : 5 Mo/image).
      const fichiers = await Promise.all([...images.map((image) => preparerImage(image.fichier)), ...(pdf ? [pdf] : [])]);
      const reponse = await deposerExercice({
        programme: programmeId,
        mode,
        enonce: enonce.trim(),
        fichiers,
        analyser: true,
        correction: remarque,
      });
      if (reponse.valide === true) {
        if (reponse.analysee && reponse.analyse) {
          setAnalyse(reponse.analyse);
          setCorrectionDisponible(reponse.correction_disponible === true);
          setProfesseurDisponible(reponse.professeur_disponible === true);
          setEnonceConfirme(false);
        } else {
          setDepotValide(true);
        }
      } else {
        setErreurEnvoi({ messages: ["Réponse inattendue du serveur : ton exercice n'a pas été validé."], sessionExpiree: false });
      }
    } catch (error) {
      setErreurEnvoi(decrireErreurDepot(error));
    } finally {
      envoiVerrou.current = false;
      setEnvoiEnCours(false);
    }
  }

  function seReconnecter() {
    logout();
    router.push("/login");
  }

  if (analyse) {
    return (
      <AnalyseEnonce
        analyse={analyse}
        matiereProgramme={matiere}
        programmeId={programmeId}
        correctionDisponible={correctionDisponible}
        professeurDisponible={professeurDisponible}
        modeChoisi={mode}
        nbPages={images.length || 1}
        enCours={envoiEnCours}
        erreur={erreurEnvoi}
        confirmee={enonceConfirme}
        onModifier={() => {
          setAnalyse(null);
          setErreurEnvoi(null);
        }}
        onDemanderCorrection={(remarque) => void soumettre(remarque)}
        onConfirmer={() => setEnonceConfirme(true)}
      />
    );
  }

  if (depotValide) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-fh-sable"
      >
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700"
          aria-hidden="true"
        >
          <IconCircleCheck size={28} stroke={1.75} />
        </span>
        <p className="max-w-sm text-base font-semibold text-fh-bleu">{MESSAGE_DEPOT_VALIDE}</p>
        <button
          type="button"
          onClick={recommencer}
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full border border-fh-bleu/20 px-5 text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-accent"
        >
          Déposer un autre exercice
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Verrouille tous les champs pendant l'envoi (fieldset disabled) */}
      <fieldset disabled={envoiEnCours} className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0">
        {/* 1. Fournir l'exercice */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable sm:p-5">
          <h2 className="text-base font-bold text-fh-bleu">1. Ton exercice de {matiere}</h2>
          <p className="mt-0.5 text-xs text-fh-ardoise">
            Photographie-le, importe un fichier, ou tape l&apos;énoncé. Images : JPG, PNG ou WebP, {NB_MAX_IMAGES} maximum.
            PDF : un seul. 10 Mo maximum par fichier.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => entreeCamera.current?.click()}
              disabled={pdf !== null || placesRestantes <= 0}
              className={BOUTON_ACTION}
            >
              <IconCamera size={20} stroke={1.75} aria-hidden="true" />
              {images.length > 0 ? "Photographier une autre page" : "Prendre une photo"}
            </button>
            <button type="button" onClick={() => entreeImport.current?.click()} className={BOUTON_ACTION}>
              <IconPhoto size={20} stroke={1.75} aria-hidden="true" />
              Importer images ou PDF
            </button>
          </div>

          {/* Champs fichier masqués. `capture` ouvre directement l'appareil photo
              sur mobile (ignoré sur ordinateur, où s'ouvre le sélecteur de fichiers). */}
          <input
            ref={entreeCamera}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleChoix}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />
          <input
            ref={entreeImport}
            type="file"
            accept={ACCEPT_IMPORT}
            multiple
            onChange={handleChoix}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />

          {erreurs.length > 0 && (
            <ul role="alert" className="mt-3 flex flex-col gap-1 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {erreurs.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}

          {images.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-fh-ardoise">
                {images.length} page{images.length > 1 ? "s" : ""} · {placesRestantes} place
                {placesRestantes > 1 ? "s" : ""} restante{placesRestantes > 1 ? "s" : ""}
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image, index) => (
                  <li key={image.id} className="relative overflow-hidden rounded-xl ring-1 ring-fh-sable">
                    {/* eslint-disable-next-line @next/next/no-img-element -- URL d'objet locale (blob:), next/image n'est pas applicable */}
                    <img
                      src={image.apercuUrl}
                      alt={`Page ${index + 1} de l'exercice`}
                      className="aspect-[3/4] w-full bg-fh-sable/40 object-cover"
                    />
                    <span className="absolute bottom-1 left-1 rounded-full bg-fh-bleu/80 px-2 py-0.5 text-[11px] font-semibold text-white">
                      Page {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => supprimerImage(image.id)}
                      aria-label={`Supprimer la page ${index + 1}`}
                      className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-fh-bleu shadow ring-1 ring-fh-sable transition-colors hover:bg-fh-accent"
                    >
                      <IconX size={18} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pdf && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-fh-creme px-3 py-3 ring-1 ring-fh-sable">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-fh-accent text-fh-orange-fonce"
                aria-hidden="true"
              >
                <IconFileTypePdf size={22} stroke={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-all text-sm font-semibold text-fh-bleu">{pdf.name}</p>
                <p className="text-xs text-fh-ardoise">PDF · {formaterTaille(pdf.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPdf(null);
                  setErreurs([]);
                }}
                aria-label="Retirer le PDF"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fh-bleu transition-colors hover:bg-fh-accent"
              >
                <IconX size={18} aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="mt-4">
            <label htmlFor="enonce" className="mb-1 block text-sm font-medium text-fh-bleu">
              Ou saisis l&apos;énoncé
            </label>
            <textarea
              id="enonce"
              value={enonce}
              onChange={(event) => setEnonce(event.target.value.slice(0, LONGUEUR_MAX_ENONCE))}
              rows={5}
              placeholder="Recopie ici le texte de ton exercice…"
              className="w-full rounded-xl border border-fh-bleu-vif/15 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none transition-shadow focus:border-fh-orange focus:ring-2 focus:ring-fh-orange/20"
            />
            <p className="mt-1 text-right text-xs text-fh-ardoise/70">
              {enonce.length} / {LONGUEUR_MAX_ENONCE}
            </p>
          </div>

          {aContenu && (
            <button
              type="button"
              onClick={recommencer}
              className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
            >
              <IconRefresh size={18} aria-hidden="true" />
              Tout recommencer
            </button>
          )}
        </section>

        {/* 2. Choisir le mode */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable sm:p-5">
          <h2 id="titre-mode" className="text-base font-bold text-fh-bleu">
            2. Comment veux-tu être aidé ?
          </h2>
          <div role="radiogroup" aria-labelledby="titre-mode" className="mt-3 flex flex-col gap-2 sm:flex-row">
            {MODES_RESOLUTION.map((option) => {
              const actif = mode === option.valeur;
              return (
                <label
                  key={option.valeur}
                  className={`flex min-h-11 flex-1 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-fh-orange/30 ${
                    actif ? "border-fh-orange bg-fh-accent/60" : "border-fh-bleu/15 bg-white hover:bg-fh-creme"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode-resolution"
                    value={option.valeur}
                    checked={actif}
                    onChange={() => setMode(option.valeur)}
                    className="mt-1 h-4 w-4 shrink-0 accent-fh-orange"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-fh-bleu">{option.titre}</span>
                    <span className="block text-xs text-fh-ardoise">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      </fieldset>

      {/* 3. Soumettre */}
      <div className="flex flex-col gap-2">
        {erreurEnvoi && (
          <div role="alert" className="flex flex-col gap-2 rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700">
            {erreurEnvoi.messages.length === 1 ? (
              <p>{erreurEnvoi.messages[0]}</p>
            ) : (
              <ul className="list-disc pl-5">
                {erreurEnvoi.messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
            {erreurEnvoi.sessionExpiree ? (
              <button
                type="button"
                onClick={seReconnecter}
                className="w-fit rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Se reconnecter
              </button>
            ) : (
              <p className="text-xs text-red-600/80">Tes fichiers sont conservés : corrige puis réessaie.</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => void soumettre()}
          disabled={!aContenu || envoiEnCours}
          aria-describedby="aide-soumission"
          aria-busy={envoiEnCours}
          className="min-h-12 rounded-full bg-fh-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
        >
          {envoiEnCours ? "Envoi en cours…" : "Soumettre mon exercice"}
        </button>
        <p id="aide-soumission" className="text-center text-xs text-fh-ardoise">
          {envoiEnCours
            ? "Envoi en cours, ne ferme pas la page."
            : aContenu
              ? "Ton exercice sera envoyé pour vérification."
              : "Ajoute une photo, un fichier ou ton énoncé pour pouvoir soumettre."}
        </p>
      </div>
    </div>
  );
}
