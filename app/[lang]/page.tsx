import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/types";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Skills from "@/components/Skills";
import Process from "@/components/Process";
import CaseStudies from "@/components/CaseStudies";
import About from "@/components/About";
import FinalCta from "@/components/FinalCta";
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

  return (
    <>
      <Nav lang={lang} dict={dict} />
      <main>
        <Hero dict={dict} />
        <Problem dict={dict} />
        <Skills dict={dict} />
        <Process dict={dict} />
        <CaseStudies dict={dict} />
        <About dict={dict} />
        <FinalCta dict={dict} />
        <Contact dict={dict} />
      </main>
      <Footer lang={lang} dict={dict} />
      <MobileCtaBar dict={dict} />
    </>
  );
}
