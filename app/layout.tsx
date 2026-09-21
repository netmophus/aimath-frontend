import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import PwaServiceWorker from "@/components/PwaServiceWorker";
import "./globals.css";
// CSS de KaTeX importé une seule fois ici : sert au rendu Markdown+LaTeX
// (RenduMarkdown) partout dans l'app, admin comme élève plus tard.
import "katex/dist/katex.min.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// theme-color/color-scheme vivent dans `viewport`, pas `metadata`, depuis
// Next 14 (voir generateViewport dans la doc embarquée) — fh-bleu colore la
// barre de statut Android/iOS quand l'app est installée.
export const viewport: Viewport = {
  themeColor: "#1E2B6A",
};

export const metadata: Metadata = {
  title: "fahimtana — aide scolaire",
  description: "Cours, exercices et leçons du programme du Niger.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/fahimta.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "fahimtana",
    statusBarStyle: "black-translucent",
  },
  other: {
    // iOS plus anciens (avant l'adoption du nom standard) ne reconnaissent
    // que ce nom préfixé ; Next n'expose que le nom moderne via appleWebApp,
    // donc celui-ci est ajouté à la main pour couvrir les deux.
    "apple-mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <PwaServiceWorker />
      </body>
    </html>
  );
}
