import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { locales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/types";
import LangSync from "@/components/LangSync";

// Genere /fr, /en, /es en statique. Toute autre valeur renvoie 404.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang as Locale);

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      languages: {
        fr: "/fr",
        en: "/en",
        es: "/es",
      },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      type: "website",
    },
    // L'image de partage est fournie par app/opengraph-image.tsx (convention de
    // fichier), reprise ici pour og:image et twitter:image.
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <>
      <LangSync lang={lang} />
      {children}
    </>
  );
}
