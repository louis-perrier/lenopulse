-- Contenu initial du portfolio : les projets deja presents sur le site, reecrits
-- pour la page /portfolio (registre technique, anglais). Idempotent grace aux
-- identifiants fixes : rejouer cette migration ne duplique rien et n'ecrase pas
-- les modifications faites depuis l'admin.

insert into public.portfolio_projects
  (id, position, published, featured, span, name, tag, line, stack, url, image_url, image_kind, problem, built, status)
values
  ('a1000000-0000-4000-8000-000000000001', 0, true, true, 'wide',
   'Hotel voice receptionist', 'Voice AI',
   'Answers real inbound calls, day and night.',
   array['Vapi','Twilio','Deepgram','Claude','Node.js'],
   null,
   'https://fcpgjrskvpvbalhoktfn.supabase.co/storage/v1/object/public/portfolio/receptionist.png', 'image',
   'Hotels miss calls outside desk hours. Voicemail does not book rooms.',
   'A voice agent on a real phone number. It answers, transcribes the caller live, replies from the hotel''s own information, and hands over to a human when the request is out of scope.',
   'Built and deployed end to end, from telephony to the language model.'),

  ('a1000000-0000-4000-8000-000000000002', 1, true, true, 'half',
   'LeadControl', 'Web app',
   'WhatsApp, Instagram and email in one inbox.',
   array['Next.js','Supabase','PostgreSQL','RAG','Stripe'],
   'https://leadcontrol.fr',
   'https://fcpgjrskvpvbalhoktfn.supabase.co/storage/v1/object/public/portfolio/leadcontrol.png', 'logo',
   'Leads land on three channels at once. They get answered late, twice, or never.',
   'A CRM built around AI agents. One inbox for every channel, answers retrieved from the client''s own PDF documents, KPI dashboards per channel, Stripe billing.',
   'Online at leadcontrol.fr.'),

  ('a1000000-0000-4000-8000-000000000003', 2, true, true, 'half',
   'Amazon reseller agent', 'Automation',
   'Scores thousands of products, on a schedule.',
   array['Python','Keepa API','Scheduled jobs','PostgreSQL'],
   null, null, 'abstract',
   'Checking price history, rank and competition by hand is slow. The good windows close first.',
   'A scheduled agent that pulls market history from the Keepa API, scores every product against the buying criteria and surfaces only what passes. Runs unsupervised.',
   'Built and running as a background system.'),

  ('a1000000-0000-4000-8000-000000000004', 3, true, true, 'wide',
   'AI-powered restaurant site', 'Site + AI',
   'Answers customers after closing time.',
   array['Next.js','Cloudflare','Anthropic API'],
   'https://ortkebab.fr',
   'https://fcpgjrskvpvbalhoktfn.supabase.co/storage/v1/object/public/portfolio/websiteai.png', 'image',
   'The same questions every day. Hours, menu, delivery. Nobody answers them at night.',
   'A fast site with an assistant wired to the business''s own information. It answers in natural language at any hour.',
   'Online at ortkebab.fr.'),

  ('a1000000-0000-4000-8000-000000000005', 4, true, false, 'half',
   'HestiaAI', 'AI product',
   'AI product.',
   array['Next.js','AI'],
   'https://hestiaai.app',
   'https://fcpgjrskvpvbalhoktfn.supabase.co/storage/v1/object/public/portfolio/hestiaai.png', 'logo',
   null, null, 'Online at hestiaai.app.'),

  ('a1000000-0000-4000-8000-000000000006', 5, true, false, 'half',
   'LENOPULSE', 'Site + AI',
   'Services site with a Supabase backed AI assistant.',
   array['Next.js','Cloudflare','Supabase','Anthropic API'],
   'https://lenopulse.com',
   null, 'abstract',
   null, null, 'Online at lenopulse.com.'),

  ('a1000000-0000-4000-8000-000000000007', 6, true, false, 'half',
   'n8n workflows', 'Automation',
   'Business tools wired to each other.',
   array['n8n','Webhooks','APIs'],
   null,
   'https://fcpgjrskvpvbalhoktfn.supabase.co/storage/v1/object/public/portfolio/n8n.png', 'image',
   null, null, 'Running for clients.'),

  ('a1000000-0000-4000-8000-000000000008', 7, true, false, 'half',
   'Market analysis agent', 'Automation',
   'Applies a trading strategy without emotion.',
   array['Python','APIs'],
   null, null, 'abstract',
   null, null, 'In development.')
on conflict (id) do nothing;
