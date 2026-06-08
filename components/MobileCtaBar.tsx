"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/types";
import { IconArrow } from "./Icons";

// Barre d'appel a l'action collee en bas d'ecran, sur mobile uniquement.
// Apparait apres un debut de scroll et se masque pres de la section contact.
export default function MobileCtaBar({ dict }: { dict: Dictionary }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const contact = document.getElementById("contact");
      const nearContact = contact
        ? contact.getBoundingClientRect().top < window.innerHeight * 0.9
        : false;
      setVisible(window.scrollY > 480 && !nearContact);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 p-4 transition-all duration-300 md:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <a
        href="#contact"
        className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-background shadow-lg shadow-black/40"
      >
        {dict.hero.ctaPrimary}
        <IconArrow className="h-4 w-4" />
      </a>
    </div>
  );
}
