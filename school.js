// Cloudflare Pages Function — GET /api/school?slug=<slug>
// Bound to D1 database "brasa-citizens" via binding name DB.
// Returns one school record, or { error } with 400/404/500.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = (url.searchParams.get("slug") || "").trim();
  if (!slug) return json({ error: "Missing slug" }, 400);

  try {
    if (!env.DB) {
      return json({ error: "D1 binding 'DB' is not configured for this Pages project." }, 500);
    }
    const row = await env.DB
      .prepare("SELECT slug, name, type, canton, province, dre, region, level_id, tagline, doc FROM schools WHERE slug = ?")
      .bind(slug)
      .first();
    if (!row) return json({ error: "Not found", slug }, 404);
    return json(row, 200, { "Cache-Control": "public, max-age=300" });
  } catch (err) {
    return json({ error: String(err && err.message || err) }, 500);
  }
}

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extra },
  });
}
