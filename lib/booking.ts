// Configuration de la reservation Cal.com (embed). Le lien Cal.com et le type
// d'evenement sont a renseigner une fois le compte configure (voir A-FOURNIR.md).

export const bookingConfig = {
  // Lien Cal.com au format "username/event-slug". Tant qu'il est vide, la section
  // de reservation propose un repli vers le formulaire de contact (aucun cul-de-sac).
  calLink: "louis-perrier/project-discuss",
  // Theme de l'embed, accorde au fond sombre du site.
  theme: "dark" as const,
  // Espace de noms de l'embed (permet plusieurs embeds sur une page si besoin).
  namespace: "lenopulse",
};

// Cle de metadata transmise a Cal.com pour relier la reservation au brief de la
// session (recue telle quelle dans le webhook, sous payload.metadata).
export const BRIEF_META_KEY = "briefId";
