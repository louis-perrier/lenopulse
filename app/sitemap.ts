import type { MetadataRoute } from "next";

// Genere sitemap.xml en statique au build (compatible output: export).
// Domaine susceptible de changer (voir contexte.md).
const base = "https://lenopulse.com";
const langs = ["fr", "en", "es"];
const routes = ["", "mentions-legales", "confidentialite"];

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of langs) {
    for (const route of routes) {
      const path = route ? `${base}/${lang}/${route}/` : `${base}/${lang}/`;
      entries.push({
        url: path,
        lastModified: now,
        changeFrequency: route ? "yearly" : "monthly",
        priority: route ? 0.3 : 1,
      });
    }
  }

  return entries;
}
