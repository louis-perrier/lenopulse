import { legalContent } from "@/lib/legal";
import type { Locale } from "@/lib/i18n/types";
import { locales } from "@/lib/i18n/config";
import LegalPage from "@/components/LegalPage";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function MentionsLegales({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const content = legalContent[(lang as Locale) ?? "fr"].mentions;
  return <LegalPage lang={lang} content={content} />;
}
