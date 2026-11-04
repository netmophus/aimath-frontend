import DetailDemande from "@/components/eleve/aide/DetailDemande";

export default async function DemandePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numero = Number(id);
  return Number.isInteger(numero) && numero > 0 ? <DetailDemande id={numero} /> : <p className="p-4">Demande introuvable.</p>;
}
