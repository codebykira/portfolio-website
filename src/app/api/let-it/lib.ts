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

/** True when a PostgREST response means "the table isn't there yet". */
export function tableMissing(status: number): boolean {
  return status === 404 || status === 406;
}
