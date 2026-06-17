import type { MetadataRoute } from "next";

// Genere robots.txt en statique au build (compatible output: export).
const base = "https://lenopulse.com";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${base}/sitemap.xml`,
  };
}
