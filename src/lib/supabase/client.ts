import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for use in Client Components (browser). RLS enforces that a
 *  user only ever reads/writes their own rows, so this is safe to use directly
 *  from the browser for CRUD. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
