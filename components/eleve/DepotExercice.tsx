"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  IconCamera,
  IconCheck,
  IconCircleCheck,
  IconCloudUpload,
  IconFileTypePdf,
  IconPhoto,
  IconRefresh,
  IconSend,
  IconX,
} from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import AnalyseEnonce from "@/components/eleve/AnalyseEnonce";
import { IDENTITES_MODES, melangeBlanc } from "@/components/eleve/teintesResoudre";
import ProfesseurParticulier from "@/components/eleve/ProfesseurParticulier";
import {
  deposerExercice,
  getReprise,
  type AnalyseEnonce as Analyse,
  type DepotExerciceReponse,
  type SeanceProfesseur,
} from "@/lib/eleveApi";
import { MESSAGE_RESULTAT_EXPIRE, attendreTache, marquerTacheVue, planifierVue, tacheVue } from "@/lib/taches";
import { preparerImage } from "@/lib/reduireImage";
import {
  ACCEPT_IMPORT,
  LONGUEUR_MAX_ENONCE,
  MESSAGE_DEPOT_VALIDE,
  MODES_RESOLUTION,
  NB_MAX_IMAGES,
  TAILLE_MAX_FICHIER_OCTETS,
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

const CARTE = "rounded-3xl border border-blue-100 bg-white p-4 shadow-sm sm:p-7";

const BOUTON_ACTION =
  "inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#1D4ED8] bg-white px-4 py-2 text-base font-bold text-[#1D4ED8] transition-colors hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-8";

const MO = 1024 * 1024;

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
  // Étape affichée pendant l'envoi : « envoi » puis « analyse » (l'analyse suit l'envoi, elle peut durer jusqu'à 2 minutes).
  const [phase, setPhase] = useState<"envoi" | "analyse">("envoi");
  // Énoncé reconnu par l'IA, à relire avant toute résolution (null tant qu'il n'y en a pas).
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
  const [correctionTacheId, setCorrectionTacheId] = useState<string | undefined>(undefined);
  const [seanceRetrouvee, setSeanceRetrouvee] = useState<SeanceProfesseur | null>(null);
  const [enonceConfirme, setEnonceConfirme] = useState(false);
  const [correctionDisponible, setCorrectionDisponible] = useState(false);
  const [professeurDisponible, setProfesseurDisponible] = useState(false);
  // Survol de la zone de glisser-déposer (affichage seulement).
  const [dragActif, setDragActif] = useState(false);

  // Verrou synchrone : deux clics très rapprochés peuvent précéder le rendu qui
  // désactive le bouton, un état React seul ne suffirait pas.
  const envoiVerrou = useRef(false);
  const prochainId = useRef(1);
  const imagesRef = useRef<ImageDepot[]>([]);
  const entreeCamera = useRef<HTMLInputElement>(null);
  const entreeImport = useRef<HTMLInputElement>(null);

  // Passe de « Envoi » à « Analyse » après quelques secondes : l'élève sait toujours où en est le traitement.
  useEffect(() => {
    if (!envoiEnCours) return;
    const minuteur = setTimeout(() => setPhase("analyse"), 4000);
    return () => clearTimeout(minuteur);
  }, [envoiEnCours]);

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
  const nbFichiers = images.length + (pdf ? 1 : 0);

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

  /** Glisser-déposer : mêmes règles que les boutons (tout passe par ajouterFichiers). Ignoré pendant l'envoi. */
  function handleDepot(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActif(false);
    if (envoiEnCours) return;
    const fichiers = Array.from(event.dataTransfer.files);
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

  function appliquerReponse(reponse: DepotExerciceReponse) {
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
  }

  // Actualisation, fermeture du navigateur ou coupure : on retrouve la séance fahimta ai, la correction ou la lecture en cours
  // (ou terminée) de cet élève. Lecture seule côté serveur : jamais de nouvel appel payant.
  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const reprise = await getReprise(programmeId);
        if (annule || envoiVerrou.current) return;
        const { analyse: enonceRetrouve, lecture, correction, seance } = reprise;
        // Une correction ou une séance n'existe que si l'élève a déjà confirmé sa lecture : celle-ci est dépassée, on ne la ressort pas.
        if ((correction || seance) && lecture && !tacheVue(lecture.id)) marquerTacheVue(lecture.id);
        const lectureOk = lecture?.statut === "terminee" && (lecture.corps as DepotExerciceReponse | null)?.correction_disponible;

        if (seance && !seance.termine) {
          if (enonceRetrouve) {
            setAnalyse(enonceRetrouve);
            setEnonceConfirme(true);
            setCorrectionDisponible(lectureOk === true || lecture === null || lecture.statut === "expiree");
            setProfesseurDisponible(true);
          }
          setSeanceRetrouvee(seance);
          return;
        }
        if (correction && !tacheVue(correction.id)) {
          if (correction.statut === "expiree") {
            planifierVue(correction.id);
            setErreurEnvoi({ messages: [MESSAGE_RESULTAT_EXPIRE], sessionExpiree: false });
          } else if (enonceRetrouve) {
            setAnalyse(enonceRetrouve);
            setEnonceConfirme(true);
            setCorrectionDisponible(true);
            setProfesseurDisponible(lecture?.statut === "terminee" ? (lecture.corps as DepotExerciceReponse | null)?.professeur_disponible === true : false);
            setCorrectionTacheId(correction.id);
          }
          return;
        }
        if (lecture && !tacheVue(lecture.id)) {
          if (lecture.statut === "expiree") {
            planifierVue(lecture.id);
            setErreurEnvoi({ messages: [MESSAGE_RESULTAT_EXPIRE], sessionExpiree: false });
            return;
          }
          envoiVerrou.current = true;
          setPhase("analyse");
          setEnvoiEnCours(true);
          try {
            const resultat = await attendreTache<DepotExerciceReponse>(lecture.id);
            if (!annule) appliquerReponse(resultat);
          } catch (error) {
            if (!annule) setErreurEnvoi(decrireErreurDepot(error));
          } finally {
            envoiVerrou.current = false;
            if (!annule) setEnvoiEnCours(false);
          }
        }
      } catch {
        /* rien à reprendre, ou réseau indisponible : le dépôt normal reste possible */
      }
    })();
    return () => {
      annule = true;
    };
  }, [programmeId]);

  async function soumettre(remarque?: string) {
    if (envoiVerrou.current || !aContenu) return;
    envoiVerrou.current = true;
    setPhase("envoi");
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
      appliquerReponse(reponse);
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

  if (seanceRetrouvee && !analyse) {
    return <ProfesseurParticulier programmeId={programmeId} seanceInitiale={seanceRetrouvee} />;
  }

  if (analyse) {
    return (
      <AnalyseEnonce
        correctionTacheId={correctionTacheId}
        seanceInitiale={seanceRetrouvee}
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
    <div className="flex min-w-0 flex-col gap-5">
      {/* Verrouille tous les champs pendant l'envoi (fieldset disabled) */}
      <fieldset disabled={envoiEnCours} className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0">
        {/* 1. Ajoute ton exercice */}
        <section aria-labelledby="titre-ajout" className={CARTE}>
          <EnteteEtape
            numero={1}
            fond="bg-[#1D4ED8]"
            id="titre-ajout"
            titre="Ajoute ton exercice"
            texte="Prends une photo, importe une ou plusieurs images, ou un fichier PDF, puis saisis l'énoncé si nécessaire."
          />

          {/* Zone d'importation : glisser-déposer + boutons. Le dépôt passe par
              ajouterFichiers, donc par EXACTEMENT les mêmes règles de validation
              que les boutons. */}
          <div
            onDragOver={(event) => {
              event.preventDefault();
              if (!envoiEnCours) setDragActif(true);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragActif(false);
            }}
            onDrop={handleDepot}
            className={`mt-5 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors sm:py-10 ${
              dragActif ? "border-[#1D4ED8] bg-blue-100/70" : "border-[#60A5FA] bg-[#F5F9FF]"
            }`}
          >
            <span
              aria-hidden="true"
              className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#DBEAFE] text-[#1D4ED8]"
            >
              <IconCloudUpload size={50} stroke={1.5} />
            </span>
            <p className="text-lg font-extrabold text-[#102A66] sm:text-2xl">Glisse-dépose tes fichiers ici</p>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Images : JPG, PNG ou WebP, {NB_MAX_IMAGES} maximum · PDF : un seul · {TAILLE_MAX_FICHIER_OCTETS / MO} Mo
              maximum par fichier ({TAILLE_MAX_TOTAL_OCTETS / MO} Mo au total).
            </p>

            <div className="flex w-full max-w-md flex-row gap-3 sm:w-auto sm:max-w-none">
              <button
                type="button"
                onClick={() => entreeCamera.current?.click()}
                disabled={pdf !== null || placesRestantes <= 0}
                className={BOUTON_ACTION}
              >
                <IconCamera size={24} stroke={1.9} aria-hidden="true" />
                {images.length > 0 ? "Autre photo" : "Photo"}
              </button>
              <button type="button" onClick={() => entreeImport.current?.click()} className={BOUTON_ACTION}>
                <IconPhoto size={24} stroke={1.9} aria-hidden="true" />
                Importer
              </button>
            </div>
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
            <ul role="alert" className="mt-4 flex flex-col gap-1 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {erreurs.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}

          {nbFichiers > 0 && (
            <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-[#102A66] sm:text-lg">Fichiers ajoutés ({nbFichiers})</h3>
                {images.length > 0 && (
                  <p className="text-sm text-slate-600">
                    {placesRestantes} place{placesRestantes > 1 ? "s" : ""} restante{placesRestantes > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {images.length > 0 && (
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {images.map((image, index) => (
                    <li
                      key={image.id}
                      className="relative flex flex-col overflow-hidden rounded-2xl border border-blue-100 bg-[#F8FAFF]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- URL d'objet locale (blob:), next/image n'est pas applicable */}
                      <img
                        src={image.apercuUrl}
                        alt={`Page ${index + 1} de l'exercice`}
                        className="aspect-[3/4] w-full bg-fh-sable/40 object-cover"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-2 top-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-[#1D4ED8] px-2 text-sm font-extrabold text-white shadow"
                      >
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => supprimerImage(image.id)}
                        aria-label={`Supprimer la page ${index + 1}`}
                        className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#C2410C] shadow ring-1 ring-blue-100 transition-colors hover:bg-orange-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
                      >
                        <IconX size={20} aria-hidden="true" />
                      </button>
                      <div className="min-w-0 px-3 py-2">
                        <p className="break-all text-sm font-bold text-[#102A66]">Page {index + 1} · {image.fichier.name}</p>
                        <p className="text-xs text-slate-600">{formaterTaille(image.fichier.size)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {pdf && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-blue-100 bg-[#F8FAFF] px-3 py-3">
                  <span
                    aria-hidden="true"
                    className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-[#1D4ED8] px-2 text-sm font-extrabold text-white"
                  >
                    1
                  </span>
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#C2410C]"
                    aria-hidden="true"
                  >
                    <IconFileTypePdf size={28} stroke={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-all text-sm font-bold text-[#102A66]">{pdf.name}</p>
                    <p className="text-xs text-slate-600">PDF · {formaterTaille(pdf.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPdf(null);
                      setErreurs([]);
                    }}
                    aria-label="Retirer le PDF"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#C2410C] shadow ring-1 ring-blue-100 transition-colors hover:bg-orange-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
                  >
                    <IconX size={20} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="enonce" className="mb-2 block text-lg font-extrabold text-[#102A66] sm:text-xl">
              Ou écris ton énoncé
            </label>
            <textarea
              id="enonce"
              value={enonce}
              onChange={(event) => setEnonce(event.target.value.slice(0, LONGUEUR_MAX_ENONCE))}
              rows={7}
              placeholder="Recopie ici le texte de ton exercice…"
              className="w-full rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-base text-[#102A66] outline-none transition-shadow placeholder:text-slate-400 focus:border-[#1D4ED8] focus:ring-4 focus:ring-[#1D4ED8]/15"
            />
            <p className="mt-1 text-right text-sm text-slate-500">
              {enonce.length} / {LONGUEUR_MAX_ENONCE}
            </p>
          </div>

          {aContenu && (
            <button
              type="button"
              onClick={recommencer}
              className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 text-base font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
            >
              <IconRefresh size={20} aria-hidden="true" />
              Tout recommencer
            </button>
          )}
        </section>

        {/* 2. Choisis ton mode d'aide */}
        <section aria-labelledby="titre-mode" className={CARTE}>
          <EnteteEtape numero={2} fond="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]" id="titre-mode" titre="Choisis ton mode d'aide" />
          <div role="radiogroup" aria-labelledby="titre-mode" className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {MODES_RESOLUTION.map((option) => {
              const actif = mode === option.valeur;
              const { couleur, teinte, icone: Icone } = IDENTITES_MODES[option.valeur];
              return (
                <label
                  key={option.valeur}
                  style={{
                    borderColor: actif ? couleur : melangeBlanc(couleur, 40),
                    backgroundColor: actif ? teinte : "#FFFFFF",
                  }}
                  className={`flex h-full min-h-24 min-w-0 cursor-pointer items-center gap-2.5 rounded-2xl border-2 p-3 transition-shadow sm:gap-4 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-[#102A66] sm:p-5 ${
                    actif ? "shadow-lg" : "shadow-sm hover:shadow-md"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode-resolution"
                    value={option.valeur}
                    checked={actif}
                    onChange={() => setMode(option.valeur)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: couleur }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white sm:h-[72px] sm:w-[72px]"
                  >
                    <Icone size={30} stroke={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-extrabold text-[#102A66] sm:text-xl">{option.titre}</span>
                    <span className="mt-0.5 block break-words text-sm text-slate-600 sm:text-base">{option.description}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    style={actif ? { backgroundColor: couleur, borderColor: couleur } : { borderColor: melangeBlanc(couleur, 55) }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-white sm:h-8 sm:w-8"
                  >
                    {actif && <IconCheck size={20} stroke={3} />}
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      </fieldset>

      {/* Soumettre */}
      <div className="flex flex-col gap-2">
        {erreurEnvoi && (
          <div role="alert" className="flex flex-col gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
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
          className="inline-flex min-h-[54px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED] px-8 text-lg font-extrabold text-white shadow-lg transition-[filter,box-shadow] hover:brightness-110 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:brightness-100 sm:text-xl"
        >
          <IconSend size={26} stroke={2} aria-hidden="true" />
          {envoiEnCours ? (phase === "analyse" ? "Analyse en cours…" : "Envoi en cours…") : "Soumettre"}
        </button>
        <p id="aide-soumission" className="text-center text-sm text-slate-600">
          {envoiEnCours
            ? phase === "analyse"
              ? "fahimta ai lit ton exercice (jusqu'à 2 minutes). Ne ferme pas la page."
              : "Envoi de ton exercice. Ne ferme pas la page."
            : aContenu
              ? "Ton exercice sera envoyé pour vérification."
              : "Ajoute une photo, un fichier ou ton énoncé pour soumettre."}
        </p>
      </div>
    </div>
  );
}

/** En-tête d'une grande carte : numéro dans un cercle coloré, titre, texte d'aide facultatif. */
function EnteteEtape({ numero, fond, id, titre, texte }: { numero: number; fond: string; id: string; titre: string; texte?: string }) {
  return (
    <div className="flex items-start gap-4">
      <span
        aria-hidden="true"
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl font-extrabold text-white ${fond}`}
      >
        {numero}
      </span>
      <div className="min-w-0">
        <h2 id={id} className="text-xl font-extrabold text-[#102A66] sm:text-2xl">
          {titre}
        </h2>
        {texte && <p className="mt-1 text-sm text-slate-600 sm:text-base">{texte}</p>}
      </div>
    </div>
  );
}
