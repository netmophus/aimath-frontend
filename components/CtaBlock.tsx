import Link from "next/link";

export default function CtaBlock() {
  return (
    <section className="bg-fh-bleu text-fh-creme">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Prêt à progresser dès aujourd&apos;hui ?
        </h2>
        <p className="max-w-xl text-fh-creme/80">
          Crée ton compte gratuitement et retrouve tous les cours de ta classe
          en quelques secondes.
        </p>
        <Link
          href="/register"
          className="rounded-full bg-fh-orange px-8 py-3 text-sm font-semibold text-fh-creme transition-colors hover:bg-fh-orange-fonce sm:text-base"
        >
          Créer un compte
        </Link>
      </div>
    </section>
  );
}
