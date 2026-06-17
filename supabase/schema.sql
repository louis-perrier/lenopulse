-- Schema Supabase de la vitrine LENOPULSE (assistant IA + reservation + admin).
-- Reference versionnee. Applique sur le projet Supabase dedie via migration.
-- Toutes les tables sont verrouillees par RLS : aucune politique permissive, donc
-- tout est refuse pour anon/authenticated. Seule la cle service_role (utilisee
-- par les fonctions Cloudflare) lit et ecrit.

create extension if not exists pgcrypto;

-- Sessions de conversation + brief (memoire serveur, source de verite).
create table public.sessions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  locale        text not null default 'fr',
  visitor_name  text,
  visitor_email text,
  messages      jsonb not null default '[]'::jsonb,
  brief         jsonb,
  brief_ready   boolean not null default false,
  status        text not null default 'open',      -- open | brief_ready | booked
  ip_hash       text
);

-- Reservations Cal.com (phase 3).
create table public.bookings (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  session_id     uuid references public.sessions(id),
  cal_booking_id text unique,
  cal_uid        text,
  attendee_name  text,
  attendee_email text,
  start_time     timestamptz,
  end_time       timestamptz,
  status         text not null default 'confirmed', -- confirmed | cancelled | rescheduled
  raw_payload    jsonb
);

-- Configuration admin cle/valeur (phase 4, optionnel).
create table public.app_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Relances et qualification (phase 5).
create table public.reminders (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid references public.bookings(id) on delete cascade,
  kind         text not null,                       -- confirmation | reminder_24h | qualification
  scheduled_at timestamptz not null,
  sent_at      timestamptz,
  status       text not null default 'pending'      -- pending | sent | failed
);

alter table public.sessions   enable row level security;
alter table public.bookings   enable row level security;
alter table public.app_config enable row level security;
alter table public.reminders  enable row level security;

create index on public.bookings (start_time);
create index on public.sessions (visitor_email);
