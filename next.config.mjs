/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fixe la racine du projet (des lockfiles existent dans des dossiers voisins).
  turbopack: { root: import.meta.dirname },
  // Export statique pour Cloudflare Pages (aucun serveur Node requis).
  output: "export",
  // Obligatoire en export statique : pas d'optimisation d'images cote serveur.
  images: { unoptimized: true },
  // Genere des dossiers avec index.html, plus sur pour l'hebergement statique.
  trailingSlash: true,
  // On garde npm run lint disponible, mais on ne bloque pas l'export sur un warning.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
