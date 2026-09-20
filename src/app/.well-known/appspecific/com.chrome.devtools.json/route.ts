/**
 * Chrome DevTools (136+) probes this path on every page load to see whether the
 * site maps to a local folder — its "Automatic Workspace Folders" feature. We
 * do not serve a mapping, but answering 204 instead of 404 keeps the dev server
 * log clean.
 *
 * Deliberately not a file in public/: the real payload is an absolute path to
 * this checkout plus a uuid, and public/ ships to production. If you ever do
 * want DevTools editing local files, add it here behind a
 * `process.env.NODE_ENV === "development"` check so it cannot leak.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(null, { status: 204 });
}
