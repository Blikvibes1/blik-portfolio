-- BLIK Portfolio · Phase 1 schema
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  tags text[] not null default '{}',
  demo_url text not null default '#',
  repo_url text not null default '#',
  cover_url text,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_sort_idx
  on public.projects (published, sort_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

-- Public: read published only
drop policy if exists "Public read published projects" on public.projects;
create policy "Public read published projects"
  on public.projects for select
  to anon, authenticated
  using (published = true);

-- Authenticated admin: full access (single trusted user via Auth)
drop policy if exists "Admin full access projects" on public.projects;
create policy "Admin full access projects"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

-- Seed (optional — matches current hardcoded portfolio)
insert into public.projects (name, slug, description, tags, demo_url, repo_url, sort_order, published)
values
  ('cyberpunk-os', 'cyberpunk-os',
   'Immersive neural-interface OS in the browser: multi-window terminals, R3F 3D core with Bloom, Command Bus, achievements, and multi-AI oracle.',
   array['React','Three.js / R3F','TypeScript','Zustand'],
   'https://github.com/Blikvibes1/cyberpunk-os',
   'https://github.com/Blikvibes1/cyberpunk-os', 0, true),
  ('datavibes-gh', 'datavibes-gh',
   'Ghana data-bundle commerce: Next.js 14, Prisma, Paystack, Datamart, admin, webhooks, referrals.',
   array['Next.js','Prisma','Paystack','Supabase'],
   '#', '#', 1, true),
  ('datavibes-runbook', 'datavibes-runbook',
   'Interactive launch checklist for Datavibes GH — 12 phases, dark mode, troubleshooting.',
   array['HTML/CSS/JS','Ops docs','UX'],
   'https://github.com/Blikvibes1/datavibes-gh-runbook',
   'https://github.com/Blikvibes1/datavibes-gh-runbook', 2, true),
  ('atelier-systems', 'atelier-systems',
   '30 advanced creative systems — generative mythology, dream archive, and more. Vanilla canvas.',
   array['Canvas','Vanilla JS','Generative'],
   'https://github.com/Blikvibes1/freelancer-development-roadmap/tree/main/advanced-creative-systems',
   'https://github.com/Blikvibes1/freelancer-development-roadmap', 3, true),
  ('freelancer-roadmap', 'freelancer-roadmap',
   'Week-by-week frontend skill builds published as a public learning roadmap.',
   array['HTML','CSS','JavaScript'],
   'https://github.com/Blikvibes1/freelancer-development-roadmap',
   'https://github.com/Blikvibes1/freelancer-development-roadmap', 4, true),
  ('blikmovies', 'blikmovies',
   'Movie discovery / search experience in TypeScript.',
   array['TypeScript','Frontend'],
   'https://github.com/Blikvibes1/blikmovies',
   'https://github.com/Blikvibes1/blikmovies', 5, true),
  ('nexus-auth', 'nexus-auth',
   'Authentication-focused TypeScript project exploring secure session patterns.',
   array['TypeScript','Auth'],
   'https://github.com/Blikvibes1/nexus-auth',
   'https://github.com/Blikvibes1/nexus-auth', 6, true),
  ('luxe-accessories', 'luxe-accessories',
   'Product-oriented TypeScript frontend for an accessories brand experience.',
   array['TypeScript','UI'],
   'https://github.com/Blikvibes1/luxe-accessories',
   'https://github.com/Blikvibes1/luxe-accessories', 7, true)
on conflict (slug) do nothing;

-- ============================================================
-- Phase 2 — skills, timeline, site_copy
-- ============================================================

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skills_published_sort_idx
  on public.skills (published, sort_order);

drop trigger if exists skills_updated_at on public.skills;
create trigger skills_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

alter table public.skills enable row level security;

drop policy if exists "Public read published skills" on public.skills;
create policy "Public read published skills"
  on public.skills for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admin full access skills" on public.skills;
create policy "Admin full access skills"
  on public.skills for all
  to authenticated
  using (true)
  with check (true);

create table if not exists public.timeline (
  id uuid primary key default gen_random_uuid(),
  date_label text not null,
  role text not null,
  description text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists timeline_published_sort_idx
  on public.timeline (published, sort_order);

drop trigger if exists timeline_updated_at on public.timeline;
create trigger timeline_updated_at
  before update on public.timeline
  for each row execute function public.set_updated_at();

alter table public.timeline enable row level security;

drop policy if exists "Public read published timeline" on public.timeline;
create policy "Public read published timeline"
  on public.timeline for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admin full access timeline" on public.timeline;
create policy "Admin full access timeline"
  on public.timeline for all
  to authenticated
  using (true)
  with check (true);

create table if not exists public.site_copy (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists site_copy_updated_at on public.site_copy;
create trigger site_copy_updated_at
  before update on public.site_copy
  for each row execute function public.set_updated_at();

alter table public.site_copy enable row level security;

drop policy if exists "Public read site_copy" on public.site_copy;
create policy "Public read site_copy"
  on public.site_copy for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin full access site_copy" on public.site_copy;
create policy "Admin full access site_copy"
  on public.site_copy for all
  to authenticated
  using (true)
  with check (true);

-- Seed skills
insert into public.skills (label, sort_order, published)
select * from (values
  ('JavaScript', 0, true),
  ('TypeScript', 1, true),
  ('React', 2, true),
  ('Next.js', 3, true),
  ('Node.js', 4, true),
  ('Prisma', 5, true),
  ('PostgreSQL', 6, true),
  ('Tailwind CSS', 7, true),
  ('Three.js / R3F', 8, true),
  ('HTML / CSS', 9, true),
  ('Git / GitHub', 10, true),
  ('Vercel', 11, true)
) as v(label, sort_order, published)
where not exists (select 1 from public.skills limit 1);

-- Seed timeline (no unique constraint — only insert if empty)
insert into public.timeline (date_label, role, description, sort_order, published)
select * from (values
  ('2025 — PRESENT', 'Independent builder · BLIK systems',
   'Shipping portfolio-grade experiments and production-shaped apps: Cyberpunk OS, Datavibes GH, generative systems, and public learning roadmaps.', 0, true),
  ('ONGOING', 'Full-stack product work',
   'Next.js commerce flows, webhooks, admin tooling, auth, and deploy runbooks aimed at real Ghana market constraints.', 1, true),
  ('PRACTICE', 'Frontend craft loop',
   'Deliberate weekly builds — responsive UI, forms, APIs, timers, themes — published in the freelancer development roadmap.', 2, true),
  ('ORIGIN', 'Joseph Agyei · BLIK',
   'Building in public under Blikvibes1 — terminal aesthetics, systems thinking, and interfaces that feel like tools.', 3, true)
) as v(date_label, role, description, sort_order, published)
where not exists (select 1 from public.timeline limit 1);

insert into public.site_copy (key, value) values
  ('hero_tagline', 'Full-stack builder. Portfolio of Joseph Agyei — Cyberpunk OS, Datavibes GH, generative systems, and production-shaped web apps.'),
  ('about_bio', 'Joseph Agyei (BLIK) builds systems at the edge of product and experiment — from Ghana data-bundle commerce to neural-interface OS demos and generative creative tools.'),
  ('footer_text', 'SYSTEM:// BLIK.EXE — Built by Joseph Agyei. All systems operational.')
on conflict (key) do nothing;

-- ============================================================
-- Phase 3 — social_links + extra site_copy keys
-- ============================================================

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  network text not null unique,
  label text not null,
  url text not null default '',
  active boolean not null default false,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists social_links_updated_at on public.social_links;
create trigger social_links_updated_at
  before update on public.social_links
  for each row execute function public.set_updated_at();

alter table public.social_links enable row level security;

drop policy if exists "Public read active socials" on public.social_links;
create policy "Public read active socials"
  on public.social_links for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Admin full access socials" on public.social_links;
create policy "Admin full access socials"
  on public.social_links for all
  to authenticated
  using (true)
  with check (true);

insert into public.social_links (network, label, url, active, sort_order)
select * from (values
  ('github', 'GitHub', 'https://github.com/Blikvibes1', true, 0),
  ('linkedin', 'LinkedIn', '', false, 1),
  ('x', 'X / Twitter', '', false, 2),
  ('email', 'Email', 'mailto:josephagyei470@gmail.com', false, 3)
) as v(network, label, url, active, sort_order)
where not exists (select 1 from public.social_links limit 1);

insert into public.site_copy (key, value) values
  ('profile_photo_url', ''),
  ('seo_title', 'SYSTEM:// BLIK.EXE — Joseph Agyei'),
  ('seo_description', 'BLIK — Joseph Agyei. Cyberpunk OS, Datavibes GH, Next.js, creative systems. Interactive terminal portfolio.'),
  ('theme_pack', 'classic-matrix')
on conflict (key) do nothing;

-- ============================================================
-- Remaining features: visits, logs, i18n, storage helpers
-- ============================================================

create table if not exists public.visit_counts (
  day date primary key default (timezone('utc', now())::date),
  hits bigint not null default 0
);

alter table public.visit_counts enable row level security;

drop policy if exists "Public insert visit bump" on public.visit_counts;
-- anon cannot insert freely without RPC; use security definer function

create or replace function public.bump_visit()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.visit_counts as v (day, hits)
  values (timezone('utc', now())::date, 1)
  on conflict (day) do update set hits = v.hits + 1;
end;
$$;

revoke all on function public.bump_visit() from public;
grant execute on function public.bump_visit() to anon, authenticated;

drop policy if exists "Admin read visits" on public.visit_counts;
create policy "Admin read visits"
  on public.visit_counts for select
  to authenticated
  using (true);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity text not null default '',
  entity_id text not null default '',
  detail text not null default '',
  created_at timestamptz not null default now()
);

alter table public.admin_logs enable row level security;

drop policy if exists "Admin read logs" on public.admin_logs;
create policy "Admin read logs"
  on public.admin_logs for select
  to authenticated
  using (true);

drop policy if exists "Admin insert logs" on public.admin_logs;
create policy "Admin insert logs"
  on public.admin_logs for insert
  to authenticated
  with check (true);

create or replace function public.log_admin_action(p_action text, p_entity text, p_entity_id text, p_detail text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_logs (action, entity, entity_id, detail)
  values (p_action, coalesce(p_entity,''), coalesce(p_entity_id,''), coalesce(p_detail,''));
end;
$$;

grant execute on function public.log_admin_action(text,text,text,text) to authenticated;

-- i18n strings (optional overlays; EN is default in code)
create table if not exists public.i18n_strings (
  locale text not null,
  key text not null,
  value text not null default '',
  primary key (locale, key)
);

alter table public.i18n_strings enable row level security;

drop policy if exists "Public read i18n" on public.i18n_strings;
create policy "Public read i18n"
  on public.i18n_strings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin full i18n" on public.i18n_strings;
create policy "Admin full i18n"
  on public.i18n_strings for all
  to authenticated
  using (true)
  with check (true);

insert into public.i18n_strings (locale, key, value) values
  ('en', 'nav_home', 'Home'),
  ('en', 'nav_projects', 'Projects'),
  ('en', 'nav_contact', 'Contact'),
  ('en', 'filter_all', 'All'),
  ('en', 'ai_guide_title', 'AI Tour Guide'),
  ('en', 'ai_guide_start', 'Start tour'),
  ('en', 'ai_boundary', 'I can chat about that briefly — I am mainly your guide to Joseph''s work here. Want to continue the tour?'),
  ('tw', 'nav_home', 'Fie'),
  ('tw', 'nav_projects', 'Nnwuma'),
  ('tw', 'nav_contact', 'Kasa'),
  ('tw', 'filter_all', 'Nyinaa'),
  ('tw', 'ai_guide_title', 'AI Akwantuo'),
  ('tw', 'ai_guide_start', 'Fi ase'),
  ('tw', 'ai_boundary', 'Metumi akasa kakra — me yɛ Joseph nnwuma akwankyerɛfo. Yɛn toa so?')
on conflict (locale, key) do nothing;

insert into public.site_copy (key, value) values
  ('default_locale', 'en'),
  ('ai_enabled', 'true'),
  ('ai_provider', 'groq'),
  ('ai_model', 'llama-3.1-8b-instant'),
  ('prompt_lab_enabled', 'true')
on conflict (key) do nothing;

-- Storage buckets are created in Supabase dashboard:
--   covers (public read) and avatars (public read)
-- Policies example (run after creating buckets):
-- allow authenticated upload; allow public read

-- ============================================================
-- Final: blog posts + admin gate secret
-- ============================================================

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text not null default '',
  cover_url text,
  locale text not null default 'en',
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_published_sort_idx
  on public.posts (published, locale, sort_order);

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists "Public read published posts" on public.posts;
create policy "Public read published posts"
  on public.posts for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admin full access posts" on public.posts;
create policy "Admin full access posts"
  on public.posts for all
  to authenticated
  using (true)
  with check (true);

insert into public.site_copy (key, value) values
  ('admin_gate_enabled', 'false'),
  ('admin_gate_pass', '')
on conflict (key) do nothing;
