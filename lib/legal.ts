import type { Locale } from "./i18n/types";

// Contenu legal reel (mentions legales et politique de confidentialite RGPD).
// Editeur : Louis Perrier, micro-entreprise, Nantes. Site statique : aucun cookie,
// aucun traceur, aucune donnee stockee (formulaire en mailto).

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
      note: "Dernière mise à jour : 10 juin 2026.",
      blocks: [
        {
          heading: "Éditeur du site",
          body: "Le site LOUAI est édité par Louis Perrier, entrepreneur individuel (micro-entreprise), SIREN 940 796 253, domicilié 7 allée Jean-Baptiste Fourier, 44300 Nantes, France. TVA non applicable, article 293 B du CGI.",
        },
        {
          heading: "Directeur de la publication",
          body: "Louis Perrier.",
        },
        {
          heading: "Hébergement",
          body: "Le site est hébergé par Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis. Site : www.cloudflare.com.",
        },
        {
          heading: "Contact",
          body: "Email : louis.perrier.chenoise@gmail.com. Téléphone : +33 7 81 49 49 53.",
        },
        {
          heading: "Propriété intellectuelle",
          body: "L'ensemble des contenus de ce site (textes, visuels, logos) est la propriété de Louis Perrier, sauf mention contraire. Toute reproduction, totale ou partielle, sans autorisation préalable est interdite.",
        },
      ],
      back: "Retour à l'accueil",
    },
    privacy: {
      title: "Politique de confidentialité",
      note: "Dernière mise à jour : 10 juin 2026.",
      blocks: [
        {
          heading: "Responsable du traitement",
          body: "Louis Perrier, entrepreneur individuel, 7 allée Jean-Baptiste Fourier, 44300 Nantes, France. Email : louis.perrier.chenoise@gmail.com.",
        },
        {
          heading: "Données collectées",
          body: "Ce site ne dépose aucun cookie, n'utilise aucun outil de mesure d'audience et ne stocke aucune donnée personnelle. Le formulaire de contact ouvre votre logiciel de messagerie : les informations saisies (prénom, email, message) ne sont transmises que lorsque vous envoyez l'email, et ne transitent par aucun serveur du site.",
        },
        {
          heading: "Finalité",
          body: "Les informations reçues par email servent uniquement à répondre à votre demande et à assurer le suivi de nos échanges. Elles ne sont ni revendues, ni partagées, ni utilisées pour de la prospection non sollicitée.",
        },
        {
          heading: "Durée de conservation",
          body: "Les échanges sont conservés au maximum 3 ans après le dernier contact, puis supprimés.",
        },
        {
          heading: "Hébergement et journaux techniques",
          body: "Le site est servi par Cloudflare, qui peut traiter des journaux techniques (notamment des adresses IP) à des fins de sécurité et de performance. Consultez la politique de confidentialité de Cloudflare pour en savoir plus.",
        },
        {
          heading: "Vos droits",
          body: "Conformément au RGPD, vous disposez de droits d'accès, de rectification, d'effacement, de limitation et d'opposition sur vos données. Pour les exercer, écrivez à louis.perrier.chenoise@gmail.com. Vous pouvez également adresser une réclamation à la CNIL (cnil.fr).",
        },
      ],
      back: "Retour à l'accueil",
    },
  },
  en: {
    mentions: {
      title: "Legal notice",
      note: "Last updated: June 10, 2026.",
      blocks: [
        {
          heading: "Publisher",
          body: "The LOUAI website is published by Louis Perrier, sole trader (French micro-entreprise), SIREN 940 796 253, located at 7 allée Jean-Baptiste Fourier, 44300 Nantes, France. VAT not applicable, article 293 B of the French Tax Code.",
        },
        {
          heading: "Publication director",
          body: "Louis Perrier.",
        },
        {
          heading: "Hosting",
          body: "The website is hosted by Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, United States. Website: www.cloudflare.com.",
        },
        {
          heading: "Contact",
          body: "Email: louis.perrier.chenoise@gmail.com. Phone: +33 7 81 49 49 53.",
        },
        {
          heading: "Intellectual property",
          body: "All content on this website (text, visuals, logos) is the property of Louis Perrier unless stated otherwise. Any reproduction, in whole or in part, without prior authorization is prohibited.",
        },
      ],
      back: "Back to home",
    },
    privacy: {
      title: "Privacy policy",
      note: "Last updated: June 10, 2026.",
      blocks: [
        {
          heading: "Data controller",
          body: "Louis Perrier, sole trader, 7 allée Jean-Baptiste Fourier, 44300 Nantes, France. Email: louis.perrier.chenoise@gmail.com.",
        },
        {
          heading: "Data collected",
          body: "This website sets no cookies, uses no analytics tools and stores no personal data. The contact form opens your email client: the information you enter (first name, email, message) is only transmitted when you send the email, and never passes through any server of this website.",
        },
        {
          heading: "Purpose",
          body: "The information received by email is used solely to answer your request and follow up on our exchanges. It is never sold, shared or used for unsolicited marketing.",
        },
        {
          heading: "Retention period",
          body: "Exchanges are kept for a maximum of 3 years after the last contact, then deleted.",
        },
        {
          heading: "Hosting and technical logs",
          body: "The website is served by Cloudflare, which may process technical logs (including IP addresses) for security and performance purposes. See Cloudflare's privacy policy for more details.",
        },
        {
          heading: "Your rights",
          body: "Under the GDPR, you have rights of access, rectification, erasure, restriction and objection regarding your data. To exercise them, write to louis.perrier.chenoise@gmail.com. You may also file a complaint with the French data protection authority, the CNIL (cnil.fr).",
        },
      ],
      back: "Back to home",
    },
  },
  es: {
    mentions: {
      title: "Aviso legal",
      note: "Última actualización: 10 de junio de 2026.",
      blocks: [
        {
          heading: "Editor del sitio",
          body: "El sitio LOUAI está editado por Louis Perrier, empresario individual (micro-entreprise francesa), SIREN 940 796 253, con domicilio en 7 allée Jean-Baptiste Fourier, 44300 Nantes, Francia. IVA no aplicable, artículo 293 B del Código Tributario francés.",
        },
        {
          heading: "Director de la publicación",
          body: "Louis Perrier.",
        },
        {
          heading: "Alojamiento",
          body: "El sitio está alojado por Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, Estados Unidos. Sitio: www.cloudflare.com.",
        },
        {
          heading: "Contacto",
          body: "Email: louis.perrier.chenoise@gmail.com. Teléfono: +33 7 81 49 49 53.",
        },
        {
          heading: "Propiedad intelectual",
          body: "Todos los contenidos de este sitio (textos, visuales, logos) son propiedad de Louis Perrier, salvo mención contraria. Queda prohibida cualquier reproducción, total o parcial, sin autorización previa.",
        },
      ],
      back: "Volver al inicio",
    },
    privacy: {
      title: "Política de privacidad",
      note: "Última actualización: 10 de junio de 2026.",
      blocks: [
        {
          heading: "Responsable del tratamiento",
          body: "Louis Perrier, empresario individual, 7 allée Jean-Baptiste Fourier, 44300 Nantes, Francia. Email: louis.perrier.chenoise@gmail.com.",
        },
        {
          heading: "Datos recogidos",
          body: "Este sitio no instala cookies, no utiliza herramientas de analítica y no almacena ningún dato personal. El formulario de contacto abre tu cliente de correo: la información introducida (nombre, email, mensaje) solo se transmite cuando envías el email, y no pasa por ningún servidor de este sitio.",
        },
        {
          heading: "Finalidad",
          body: "La información recibida por email se utiliza únicamente para responder a tu solicitud y dar seguimiento a nuestros intercambios. Nunca se vende, se comparte ni se usa para prospección no solicitada.",
        },
        {
          heading: "Plazo de conservación",
          body: "Los intercambios se conservan un máximo de 3 años tras el último contacto y después se eliminan.",
        },
        {
          heading: "Alojamiento y registros técnicos",
          body: "El sitio se sirve a través de Cloudflare, que puede tratar registros técnicos (incluidas direcciones IP) con fines de seguridad y rendimiento. Consulta la política de privacidad de Cloudflare para más información.",
        },
        {
          heading: "Tus derechos",
          body: "Conforme al RGPD, dispones de derechos de acceso, rectificación, supresión, limitación y oposición sobre tus datos. Para ejercerlos, escribe a louis.perrier.chenoise@gmail.com. También puedes presentar una reclamación ante la autoridad francesa de protección de datos, la CNIL (cnil.fr).",
        },
      ],
      back: "Volver al inicio",
    },
  },
};
