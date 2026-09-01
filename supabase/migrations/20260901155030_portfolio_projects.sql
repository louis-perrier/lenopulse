-- Portfolio editable depuis /admin.
-- Une ligne par projet affiche sur /portfolio. Aucune politique RLS permissive :
-- tout est refuse pour anon et authenticated, seules les fonctions Cloudflare
-- lisent et ecrivent, avec la cle service_role (meme regle que le reste du schema).

create table public.portfolio_projects (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Placement dans la page.
  position    integer not null default 0,          -- ordre d'affichage, croissant
  published   boolean not null default false,      -- false = brouillon, invisible en ligne
  featured    boolean not null default true,       -- true = grille principale, false = "Also built"
  span        text    not null default 'half',     -- taille de la tuile

  -- Contenu de la carte.
  name        text not null,
  tag         text,                                -- Voice AI, Web app, Automation...
  line        text,                                -- accroche d'une ligne
  stack       text[] not null default '{}',
  url         text,                                -- lien vers le site en ligne

  -- Visuel.
  image_url   text,                                -- fichier dans le bucket portfolio
  image_kind  text not null default 'image',       -- cadrage du visuel

  -- Contenu de la fiche detaillee.
  problem     text,
  built       text,
  decisions   text,
  result      text,
  status      text,

  constraint portfolio_span_valide       check (span in ('wide', 'half')),
  constraint portfolio_image_kind_valide check (image_kind in ('image', 'logo', 'abstract'))
);

alter table public.portfolio_projects enable row level security;

create index portfolio_projects_position_idx  on public.portfolio_projects (position);
create index portfolio_projects_published_idx on public.portfolio_projects (published);

-- Bucket public pour les visuels. L'ecriture passe par service_role depuis les
-- fonctions Cloudflare, la lecture est publique via l'URL du fichier.
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;
