-- Deux colonnes sur portfolio_automations.
--
-- slug alimente les liens directs (/portfolio#a-<slug>) envoyes dans les
-- candidatures Upwork. Il est fige a la creation et jamais regenere sur un
-- renommage, sinon un lien deja transmis cesse de pointer quelque part.
--
-- guide_url pointe vers une demonstration hebergee ailleurs (Loom, video, page).

alter table public.portfolio_automations
  add column slug      text,
  add column guide_url text;

with candidats as (
  select
    id,
    coalesce(
      nullif(trim(both '-' from lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))), ''),
      'scenario'
    ) as base,
    row_number() over (
      partition by coalesce(
        nullif(trim(both '-' from lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))), ''),
        'scenario'
      )
      order by position, created_at
    ) as rang
  from public.portfolio_automations
)
update public.portfolio_automations a
set slug = case when c.rang = 1 then c.base else c.base || '-' || c.rang end
from candidats c
where a.id = c.id;

create unique index portfolio_automations_slug_idx
  on public.portfolio_automations (slug);
