"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import { getAdminStats, type AdminStats } from "@/lib/adminApi";
import StatCard from "@/components/admin/StatCard";

function valeur(n: number | undefined): string {
  return n === undefined ? "—" : String(n);
}

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    let actif = true;

    getAdminStats()
      .then((data) => {
        if (actif) setStats(data);
      })
      .catch(() => {
        // Pas de blocage de la page si les stats échouent : elle reste
        // utilisable, les cartes affichent simplement "—".
        if (actif) setStats(null);
      });

    return () => {
      actif = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-fh-ardoise">
        Bienvenue, <span className="font-semibold text-fh-bleu">{user?.prenom}</span>.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Élèves" value={valeur(stats?.nb_eleves)} />
        <StatCard
          label="Comptes en attente"
          value={valeur(stats?.nb_en_attente)}
          href="/admin/validations"
        />
        <StatCard label="Leçons publiées" value={valeur(stats?.lecons_publiees)} />
        {/* L'API ne distingue pas encore les leçons "à valider" du total ;
            en attendant ce compteur dédié côté backend, la carte reste en
            placeholder plutôt que d'afficher un chiffre approximatif. */}
        <StatCard label="Leçons à valider" value="—" />
      </div>
    </div>
  );
}
