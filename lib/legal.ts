import type { Locale } from "./i18n/types";

// Contenu legal. PLACEHOLDERS a completer avant mise en ligne (RGPD).
// A renseigner : editeur, hebergeur, donnees collectees, finalites, droits.

export interface LegalBlock {
  heading: string;
  body: string;
}

export interface LegalPageContent {
  title: string;
  note: string;
  blocks: LegalBlock[];
  back: string;
}

type LegalSet = { mentions: LegalPageContent; privacy: LegalPageContent };

export const legalContent: Record<Locale, LegalSet> = {
  fr: {
    mentions: {
      title: "Mentions légales",
      note: "Contenu provisoire. A compléter avec les informations légales réelles avant la mise en ligne.",
      blocks: [
        { heading: "Éditeur", body: "LOUAI. Coordonnées de l'éditeur à compléter." },
        { heading: "Hébergeur", body: "Cloudflare Pages. Coordonnées de l'hébergeur à compléter." },
        { heading: "Contact", body: "Adresse email de contact à compléter." },
      ],
      back: "Retour à l'accueil",
    },
    privacy: {
      title: "Politique de confidentialité",
      note: "Contenu provisoire. A compléter avec votre politique réelle avant la mise en ligne.",
      blocks: [
        { heading: "Données collectées", body: "Le formulaire de contact ouvre votre logiciel de messagerie. Les informations saisies ne sont envoyées qu'au moment où vous envoyez l'email." },
        { heading: "Finalité", body: "Répondre à votre demande de contact. Aucune utilisation commerciale non sollicitée." },
        { heading: "Vos droits", body: "Vous pouvez demander l'accès, la rectification ou la suppression de vos données. Modalités à compléter." },
      ],
      back: "Retour à l'accueil",
    },
  },
  en: {
    mentions: {
      title: "Legal notice",
      note: "Placeholder content. To be completed with the real legal information before going live.",
      blocks: [
        { heading: "Publisher", body: "LOUAI. Publisher details to be completed." },
        { heading: "Host", body: "Cloudflare Pages. Host details to be completed." },
        { heading: "Contact", body: "Contact email address to be completed." },
      ],
      back: "Back to home",
    },
    privacy: {
      title: "Privacy policy",
      note: "Placeholder content. To be completed with your real policy before going live.",
      blocks: [
        { heading: "Data collected", body: "The contact form opens your email client. The information you enter is only sent when you send the email." },
        { heading: "Purpose", body: "To answer your contact request. No unsolicited commercial use." },
        { heading: "Your rights", body: "You may request access, correction or deletion of your data. Process to be completed." },
      ],
      back: "Back to home",
    },
  },
  es: {
    mentions: {
      title: "Aviso legal",
      note: "Contenido provisional. A completar con la información legal real antes de publicar.",
      blocks: [
        { heading: "Editor", body: "LOUAI. Datos del editor por completar." },
        { heading: "Alojamiento", body: "Cloudflare Pages. Datos del alojamiento por completar." },
        { heading: "Contacto", body: "Dirección de email de contacto por completar." },
      ],
      back: "Volver al inicio",
    },
    privacy: {
      title: "Política de privacidad",
      note: "Contenido provisional. A completar con tu política real antes de publicar.",
      blocks: [
        { heading: "Datos recogidos", body: "El formulario de contacto abre tu cliente de correo. La información introducida solo se envía cuando envías el email." },
        { heading: "Finalidad", body: "Responder a tu solicitud de contacto. Sin uso comercial no solicitado." },
        { heading: "Tus derechos", body: "Puedes solicitar el acceso, la rectificación o la supresión de tus datos. Modalidades por completar." },
      ],
      back: "Volver al inicio",
    },
  },
};
