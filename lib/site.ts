// Coordonnees et liens du site.
// A REMPLACER par les vraies valeurs. Ces placeholders permettent au site de
// fonctionner immediatement, mais doivent etre mis a jour avant mise en ligne.

export const siteConfig = {
  brand: "LOUAI",

  // TODO: confirmer l'adresse qui recevra les messages du formulaire de contact.
  contactEmail: "contact@louai.fr",

  // TODO: remplacer chaque "#" par l'URL reelle. Laisser "#" masque le lien.
  socials: {
    youtube: "#",
    instagram: "#",
    whatsapp: "#", // format conseille : https://wa.me/33XXXXXXXXX
    linkedin: "#",
  },
};

export type SocialKey = keyof typeof siteConfig.socials;
