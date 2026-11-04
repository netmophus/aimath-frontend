import ListeDemandes from "@/components/eleve/aide/ListeDemandes";

export default async function MesDemandesPage({ searchParams }: { searchParams: Promise<{ envoyee?: string | string[] }> }) {
  const { envoyee } = await searchParams;
  return <ListeDemandes envoyee={envoyee === "1"} />;
}
