import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "./RegisterForm";

interface ChiffreCle {
  valeur: string;
  legende: string;
}

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
        <div className="flex items-start gap-6">
          {CHIFFRES_CLES.map((chiffre) => (
            <div key={chiffre.legende}>
              <p className="text-[26px] font-semibold text-fh-orange-clair">
                {chiffre.valeur}
              </p>
              <p className="mt-1 text-[11px] text-fh-accent/70">{chiffre.legende}</p>
            </div>
          ))}
        </div>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
