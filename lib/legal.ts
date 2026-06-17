import type { Locale } from "./i18n/types";

// Contenu legal reel (mentions legales et politique de confidentialite RGPD).
// Editeur : Louis Perrier, micro-entreprise, Nantes. Site statique, sans cookie
// publicitaire ni traceur tiers. Trois traitements : formulaire de contact (fonction
// Cloudflare + Resend, repli mailto), assistant IA (Anthropic pour les reponses,
// Supabase pour la memoire des conversations) et reservation d'appel (Cal.com), les
// donnees de RDV etant aussi conservees dans Supabase (hebergement UE).

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
          body: "Le site LENOPULSE est édité par Louis Perrier, entrepreneur individuel (micro-entreprise), SIREN 940 796 253, domicilié 7 allée Jean-Baptiste Fourier, 44300 Nantes, France. TVA non applicable, article 293 B du CGI.",
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
      note: "Dernière mise à jour : 17 juin 2026.",
      blocks: [
        {
          heading: "Responsable du traitement",
          body: "Louis Perrier, entrepreneur individuel, 7 allée Jean-Baptiste Fourier, 44300 Nantes, France. Email : louis.perrier.chenoise@gmail.com.",
        },
        {
          heading: "Données collectées",
          body: "Ce site ne dépose aucun cookie publicitaire et n'utilise aucun traceur tiers. Trois cas. (1) Formulaire de contact : les informations saisies (prénom, email, message) sont transmises via une fonction sécurisée hébergée chez Cloudflare, puis acheminées jusqu'à ma boîte email par Resend (resend.com), sous-traitant. Si l'envoi échoue, votre logiciel de messagerie s'ouvre en secours. (2) Assistant IA : votre conversation et la synthèse de projet sont traitées par Anthropic (anthropic.com) pour générer les réponses, et conservées dans une base de données Supabase (supabase.com, hébergement dans l'Union européenne) afin de garder le fil de l'échange. Une mémoire locale de votre navigateur conserve aussi la conversation pour ne pas vous la faire ressaisir (stockage strictement fonctionnel). Une empreinte technique anonymisée (adresse IP hachée) peut être conservée à des fins de sécurité. (3) Réservation d'appel : la prise de rendez-vous est gérée par Cal.com (cal.com), et les informations du rendez-vous (nom, email, créneau, lien de visioconférence) sont conservées dans Supabase. Aucune donnée n'est revendue.",
        },
        {
          heading: "Finalité",
          body: "Les informations servent uniquement à répondre à votre demande, à cadrer votre projet, à organiser un éventuel rendez-vous et à assurer le suivi de nos échanges. Elles ne sont ni revendues, ni partagées, ni utilisées pour de la prospection non sollicitée.",
        },
        {
          heading: "Durée de conservation",
          body: "Les échanges par email, les conversations avec l'assistant et les rendez-vous sont conservés au maximum 3 ans après le dernier contact, puis supprimés.",
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
          body: "The LENOPULSE website is published by Louis Perrier, sole trader (French micro-entreprise), SIREN 940 796 253, located at 7 allée Jean-Baptiste Fourier, 44300 Nantes, France. VAT not applicable, article 293 B of the French Tax Code.",
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
      note: "Last updated: June 17, 2026.",
      blocks: [
        {
          heading: "Data controller",
          body: "Louis Perrier, sole trader, 7 allée Jean-Baptiste Fourier, 44300 Nantes, France. Email: louis.perrier.chenoise@gmail.com.",
        },
        {
          heading: "Data collected",
          body: "This website sets no advertising cookies and uses no third-party trackers. Three cases. (1) Contact form: the information you enter (first name, email, message) is sent through a secure function hosted by Cloudflare, then delivered to my inbox by Resend (resend.com), a sub-processor. If sending fails, your email client opens as a fallback. (2) AI assistant: your conversation and project summary are processed by Anthropic (anthropic.com) to generate replies, and stored in a Supabase database (supabase.com, hosted in the European Union) to keep track of the exchange. Your browser's local storage also keeps the conversation so you do not have to retype it (strictly functional storage). An anonymized technical fingerprint (hashed IP address) may be kept for security. (3) Call booking: scheduling is handled by Cal.com (cal.com), and the appointment details (name, email, time slot, video call link) are stored in Supabase. No data is ever sold.",
        },
        {
          heading: "Purpose",
          body: "The information is used solely to answer your request, scope your project, arrange a possible appointment and follow up on our exchanges. It is never sold, shared or used for unsolicited marketing.",
        },
        {
          heading: "Retention period",
          body: "Email exchanges, conversations with the assistant and appointments are kept for a maximum of 3 years after the last contact, then deleted.",
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
          body: "El sitio LENOPULSE está editado por Louis Perrier, empresario individual (micro-entreprise francesa), SIREN 940 796 253, con domicilio en 7 allée Jean-Baptiste Fourier, 44300 Nantes, Francia. IVA no aplicable, artículo 293 B del Código Tributario francés.",
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
      note: "Última actualización: 17 de junio de 2026.",
      blocks: [
        {
          heading: "Responsable del tratamiento",
          body: "Louis Perrier, empresario individual, 7 allée Jean-Baptiste Fourier, 44300 Nantes, Francia. Email: louis.perrier.chenoise@gmail.com.",
        },
        {
          heading: "Datos recogidos",
          body: "Este sitio no instala cookies publicitarias ni utiliza rastreadores de terceros. Tres casos. (1) Formulario de contacto: la información introducida (nombre, email, mensaje) se transmite a través de una función segura alojada en Cloudflare y luego se entrega a mi bandeja de entrada mediante Resend (resend.com), subencargado del tratamiento. Si el envío falla, tu cliente de correo se abre como alternativa. (2) Asistente IA: tu conversación y la síntesis del proyecto se procesan con Anthropic (anthropic.com) para generar las respuestas, y se conservan en una base de datos Supabase (supabase.com, alojamiento en la Unión Europea) para mantener el hilo del intercambio. La memoria local de tu navegador también guarda la conversación para no tener que reescribirla (almacenamiento estrictamente funcional). Puede conservarse una huella técnica anonimizada (dirección IP cifrada) con fines de seguridad. (3) Reserva de llamada: la programación la gestiona Cal.com (cal.com), y los datos de la cita (nombre, email, horario, enlace de videollamada) se conservan en Supabase. Ningún dato se vende.",
        },
        {
          heading: "Finalidad",
          body: "La información se utiliza únicamente para responder a tu solicitud, encuadrar tu proyecto, organizar una posible cita y dar seguimiento a nuestros intercambios. Nunca se vende, se comparte ni se usa para prospección no solicitada.",
        },
        {
          heading: "Plazo de conservación",
          body: "Los intercambios por email, las conversaciones con el asistente y las citas se conservan un máximo de 3 años tras el último contacto y después se eliminan.",
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
