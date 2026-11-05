import type { Metadata } from "next";

import AuthLayout from "@/components/auth/AuthLayout";
import FormulaireMotDePasseOublie from "./FormulaireMotDePasseOublie";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function MotDePasseOubliePage() {
  return (
    <AuthLayout title="Pas de souci" subtitle="Récupère l'accès à ton compte en quelques instants, avec un code reçu par SMS.">
      <FormulaireMotDePasseOublie />
    </AuthLayout>
  );
}
