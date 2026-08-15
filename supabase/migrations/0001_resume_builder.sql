-- ============================================================================
-- Résumé Builder — initial schema (multi-user, RLS-enforced)
--
-- Product model:
--   Accomplishment Bank ──(reframe for)──▶ Target Role ──▶ Résumé
--         ▲
--         └── Job Description ──▶ Strength Evaluation
--
-- Every table is scoped to the signed-in user via `user_id = auth.uid()` and
-- protected by Row-Level Security so one user can never read another's data.
--
-- Run this in the Supabase SQL editor (project: jzixhlbqymhcwscuqvik).
-- ============================================================================

-- gen_random_uuid() lives in pgcrypto; Supabase ships it, this is just a guard.
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

-- An accomplishment moves draft → needs_metrics (AI wants numbers) → ready.
do $$ begin
  create type accomplishment_status as enum ('draft', 'needs_metrics', 'ready');
exception when duplicate_object then null;
end $$;

-- ----------------------------------------------------------------------------
-- updated_at trigger helper
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles — one row per user (the shared résumé header)
-- ============================================================================
create table if not exists profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  name        text,
  location    text,
  headline    text,                              -- optional default one-liner
  contact     jsonb not null default '[]'::jsonb, -- [{type,text,href}]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- experiences — a job/role (the "where" a bank item happened)
-- ============================================================================
create table if not exists experiences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  org         text not null,
  role        text,
  start_date  text,                              -- free text ("Jan 2026"), keeps parity with UI
  end_date    text,                              -- null / "" == present
  is_current  boolean not null default false,
  tagline     text,
  link_text   text,
  link_href   text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists experiences_user_idx on experiences(user_id);

-- ============================================================================
-- accomplishments — THE BANK. Free-flow note in, résumé-written bullet out.
-- ============================================================================
create table if not exists accomplishments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade default auth.uid(),
  experience_id   uuid references experiences(id) on delete set null,
  raw_note        text not null,                             -- what the user typed
  polished        text,                                      -- AI résumé-written bullet
  metrics         jsonb not null default '[]'::jsonb,        -- [{label,value,verified}]
  themes          text[] not null default '{}',              -- ["growth","infra","ai"] → role match
  skills          text[] not null default '{}',
  status          accomplishment_status not null default 'draft',
  open_questions  jsonb not null default '[]'::jsonb,        -- [{id,question,answer?}]
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists accomplishments_user_idx on accomplishments(user_id);
create index if not exists accomplishments_experience_idx on accomplishments(experience_id);
create index if not exists accomplishments_themes_idx on accomplishments using gin(themes);

-- ============================================================================
-- education / awards / skill_groups — supporting résumé sections
-- ============================================================================
create table if not exists education (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  org         text not null,
  date_range  text,
  detail      text,
  points      text[] not null default '{}',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists education_user_idx on education(user_id);

create table if not exists awards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title       text not null,
  date        text,
  detail      text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists awards_user_idx on awards(user_id);

create table if not exists skill_groups (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  group_label text not null,
  items       text[] not null default '{}',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists skill_groups_user_idx on skill_groups(user_id);

-- ============================================================================
-- target_roles — the roles the user is aiming for (your product/design/ai lens)
-- ============================================================================
create table if not exists target_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title       text not null,                     -- "AI Deployment Engineer"
  framing     text,                              -- persona/angle used to reframe bank items
  keywords    text[] not null default '{}',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists target_roles_user_idx on target_roles(user_id);

-- ============================================================================
-- resumes — a composed résumé = role + selected bank items, snapshotted as JSON
-- ============================================================================
create table if not exists resumes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade default auth.uid(),
  target_role_id  uuid references target_roles(id) on delete set null,
  title           text not null,
  summary         text,
  item_ids        uuid[] not null default '{}',  -- accomplishments included
  composed        jsonb,                         -- full Resume JSON (feeds ResumeDoc + PDF)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists resumes_user_idx on resumes(user_id);

-- ============================================================================
-- job_evaluations — paste a JD, AI evaluates the candidate's strength against it
-- ============================================================================
create table if not exists job_evaluations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade default auth.uid(),
  target_role_id  uuid references target_roles(id) on delete set null,
  jd_text         text not null,
  fit_score       int,                           -- 0–100 overall fit
  result          jsonb,                         -- {requirements:[{need,coverage,evidence_ids}],gaps,positioning}
  created_at      timestamptz not null default now()
);
create index if not exists job_evaluations_user_idx on job_evaluations(user_id);

-- ============================================================================
-- updated_at triggers
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','experiences','accomplishments','education','awards',
    'skill_groups','target_roles','resumes'
  ] loop
    execute format(
      'drop trigger if exists set_updated_at on %I;
       create trigger set_updated_at before update on %I
         for each row execute function set_updated_at();', t, t);
  end loop;
end $$;

-- ============================================================================
-- Row-Level Security — each user sees ONLY their own rows.
-- profiles keys on user_id directly; every other table has a user_id column.
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','experiences','accomplishments','education','awards',
    'skill_groups','target_roles','resumes','job_evaluations'
  ] loop
    execute format('alter table %I enable row level security;', t);

    execute format($f$
      drop policy if exists "own rows select" on %1$I;
      create policy "own rows select" on %1$I
        for select using (user_id = auth.uid());

      drop policy if exists "own rows insert" on %1$I;
      create policy "own rows insert" on %1$I
        for insert with check (user_id = auth.uid());

      drop policy if exists "own rows update" on %1$I;
      create policy "own rows update" on %1$I
        for update using (user_id = auth.uid()) with check (user_id = auth.uid());

      drop policy if exists "own rows delete" on %1$I;
      create policy "own rows delete" on %1$I
        for delete using (user_id = auth.uid());
    $f$, t);
  end loop;
end $$;

-- ============================================================================
-- Auto-create a profile row when a new auth user signs up.
-- ============================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
