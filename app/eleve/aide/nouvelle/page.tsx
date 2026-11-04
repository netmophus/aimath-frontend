import FormulaireDemande from "@/components/eleve/aide/FormulaireDemande";
import { typeValide } from "@/lib/aide";

export default async function NouvelleDemandePage({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const { type } = await searchParams;
  const initial = typeValide(Array.isArray(type) ? type[0] : type) ?? "question";
  // key : un changement de type dans l'URL repart d'un formulaire neuf.
  return <FormulaireDemande key={initial} typeInitial={initial} />;
}
