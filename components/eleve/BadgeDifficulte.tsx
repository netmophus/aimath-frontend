import type { ExerciceEleve } from "@/lib/eleveApi";

type Difficulte = ExerciceEleve["difficulte"];

interface BadgeDifficulteProps {
  difficulte: Difficulte;
}

const STYLES: Record<Difficulte, { label: string; classe: string }> = {
  facile: { label: "Facile", classe: "bg-green-100 text-green-700" },
  moyen: { label: "Moyen", classe: "bg-amber-100 text-amber-700" },
  difficile: { label: "Difficile", classe: "bg-red-100 text-red-700" },
};

export default function BadgeDifficulte({ difficulte }: BadgeDifficulteProps) {
  const { label, classe } = STYLES[difficulte];
  return (
    <span className={`inline-block shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>{label}</span>
  );
}
