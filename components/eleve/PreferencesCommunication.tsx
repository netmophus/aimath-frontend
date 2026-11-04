"use client";

import { useEffect, useRef, useState } from "react";
import { IconBellRinging } from "@tabler/icons-react";

import { ApiError } from "@/lib/api";
import { accordParentalRequis, messageInvitation } from "@/lib/preferencesCommunication";
import { getMesPreferences, majMesPreferences, type MesPreferences } from "@/lib/preferencesCommunicationApi";

const CARTE = "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-blue-100 sm:p-6";
const CHAMP =
  "min-h-12 w-full rounded-2xl border-2 border-blue-200 bg-white px-4 text-base text-[#102A66] outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-[#1D4ED8]/15";

function Interrupteur({ id, libelle, aide, coche, desactive, onChange }: { id: string; libelle: string; aide: string; coche: boolean; desactive: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-base font-bold text-[#102A66]">{libelle}</label>
        <p id={`${id}-aide`} className="text-sm text-slate-700">{aide}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={coche}
        disabled={desactive}
        aria-describedby={`${id}-aide`}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-7 w-12 shrink-0 cursor-pointer accent-[#1D4ED8] disabled:cursor-not-allowed"
      />
    </div>
  );
}

/** Section compacte de Mon profil : l'élève ne voit et ne modifie que ses propres préférences. */
export default function PreferencesCommunication() {
  const [prefs, setPrefs] = useState<MesPreferences | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [tel, setTel] = useState("");
  const verrou = useRef(false);

  useEffect(() => {
    let actif = true;
    getMesPreferences()
      .then((p) => actif && setPrefs(p))
      .catch((e) => actif && setErreur(e instanceof ApiError ? e.message : "Impossible de charger tes préférences."));
    return () => {
      actif = false;
    };
  }, []);

  async function envoyer(d: Parameters<typeof majMesPreferences>[0], ok: string) {
    if (verrou.current) return;
    verrou.current = true;
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      setPrefs(await majMesPreferences(d));
      setMessage(ok);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : "Enregistrement impossible.");
    } finally {
      verrou.current = false;
      setEnCours(false);
    }
  }

  return (
    <section aria-labelledby="titre-prefs-com" className={`${CARTE} flex flex-col gap-4`}>
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1D4ED8] text-white shadow-sm">
          <IconBellRinging size={30} stroke={1.8} />
        </span>
        <h2 id="titre-prefs-com" className="text-lg font-extrabold text-[#102A66]">Mes préférences de communication</h2>
      </div>

      {!prefs && !erreur && <div className="h-24 animate-pulse rounded-2xl bg-fh-sable/50" aria-busy="true" aria-label="Chargement" />}

      {prefs && (
        <>
          <Interrupteur
            id="pref-sms"
            libelle="Informations par SMS"
            aide="Nouveautés et informations facultatives. Les messages liés à ton compte (activation) restent envoyés."
            coche={prefs.sms_facultatifs}
            desactive={enCours}
            onChange={(v) => envoyer({ sms_facultatifs: v }, v ? "Tu recevras les informations par SMS." : "Tu ne recevras plus d'informations facultatives par SMS.")}
          />
          <hr className="border-blue-100" />
          <Interrupteur
            id="pref-wa"
            libelle="Invitations aux groupes WhatsApp"
            aide="Un SMS peut t'inviter à rejoindre un groupe. Ton numéro peut être visible des autres membres. Tu n'es jamais ajouté automatiquement."
            coche={prefs.invitations_whatsapp === true}
            desactive={enCours}
            onChange={(v) => envoyer({ invitations_whatsapp: v }, v ? "Invitations acceptées." : "Invitations refusées.")}
          />
          <p data-testid="etat-invitation" className="rounded-2xl bg-[#F8FAFF] px-4 py-3 text-sm font-semibold text-[#102A66] ring-1 ring-blue-100">
            {messageInvitation(prefs)}
          </p>

          {accordParentalRequis(prefs) && prefs.majorite === "mineur" && (prefs.parental_statut === "aucun" || prefs.parental_statut === "refuse") && (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (tel.trim()) envoyer({ parental_telephone: tel.trim() }, "Demande envoyée : FAHIMTA va vérifier auprès de ton parent.");
              }}
              className="flex flex-col gap-2"
            >
              <label htmlFor="pref-parent" className="text-base font-bold text-[#102A66]">Numéro de ton parent ou tuteur</label>
              <input id="pref-parent" type="tel" inputMode="tel" autoComplete="off" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Ex. 96 00 00 00" className={CHAMP} />
              <p className="text-sm text-slate-700">FAHIMTA contactera ce numéro pour vérifier l&apos;accord. Il ne sert à rien d&apos;autre.</p>
              <button
                type="submit"
                disabled={enCours || !tel.trim()}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#C2410C] px-6 text-base font-bold text-white transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
              >
                Demander la vérification
              </button>
            </form>
          )}
          {prefs.parental_statut === "demande" && prefs.parental_telephone && (
            <p className="text-sm text-slate-700">Contact indiqué : {prefs.parental_telephone}</p>
          )}
        </>
      )}

      {message && <p role="status" className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 ring-1 ring-green-200">{message}</p>}
      {erreur && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">{erreur}</p>}
    </section>
  );
}
