import { SEUIL_REDUCTION_OCTETS, TAILLE_MAX_IMAGE_ENVOYEE_OCTETS } from "./resoudre";

const COTE_MAX_PX = 2200;

function chargerImage(fichier: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichier);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image illisible"));
    };
    image.src = url;
  });
}

function versBlob(canvas: HTMLCanvasElement, qualite: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", qualite));
}

/**
 * Prépare une image pour l'envoi : au-dessus de ~3,5 Mo (une photo de téléphone
 * fait souvent 4 à 8 Mo), elle est redessinée en JPEG sur 2200 px maximum, ce
 * qui reste très lisible pour un énoncé. Les images légères et les PDF passent
 * tels quels. Lève une erreur si l'image reste trop lourde ou illisible.
 */
export async function preparerImage(fichier: File): Promise<File> {
  if (!fichier.type.startsWith("image/") || fichier.size <= SEUIL_REDUCTION_OCTETS) return fichier;

  const image = await chargerImage(fichier);
  const echelle = Math.min(1, COTE_MAX_PX / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * echelle));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * echelle));
  const contexte = canvas.getContext("2d");
  if (!contexte) throw new Error("canvas indisponible");
  contexte.fillStyle = "#ffffff"; // un PNG transparent ne doit pas devenir noir en JPEG
  contexte.fillRect(0, 0, canvas.width, canvas.height);
  contexte.drawImage(image, 0, 0, canvas.width, canvas.height);

  for (const qualite of [0.85, 0.7, 0.55]) {
    const blob = await versBlob(canvas, qualite);
    if (blob && blob.size <= TAILLE_MAX_IMAGE_ENVOYEE_OCTETS) {
      const nom = fichier.name.replace(/\.[^.]+$/, "") + ".jpg";
      return new File([blob], nom, { type: "image/jpeg", lastModified: Date.now() });
    }
  }
  throw new Error("image trop lourde");
}
