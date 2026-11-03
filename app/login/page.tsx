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
        <ul className="flex flex-col gap-5">
          {ATOUTS.map((atout) => {
            const Icon = atout.icon;
            return (
              <li key={atout.label} className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <Icon size={28} stroke={1.75} color="white" aria-hidden="true" />
                </span>
                <span className="text-lg font-medium text-white">{atout.label}</span>
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
