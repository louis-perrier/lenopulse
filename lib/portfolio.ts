// Contenu fixe de /portfolio, hors projets qui vivent en base. Textes en anglais :
// la page s'adresse a des clients venus d'Upwork.

export const portfolioConfig = {
  upworkUrl: "https://upwork.com/freelancers/~01eb55d089d1e11d28",
  email: "louis.perrier.chenoise@gmail.com",
  githubUrl: "https://github.com/louis-perrier",

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

  steps: [
    "You send the brief",
    "I send a plan, within 24 h",
    "I build it and hand it over running",
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
