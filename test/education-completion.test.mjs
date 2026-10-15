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

test('Panama pack preserves MEDUCA, directory-vintage, accreditation and safeguarding boundaries', () => {
  const pack = readJson('panama-education-pack.json');
  assert.equal(pack.country.code, 'PA');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /^https:\/\/www\.meduca\.gob\.pa\//);
  assert.match(pack.schoolDirectory.sourceUrl, /meduca\.gob\.pa\/transparencia\/estadisticas/);
  assert.match(pack.schoolDirectory.scopeNotice, /source year and publication date/i);
  assert.match(pack.higherEducation.authorityNotice, /institutional status, legal operation and program accreditation are distinct/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLawSource, /antai\.gob\.pa/);
  assert.match(pack.privacyAndSafeguarding.childrenRightsSource, /senniaf\.gob\.pa/);
  assert.ok(pack.officialSourceRegister.length >= 7);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Panamanian reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Guatemala pack preserves MINEDUC, school-code, higher-education and legal-gap boundaries', () => {
  const pack = readJson('guatemala-education-pack.json');
  assert.equal(pack.country.code, 'GT');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /digecur\.mineduc\.gob\.gt/);
  assert.match(pack.schoolDirectory.sourceUrl, /mineduc\.gob\.gt\/BUSCAESTABLECIMIENTO_GE/);
  assert.match(pack.schoolDirectory.scopeNotice, /multiple codes/i);
  assert.match(pack.higherEducation.privateUniversities.authority, /Consejo de la Enseñanza Privada Superior/);
  assert.match(pack.privacyAndSafeguarding.comprehensiveLawNotice, /must not claim that a proposal is enacted law/i);
  assert.match(pack.privacyAndSafeguarding.childrenRightsSource, /congreso\.gob\.gt/);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Guatemalan reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Belize pack preserves directory vintage, licensing, accreditation and legal commencement boundaries', () => {
  const pack = readJson('belize-education-pack.json');
  assert.equal(pack.country.code, 'BZ');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /moecst\.gov\.bz/);
  assert.match(pack.schoolDirectory.scopeNotice, /directory level and publication date/i);
  assert.match(pack.higherEducation.authorityNotice, /licensing or an institutional listing is not itself proof of external accreditation/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionActSource, /nationalassembly\.gov\.bz/);
  assert.match(pack.privacyAndSafeguarding.commencementNotice, /commencement/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Belizean reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Honduras pack preserves SACE, territorial, higher-education and legal-gap boundaries', () => {
  const pack = readJson('honduras-education-pack.json');
  assert.equal(pack.country.code, 'HN');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /se\.gob\.hn/);
  assert.match(pack.schoolDirectory.scopeNotice, /multiple center records or services/i);
  assert.match(pack.higherEducation.institutionSource, /des\.unah\.edu\.hn/);
  assert.match(pack.privacyAndSafeguarding.comprehensiveLawNotice, /must not present a bill as law/i);
  assert.match(pack.privacyAndSafeguarding.childrenAuthoritySource, /senaf\.gob\.hn/);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Honduran reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Nicaragua pack preserves territorial, curriculum-version, CNEA-category and legal boundaries', () => {
  const pack = readJson('nicaragua-education-pack.json');
  assert.equal(pack.country.code, 'NI');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /mined\.gob\.ni/);
  assert.match(pack.schoolDirectory.scopeNotice, /indicator period and update date/i);
  assert.match(pack.higherEducation.authorityNotice, /does not by itself prove current institutional or program accreditation/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /Ley No\. 787/);
  assert.match(pack.privacyAndSafeguarding.childrenCodeSource, /digesto\.asamblea\.gob\.ni/);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Nicaraguan reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('El Salvador pack preserves directory vintage, curriculum version, program and accreditation boundaries', () => {
  const pack = readJson('el-salvador-education-pack.json');
  assert.equal(pack.country.code, 'SV');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /mined\.gob\.sv/);
  assert.match(pack.schoolDirectory.scopeNotice, /publication date/i);
  assert.match(pack.higherEducation.authorityNotice, /legal establishment, authorization of a named program, title registration and voluntary accreditation are distinct/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionNotice, /consolidated law/i);
  assert.match(pack.privacyAndSafeguarding.childrenLawSource, /conapina\.gob\.sv/);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Salvadoran reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Colombia pack preserves territorial, DUE, program-registration, accreditation and safeguarding boundaries', () => {
  const pack = readJson('colombia-education-pack.json');
  assert.equal(pack.country.code, 'CO');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /mineducacion\.gov\.co/);
  assert.match(pack.schoolDirectory.sourceUrl, /mineducacion\.gov\.co\/buscandocolegio/);
  assert.match(pack.schoolDirectory.scopeNotice, /certified territorial secretariats/i);
  assert.match(pack.higherEducation.authorityNotice, /mandatory registro calificado.*voluntary time-limited high-quality accreditation/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionAuthoritySource, /sic\.gov\.co/);
  assert.match(pack.privacyAndSafeguarding.childrenAuthoritySource, /icbf\.gov\.co/);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Colombian reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Brazil pack preserves federal, census-vintage, course-act, language and safeguarding boundaries', () => {
  const pack = readJson('brazil-education-pack.json');
  assert.equal(pack.country.code, 'BR');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /basenacionalcomum\.mec\.gov\.br/);
  assert.match(pack.schoolDirectory.sourceUrl, /gov\.br\/inep/);
  assert.match(pack.schoolDirectory.scopeNotice, /annually updated Censo Escolar declarations/i);
  assert.match(pack.higherEducation.authorityNotice, /course authorization, recognition or renewal of recognition/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionAuthoritySource, /gov\.br\/anpd/);
  assert.match(pack.privacyAndSafeguarding.childrenLawSource, /planalto\.gov\.br/);
  assert.match(pack.culturalAndLanguageRequirements.rule, /Indigenous and Quilombola curricula.*Libras/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Brazilian reviewer');
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
