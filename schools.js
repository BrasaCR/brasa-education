// Cloudflare Pages Function — GET /api/schools?province=<name|Others>
// Bound to D1 database "brasa-citizens" via binding name DB.
// Returns { province, count, schools: [{ name, type, canton, dre, slug }] }

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const province = (url.searchParams.get("province") || "").trim();

  let sql, params;
  if (province === "" || province === "Others" || province === "Other regions") {
    sql = "SELECT name, type, canton, dre, slug FROM schools WHERE province IS NULL ORDER BY name";
    params = [];
  } else {
    sql = "SELECT name, type, canton, dre, slug FROM schools WHERE province = ? ORDER BY canton, name";
    params = [province];
  }

  try {
    if (!env.DB) {
      return json({ error: "D1 binding 'DB' is not configured for this Pages project." }, 500);
    }
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(
      { province: province || "Others", count: results.length, schools: results },
      200,
      { "Cache-Control": "public, max-age=300" }
    );
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
