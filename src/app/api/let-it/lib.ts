// Shared bits for the let-it notes API. Notes live as JSON objects in a
// private Supabase Storage bucket — anonymous by design (no user id, no IP).

export const BUCKET = "letit-notes";

export interface StoredNote {
  text: string;
  drawing: string; // data URL or ""
  at: string;
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
