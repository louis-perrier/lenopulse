import type { Metadata } from "next";
import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import Motion from "@/components/Motion";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Police a chasse fixe, utilisee par la page /portfolio pour les donnees
// techniques (stack, chiffres, etiquettes).
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LENOPULSE",
  description: "Sites, applications et IA qui travaillent pour vous.",
  metadataBase: new URL("https://lenopulse.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable} ${plexMono.variable}`}>
      <body>
        <Motion>{children}</Motion>
      </body>
    </html>
  );
}
