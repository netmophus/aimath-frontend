import type { Metadata } from "next";

import ConnexionLayout from "@/components/auth/ConnexionLayout";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = { title: "Créer un compte élève" };

export default function RegisterPage() {
  return (
    <ConnexionLayout lienRetour={{ href: "/login", libelle: "Retour à la connexion" }} largeur="large" sloganTresPetitEcran={false}>
      <RegisterForm />
    </ConnexionLayout>
  );
}
