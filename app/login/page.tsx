import { IconAdjustmentsHorizontal, IconBook2, IconWifiOff, type TablerIcon } from "@tabler/icons-react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "./LoginForm";

interface Atout {
  label: string;
  icon: TablerIcon;
}

const ATOUTS: readonly Atout[] = [
  { label: "Cours complets et corrigés", icon: IconBook2 },
  { label: "Simulations interactives", icon: IconAdjustmentsHorizontal },
  { label: "Accessible hors connexion", icon: IconWifiOff },
];

export default function LoginPage() {
  return (
    <AuthLayout
      title="Bon retour !"
      subtitle="Connecte-toi pour continuer ton apprentissage."
      panneauRiche={
        <ul className="flex flex-col gap-4">
          {ATOUTS.map((atout) => {
            const Icon = atout.icon;
            return (
              <li key={atout.label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon size={18} stroke={1.75} color="white" aria-hidden="true" />
                </span>
                <span className="text-sm text-fh-accent">{atout.label}</span>
              </li>
            );
          })}
        </ul>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
