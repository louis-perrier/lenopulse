"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { locales, localeShortNames } from "@/lib/i18n/config";

// Bascule FR / EN / ES en conservant la section courante (via le hash d'ancre).
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const params = useParams();
  const current = (params?.lang as string) ?? "fr";
  const [hash, setHash] = useState("");

  useEffect(() => {
    const update = () => setHash(window.location.hash || "");
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {locales.map((l) => {
        const active = l === current;
        return (
          <a
            key={l}
            href={`/${l}/${hash}`}
            aria-current={active ? "true" : undefined}
            className={`rounded-md px-2 py-1 text-xs font-semibold tracking-wide transition-colors ${
              active ? "text-primary" : "text-ink-soft hover:text-ink"
            }`}
          >
            {localeShortNames[l]}
          </a>
        );
      })}
    </div>
  );
}
