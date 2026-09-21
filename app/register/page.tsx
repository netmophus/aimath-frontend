import Link from "next/link";
import Logo from "@/components/Logo";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-fh-creme px-4 py-12 sm:px-6">
      <Link href="/" className="mb-4 text-fh-bleu">
        <Logo />
      </Link>
      <RegisterForm />
    </main>
  );
}
