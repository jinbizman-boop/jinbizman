import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch, humanizeKey, toArray } from "../lib/api";
import { adminModules } from "../content/admin";
import { AdminPageHeader } from "./components/AdminPageHeader";
import { DataTable } from "./components/DataTable";
import { MetricCard } from "./components/MetricCard";
import { StatePanel } from "./components/StatePanel";
import { WorkflowPanel, type WorkflowStatus } from "./components/WorkflowPanel";
import { RevisionDiff } from "./components/RevisionDiff";
import { StatusBadge } from "../public/components/StatusBadge";

function today() { return new Date().toISOString().slice(0, 10); }
function asRecord(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function inputNumber(form: FormData, key: string): number | undefined { const v = String(form.get(key) ?? "").trim(); return v ? Number(v) : undefined; }

export function DashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [ops, setOps] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { Promise.all([apiFetch("/api/admin/dashboard"), apiFetch("/api/admin/operations-summary")]).then(([a,b]) => { setData(asRecord(a)); setOps(asRecord(b)); }).catch(e => setError(e instanceof Error ? e.message : String(e))); }, []);
  if (error) return <StatePanel kind="error" title="대시보드를 불러오지 못했습니다" description={error} />;
  if (!data) return <StatePanel kind="loading" title="운영 데이터를 불러오는 중입니다" />;
  const metrics = [
    ["active_projects","진행 프로젝트"],["open_tasks","열린 WBS"],["pending_approvals","승인 대기"],["open_inquiries","처리 문의"],["active_users","활성 사용자"]
  ] as const;
  const queue = [
    { label: "승인 대기", value: String(data.pending_approvals ?? 0), detail: "게시·예산·프로젝트·평가 승인" },
    { label: "열린 WBS", value: String(data.open_tasks ?? 0), detail: "진행·검수·지연·블로커 포함" },
    { label: "처리 문의", value: String(data.open_inquiries ?? 0), detail: "신규 문의부터 리드 전환 전 상태" },
  ];
  return <div className="admin-page dashboard-command-page">
    <section className="command-hero">
      <div className="command-hero-copy"><span className="eyebrow light">CONTROL CENTER / LIVE DATA</span><h1>오늘의 운영 상태를<br/>한 화면에서 결정합니다.</h1><p>샘플 수치가 아니라 Worker/Neon의 실제 운영 데이터만 표시합니다. 데이터가 없으면 빈 상태로 남고, 연결되지 않은 기능은 성공한 것처럼 표현하지 않습니다.</p></div>
      <div className="command-hero-meta"><span>SYSTEM DATE</span><strong>{today()}</strong><small>JINBIZ OPERATIONS ERP</small></div>
      <div className="command-metrics">{metrics.map(([key,label],index) => <MetricCard key={key} label={`${String(index+1).padStart(2,"0")} · ${label}`} value={String(data[key] ?? 0)} />)}</div>
    </section>

    <div className="command-grid">
      <section className="admin-panel decision-queue"><div className="panel-heading"><div><span className="eyebrow">DECISION QUEUE</span><h2>지금 확인할 운영 신호</h2></div><small>Priority first</small></div><div className="decision-list">{queue.map((item,index)=><article key={item.label}><span>{String(index+1).padStart(2,"0")}</span><div><small>{item.label}</small><strong>{item.value}</strong><p>{item.detail}</p></div></article>)}</div></section>
      <section className="admin-panel operations-radar"><div className="panel-heading"><div><span className="eyebrow">OPERATIONS RADAR</span><h2>운영 모듈 요약</h2></div><small>Worker / Neon</small></div><DataTable rows={toArray(ops)} caption="운영 모듈 요약" /></section>
    </div>
  </div>;
}

export function ModulePage({ moduleKey }: { moduleKey: string }) {
  const module = adminModules.find(x => x.key === moduleKey);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [state, setState] = useState<"loading"|"ready"|"error">("loading");
  const [error, setError] = useState("");
  const endpoint = module?.endpoint;
  useEffect(() => {
    if (!endpoint) { setState("ready"); return; }
    apiFetch(endpoint).then(data => { const arr = toArray(data); setRows(arr); if (!arr.length && data && typeof data === "object" && !Array.isArray(data)) setDetail(asRecord(data)); setState("ready"); }).catch(e => { setError(e instanceof Error ? e.message : String(e)); setState("error"); });
  }, [endpoint]);
  if (!module) return <StatePanel kind="error" title="알 수 없는 운영 모듈" />;
  return <div className="admin-page"><AdminPageHeader eyebrow={module.group.toUpperCase()} title={module.label} description={module.description} />
    {state === "loading" && <StatePanel kind="loading" title="실제 운영 데이터를 불러오는 중입니다" />}
    {state === "error" && <StatePanel kind="error" title="데이터를 불러오지 못했습니다" description={error} />}
    {state === "ready" && rows.length > 0 && <section className="admin-panel"><DataTable rows={rows} /></section>}
    {state === "ready" && !rows.length && detail && <section className="admin-panel detail-grid">{Object.entries(detail).map(([k,v]) => <div className="detail-item" key={k}><span>{humanizeKey(k)}</span><strong>{typeof v === "object" ? JSON.stringify(v) : String(v ?? "-")}</strong></div>)}</section>}
    {state === "ready" && !rows.length && !detail && <StatePanel kind="empty" title="등록된 데이터가 없습니다" description="표시할 실제 운영 데이터가 생기면 이 화면에 나타납니다." />}
  </div>;
}

export function ProjectWbsPage() {
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]); const [projectId, setProjectId] = useState(0); const [tasks,setTasks] = useState<Array<Record<string, unknown>>>([]); const [notice,setNotice] = useState("");
  const refresh = async () => { const p=toArray(await apiFetch("/api/admin/projects")); setProjects(p); if (!projectId && p[0]?.id) setProjectId(Number(p[0].id)); };
  useEffect(()=>{ refresh().catch(e=>setNotice(String(e))); },[]);
  useEffect(()=>{ if(projectId) apiFetch(`/api/admin/wbs?projectId=${projectId}`).then(d=>setTasks(toArray(d))).catch(e=>setNotice(String(e))); },[projectId]);
  const grouped = useMemo(()=>["todo","in_progress","review","approval_wait","done","delayed","blocked"].map(status=>({status,items:tasks.filter(t=>String(t.status)===status)})),[tasks]);
  async function createProject(e:FormEvent<HTMLFormElement>){e.preventDefault(); const f=new FormData(e.currentTarget); try{await apiFetch("/api/erp/projects",{method:"POST",body:JSON.stringify({code:String(f.get("code")),name:String(f.get("name")),projectType:String(f.get("projectType")||"internal"),description:String(f.get("description")||"")})}); setNotice("프로젝트가 저장되었습니다."); e.currentTarget.reset(); await refresh();}catch(err){setNotice(err instanceof Error?err.message:String(err));}}
  async function createTask(e:FormEvent<HTMLFormElement>){e.preventDefault(); if(!projectId)return; const f=new FormData(e.currentTarget); try{await apiFetch("/api/erp/wbs",{method:"POST",body:JSON.stringify({projectId,title:String(f.get("title")),priority:String(f.get("priority")||"medium"),requiresApproval:f.get("requiresApproval") === "on"})}); setNotice("WBS 업무가 저장되었습니다."); e.currentTarget.reset(); setTasks(toArray(await apiFetch(`/api/admin/wbs?projectId=${projectId}`)));}catch(err){setNotice(err instanceof Error?err.message:String(err));}}
  async function moveTask(id:number,status:string){try{await apiFetch(`/api/erp/wbs/${id}`,{method:"PATCH",body:JSON.stringify({status})});setTasks(toArray(await apiFetch(`/api/admin/wbs?projectId=${projectId}`)));}catch(err){setNotice(err instanceof Error?err.message:String(err));}}
  return <div className="admin-page"><AdminPageHeader eyebrow="PROJECT OPERATIONS" title="프로젝트 · WBS" description="프로젝트 계획부터 구조화된 업무, 승인 전제, 진척률까지 하나의 실행 흐름으로 관리합니다." />
    {notice && <div className="notice-line" role="status">{notice}</div>}
    <div className="admin-split"><form className="admin-form admin-panel" onSubmit={createProject}><h2>프로젝트 생성</h2><label>코드<input name="code" required /></label><label>프로젝트명<input name="name" required /></label><label>유형<input name="projectType" defaultValue="internal" required /></label><label>설명<textarea name="description" rows={3}/></label><button className="button primary">프로젝트 저장</button></form>
      <form className="admin-form admin-panel" onSubmit={createTask}><h2>WBS 업무 생성</h2><label>프로젝트<select value={projectId} onChange={e=>setProjectId(Number(e.target.value))}>{projects.map(p=><option value={String(p.id)} key={String(p.id)}>{String(p.name)}</option>)}</select></label><label>업무명<input name="title" required/></label><label>우선순위<select name="priority"><option>high</option><option>medium</option><option>low</option></select></label><label className="check-line"><input type="checkbox" name="requiresApproval"/> 완료 전 승인 필요</label><button className="button primary">WBS 저장</button></form></div>
    <div className="kanban-grid">{grouped.map(g=><section className="kanban-lane" key={g.status}><div className="lane-title"><StatusBadge value={g.status}/><span>{g.items.length}</span></div>{g.items.map(t=><article className="task-card" key={String(t.id)}><strong>{String(t.title)}</strong><small>진척 {String(t.progress_percent ?? 0)}%</small><select value={String(t.status)} onChange={e=>moveTask(Number(t.id),e.target.value)}>{grouped.map(x=><option key={x.status}>{x.status}</option>)}</select></article>)}</section>)}</div>
  </div>;
}

export function DailyWorkPage(){
  const [projects,setProjects]=useState<Array<Record<string,unknown>>>([]),[tasks,setTasks]=useState<Array<Record<string,unknown>>>([]); const [projectId,setProjectId]=useState(0); const [taskId,setTaskId]=useState(0); const [notice,setNotice]=useState("");
  useEffect(()=>{apiFetch("/api/admin/projects").then(d=>{const p=toArray(d);setProjects(p);if(p[0])setProjectId(Number(p[0].id));}).catch(e=>setNotice(String(e)));},[]);
  useEffect(()=>{if(projectId)apiFetch(`/api/admin/wbs?projectId=${projectId}`).then(d=>{const t=toArray(d);setTasks(t);if(t[0])setTaskId(Number(t[0].id));});},[projectId]);
  async function submitReport(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);try{await apiFetch("/api/erp/daily-reports",{method:"POST",body:JSON.stringify({reportDate:today(),projectId,todayFocus:String(f.get("todayFocus")||""),topPriorityText:String(f.get("topPriority")||""),items:[{wbsTaskId:taskId,goalText:String(f.get("goal")),expectedHours:Number(f.get("hours")||0)}]})});setNotice("아침 업무보고가 실제 WBS에 연결되어 제출되었습니다.");}catch(err){setNotice(err instanceof Error?err.message:String(err));}}
  async function submitLog(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const progress=Number(f.get("progress")||0),done=f.get("done")==="on";try{await apiFetch("/api/erp/daily-logs",{method:"POST",body:JSON.stringify({logDate:today(),projectId,dailySummary:String(f.get("summary")||""),items:[{wbsTaskId:taskId,workSummary:String(f.get("work")),actualProgress:done?100:progress,isCompleted:done,delayReasonCode:done?"":String(f.get("delay")||"pending"),nextAction:done?"완료":String(f.get("next")||"후속 작업")}]})});setNotice("퇴근 업무일지가 WBS 진척률에 반영되었습니다.");}catch(err){setNotice(err instanceof Error?err.message:String(err));}}
  const selector=<><label>프로젝트<select value={projectId} onChange={e=>setProjectId(Number(e.target.value))}>{projects.map(p=><option key={String(p.id)} value={String(p.id)}>{String(p.name)}</option>)}</select></label><label>WBS<select value={taskId} onChange={e=>setTaskId(Number(e.target.value))}>{tasks.map(t=><option key={String(t.id)} value={String(t.id)}>{String(t.title)}</option>)}</select></label></>;
  return <div className="admin-page"><AdminPageHeader eyebrow="DAILY EXECUTION" title="업무보고 · 업무일지" description="자유 텍스트가 아니라 WBS를 기준으로 계획과 실제를 연결합니다." />{notice&&<div className="notice-line">{notice}</div>}<div className="admin-split"><form className="admin-panel admin-form" onSubmit={submitReport}><h2>아침 업무보고</h2>{selector}<label>오늘의 초점<input name="todayFocus"/></label><label>최우선 과업<input name="topPriority"/></label><label>오늘 목표<textarea name="goal" required/></label><label>예상 시간<input name="hours" type="number" min="0" max="24" step="0.5" defaultValue="1"/></label><button className="button primary">업무보고 제출</button></form><form className="admin-panel admin-form" onSubmit={submitLog}><h2>퇴근 업무일지</h2>{selector}<label>총평<input name="summary"/></label><label>실제 수행<textarea name="work" required/></label><label>진척률<input name="progress" type="number" min="0" max="100" defaultValue="50"/></label><label className="check-line"><input type="checkbox" name="done"/> 완료</label><label>지연 사유<input name="delay"/></label><label>다음 액션<input name="next"/></label><button className="button primary">업무일지 제출</button></form></div></div>;
}

export function ApprovalPage(){
  const [rows,setRows]=useState<Array<Record<string,unknown>>>([]),[users,setUsers]=useState<Array<Record<string,unknown>>>([]);const [notice,setNotice]=useState("");
  const refresh=async()=>setRows(toArray(await apiFetch("/api/admin/approvals")));
  useEffect(()=>{refresh().catch(e=>setNotice(String(e)));apiFetch("/api/admin/users").then(d=>setUsers(toArray(d))).catch(()=>{});},[]);
  async function create(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);try{await apiFetch("/api/erp/approvals",{method:"POST",body:JSON.stringify({documentType:String(f.get("type")||"general"),title:String(f.get("title")),approverUserIds:[Number(f.get("approver"))],status:"submitted",payload:{summary:String(f.get("summary")||"")}})});setNotice("결재가 상신되었습니다.");e.currentTarget.reset();await refresh();}catch(err){setNotice(err instanceof Error?err.message:String(err));}}
  async function act(id:number,actionType:string){try{await apiFetch(`/api/erp/approvals/${id}/actions`,{method:"POST",body:JSON.stringify({actionType,comment:"React ERP에서 처리"})});setNotice(`결재 ${actionType} 처리가 기록되었습니다.`);await refresh();}catch(err){setNotice(err instanceof Error?err.message:String(err));}}
  return <div className="admin-page"><AdminPageHeader eyebrow="GOVERNANCE" title="전자결재" description="프로젝트·WBS·게시·예산·휴가·평가를 같은 승인 원칙으로 통제합니다." />{notice&&<div className="notice-line">{notice}</div>}<div className="admin-split"><form className="admin-panel admin-form" onSubmit={create}><h2>새 결재 상신</h2><label>문서 유형<input name="type" defaultValue="general" required/></label><label>제목<input name="title" required/></label><label>승인자<select name="approver" required>{users.map(u=><option key={String(u.id)} value={String(u.id)}>{String(u.name)} · {String(u.department_name||"")}</option>)}</select></label><label>요약<textarea name="summary"/></label><button className="button primary">상신</button></form><section className="admin-panel"><h2>최근 결재</h2><div className="approval-list">{rows.map(r=><article className="approval-row" key={String(r.id)}><div><StatusBadge value={String(r.status)}/><strong>{String(r.title)}</strong><small>{String(r.document_type)}</small></div><div className="approval-actions"><button onClick={()=>act(Number(r.id),"approve")}>승인</button><button onClick={()=>act(Number(r.id),"request_changes")}>보완</button><button onClick={()=>act(Number(r.id),"reject")}>반려</button></div></article>)}</div></section></div></div>;
}

export function EvaluationPage(){
  const [cycles,setCycles]=useState<Array<Record<string,unknown>>>([]),[users,setUsers]=useState<Array<Record<string,unknown>>>([]),[items,setItems]=useState<Array<Record<string,unknown>>>([]),[evidence,setEvidence]=useState<Array<Record<string,unknown>>>([]);const [cycleId,setCycleId]=useState(0),[userId,setUserId]=useState(0),[notice,setNotice]=useState("");
  useEffect(()=>{apiFetch("/api/admin/evaluations").then(d=>{const a=toArray(d);setCycles(a);if(a[0])setCycleId(Number(a[0].id));});apiFetch("/api/admin/users").then(d=>{const a=toArray(d);setUsers(a);if(a[0])setUserId(Number(a[0].id));});},[]);
  useEffect(()=>{if(cycleId)apiFetch(`/api/admin/evaluations/items?cycleId=${cycleId}`).then(d=>setItems(toArray(d))).catch(()=>setItems([]));},[cycleId]);
  useEffect(()=>{if(cycleId&&userId)apiFetch(`/api/erp/evaluations/evidences?cycleId=${cycleId}&userId=${userId}`).then(d=>setEvidence(toArray(asRecord(d).items))).catch(()=>setEvidence([]));},[cycleId,userId]);
  async function score(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);try{await apiFetch("/api/erp/evaluations/scores",{method:"POST",body:JSON.stringify({cycleId,evaluateeUserId:userId,evaluationItemId:Number(f.get("item")),score:Number(f.get("score")),comment:String(f.get("comment")||"")})});setNotice("평가 근거를 기반으로 점수가 저장되었습니다.");}catch(err){setNotice(err instanceof Error?err.message:String(err));}}
  async function finalize(){try{await apiFetch(`/api/erp/evaluations/cycles/${cycleId}/finalize`,{method:"POST",body:"{}"});setNotice("평가 주기가 확정되었습니다.");}catch(err){setNotice(err instanceof Error?err.message:String(err));}}
  return <div className="admin-page"><AdminPageHeader eyebrow="EVIDENCE FIRST" title="인사평가" description="점수보다 먼저 WBS·산출물·승인·협업의 근거를 확인합니다." />{notice&&<div className="notice-line">{notice}</div>}<div className="filter-row"><select value={cycleId} onChange={e=>setCycleId(Number(e.target.value))}>{cycles.map(c=><option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}</select><select value={userId} onChange={e=>setUserId(Number(e.target.value))}>{users.map(u=><option key={String(u.id)} value={String(u.id)}>{String(u.name)}</option>)}</select></div><section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">EVIDENCE</span><h2>평가 근거 {evidence.length}건</h2></div></div>{evidence.length?<DataTable rows={evidence}/>:<StatePanel kind="empty" title="평가 근거가 없습니다" description="근거가 없으면 점수 저장과 평가 확정이 서버에서 차단됩니다."/>}</section><div className="admin-split"><form className="admin-panel admin-form" onSubmit={score}><h2>점수 입력</h2><label>평가 항목<select name="item" required>{items.map(i=><option key={String(i.id)} value={String(i.id)}>{String(i.name)}</option>)}</select></label><label>점수<input name="score" type="number" min="0" max="100" required/></label><label>코멘트<textarea name="comment"/></label><button className="button primary" disabled={!evidence.length}>점수 저장</button></form><section className="admin-panel finalize-card"><h2>평가 확정</h2><p>근거와 점수가 모두 존재해야 서버에서 확정됩니다.</p><button className="button primary" onClick={finalize} disabled={!cycleId||!evidence.length}>평가 주기 확정</button></section></div></div>;
}

export function SiteContentPage(){
  const [services,setServices]=useState<Array<Record<string,unknown>>>([]),[rows,setRows]=useState<Array<Record<string,unknown>>>([]);const [serviceId,setServiceId]=useState(0),[selectedId,setSelectedId]=useState(0),[notice,setNotice]=useState("");
  async function refresh(){if(!serviceId)return;const next=toArray(await apiFetch(`/api/admin/contents?serviceId=${serviceId}`));setRows(next);if(next.length&&!next.some(r=>Number(r.id)===selectedId))setSelectedId(Number(next[0].id));}
  useEffect(()=>{apiFetch("/api/admin/services").then(d=>{const a=toArray(d);setServices(a);if(a[0])setServiceId(Number(a[0].id));});},[]);
  useEffect(()=>{refresh().catch(e=>setNotice(String(e)));},[serviceId]);
  const selected=rows.find(r=>Number(r.id)===selectedId);
  async function transition(status:WorkflowStatus){if(!selected)return;await apiFetch(`/api/admin/contents/${selectedId}`,{method:"PATCH",body:JSON.stringify({status})});setNotice(`콘텐츠 상태가 ${status}(으)로 변경되었습니다.`);await refresh();}
  return <div className="admin-page"><AdminPageHeader eyebrow="CONTENT OPERATIONS" title="홈페이지 운영" description="서비스 단위 콘텐츠 모델, 번역, 발행 상태와 SEO를 실제 데이터로 관리합니다." />{notice&&<div className="notice-line" role="status">{notice}</div>}<div className="filter-row"><label>서비스<select value={serviceId} onChange={e=>setServiceId(Number(e.target.value))}>{services.map(s=><option key={String(s.id)} value={String(s.id)}>{String(s.service_name)}</option>)}</select></label>{rows.length?<label>콘텐츠<select value={selectedId} onChange={e=>setSelectedId(Number(e.target.value))}>{rows.map(r=><option key={String(r.id)} value={String(r.id)}>{String(r.title||r.slug||r.id)}</option>)}</select></label>:null}</div>{rows.length?<><section className="admin-panel"><DataTable rows={rows} caption="홈페이지 콘텐츠 목록"/></section>{selected?<div className="admin-split"><WorkflowPanel key={`${selectedId}-${String(selected.status)}`} initialStatus={(String(selected.status||"draft") as WorkflowStatus)} onTransition={transition}/><RevisionDiff before={JSON.stringify({title:selected.title,slug:selected.slug,status:selected.status},null,2)} after={JSON.stringify({title:selected.title,slug:selected.slug,status:selected.status,review:"ERP workflow-controlled"},null,2)}/></div>:null}</>:<StatePanel kind="empty" title="등록된 콘텐츠가 없습니다" description="정적 샘플을 만들지 않고 실제 CMS 데이터가 생길 때까지 빈 상태를 유지합니다."/>}</div>;
}

export function MediaPage(){
  const [notice,setNotice]=useState("");
  async function upload(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);try{const response=await fetch("/api/admin/media",{method:"POST",credentials:"include",body:f});const json=await response.json() as {success:boolean;data?:unknown;error?:{message?:string}};if(!response.ok||!json.success)throw new Error(json.error?.message||"업로드 실패");setNotice("R2와 attachments DB에 파일이 저장되었습니다.");}catch(err){setNotice(err instanceof Error?err.message:String(err));}}
  return <div className="admin-page"><AdminPageHeader eyebrow="R2 MEDIA" title="미디어 라이브러리" description="R2 바인딩이 없으면 성공한 척하지 않고 서버가 명확히 실패합니다." />{notice&&<div className="notice-line">{notice}</div>}<form className="admin-panel admin-form narrow-form" onSubmit={upload}><label>파일<input type="file" name="file" accept="image/*,.pdf" required/></label><label>서비스 ID<input name="serviceId" type="number" min="1"/></label><label>설명<input name="altText"/></label><button className="button primary">실제 파일 업로드</button></form></div>;
}
