"use client";

import { useEffect } from "react";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

// Page racine "/". Detecte la langue du navigateur et redirige vers /fr, /en ou /es.
// En export statique, ce fichier devient out/index.html (redirection cote client).
export default function RootRedirect() {
  useEffect(() => {
    const guess = (navigator.language || "fr").slice(0, 2).toLowerCase();
    const target = isLocale(guess) ? guess : defaultLocale;
    window.location.replace(`/${target}/`);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <span className="font-display text-3xl tracking-tight text-gradient-gold">
          LOUAI
        </span>
        <p className="mt-3 text-sm text-ink-soft">Chargement.</p>
        <noscript>
          {/* Fallback sans JavaScript : liens HTML bruts volontaires (Link inutile ici). */}
          {/* eslint-disable @next/next/no-html-link-for-pages */}
          <p className="mt-4 text-sm text-ink-soft">
            <a className="text-primary underline" href="/fr/">
              Francais
            </a>{" "}
            <a className="text-primary underline" href="/en/">
              English
            </a>{" "}
            <a className="text-primary underline" href="/es/">
              Espanol
            </a>
          </p>
          {/* eslint-enable @next/next/no-html-link-for-pages */}
        </noscript>
      </div>
    </main>
  );
}
