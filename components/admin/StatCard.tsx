import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string;
  /** Si fourni, toute la carte devient un lien (ex. vers /admin/validations). */
  href?: string;
}

export default function StatCard({ label, value, href }: StatCardProps) {
  const contenu = (
    <>
      <p className="text-sm font-medium text-fh-ardoise">{label}</p>
      <p className="mt-2 text-3xl font-bold text-fh-bleu">{value}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-fh-sable transition-colors hover:ring-fh-orange/50"
      >
        {contenu}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-fh-sable">{contenu}</div>
  );
}
