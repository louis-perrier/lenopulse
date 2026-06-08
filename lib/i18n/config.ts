import type { Locale } from "./types";

export const locales: Locale[] = ["fr", "en", "es"];

export const defaultLocale: Locale = "fr";

// Libelle court affiche dans le selecteur de langue.
export const localeShortNames: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  es: "ES",
};

// Libelle long (utilise pour l'accessibilite et les listes).
export const localeLongNames: Record<Locale, string> = {
  fr: "Francais",
  en: "English",
  es: "Espanol",
};

export function isLocale(value: string): value is Locale {
  return (locales as string[]).includes(value);
}
