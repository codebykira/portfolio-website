import type { Metric, OpenQuestion } from "./schemas";

/* ============================================================
   DB ROW TYPES — mirror the Supabase tables in
   supabase/migrations/0001_resume_builder.sql
   ============================================================ */

export type AccomplishmentStatus = "draft" | "needs_metrics" | "ready";

export interface Experience {
  id: string;
  user_id: string;
  org: string;
  role: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  tagline: string | null;
  link_text: string | null;
  link_href: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Accomplishment {
  id: string;
  user_id: string;
  experience_id: string | null;
  raw_note: string;
  polished: string | null;
  metrics: Metric[];
  themes: string[];
  skills: string[];
  status: AccomplishmentStatus;
  open_questions: OpenQuestion[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TargetRole {
  id: string;
  user_id: string;
  title: string;
  framing: string | null;
  keywords: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ResumeRow {
  id: string;
  user_id: string;
  target_role_id: string | null;
  title: string;
  summary: string | null;
  item_ids: string[];
  composed: unknown; // ParsedResume-shaped snapshot
  created_at: string;
  updated_at: string;
}

export interface JobEvaluationRow {
  id: string;
  user_id: string;
  target_role_id: string | null;
  jd_text: string;
  fit_score: number | null;
  result: unknown;
  created_at: string;
}
