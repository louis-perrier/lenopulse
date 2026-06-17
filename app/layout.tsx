import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
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
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <Motion>{children}</Motion>
      </body>
    </html>
  );
}
