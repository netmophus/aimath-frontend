import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/lib/auth";
import PwaServiceWorker from "@/components/PwaServiceWorker";
import "./globals.css";
// CSS de KaTeX importé une seule fois ici : sert au rendu Markdown+LaTeX
// (RenduMarkdown) partout dans l'app, admin comme élève plus tard.
import "katex/dist/katex.min.css";

// Polices auto-hébergées (next/font/local) plutôt que next/font/google :
// le build cassait sur la résolution interne de next/font/google sous
// Turbopack ("Can't resolve @vercel/turbopack-next/internal/font/google/font"),
// et l'app doit de toute façon fonctionner hors-ligne (PWA) sans dépendre de
// fonts.gstatic.com au runtime ni au build. Fichiers .woff2 dans app/fonts/ —
// EXACTEMENT les mêmes que next/font/google aurait servis pour Geist/Geist
// Mono : extraits du paquet officiel Vercel "geist" (police variable,
// poids 100-900 en un seul fichier), donc rendu strictement identique.
// Mêmes noms de variable CSS qu'avant (--font-geist-sans/--font-geist-mono)
// pour ne rien changer à app/globals.css.
const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  adjustFontFallback: false,
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
});

// theme-color/color-scheme vivent dans `viewport`, pas `metadata`, depuis
// Next 14 (voir generateViewport dans la doc embarquée) — fh-bleu colore la
// barre de statut Android/iOS quand l'app est installée.
export const viewport: Viewport = {
  themeColor: "#1E2B6A",
};

export const metadata: Metadata = {
  title: "Fahimta — aide scolaire",
  description: "Cours, exercices et leçons du programme du Niger.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/fahimta.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Fahimta",
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
