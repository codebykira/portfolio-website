-- ============================================================================
-- Dead Letters — the anonymous one-in-one-out note pool (/dead-letters)
--
-- Product model:
--   write a note ──▶ crumple it onto the table ──▶ uncrumple a stranger's
--
-- Anonymous by design: no user_id, no IP, no session — there is deliberately
-- nothing here that could tie a note back to whoever left it. Row-Level
-- Security is enabled with NO policies, so anon and authenticated callers can
-- read nothing at all; only the server's secret key (which bypasses RLS)
-- touches this table, via /api/dead-letters.
--
-- The table name keeps the original `letit_notes` used by
-- src/app/api/dead-letters/lib.ts (TABLE).
--
-- Until now the notes have lived in the private `letit-notes` storage bucket,
-- which the API falls back to whenever this table is absent. Creating it
-- switches both routes onto the table automatically; the existing notes are
-- backfilled separately by scripts/backfill-dead-letters.mjs.
--
-- Run this in the Supabase SQL editor (project: nqkvglsxifpalwznlmaz).
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.letit_notes (
  id      uuid primary key default gen_random_uuid(),
  -- Scrubbed and capped server-side before it ever gets here; these are the
  -- backstop so a bug upstream cannot fill the table with unbounded blobs.
  text    text not null default '' check (char_length(text) <= 240),
  -- A PNG/WebP data URL, or '' when the note was typed rather than drawn.
  drawing text not null default '' check (char_length(drawing) <= 400000),
  at      timestamptz not null default now(),
  -- A note has to actually be something.
  constraint letit_notes_not_empty check (text <> '' or drawing <> '')
);

-- The reader draws at random from recent notes, and old paper eventually gets
-- swept off the table; both want `at` ordered.
create index if not exists letit_notes_at_idx on public.letit_notes (at desc);

-- Locked to the server. Enabling RLS without adding a single policy is the
-- point: it denies everyone except the service role.
alter table public.letit_notes enable row level security;

-- Belt and braces — RLS already blocks these, but do not hand out the grants.
revoke all on public.letit_notes from anon, authenticated;

comment on table public.letit_notes is
  'Dead Letters: anonymous notes. No author column by design. Server-only via RLS.';
