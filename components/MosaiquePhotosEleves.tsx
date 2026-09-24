import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

interface PhotoEleve {
  fichier: string;
  alt: string;
}

/**
 * Chemins ATTENDUS des 5 photos d'élèves (à déposer dans public/eleves/,
 * exactement ces noms de fichier) — voir MosaiquePhotosEleves ci-dessous :
 * tant qu'un fichier n'existe pas, un placeholder fh-sable s'affiche à sa
 * place, en indiquant le chemin attendu.
 */
const PHOTOS: readonly PhotoEleve[] = [
  { fichier: "eleve1.jpg", alt: "Élève de Fahimta en train d'étudier" },
  { fichier: "eleve2.jpg", alt: "Élève de Fahimta en train d'étudier" },
  { fichier: "eleve3.jpg", alt: "Élève de Fahimta en train d'étudier" },
  { fichier: "eleve4.jpg", alt: "Élève de Fahimta en train d'étudier" },
  { fichier: "eleve5.jpg", alt: "Élève de Fahimta en train d'étudier" },
];

const DOSSIER = "eleves";

/**
 * Mosaïque de 5 photos d'élèves sous le hero d'accueil (voir
 * components/HeroCarousel.tsx, qui la reçoit en prop `mosaique` — même
 * convention que Logo.tsx/MarqueEleve.tsx passés en prop `logo` aux layouts
 * admin/élève : un composant SERVEUR, qui lit le système de fichiers, ne
 * doit jamais être importé depuis un fichier "use client").
 *
 * Chaque photo est vérifiée individuellement avec node:fs : si le fichier
 * public/eleves/eleveN.jpg existe déjà, il est affiché ; sinon, un
 * placeholder fh-sable prend sa place, avec le chemin exact attendu écrit
 * dessus. Dès qu'une vraie photo est déposée à ce chemin, elle remplace
 * automatiquement le placeholder — aucune modification de code nécessaire.
 */
export default function MosaiquePhotosEleves() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {PHOTOS.map((photo) => {
        const cheminPublic = `${DOSSIER}/${photo.fichier}`;
        const cheminDisque = path.join(process.cwd(), "public", cheminPublic);
        const existe = fs.existsSync(cheminDisque);

        return (
          <div key={photo.fichier} className="aspect-square overflow-hidden rounded-2xl bg-fh-sable">
            {existe ? (
              <Image
                src={`/${cheminPublic}`}
                alt={photo.alt}
                width={220}
                height={220}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
                <span className="text-2xl" aria-hidden="true">
                  🧑‍🎓
                </span>
                <span className="break-all text-[10px] font-medium leading-tight text-fh-ardoise/50">
                  public/{cheminPublic}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
