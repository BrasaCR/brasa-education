export const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
export const json = (value, status = 200, extra = {}) => new Response(JSON.stringify(value), { status, headers: { ...headers, ...extra } });
export const httpError = (status, code) => Object.assign(new Error(code), { status, code });
export async function limitedJson(request, maximum = 32768) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > maximum) throw httpError(413, 'request_too_large');
  const text = await request.text(); if (text.length > maximum) throw httpError(413, 'request_too_large');
  try { return JSON.parse(text); } catch { throw httpError(400, 'invalid_json'); }
}
export const failure = (error) => {
  console.error(JSON.stringify({ event: 'school_platform_error', status: error.status || 500, code: error.code || 'internal_error' }));
  return json({ error: error.code || 'internal_error' }, error.status || 500);
};
