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

test('Peru pack preserves service, census-vintage, licensing, language and safeguarding boundaries', () => {
  const pack = readJson('peru-education-pack.json');
  assert.equal(pack.country.code, 'PE');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /minedu\.gob\.pe/);
  assert.match(pack.schoolDirectory.sourceUrl, /escale\.minedu\.gob\.pe/);
  assert.match(pack.schoolDirectory.scopeNotice, /educational services and programs, not necessarily one-to-one institutions/i);
  assert.match(pack.higherEducation.authorityNotice, /institutional licensing, licensed premises, authorized programs/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionAuthoritySource, /gob\.pe\/anpd/);
  assert.match(pack.privacyAndSafeguarding.childrenLawSource, /gob\.pe\/institucion\/congreso/);
  assert.match(pack.culturalAndLanguageRequirements.rule, /policy proposal under prior consultation as enacted policy/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Peruvian reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Chile pack preserves RBD, recognition, accreditation, consultation and legal-transition boundaries', () => {
  const pack = readJson('chile-education-pack.json');
  assert.equal(pack.country.code, 'CL');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /curriculumnacional\.cl/);
  assert.match(pack.schoolDirectory.sourceUrl, /mi\.mineduc\.cl\/mime-web/);
  assert.match(pack.schoolDirectory.scopeNotice, /does not by itself prove current official recognition/i);
  assert.match(pack.higherEducation.authorityNotice, /Official recognition.*institutional accreditation.*program's accreditation/i);
  assert.match(pack.privacyAndSafeguarding.futureReform, /1 December 2026.*must not apply.*before that date/i);
  assert.match(pack.culturalAndLanguageRequirements.rule, /proposal under Indigenous consultation must not be presented as an approved curriculum/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Chilean reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Bolivia pack preserves unit-year, program, regional-curriculum and legal-gap boundaries', () => {
  const pack = readJson('bolivia-education-pack.json');
  assert.equal(pack.country.code, 'BO');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /minedu\.gob\.bo/);
  assert.match(pack.schoolDirectory.sourceUrl, /seie\.minedu\.gob\.bo/);
  assert.match(pack.schoolDirectory.scopeNotice, /displays a management year.*does not by itself prove current authorization/i);
  assert.match(pack.higherEducation.authorityNotice, /Autonomous public-university status.*private-university institutional authorization.*program/i);
  assert.match(pack.privacyAndSafeguarding.pendingBillNotice, /must not be presented as enacted law/i);
  assert.match(pack.culturalAndLanguageRequirements.rule, /regionalized and diversified curricula.*relevant Indigenous Original Peasant Nations and Peoples/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Bolivian reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Uruguay pack preserves center-vintage, authority, recognition, accreditation and LSU boundaries', () => {
  const pack = readJson('uruguay-education-pack.json');
  assert.equal(pack.country.code, 'UY');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /anep\.edu\.uy\/documentos-curriculares/);
  assert.match(pack.schoolDirectory.sourceUrl, /sig\.anep\.edu\.uy\/SIGANEP/);
  assert.match(pack.schoolDirectory.scopeNotice, /different update dates by subsystem.*does not by itself prove/i);
  assert.match(pack.higherEducation.authorityNotice, /Authorization of a private institution.*autonomous status of a public university.*ARCU-SUR/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /18\.331/);
  assert.match(pack.privacyAndSafeguarding.childrenLaw, /17\.823/);
  assert.match(pack.culturalAndLanguageRequirements.rule, /Lengua de Señas Uruguaya.*not as a Spanish translation feature/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Uruguayan reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Paraguay pack preserves data-vintage, habilitation, accreditation, privacy-transition and language boundaries', () => {
  const pack = readJson('paraguay-education-pack.json');
  assert.equal(pack.country.code, 'PY');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /mec\.gov\.py/);
  assert.match(pack.schoolDirectory.sourceUrl, /datos\.gov\.py\/dataset\/directorio-de-instituciones/);
  assert.match(pack.schoolDirectory.scopeNotice, /October 2019 modification date.*does not by itself prove current operation/i);
  assert.match(pack.higherEducation.authorityNotice, /CONES habilitation.*ANEAES.*accreditation/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /7593\/2025/);
  assert.match(pack.privacyAndSafeguarding.authorityStatus, /operational status.*implementing decree.*must be confirmed/i);
  assert.match(pack.privacyAndSafeguarding.childrenLaw, /1680/);
  assert.match(pack.culturalAndLanguageRequirements.rule, /Spanish and Guaraní.*not be treated as a substitute for all Indigenous languages/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Paraguayan reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Argentina pack preserves federal, CUE, curriculum, title-validity, accreditation and EIB boundaries', () => {
  const pack = readJson('argentina-education-pack.json');
  assert.equal(pack.country.code, 'AR');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /argentina\.gob\.ar\/nucleos-de-aprendizaje-prioritarios/);
  assert.match(pack.curriculum.supplementPolicy, /NAP.*do not replace provincial or City of Buenos Aires curricular designs/i);
  assert.match(pack.schoolDirectory.sourceUrl, /argentina\.gob\.ar\/node\/246613/);
  assert.match(pack.schoolDirectory.scopeNotice, /CUE or map record does not by itself prove current authorization/i);
  assert.match(pack.higherEducation.authorityNotice, /official recognition and national validity.*CONEAU accreditation/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /25\.326/);
  assert.match(pack.privacyAndSafeguarding.childrenLaw, /26\.061/);
  assert.match(pack.culturalAndLanguageRequirements.rule, /permanent participation.*Indigenous peoples/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Argentine reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Guyana pack preserves regional, school-list, curriculum, NAC and Indigenous-community boundaries', () => {
  const pack = readJson('guyana-education-pack.json');
  assert.equal(pack.country.code, 'GY');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /education\.gov\.gy\/web2\/index\.php\/students-resources/);
  assert.match(pack.curriculum.supplementPolicy, /CXC.*must not silently replace the Guyana national curriculum/i);
  assert.match(pack.schoolDirectory.sourceUrl, /list-of-schools/);
  assert.match(pack.schoolDirectory.scopeNotice, /listing does not by itself prove current operation/i);
  assert.match(pack.higherEducation.authorityNotice, /registration.*is not institutional accreditation/i);
  assert.match(pack.higherEducation.authorityNotice, /protected institutional title/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /Act No\. 18 of 2023/);
  assert.match(pack.privacyAndSafeguarding.childrenLaw, /Act No\. 17 of 2009/);
  assert.match(pack.privacyAndSafeguarding.scopeNotice, /Commencement.*Data Protection Commissioner/i);
  assert.match(pack.culturalAndLanguageRequirements.rule, /relevant people, village and community/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Guyanese reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Suriname pack preserves centralized, school-list, curriculum, NOVA and multilingual boundaries', () => {
  const pack = readJson('suriname-education-pack.json');
  assert.equal(pack.country.code, 'SR');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /gov\.sr.*directoraat-algemeen-vormend-onderwijs/);
  assert.match(pack.curriculum.supplementPolicy, /policy intention or pilot must not be presented as an effective nationwide curriculum/i);
  assert.match(pack.schoolDirectory.sourceUrl, /gov\.sr.*over-ons/);
  assert.match(pack.schoolDirectory.scopeNotice, /listing does not by itself prove current operation/i);
  assert.match(pack.higherEducation.authorityNotice, /distinguishes recognition from accreditation/i);
  assert.match(pack.higherEducation.authorityNotice, /accredited program does not make every program at the institution accredited/i);
  assert.match(pack.privacyAndSafeguarding.privacyDraft, /Wet Bescherming Privacy en Persoonsgegevens/);
  assert.match(pack.privacyAndSafeguarding.scopeNotice, /marked ONTWERP.*not be represented as enacted law/i);
  assert.match(pack.culturalAndLanguageRequirements.rule, /relevant community.*interior education/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Surinamese reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('French Guiana pack preserves French, territorial, UAI, diploma and community boundaries', () => {
  const pack = readJson('french-guiana-education-pack.json');
  assert.equal(pack.country.code, 'GF');
  assert.match(pack.country.jurisdictionNotice, /not a sovereign state/i);
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.curriculum.controllingSource, /eduscol\.education\.gouv\.fr/);
  assert.match(pack.curriculum.supplementPolicy, /draft program.*must not be presented as already effective/i);
  assert.match(pack.schoolDirectory.sourceUrl, /data\.education\.gouv\.fr/);
  assert.match(pack.schoolDirectory.scopeNotice, /UAI or directory entry does not by itself prove current operation/i);
  assert.match(pack.higherEducation.authorityNotice, /only to the diplomas listed in the controlling arrêté and annex/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionFramework, /General Data Protection Regulation/);
  assert.match(pack.culturalAndLanguageRequirements.rule, /relevant community and competent customary representatives/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Guyanese/French reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Algeria pack preserves directory-gap, phased-curriculum, habilitation, privacy and language boundaries', () => {
  const pack = readJson('algeria-education-pack.json');
  assert.equal(pack.country.code, 'DZ');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 5);
  assert.match(pack.schoolDirectory.coverageStatus, /directory-not-verified/i);
  assert.match(pack.schoolDirectory.scopeNotice, /must not fabricate school records/i);
  assert.match(pack.curriculum.implementationRule, /beginning in 2026–2027.*must not be retroactively applied/i);
  assert.match(pack.higherEducation.authorityNotice, /institution status.*habilitation of the exact training offer/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /18-07.*25-11/);
  assert.match(pack.privacyAndSafeguarding.childrenLaw, /15-12/);
  assert.match(pack.culturalAndLanguageRequirements.rule, /Arabic and Tamazight are official.*French and English.*distinct/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Algerian reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Angola pack preserves directory-gap, curriculum, accreditation, privacy and language boundaries', () => {
  const pack = readJson('angola-education-pack.json');
  assert.equal(pack.country.code, 'AO');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 6);
  assert.match(pack.schoolDirectory.coverageStatus, /directory-not-verified/i);
  assert.match(pack.schoolDirectory.scopeNotice, /must not fabricate schools/i);
  assert.match(pack.curriculum.implementationRule, /do not by themselves prove the complete current curriculum/i);
  assert.match(pack.higherEducation.authorityNotice, /institution.*not proof that every current campus, course or program.*accredited/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /22\/11/);
  assert.match(pack.privacyAndSafeguarding.childrenLaw, /25\/12/);
  assert.match(pack.culturalAndLanguageRequirements.rule, /Portuguese.*national languages.*Angolan Sign Language.*distinct/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Angolan reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Benin pack preserves subsector, directory-gap, statistic, program, privacy and language boundaries', () => {
  const pack = readJson('benin-education-pack.json');
  assert.equal(pack.country.code, 'BJ');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 6);
  assert.match(pack.governanceModel.summary, /separate ministries/i);
  assert.match(pack.schoolDirectory.coverageStatus, /directory-not-verified/i);
  assert.match(pack.educationStatistics.scopeNotice, /different current school total.*must be reconciled/i);
  assert.match(pack.higherEducation.authorityNotice, /does not authorize every program or prove accreditation/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /2017-20.*2020-35/);
  assert.match(pack.privacyAndSafeguarding.childrenLaw, /2015-08/);
  assert.match(pack.culturalAndLanguageRequirements.rule, /French.*national languages.*distinct/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Beninese reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Botswana pack preserves register, curriculum, statistics, BQA, privacy and language boundaries', () => {
  const pack = readJson('botswana-education-pack.json');
  assert.equal(pack.country.code, 'BW');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 6);
  assert.match(pack.schoolDirectory.coverageStatus, /register-exists.*directory-not-verified/i);
  assert.match(pack.curriculum.implementationRule, /strategy.*pilot.*does not.*controlling current syllabus/i);
  assert.match(pack.educationStatistics.scopeNotice, /observation or academic year separately from its release date/i);
  assert.match(pack.higherEducationAndTVET.authorityNotice, /provider.*does not prove.*every learning programme.*every qualification/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /2024.*18.*14 January 2025/i);
  assert.match(pack.privacyAndSafeguarding.childrenLaw, /2009/);
  assert.match(pack.privacyAndSafeguarding.scopeNotice, /proposal or review.*not enacted law/i);
  assert.match(pack.culturalAndLanguageRequirements.rule, /English, Setswana.*community languages.*distinct/i);
  assert.ok(pack.officialSourceRegister.length >= 8);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Botswana reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Burkina Faso pack preserves subsector, directory, statistics, programme, privacy and language boundaries', () => {
  const pack = readJson('burkina-faso-education-pack.json');
  assert.equal(pack.country.code, 'BF');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 7);
  assert.match(pack.governanceModel.summary, /divided among.*basic.*secondary.*higher education/i);
  assert.match(pack.schoolDirectory.coverageStatus, /directory-not-verified/i);
  assert.match(pack.curriculum.implementationRule, /sector plan.*pilot.*not proof.*controlling current curriculum/i);
  assert.match(pack.educationStatistics.scopeNotice, /released in 2025.*2023–2024.*not 2025 enrollment data/i);
  assert.match(pack.higherEducationAndTVET.authorityNotice, /monitoring classification is not automatic authorization or accreditation/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /001-2021.*30 March 2021/i);
  assert.match(pack.privacyAndSafeguarding.childrenLaw, /015-2014.*13 May 2014/i);
  assert.match(pack.culturalAndLanguageRequirements.rule, /French, Mooré, Dioula, Fulfuldé.*distinct/i);
  assert.ok(pack.officialSourceRegister.length >= 9);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Burkinabè reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Burundi pack preserves territorial, statistical, curriculum, higher-status, privacy and language boundaries', () => {
  const pack = readJson('burundi-education-pack.json');
  assert.equal(pack.country.code, 'BI');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 7);
  assert.match(pack.schoolDirectory.coverageStatus, /directory-not-verified/i);
  assert.match(pack.educationStatistics.scopeNotice, /uploaded in 2024 or 2025.*2022–2023.*not current 2025 data/i);
  assert.match(pack.curriculum.implementationRule, /reform history.*experiment.*not the controlling current programme/i);
  assert.match(pack.higherEducationAndTVET.authorityNotice, /quality-evaluation scores are not programme accreditation/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /1\/03.*10 March 2026/i);
  assert.match(pack.privacyAndSafeguarding.scopeNotice, /new.*commencement.*supervisory authority.*implementing measures/i);
  assert.match(pack.culturalAndLanguageRequirements.rule, /Kirundi, French, English and Kiswahili.*distinct/i);
  assert.ok(pack.officialSourceRegister.length >= 9);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Burundian reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Cabo Verde pack preserves network, curriculum, qualification, accreditation, privacy and language boundaries', () => {
  const pack = readJson('cabo-verde-education-pack.json');
  assert.equal(pack.country.code, 'CV');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 7);
  assert.match(pack.schoolDirectory.coverageStatus, /directory-not-verified/i);
  assert.match(pack.curriculum.implementationRule, /excludes.*youth and adult.*must not be expanded/i);
  assert.match(pack.vocationalQualifications.authorityNotice, /qualification in the CNQ does not prove.*provider/i);
  assert.match(pack.higherEducation.authorityNotice, /Institution accreditation.*exact study cycle.*separate claims/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /133\/V\/2001.*41\/VIII\/2013.*121\/IX\/2021/i);
  assert.match(pack.privacyAndSafeguarding.childrenLaw, /72\/X\/2026.*22 April/i);
  assert.match(pack.culturalAndLanguageRequirements.rule, /Portuguese and the Cape Verdean language.*distinct/i);
  assert.ok(pack.officialSourceRegister.length >= 9);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Cabo Verde reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Cameroon pack preserves subsystem, directory, statistics, higher-status, privacy and language boundaries', () => {
  const pack = readJson('cameroon-education-pack.json');
  assert.equal(pack.country.code, 'CM');
  assert.equal(pack.status, 'reference-pack-in-review');
  assert.ok(pack.authorities.length >= 7);
  assert.match(pack.schoolDirectory.coverageStatus, /directory-not-verified/i);
  assert.match(pack.curriculum.implementationRule, /two distinct subsystems.*not proof of the controlling 2026 version/i);
  assert.match(pack.educationStatistics.scopeNotice, /2023–2024 school year.*publication date/i);
  assert.match(pack.higherEducation.authorityNotice, /institution listing does not authorize every program/i);
  assert.match(pack.higherEducation.authorityNotice, /no private higher-education institution.*authorized to offer a PhD/i);
  assert.match(pack.privacyAndSafeguarding.dataProtectionLaw, /2024\/017.*23 December 2024/i);
  assert.match(pack.privacyAndSafeguarding.scopeNotice, /No single verified consolidated current Child Code was located/i);
  assert.match(pack.culturalAndLanguageRequirements.rule, /English and French education subsystems are distinct/i);
  assert.ok(pack.officialSourceRegister.length >= 9);
  if (pack.status === 'complete') {
    assert.ok(pack.review.reviewer, 'complete pack requires a named Cameroonian reviewer');
    assert.equal(pack.review.verificationStatus, 'verified');
  }
});

test('Africa rollout accounts for all 54 sovereign states without generic completion claims', () => {
  const rollout = readJson('africa-education-rollout.json');
  assert.equal(rollout.countries.length, 54);
  assert.equal(new Set(rollout.countries.map(country => country.code)).size, 54);
  assert.equal(new Set(rollout.countries.map(country => country.slug)).size, 54);
  assert.ok(rollout.requiredGates.length >= 10);
  assert.match(rollout.policy, /never replace current national and subnational official sources/i);
  assert.ok(rollout.countries.every(country => country.status !== 'complete'));
  const algeria = rollout.countries.find(country => country.code === 'DZ');
  assert.equal(algeria.status, 'reference-pack-in-review');
  assert.equal(algeria.packUrl, '/algeria-education-pack.json');
  const angola = rollout.countries.find(country => country.code === 'AO');
  assert.equal(angola.status, 'reference-pack-in-review');
  assert.equal(angola.packUrl, '/angola-education-pack.json');
  const benin = rollout.countries.find(country => country.code === 'BJ');
  assert.equal(benin.status, 'reference-pack-in-review');
  assert.equal(benin.packUrl, '/benin-education-pack.json');
  const botswana = rollout.countries.find(country => country.code === 'BW');
  assert.equal(botswana.status, 'reference-pack-in-review');
  assert.equal(botswana.packUrl, '/botswana-education-pack.json');
  const burkinaFaso = rollout.countries.find(country => country.code === 'BF');
  assert.equal(burkinaFaso.status, 'reference-pack-in-review');
  assert.equal(burkinaFaso.packUrl, '/burkina-faso-education-pack.json');
  const burundi = rollout.countries.find(country => country.code === 'BI');
  assert.equal(burundi.status, 'reference-pack-in-review');
  assert.equal(burundi.packUrl, '/burundi-education-pack.json');
  const caboVerde = rollout.countries.find(country => country.code === 'CV');
  assert.equal(caboVerde.status, 'reference-pack-in-review');
  assert.equal(caboVerde.packUrl, '/cabo-verde-education-pack.json');
  const cameroon = rollout.countries.find(country => country.code === 'CM');
  assert.equal(cameroon.status, 'reference-pack-in-review');
  assert.equal(cameroon.packUrl, '/cameroon-education-pack.json');
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
