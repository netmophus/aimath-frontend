import type { Metadata } from "next";

import ConnexionLayout from "@/components/auth/ConnexionLayout";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Se connecter" };

export default function LoginPage() {
  return (
    <ConnexionLayout>
      <LoginForm />
    </ConnexionLayout>
  );
}
