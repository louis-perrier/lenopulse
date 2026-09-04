-- Le portfolio met en avant Hotel rate desk, dont la carte annonce Django et
-- SQLite sans que la grille Capabilities ne les nomme nulle part.
--
-- La valeur est reecrite en entier, pas corrigee par morceaux : c'est ce que fait
-- /admin quand on edite la grille, et le rejeu sur une base vide donne alors le
-- meme resultat que sur une base deja peuplee.

update public.app_config
set value = '[
    {"group": "Frontend",       "items": ["Next.js", "React", "TypeScript", "Tailwind CSS"]},
    {"group": "Backend",        "items": ["Node.js", "Python", "Django", "Django admin", "FastAPI", "REST APIs", "Role based access"]},
    {"group": "Data",           "items": ["PostgreSQL", "Supabase", "SQLite", "RAG over documents"]},
    {"group": "AI",             "items": ["Anthropic Claude", "OpenAI", "AI agents", "Vapi", "Deepgram"]},
    {"group": "Automation",     "items": ["n8n", "Webhooks", "Scheduled jobs", "Twilio"]},
    {"group": "Infrastructure", "items": ["Cloudflare Workers", "Vercel", "Stripe"]}
  ]'::jsonb,
    updated_at = now()
where key = 'portfolio_capabilities';
