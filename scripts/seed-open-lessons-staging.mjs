import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DATABASE='brasa-education-staging',SCHOOL='brasa-open-staging',ACTOR='BRASA-SYSTEM-STAGING';
const wrangler=fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url));
const text=value=>`'${String(value).replaceAll("'","''")}'`;
const TOPICS=[
  ['customer-service','Customer service and hospitality foundations','Fundamentos de servicio al cliente y hospitalidad','Practice clear communication, respectful service, and safe escalation.','Practique la comunicación clara, el servicio respetuoso y la escalación segura.'],
  ['operations','Small-business operations and logistics','Operaciones y logística para pequeños negocios','Plan a bounded workflow for inventory, scheduling, delivery, and daily operations.','Planifique un flujo limitado para inventario, horarios, entregas y operaciones diarias.'],
  ['safety','Workplace safety foundations','Fundamentos de seguridad laboral','Identify hazards, use appropriate protection, and pause work beyond your training.','Identifique peligros, use la protección adecuada y detenga trabajos fuera de su capacitación.'],
  ['digital-commerce','Digital commerce foundations','Fundamentos de comercio digital','Describe an offer clearly, protect customer information, and review costs before selling.','Describa una oferta con claridad, proteja los datos del cliente y revise los costos antes de vender.'],
  ['sustainability','Sustainable work foundations','Fundamentos de trabajo sostenible','Consider materials, energy, waste, and local environmental requirements before acting.','Considere materiales, energía, residuos y requisitos ambientales locales antes de actuar.']
];
export const LESSON_IDS=Object.freeze(TOPICS.flatMap(([slug])=>['en','es'].map(locale=>`brasa-open-${slug}-${locale}`)));

export function seedSql(now=new Date()){
  const at=now.toISOString(),school=`INSERT INTO school_tenants(id,slug,name,country_code,default_locale,status,public_profile,created_at,updated_at,supported_locales_json,brand_primary_color,support_url) VALUES (${text(SCHOOL)},${text(SCHOOL)},'BRASA Open · Staging Learning','CR','en','active',1,${text(at)},${text(at)},'["en","es"]','#8c3a1f','https://brasa.education') ON CONFLICT(id) DO UPDATE SET name=excluded.name,status='active',public_profile=1,supported_locales_json=excluded.supported_locales_json,updated_at=excluded.updated_at`;
  const lessons=TOPICS.flatMap(([slug,enTitle,esTitle,enSummary,esSummary])=>[['en',enTitle,enSummary],['es',esTitle,esSummary]].map(([locale,title,summary])=>{
    const id=`brasa-open-${slug}-${locale}`,body={blocks:[{type:'paragraph',text:summary},{type:'checklist',items:locale==='es'?['Comprenda el trabajo','Revise la seguridad y los límites','Practique un paso pequeño','Busque orientación local cuando sea necesaria']:['Understand the work','Review safety and boundaries','Practice one small step','Seek local guidance when needed']}]},accessibility={language:locale,plainLanguage:true,noTimedInteraction:true};
    return `INSERT INTO school_lessons(id,school_id,slug,locale,title,summary,body_json,accessibility_json,offline_eligible,status,created_by,updated_by,published_at,created_at,updated_at) VALUES (${text(id)},${text(SCHOOL)},${text(slug)},${text(locale)},${text(title)},${text(summary)},${text(JSON.stringify(body))},${text(JSON.stringify(accessibility))},1,'published',${text(ACTOR)},${text(ACTOR)},${text(at)},${text(at)},${text(at)}) ON CONFLICT(school_id,slug,locale) DO UPDATE SET title=excluded.title,summary=excluded.summary,body_json=excluded.body_json,accessibility_json=excluded.accessibility_json,offline_eligible=1,status='published',updated_by=excluded.updated_by,published_at=excluded.published_at,updated_at=excluded.updated_at`;
  }));
  const audit=`INSERT INTO school_audit_log(id,school_id,actor_brasa_id,action,resource_type,resource_id,snapshot_json,occurred_at) VALUES (${text(randomUUID())},${text(SCHOOL)},${text(ACTOR)},'publish','staging_catalog',${text(SCHOOL)},${text(JSON.stringify({lessonIds:LESSON_IDS,demonstration:true}))},${text(at)})`;
  return [school,...lessons,audit].join('; ');
}
export function cleanupSql(){const ids=LESSON_IDS.map(text).join(',');return `DELETE FROM school_audit_log WHERE school_id=${text(SCHOOL)}; DELETE FROM school_lessons WHERE id IN (${ids}); DELETE FROM school_tenants WHERE id=${text(SCHOOL)}`;}
function execute(command){const output=execFileSync(process.execPath,[wrangler,'d1','execute',DATABASE,'--remote','--json','--command',command],{encoding:'utf8'}),parsed=JSON.parse(output);if(!Array.isArray(parsed)||parsed.some(item=>item.success===false))throw new Error('Cloudflare rejected the staging seed.');return parsed;}
export function run(command,executeSql=execute,now=new Date()){if(command==='apply'){executeSql(seedSql(now));return{status:'seeded',environment:'staging',schoolId:SCHOOL,lessons:LESSON_IDS.length}}if(command==='cleanup'){executeSql(cleanupSql());return{status:'cleaned',environment:'staging',schoolId:SCHOOL,lessons:LESSON_IDS.length}}throw new Error('Use apply or cleanup. This tool targets staging only.');}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{process.stdout.write(`${JSON.stringify(run(process.argv[2]),null,2)}\n`)}catch(error){process.stderr.write(`Open lesson seed failed: ${error.message}\n`);process.exitCode=1}}
