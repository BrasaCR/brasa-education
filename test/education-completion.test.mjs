import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
const root = path.resolve(import.meta.dirname, '..');
const readJson = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));

test('every public catalog statistic carries evidence and no unsupported 12,000-subject claim remains', () => {
  const statistics = readJson('catalog-statistics.json');
  assert.ok(statistics.statistics.length >= 4);
  for (const item of statistics.statistics) {
    for (const field of ['id','label','value','display','definition','sourceName','sourceUrl','sourceReviewedAt','verification']) assert.ok(item[field] !== undefined, `${item.id} missing ${field}`);
    assert.match(item.sourceUrl, /^https:\/\//);
  }
  const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(homepage, /12,000\+ subjects/);
  assert.match(homepage, /catalog-methodology\.html/);
});

test('every governed resource exposes the required transparency fields', () => {
  const catalog = readJson('education-resource-catalog.json');
  const required = ['id','title','description','url','provider','source','sourceUrl','reviewedAt','stage','goals','subjects','languages','cost','credential','credentialAuthority','curriculumRelevance','countryRelevance','accessibility','offline','verification'];
  assert.ok(catalog.resources.length >= 6);
  for (const resource of catalog.resources) for (const field of required) assert.ok(resource[field] !== undefined && resource[field] !== '', `${resource.id} missing ${field}`);
});

test('Costa Rica pack cannot claim completion without named review authority', () => {
  const pack = readJson('costa-rica-education-pack.json');
  assert.equal(pack.country.code, 'CR');
  assert.ok(pack.authorities.length >= 4);
  assert.ok(pack.curriculum.controllingSource.startsWith('https://'));
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Mexico pack preserves federal, state, program-recognition and privacy boundaries', () => {
  const pack = readJson('mexico-education-pack.json');
  assert.equal(pack.country.code, 'MX');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /^https:\/\/educacionbasica\.sep\.gob\.mx\//);
  assert.match(pack.schoolDirectory.sourceUrl, /siged\.sep\.gob\.mx/);
  assert.match(pack.higherEducation.authorityNotice, /specific program, campus, modality and issuing authority/i);
  assert.match(pack.higherEducation.stateRecognitionRule, /state-issued RVOE/i);
  assert.match(pack.privacyAndSafeguarding.publicSectorLawSource, /dof\.gob\.mx/);
  assert.ok(pack.officialSourceRegister.length >= 6);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Mexican reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('portable evidence contract does not make a false 1EdTech conformance claim', () => {
  const contract = readJson('contracts/open-badge-profile.v1.json');
  assert.match(contract.description, /not a claim of 1EdTech certification/i);
  assert.ok(contract.required.includes('issuer'));
  assert.ok(contract.required.includes('evidence'));
  assert.ok(contract.properties.status.enum.includes('revoked'));
});

test('offline worker never caches API or private learner records', () => {
  const worker = fs.readFileSync(path.join(root, 'education-sw.js'), 'utf8');
  assert.match(worker, /pathname\.startsWith\('\/api\/'\)/);
  assert.doesNotMatch(worker, /school-admin|session|identity|learner-record/);
});

test('new public learning pages have essential mobile and accessibility foundations', () => {
  for (const name of ['global-education-catalog.html','catalog-methodology.html','learning-pathway.html','credentials-and-interoperability.html']) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    assert.match(html, /<html lang="en">/);
    assert.match(html, /name="viewport"/);
    assert.match(html, /<main/);
    assert.match(html, /<h1/);
  }
  const pathway = fs.readFileSync(path.join(root, 'learning-pathway.html'), 'utf8');
  assert.match(pathway, /prefers-reduced-motion/);
  assert.match(pathway, /aria-label=/);
});
