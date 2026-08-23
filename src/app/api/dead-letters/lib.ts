// Shared bits for the let-it notes API. Notes live in the `letit_notes` table
// (visible in Supabase's Table editor); a private Storage bucket is the
// fallback until the table exists. Anonymous by design — no user id, no IP.

export const BUCKET = "letit-notes";
export const TABLE = "letit_notes";

export interface StoredNote {
  id?: string;
  text: string;
  drawing: string; // data URL or ""
  at?: string;
}

export function supa(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_LETIT_URL;
  const key = process.env.SUPABASE_LETIT_SECRET_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function storageHeaders(key: string): HeadersInit {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

/** A fetch that never throws.
 *
 * If the Supabase project is deleted or renamed, DNS fails and `fetch` rejects.
 * Uncaught, that surfaces as a bodyless 500 — which reads like a bug in this
 * app rather than a missing backend. Returning null lets callers answer 503,
 * which is what "the pool isn't there" actually means.
 */
export async function reach(input: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(input, init);
  } catch {
    return null;
  }
}

/** True when the project itself is down rather than the table being absent.
 *
 * A paused Supabase project still resolves — Cloudflare answers, but there is
 * no origin behind it, so you get a 521/522/523. That is "come back later",
 * not "this table does not exist", and it must not be mistaken for the
 * table-missing path that falls through to the storage bucket.
 */
export function projectDown(status: number): boolean {
  return status >= 500;
}

/** True when a PostgREST response means "the table isn't there yet". */
export function tableMissing(status: number): boolean {
  return status === 404 || status === 406;
}
