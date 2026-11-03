import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "./RegisterForm";

interface ChiffreCle {
  valeur: string;
  legende: string;
}

// Indicateurs purement visuels (pas de données backend) : 7 niveaux = 6e, 5e, 4e,
// 3e, 2nde, 1ère, Terminale ; programme officiel du Niger ; PWA accessible hors connexion.
const CHIFFRES_CLES: readonly ChiffreCle[] = [
  { valeur: "7", legende: "niveaux" },
  { valeur: "100%", legende: "officiel" },
  { valeur: "24/7", legende: "partout" },
];

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Rejoins Fahimta"
      subtitle="Crée ton compte et accède à tout le programme officiel du Niger."
      panneauRiche={
        <div className="flex items-start gap-4">
          {CHIFFRES_CLES.map((chiffre) => (
            <div key={chiffre.legende} className="min-w-[96px] rounded-2xl bg-white/15 px-5 py-4 ring-1 ring-white/20">
              <p className="text-3xl font-bold text-white">{chiffre.valeur}</p>
              <p className="mt-1 text-sm text-white/85">{chiffre.legende}</p>
            </div>
          ))}
        </div>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
