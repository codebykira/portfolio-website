import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Find-and-replace a literal string across every résumé row the signed-in
 *  user owns (base canvas and all saved job versions). For corrections that
 *  must hold everywhere at once, like a metric that changed. Exact-match,
 *  case-sensitive, no regex. Returns which rows changed. */
const bodySchema = z.object({
  from: z.string().min(1).max(200),
  to: z.string().max(200),
  dry_run: z.boolean().default(false),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.id) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const { from, to, dry_run } = parsed.data;

  const { data: rows, error } = await supabase.from("resumes").select("id, title, composed");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const changed: { id: string; title: string; count: number }[] = [];
  for (const row of rows ?? []) {
    const json = JSON.stringify(row.composed ?? null);
    const count = json.split(from).length - 1;
    if (!count) continue;
    changed.push({ id: row.id as string, title: row.title as string, count });
    if (dry_run) continue;
    const composed = JSON.parse(json.split(from).join(to));
    const { error: upErr } = await supabase.from("resumes").update({ composed }).eq("id", row.id);
    if (upErr) return NextResponse.json({ error: upErr.message, changed }, { status: 500 });
  }
  return NextResponse.json({ changed, dry_run });
}
