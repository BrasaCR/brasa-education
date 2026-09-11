const baseUrl = String(process.env.STAGING_BASE_URL || '').replace(/\/$/, '');
const schoolId = process.env.STAGING_SCHOOL_ID || '';
if (!/^https:\/\//.test(baseUrl)) throw new Error('STAGING_BASE_URL must be an https URL');
if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(schoolId)) throw new Error('STAGING_SCHOOL_ID must identify a seeded preview school');
const path = `/api/v1/schools/${encodeURIComponent(schoolId)}/lessons?locale=en`;
const response = await fetch(`${baseUrl}${path}`, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
const body = await response.json();
if (!response.ok || !Array.isArray(body.data)) throw new Error(`${path} failed (${response.status})`);
console.log(JSON.stringify({ check: path, status: response.status, lessons: body.data.length }));
