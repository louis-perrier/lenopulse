// Contenu fixe de /portfolio, hors projets qui vivent en base. Textes en anglais :
// la page s'adresse a des clients venus d'Upwork.

export const portfolioConfig = {
  upworkUrl: "https://upwork.com/freelancers/~01eb55d089d1e11d28",
  email: "louis.perrier.chenoise@gmail.com",
  githubUrl: "https://github.com/louis-perrier",
  youtubeUrl: "https://www.youtube.com/@louis-perrier",

  eyebrow: "Full-stack & AI developer . Nantes, France",
  titleStart: "I build systems that ",
  titleHighlight: "run without me.",
  subtitle: "Voice agents, automation and web apps. One developer, end to end.",

  facts: [
    { label: "Stack", value: "Next.js . Supabase . Python" },
    { label: "Rate", value: "From $25 / hr" },
    { label: "Reply", value: "Within 24 h" },
    { label: "Speaks", value: "EN . FR . ES" },
  ],

  capabilities: [
    { group: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS"] },
    {
      group: "Backend",
      items: [
        "Node.js",
        "Python",
        "Django",
        "Django admin",
        "FastAPI",
        "REST APIs",
        "Role based access",
      ],
    },
    { group: "Data", items: ["PostgreSQL", "Supabase", "SQLite", "RAG over documents"] },
    { group: "AI", items: ["Anthropic Claude", "OpenAI", "AI agents", "Vapi", "Deepgram"] },
    { group: "Automation", items: ["n8n", "Webhooks", "Scheduled jobs", "Twilio"] },
    { group: "Infrastructure", items: ["Cloudflare Workers", "Vercel", "Stripe"] },
  ],

  // Les notes sont volontairement conditionnelles sauf la premiere : hors du
  // delai de reponse, rien n'est promis avant d'avoir lu le brief.
  steps: [
    {
      eyebrow: "Starting point",
      title: "You send me the brief",
      text: "The more you write down, the sharper my answer is. A rough spec, screens you like, a screen recording, anything counts. I read it and come back with questions before I quote anything.",
      note: "Reply within 24 h",
    },
    {
      eyebrow: "Direction",
      title: "You see it before it is built",
      text: "You get a visual preview of the product early, and you tell me if the direction is right. Changing it at that point costs nothing, which is the whole reason it comes first.",
      note: "A few days, scope depending",
    },
    {
      eyebrow: "Build",
      title: "I build it, test it and write it down",
      text: "I write the code, handle the errors and test it through to the end. You get the product with a short guide on how to use it, plus a setup guide when the app needs accounts or paid keys of your own.",
      note: "Deadline agreed together",
    },
    {
      eyebrow: "After delivery",
      title: "You use it, I keep it running",
      text: "Handover is not the end. You tell me what feels wrong and I fix it. Then a support window covers corrections and small improvements, its length agreed at the start of the contract.",
      note: "Support window agreed upfront",
    },
  ],

  footer: [
    "Louis Perrier . LENOPULSE, registered micro-entreprise, France",
    "Nantes, UTC+2 . Available more than 30 hrs / week",
  ],
} as const;

// Un projet tel que le renvoie /api/portfolio. Reflet exact des colonnes de la
// table portfolio_projects exposees publiquement.
export interface PortfolioProject {
  id: string;
  position: number;
  featured: boolean;
  span: "wide" | "half";
  name: string;
  tag: string | null;
  line: string | null;
  stack: string[];
  url: string | null;
  image_url: string | null;
  image_kind: "image" | "logo" | "abstract";
  problem: string | null;
  built: string | null;
  decisions: string | null;
  result: string | null;
  status: string | null;
}

// Un scenario n8n tel que le renvoie /api/automations. Le workflow complet est
// livre avec la liste : la copie vers le presse-papier doit rester synchrone.
export interface PortfolioAutomation {
  id: string;
  position: number;
  slug: string | null;
  name: string;
  summary: string | null;
  description: string | null;
  tools: string[];
  image_url: string | null;
  guide_url: string | null;
  workflow_json: string | null;
  node_count: number | null;
}
