-- Capacites techniques de la page /portfolio, rendues editables depuis /admin.
-- Stockees dans la table cle/valeur app_config, sous la cle portfolio_capabilities.
-- Valeur : un tableau d'objets { group, items }, dans l'ordre d'affichage.
--
-- Si la cle est absente, la page retombe sur la liste ecrite dans lib/portfolio.ts :
-- la page ne peut donc jamais se retrouver sans capacites affichees.

insert into public.app_config (key, value)
values (
  'portfolio_capabilities',
  '[
    {"group": "Frontend",       "items": ["Next.js", "React", "TypeScript", "Tailwind CSS"]},
    {"group": "Backend",        "items": ["Node.js", "Python", "FastAPI", "REST APIs"]},
    {"group": "Data",           "items": ["PostgreSQL", "Supabase", "RAG over documents"]},
    {"group": "AI",             "items": ["Anthropic Claude", "OpenAI", "AI agents", "Vapi", "Deepgram"]},
    {"group": "Automation",     "items": ["n8n", "Webhooks", "Scheduled jobs", "Twilio"]},
    {"group": "Infrastructure", "items": ["Cloudflare Workers", "Vercel", "Stripe"]}
  ]'::jsonb
)
on conflict (key) do nothing;
