// Coordonnees et liens du site.

export const siteConfig = {
  brand: "LENOPULSE",

  // Adresse qui recoit les messages du formulaire de contact (mailto).
  contactEmail: "louis.perrier.chenoise@gmail.com",

  // Laisser "#" masque automatiquement le lien correspondant.
  socials: {
    youtube: "https://www.youtube.com/@louis-perrier",
    instagram: "https://instagram.com/louis.pilc",
    whatsapp: "https://wa.me/33781494953",
    linkedin: "https://www.linkedin.com/in/louis-perrier-lautopreneur/",
  },
};

export type SocialKey = keyof typeof siteConfig.socials;

// image : capture plein cadre (object-cover). logo : logo centre (object-contain).
export const workAssets: Record<
  string,
  { image?: string; logo?: string; url?: string }
> = {
  leadcontrol: { logo: "/realisations/leadcontrol.png", url: "https://leadcontrol.fr" },
  hestiaai: { logo: "/realisations/hestiaai.png", url: "https://hestiaai.app" },
  receptionist: { image: "/realisations/receptionist.png" },
  trading: {},
  n8n: { image: "/realisations/n8n.png" },
  websiteai: { image: "/realisations/websiteai.png", url: "https://ortkebab.fr" },
};
