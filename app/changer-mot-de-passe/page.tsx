import AuthLayout from "@/components/auth/AuthLayout";
import FormulaireChangerMotDePasse from "./FormulaireChangerMotDePasse";

/**
 * Page serveur : AuthLayout (et donc Logo.tsx, qui utilise node:fs) reste côté serveur ; tout l'interactif est
 * dans FormulaireChangerMotDePasse (composant client).
 */
export default function ChangerMotDePassePage() {
  return (
    <AuthLayout title="Sécurisons ton compte" subtitle="Ton mot de passe a été réinitialisé. Choisis-en un nouveau pour continuer.">
      <FormulaireChangerMotDePasse />
    </AuthLayout>
  );
}
