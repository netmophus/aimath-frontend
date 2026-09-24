import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { IconUser } from "@tabler/icons-react";

interface EleveCercle {
  fichier: string;
  alt: string;
}

const DOSSIER = "eleves-cercles";

/**
 * Chemins ATTENDUS des 5 photos rondes (à déposer dans public/eleves-cercles/,
 * exactement ces noms de fichier) — tant qu'un fichier n'existe pas, un
 * placeholder (icône utilisateur) prend sa place, aucune modification de
 * code nécessaire une fois les vraies photos déposées.
 */
const ELEVES: readonly EleveCercle[] = [
  { fichier: "eleve1.jpg", alt: "Élève de Fahimta" },
  { fichier: "eleve2.jpg", alt: "Élève de Fahimta" },
  { fichier: "eleve3.jpg", alt: "Élève de Fahimta" },
  { fichier: "eleve4.jpg", alt: "Élève de Fahimta" },
  { fichier: "eleve5.jpg", alt: "Élève de Fahimta" },
];

/**
 * Rangée de 5 avatars ronds espacés, sous la section parcours de la page
 * d'accueil. Composant SERVEUR (lit le système de fichiers) — même
 * convention que MosaiquePhotosEleves.tsx : jamais importé depuis un
 * fichier "use client". unoptimized : évite la ré-encodage WebP/AVIF de
 * Next, qui a déjà produit un fichier cassé pour des photos similaires
 * (voir ClassesBand.tsx).
 */
export default function CerclesEleves() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {ELEVES.map((eleve) => {
        const cheminPublic = `${DOSSIER}/${eleve.fichier}`;
        const cheminDisque = path.join(process.cwd(), "public", cheminPublic);
        const existe = fs.existsSync(cheminDisque);

        return (
          <div
            key={eleve.fichier}
            className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-white bg-fh-sable"
          >
            {existe ? (
              <Image
                src={`/${cheminPublic}`}
                alt={eleve.alt}
                width={96}
                height={96}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-fh-ardoise/40">
                <IconUser size={40} stroke={1.5} aria-hidden="true" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
