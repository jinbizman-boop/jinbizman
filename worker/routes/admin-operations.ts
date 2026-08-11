import type { AuthUser, Env } from "../types";
import { getAuthUser, hasPermission } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";
import { getSql } from "../lib/db";
import { fail, ok } from "../lib/response";
import { readJson, text } from "../lib/validation";

async function requirePermission(request: Request, env: Env, permission: string): Promise<AuthUser | Response> {
  const user = await getAuthUser(request, env);
  if (!user) return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  if (!hasPermission(user, permission)) return fail("FORBIDDEN", "이 작업을 수행할 권한이 없습니다.", 403);
  return user;
}
const int = (v: unknown): number | null => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : null; };
const bool = (v: unknown, d = true) => typeof v === "boolean" ? v : d;

export async function departmentCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "system.update"); if (auth instanceof Response) return auth;
  const b = await readJson(request); const code = text(b?.code, 80, true); const name = text(b?.name, 160, true); const parentId = int(b?.parentId);
  if (!code || !name) return fail("VALIDATION_ERROR", "부서 코드와 이름이 필요합니다.", 422);
  const sql = getSql(env); const rows = await sql`INSERT INTO departments(code,name,parent_id,sort_order,is_active) VALUES(${code},${name},${parentId},${Number(b?.sortOrder)||0},${bool(b?.isActive)}) RETURNING *`;
  await writeAuditLog(request, env, auth, { actionType:"department.create", targetType:"department", targetId:Number(rows[0].id), after:rows[0], statusCode:201 }); return ok(rows[0],{status:201});
}

export async function roleCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "system.update"); if (auth instanceof Response) return auth;
  const b = await readJson(request); const code = text(b?.code, 80, true); const name = text(b?.name, 160, true); if (!code || !name) return fail("VALIDATION_ERROR","역할 코드와 이름이 필요합니다.",422);
  const sql=getSql(env); const rows=await sql`INSERT INTO roles(code,name,description,is_system) VALUES(${code},${name},${text(b?.description,1000)??""},FALSE) RETURNING *`;
  await writeAuditLog(request,env,auth,{actionType:"role.create",targetType:"role",targetId:Number(rows[0].id),after:rows[0],statusCode:201}); return ok(rows[0],{status:201});
}

export async function codeGroupsRoute(request: Request, env: Env): Promise<Response> {
  const auth=await requirePermission(request,env,request.method==="GET"?"system.read":"system.update"); if(auth instanceof Response)return auth; const sql=getSql(env);
  if(request.method==="GET"){ const rows=await sql`SELECT g.*, count(c.id)::int AS code_count FROM common_code_groups g LEFT JOIN common_codes c ON c.group_id=g.id GROUP BY g.id ORDER BY g.name`; return ok({items:rows}); }
  const b=await readJson(request); const code=text(b?.groupCode,100,true); const name=text(b?.name,160,true); if(!code||!name)return fail("VALIDATION_ERROR","코드 그룹 코드와 이름이 필요합니다.",422);
  const rows=await sql`INSERT INTO common_code_groups(group_code,name,description,created_by) VALUES(${code},${name},${text(b?.description,1000)??""},${auth.id}) RETURNING *`; return ok(rows[0],{status:201});
}

export async function commonCodeCreateRoute(request: Request, env: Env, groupId:number): Promise<Response> {
  const auth=await requirePermission(request,env,"system.update"); if(auth instanceof Response)return auth; const b=await readJson(request); const code=text(b?.code,100,true); const label=text(b?.label,160,true); if(!code||!label)return fail("VALIDATION_ERROR","코드와 라벨이 필요합니다.",422);
  const sql=getSql(env); const rows=await sql`INSERT INTO common_codes(group_id,code,label,sort_order,is_active) VALUES(${groupId},${code},${label},${Number(b?.sortOrder)||0},${bool(b?.isActive)}) RETURNING *`; return ok(rows[0],{status:201});
}

export async function approvalTemplatesRoute(request: Request, env: Env): Promise<Response> {
  const auth=await requirePermission(request,env,request.method==="GET"?"approval.read":"approval.create"); if(auth instanceof Response)return auth; const sql=getSql(env);
  if(request.method==="GET"){ const rows=await sql`SELECT t.*, count(s.id)::int AS step_count FROM approval_templates t LEFT JOIN approval_template_steps s ON s.template_id=t.id GROUP BY t.id ORDER BY t.name`; return ok({items:rows}); }
  const b=await readJson(request); const code=text(b?.templateCode,100,true); const name=text(b?.name,160,true); const doc=text(b?.documentType,100,true); if(!code||!name||!doc)return fail("VALIDATION_ERROR","서식 코드, 이름, 문서유형이 필요합니다.",422);
  const rows=await sql`INSERT INTO approval_templates(template_code,name,document_type,description,requires_project,created_by) VALUES(${code},${name},${doc},${text(b?.description,1000)??""},${bool(b?.requiresProject,false)},${auth.id}) RETURNING *`; return ok(rows[0],{status:201});
}

export async function approvalTemplateStepCreateRoute(request: Request, env: Env, templateId:number): Promise<Response> {
  const auth=await requirePermission(request,env,"approval.create"); if(auth instanceof Response)return auth; const b=await readJson(request); const stepOrder=Number(b?.stepOrder); const role=text(b?.approverRoleCode,100); const userId=int(b?.approverUserId); if(!Number.isInteger(stepOrder)||stepOrder<1||(!role&&!userId))return fail("VALIDATION_ERROR","결재 순서와 승인자 역할 또는 사용자가 필요합니다.",422);
  const sql=getSql(env); const rows=await sql`INSERT INTO approval_template_steps(template_id,step_order,approver_role_code,approver_user_id,is_required) VALUES(${templateId},${stepOrder},${role},${userId},${bool(b?.isRequired)}) RETURNING *`; return ok(rows[0],{status:201});
}

export async function projectIssueCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth=await requirePermission(request,env,"project.update"); if(auth instanceof Response)return auth; const b=await readJson(request); const projectId=int(b?.projectId); const title=text(b?.title,255,true); if(!projectId||!title)return fail("VALIDATION_ERROR","프로젝트와 이슈 제목이 필요합니다.",422);
  const sql=getSql(env); const rows=await sql`INSERT INTO project_issues(project_id,wbs_task_id,issue_type,title,description,priority,status,assignee_user_id,reporter_user_id) VALUES(${projectId},${int(b?.wbsTaskId)},${text(b?.issueType,60)??"risk"},${title},${text(b?.description,4000)??""},${text(b?.priority,30)??"medium"},'open',${int(b?.assigneeUserId)},${auth.id}) RETURNING *`; return ok(rows[0],{status:201});
}

export async function projectMeetingCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth=await requirePermission(request,env,"project.update"); if(auth instanceof Response)return auth; const b=await readJson(request); const projectId=int(b?.projectId); const title=text(b?.title,255,true); const at=text(b?.meetingAt,80,true); if(!projectId||!title||!at)return fail("VALIDATION_ERROR","프로젝트, 회의명, 일시가 필요합니다.",422);
  const sql=getSql(env); const rows=await sql`INSERT INTO project_meetings(project_id,title,meeting_at,location,meeting_url,minutes,created_by) VALUES(${projectId},${title},${at}::timestamptz,${text(b?.location,255)??""},${text(b?.meetingUrl,1000)??""},${text(b?.minutes,10000)??""},${auth.id}) RETURNING *`; return ok(rows[0],{status:201});
}

export async function serviceDeploymentsRoute(request: Request, env: Env): Promise<Response> {
  const auth=await requirePermission(request,env,request.method==="GET"?"service.read":"service.update"); if(auth instanceof Response)return auth; const sql=getSql(env); const url=new URL(request.url); const serviceId=int(url.searchParams.get("serviceId"));
  if(request.method==="GET"){ const rows=serviceId?await sql`SELECT * FROM service_deployments WHERE service_id=${serviceId} ORDER BY requested_at DESC LIMIT 100`:await sql`SELECT * FROM service_deployments ORDER BY requested_at DESC LIMIT 100`; return ok({items:rows}); }
  const b=await readJson(request); const sid=int(b?.serviceId); const version=text(b?.versionLabel,120,true); if(!sid||!version)return fail("VALIDATION_ERROR","서비스와 버전 라벨이 필요합니다.",422);
  const rows=await sql`INSERT INTO service_deployments(service_id,environment,version_label,status,source_ref,notes,requested_by) VALUES(${sid},${text(b?.environment,30)??"production"},${version},'requested',${text(b?.sourceRef,500)??""},${text(b?.notes,2000)??""},${auth.id}) RETURNING *`; return ok(rows[0],{status:201});
}

export async function serviceDomainCreateRoute(request: Request, env: Env, serviceId:number): Promise<Response> {
  const auth=await requirePermission(request,env,"service.update"); if(auth instanceof Response)return auth; const b=await readJson(request); const domain=text(b?.domain,255,true); const locale=text(b?.locale,10)??"ko"; if(!domain)return fail("VALIDATION_ERROR","도메인이 필요합니다.",422);
  const sql=getSql(env); const rows=await sql`INSERT INTO service_domains(service_id,domain,locale,is_canonical) VALUES(${serviceId},${domain},${locale},${bool(b?.isCanonical,false)}) ON CONFLICT(service_id,locale) DO UPDATE SET domain=EXCLUDED.domain,is_canonical=EXCLUDED.is_canonical,updated_at=now() RETURNING *`; return ok(rows[0]);
}

export async function siteBannersRoute(request: Request, env: Env): Promise<Response> {
  const auth=await requirePermission(request,env,request.method==="GET"?"content.read":"content.update"); if(auth instanceof Response)return auth; const sql=getSql(env); if(request.method==="GET")return ok({items:await sql`SELECT * FROM site_banners ORDER BY created_at DESC LIMIT 200`});
  const b=await readJson(request); const sid=int(b?.serviceId); const code=text(b?.bannerCode,100,true); const title=text(b?.title,255,true); if(!sid||!code||!title)return fail("VALIDATION_ERROR","서비스, 배너 코드, 제목이 필요합니다.",422); const rows=await sql`INSERT INTO site_banners(service_id,banner_code,locale,title,body,link_url,placement,created_by) VALUES(${sid},${code},${text(b?.locale,10)??"ko"},${title},${text(b?.body,3000)??""},${text(b?.linkUrl,1000)??""},${text(b?.placement,80)??"global"},${auth.id}) RETURNING *`; return ok(rows[0],{status:201});
}

export async function siteNavigationRoute(request: Request, env: Env): Promise<Response> {
  const auth=await requirePermission(request,env,request.method==="GET"?"content.read":"content.update"); if(auth instanceof Response)return auth; const sql=getSql(env); if(request.method==="GET")return ok({items:await sql`SELECT * FROM site_navigation_items ORDER BY service_id,locale,sort_order,id`});
  const b=await readJson(request); const sid=int(b?.serviceId); const label=text(b?.label,160,true); const href=text(b?.href,1000,true); if(!sid||!label||!href)return fail("VALIDATION_ERROR","서비스, 메뉴명, 링크가 필요합니다.",422); const rows=await sql`INSERT INTO site_navigation_items(service_id,locale,parent_id,label,href,sort_order) VALUES(${sid},${text(b?.locale,10)??"ko"},${int(b?.parentId)},${label},${href},${Number(b?.sortOrder)||0}) RETURNING *`; return ok(rows[0],{status:201});
}

export async function knowledgeTemplatesRoute(request: Request, env: Env): Promise<Response> {
  const auth=await requirePermission(request,env,request.method==="GET"?"system.read":"system.update"); if(auth instanceof Response)return auth; const sql=getSql(env); if(request.method==="GET")return ok({items:await sql`SELECT * FROM knowledge_templates ORDER BY name`});
  const b=await readJson(request); const code=text(b?.code,100,true); const name=text(b?.name,160,true); if(!code||!name)return fail("VALIDATION_ERROR","서식 코드와 이름이 필요합니다.",422); const rows=await sql`INSERT INTO knowledge_templates(code,name,category,description,template_body,created_by) VALUES(${code},${name},${text(b?.category,80)??"general"},${text(b?.description,1000)??""},${text(b?.templateBody,20000)??""},${auth.id}) RETURNING *`; return ok(rows[0],{status:201});
}
