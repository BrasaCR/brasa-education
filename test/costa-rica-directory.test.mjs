import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const index = await readFile(path.join(root, 'index.html'), 'utf8');
const schools = await readFile(path.join(root, 'schools.html'), 'utf8');
const school = await readFile(path.join(root, 'school.html'), 'utf8');
const connection = await readFile(path.join(root, 'the-brasa-school.html'), 'utf8');
const portal = await readFile(path.join(root, 'school-portal.html'), 'utf8');
const registry = 'https://brasa-education-api.richard-bad.workers.dev/costa-rica/';

test('Costa Rica tiles use the canonical school registry', () => {
  const links = [...index.matchAll(/href="([^"]+)" class="feature"/g)]
    .map(match => match[1])
    .filter(href => href.startsWith(registry + 'schools/'));
  assert.equal(links.length, 8);
  for (const region of ['San%20Jos%C3%A9', 'Alajuela', 'Puntarenas', 'Guanacaste', 'Lim%C3%B3n', 'Cartago', 'Heredia']) {
    assert.ok(links.some(link => link.endsWith(`?region=${region}`)));
  }
});

test('legacy directory and profile pages redirect to the canonical registry', () => {
  assert.match(schools, /location\.replace\(target\.href\)/);
  assert.match(schools, /costa-rica\/schools\//);
  assert.match(school, /costa-rica\/school\//);
  assert.match(school, /location\.replace/);
});

test('legacy directory fallback does not display escaped Unicode', () => {
  assert.doesNotMatch(schools, /href="index\.html">\\u2190/);
  assert.doesNotMatch(schools, /Loading\\u2026<\/h1>/);
  assert.doesNotMatch(schools, /placeholder="Search by name\\u2026"/);
  assert.doesNotMatch(schools, /registry \\u00B7 Schools/);
});

test('school profiles can enter the BRASA connection flow', () => {
  assert.match(connection, /selectedSchoolId=connectionParams\.get\('school_id'\)/);
  assert.match(connection, /selectedSchoolName=connectionParams\.get\('school_name'\)/);
  assert.match(connection, /school-portal\.html/);
  assert.match(portal, /params\.get\('school_id'\)/);
});

test('every selected Costa Rica school receives a website action', () => {
  assert.match(connection, /verifiedSchoolWebsites=\{'250286':'https:\/\/criacademy\.com\/'\}/);
  assert.match(connection, /Open verified school website/);
  assert.match(connection, /Find the school website/);
  assert.match(connection, /official website '\+selectedSchoolName\+' Costa Rica/);
});
