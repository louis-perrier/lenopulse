import type { Metadata } from "next";
import PortfolioPage from "@/components/PortfolioPage";

// Page isolee du site vitrine : aucun lien n'y mene, on y accede par son adresse
// directe partagee depuis Upwork. Absente du sitemap.
export const metadata: Metadata = {
  title: "Louis Perrier . Full-stack & AI developer",
  description:
    "Voice agents, automation and web apps. Built end to end by one developer.",
};

export default function Portfolio() {
  return <PortfolioPage />;
}
