# Résumé Builder — Build Plan

A multi-user product layered onto the existing `/resume` renderer. Users capture
work as free-flow notes; AI rewrites them résumé-style and chases down missing
metrics; users define target roles; the app composes tailored résumés and
evaluates strength against a pasted job description.

## Mental model

```
Accomplishment Bank ──(filter + reframe for)──▶ Target Role ──▶ Résumé (existing ResumeDoc)
   (notes, résumé-written)                        (the lens)         (download / share PDF)
        ▲
        └── Job Description ──▶ Strength Evaluation (which bank items back which requirement)
```

The existing `product` / `design` / `ai` variants are just three **target roles**
projecting one shared history. This product generalizes that.

## Stack (reuses what's already here)

- **AI**: AI SDK v7 `generateObject` through the Vercel AI Gateway (`AI_GATEWAY_API_KEY`,
  model `openai/gpt-5.4-mini`) — same pattern as `src/app/api/parse-resume/route.ts`.
- **Validation**: Zod v4 schemas, shared between the API route and the client.
- **DB/Auth**: Supabase (project `jzixhlbqymhcwscuqvik`), Postgres + Auth + RLS.
- **Render**: existing `ResumeDoc` + `/api/resume-pdf` — compose feeds them a `Resume` JSON.

## Data model

See `supabase/migrations/0001_resume_builder.sql`. Tables (all RLS-scoped to
`auth.uid()`):

| Table | Purpose |
|---|---|
| `profiles` | 1 row/user — name, location, contact[] (résumé header) |
| `experiences` | jobs: org, role, dates, tagline, link |
| `accomplishments` | **the bank** — `raw_note`, `polished`, `metrics`, `themes`, `skills`, `status`, `open_questions` |
| `education` / `awards` / `skill_groups` | supporting sections |
| `target_roles` | title + framing + keywords (the lens) |
| `resumes` | role + selected item_ids + composed `Resume` JSON |
| `job_evaluations` | jd_text + fit_score + result JSON |

`accomplishments.status`: `draft → needs_metrics → ready`.

## Env vars (`.env.local`, none committed)

```
NEXT_PUBLIC_SUPABASE_URL=https://jzixhlbqymhcwscuqvik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>   # needed to wire the client
SUPABASE_SERVICE_ROLE_KEY=<service role>          # server-only, optional (migrations/admin)
AI_GATEWAY_API_KEY=<already configured>
```

## The three AI flows (all `generateObject` + Zod)

**1. Note → résumé bullet + metric clarification**
`POST /api/bank` with `{ raw_note, experience_id }` →
```
{ polished, metrics:[{label,value,verified}], themes[], skills[],
  open_questions:[{id,question}] }
```
If a metric is vague ("grew the user base"), it becomes an `open_question`
("From what to what, over what period?") and `status = needs_metrics`.
`POST /api/bank/:id/clarify` with the answers → re-polish → `status = ready`.
Structured Q&A surfaced as inline inputs — not open chat.

**2. Compose résumé**
`POST /api/resume/compose` with `{ target_role_id, item_ids? }` → selects bank
items (by `themes`/`keywords` if not hand-picked), reframes them through the
role's `framing`, and returns a `Resume` JSON snapshot stored in `resumes`.
Rendered by the existing `ResumeDoc`; PDF via existing `/api/resume-pdf`.

**3. Strength evaluation**
`POST /api/evaluate` with `{ jd_text, target_role_id? }` → extract JD
requirements → match each against the bank → 
```
{ fit_score, requirements:[{need, coverage: strong|partial|gap, evidence_ids[]}],
  gaps[], positioning }
```
"Compose a résumé tuned to this JD" reuses flow #2 seeded with the matched items.

> Scale note: one user's bank fits in a single prompt, so match with the bank
> in-context. Add pgvector only if a bank grows into the hundreds of items.

## App structure

- Keep `/resume` (renderer + variants) unchanged.
- New `/builder` (auth-gated) with four sections:
  - **Bank** — note composer, clarification chips, grouped by experience
  - **Roles** — manage target roles (title, framing, keywords)
  - **Compose** — pick a role → generate → open in `ResumeDoc`
  - **Strength** — paste JD → evaluation
- `src/lib/supabase/` — `client.ts` (browser), `server.ts` (RSC/route handlers via `@supabase/ssr`)
- `middleware.ts` — refresh session + protect `/builder`

## Phases

- **P0 — Foundation**: run migration; add `@supabase/supabase-js` + `@supabase/ssr`;
  supabase client/server helpers; env vars.
- **P1 — Auth**: signup/login (Supabase Auth), session middleware, `/builder` guard,
  profile auto-created by the `handle_new_user` trigger.
- **P2 — Bank flow** (first real feature): experiences CRUD, note composer,
  `/api/bank` extract, `/api/bank/:id/clarify` metric loop, bank list UI.
- **P3 — Roles**: target_roles CRUD.
- **P4 — Compose**: `/api/resume/compose` → `resumes` → render in `ResumeDoc` + PDF.
- **P5 — Strength**: `/api/evaluate` → results UI → "tune résumé to this JD".

## Open questions to resolve before P1

- Auth method: email magic link vs. email+password vs. OAuth (Google)?
- Should the existing `resumeData.ts` (Kira's data) be seeded into the DB as the
  first user's rows, or stay a static fallback?
- Import path: reuse `/api/parse-resume` to bootstrap a bank from an uploaded PDF?
