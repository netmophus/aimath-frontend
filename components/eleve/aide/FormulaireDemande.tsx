"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconPhotoPlus, IconSend, IconX } from "@tabler/icons-react";

import { ApiError } from "@/lib/api";
import {
  LIBELLE_TYPE,
  MESSAGE_MAX,
  TYPES,
  erreurImage,
  erreurMessage,
  libelleMatiere,
  messageNettoye,
  nouvelleCle,
  type TypeDemande,
} from "@/lib/aide";
import { creerDemande, leconsDeMatiere } from "@/lib/aideApi";
import { getMonProgramme, type ProgrammeEleve } from "@/lib/eleveApi";
import {
  BOUTON_CLAIR,
  BOUTON_MARINE,
  BOUTON_ORANGE,
  BoutonRetour,
  CARTE,
  CHAMP,
  COULEUR_TYPE,
  IconeType,
  LABEL,
  Message,
} from "./ui";

interface OptionLecon {
  id: number;
  titre: string;
}

export default function FormulaireDemande({ typeInitial }: { typeInitial: TypeDemande }) {
  const router = useRouter();
  const [type, setType] = useState<TypeDemande>(typeInitial);
  const [matieres, setMatieres] = useState<ProgrammeEleve[]>([]);
  const [erreurMatieres, setErreurMatieres] = useState<string | null>(null);
  const [programme, setProgramme] = useState("");
  // Les leçons sont rangées avec la matière dont elles viennent : changer de matière invalide les anciennes sans effet synchrone.
  const [chargees, setChargees] = useState<{ pour: string; liste: OptionLecon[] }>({ pour: "", liste: [] });
  const lecons = chargees.pour === programme ? chargees.liste : [];
  const leconsEnCours = programme !== "" && chargees.pour !== programme;
  const [lecon, setLecon] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [erreurImageMsg, setErreurImageMsg] = useState<string | null>(null);
  const [erreurMsg, setErreurMsg] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const verrou = useRef(false);
  const inputImage = useRef<HTMLInputElement>(null);
  // Même clé tant que le contenu ne change pas : un nouvel essai après coupure ne crée jamais de doublon.
  const cle = useRef(nouvelleCle());
  const modifie = () => {
    cle.current = nouvelleCle();
  };

  const apercu = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => () => { if (apercu) URL.revokeObjectURL(apercu); }, [apercu]);

  useEffect(() => {
    let actif = true;
    getMonProgramme()
      .then((m) => actif && setMatieres(m))
      .catch(() => actif && setErreurMatieres("Matières indisponibles. Tu peux quand même écrire ta demande."));
    return () => { actif = false; };
  }, []);

  // Les leçons viennent du programme choisi (données existantes) ; changer de matière remet la leçon à zéro.
  useEffect(() => {
    if (!programme) return;
    let actif = true;
    const matiere = matieres.find((m) => String(m.id) === programme)?.matiere.id;
    if (matiere === undefined) return;
    leconsDeMatiere(matiere)
      .then((liste) => actif && setChargees({ pour: programme, liste }))
      .catch(() => actif && setChargees({ pour: programme, liste: [] }));
    return () => { actif = false; };
  }, [programme, matieres]);

  function choisirImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!f) return;
    const err = erreurImage(f);
    setErreurImageMsg(err);
    if (!err) {
      setImage(f);
      modifie();
    }
  }

  function retirerImage() {
    setImage(null);
    setErreurImageMsg(null);
    modifie();
  }

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    if (verrou.current) return;
    const errMsg = erreurMessage(message);
    setErreurMsg(errMsg);
    setErreur(null);
    if (errMsg) return;
    verrou.current = true;
    setEnvoiEnCours(true);
    try {
      await creerDemande({
        cle: cle.current,
        type,
        programme: programme ? Number(programme) : null,
        lecon: programme && lecon ? Number(lecon) : null,
        message: messageNettoye(message),
        image,
      });
      // Confirmation affichée seulement après l'enregistrement réel (réponse du serveur).
      router.push("/eleve/aide/demandes?envoyee=1");
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Envoi impossible. Vérifie ta connexion et réessaie.");
      verrou.current = false;
      setEnvoiEnCours(false);
    }
  }

  return (
    <form onSubmit={envoyer} noValidate className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
      <BoutonRetour href="/eleve/aide" />
      <h1 className="text-3xl font-extrabold leading-tight text-[#102A66] sm:text-4xl">Nouvelle demande</h1>

      <fieldset className={CARTE}>
        <legend className="sr-only">Type de demande</legend>
        <p className={LABEL} aria-hidden="true">Type de demande</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-4">
          {TYPES.map((t) => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => { setType(t); modifie(); }}
                className="peer sr-only"
              />
              <span
                style={{ ["--c" as string]: COULEUR_TYPE[t] }}
                className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-blue-100 bg-white px-1 py-3 text-center text-sm font-extrabold text-[#102A66] transition-colors peer-checked:border-[var(--c)] peer-checked:bg-[var(--c)] peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#102A66] sm:text-lg"
              >
                <IconeType type={t} taille={32} />
                {LIBELLE_TYPE[t]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className={CARTE}>
          <label htmlFor="matiere" className={LABEL}>Matière</label>
          <select
            id="matiere"
            value={programme}
            onChange={(e) => { setProgramme(e.target.value); setLecon(""); modifie(); }}
            className={`${CHAMP} mt-3`}
          >
            <option value="">Aucune</option>
            {matieres.map((m) => (
              <option key={m.id} value={m.id}>{libelleMatiere(m.matiere.nom)}</option>
            ))}
          </select>
          {erreurMatieres && <p className="mt-2 text-sm text-slate-700">{erreurMatieres}</p>}
        </div>

        <div className={CARTE}>
          <label htmlFor="lecon" className={LABEL}>Leçon</label>
          <select
            id="lecon"
            value={lecon}
            onChange={(e) => { setLecon(e.target.value); modifie(); }}
            disabled={!programme || leconsEnCours}
            className={`${CHAMP} mt-3`}
          >
            <option value="">{programme ? (leconsEnCours ? "Chargement…" : "Aucune") : "Choisis d'abord une matière"}</option>
            {lecons.map((l) => (
              <option key={l.id} value={l.id}>{l.titre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={CARTE}>
        <label htmlFor="message" className={LABEL}>Ma demande</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => { setMessage(e.target.value); modifie(); if (erreurMsg) setErreurMsg(null); }}
          maxLength={MESSAGE_MAX}
          rows={6}
          placeholder="Écris ton message…"
          aria-invalid={erreurMsg ? true : undefined}
          aria-describedby={erreurMsg ? "message-erreur compteur" : "compteur"}
          className={`${CHAMP} mt-3 py-3`}
        />
        <div className="mt-2 flex items-start justify-between gap-3">
          {erreurMsg ? <p id="message-erreur" role="alert" className="text-base font-semibold text-red-800">{erreurMsg}</p> : <span />}
          <p id="compteur" className="shrink-0 text-sm font-semibold text-slate-700">{message.length} / {MESSAGE_MAX}</p>
        </div>
      </div>

      <div className={CARTE}>
        <p className={LABEL}>Pièce jointe</p>
        <input ref={inputImage} id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={choisirImage} className="sr-only" tabIndex={-1} />
        {apercu ? (
          <div className="mt-3 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={apercu} alt="Aperçu de l'image jointe" className="h-24 w-24 rounded-2xl object-cover ring-1 ring-blue-200" />
            <button type="button" onClick={retirerImage} className={BOUTON_CLAIR}>
              <IconX size={20} aria-hidden="true" />
              Retirer
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => inputImage.current?.click()} className={`${BOUTON_MARINE} mt-3 w-full sm:w-fit`}>
            <IconPhotoPlus size={22} aria-hidden="true" />
            Joindre une image
          </button>
        )}
        <p className="mt-2 text-sm text-slate-700">JPG, PNG ou WebP, 5 Mo max.</p>
        {erreurImageMsg && <p role="alert" className="mt-2 text-base font-semibold text-red-800">{erreurImageMsg}</p>}
      </div>

      {erreur && <Message ton="erreur">{erreur}</Message>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => router.push("/eleve/aide")} disabled={envoiEnCours} className={`${BOUTON_CLAIR} sm:min-w-40`}>
          Annuler
        </button>
        <button type="submit" disabled={envoiEnCours} className={`${BOUTON_ORANGE} min-h-14 text-lg sm:min-w-56`}>
          <IconSend size={22} aria-hidden="true" />
          {envoiEnCours ? "Envoi…" : "Envoyer"}
        </button>
      </div>
    </form>
  );
}
