import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/types";
import { siteConfig } from "@/lib/site";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Skills from "@/components/Skills";
import Process from "@/components/Process";
import CaseStudies from "@/components/CaseStudies";
import About from "@/components/About";
import FinalCta from "@/components/FinalCta";
import Assistant from "@/components/Assistant";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MobileCtaBar from "@/components/MobileCtaBar";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = getDictionary(lang as Locale);

  // Donnees structurees (schema.org) pour le referencement et les resultats enrichis.
  const base = "https://lenopulse.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "LENOPULSE",
    description: dict.meta.description,
    url: `${base}/${lang}/`,
    email: siteConfig.contactEmail,
    telephone: "+33781494953",
    image: `${base}/opengraph-image.png`,
    areaServed: "FR",
    availableLanguage: ["fr", "en", "es"],
    founder: { "@type": "Person", name: "Louis Perrier" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "7 allée Jean-Baptiste Fourier",
      postalCode: "44300",
      addressLocality: "Nantes",
      addressCountry: "FR",
    },
    sameAs: Object.values(siteConfig.socials).filter((u) => u && u !== "#"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav lang={lang} dict={dict} />
      <main>
        <Hero dict={dict} />
        <Problem dict={dict} />
        <Skills dict={dict} />
        <Process dict={dict} />
        <CaseStudies dict={dict} />
        <About dict={dict} />
        <FinalCta dict={dict} />
        <Assistant lang={lang} dict={dict} />
        <Contact dict={dict} />
      </main>
      <Footer lang={lang} dict={dict} />
      <MobileCtaBar dict={dict} />
    </>
  );
}
