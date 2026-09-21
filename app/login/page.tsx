import Link from "next/link";
import Logo from "@/components/Logo";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-fh-creme px-4 py-12 sm:px-6">
      <Link href="/" className="mb-8 text-fh-bleu">
        <Logo />
      </Link>
      <LoginForm />
    </main>
  );
}
