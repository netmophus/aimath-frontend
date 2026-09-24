import { NextResponse, type NextRequest } from "next/server";

/**
 * Relais manuel de /api/* vers le backend Django local — TEST NGROK
 * (réversible, voir next.config.ts et .env.local).
 *
 * Choisi à la place d'un `rewrites()` classique : constaté empiriquement que
 * le rewrite-vers-URL-externe de Next 16 retire le slash final AVANT l'appel
 * sortant, y compris avec une destination 100% statique portant le `/` en
 * dur (donc indépendamment de :path* et de skipTrailingSlashRedirect) — or
 * Django l'exige sur chacun de ses endpoints. Ce relais construit lui-même
 * la chaîne cible, sans passer par cette normalisation.
 *
 * Ne fait AUCUNE mise en cache et transmet le corps/les en-têtes tels
 * quels (dont Authorization) — ce n'est qu'un tuyau, pas une logique métier.
 */

const BACKEND = "http://127.0.0.1:8001";

async function relayer(request: NextRequest, contexte: { params: Promise<{ chemin: string[] }> }) {
  const { chemin } = await contexte.params;
  const url = new URL(request.url);
  const cible = `${BACKEND}/api/${chemin.join("/")}/${url.search}`;

  const entetes = new Headers(request.headers);
  entetes.delete("host");
  entetes.delete("content-length");

  const aUnCorps = !["GET", "HEAD"].includes(request.method);

  const reponse = await fetch(cible, {
    method: request.method,
    headers: entetes,
    body: aUnCorps ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });

  // On ne repasse pas tous les en-têtes de la réponse Django tels quels :
  // `fetch` a déjà décompressé un éventuel gzip, donc renvoyer un
  // `content-encoding`/`content-length` d'origine ferait planter le
  // décodage côté client. Content-Type suffit pour que le front interprète
  // correctement le JSON.
  const corps = await reponse.arrayBuffer();
  const enTetesReponse = new Headers();
  const typeContenu = reponse.headers.get("content-type");
  if (typeContenu) enTetesReponse.set("content-type", typeContenu);

  // Un statut "null body" (204/205/304, cas fréquent d'un DELETE réussi) ne
  // peut PAS porter de corps, même vide : `new NextResponse(corps, ...)`
  // lève sinon une TypeError ("Response with null body status cannot have
  // body"), que Next.js transforme en 500 générique côté navigateur — alors
  // que Django avait bien répondu 204. D'où un DELETE qui semble échouer
  // alors qu'il a réussi côté backend.
  const STATUTS_SANS_CORPS = new Set([101, 103, 204, 205, 304]);
  const corpsReponse = STATUTS_SANS_CORPS.has(reponse.status) ? null : corps;

  return new NextResponse(corpsReponse, { status: reponse.status, headers: enTetesReponse });
}

export { relayer as GET, relayer as POST, relayer as PUT, relayer as PATCH, relayer as DELETE };
