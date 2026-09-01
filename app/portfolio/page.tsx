import type { Metadata } from "next";
import PortfolioPage from "@/components/PortfolioPage";

// Page /portfolio (hors segment [lang], en anglais uniquement). Volontairement
// isolee du site vitrine : aucun lien ne mene de la page d'accueil vers elle, ni
// l'inverse. On y accede par son adresse directe, partagee depuis Upwork.
//
// Elle n'est pas listee dans sitemap.xml. Pour la retirer aussi des moteurs de
// recherche, ajouter robots: { index: false, follow: false } ci-dessous.
export const metadata: Metadata = {
  title: "Louis Perrier . Full-stack & AI developer",
  description:
    "Voice agents, automation and web apps. Built end to end by one developer.",
};

export default function Portfolio() {
  return <PortfolioPage />;
}
