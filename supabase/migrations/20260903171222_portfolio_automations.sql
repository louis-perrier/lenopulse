-- Scenarios n8n telechargeables, presentes dans une section dediee de /portfolio.
-- Meme regle que le reste du schema : RLS active, aucune politique permissive,
-- seules les fonctions Cloudflare accedent a la table avec la cle service_role.

create table public.portfolio_automations (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  position     integer not null default 0,     -- ordre d'affichage, croissant
  published    boolean not null default false, -- false = brouillon, invisible en ligne

  name         text not null,                  -- nom du scenario
  summary      text,                           -- une ligne, ce que le scenario fait
  description  text,                           -- detail facultatif
  tools        text[] not null default '{}',   -- Gmail, Slack, OpenAI...

  image_url    text,                           -- capture du canvas n8n (bucket portfolio)

  -- Export n8n complet. Sert a la fois au bouton de copie et au telechargement.
  -- Stocke en texte brut pour etre restitue a l'identique, sans reformatage.
  workflow_json text,
  node_count    integer                        -- calcule a l'enregistrement
);

alter table public.portfolio_automations enable row level security;

create index portfolio_automations_position_idx  on public.portfolio_automations (position);
create index portfolio_automations_published_idx on public.portfolio_automations (published);
